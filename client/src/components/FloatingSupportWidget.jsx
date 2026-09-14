import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

const FloatingSupportWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  // Hide on admin dashboard to keep admin view uncluttered
  if (location.pathname.startsWith('/dashboard')) {
    return null;
  }

  const handleWhatsApp = () => {
    const text = encodeURIComponent('Hello Softpro Innovation Support, I need assistance with product specifications and order delivery.');
    window.open(`https://wa.me/919695572272?text=${text}`, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="position-fixed bottom-0 end-0 p-3 p-md-4" style={{ zIndex: 9999 }}>
      {/* Support Pop-up Card */}
      {isOpen && (
        <div
          className="bg-white rounded-4 shadow-lg border p-4 mb-3"
          style={{
            width: '320px',
            maxWidth: 'calc(100vw - 32px)',
            animation: 'widgetPop 0.22s cubic-bezier(0.16, 1, 0.3, 1)',
            boxShadow: '0 20px 40px rgba(15, 23, 42, 0.18)'
          }}
        >
          {/* Card Header */}
          <div className="d-flex align-items-center justify-content-between pb-3 border-bottom mb-3">
            <div className="d-flex align-items-center gap-2.5">
              <div
                className="rounded-circle text-white d-flex align-items-center justify-content-center fw-bold shadow-xs"
                style={{ width: '38px', height: '38px', background: 'linear-gradient(135deg, #2563eb, #1d4ed8)' }}
              >
                <i className="bi bi-headset fs-5"></i>
              </div>
              <div>
                <h6 className="fw-bold text-dark mb-0" style={{ fontSize: '14.5px' }}>
                  Softpro Help Desk
                </h6>
                <div className="d-flex align-items-center gap-1.5" style={{ fontSize: '11px' }}>
                  <span className="rounded-circle bg-success" style={{ width: '7px', height: '7px' }}></span>
                  <span className="text-success fw-bold">Live Support Online</span>
                </div>
              </div>
            </div>

            <button
              type="button"
              className="btn-close"
              style={{ fontSize: '11px' }}
              onClick={() => setIsOpen(false)}
            ></button>
          </div>

          <p className="text-muted small mb-3" style={{ fontSize: '12.5px', lineHeight: '1.5' }}>
            Hi there! How can we assist you with electronics components or your shipment today?
          </p>

          {/* Quick Actions List */}
          <div className="d-flex flex-column gap-2 mb-3">
            {/* WhatsApp Chat */}
            <button
              type="button"
              className="btn btn-sm d-flex align-items-center justify-content-between p-2.5 rounded-3 text-start border shadow-2xs"
              style={{ background: '#f0fdf4', borderColor: '#bbf7d0' }}
              onClick={handleWhatsApp}
            >
              <div className="d-flex align-items-center gap-2.5">
                <i className="bi bi-whatsapp text-success fs-5"></i>
                <div>
                  <div className="fw-bold text-dark" style={{ fontSize: '12.5px' }}>Chat on WhatsApp</div>
                  <div className="text-muted" style={{ fontSize: '10.5px' }}>Instant response in 2-5 mins</div>
                </div>
              </div>
              <i className="bi bi-chevron-right text-muted small"></i>
            </button>

            {/* Direct Call */}
            <a
              href="tel:+919695572272"
              className="btn btn-sm d-flex align-items-center justify-content-between p-2.5 rounded-3 text-start border shadow-2xs text-decoration-none"
              style={{ background: '#f8fafc', borderColor: '#e2e8f0' }}
            >
              <div className="d-flex align-items-center gap-2.5">
                <i className="bi bi-telephone-fill text-primary fs-5"></i>
                <div>
                  <div className="fw-bold text-dark" style={{ fontSize: '12.5px' }}>Direct Phone Call</div>
                  <div className="text-muted" style={{ fontSize: '10.5px' }}>+91 96955 72272 (Nabab Ali)</div>
                </div>
              </div>
              <i className="bi bi-chevron-right text-muted small"></i>
            </a>

            {/* Track Order */}
            <Link
              to="/track-order"
              onClick={() => setIsOpen(false)}
              className="btn btn-sm d-flex align-items-center justify-content-between p-2.5 rounded-3 text-start border shadow-2xs text-decoration-none"
              style={{ background: '#f8fafc', borderColor: '#e2e8f0' }}
            >
              <div className="d-flex align-items-center gap-2.5">
                <i className="bi bi-geo-alt-fill text-danger fs-5"></i>
                <div>
                  <div className="fw-bold text-dark" style={{ fontSize: '12.5px' }}>Track Order Status</div>
                  <div className="text-muted" style={{ fontSize: '10.5px' }}>Realtime BlueDart / Delhivery tracking</div>
                </div>
              </div>
              <i className="bi bi-chevron-right text-muted small"></i>
            </Link>

            {/* Returns / Replacement */}
            <Link
              to="/returns"
              onClick={() => setIsOpen(false)}
              className="btn btn-sm d-flex align-items-center justify-content-between p-2.5 rounded-3 text-start border shadow-2xs text-decoration-none"
              style={{ background: '#f8fafc', borderColor: '#e2e8f0' }}
            >
              <div className="d-flex align-items-center gap-2.5">
                <i className="bi bi-arrow-repeat text-warning fs-5"></i>
                <div>
                  <div className="fw-bold text-dark" style={{ fontSize: '12.5px' }}>Returns & Replacement</div>
                  <div className="text-muted" style={{ fontSize: '10.5px' }}>7-day hassle-free policy</div>
                </div>
              </div>
              <i className="bi bi-chevron-right text-muted small"></i>
            </Link>
          </div>

          <div className="text-center pt-2 border-top">
            <span className="text-muted" style={{ fontSize: '10.5px' }}>
              Official Support • Mon–Sat (9 AM – 8 PM IST)
            </span>
          </div>
        </div>
      )}

      {/* Floating Launcher Button */}
      <button
        type="button"
        className="btn rounded-pill text-white shadow-lg d-flex align-items-center gap-2 px-3.5 py-2.5 border-0"
        style={{
          background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
          boxShadow: '0 8px 24px rgba(37, 99, 235, 0.35)',
          transition: 'transform 0.2s ease'
        }}
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Toggle Live Help Desk"
      >
        <span className="position-relative d-inline-block">
          <i className={`bi ${isOpen ? 'bi-x-lg' : 'bi-chat-dots-fill'} fs-5`}></i>
          {!isOpen && (
            <span
              className="position-absolute top-0 start-100 translate-middle p-1 bg-success border border-light rounded-circle"
              style={{ width: '10px', height: '10px' }}
            ></span>
          )}
        </span>
        <span className="fw-bold d-none d-sm-inline" style={{ fontSize: '13.5px' }}>
          {isOpen ? 'Close' : 'Live Support'}
        </span>
      </button>

      <style>{`
        @keyframes widgetPop {
          from { opacity: 0; transform: translateY(12px) scale(0.95); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </div>
  );
};

export default FloatingSupportWidget;
