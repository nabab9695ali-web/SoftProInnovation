import { useState } from 'react';
import { Link } from 'react-router-dom';
import Header from '../../components/Header';
import Footer from '../../components/Footer';

const B2BOrders = () => {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="min-vh-100 d-flex flex-column bg-light">
      <Header />
      <main className="container flex-grow-1 py-4 py-lg-5">
        <div className="mb-3 small text-muted">
          <Link to="/" className="text-decoration-none text-muted">Home</Link>
          <span className="mx-2">›</span>
          <span className="text-dark fw-semibold">Bulk &amp; B2B Procurement</span>
        </div>

        <div className="row g-4">
          <div className="col-12 col-lg-7">
            <div className="bg-white rounded-4 shadow-sm p-4 p-md-5 border h-100">
              <div className="d-inline-flex align-items-center gap-2 px-3 py-1 rounded-pill bg-light border text-success fw-bold small mb-3">
                <i className="bi bi-building"></i> Institutional &amp; Lab Solutions
              </div>
              <h1 className="fw-bold text-dark mb-3">Bulk &amp; Institutional Electronics Procurement</h1>
              <p className="text-secondary mb-4" style={{ lineHeight: '1.7' }}>
                SoftPro Innovation partners with universities, engineering colleges, robotics clubs, and IoT startup prototyping labs across India for bulk hardware procurement with GST invoice compliance.
              </p>

              <div className="d-flex flex-column gap-3 mb-4">
                <div className="d-flex align-items-start gap-3">
                  <div className="p-2 rounded-circle bg-primary-subtle text-primary mt-1"><i className="bi bi-check2-circle fs-5"></i></div>
                  <div>
                    <h6 className="fw-bold text-dark mb-1">Wholesale Discount Tiers</h6>
                    <p className="text-muted small mb-0">Special volume pricing on 10+ units of Raspberry Pi, Arduino, ESP32, and sensor kits.</p>
                  </div>
                </div>

                <div className="d-flex align-items-start gap-3">
                  <div className="p-2 rounded-circle bg-success-subtle text-success mt-1"><i className="bi bi-receipt fs-5"></i></div>
                  <div>
                    <h6 className="fw-bold text-dark mb-1">GST Invoicing &amp; Tax Credits</h6>
                    <p className="text-muted small mb-0">Full B2B tax invoice with your organization GSTIN for complete input credit benefits.</p>
                  </div>
                </div>

                <div className="d-flex align-items-start gap-3">
                  <div className="p-2 rounded-circle bg-info-subtle text-info mt-1"><i className="bi bi-truck fs-5"></i></div>
                  <div>
                    <h6 className="fw-bold text-dark mb-1">Dedicated Account Logistics</h6>
                    <p className="text-muted small mb-0">Priority bulk dispatch via surface express with real-time consignment tracking.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="col-12 col-lg-5">
            <div className="bg-white rounded-4 shadow-sm p-4 p-md-5 border">
              <h4 className="fw-bold text-dark mb-3">Request Bulk Quotation</h4>
              {submitted ? (
                <div className="text-center py-4">
                  <i className="bi bi-check-circle-fill text-success" style={{ fontSize: '3rem' }}></i>
                  <h5 className="fw-bold mt-2">Quotation Request Received!</h5>
                  <p className="text-muted small">
                    Our procurement team will prepare an institutional quotation and email it within 4 business hours.
                  </p>
                  <button type="button" className="btn btn-sm btn-outline-primary rounded-pill px-4" onClick={() => setSubmitted(false)}>
                    Submit Another Request
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit}>
                  <div className="mb-3">
                    <label className="form-label small fw-bold">Institution / Company Name *</label>
                    <input type="text" className="form-control form-control-sm" placeholder="e.g. ABC College of Engineering" required />
                  </div>
                  <div className="mb-3">
                    <label className="form-label small fw-bold">Contact Person *</label>
                    <input type="text" className="form-control form-control-sm" placeholder="Full name" required />
                  </div>
                  <div className="mb-3">
                    <label className="form-label small fw-bold">Official Email *</label>
                    <input type="email" className="form-control form-control-sm" placeholder="contact@domain.edu" required />
                  </div>
                  <div className="mb-3">
                    <label className="form-label small fw-bold">Mobile / WhatsApp *</label>
                    <input type="tel" className="form-control form-control-sm" placeholder="10-digit number" required />
                  </div>
                  <div className="mb-3">
                    <label className="form-label small fw-bold">Required Components &amp; Quantities *</label>
                    <textarea rows="3" className="form-control form-control-sm" placeholder="e.g. 50x Arduino Uno, 20x ESP32, 100x Ultrasonic sensors..." required></textarea>
                  </div>
                  <button type="submit" className="btn btn-primary w-100 fw-bold py-2 rounded-3">
                    Get Instant Quote
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default B2BOrders;
