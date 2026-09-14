import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useCart } from '../context/CartContext';
import QuickViewModal from './QuickViewModal';
import { API_BASE_URL } from '../config/api';
import { formatImg } from '../utils/imageUrl';

import img12 from '../assets/12.png';
import img13 from '../assets/13.png';
import img14 from '../assets/14.png';
import img15 from '../assets/15.png';
import img16 from '../assets/16.png';
import img17 from '../assets/17.png';
import img18 from '../assets/18.png';
import img19 from '../assets/19.png';

const fallbackProducts = [
  {
    _id: '1',
    category: 'DISPLAYS',
    name: '7-Segment Displays',
    price: 7200,
    compareprice: 8000,
    stockstatus: 'In Stock',
    badge: 'Sale',
    thumbnail: img12,
    images: [img12, img13],
  },
  {
    _id: '2',
    category: 'DISPLAYS',
    name: 'TFT Display Module',
    price: 476,
    compareprice: 595,
    stockstatus: 'In Stock',
    badge: 'New',
    thumbnail: img13,
    images: [img13, img14],
  },
  {
    _id: '3',
    category: 'INDICATORS',
    name: '0.96 OLED LCD',
    price: 6300,
    compareprice: 7000,
    stockstatus: 'Out of Stock',
    badge: '',
    thumbnail: img14,
    images: [img14, img15],
  },
  {
    _id: '4',
    category: 'INDICATORS',
    name: '20x4 LCD Display',
    price: 540,
    compareprice: 600,
    stockstatus: 'In Stock',
    badge: '',
    thumbnail: img15,
    images: [img15, img12],
  },
  {
    _id: '5',
    category: 'MICROCONTROLLERS',
    name: 'Arduino UNO R3 Board',
    price: 405,
    compareprice: 450,
    stockstatus: 'In Stock',
    badge: 'Best Seller',
    thumbnail: img16,
    images: [img16, img17],
  },
  {
    _id: '6',
    category: 'SENSORS',
    name: 'Ultrasonic Distance Sensor',
    price: 120,
    compareprice: 150,
    stockstatus: 'In Stock',
    badge: '',
    thumbnail: img17,
    images: [img17, img18],
  },
  {
    _id: '7',
    category: 'MOTORS',
    name: 'Servo Motor SG90',
    price: 180,
    compareprice: 200,
    stockstatus: 'In Stock',
    badge: '',
    thumbnail: img18,
    images: [img18, img19],
  },
  {
    _id: '8',
    category: 'POWER SUPPLIES',
    name: '5V Power Supply Module',
    price: 250,
    compareprice: 300,
    stockstatus: 'In Stock',
    badge: 'Sale',
    thumbnail: img19,
    images: [img19, img16],
  },
];

const FeaturedProducts = () => {
  const navigate = useNavigate();
  const { addToCart, buyNow, toggleWishlist, isInWishlist } = useCart();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cardImageIndexMap, setCardImageIndexMap] = useState({}); // { [productId]: currentImageIndex }
  const [quickViewProduct, setQuickViewProduct] = useState(null);

  useEffect(() => {
    let isMounted = true;
    const fetchFeatured = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${API_BASE_URL}/api/product/show`);
        if (!isMounted) return;
        if (Array.isArray(res.data) && res.data.length > 0) {
          const featuredOnly = res.data.filter(
            (p) => p.is_feature === true && (p.status === 'active' || !p.status)
          );
          if (featuredOnly.length > 0) {
            setProducts(featuredOnly);
          } else {
            const activeOnly = res.data.filter((p) => p.status === 'active' || !p.status);
            setProducts(activeOnly.length > 0 ? activeOnly.slice(0, 8) : fallbackProducts);
          }
        } else {
          setProducts(fallbackProducts);
        }
      } catch {
        if (isMounted) setProducts(fallbackProducts);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetchFeatured();
    return () => {
      isMounted = false;
    };
  }, []);

  const openQuickView = (product) => {
    const prodId = product._id || product.id;
    if (prodId) {
      navigate(`/product/${prodId}`);
    }
  };

  const closeQuickView = () => {
    setQuickViewProduct(null);
  };

  // Helper to extract all images for a product
  const getProductImageList = (item) => {
    const all = [];
    if (item.thumbnail) all.push(formatImg(item.thumbnail));
    if (Array.isArray(item.images)) {
      item.images.forEach((img) => {
        const formatted = formatImg(img);
        if (formatted && !all.includes(formatted)) {
          all.push(formatted);
        }
      });
    }
    return all.length > 0 ? all : ['https://placehold.co/400x400?text=No+Image'];
  };

  return (
    <section className="featured-products-section py-5" style={{ backgroundColor: '#f8fafc' }}>
      <div className="container-fluid px-3 px-xl-5">
        {/* Section Header */}
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-end mb-4">
          <div>
            <span className="text-uppercase small fw-semibold text-orangered tracking-wider">
              HANDPICKED FOR YOU
            </span>
            <h2 className="display-6 fw-bold mt-1 mb-2" style={{ color: '#0f172a' }}>
              Featured <span className="text-orangered fst-italic">Products</span>
            </h2>
            <p className="text-muted mb-0" style={{ maxWidth: '500px' }}>
              Top-rated boards and components loved by engineers, students, and hobbyists.
            </p>
          </div>
          <div className="mt-3 mt-md-0">
            <Link
              to="/product"
              className="btn btn-outline-secondary rounded-pill px-4 py-2 btn-sm fw-semibold text-decoration-none"
            >
              All Products &rarr;
            </Link>
          </div>
        </div>

        {/* Loading Spinner */}
        {loading ? (
          <div className="d-flex justify-content-center align-items-center py-5">
            <div className="spinner-border text-primary me-2" role="status"></div>
            <span className="text-muted fw-medium">Loading featured products...</span>
          </div>
        ) : (
          /* Product Grid */
          <div className="row row-cols-1 row-cols-sm-2 row-cols-lg-4 g-4">
            {products.map((item, index) => {
              const id = item._id || item.id || index;
              const catName =
                item.category_id?.category || item.category_id?.name || item.category || 'Components';
              const title = item.name || item.title || 'Product';
              const price = item.price || 0;
              const comparePrice = item.compareprice || item.originalPrice || 0;
              const inStock =
                item.stockstatus === 'In Stock' ||
                item.inStock === true ||
                (item.stockquantity && item.stockquantity > 0);

              const allImages = getProductImageList(item);
              const currentIndex = cardImageIndexMap[id] || 0;
              const currentActiveImg = allImages[currentIndex % allImages.length];

              const discountPercent =
                comparePrice > price
                  ? Math.round(((comparePrice - price) / comparePrice) * 100)
                  : 0;

              const slidePrev = (e) => {
                e.stopPropagation();
                e.preventDefault();
                setCardImageIndexMap((prev) => ({
                  ...prev,
                  [id]: (currentIndex - 1 + allImages.length) % allImages.length,
                }));
              };

              const slideNext = (e) => {
                e.stopPropagation();
                e.preventDefault();
                setCardImageIndexMap((prev) => ({
                  ...prev,
                  [id]: (currentIndex + 1) % allImages.length,
                }));
              };

              // Flipkart style rating calculation
              const ratingScore = item.rating || (4.0 + ((Number(id.slice(-2), 16) || 42) % 10) / 10).toFixed(1);
              const ratingCount = item.reviews || (50 + ((Number(id.slice(-3), 16) || 120) % 950));

              return (
                <div key={id} className="col">
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
                        className={`flipkart-wishlist-btn ${isInWishlist(item._id || item.id || id) ? 'active' : ''}`}
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          toggleWishlist(item);
                        }}
                        title={isInWishlist(item._id || item.id || id) ? "Remove from Wishlist" : "Add to Wishlist"}
                        aria-label="Wishlist"
                      >
                        <i className={`bi ${isInWishlist(item._id || item.id || id) ? 'bi-heart-fill' : 'bi-heart text-secondary'}`}></i>
                      </button>
                    </div>

                    {/* Product Image Box */}
                    <div
                      className="flipkart-img-container cursor-pointer"
                      onClick={() => navigate(`/product/${id}`)}
                    >
                      <img
                        src={currentActiveImg}
                        alt={title}
                        className="flipkart-product-img"
                      />

                      {/* Card Image Slide Arrows (visible when multiple images) */}
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

                      {/* Multiple Gallery Image Thumbnails Selector on hover */}
                      {allImages.length > 1 && (
                        <div
                          className="d-flex gap-1 justify-content-center mt-2 position-absolute bottom-0 mb-2 py-1 px-2 rounded-pill shadow-xs"
                          style={{
                            backgroundColor: 'rgba(255,255,255,0.9)',
                            backdropFilter: 'blur(4px)',
                            zIndex: 2,
                          }}
                        >
                          {allImages.slice(0, 4).map((imgUrl, imgIdx) => (
                            <button
                              key={imgIdx}
                              type="button"
                              className="btn p-0 border rounded-circle"
                              style={{
                                width: '16px',
                                height: '16px',
                                overflow: 'hidden',
                                borderColor: currentIndex === imgIdx ? '#2563eb' : '#cbd5e1',
                                borderWidth: currentIndex === imgIdx ? '2px' : '1px',
                                transform: currentIndex === imgIdx ? 'scale(1.2)' : 'scale(1)',
                              }}
                              onMouseEnter={() => setCardImageIndexMap((prev) => ({ ...prev, [id]: imgIdx }))}
                              onClick={(e) => {
                                e.stopPropagation();
                                setCardImageIndexMap((prev) => ({ ...prev, [id]: imgIdx }));
                              }}
                            >
                              <img src={imgUrl} alt="thumb" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            </button>
                          ))}
                        </div>
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
                        to={`/product/${id}`}
                        className="flipkart-card-title text-decoration-none"
                        title={title}
                      >
                        {title}
                      </Link>

                      {/* Rating & Review Counter */}
                      <div className="d-flex align-items-center gap-2 mb-2">
                        <span className="flipkart-rating-pill">
                          {ratingScore} <i className="bi bi-star-fill"></i>
                        </span>
                        <span className="flipkart-reviews-count">
                          ({ratingCount.toLocaleString('en-IN')})
                        </span>
                      </div>

                      {/* Price Section */}
                      <div className="flipkart-price-row">
                        <span className="flipkart-current-price">
                          ₹{price.toLocaleString('en-IN')}
                        </span>
                        {comparePrice > price && (
                          <span className="flipkart-mrp-price">
                            ₹{comparePrice.toLocaleString('en-IN')}
                          </span>
                        )}
                        {discountPercent > 0 && (
                          <span className="flipkart-discount-badge">
                            {discountPercent}% off
                          </span>
                        )}
                      </div>

                      {/* Delivery & Bank Offer badges */}
                      <div className="flipkart-delivery-info">
                        <i className="bi bi-truck text-primary"></i>
                        <span>{item.isfreedelivery !== false ? 'Free delivery by Tomorrow' : 'Standard Delivery Available'}</span>
                      </div>

                      <div className="flipkart-bank-offer">
                        <i className="bi bi-tag-fill"></i>
                        <span>Bank Offer: 5% Cashback on UPI / Cards</span>
                      </div>

                      {/* Flipkart Dual Action Buttons */}
                      <div className="flipkart-action-btns">
                        <button
                          type="button"
                          className="btn-flipkart-cart"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            addToCart(item, 1);
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

        {/* LUXURY PROFESSIONAL QUICK VIEW MODAL */}
        {quickViewProduct && (
          <QuickViewModal
            product={quickViewProduct}
            onClose={closeQuickView}
          />
        )}
      </div>
    </section>
  );
};

export default FeaturedProducts;
