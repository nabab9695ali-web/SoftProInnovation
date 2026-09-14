import { useState, useEffect } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import { API_BASE_URL } from '../../config/api';
import { formatImg } from '../../utils/imageUrl';

const TrackOrder = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const initialId = searchParams.get('id') || '';

  const [searchQuery, setSearchQuery] = useState(initialId);
  const [loading, setLoading] = useState(false);
  const [order, setOrder] = useState(null);
  const [error, setError] = useState('');
  const [recentOrders, setRecentOrders] = useState([]);
  const [showInvoice, setShowInvoice] = useState(false);

  const handlePrintInvoice = () => {
    window.print();
  };

  // Fetch logged in user orders for quick tracking
  useEffect(() => {
    const fetchUserOrders = async () => {
      const storedUser = localStorage.getItem('user');
      if (!storedUser) return;
      try {
        const u = JSON.parse(storedUser);
        const uid = u._id || u.id;
        if (uid) {
          const res = await axios.get(`${API_BASE_URL}/api/order/user/${uid}`);
          if (res.data?.success && Array.isArray(res.data.orders)) {
            setRecentOrders(res.data.orders);
          }
        }
      } catch {
        // Silently ignore
      }
    };
    fetchUserOrders();
  }, []);

  const fetchTracking = async (q) => {
    if (!q || !q.trim()) return;
    setLoading(true);
    setError('');
    try {
      const res = await axios.get(`${API_BASE_URL}/api/order/track/${encodeURIComponent(q.trim())}`);
      if (res.data?.success && res.data.order) {
        setOrder(res.data.order);
      } else {
        setError(res.data?.message || 'Order not found. Please verify your Order ID.');
        setOrder(null);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Could not find any order matching this ID.');
      setOrder(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialId) {
      setSearchQuery(initialId);
      fetchTracking(initialId);
    }
  }, [initialId]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      fetchTracking(searchQuery);
    }
  };

  // Helper to format Flipkart-style delivery line
  const formatDeliveryText = (orderObj) => {
    if (!orderObj) return '';
    const status = (orderObj.status || 'pending').toLowerCase();
    if (status === 'delivered') {
      return `Delivered on ${new Date(orderObj.updatedAt || orderObj.createdAt).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      })}`;
    }

    const created = new Date(orderObj.createdAt || Date.now());
    const est = orderObj.estimatedDelivery ? new Date(orderObj.estimatedDelivery) : new Date(created.getTime() + 2 * 24 * 60 * 60 * 1000);

    const now = new Date();
    const diffDays = Math.ceil((est - now) / (1000 * 60 * 60 * 24));

    if (diffDays <= 1) {
      return 'Delivery by Tomorrow, 11:00 PM';
    } else if (diffDays === 2) {
      const dayName = est.toLocaleDateString('en-IN', { weekday: 'long' });
      return `Delivery by ${dayName}, 11:00 PM`;
    } else {
      return `Expected Delivery by ${est.toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        weekday: 'short'
      })}, 11:00 PM`;
    }
  };

  // Stepper milestones
  const getMilestones = (orderObj) => {
    const status = (orderObj?.status || 'pending').toLowerCase();
    const created = orderObj?.createdAt ? new Date(orderObj.createdAt) : new Date();

    const orderTimeStr = created.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });

    const isConfirmed = true;
    const isShipped = ['processing', 'shipped', 'out_for_delivery', 'delivered'].includes(status);
    const isOut = ['out_for_delivery', 'delivered'].includes(status);
    const isDelivered = status === 'delivered';

    return [
      {
        title: 'Order Confirmed',
        desc: `Verified & placed successfully (${orderTimeStr})`,
        completed: isConfirmed,
        active: status === 'pending'
      },
      {
        title: 'Shipped',
        desc: isShipped ? 'Package received by BlueDart / Delhivery courier' : 'Item being packed at fulfillment center',
        completed: isShipped,
        active: status === 'processing' || status === 'shipped'
      },
      {
        title: 'Out for Delivery',
        desc: isOut ? 'Courier delivery agent out with parcel' : 'Package arriving at your local delivery hub',
        completed: isOut,
        active: status === 'out_for_delivery'
      },
      {
        title: 'Delivered',
        desc: isDelivered ? 'Parcel handed over to customer' : formatDeliveryText(orderObj),
        completed: isDelivered,
        active: status === 'delivered'
      }
    ];
  };

  return (
    <div className="min-vh-100 d-flex flex-column bg-light">
      <Header />

      <main className="container flex-grow-1 py-4 py-lg-5">
        {/* Top Header Card */}
        <div className="bg-white rounded-4 shadow-sm p-4 p-md-5 mb-4 border">
          <div className="row align-items-center g-4">
            <div className="col-12 col-lg-7">
              <div className="d-inline-flex align-items-center gap-2 px-3 py-1 rounded-pill mb-2" style={{ background: '#eff6ff', border: '1px solid #bfdbfe' }}>
                <span className="spinner-grow spinner-grow-sm text-primary" style={{ width: '8px', height: '8px' }}></span>
                <span style={{ fontSize: '12px', fontWeight: '700', color: '#1d4ed8', textTransform: 'uppercase' }}>
                  Live Logistics Tracker
                </span>
              </div>
              <h1 className="fw-bold text-dark mb-2" style={{ fontSize: '2rem' }}>
                Track Your <span style={{ color: '#2563eb' }}>Order</span>
              </h1>
              <p className="text-secondary mb-0" style={{ fontSize: '14.5px' }}>
                Enter your SoftPro Order ID (e.g. <code>ORD-...</code>) or registered mobile number to see real-time delivery progress.
              </p>
            </div>

            {/* Search Form */}
            <div className="col-12 col-lg-5">
              <form onSubmit={handleSearch} className="d-flex gap-2">
                <div className="input-group shadow-sm rounded-3 overflow-hidden border">
                  <span className="input-group-text bg-white border-0 text-muted">
                    <i className="bi bi-search"></i>
                  </span>
                  <input
                    type="text"
                    className="form-control border-0 px-2 py-2.5 fw-semibold"
                    placeholder="Enter Order ID or Mobile"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    style={{ fontSize: '14px' }}
                  />
                  <button
                    type="submit"
                    className="btn btn-primary px-4 fw-bold d-flex align-items-center gap-2"
                    disabled={loading}
                    style={{ background: '#2563eb', border: 'none' }}
                  >
                    {loading ? (
                      <span className="spinner-border spinner-border-sm"></span>
                    ) : (
                      <>
                        <span>Track</span>
                        <i className="bi bi-arrow-right"></i>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Quick Order Selection Pills for Logged-in User */}
          {recentOrders.length > 0 && !order && (
            <div className="mt-4 pt-3 border-top">
              <div className="text-muted small fw-bold mb-2">
                <i className="bi bi-clock-history me-1"></i> Your Recent Orders (Click to Track):
              </div>
              <div className="d-flex flex-wrap gap-2">
                {recentOrders.slice(0, 4).map((ro) => (
                  <button
                    key={ro._id}
                    type="button"
                    className="btn btn-sm btn-outline-secondary rounded-pill px-3 py-1.5 fw-semibold d-flex align-items-center gap-2"
                    style={{ fontSize: '12.5px' }}
                    onClick={() => {
                      setSearchQuery(ro.orderId);
                      fetchTracking(ro.orderId);
                    }}
                  >
                    <span>{ro.orderId}</span>
                    <span className="badge bg-primary-subtle text-primary text-capitalize">{ro.status || 'pending'}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Error message */}
        {error && (
          <div className="alert alert-warning border-0 shadow-sm rounded-4 p-4 text-center my-4">
            <i className="bi bi-exclamation-triangle-fill fs-2 text-warning d-block mb-2"></i>
            <h5 className="fw-bold mb-1">Order Not Found</h5>
            <p className="text-secondary small mb-3">{error}</p>
            <Link to="/profile?tab=orders" className="btn btn-sm btn-outline-dark rounded-pill px-4 fw-bold">
              Check My Orders
            </Link>
          </div>
        )}

        {/* ORDER TRACKING DETAILS */}
        {order && (
          <div className="row g-4">
            {/* Left Column: Flipkart Delivery Banner & Stepper */}
            <div className="col-12 col-lg-8">
              {/* 1. Flipkart-style Top Green Delivery Banner */}
              <div
                className="p-4 rounded-4 text-white shadow-sm mb-4 position-relative overflow-hidden"
                style={{
                  background: 'linear-gradient(135deg, #15803d 0%, #16a34a 100%)',
                  boxShadow: '0 8px 20px rgba(22, 163, 74, 0.25)'
                }}
              >
                <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 position-relative" style={{ zIndex: 2 }}>
                  <div>
                    <div className="d-inline-flex align-items-center gap-1.5 px-2.5 py-1 rounded-pill bg-white text-success fw-bold small mb-2 shadow-xs" style={{ fontSize: '11px' }}>
                      <i className="bi bi-patch-check-fill"></i>
                      <span>Flipkart Standard Fast Transit</span>
                    </div>
                    <h3 className="fw-bold mb-1" style={{ letterSpacing: '-0.3px' }}>
                      {formatDeliveryText(order)}
                    </h3>
                    <p className="mb-0 opacity-90 small" style={{ fontSize: '13.5px' }}>
                      {order.trackingNote || 'Item dispatched and progressing normally via air express network.'}
                    </p>
                  </div>

                  <div className="text-lg-end bg-white text-dark p-3 rounded-3 shadow-sm border" style={{ minWidth: '180px' }}>
                    <div className="text-muted small fw-bold" style={{ fontSize: '11px' }}>LOGISTICS CARRIER</div>
                    <div className="fw-bold text-primary">BlueDart / Delhivery</div>
                    <div className="small text-secondary font-monospace" style={{ fontSize: '11.5px' }}>
                      AWB: <strong>{order.orderId.slice(-9)}</strong>
                    </div>
                  </div>
                </div>
              </div>

              {/* 2. Flipkart 4-Step Interactive Progress Stepper */}
              <div className="bg-white rounded-4 shadow-sm p-4 p-md-5 border mb-4">
                <h5 className="fw-bold text-dark mb-4 d-flex align-items-center gap-2">
                  <i className="bi bi-signpost-2-fill text-primary"></i>
                  Delivery Progress Timeline
                </h5>

                <div className="position-relative ps-4 ps-md-5 py-2">
                  {/* Vertical Track Line */}
                  <div
                    className="position-absolute"
                    style={{
                      left: '18px',
                      top: '15px',
                      bottom: '25px',
                      width: '4px',
                      backgroundColor: '#e2e8f0',
                      borderRadius: '2px'
                    }}
                  ></div>

                  {getMilestones(order).map((ms, idx) => (
                    <div key={idx} className="position-relative mb-4 pb-2 last-mb-0">
                      {/* Step Circle */}
                      <div
                        className="position-absolute d-flex align-items-center justify-content-center text-white shadow-xs"
                        style={{
                          left: '-37px',
                          top: '2px',
                          width: '28px',
                          height: '28px',
                          borderRadius: '50%',
                          backgroundColor: ms.completed ? '#16a34a' : ms.active ? '#2563eb' : '#cbd5e1',
                          border: '3px solid #ffffff'
                        }}
                      >
                        {ms.completed ? (
                          <i className="bi bi-check-lg fw-bold" style={{ fontSize: '14px' }}></i>
                        ) : (
                          <span style={{ fontSize: '11px', fontWeight: '800' }}>{idx + 1}</span>
                        )}
                      </div>

                      {/* Content */}
                      <div>
                        <div className="d-flex align-items-center gap-2">
                          <h6 className={`mb-1 fw-bold ${ms.completed ? 'text-dark' : ms.active ? 'text-primary' : 'text-muted'}`} style={{ fontSize: '15px' }}>
                            {ms.title}
                          </h6>
                          {ms.completed && (
                            <span className="badge bg-success-subtle text-success border border-success-subtle px-2 py-0.5" style={{ fontSize: '10px' }}>
                              Completed
                            </span>
                          )}
                          {ms.active && !ms.completed && (
                            <span className="badge bg-primary-subtle text-primary border border-primary-subtle px-2 py-0.5" style={{ fontSize: '10px' }}>
                              In Progress
                            </span>
                          )}
                        </div>
                        <p className="text-secondary small mb-0" style={{ fontSize: '13px', lineHeight: '1.5' }}>
                          {ms.desc}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 3. Items in this Order */}
              <div className="bg-white rounded-4 shadow-sm p-4 border mb-4">
                <h5 className="fw-bold text-dark mb-3">
                  <i className="bi bi-box-seam text-primary me-2"></i>
                  Ordered Products ({order.items?.length || 0})
                </h5>

                <div className="d-flex flex-column gap-3">
                  {(order.items || []).map((item, i) => (
                    <div key={i} className="d-flex align-items-center gap-3 p-3 rounded-3 border bg-light">
                      <div
                        className="rounded-3 bg-white border p-1 d-flex align-items-center justify-content-center flex-shrink-0"
                        style={{ width: '64px', height: '64px' }}
                      >
                        <img
                          src={formatImg(item.thumbnail)}
                          alt={item.name}
                          style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                        />
                      </div>
                      <div className="flex-grow-1">
                        <h6 className="fw-bold text-dark mb-1" style={{ fontSize: '14px' }}>
                          {item.name}
                        </h6>
                        <div className="text-muted small">
                          Quantity: <strong className="text-dark">{item.quantity}</strong> | Price: ₹{Number(item.price || 0).toLocaleString('en-IN')}
                        </div>
                      </div>
                      <div className="text-end">
                        <strong className="text-dark fs-6">
                          ₹{Number(item.total || item.price * item.quantity).toLocaleString('en-IN')}
                        </strong>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column: Address, Payment & Quick Actions */}
            <div className="col-12 col-lg-4">
              {/* Delivery Address Card */}
              <div className="bg-white rounded-4 shadow-sm p-4 border mb-4">
                <h6 className="fw-bold text-dark mb-3 d-flex align-items-center gap-2">
                  <i className="bi bi-geo-alt-fill text-danger"></i>
                  Delivery Address
                </h6>
                <div className="fw-bold text-dark">{order.address?.name}</div>
                <div className="text-secondary small mt-1" style={{ lineHeight: '1.6' }}>
                  {order.address?.address}, {order.address?.locality}
                  <br />
                  {order.address?.city}, {order.address?.state} - <strong>{order.address?.pincode}</strong>
                </div>
                <div className="text-secondary small mt-2 pt-2 border-top">
                  <i className="bi bi-telephone-fill me-1"></i> Phone: <strong>{order.address?.mobile}</strong>
                </div>
              </div>

              {/* Payment Summary Card */}
              <div className="bg-white rounded-4 shadow-sm p-4 border mb-4">
                <h6 className="fw-bold text-dark mb-3 d-flex align-items-center gap-2">
                  <i className="bi bi-credit-card-2-front-fill text-primary"></i>
                  Payment Details
                </h6>
                <div className="d-flex justify-content-between small mb-2">
                  <span className="text-muted">Payment Mode:</span>
                  <span className="fw-bold text-uppercase badge bg-primary-subtle text-primary">
                    {order.paymentMethod}
                  </span>
                </div>
                <div className="d-flex justify-content-between small mb-2">
                  <span className="text-muted">Payment Status:</span>
                  <span className={`fw-bold text-capitalize badge ${order.paymentStatus === 'paid' ? 'bg-success-subtle text-success' : 'bg-warning-subtle text-warning-emphasis'}`}>
                    {order.paymentStatus}
                  </span>
                </div>
                {order.paymentReference && (
                  <div className="d-flex justify-content-between small mb-2">
                    <span className="text-muted">Reference:</span>
                    <span className="font-monospace">{order.paymentReference}</span>
                  </div>
                )}
                <div className="d-flex justify-content-between fs-6 fw-bold text-dark pt-2 border-top mt-2">
                  <span>Total Amount:</span>
                  <span className="text-success">₹{Number(order.totalAmount || 0).toLocaleString('en-IN')}</span>
                </div>

                {/* Flipkart / Amazon Feature: Download Official GST Tax Invoice */}
                <button
                  type="button"
                  className="btn btn-outline-primary w-100 fw-bold py-2 mt-3 rounded-3 d-flex align-items-center justify-content-center gap-2"
                  style={{ fontSize: '13px' }}
                  onClick={() => setShowInvoice(true)}
                >
                  <i className="bi bi-file-earmark-text-fill"></i>
                  <span>Download GST Tax Invoice</span>
                </button>
              </div>

              {/* Quick Actions / Need Help */}
              <div className="bg-white rounded-4 shadow-sm p-4 border text-center">
                <h6 className="fw-bold text-dark mb-2">Need Help with this Order?</h6>
                <p className="text-muted small mb-3">
                  Have questions about delivery delay or want to return/replace an item?
                </p>
                <div className="d-grid gap-2">
                  <Link to="/returns" className="btn btn-outline-danger btn-sm fw-bold py-2 rounded-3">
                    <i className="bi bi-arrow-return-left me-1"></i> Return / Replacement Policy
                  </Link>
                  <Link to="/contact" className="btn btn-outline-primary btn-sm fw-bold py-2 rounded-3">
                    <i className="bi bi-headset me-1"></i> Contact Customer Support
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* OFFICIAL INDIAN GST TAX INVOICE MODAL */}
      {showInvoice && order && (() => {
        const total = Number(order.totalAmount || 0);
        const taxable = Math.round(total / 1.18);
        const gstTotal = total - taxable;
        const cgst = Math.round(gstTotal / 2);
        const sgst = gstTotal - cgst;
        const invoiceNo = `INV-2026-${(order.orderId || 'ORD').slice(-6).toUpperCase()}`;
        const orderDate = new Date(order.createdAt || Date.now()).toLocaleDateString('en-IN', {
          day: '2-digit',
          month: 'short',
          year: 'numeric'
        });

        return (
          <div
            className="position-fixed inset-0 top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center p-3"
            style={{
              backgroundColor: 'rgba(15, 23, 42, 0.75)',
              backdropFilter: 'blur(5px)',
              zIndex: 100000,
              overflowY: 'auto'
            }}
            onClick={() => setShowInvoice(false)}
          >
            <div
              className="bg-white rounded-4 shadow-2xl w-100 my-auto p-4 p-md-5 position-relative"
              style={{ maxWidth: '820px', maxHeight: '92vh', overflowY: 'auto' }}
              onClick={(e) => e.stopPropagation()}
              id="printable-gst-invoice"
            >
              {/* Top Modal Controls (Hidden in Print) */}
              <div className="d-flex align-items-center justify-content-between pb-3 border-bottom mb-4 d-print-none">
                <div className="d-flex align-items-center gap-2">
                  <span className="badge bg-success-subtle text-success fw-bold px-2.5 py-1 rounded-pill">
                    <i className="bi bi-patch-check-fill me-1"></i> Tax Invoice / Bill of Supply
                  </span>
                  <span className="text-muted small">Original for Recipient</span>
                </div>
                <div className="d-flex align-items-center gap-2">
                  <button
                    type="button"
                    className="btn btn-sm btn-primary fw-bold px-3 py-1.5 rounded-pill d-flex align-items-center gap-1.5"
                    style={{ background: '#2563eb' }}
                    onClick={handlePrintInvoice}
                  >
                    <i className="bi bi-printer-fill"></i>
                    <span>Print / Save PDF</span>
                  </button>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => setShowInvoice(false)}
                  ></button>
                </div>
              </div>

              {/* Company & GST Header */}
              <div className="row g-3 align-items-start border-bottom pb-4 mb-4">
                <div className="col-12 col-md-7">
                  <div className="d-flex align-items-center gap-2 mb-1">
                    <div
                      className="rounded-3 bg-primary text-white d-flex align-items-center justify-content-center fw-bold"
                      style={{ width: '32px', height: '32px', fontSize: '14px' }}
                    >
                      SP
                    </div>
                    <h5 className="fw-bold text-dark mb-0" style={{ letterSpacing: '-0.3px' }}>
                      SOFTPRO INNOVATION PVT. LTD.
                    </h5>
                  </div>
                  <div className="text-secondary small lh-sm">
                    Softpro Tower, Kursi Road, Lucknow - 226026, UP, India
                    <br />
                    <strong>GSTIN:</strong> 09AAACS9491K1ZK &nbsp;|&nbsp; <strong>PAN:</strong> AAACS9491K
                    <br />
                    <strong>Helpline:</strong> +91 96955 72272 &nbsp;|&nbsp; <strong>Email:</strong> nabab9695ali@gmail.com
                  </div>
                </div>

                <div className="col-12 col-md-5 text-md-end">
                  <h6 className="fw-bold text-primary mb-1">TAX INVOICE</h6>
                  <div className="small text-secondary">
                    <div><strong>Invoice No:</strong> {invoiceNo}</div>
                    <div><strong>Invoice Date:</strong> {orderDate}</div>
                    <div><strong>Order ID:</strong> {order.orderId}</div>
                    <div><strong>Place of Supply:</strong> {order.address?.state || 'Uttar Pradesh'} (09)</div>
                  </div>
                </div>
              </div>

              {/* Billing & Shipping Details */}
              <div className="row g-3 mb-4">
                <div className="col-12 col-md-6">
                  <div className="p-3 rounded-3 bg-light border h-100">
                    <div className="text-uppercase text-muted fw-bold small mb-1" style={{ fontSize: '11px' }}>
                      Billed & Shipped To:
                    </div>
                    <div className="fw-bold text-dark">{order.address?.name}</div>
                    <div className="text-secondary small mt-1">
                      {order.address?.address}, {order.address?.locality}
                      <br />
                      {order.address?.city}, {order.address?.state} - <strong>{order.address?.pincode}</strong>
                    </div>
                    <div className="text-secondary small mt-1">
                      <strong>Phone:</strong> {order.address?.mobile}
                    </div>
                  </div>
                </div>

                <div className="col-12 col-md-6">
                  <div className="p-3 rounded-3 bg-light border h-100">
                    <div className="text-uppercase text-muted fw-bold small mb-1" style={{ fontSize: '11px' }}>
                      Payment & Shipping Summary:
                    </div>
                    <div className="small text-secondary">
                      <div><strong>Mode of Payment:</strong> <span className="text-uppercase fw-bold text-dark">{order.paymentMethod}</span></div>
                      <div><strong>Payment Status:</strong> <span className="text-capitalize text-success fw-bold">{order.paymentStatus}</span></div>
                      {order.paymentReference && (
                        <div><strong>Ref / UTR:</strong> <span className="font-monospace text-dark">{order.paymentReference}</span></div>
                      )}
                      <div><strong>Shipping Carrier:</strong> BlueDart / Delhivery Express</div>
                      <div><strong>Estimated Transit:</strong> 2-3 Business Days</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Items Table */}
              <div className="table-responsive mb-4">
                <table className="table table-bordered align-middle mb-0" style={{ fontSize: '12.5px' }}>
                  <thead className="table-light">
                    <tr>
                      <th style={{ width: '40px' }} className="text-center">#</th>
                      <th>Description of Goods</th>
                      <th style={{ width: '80px' }} className="text-center">HSN</th>
                      <th style={{ width: '50px' }} className="text-center">Qty</th>
                      <th style={{ width: '90px' }} className="text-end">Rate (₹)</th>
                      <th style={{ width: '100px' }} className="text-end">Amount (₹)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {order.items?.map((item, idx) => (
                      <tr key={idx}>
                        <td className="text-center text-muted">{idx + 1}</td>
                        <td>
                          <div className="fw-bold text-dark">{item.name}</div>
                          <div className="text-muted small" style={{ fontSize: '11px' }}>
                            Electronics Component / Embedded Hardware
                          </div>
                        </td>
                        <td className="text-center text-secondary">854231</td>
                        <td className="text-center fw-bold text-dark">{item.quantity}</td>
                        <td className="text-end">₹{Number(item.price || 0).toLocaleString('en-IN')}</td>
                        <td className="text-end fw-bold text-dark">
                          ₹{Number(item.total || item.price * item.quantity).toLocaleString('en-IN')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr>
                      <td colSpan="4" rowSpan="4" className="align-top bg-light p-3">
                        <div className="small text-muted mb-1">Terms & Conditions:</div>
                        <ul className="mb-0 ps-3 small text-secondary" style={{ fontSize: '11px' }}>
                          <li>Goods once sold are covered under 7-day replacement guarantee against defects.</li>
                          <li>All disputes are subject to Lucknow, UP jurisdiction only.</li>
                          <li>This is a computer-generated tax invoice and requires no physical signature.</li>
                        </ul>
                      </td>
                      <td className="text-end fw-semibold">Taxable Amount:</td>
                      <td className="text-end fw-bold text-dark">₹{taxable.toLocaleString('en-IN')}</td>
                    </tr>
                    <tr>
                      <td className="text-end fw-semibold">CGST (9.0%):</td>
                      <td className="text-end">₹{cgst.toLocaleString('en-IN')}</td>
                    </tr>
                    <tr>
                      <td className="text-end fw-semibold">SGST (9.0%):</td>
                      <td className="text-end">₹{sgst.toLocaleString('en-IN')}</td>
                    </tr>
                    <tr className="table-primary">
                      <td className="text-end fw-bold fs-6">Grand Total:</td>
                      <td className="text-end fw-bold fs-6 text-primary">₹{total.toLocaleString('en-IN')}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              {/* Footer Signatory & Stamp */}
              <div className="d-flex flex-wrap align-items-center justify-content-between pt-3 border-top">
                <div className="text-secondary small">
                  <div><strong>Softpro Innovation e-Store</strong></div>
                  <div style={{ fontSize: '11px' }}>Thank you for engineering the future with us!</div>
                </div>

                <div className="text-end mt-2 mt-md-0">
                  <div className="text-muted small" style={{ fontSize: '11px' }}>For Softpro Innovation Pvt. Ltd.</div>
                  <div className="fw-bold text-dark mt-3" style={{ fontSize: '13px' }}>
                    [ Authorized Signatory ]
                  </div>
                  <div className="text-success fw-bold" style={{ fontSize: '10.5px' }}>
                    Digitally Verified & Signed
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      <Footer />
    </div>
  );
};

export default TrackOrder;
