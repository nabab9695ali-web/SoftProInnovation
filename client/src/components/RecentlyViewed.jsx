import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { formatImg } from '../utils/imageUrl';

const RecentlyViewed = () => {
  const [items, setItems] = useState([]);
  const { addToCart } = useCart();
  const [addedId, setAddedId] = useState(null);

  const loadRecentlyViewed = () => {
    try {
      const stored = localStorage.getItem('recentlyViewed');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setItems(parsed);
        } else {
          setItems([]);
        }
      } else {
        setItems([]);
      }
    } catch {
      setItems([]);
    }
  };

  useEffect(() => {
    loadRecentlyViewed();
    window.addEventListener('storage', loadRecentlyViewed);
    return () => window.removeEventListener('storage', loadRecentlyViewed);
  }, []);

  const handleClearHistory = () => {
    localStorage.removeItem('recentlyViewed');
    setItems([]);
  };

  const handleQuickAdd = (product) => {
    addToCart(product, 1);
    setAddedId(product._id || product.id);
    setTimeout(() => setAddedId(null), 1800);
  };

  if (!items || items.length === 0) {
    return null; // Gracefully hidden until customer browses products
  }

  return (
    <section className="py-5 bg-white border-top border-bottom">
      <div className="container">
        {/* Section Header */}
        <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4">
          <div>
            <div className="d-inline-flex align-items-center gap-1.5 px-2.5 py-1 rounded-pill bg-primary-subtle text-primary fw-bold small mb-1" style={{ fontSize: '11.5px' }}>
              <i className="bi bi-clock-history"></i>
              <span>YOUR BROWSING HISTORY</span>
            </div>
            <h3 className="fw-bold text-dark mb-0" style={{ letterSpacing: '-0.3px' }}>
              Recently Viewed Products
            </h3>
          </div>

          <div className="d-flex align-items-center gap-2">
            <button
              type="button"
              className="btn btn-sm btn-outline-secondary rounded-pill px-3 py-1.5 fw-semibold d-flex align-items-center gap-1.5"
              style={{ fontSize: '12.5px' }}
              onClick={handleClearHistory}
              title="Clear recently viewed history"
            >
              <i className="bi bi-trash3"></i>
              <span>Clear History</span>
            </button>
            <Link
              to="/product"
              className="btn btn-sm btn-primary rounded-pill px-3 py-1.5 fw-bold d-flex align-items-center gap-1.5"
              style={{ fontSize: '12.5px', background: '#2563eb' }}
            >
              <span>Explore All</span>
              <i className="bi bi-arrow-right"></i>
            </Link>
          </div>
        </div>

        {/* Horizontal Responsive Grid of Viewed Items */}
        <div className="row row-cols-2 row-cols-sm-3 row-cols-md-4 row-cols-lg-6 g-3 g-md-4">
          {items.slice(0, 6).map((item) => {
            const price = Number(item.price || 0);
            const comparePrice = Number(item.compareprice || 0);
            const discount = comparePrice > price ? Math.round(((comparePrice - price) / comparePrice) * 100) : 0;
            const imgSrc = formatImg(item.thumbnail);
            const isAdded = addedId === (item._id || item.id);

            return (
              <div key={item._id || item.id} className="col">
                <div className="card h-100 border rounded-4 overflow-hidden shadow-2xs transition-all hover-shadow-md position-relative">
                  {discount > 0 && (
                    <span
                      className="position-absolute top-2 start-2 badge bg-danger text-white fw-bold shadow-xs z-2"
                      style={{ fontSize: '10px', borderRadius: '4px' }}
                    >
                      {discount}% OFF
                    </span>
                  )}

                  <div className="bg-light p-3 text-center position-relative" style={{ height: '140px' }}>
                    <Link to={`/product/${item._id || item.id}`}>
                      <img
                        src={imgSrc}
                        alt={item.name}
                        className="w-100 h-100 object-fit-contain"
                        loading="lazy"
                      />
                    </Link>
                  </div>

                  <div className="card-body p-2.5 p-md-3 d-flex flex-column">
                    <span className="text-muted text-uppercase fw-semibold mb-1" style={{ fontSize: '10.5px' }}>
                      {item.category || 'Electronics'}
                    </span>

                    <Link
                      to={`/product/${item._id || item.id}`}
                      className="text-decoration-none text-dark fw-bold mb-2"
                      style={{
                        fontSize: '12.5px',
                        lineHeight: '1.3',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                        minHeight: '32px'
                      }}
                      title={item.name}
                    >
                      {item.name}
                    </Link>

                    <div className="d-flex align-items-center gap-1 mb-2">
                      <span className="badge bg-success text-white px-1.5 py-0.5 rounded fw-bold" style={{ fontSize: '10px' }}>
                        {item.rating || '4.8'} <i className="bi bi-star-fill" style={{ fontSize: '7px' }}></i>
                      </span>
                      <span className="text-muted" style={{ fontSize: '10.5px' }}>
                        ({item.reviews || 15})
                      </span>
                    </div>

                    <div className="mt-auto pt-2 border-top d-flex align-items-center justify-content-between">
                      <div>
                        <div className="fw-bold text-dark" style={{ fontSize: '14px' }}>
                          ₹{price.toLocaleString('en-IN')}
                        </div>
                        {comparePrice > price && (
                          <div className="text-muted text-decoration-line-through" style={{ fontSize: '11px' }}>
                            ₹{comparePrice.toLocaleString('en-IN')}
                          </div>
                        )}
                      </div>

                      <button
                        type="button"
                        className={`btn btn-sm ${isAdded ? 'btn-success text-white' : 'btn-outline-primary'} rounded-circle p-0 d-flex align-items-center justify-content-center`}
                        style={{ width: '32px', height: '32px', flexShrink: 0 }}
                        onClick={() => handleQuickAdd(item)}
                        title={isAdded ? 'Added to Cart' : 'Add to Cart'}
                      >
                        <i className={`bi ${isAdded ? 'bi-check-lg' : 'bi-cart-plus'} fs-6`}></i>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default RecentlyViewed;
