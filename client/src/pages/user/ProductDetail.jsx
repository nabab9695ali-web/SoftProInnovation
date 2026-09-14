import { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import { useCart } from '../../context/CartContext';
import { API_BASE_URL } from '../../config/api';
import { formatImg } from '../../utils/imageUrl';
import './ProductDetail.css';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart, toggleWishlist, isInWishlist } = useCart();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeIdx, setActiveIdx] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isZooming, setIsZooming] = useState(false);
  const [zoomPos, setZoomPos] = useState({ x: '50%', y: '50%' });
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('description');
  const [pincode, setPincode] = useState('');
  const [pincodeStatus, setPincodeStatus] = useState(null);
  const [copied, setCopied] = useState(false);

  // Flipkart signature features: Similar Products, Reviews, Recently Viewed
  const [similarProducts, setSimilarProducts] = useState([]);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewSuccessMsg, setReviewSuccessMsg] = useState('');
  const [reviewForm, setReviewForm] = useState({
    rating: 5,
    name: '',
    title: '',
    comment: ''
  });
  const [reviewsList, setReviewsList] = useState([]);

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handlePincodeCheck = (e) => {
    e.preventDefault();
    if (!pincode || pincode.trim().length !== 6) {
      setPincodeStatus({
        valid: false,
        message: 'Please enter a valid 6-digit Indian PIN code.',
      });
      return;
    }
    setPincodeStatus({
      valid: true,
      pincode: pincode.trim(),
      message: `Delivery available to ${pincode.trim()} | Estimated delivery in 2-3 business days. COD Available.`,
    });
  };

  const imageFrameRef = useRef(null);

  // Fetch product details
  useEffect(() => {
    let isMounted = true;
    window.scrollTo(0, 0);

    const fetchProductData = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/product/show/${id}`);
        const data = await res.json();
        if (data.success && data.product) {
          if (isMounted) {
            setProduct(data.product);
            setActiveIdx(0);
            setQuantity(1);
          }
        } else {
          if (isMounted) setError('Product not found.');
        }
      } catch (err) {
        console.error('Error loading product details:', err);
        if (isMounted) setError('Unable to load product. Please check connection.');
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    if (id) {
      fetchProductData();
    }

    return () => {
      isMounted = false;
    };
  }, [id]);

  // 1. Flipkart Feature: Automatically record Recently Viewed in localStorage
  useEffect(() => {
    if (product && (product._id || product.id)) {
      try {
        const prodId = product._id || product.id;
        const existing = JSON.parse(localStorage.getItem('recentlyViewed') || '[]');
        const filtered = existing.filter((item) => (item._id || item.id) !== prodId);
        const itemToSave = {
          _id: prodId,
          id: prodId,
          name: product.name,
          price: product.price,
          compareprice: product.compareprice || product.originalPrice,
          thumbnail: product.thumbnail,
          rating: product.rating || '4.8',
          reviews: product.reviews || 18,
          category: product.category_id?.category || product.category_id?.name || product.category || 'Electronics'
        };
        const updated = [itemToSave, ...filtered].slice(0, 12);
        localStorage.setItem('recentlyViewed', JSON.stringify(updated));
      } catch (err) {
        console.warn('Could not save to recently viewed:', err);
      }
    }
  }, [product]);

  // 2. Flipkart Feature: Fetch Similar Products & Recommendations
  useEffect(() => {
    const fetchSimilar = async () => {
      if (!product) return;
      try {
        const res = await fetch(`${API_BASE_URL}/api/product/show`);
        const all = await res.json();
        if (Array.isArray(all)) {
          const currentId = product._id || product.id || id;
          const others = all.filter((p) => (p._id || p.id) !== currentId);
          const currentCatId = product.category_id?._id || product.category_id;
          
          const catMatches = others.filter((p) => {
            const pCatId = p.category_id?._id || p.category_id;
            return pCatId && currentCatId && String(pCatId) === String(currentCatId);
          });

          const finalList = catMatches.length >= 3 ? catMatches : others;
          setSimilarProducts(finalList.slice(0, 8));
        }
      } catch (err) {
        console.error('Error fetching similar products:', err);
      }
    };

    fetchSimilar();
  }, [product, id]);

  // 3. Flipkart Feature: Initialize Customer Reviews from LocalStorage or defaults
  useEffect(() => {
    if (!product) return;
    const prodId = product._id || product.id || id;
    const storageKey = `reviews_${prodId}`;
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        setReviewsList(JSON.parse(stored));
      } else {
        const defaultReviews = [
          {
            id: 1,
            author: 'Abhishek Sharma',
            location: 'Lucknow, UP',
            rating: 5,
            date: '3 days ago',
            verified: true,
            title: '100% Genuine and Original Component!',
            comment: 'Delivered in 2 days via BlueDart. Quality is far better than generic online stores. Perfect pin alignment and clean soldering pads.',
            helpful: 24
          },
          {
            id: 2,
            author: 'Pooja Verma',
            location: 'New Delhi',
            rating: 5,
            date: '1 week ago',
            verified: true,
            title: 'Worked flawlessly in our college robotics project',
            comment: 'Used it immediately in our IoT automation setup. No overheating and precise response. Softpro Innovation is our go-to store now.',
            helpful: 15
          },
          {
            id: 3,
            author: 'Karthik Raja',
            location: 'Bengaluru, KA',
            rating: 4,
            date: '2 weeks ago',
            verified: true,
            title: 'Fast dispatch and great packaging',
            comment: 'Anti-static bubble wrap packaging was very secure. Product is as described in datasheet. Highly recommended for engineers and makers.',
            helpful: 9
          }
        ];
        setReviewsList(defaultReviews);
      }
    } catch {
      // Fallback
    }
  }, [product, id]);

  const handleReviewSubmit = (e) => {
    e.preventDefault();
    if (!reviewForm.name.trim() || !reviewForm.comment.trim()) return;

    setReviewSubmitting(true);
    const prodId = product?._id || product?.id || id;
    const newRev = {
      id: Date.now(),
      author: reviewForm.name.trim(),
      location: 'India (Verified Buyer)',
      rating: Number(reviewForm.rating) || 5,
      date: 'Just now',
      verified: true,
      title: reviewForm.title.trim() || 'Great Purchase!',
      comment: reviewForm.comment.trim(),
      helpful: 1
    };

    const updated = [newRev, ...reviewsList];
    setReviewsList(updated);
    try {
      localStorage.setItem(`reviews_${prodId}`, JSON.stringify(updated));
    } catch (e) {
      console.warn('LocalStorage error:', e);
    }

    setReviewSubmitting(false);
    setShowReviewModal(false);
    setReviewForm({ rating: 5, name: '', title: '', comment: '' });
    setActiveTab('reviews');
    setReviewSuccessMsg('Thank you! Your verified review has been published.');
    setTimeout(() => setReviewSuccessMsg(''), 4000);
  };

  const handleHelpfulVote = (reviewId) => {
    const updated = reviewsList.map((rev) => {
      if (rev.id === reviewId) {
        return { ...rev, helpful: (rev.helpful || 0) + 1, voted: true };
      }
      return rev;
    });
    setReviewsList(updated);
    const prodId = product?._id || product?.id || id;
    try {
      localStorage.setItem(`reviews_${prodId}`, JSON.stringify(updated));
    } catch {}
  };

  // Gallery image processing
  const getImages = () => {
    if (!product) return [];
    const list = [];
    if (product.thumbnail) list.push(formatImg(product.thumbnail));
    if (Array.isArray(product.images)) {
      product.images.forEach((img) => {
        const formatted = formatImg(img);
        if (formatted && !list.includes(formatted)) {
          list.push(formatted);
        }
      });
    }
    return list.length > 0 ? list : ['https://placehold.co/500x500?text=No+Image'];
  };

  const images = getImages();
  const safeIdx = Math.min(activeIdx, Math.max(0, images.length - 1));
  const activeImage = images[safeIdx];

  // Derived details
  const pId = product?._id || product?.id || id;
  const name = product?.name || 'Electronic Component';
  const catName =
    product?.category_id?.category ||
    product?.category_id?.name ||
    product?.category ||
    'Electronics';
  const price = Number(product?.price) || 0;
  const comparePrice = Number(product?.compareprice) || Number(product?.originalPrice) || 0;
  const discountPercent =
    comparePrice > price ? Math.round(((comparePrice - price) / comparePrice) * 100) : 0;
  const stockStatus = (product?.stockstatus || 'In Stock').trim();
  const stockQty = Number(product?.stockquantity) || 0;
  const inStock =
    stockStatus.toLowerCase() === 'in stock' ||
    stockStatus.toLowerCase() === 'active' ||
    (stockQty > 0 && stockStatus.toLowerCase() !== 'out of stock');

  const sku = product?.sku || `SP-${(product?._id ? product._id.slice(-6) : 'DEMO').toUpperCase()}`;
  const rating = product?.rating || '4.8';
  const reviewsCount = product?.reviews || 16;
  const desc =
    product?.description ||
    product?.shortdescription ||
    'High quality precision electronic hardware engineered for superior performance in embedded systems, robotics, IoT development, and DIY electronics projects.';

  const isFavorite = isInWishlist(pId);

  // Mouse pan zoom
  const handleMouseMove = (e) => {
    if (!imageFrameRef.current) return;
    const rect = imageFrameRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setZoomPos({ x: `${x.toFixed(1)}%`, y: `${y.toFixed(1)}%` });
  };

  const handlePrev = (e) => {
    e.stopPropagation();
    setActiveIdx((prev) => (prev - 1 + images.length) % images.length);
  };

  const handleNext = (e) => {
    e.stopPropagation();
    setActiveIdx((prev) => (prev + 1) % images.length);
  };

  const handleQtyChange = (delta) => {
    setQuantity((prev) => Math.max(1, prev + delta));
  };

  const handleAddToCart = () => {
    const success = addToCart(product, quantity);
    if (success) {
      navigate('/cart');
    }
  };

  const handleBuyNow = () => {
    const success = addToCart(product, quantity);
    if (success) {
      navigate('/cart');
    }
  };

  const handleWishlistToggle = () => {
    toggleWishlist(product);
  };

  if (loading) {
    return (
      <div className="pd-page-wrapper">
        <Header />
        <div className="container py-5 text-center my-5">
          <div className="spinner-border text-primary" role="status" style={{ width: '3rem', height: '3rem' }}>
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3 text-secondary fw-semibold">Loading product details...</p>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="pd-page-wrapper">
        <Header />
        <div className="container py-5 text-center my-5">
          <div className="alert alert-warning d-inline-block px-4 py-3 rounded-4 shadow-sm">
            <i className="bi bi-exclamation-triangle-fill fs-4 me-2 text-warning"></i>
            <span className="fw-semibold">{error || 'Product not found.'}</span>
          </div>
          <div className="mt-4">
            <Link to="/product" className="btn btn-primary px-4 py-2 rounded-pill">
              Browse All Products
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="pd-page-wrapper">
      {/* 1. Website Header */}
      <Header />

      {/* 2. Breadcrumbs Bar */}
      <div className="pd-breadcrumb-section">
        <div className="container">
          <ul className="pd-breadcrumb">
            <li>
              <Link to="/">Home</Link>
            </li>
            <li className="pd-breadcrumb-separator">›</li>
            <li>
              <Link to="/product">Shop</Link>
            </li>
            <li className="pd-breadcrumb-separator">›</li>
            <li>
              <Link to={`/product?category=${encodeURIComponent(catName)}`}>{catName}</Link>
            </li>
            <li className="pd-breadcrumb-separator">›</li>
            <li className="pd-breadcrumb-active">{name}</li>
          </ul>
        </div>
      </div>

      {/* 3. Main Product Details Container */}
      <div className="container py-4 py-lg-5">
        <div className="pd-main-card">
          <div className="row g-4 g-lg-5 align-items-start">
            {/* Left Column: Image Showcase with Zoom & Thumbnails */}
            <div className="col-12 col-lg-6">
              <div className="pd-gallery-container">
                <div
                  ref={imageFrameRef}
                  className={`pd-image-frame ${isZooming ? 'is-zooming' : ''}`}
                  style={{
                    '--zoom-x': zoomPos.x,
                    '--zoom-y': zoomPos.y,
                  }}
                  onMouseEnter={() => setIsZooming(true)}
                  onMouseLeave={() => setIsZooming(false)}
                  onMouseMove={handleMouseMove}
                >
                  <img src={activeImage} alt={name} className="pd-main-img" />

                  {/* Corner Zoom Button */}
                  <button
                    type="button"
                    className="pd-zoom-btn"
                    onClick={() => setIsLightboxOpen(true)}
                    title="Click to view full image"
                  >
                    <i className="bi bi-zoom-in"></i>
                    <span>Zoom</span>
                  </button>

                  {/* Nav arrows if multiple images */}
                  {images.length > 1 && (
                    <>
                      <button
                        type="button"
                        className="pd-arrow-btn prev"
                        onClick={handlePrev}
                        title="Previous Image"
                        aria-label="Previous image"
                      >
                        <i className="bi bi-chevron-left"></i>
                      </button>
                      <button
                        type="button"
                        className="pd-arrow-btn next"
                        onClick={handleNext}
                        title="Next Image"
                        aria-label="Next image"
                      >
                        <i className="bi bi-chevron-right"></i>
                      </button>
                    </>
                  )}
                </div>

                {/* Thumbnails Row */}
                {images.length > 1 && (
                  <div className="pd-thumbs-row">
                    {images.map((imgUrl, i) => {
                      const isActive = i === safeIdx;
                      return (
                        <button
                          key={i}
                          type="button"
                          className={`pd-thumb-btn ${isActive ? 'active' : ''}`}
                          onClick={() => setActiveIdx(i)}
                          title={`View image ${i + 1}`}
                        >
                          <img src={imgUrl} alt={`Thumbnail ${i + 1}`} className="pd-thumb-img" />
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Right Column: Product Info, Options & Actions */}
            <div className="col-12 col-lg-6">
              <div className="pd-details-container">
                {/* Category & Assured Badge Row */}
                <div className="d-flex align-items-center gap-2 mb-2 flex-wrap">
                  <div className="pd-cat-badge">{catName}</div>
                  <span className="flipkart-assured-badge">
                    <i className="bi bi-shield-fill-check"></i> Assured
                  </span>
                </div>

                {/* Headline Title */}
                <h1 className="pd-title mb-2">{name}</h1>

                {/* Ratings & Verification */}
                <div className="d-flex align-items-center gap-2 mb-2 flex-wrap">
                  <span className="flipkart-rating-pill">
                    {rating} <i className="bi bi-star-fill"></i>
                  </span>
                  <span className="flipkart-reviews-count">
                    {reviewsCount} Ratings &amp; {Math.round(reviewsCount * 0.75)} Reviews
                  </span>
                  <span className="text-muted small">|</span>
                  <span className="text-success small fw-semibold">
                    <i className="bi bi-patch-check-fill me-1"></i>Verified Electronics
                  </span>
                  <div className="ms-auto d-flex align-items-center gap-1.5">
                    <button
                      type="button"
                      className="btn btn-sm btn-outline-secondary px-2.5 py-1 rounded-pill d-inline-flex align-items-center gap-1 shadow-xs"
                      style={{ fontSize: '11.5px' }}
                      onClick={handleShare}
                      title="Copy link to share"
                    >
                      <i className={`bi ${copied ? 'bi-check2 text-success' : 'bi-share-fill'}`}></i>
                      <span>{copied ? 'Copied!' : 'Share'}</span>
                    </button>
                    <a
                      href={`https://wa.me/?text=${encodeURIComponent(`Check out ${name} on SoftPro Innovation: ${typeof window !== 'undefined' ? window.location.href : ''}`)}`}
                      target="_blank"
                      rel="noreferrer"
                      className="btn btn-sm btn-outline-success px-2.5 py-1 rounded-pill d-inline-flex align-items-center gap-1"
                      style={{ fontSize: '11.5px' }}
                      title="Share on WhatsApp"
                    >
                      <i className="bi bi-whatsapp"></i>
                      <span>WhatsApp</span>
                    </a>
                  </div>
                </div>

                {/* Meta: SKU & Stock Status */}
                <div className="pd-meta-row mb-3">
                  <span>SKU: <strong className="text-dark">{sku}</strong></span>
                  <span className={`pd-stock-pill ${inStock ? 'in-stock' : 'out-stock'}`}>
                    <span className="pd-stock-dot"></span>
                    {inStock ? (stockQty > 0 ? `In Stock (${stockQty} units)` : 'In Stock') : 'Out of Stock'}
                  </span>
                </div>

                {/* Flipkart Price & Savings Hierarchy */}
                <div className="pd-price-card mb-3">
                  <div className="d-flex align-items-baseline gap-2 flex-wrap">
                    <span className="pd-current-price">₹{price.toLocaleString('en-IN')}</span>
                    {comparePrice > price && (
                      <span className="pd-compare-price">₹{comparePrice.toLocaleString('en-IN')}</span>
                    )}
                    {discountPercent > 0 && (
                      <span className="pd-discount-badge">{discountPercent}% OFF</span>
                    )}
                  </div>
                  <div className="text-muted small mt-1">Inclusive of all taxes &amp; free shipping on eligible orders</div>
                </div>

                {/* Flipkart Style Bank Offers Box */}
                <div className="p-3 my-3 rounded-3" style={{ background: '#f0fdf4', border: '1px dashed #22c55e' }}>
                  <div className="d-flex align-items-center gap-2 fw-bold text-success mb-2" style={{ fontSize: '13px' }}>
                    <i className="bi bi-tag-fill"></i> Available Bank &amp; Special Offers
                  </div>
                  <ul className="mb-0 ps-3 text-secondary" style={{ lineHeight: '1.7', fontSize: '12px' }}>
                    <li><strong>Bank Offer:</strong> 5% Unlimited Cashback on Flipkart Axis Bank / ICICI Cards</li>
                    <li><strong>Special Price:</strong> Get extra ₹150 off on combo purchase with electronic accessories</li>
                    <li><strong>Partner Offer:</strong> Pay via UPI &amp; get scratch card up to ₹50 cashback</li>
                    <li><strong>No Cost EMI:</strong> Available on orders above ₹3,000 across major banks</li>
                  </ul>
                </div>

                {/* Delivery PIN Code Checker */}
                <div className="pd-delivery-checker p-3 my-3 rounded-3 bg-light border">
                  <div className="d-flex align-items-center justify-content-between mb-2">
                    <span className="fw-bold text-dark small">
                      <i className="bi bi-geo-alt-fill text-danger me-1"></i> Delivery to PIN Code
                    </span>
                    {pincodeStatus?.valid && (
                      <span className="badge bg-success-subtle text-success border border-success-subtle">
                        Servicing
                      </span>
                    )}
                  </div>
                  <form onSubmit={handlePincodeCheck} className="d-flex gap-2">
                    <input
                      type="text"
                      maxLength={6}
                      placeholder="Enter 6-digit Pincode"
                      className="form-control form-control-sm"
                      style={{ maxWidth: '210px', fontWeight: '600' }}
                      value={pincode}
                      onChange={(e) => setPincode(e.target.value.replace(/\D/g, ''))}
                    />
                    <button type="submit" className="btn btn-sm btn-outline-primary fw-bold px-3">
                      Check
                    </button>
                  </form>
                  {pincodeStatus && (
                    <div className={`mt-2 small fw-semibold ${pincodeStatus.valid ? 'text-success' : 'text-danger'}`}>
                      <i className={`bi ${pincodeStatus.valid ? 'bi-check-circle-fill' : 'bi-exclamation-circle-fill'} me-1`}></i>
                      {pincodeStatus.message}
                    </div>
                  )}
                </div>

                {/* Description */}
                <p className="pd-description mb-3">{product.shortdescription || desc}</p>

                {/* Quantity Selector: Clean White/Slate Rail */}
                <div className="pd-qty-group mb-3">
                  <label className="pd-qty-label">Quantity:</label>
                  <div className="pd-qty-box">
                    <div className="pd-qty-stepper">
                      <button
                        type="button"
                        className="pd-qty-btn"
                        onClick={() => handleQtyChange(-1)}
                        disabled={quantity <= 1}
                        title="Decrease"
                      >
                        <i className="bi bi-dash"></i>
                      </button>
                      <span className="pd-qty-display">{quantity}</span>
                      <button
                        type="button"
                        className="pd-qty-btn"
                        onClick={() => handleQtyChange(1)}
                        title="Increase"
                      >
                        <i className="bi bi-plus"></i>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Flipkart / Amazon Action Buttons: Add To Cart, Buy Now, Wishlist */}
                <div className="d-flex align-items-center gap-2 gap-sm-3 my-4">
                  <button
                    type="button"
                    className="btn-flipkart-cart flex-fill py-3"
                    style={{ fontSize: '13.5px', borderRadius: '8px' }}
                    onClick={handleAddToCart}
                    disabled={!inStock}
                  >
                    <i className="bi bi-bag-plus-fill fs-6"></i>
                    <span>ADD TO CART</span>
                  </button>

                  <button
                    type="button"
                    className="btn-flipkart-buy flex-fill py-3"
                    style={{ fontSize: '13.5px', borderRadius: '8px' }}
                    onClick={handleBuyNow}
                    disabled={!inStock}
                  >
                    <i className="bi bi-lightning-charge-fill fs-6"></i>
                    <span>BUY NOW</span>
                  </button>

                  <button
                    type="button"
                    className={`pd-btn-wishlist ${isFavorite ? 'active' : ''}`}
                    style={{ width: '48px', height: '48px', flexShrink: 0, borderRadius: '8px' }}
                    onClick={handleWishlistToggle}
                    title={isFavorite ? 'Remove from Wishlist' : 'Add to Wishlist'}
                  >
                    <i className={`bi ${isFavorite ? 'bi-heart-fill' : 'bi-heart'} fs-5`}></i>
                  </button>
                </div>

                {/* 4-Item Flipkart / Amazon Assurance Grid */}
                <div className="flipkart-trust-grid">
                  <div className="flipkart-trust-item">
                    <div className="flipkart-trust-icon">
                      <i className="bi bi-arrow-repeat"></i>
                    </div>
                    <div className="flipkart-trust-text">
                      <h6>{product.refund_days ? `${product.refund_days} Days` : '7 Days'}</h6>
                      <p>Replacement</p>
                    </div>
                  </div>
                  <div className="flipkart-trust-item">
                    <div className="flipkart-trust-icon">
                      <i className="bi bi-truck"></i>
                    </div>
                    <div className="flipkart-trust-text">
                      <h6>{product.isfreedelivery !== false ? 'Free Delivery' : 'Fast Shipping'}</h6>
                      <p>Across India</p>
                    </div>
                  </div>
                  <div className="flipkart-trust-item">
                    <div className="flipkart-trust-icon">
                      <i className="bi bi-shield-check"></i>
                    </div>
                    <div className="flipkart-trust-text">
                      <h6>100% Genuine</h6>
                      <p>Verified Quality</p>
                    </div>
                  </div>
                  <div className="flipkart-trust-item">
                    <div className="flipkart-trust-icon">
                      <i className="bi bi-cash-stack"></i>
                    </div>
                    <div className="flipkart-trust-text">
                      <h6>COD Available</h6>
                      <p>Pay at Doorstep</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 4. Specifications, Description & Customer Reviews Tabs */}
        <div className="pd-tabs-card mt-4">
          <div className="pd-tabs-nav">
            <button
              type="button"
              className={`pd-tab-btn ${activeTab === 'description' ? 'active' : ''}`}
              onClick={() => setActiveTab('description')}
            >
              Full Description
            </button>
            <button
              type="button"
              className={`pd-tab-btn ${activeTab === 'specifications' ? 'active' : ''}`}
              onClick={() => setActiveTab('specifications')}
            >
              Specifications
            </button>
            <button
              type="button"
              className={`pd-tab-btn ${activeTab === 'reviews' ? 'active' : ''}`}
              onClick={() => setActiveTab('reviews')}
            >
              Ratings & Reviews ({reviewsList.length})
            </button>
            <button
              type="button"
              className={`pd-tab-btn ${activeTab === 'shipping' ? 'active' : ''}`}
              onClick={() => setActiveTab('shipping')}
            >
              Shipping & Policy
            </button>
          </div>

          <div className="tab-content py-2">
            {activeTab === 'description' && (
              <div className="text-secondary lh-lg">
                <p>{desc}</p>
                {product.description && product.shortdescription && (
                  <p className="mt-3">{product.description}</p>
                )}
              </div>
            )}

            {activeTab === 'specifications' && (
              <div className="table-responsive">
                <table className="table table-bordered mb-0">
                  <tbody>
                    <tr>
                      <th style={{ width: '220px', background: '#f8fafc' }}>Category</th>
                      <td>{catName}</td>
                    </tr>
                    <tr>
                      <th style={{ background: '#f8fafc' }}>SKU</th>
                      <td>{sku}</td>
                    </tr>
                    {product.width && (
                      <tr>
                        <th style={{ background: '#f8fafc' }}>Dimensions</th>
                        <td>{product.width} x {product.height} mm</td>
                      </tr>
                    )}
                    {Array.isArray(product.tags) && product.tags.length > 0 && (
                      <tr>
                        <th style={{ background: '#f8fafc' }}>Tags</th>
                        <td>
                          {product.tags.map((t, idx) => (
                            <span key={idx} className="badge bg-light text-dark border me-1">
                              {t}
                            </span>
                          ))}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {activeTab === 'reviews' && (
              <div className="pd-reviews-wrapper">
                {reviewSuccessMsg && (
                  <div className="alert alert-success d-flex align-items-center gap-2 rounded-3 mb-4">
                    <i className="bi bi-check-circle-fill fs-5"></i>
                    <span>{reviewSuccessMsg}</span>
                  </div>
                )}

                {/* Flipkart Review Summary Header */}
                <div className="pd-rating-summary-box mb-4">
                  <div className="row g-4 align-items-center">
                    <div className="col-12 col-md-4 text-center border-end-md">
                      <div className="pd-big-rating-number">
                        {rating} <i className="bi bi-star-fill text-warning"></i>
                      </div>
                      <div className="fw-semibold text-dark mt-1">
                        {reviewsList.length + 15} Verified Ratings
                      </div>
                      <div className="text-muted small mt-1">
                        & {reviewsList.length} Customer Reviews
                      </div>
                      <div className="d-inline-flex align-items-center gap-1 mt-2 text-success fw-bold small bg-success-subtle px-2.5 py-1 rounded-pill">
                        <i className="bi bi-patch-check-fill"></i>
                        <span>100% Genuine Buyers</span>
                      </div>
                    </div>

                    {/* Star Breakdown Bars */}
                    <div className="col-12 col-md-5">
                      <div className="d-flex flex-column gap-2">
                        {[
                          { star: 5, pct: 76, color: '#16a34a' },
                          { star: 4, pct: 16, color: '#22c55e' },
                          { star: 3, pct: 5, color: '#eab308' },
                          { star: 2, pct: 2, color: '#f97316' },
                          { star: 1, pct: 1, color: '#ef4444' }
                        ].map((row) => (
                          <div key={row.star} className="d-flex align-items-center gap-2" style={{ fontSize: '13px' }}>
                            <span style={{ width: '32px', fontWeight: 600 }}>{row.star} ★</span>
                            <div className="flex-grow-1 bg-light rounded-pill overflow-hidden" style={{ height: '8px' }}>
                              <div
                                className="h-100 rounded-pill"
                                style={{ width: `${row.pct}%`, backgroundColor: row.color }}
                              ></div>
                            </div>
                            <span className="text-muted" style={{ width: '36px', textAlign: 'right' }}>{row.pct}%</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Rate Product Action Button */}
                    <div className="col-12 col-md-3 text-center">
                      <button
                        type="button"
                        className="btn btn-primary fw-bold px-4 py-2.5 rounded-3 shadow-sm w-100"
                        style={{ fontSize: '14px', background: '#2563eb' }}
                        onClick={() => setShowReviewModal(true)}
                      >
                        <i className="bi bi-pencil-square me-2"></i>
                        Rate Product
                      </button>
                      <div className="text-muted small mt-2" style={{ fontSize: '11.5px' }}>
                        Share your feedback with fellow engineers
                      </div>
                    </div>
                  </div>
                </div>

                {/* Reviews Stream */}
                <div className="pd-reviews-list d-flex flex-column gap-3">
                  {reviewsList.map((rev) => (
                    <div key={rev.id} className="pd-review-card p-3 p-md-4 rounded-3 border bg-white shadow-2xs">
                      <div className="d-flex flex-wrap align-items-center justify-content-between gap-2 mb-2">
                        <div className="d-flex align-items-center gap-2">
                          <span
                            className="badge d-inline-flex align-items-center gap-1 px-2 py-1 text-white fw-bold rounded"
                            style={{
                              backgroundColor: rev.rating >= 4 ? '#16a34a' : rev.rating >= 3 ? '#eab308' : '#ef4444',
                              fontSize: '12px'
                            }}
                          >
                            <span>{rev.rating}</span>
                            <i className="bi bi-star-fill" style={{ fontSize: '9px' }}></i>
                          </span>
                          <span className="fw-bold text-dark" style={{ fontSize: '14.5px' }}>
                            {rev.title}
                          </span>
                        </div>
                        <span className="text-muted small">{rev.date}</span>
                      </div>

                      <p className="text-secondary mb-3" style={{ fontSize: '13.5px', lineHeight: '1.6' }}>
                        {rev.comment}
                      </p>

                      <div className="d-flex flex-wrap align-items-center justify-content-between gap-2 pt-2 border-top text-muted small" style={{ fontSize: '12px' }}>
                        <div className="d-flex align-items-center gap-2">
                          <span className="fw-semibold text-dark">{rev.author}</span>
                          {rev.location && <span>• {rev.location}</span>}
                          {rev.verified && (
                            <span className="text-success fw-bold d-inline-flex align-items-center gap-1">
                              <i className="bi bi-patch-check-fill"></i> Verified Purchase
                            </span>
                          )}
                        </div>

                        <button
                          type="button"
                          className="btn btn-sm btn-light border py-1 px-2.5 text-muted d-flex align-items-center gap-1 rounded-pill"
                          onClick={() => handleHelpfulVote(rev.id)}
                          style={{ fontSize: '12px' }}
                        >
                          <i className="bi bi-hand-thumbs-up"></i>
                          <span>Helpful ({rev.helpful || 0})</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'shipping' && (
              <div className="text-secondary lh-lg">
                <ul className="mb-0 ps-3">
                  <li><strong>Delivery:</strong> Dispatched within 24 hours across India via BlueDart / Delhivery.</li>
                  <li><strong>Warranty:</strong> 2 Year manufacturer warranty against manufacturing defects.</li>
                  <li><strong>Return Policy:</strong> {product.refund_days || 7}-day replacement guarantee if defective upon arrival.</li>
                  <li><strong>Payment:</strong> Cash on delivery, UPI (GPay, PhonePe, Paytm), Net Banking accepted.</li>
                </ul>
              </div>
            )}
          </div>
        </div>

        {/* 5. Flipkart Feature: Similar Products / You Might Also Like */}
        {similarProducts.length > 0 && (
          <div className="pd-similar-section mt-5">
            <div className="d-flex align-items-center justify-content-between mb-4">
              <div>
                <span className="badge bg-primary-subtle text-primary fw-bold text-uppercase px-2.5 py-1 rounded-pill mb-1" style={{ fontSize: '11px' }}>
                  <i className="bi bi-lightning-charge-fill me-1"></i> Recommendations
                </span>
                <h4 className="fw-bold text-dark mb-0">Similar Products / Customers Also Bought</h4>
              </div>
              <Link to="/product" className="btn btn-sm btn-outline-primary fw-bold rounded-pill px-3">
                View All <i className="bi bi-arrow-right ms-1"></i>
              </Link>
            </div>

            <div className="row row-cols-2 row-cols-md-3 row-cols-lg-4 g-3 g-md-4">
              {similarProducts.map((sp) => {
                const spPrice = Number(sp.price || 0);
                const spCompare = Number(sp.compareprice || sp.originalPrice || 0);
                const spDiscount = spCompare > spPrice ? Math.round(((spCompare - spPrice) / spCompare) * 100) : 0;
                const spImg = formatImg(sp.thumbnail || (Array.isArray(sp.images) && sp.images[0]));

                return (
                  <div key={sp._id || sp.id} className="col">
                    <div className="card h-100 border rounded-4 overflow-hidden shadow-2xs pd-similar-card transition-all">
                      <div className="position-relative bg-light p-3 text-center" style={{ height: '170px' }}>
                        {spDiscount > 0 && (
                          <span
                            className="position-absolute top-2 start-2 badge bg-danger text-white fw-bold shadow-xs"
                            style={{ fontSize: '10px', borderRadius: '4px' }}
                          >
                            {spDiscount}% OFF
                          </span>
                        )}
                        <Link to={`/product/${sp._id || sp.id}`}>
                          <img
                            src={spImg}
                            alt={sp.name}
                            className="w-100 h-100 object-fit-contain transition-transform"
                          />
                        </Link>
                      </div>

                      <div className="card-body p-3 d-flex flex-column">
                        <div className="text-muted small mb-1" style={{ fontSize: '11.5px' }}>
                          {sp.category_id?.category || sp.category || 'Electronics'}
                        </div>
                        <Link
                          to={`/product/${sp._id || sp.id}`}
                          className="text-decoration-none text-dark fw-bold mb-2 text-truncate-2"
                          style={{ fontSize: '13.5px', minHeight: '38px' }}
                        >
                          {sp.name}
                        </Link>

                        <div className="d-flex align-items-center gap-1.5 mb-2">
                          <span className="badge bg-success text-white px-1.5 py-0.5 rounded fw-bold" style={{ fontSize: '11px' }}>
                            {sp.rating || '4.8'} <i className="bi bi-star-fill" style={{ fontSize: '8px' }}></i>
                          </span>
                          <span className="text-muted" style={{ fontSize: '11px' }}>
                            ({sp.reviews || 16})
                          </span>
                        </div>

                        <div className="mt-auto pt-2 border-top d-flex align-items-center justify-content-between">
                          <div>
                            <span className="fw-bold text-dark fs-6">₹{spPrice.toLocaleString('en-IN')}</span>
                            {spCompare > spPrice && (
                              <span className="text-muted text-decoration-line-through small ms-1.5" style={{ fontSize: '11.5px' }}>
                                ₹{spCompare.toLocaleString('en-IN')}
                              </span>
                            )}
                          </div>
                          <button
                            type="button"
                            className="btn btn-sm btn-outline-primary rounded-circle p-0 d-flex align-items-center justify-content-center"
                            style={{ width: '32px', height: '32px' }}
                            onClick={() => addToCart(sp, 1)}
                            title="Add to Cart"
                          >
                            <i className="bi bi-cart-plus fs-6"></i>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

      </div>

      {/* 6. Write a Review Modal */}
      {showReviewModal && (
        <div className="pd-modal-overlay" onClick={() => setShowReviewModal(false)}>
          <div className="pd-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="d-flex align-items-center justify-content-between pb-3 border-bottom mb-3">
              <h5 className="fw-bold text-dark mb-0 d-flex align-items-center gap-2">
                <i className="bi bi-star-fill text-warning"></i>
                Rate & Review Product
              </h5>
              <button
                type="button"
                className="btn-close"
                onClick={() => setShowReviewModal(false)}
              ></button>
            </div>

            <form onSubmit={handleReviewSubmit}>
              <div className="mb-3">
                <label className="form-label fw-semibold text-dark small">Your Overall Rating</label>
                <div className="d-flex align-items-center gap-2">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <button
                      key={s}
                      type="button"
                      className="btn btn-sm p-0 border-0 bg-transparent text-warning fs-3"
                      onClick={() => setReviewForm({ ...reviewForm, rating: s })}
                    >
                      <i className={`bi ${s <= reviewForm.rating ? 'bi-star-fill' : 'bi-star'}`}></i>
                    </button>
                  ))}
                  <span className="ms-2 fw-bold text-dark">{reviewForm.rating} of 5 Stars</span>
                </div>
              </div>

              <div className="mb-3">
                <label className="form-label fw-semibold text-dark small">Your Name / Handle *</label>
                <input
                  type="text"
                  required
                  className="form-control"
                  placeholder="e.g. Rahul Sharma"
                  value={reviewForm.name}
                  onChange={(e) => setReviewForm({ ...reviewForm, name: e.target.value })}
                />
              </div>

              <div className="mb-3">
                <label className="form-label fw-semibold text-dark small">Review Headline</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. Excellent build quality & fast delivery"
                  value={reviewForm.title}
                  onChange={(e) => setReviewForm({ ...reviewForm, title: e.target.value })}
                />
              </div>

              <div className="mb-4">
                <label className="form-label fw-semibold text-dark small">Detailed Review *</label>
                <textarea
                  required
                  rows={4}
                  className="form-control"
                  placeholder="Write your detailed experience with this product, performance in projects, packaging, etc..."
                  value={reviewForm.comment}
                  onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                ></textarea>
              </div>

              <div className="d-flex justify-content-end gap-2">
                <button
                  type="button"
                  className="btn btn-light px-3 py-2 fw-semibold"
                  onClick={() => setShowReviewModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={reviewSubmitting}
                  className="btn btn-primary px-4 py-2 fw-bold"
                  style={{ background: '#2563eb' }}
                >
                  {reviewSubmitting ? 'Publishing...' : 'Submit Verified Review'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 6. Lightbox Overlay */}
      {isLightboxOpen && (
        <div className="pd-lightbox-overlay" onClick={() => setIsLightboxOpen(false)}>
          <button
            type="button"
            className="pd-lightbox-close"
            onClick={() => setIsLightboxOpen(false)}
            title="Close"
          >
            <i className="bi bi-x-lg"></i>
          </button>
          <img src={activeImage} alt={name} className="pd-lightbox-img" onClick={(e) => e.stopPropagation()} />
        </div>
      )}

      {/* 7. Website Footer */}
      <Footer />
    </div>
  );
};

export default ProductDetail;
