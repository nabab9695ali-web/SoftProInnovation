import { useState, useMemo, useEffect } from 'react'
import Header from '../../components/Header'
import Footer from '../../components/Footer'
import { Link, useSearchParams, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { useCart } from '../../context/CartContext'
import QuickViewModal from '../../components/QuickViewModal'
import { API_BASE_URL } from '../../config/api'
import { formatImg } from '../../utils/imageUrl'

const Product = () => {
  const navigate = useNavigate()
  const { addToCart, buyNow, toggleWishlist, isInWishlist } = useCart()
  const [searchParams] = useSearchParams()
  const categoryFromUrl = searchParams.get('category')
  const searchFromUrl = searchParams.get('search') || searchParams.get('q') || ''
  const [selectedCategory, setSelectedCategory] = useState(categoryFromUrl || 'All')
  const [prevCategoryFromUrl, setPrevCategoryFromUrl] = useState(categoryFromUrl)
  if (categoryFromUrl !== prevCategoryFromUrl) {
    setPrevCategoryFromUrl(categoryFromUrl)
    setSelectedCategory(categoryFromUrl || 'All')
  }

  const [searchTerm, setSearchTerm] = useState(searchFromUrl)
  useEffect(() => {
    setSearchTerm(searchFromUrl)
  }, [searchFromUrl])

  const [priceFilter, setPriceFilter] = useState('all')
  const [inStockOnly, setInStockOnly] = useState(false)

  const [categoryList, setCategoryList] = useState(['All'])
  const [allProductsList, setallProductsList] = useState([])
  const [sortBy, setSortBy] = useState('Featured')
  const [quickViewProduct, setQuickViewProduct] = useState(null)
  const [cardImgMap, setCardImgMap] = useState({})

  const getProductImageList = (item) => {
    if (!item) return []
    const all = []
    if (item.thumbnail) all.push(formatImg(item.thumbnail))
    if (Array.isArray(item.images)) {
      item.images.forEach((img) => {
        const formatted = formatImg(img)
        if (formatted && !all.includes(formatted)) {
          all.push(formatted)
        }
      })
    }
    return all.length > 0 ? all : ['https://placehold.co/400x400?text=No+Image']
  }

  const openQuickView = (product) => {
    const prodId = product._id || product.id
    if (prodId) {
      navigate(`/product/${prodId}`)
    }
  }

  const closeQuickView = () => {
    setQuickViewProduct(null)
  }

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') closeQuickView()
    }
    if (quickViewProduct) {
      document.body.style.overflow = 'hidden'
      window.addEventListener('keydown', handleKeyDown)
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [quickViewProduct])


  useEffect(() => {
    let isMounted = true
    const fetchCategories = async () => {
      try {
        const [catRes, prodRes] = await Promise.allSettled([
          axios.get(`${API_BASE_URL}/api/category/show?status=active`),
          axios.get(`${API_BASE_URL}/api/product/show`)
        ])

        if (!isMounted) return

        if (catRes.status === 'fulfilled' && Array.isArray(catRes.value.data)) {
          const names = catRes.value.data.map(c => c.category || c.name).filter(Boolean)
          setCategoryList(['All', ...new Set(names)])
        }

        if (prodRes.status === 'fulfilled' && Array.isArray(prodRes.value.data)) {
          setallProductsList(prodRes.value.data)
        }
      } catch {
        // fallback handles errors gracefully
      }
    }
    fetchCategories()
    return () => {
      isMounted = false
    }
  }, [])

  // Filter & Sort Logic
  const filteredProducts = useMemo(() => {
    return allProductsList
      .filter((item) => {
        const catName = item?.category_id?.category || item?.category || ''
        const productName = item?.name || item?.title || ''
        const price = Number(item?.price) || 0

        const matchesCategory =
          selectedCategory === 'All' ||
          catName.toLowerCase().trim() === selectedCategory.toLowerCase().trim() ||
          catName.toLowerCase().includes(selectedCategory.toLowerCase()) ||
          selectedCategory.toLowerCase().includes(catName.toLowerCase())

        const matchesSearch =
          !searchTerm ||
          productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          catName.toLowerCase().includes(searchTerm.toLowerCase())

        let matchesPrice = true
        if (priceFilter === 'under500') matchesPrice = price < 500
        else if (priceFilter === '500-2000') matchesPrice = price >= 500 && price <= 2000
        else if (priceFilter === '2000-5000') matchesPrice = price > 2000 && price <= 5000
        else if (priceFilter === 'above5000') matchesPrice = price > 5000

        let matchesStock = true
        if (inStockOnly) {
          const status = (item?.stockstatus || 'In Stock').toLowerCase()
          matchesStock = status === 'in stock' || status === 'active' || Number(item?.stockquantity) > 0
        }

        return matchesCategory && matchesSearch && matchesPrice && matchesStock
      })
      .sort((a, b) => {
        if (sortBy === 'Price: Low to High') return (a.price || 0) - (b.price || 0)
        if (sortBy === 'Price: High to Low') return (b.price || 0) - (a.price || 0)
        if (sortBy === 'Name: A-Z') return (a.name || a.title || '').localeCompare(b.name || b.title || '')
        return (b.featured ? 1 : 0) - (a.featured ? 1 : 0)
      })
  }, [allProductsList, selectedCategory, searchTerm, sortBy, priceFilter, inStockOnly])
 
  return (
    <>
      <Header />

      {/* Products Page Hero Banner */}
      <section className="product-hero-section py-5">
        <div className="container py-2">
          <div className="product-hero-content text-start">
            {/* Breadcrumb Navigation */}
            <div className="product-breadcrumb mb-2">
              <Link to="/" className="text-decoration-none" style={{ color: '#3945E0', fontSize: '13px' }}>Home</Link>
              <span className="mx-2 text-muted" style={{ fontSize: '13px' }}>&rsaquo;</span>
              <span className="text-muted" style={{ fontSize: '13px' }}>Products</span>
            </div>

            {/* Title */}
            <h1 className="product-hero-title mb-2">
              All <span className="highlight-italic">Products</span>
            </h1>

            {/* Accent Line */}
            <div className="product-accent-line mb-3"></div>

            {/* Subtitle */}
            <p className="product-hero-subtitle mb-0">
              Browse {allProductsList.length} electronics components, boards, and accessories.
            </p>
          </div>
        </div>
      </section>

      {/* Product Catalog Grid Section */}
      <section className="product-catalog-section py-5">
        <div className="container-fluid px-3 px-xl-5">
          {/* Top Search & Sort Control Bar */}
          <div className="d-flex flex-column flex-md-row align-items-center justify-content-between gap-3 mb-4">
            {/* Search Input Box */}
            <div className="position-relative w-100" style={{ maxWidth: '380px' }}>
              <input
                type="text"
                className="form-control product-search-input pe-4 text-start"
                placeholder="Search by product name or category..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <i className="bi bi-search product-search-icon"></i>
            </div>

            {/* Sort Dropdown */}
            <div className="d-flex align-items-center gap-2 ms-auto">
              <span className="text-muted" style={{ fontSize: '14px' }}>Sort:</span>
              <select
                className="form-select product-sort-select"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="Featured">Featured</option>
                <option value="Price: Low to High">Price: Low to High</option>
                <option value="Price: High to Low">Price: High to Low</option>
                <option value="Name: A-Z">Name: A-Z</option>
              </select>
            </div>
          </div>

          {/* Category Filter Pills Bar */}
          <div className="d-flex flex-wrap gap-2 mb-3 align-items-center">
            {categoryList.map((cat, index) => (
              <button
                key={cat}
                type="button"
                className={`btn category-pill-btn cat-pill-theme-${index % 6} ${selectedCategory.toLowerCase() === cat.toLowerCase() ? 'active' : ''}`}
                onClick={() => setSelectedCategory(cat)} >
                {cat}
              </button>
            ))}
          </div>

          {/* Flipkart Price & Stock Filter Row */}
          <div className="d-flex flex-wrap align-items-center gap-2 mb-4 p-2.5 rounded-3 bg-light border">
            <span className="fw-bold small text-dark me-2">
              <i className="bi bi-funnel-fill text-primary me-1"></i>Filter Price:
            </span>
            <button
              type="button"
              className={`btn btn-sm ${priceFilter === 'all' ? 'btn-dark' : 'btn-outline-secondary'} py-1 px-2.5 rounded-pill`}
              style={{ fontSize: '12px' }}
              onClick={() => setPriceFilter('all')}
            >
              All Prices
            </button>
            <button
              type="button"
              className={`btn btn-sm ${priceFilter === 'under500' ? 'btn-primary' : 'btn-outline-secondary'} py-1 px-2.5 rounded-pill`}
              style={{ fontSize: '12px' }}
              onClick={() => setPriceFilter('under500')}
            >
              Under ₹500
            </button>
            <button
              type="button"
              className={`btn btn-sm ${priceFilter === '500-2000' ? 'btn-primary' : 'btn-outline-secondary'} py-1 px-2.5 rounded-pill`}
              style={{ fontSize: '12px' }}
              onClick={() => setPriceFilter('500-2000')}
            >
              ₹500 &ndash; ₹2,000
            </button>
            <button
              type="button"
              className={`btn btn-sm ${priceFilter === '2000-5000' ? 'btn-primary' : 'btn-outline-secondary'} py-1 px-2.5 rounded-pill`}
              style={{ fontSize: '12px' }}
              onClick={() => setPriceFilter('2000-5000')}
            >
              ₹2,000 &ndash; ₹5,000
            </button>
            <button
              type="button"
              className={`btn btn-sm ${priceFilter === 'above5000' ? 'btn-primary' : 'btn-outline-secondary'} py-1 px-2.5 rounded-pill`}
              style={{ fontSize: '12px' }}
              onClick={() => setPriceFilter('above5000')}
            >
              Above ₹5,000
            </button>

            <div className="vr d-none d-md-block mx-1"></div>

            <button
              type="button"
              className={`btn btn-sm ${inStockOnly ? 'btn-success text-white' : 'btn-outline-secondary'} py-1 px-2.5 rounded-pill ms-auto`}
              style={{ fontSize: '12px' }}
              onClick={() => setInStockOnly(!inStockOnly)}
            >
              <i className="bi bi-check2-circle me-1"></i>In Stock Only
            </button>
          </div>

          {/* Showing Count & Clear action */}
          <div className="d-flex align-items-center justify-content-between mb-4">
            <span className="text-muted" style={{ fontSize: '14px' }}>
              Showing <strong>{filteredProducts.length}</strong> of {allProductsList.length} products
              {searchTerm && <span> for "<em>{searchTerm}</em>"</span>}
            </span>
            {(searchTerm || selectedCategory !== 'All' || priceFilter !== 'all' || inStockOnly) && (
              <button
                type="button"
                className="btn btn-sm btn-link text-danger text-decoration-none py-0"
                style={{ fontSize: '13px' }}
                onClick={() => {
                  setSelectedCategory('All');
                  setSearchTerm('');
                  setPriceFilter('all');
                  setInStockOnly(false);
                }}
              >
                <i className="bi bi-x-circle me-1"></i>Reset All Filters
              </button>
            )}
          </div>

          {/* Product Grid or Empty State */}
          {filteredProducts.length === 0 ? (
            <div className="text-center py-5 bg-white rounded-3 border my-3 p-4">
              <i className="bi bi-search display-3 text-muted mb-3 d-block"></i>
              <h4 className="fw-bold text-dark mb-2">No Matching Products Found</h4>
              <p className="text-muted small mb-3">We couldn't find any electronics matching your current search query or active filters.</p>
              <button
                type="button"
                className="btn btn-primary btn-sm px-4 py-2 rounded-pill fw-semibold shadow-xs"
                onClick={() => {
                  setSelectedCategory('All');
                  setSearchTerm('');
                  setPriceFilter('all');
                  setInStockOnly(false);
                }}
              >
                Clear All Filters &amp; View All Products
              </button>
            </div>
          ) : (
            <div className="row g-3 g-md-4">
              {filteredProducts.map((item) => {
                const pId = item._id || item.id
                const isFav = isInWishlist(pId)
                const pImg = formatImg(item.thumbnail)
                const catName = item.category_id?.category || item.category || 'Electronics'
                const pPrice = Number(item.price) || 0
                const pComparePrice = Number(item.compareprice) || 0
                const discountPercent = pComparePrice > pPrice ? Math.round(((pComparePrice - pPrice) / pComparePrice) * 100) : 0

                const allImages = getProductImageList(item)
                const currentIdx = cardImgMap[pId] ?? 0
                const safeIdx = allImages.length > 0 ? currentIdx % allImages.length : 0
                const currentActiveImg = allImages[safeIdx] || pImg

                const slidePrev = (e) => {
                  e.stopPropagation()
                  e.preventDefault()
                  setCardImgMap((prev) => ({
                    ...prev,
                    [pId]: (currentIdx - 1 + allImages.length) % allImages.length,
                  }))
                }

                const slideNext = (e) => {
                  e.stopPropagation()
                  e.preventDefault()
                  setCardImgMap((prev) => ({
                    ...prev,
                    [pId]: (currentIdx + 1) % allImages.length,
                  }))
                }

                const ratingScore = item.rating || (4.0 + ((Number(pId.slice(-2), 16) || 42) % 10) / 10).toFixed(1);
                const ratingCount = item.reviews || (50 + ((Number(pId.slice(-3), 16) || 120) % 950));
                const inStock = item.stockstatus === 'In Stock' || item.stockstatus === 'active' || item.inStock !== false;

                return (
                  <div key={pId} className="col-12 col-sm-6 col-md-6 col-lg-3">
                    <div className="flipkart-product-card p-3 shadow-xs">
                      {/* Top Floating Badges */}
                      <div className="d-flex align-items-center justify-content-between position-absolute top-0 start-0 end-0 p-2.5 z-3">
                        <div className="d-flex flex-column gap-1">
                          <span className="flipkart-assured-badge">
                            <i className="bi bi-patch-check-fill"></i> Assured
                          </span>
                          {discountPercent > 0 && (
                            <span className="badge bg-danger text-white fw-bold px-1.5 py-0.5 rounded-1" style={{ fontSize: '10px' }}>
                              {discountPercent}% OFF
                            </span>
                          )}
                        </div>

                        {/* Wishlist Button */}
                        <button
                          type="button"
                          className={`flipkart-wishlist-btn ${isFav ? 'active' : ''}`}
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            toggleWishlist(item);
                          }}
                          title={isFav ? "Remove from Wishlist" : "Add to Wishlist"}
                          aria-label="Wishlist"
                        >
                          <i className={`bi ${isFav ? 'bi-heart-fill' : 'bi-heart text-secondary'}`}></i>
                        </button>
                      </div>

                      {/* Product Image Box */}
                      <div
                        className="flipkart-img-container cursor-pointer"
                        onClick={() => navigate(`/product/${pId}`)}
                      >
                        <img
                          src={currentActiveImg}
                          alt={item.name}
                          className="flipkart-product-img"
                        />

                        {/* Card Image Slide Arrows */}
                        {allImages.length > 1 && (
                          <>
                            <button
                              type="button"
                              className="product-card-arrow-btn prev"
                              onClick={slidePrev}
                              title="Previous image"
                              aria-label="Previous image"
                            >
                              <i className="bi bi-chevron-left"></i>
                            </button>
                            <button
                              type="button"
                              className="product-card-arrow-btn next"
                              onClick={slideNext}
                              title="Next image"
                              aria-label="Next image"
                            >
                              <i className="bi bi-chevron-right"></i>
                            </button>
                          </>
                        )}
                      </div>

                      {/* Product Details Section */}
                      <div className="d-flex flex-column flex-grow-1 mt-2">
                        {/* Category & Stock Tag */}
                        <div className="d-flex align-items-center justify-content-between mb-1.5">
                          <span className="text-muted text-uppercase fw-semibold" style={{ fontSize: '11px', letterSpacing: '0.4px' }}>
                            {catName}
                          </span>
                          {inStock ? (
                            <span className="text-success fw-semibold" style={{ fontSize: '11px' }}>
                              <i className="bi bi-dot"></i>In Stock
                            </span>
                          ) : (
                            <span className="text-danger fw-semibold" style={{ fontSize: '11px' }}>
                              <i className="bi bi-dot"></i>Out of Stock
                            </span>
                          )}
                        </div>

                        {/* Product Title */}
                        <Link
                          to={`/product/${pId}`}
                          className="flipkart-card-title text-decoration-none"
                          title={item.name}
                        >
                          {item.name}
                        </Link>

                        {/* Flipkart Ratings Row */}
                        <div className="d-flex align-items-center gap-1.5 my-1.5">
                          <span className="flipkart-rating-pill">
                            {ratingScore} <i className="bi bi-star-fill"></i>
                          </span>
                          <span className="flipkart-reviews-count">
                            ({ratingCount})
                          </span>
                        </div>

                        {/* Price & Savings Hierarchy */}
                        <div className="d-flex align-items-baseline gap-2 mt-auto pt-2">
                          <span className="flipkart-price">
                            ₹{pPrice.toLocaleString('en-IN')}
                          </span>
                          {pComparePrice > pPrice && (
                            <span className="flipkart-compare-price">
                              ₹{pComparePrice.toLocaleString('en-IN')}
                            </span>
                          )}
                        </div>

                        {/* Free Delivery Tag */}
                        <div className="text-muted small mt-1" style={{ fontSize: '11px' }}>
                          <span className="text-success fw-semibold">
                            <i className="bi bi-truck me-1"></i>Free Delivery
                          </span> by Tomorrow
                        </div>

                        {/* Flipkart Dual Action Buttons */}
                        <div className="flipkart-action-btns">
                          <button
                            type="button"
                            className="btn-flipkart-cart"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              const added = addToCart(item, 1, navigate);
                              if (added) navigate('/cart');
                            }}
                            disabled={!inStock}
                            title="Add to Cart"
                          >
                            <i className="bi bi-cart3"></i>
                            <span>Add to Cart</span>
                          </button>
                          <button
                            type="button"
                            className="btn-flipkart-buy"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              buyNow(item, 1, navigate);
                            }}
                            disabled={!inStock}
                            title="Buy Now"
                          >
                            <i className="bi bi-lightning-charge-fill"></i>
                            <span>Buy Now</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* LUXURY PROFESSIONAL QUICK VIEW MODAL */}
      {quickViewProduct && (
        <QuickViewModal
          product={quickViewProduct}
          onClose={closeQuickView}
        />
      )}

      <Footer />
    </>
  )
}

export default Product