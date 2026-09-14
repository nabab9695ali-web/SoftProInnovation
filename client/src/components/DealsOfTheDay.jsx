import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useCart } from '../context/CartContext';
import { API_BASE_URL } from '../config/api';
import { formatImg } from '../utils/imageUrl';

const DealsOfTheDay = () => {
  const navigate = useNavigate();
  const { addToCart, buyNow, toggleWishlist, isInWishlist } = useCart();
  const [dealProducts, setDealProducts] = useState([]);
  const [timeLeft, setTimeLeft] = useState({ hours: 8, minutes: 24, seconds: 16 });

  // Live Flipkart Flash Countdown Clock
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        } else if (prev.hours > 0) {
          return { ...prev, hours: prev.hours - 1, minutes: 59, seconds: 59 };
        }
        return { hours: 11, minutes: 59, seconds: 59 }; // Reset cycle
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Fetch deal products from catalog
  useEffect(() => {
    const fetchDeals = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/api/product/show`);
        if (Array.isArray(res.data) && res.data.length > 0) {
          // Select products with high discount or featured
          const withDiscount = res.data
            .filter((p) => Number(p.compareprice) > Number(p.price))
            .slice(0, 4);
          setDealProducts(withDiscount.length > 0 ? withDiscount : res.data.slice(0, 4));
        }
      } catch (err) {
        console.error('Failed to load flash deals:', err);
      }
    };
    fetchDeals();
  }, []);

  if (dealProducts.length === 0) return null;

  return (
    <section className="deals-of-the-day-section py-4 my-2" style={{ background: '#f1f5f9' }}>
      <div className="container-fluid px-3 px-xl-5">
        <div className="bg-white rounded-3 p-3 p-md-4 shadow-sm border">
          {/* Header Strip */}
          <div className="d-flex flex-column flex-sm-row align-items-start align-items-sm-center justify-content-between gap-2 pb-3 mb-3 border-bottom">
            <div className="d-flex align-items-center gap-3 flex-wrap">
              <h3 className="fw-bold mb-0 text-dark d-flex align-items-center gap-2" style={{ fontSize: '1.35rem' }}>
                <span className="badge bg-warning text-dark p-1.5 rounded-2">
                  <i className="bi bi-lightning-charge-fill fs-5"></i>
                </span>
                <span>Deals of the Day</span>
              </h3>

              {/* Countdown Clock */}
              <div className="d-flex align-items-center gap-1.5 px-3 py-1 bg-light rounded-pill border">
                <i className="bi bi-clock-history text-danger"></i>
                <small className="text-muted fw-semibold" style={{ fontSize: '12px' }}>Ends in:</small>
                <span className="font-monospace fw-bold text-danger" style={{ fontSize: '13px' }}>
                  {String(timeLeft.hours).padStart(2, '0')}h : {String(timeLeft.minutes).padStart(2, '0')}m : {String(timeLeft.seconds).padStart(2, '0')}s
                </span>
              </div>
            </div>

            <Link
              to="/Product"
              className="btn btn-primary btn-sm fw-bold px-3 py-1.5 rounded-pill d-inline-flex align-items-center gap-1 shadow-xs"
              style={{ fontSize: '13px' }}
            >
              <span>VIEW ALL DEALS</span>
              <i className="bi bi-arrow-right"></i>
            </Link>
          </div>

          {/* Deals Products Row */}
          <div className="row g-3">
            {dealProducts.map((item) => {
              const pId = item._id || item.id;
              const isFav = isInWishlist(pId);
              const pImg = formatImg(item.thumbnail);
              const pPrice = Number(item.price) || 0;
              const pComparePrice = Number(item.compareprice) || 0;
              const discountPercent = pComparePrice > pPrice ? Math.round(((pComparePrice - pPrice) / pComparePrice) * 100) : 15;

              return (
                <div key={pId} className="col-12 col-sm-6 col-md-3">
                  <div className="flipkart-product-card p-3 h-100 d-flex flex-column shadow-xs border">
                    {/* Floating Badges */}
                    <div className="d-flex align-items-center justify-content-between position-absolute top-0 start-0 end-0 p-2.5 z-3">
                      <span className="badge bg-danger text-white fw-bold px-2 py-1 rounded-1 shadow-xs" style={{ fontSize: '11px' }}>
                        <i className="bi bi-fire me-1"></i>{discountPercent}% OFF
                      </span>
                      <button
                        type="button"
                        className={`flipkart-wishlist-btn ${isFav ? 'active' : ''}`}
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          toggleWishlist(item);
                        }}
                        title={isFav ? 'Remove from Wishlist' : 'Add to Wishlist'}
                      >
                        <i className={`bi ${isFav ? 'bi-heart-fill' : 'bi-heart text-secondary'}`}></i>
                      </button>
                    </div>

                    {/* Image */}
                    <div
                      className="flipkart-img-container cursor-pointer mb-2"
                      onClick={() => navigate(`/product/${pId}`)}
                    >
                      <img src={pImg} alt={item.name} className="flipkart-product-img" />
                    </div>

                    {/* Details */}
                    <div className="d-flex flex-column flex-grow-1 mt-1 text-start">
                      <div className="text-muted text-uppercase fw-semibold" style={{ fontSize: '10.5px' }}>
                        {item.category || item.category_id?.category || 'Electronics'}
                      </div>
                      <Link
                        to={`/product/${pId}`}
                        className="flipkart-card-title text-decoration-none fw-bold text-dark mt-1"
                        style={{ fontSize: '13px', lineHeight: '1.4' }}
                      >
                        {item.name}
                      </Link>

                      <div className="d-flex align-items-center gap-1.5 my-1.5">
                        <span className="flipkart-rating-pill" style={{ fontSize: '11px', padding: '2px 6px' }}>
                          4.8 <i className="bi bi-star-fill"></i>
                        </span>
                        <span className="text-muted small" style={{ fontSize: '11px' }}>
                          Flipkart Assured
                        </span>
                      </div>

                      {/* Pricing */}
                      <div className="d-flex align-items-baseline gap-2 mt-auto pt-2">
                        <span className="flipkart-price fs-6">₹{pPrice.toLocaleString('en-IN')}</span>
                        {pComparePrice > pPrice && (
                          <span className="flipkart-compare-price" style={{ fontSize: '12px' }}>
                            ₹{pComparePrice.toLocaleString('en-IN')}
                          </span>
                        )}
                      </div>

                      {/* Buy Action */}
                      <div className="mt-2.5">
                        <button
                          type="button"
                          className="btn-flipkart-buy w-100 py-2 d-flex align-items-center justify-content-center gap-1.5"
                          style={{ fontSize: '12.5px', borderRadius: '6px' }}
                          onClick={() => buyNow(item, 1, navigate)}
                        >
                          <i className="bi bi-lightning-charge-fill"></i>
                          <span>Grab Deal</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

export default DealsOfTheDay;
