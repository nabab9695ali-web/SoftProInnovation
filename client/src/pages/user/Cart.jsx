import { Link, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import axios from 'axios';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import { useCart } from '../../context/CartContext';
import { formatImg } from '../../utils/imageUrl';
import { API_BASE_URL } from '../../config/api';

const Cart = () => {
  const navigate = useNavigate();
  const { cartItems, removeFromCart, updateQuantity, clearCart, getCartTotal, getCartCount, addToWishlist } = useCart();
  const [deliveryAddress, setDeliveryAddress] = useState(null);

  // Interactive Coupon State
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponError, setCouponError] = useState('');
  const [couponSuccess, setCouponSuccess] = useState('');

  const subtotal = getCartTotal();
  const freeShippingThreshold = 499;
  const isFreeShipping = subtotal >= freeShippingThreshold || subtotal === 0;
  const shipping = isFreeShipping ? 0 : 50;

  // Coupon discount calculation
  let couponDiscount = 0;
  if (appliedCoupon) {
    if (appliedCoupon.type === 'flat') {
      couponDiscount = Math.min(appliedCoupon.value, subtotal);
    } else if (appliedCoupon.type === 'percent') {
      couponDiscount = Math.round((subtotal * appliedCoupon.value) / 100);
    }
  }

  const grandTotal = Math.max(0, subtotal - couponDiscount + shipping);
  const totalMrp = cartItems.reduce(
    (total, item) => total + (Number(item.compareprice) || Number(item.price) || 0) * (Number(item.quantity) || 1),
    0
  );
  const totalSavings = Math.max(totalMrp - subtotal + couponDiscount, 0);

  const shippingMeterPercent = Math.min(100, Math.round((subtotal / freeShippingThreshold) * 100));

  // Load user delivery address
  useEffect(() => {
    const loadDeliveryAddress = async () => {
      const token = localStorage.getItem('token');
      let storedUser;
      try {
        storedUser = JSON.parse(localStorage.getItem('user') || 'null');
      } catch {
        storedUser = null;
      }

      let userId = storedUser?._id || storedUser?.id;
      if (!userId && token) {
        try {
          const currentUser = await axios.get(`${API_BASE_URL}/api/user/current-user`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          userId = currentUser.data?.user?._id;
        } catch {
          userId = null;
        }
      }
      if (!userId) return;

      try {
        const { data } = await axios.get(`${API_BASE_URL}/api/address/user/${userId}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {}
        });
        setDeliveryAddress(data?.addresses?.find((item) => item.isdefault === 'yes') || data?.addresses?.[0] || data?.[0] || null);
      } catch (error) {
        console.error('Failed to load cart delivery address:', error.response?.data || error.message);
        setDeliveryAddress(null);
      }
    };

    loadDeliveryAddress();
  }, []);

  const handleApplyCoupon = (codeToApply) => {
    const code = (codeToApply || couponCode || '').trim().toUpperCase();
    setCouponError('');
    setCouponSuccess('');

    if (!code) {
      setCouponError('Please enter a valid coupon code.');
      return;
    }

    if (code === 'MAKER50') {
      if (subtotal < 300) {
        setCouponError('MAKER50 requires a minimum order of ₹300.');
        return;
      }
      setAppliedCoupon({ code: 'MAKER50', type: 'flat', value: 50 });
      setCouponSuccess('Coupon MAKER50 applied! You saved ₹50.');
      setCouponCode('MAKER50');
    } else if (code === 'INVENT10') {
      if (subtotal < 500) {
        setCouponError('INVENT10 requires a minimum order of ₹500.');
        return;
      }
      const disc = Math.round((subtotal * 10) / 100);
      setAppliedCoupon({ code: 'INVENT10', type: 'percent', value: 10 });
      setCouponSuccess(`Coupon INVENT10 applied! 10% Off (Saved ₹${disc}).`);
      setCouponCode('INVENT10');
    } else {
      setCouponError('Invalid coupon code. Try MAKER50 or INVENT10.');
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode('');
    setCouponSuccess('');
    setCouponError('');
  };

  const handleProceedToCheckout = () => {
    if (!deliveryAddress) {
      navigate('/addresses', { state: { returnTo: '/payment' } });
    } else {
      navigate('/payment');
    }
  };

  const handleSaveForLater = (item) => {
    if (addToWishlist) {
      addToWishlist(item);
    }
    const pId = item._id || item.id;
    removeFromCart(pId);
  };

  return (
    <>
      <Header />

      {/* Cart Breadcrumb & Header Banner */}
      <section className="cart-hero py-3 bg-white border-bottom">
        <div className="container">
          <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-2">
            <div>
              <div className="d-flex align-items-center gap-2 mb-1" style={{ fontSize: '13px' }}>
                <Link to="/" className="text-decoration-none text-muted">Home</Link>
                <span className="text-muted">&rsaquo;</span>
                <Link to="/Product" className="text-decoration-none text-muted">Electronics Shop</Link>
                <span className="text-muted">&rsaquo;</span>
                <span className="text-dark fw-bold">Shopping Cart</span>
              </div>
              <h2 className="fw-bold mb-0 text-dark" style={{ fontSize: '1.75rem' }}>
                Shopping <span style={{ color: '#2563eb' }}>Cart</span>
              </h2>
            </div>
            {cartItems.length > 0 && (
              <span className="badge bg-primary-subtle text-primary border border-primary-subtle px-3 py-2 rounded-pill fs-6 fw-bold align-self-start align-self-md-auto">
                <i className="bi bi-cart3 me-1.5"></i>
                {getCartCount()} {getCartCount() === 1 ? 'Item' : 'Items'}
              </span>
            )}
          </div>
        </div>
      </section>

      {/* Main Cart Content */}
      <section className="cart-page py-4" style={{ minHeight: '60vh', backgroundColor: '#f8fafc' }}>
        <div className="container">
          {!localStorage.getItem('token') ? (
            /* Unauthenticated View */
            <div className="card border-0 shadow-sm rounded-4 p-5 text-center mx-auto" style={{ maxWidth: '560px', backgroundColor: '#fff' }}>
              <div
                className="rounded-circle d-flex align-items-center justify-content-center mx-auto mb-4 shadow-xs"
                style={{ width: '90px', height: '90px', backgroundColor: '#eff6ff', color: '#1d4ed8' }}
              >
                <i className="bi bi-person-lock fs-1"></i>
              </div>
              <h4 className="fw-bold text-dark mb-2">Please Log In to View Cart</h4>
              <p className="text-muted mb-4" style={{ fontSize: '14px' }}>
                Sign in to your account to view your saved items, apply exclusive maker discounts, and complete express checkout.
              </p>
              <Link
                to="/login"
                className="btn py-2.5 px-4 fw-bold rounded-pill text-white shadow-sm align-self-center text-decoration-none"
                style={{ backgroundColor: '#2563eb', border: 'none' }}
              >
                <i className="bi bi-box-arrow-in-right me-1.5"></i> Log In to Account
              </Link>
            </div>
          ) : cartItems.length === 0 ? (
            /* Empty Cart View */
            <div className="card border-0 shadow-sm rounded-4 p-5 text-center mx-auto" style={{ maxWidth: '560px', backgroundColor: '#fff' }}>
              <div
                className="rounded-circle d-flex align-items-center justify-content-center mx-auto mb-4 shadow-xs"
                style={{ width: '90px', height: '90px', backgroundColor: '#fff7ed', color: '#ea580c' }}
              >
                <i className="bi bi-cart-x fs-1"></i>
              </div>
              <h4 className="fw-bold text-dark mb-2">Your Shopping Cart is Empty</h4>
              <p className="text-muted mb-4" style={{ fontSize: '14px' }}>
                You haven't added any microcontrollers, sensors, or electronics kits yet. Explore our premier catalog!
              </p>
              <Link
                to="/Product"
                className="btn py-2.5 px-4 fw-bold rounded-pill text-white shadow-sm align-self-center text-decoration-none"
                style={{ backgroundColor: '#fb641b', border: 'none' }}
              >
                <i className="bi bi-bag-plus me-1.5"></i> Explore Electronics Catalog
              </Link>
            </div>
          ) : (
            /* Filled Cart View */
            <div className="row g-4">
              {/* Left Column: Cart Items List & Address */}
              <div className="col-12 col-lg-8">
                {/* 1. Delivery Address Card */}
                {deliveryAddress ? (
                  <div className="bg-white border rounded-4 shadow-sm p-3 px-4 mb-3 d-flex flex-wrap align-items-center justify-content-between gap-3">
                    <div className="d-flex align-items-start gap-3">
                      <div
                        className="rounded-circle d-flex align-items-center justify-content-center flex-shrink-0 text-white shadow-xs"
                        style={{ width: '42px', height: '42px', background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)' }}
                      >
                        <i className="bi bi-geo-alt-fill fs-5"></i>
                      </div>
                      <div>
                        <div className="d-flex align-items-center gap-2 mb-1 flex-wrap">
                          <span className="text-muted small fw-bold">Deliver to:</span>
                          <strong className="text-dark">{deliveryAddress.name}</strong>
                          <span className="badge bg-primary-subtle text-primary border border-primary-subtle px-2 py-0.5" style={{ fontSize: '11px' }}>
                            {deliveryAddress.addressType || 'HOME'}
                          </span>
                        </div>
                        <div className="small text-secondary" style={{ lineHeight: '1.5' }}>
                          {deliveryAddress.address || deliveryAddress.Address}, {deliveryAddress.locality || deliveryAddress.localiy}, {deliveryAddress.city}, {deliveryAddress.state} - <strong>{deliveryAddress.pincode}</strong>
                        </div>
                      </div>
                    </div>
                    <button
                      type="button"
                      className="btn btn-outline-primary btn-sm px-3.5 py-1.5 fw-bold rounded-3 shadow-xs"
                      onClick={() => navigate('/addresses')}
                    >
                      Change Address
                    </button>
                  </div>
                ) : (
                  <div className="bg-white border rounded-4 shadow-sm p-3 px-4 mb-3 d-flex align-items-center justify-content-between gap-3">
                    <div className="d-flex align-items-center gap-3">
                      <div
                        className="rounded-circle d-flex align-items-center justify-content-center flex-shrink-0 text-white"
                        style={{ width: '40px', height: '40px', backgroundColor: '#e2e8f0', color: '#64748b' }}
                      >
                        <i className="bi bi-geo-alt text-dark fs-5"></i>
                      </div>
                      <div>
                        <strong className="d-block text-dark">Add a Delivery Address</strong>
                        <small className="text-muted">Choose where you want your components delivered.</small>
                      </div>
                    </div>
                    <button
                      type="button"
                      className="btn btn-primary btn-sm px-4 fw-bold rounded-3"
                      onClick={() => navigate('/addresses', { state: { openForm: true } })}
                    >
                      Add Address
                    </button>
                  </div>
                )}

                {/* 2. Interactive Free Shipping Progress Meter */}
                <div className="cart-shipping-meter shadow-sm">
                  <div className="d-flex align-items-center justify-content-between mb-1">
                    <div className="d-flex align-items-center gap-2">
                      <i className={`bi ${isFreeShipping ? 'bi-check-circle-fill text-success' : 'bi-truck text-primary'} fs-5`}></i>
                      <span className="small fw-bold text-dark">
                        {isFreeShipping ? (
                          <span className="text-success">🎉 Congratulations! You unlocked FREE Express Delivery across India!</span>
                        ) : (
                          <span>Add <strong className="text-primary">₹{(freeShippingThreshold - subtotal).toLocaleString('en-IN')}</strong> more for <strong className="text-success">FREE Shipping</strong></span>
                        )}
                      </span>
                    </div>
                    <span className="badge bg-white text-dark border small fw-bold">{shippingMeterPercent}%</span>
                  </div>
                  <div className="cart-meter-bar">
                    <div className="cart-meter-fill" style={{ width: `${shippingMeterPercent}%` }}></div>
                  </div>
                </div>

                {/* 3. Cart Items Container Header */}
                <div className="d-flex align-items-center justify-content-between mb-3 px-1">
                  <h5 className="fw-bold text-dark mb-0 d-flex align-items-center gap-2">
                    <i className="bi bi-box-seam-fill text-primary"></i>
                    <span>Items in Your Cart ({getCartCount()})</span>
                  </h5>
                  <button
                    type="button"
                    className="btn btn-sm btn-outline-danger d-flex align-items-center gap-1.5 rounded-pill px-3 py-1 fw-semibold"
                    onClick={clearCart}
                    style={{ fontSize: '12px' }}
                  >
                    <i className="bi bi-trash"></i>
                    <span>Clear Cart</span>
                  </button>
                </div>

                {/* 4. Product Cards List */}
                <div className="d-flex flex-column">
                  {cartItems.map((item) => {
                    const pId = item._id || item.id;
                    const itemPrice = Number(item.price) || 0;
                    const itemQty = Number(item.quantity) || 1;
                    const lineTotal = itemPrice * itemQty;
                    const mrp = Number(item.compareprice) || itemPrice;
                    const discount = mrp > itemPrice ? Math.round(((mrp - itemPrice) / mrp) * 100) : 0;

                    return (
                      <div key={pId} className="cart-item-card-unique shadow-xs">
                        <div className="d-flex flex-column flex-sm-row align-items-start align-items-sm-center justify-content-between gap-3">
                          {/* Thumbnail and Info */}
                          <div className="d-flex align-items-start gap-3 flex-grow-1">
                            <div className="cart-item-thumb-box shadow-xs">
                              <img src={formatImg(item.thumbnail)} alt={item.name} />
                            </div>

                            <div>
                              <div className="d-flex align-items-center gap-2 mb-1 flex-wrap">
                                <span className="badge bg-light text-secondary border px-2 py-0.5" style={{ fontSize: '11px' }}>
                                  {item.category || 'Electronics'}
                                </span>
                                <span className="flipkart-assured-badge">
                                  <i className="bi bi-shield-fill-check"></i> Assured
                                </span>
                              </div>

                              <h6 className="fw-bold text-dark mb-1" style={{ fontSize: '15px', lineHeight: '1.4' }}>
                                <Link to={`/product/${pId}`} className="text-dark text-decoration-none hover-primary">
                                  {item.name}
                                </Link>
                              </h6>

                              {/* Delivery Guarantee Tag */}
                              <div className="small text-success fw-semibold mb-2">
                                <i className="bi bi-truck me-1"></i>
                                <span>Delivery by Tomorrow, 11:00 PM</span>
                                {isFreeShipping && <span className="text-muted ms-1">| Free</span>}
                              </div>

                              {/* Price Row */}
                              <div className="d-flex align-items-baseline gap-2 flex-wrap">
                                <span className="fs-5 fw-bold text-dark">
                                  ₹{itemPrice.toLocaleString('en-IN')}
                                </span>
                                {mrp > itemPrice && (
                                  <span className="text-muted text-decoration-line-through small">
                                    ₹{mrp.toLocaleString('en-IN')}
                                  </span>
                                )}
                                {discount > 0 && (
                                  <span className="badge bg-success-subtle text-success border border-success-subtle fw-bold" style={{ fontSize: '11px' }}>
                                    {discount}% OFF
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Stepper and Line Total */}
                          <div className="d-flex flex-row flex-sm-column align-items-center align-items-sm-end justify-content-between w-100 w-sm-auto pt-2 pt-sm-0 border-top border-top-sm-0">
                            <div className="text-sm-end mb-sm-2">
                              <div className="text-muted small" style={{ fontSize: '11px' }}>Subtotal</div>
                              <strong className="fs-5 text-dark" style={{ color: '#0f172a' }}>
                                ₹{lineTotal.toLocaleString('en-IN')}
                              </strong>
                            </div>

                            {/* Tactile Quantity Stepper */}
                            <div className="qty-stepper-unique shadow-xs">
                              <button
                                type="button"
                                className="qty-btn-unique"
                                onClick={() => updateQuantity(pId, itemQty - 1)}
                                disabled={itemQty <= 1}
                                title="Decrease quantity"
                              >
                                <i className="bi bi-dash"></i>
                              </button>
                              <span className="qty-val-unique">{itemQty}</span>
                              <button
                                type="button"
                                className="qty-btn-unique"
                                onClick={() => updateQuantity(pId, itemQty + 1)}
                                title="Increase quantity"
                              >
                                <i className="bi bi-plus"></i>
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* Action Row: Save for Later & Remove */}
                        <div className="pt-3 mt-3 border-top d-flex align-items-center justify-content-between">
                          <button
                            type="button"
                            className="btn btn-sm btn-link text-decoration-none p-0 text-secondary fw-semibold d-flex align-items-center gap-1"
                            onClick={() => handleSaveForLater(item)}
                            style={{ fontSize: '12.5px' }}
                          >
                            <i className="bi bi-bookmark-heart text-danger"></i>
                            <span>Save for Later</span>
                          </button>

                          <button
                            type="button"
                            className="btn btn-sm btn-link text-decoration-none p-0 text-danger fw-semibold d-flex align-items-center gap-1"
                            onClick={() => removeFromCart(pId)}
                            style={{ fontSize: '12.5px' }}
                          >
                            <i className="bi bi-trash3"></i>
                            <span>Remove Item</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Right Column: Order Summary & Interactive Place Order */}
              <div className="col-12 col-lg-4">
                <div className="card border-0 shadow-sm p-4 bg-white rounded-4 sticky-top" style={{ top: '80px', zIndex: 10 }}>
                  {/* 1. Interactive Coupon Box */}
                  <div className="cart-coupon-card">
                    <div className="d-flex align-items-center justify-content-between mb-2">
                      <span className="fw-bold text-dark small">
                        <i className="bi bi-tag-fill text-primary me-1.5"></i>Apply Promo Code
                      </span>
                      {appliedCoupon && (
                        <button
                          type="button"
                          className="btn btn-link btn-sm text-danger p-0 text-decoration-none fw-bold"
                          style={{ fontSize: '11px' }}
                          onClick={handleRemoveCoupon}
                        >
                          Remove
                        </button>
                      )}
                    </div>

                    <div className="input-group input-group-sm mb-2">
                      <input
                        type="text"
                        className="form-control text-uppercase fw-bold"
                        placeholder="Enter Coupon Code"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value)}
                        disabled={Boolean(appliedCoupon)}
                      />
                      <button
                        type="button"
                        className="btn btn-outline-primary fw-bold px-3"
                        onClick={() => handleApplyCoupon(couponCode)}
                        disabled={Boolean(appliedCoupon)}
                      >
                        {appliedCoupon ? 'Applied' : 'Apply'}
                      </button>
                    </div>

                    {couponSuccess && (
                      <div className="text-success small fw-semibold mb-1" style={{ fontSize: '11.5px' }}>
                        <i className="bi bi-check-circle-fill me-1"></i>
                        {couponSuccess}
                      </div>
                    )}
                    {couponError && (
                      <div className="text-danger small fw-semibold mb-1" style={{ fontSize: '11.5px' }}>
                        <i className="bi bi-exclamation-circle-fill me-1"></i>
                        {couponError}
                      </div>
                    )}

                    {/* Quick-Apply Coupon Chips */}
                    {!appliedCoupon && (
                      <div className="d-flex flex-wrap gap-1.5 mt-2">
                        <button
                          type="button"
                          className="badge bg-light text-primary border border-primary-subtle p-1.5 text-decoration-none"
                          style={{ cursor: 'pointer', fontSize: '10.5px' }}
                          onClick={() => handleApplyCoupon('MAKER50')}
                        >
                          🏷️ MAKER50 (Flat ₹50)
                        </button>
                        <button
                          type="button"
                          className="badge bg-light text-success border border-success-subtle p-1.5 text-decoration-none"
                          style={{ cursor: 'pointer', fontSize: '10.5px' }}
                          onClick={() => handleApplyCoupon('INVENT10')}
                        >
                          🔥 INVENT10 (10% Off)
                        </button>
                      </div>
                    )}
                  </div>

                  {/* 2. Price Breakdown */}
                  <h6 className="fw-bold text-dark mb-3 pb-2 border-bottom d-flex align-items-center gap-1.5">
                    <i className="bi bi-receipt text-primary"></i>
                    <span>PRICE DETAILS ({getCartCount()} Items)</span>
                  </h6>

                  <div className="d-flex justify-content-between mb-2.5" style={{ fontSize: '14px' }}>
                    <span className="text-muted">Total MRP (incl. taxes)</span>
                    <span className="fw-semibold text-dark">₹{totalMrp.toLocaleString('en-IN')}</span>
                  </div>

                  <div className="d-flex justify-content-between mb-2.5" style={{ fontSize: '14px' }}>
                    <span className="text-muted">Product Discount</span>
                    <span className="fw-bold text-success">-₹{(totalMrp - subtotal).toLocaleString('en-IN')}</span>
                  </div>

                  {appliedCoupon && (
                    <div className="d-flex justify-content-between mb-2.5" style={{ fontSize: '14px' }}>
                      <span className="text-muted">Coupon Savings ({appliedCoupon.code})</span>
                      <span className="fw-bold text-success">-₹{couponDiscount.toLocaleString('en-IN')}</span>
                    </div>
                  )}

                  <div className="d-flex justify-content-between mb-2.5" style={{ fontSize: '14px' }}>
                    <span className="text-muted">Delivery Charges</span>
                    <span>
                      {shipping === 0 ? (
                        <span className="badge bg-success-subtle text-success border border-success-subtle fw-bold">FREE</span>
                      ) : (
                        <span className="fw-semibold text-dark">₹{shipping}</span>
                      )}
                    </span>
                  </div>

                  <hr className="my-3" />

                  <div className="d-flex justify-content-between align-items-baseline mb-3">
                    <span className="fw-bold text-dark fs-6">Total Payable</span>
                    <span className="fw-bold fs-4" style={{ color: '#0f172a' }}>
                      ₹{grandTotal.toLocaleString('en-IN')}
                    </span>
                  </div>

                  {totalSavings > 0 && (
                    <div
                      className="rounded-3 p-2.5 text-center text-success mb-3 fw-bold"
                      style={{ backgroundColor: '#ecfdf5', border: '1px dashed #10b981', fontSize: '12.5px' }}
                    >
                      <i className="bi bi-stars me-1 text-warning"></i>
                      You will save ₹{totalSavings.toLocaleString('en-IN')} on this order!
                    </div>
                  )}

                  {/* 3. UNIQUE & INTERACTIVE PLACE ORDER BUTTON */}
                  <button
                    type="button"
                    className="btn btn-place-order-unique mb-3"
                    onClick={handleProceedToCheckout}
                    title="Proceed to Express Checkout"
                  >
                    <span className="d-flex align-items-center gap-2">
                      <i className="bi bi-lightning-charge-fill text-warning fs-5"></i>
                      <span>PLACE ORDER</span>
                    </span>
                    <span className="d-flex align-items-center gap-2">
                      <span>₹{grandTotal.toLocaleString('en-IN')}</span>
                      <i className="bi bi-arrow-right-circle-fill fs-5 place-order-arrow"></i>
                    </span>
                  </button>

                  {/* Trust Highlights */}
                  <div className="pt-3 border-top text-muted small">
                    <div className="d-flex align-items-center gap-2 mb-2">
                      <i className="bi bi-shield-check text-success fs-5"></i>
                      <span>Safe &amp; Secure 256-Bit SSL Checkout</span>
                    </div>
                    <div className="d-flex align-items-center gap-2 mb-2">
                      <i className="bi bi-arrow-repeat text-primary fs-5"></i>
                      <span>7-Day Replacement Guarantee</span>
                    </div>
                    <div className="d-flex align-items-center gap-2">
                      <i className="bi bi-truck text-warning fs-5"></i>
                      <span>Delivery by Tomorrow, 11:00 PM</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* 5. Mobile Sticky Floating Bottom Checkout Bar */}
      {cartItems.length > 0 && (
        <div className="cart-mobile-sticky-bar d-lg-none">
          <div>
            <div className="small text-muted" style={{ fontSize: '11px' }}>Total Payable</div>
            <div className="fw-bold fs-5 text-dark">₹{grandTotal.toLocaleString('en-IN')}</div>
          </div>
          <button
            type="button"
            className="btn btn-place-order-unique py-2.5 px-4 shadow-sm"
            style={{ width: 'auto', minWidth: '180px' }}
            onClick={handleProceedToCheckout}
          >
            <span className="d-flex align-items-center gap-1.5">
              <span>PLACE ORDER</span>
              <i className="bi bi-arrow-right-circle-fill fs-6 place-order-arrow"></i>
            </span>
          </button>
        </div>
      )}

      <Footer />
    </>
  );
};

export default Cart;
