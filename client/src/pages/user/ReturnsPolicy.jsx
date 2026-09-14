import { useState } from 'react';
import { Link } from 'react-router-dom';
import Header from '../../components/Header';
import Footer from '../../components/Footer';

const ReturnsPolicy = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [orderIdInput, setOrderIdInput] = useState('');
  const [returnReason, setReturnReason] = useState('');
  const [returnSubmitted, setReturnSubmitted] = useState(false);

  const handleReturnSubmit = (e) => {
    e.preventDefault();
    if (!orderIdInput.trim() || !returnReason.trim()) return;
    setReturnSubmitted(true);
  };

  return (
    <div className="min-vh-100 d-flex flex-column bg-light">
      <Header />

      <main className="container flex-grow-1 py-4 py-lg-5">
        {/* Breadcrumbs */}
        <div className="mb-3 small text-muted">
          <Link to="/" className="text-decoration-none text-muted">Home</Link>
          <span className="mx-2">›</span>
          <span className="text-dark fw-semibold">Return &amp; Refund Policy</span>
        </div>

        {/* Hero Banner */}
        <div
          className="p-4 p-md-5 rounded-4 text-white shadow-sm mb-4 position-relative overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%)'
          }}
        >
          <div className="row align-items-center g-4">
            <div className="col-12 col-lg-8">
              <div className="d-inline-flex align-items-center gap-1.5 px-3 py-1 rounded-pill bg-white text-primary fw-bold small mb-2">
                <i className="bi bi-shield-check"></i>
                <span>100% Buyer Protection Guarantee</span>
              </div>
              <h1 className="fw-bold mb-2 display-6">
                7-Day Easy Return &amp; Replacement
              </h1>
              <p className="mb-0 opacity-90" style={{ maxWidth: '650px', fontSize: '15px' }}>
                At SoftPro Innovation, we stand behind the quality of every microcontroller, sensor, and robotics component. If your item arrives damaged or non-functional, we ensure swift doorstep replacement.
              </p>
            </div>

            <div className="col-12 col-lg-4 text-lg-end">
              <div className="d-inline-flex flex-column gap-2 bg-white text-dark p-3 rounded-3 shadow-sm text-start">
                <div className="d-flex align-items-center gap-2 text-success fw-bold">
                  <i className="bi bi-check-circle-fill"></i>
                  <span>7 Days Return Window</span>
                </div>
                <div className="d-flex align-items-center gap-2 text-primary fw-bold">
                  <i className="bi bi-arrow-repeat"></i>
                  <span>Free Doorstep Reverse Pickup</span>
                </div>
                <div className="d-flex align-items-center gap-2 text-dark fw-bold">
                  <i className="bi bi-cash-coin text-warning"></i>
                  <span>100% Instant Refund if Unavailable</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Sections */}
        <div className="row g-4">
          {/* Left Column: Policy Details & Steps */}
          <div className="col-12 col-lg-8">
            {/* 4-Step Return Process */}
            <div className="bg-white rounded-4 shadow-sm p-4 p-md-5 border mb-4">
              <h4 className="fw-bold text-dark mb-4">
                <i className="bi bi-diagram-3-fill text-primary me-2"></i>
                How the Return &amp; Replacement Process Works
              </h4>

              <div className="row g-4">
                <div className="col-12 col-sm-6">
                  <div className="p-3 rounded-3 border bg-light h-100">
                    <div className="d-flex align-items-center gap-2 mb-2">
                      <span className="badge bg-primary rounded-circle p-2 fs-6" style={{ width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>1</span>
                      <h6 className="fw-bold text-dark mb-0">Submit Request</h6>
                    </div>
                    <p className="text-secondary small mb-0">
                      Report the issue within 7 days of delivery via our Return Form below or WhatsApp helpline with photos/video of the issue.
                    </p>
                  </div>
                </div>

                <div className="col-12 col-sm-6">
                  <div className="p-3 rounded-3 border bg-light h-100">
                    <div className="d-flex align-items-center gap-2 mb-2">
                      <span className="badge bg-primary rounded-circle p-2 fs-6" style={{ width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>2</span>
                      <h6 className="fw-bold text-dark mb-0">Technical QA Verification</h6>
                    </div>
                    <p className="text-secondary small mb-0">
                      Our electronics engineering team verifies the reported issue or transit damage within 24 business hours.
                    </p>
                  </div>
                </div>

                <div className="col-12 col-sm-6">
                  <div className="p-3 rounded-3 border bg-light h-100">
                    <div className="d-flex align-items-center gap-2 mb-2">
                      <span className="badge bg-primary rounded-circle p-2 fs-6" style={{ width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>3</span>
                      <h6 className="fw-bold text-dark mb-0">Free Doorstep Pickup</h6>
                    </div>
                    <p className="text-secondary small mb-0">
                      Our courier partner (Delhivery/BlueDart) is dispatched to collect the item right from your doorstep at zero cost to you.
                    </p>
                  </div>
                </div>

                <div className="col-12 col-sm-6">
                  <div className="p-3 rounded-3 border bg-light h-100">
                    <div className="d-flex align-items-center gap-2 mb-2">
                      <span className="badge bg-success rounded-circle p-2 fs-6" style={{ width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>4</span>
                      <h6 className="fw-bold text-dark mb-0">Replacement or Refund</h6>
                    </div>
                    <p className="text-secondary small mb-0">
                      A brand new tested replacement is immediately shipped or a 100% full refund is credited back to your original payment mode.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Terms and Eligibility Accordion */}
            <div className="bg-white rounded-4 shadow-sm p-4 p-md-5 border mb-4">
              <h4 className="fw-bold text-dark mb-3">
                <i className="bi bi-file-text-fill text-primary me-2"></i>
                Return Terms &amp; Eligibility
              </h4>

              <div className="accordion" id="returnPolicyAccordion">
                <div className="accordion-item border rounded-3 mb-2 overflow-hidden">
                  <h2 className="accordion-header">
                    <button className="accordion-button fw-bold text-dark bg-light" type="button" data-bs-toggle="collapse" data-bs-target="#collapseOne">
                      What items are eligible for 7-day replacement?
                    </button>
                  </h2>
                  <div id="collapseOne" className="accordion-collapse collapse show">
                    <div className="accordion-body small text-secondary">
                      All microcontrollers (Raspberry Pi, Arduino, ESP32), sensor breakouts, electronic development modules, power drivers, and robotic kits are fully eligible if they are DOA (Dead On Arrival), damaged in transit, or having functional hardware defects.
                    </div>
                  </div>
                </div>

                <div className="accordion-item border rounded-3 mb-2 overflow-hidden">
                  <h2 className="accordion-header">
                    <button className="accordion-button collapsed fw-bold text-dark bg-light" type="button" data-bs-toggle="collapse" data-bs-target="#collapseTwo">
                      What are the conditions for return?
                    </button>
                  </h2>
                  <div id="collapseTwo" className="accordion-collapse collapse">
                    <div className="accordion-body small text-secondary">
                      The product must be kept with its original packaging, cables, headers, and accessories. Items subjected to improper over-voltage, burnt ICs due to wrong polarity, or physically broken parts by user alteration are not covered.
                    </div>
                  </div>
                </div>

                <div className="accordion-item border rounded-3 mb-2 overflow-hidden">
                  <h2 className="accordion-header">
                    <button className="accordion-button collapsed fw-bold text-dark bg-light" type="button" data-bs-toggle="collapse" data-bs-target="#collapseThree">
                      How long does refund processing take?
                    </button>
                  </h2>
                  <div id="collapseThree" className="accordion-collapse collapse">
                    <div className="accordion-body small text-secondary">
                      UPI, Card, and NetBanking refunds are credited back to your original source within 2 to 4 business days. For Cash on Delivery orders, our team will request your UPI ID or Bank Details to transfer funds instantly.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Interactive Return Initiation Box */}
          <div className="col-12 col-lg-4">
            <div className="bg-white rounded-4 shadow-sm p-4 border mb-4">
              <div className="d-flex align-items-center gap-2 mb-3">
                <i className="bi bi-box-arrow-in-left fs-4 text-danger"></i>
                <h5 className="fw-bold text-dark mb-0">Initiate a Return</h5>
              </div>

              {returnSubmitted ? (
                <div className="text-center py-4">
                  <i className="bi bi-check-circle-fill text-success" style={{ fontSize: '3rem' }}></i>
                  <h5 className="fw-bold mt-2">Request Submitted!</h5>
                  <p className="text-muted small">
                    Your return request for Order <strong>{orderIdInput}</strong> has been logged. Our customer support team will contact you via WhatsApp / Email within 24 hours.
                  </p>
                  <button
                    type="button"
                    className="btn btn-sm btn-outline-primary rounded-pill px-4"
                    onClick={() => {
                      setReturnSubmitted(false);
                      setOrderIdInput('');
                      setReturnReason('');
                    }}
                  >
                    Submit Another Request
                  </button>
                </div>
              ) : (
                <form onSubmit={handleReturnSubmit}>
                  <p className="text-muted small mb-3">
                    Have an issue with your received order? Enter your Order ID below to start your replacement ticket.
                  </p>

                  <div className="mb-3">
                    <label className="form-label small fw-bold text-dark">Order ID *</label>
                    <input
                      type="text"
                      className="form-control form-control-sm"
                      placeholder="e.g. ORD-1789138252841"
                      value={orderIdInput}
                      onChange={(e) => setOrderIdInput(e.target.value)}
                      required
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label small fw-bold text-dark">Reason for Return *</label>
                    <select
                      className="form-select form-select-sm"
                      value={returnReason}
                      onChange={(e) => setReturnReason(e.target.value)}
                      required
                    >
                      <option value="">Select Reason...</option>
                      <option value="Damaged in transit">Damaged in transit / Broken package</option>
                      <option value="Defective component">Defective / Not functioning (DOA)</option>
                      <option value="Wrong item received">Wrong item delivered</option>
                      <option value="Missing parts">Missing accessories or cables</option>
                      <option value="Other">Other technical issue</option>
                    </select>
                  </div>

                  <div className="mb-3">
                    <label className="form-label small fw-bold text-dark">Contact Mobile / WhatsApp *</label>
                    <input
                      type="tel"
                      className="form-control form-control-sm"
                      placeholder="10-digit mobile number"
                      required
                    />
                  </div>

                  <button type="submit" className="btn btn-danger w-100 fw-bold py-2 rounded-3 shadow-xs">
                    <i className="bi bi-send-fill me-1"></i> Submit Return Request
                  </button>
                </form>
              )}
            </div>

            {/* Quick Support Card */}
            <div className="bg-white rounded-4 shadow-sm p-4 border text-center">
              <i className="bi bi-headset text-primary" style={{ fontSize: '2.5rem' }}></i>
              <h6 className="fw-bold text-dark mt-2 mb-1">Direct Return Helpline</h6>
              <p className="text-muted small mb-3">
                Need immediate help? Reach out directly via WhatsApp or phone.
              </p>
              <a
                href="https://wa.me/919695572272?text=Hi%20SoftPro%20Innovation,%20I%20need%20help%20with%20return/replacement%20of%20my%20order."
                target="_blank"
                rel="noreferrer"
                className="btn btn-success btn-sm w-100 fw-bold py-2 mb-2 rounded-3"
              >
                <i className="bi bi-whatsapp me-1"></i> WhatsApp Support (+91 96955 72272)
              </a>
              <Link to="/contact" className="btn btn-outline-secondary btn-sm w-100 fw-bold py-2 rounded-3">
                Visit Contact Page
              </Link>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ReturnsPolicy;
