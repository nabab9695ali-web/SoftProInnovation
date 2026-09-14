import { Link } from 'react-router-dom';
import Header from '../../components/Header';
import Footer from '../../components/Footer';

const TechSupport = () => {
  return (
    <div className="min-vh-100 d-flex flex-column bg-light">
      <Header />
      <main className="container flex-grow-1 py-4 py-lg-5">
        <div className="mb-3 small text-muted">
          <Link to="/" className="text-decoration-none text-muted">Home</Link>
          <span className="mx-2">›</span>
          <span className="text-dark fw-semibold">Technical Support</span>
        </div>

        <div className="bg-white rounded-4 shadow-sm p-4 p-md-5 border mb-4">
          <div className="d-inline-flex align-items-center gap-2 px-3 py-1 rounded-pill bg-light border text-primary fw-bold small mb-3">
            <i className="bi bi-tools"></i> Maker Technical Assistance
          </div>
          <h1 className="fw-bold text-dark mb-3">Technical Support &amp; Engineering Helpdesk</h1>
          <p className="text-secondary mb-4" style={{ maxWidth: '720px', lineHeight: '1.7' }}>
            Need help configuring an ESP32 Wi-Fi module, interfacing an OLED display with Arduino, or wiring a motor driver? Our technical team is here to assist makers, students, and engineers.
          </p>

          <div className="row g-4 mt-2">
            <div className="col-12 col-md-4">
              <div className="p-4 rounded-3 border bg-light h-100 text-center">
                <i className="bi bi-whatsapp text-success display-5 d-block mb-3"></i>
                <h5 className="fw-bold text-dark mb-2">WhatsApp Tech Help</h5>
                <p className="text-muted small mb-3">Chat with our electronics engineers for quick connection diagrams and library links.</p>
                <a href="https://wa.me/919695572272" target="_blank" rel="noreferrer" className="btn btn-success btn-sm fw-bold px-4 py-2 rounded-pill">
                  Open WhatsApp Chat (+91 96955 72272)
                </a>
              </div>
            </div>

            <div className="col-12 col-md-4">
              <div className="p-4 rounded-3 border bg-light h-100 text-center">
                <i className="bi bi-envelope-check text-primary display-5 d-block mb-3"></i>
                <h5 className="fw-bold text-dark mb-2">Email Support Desk</h5>
                <p className="text-muted small mb-3">Send project code or schematics to our review email for in-depth debugging help.</p>
                <a href="mailto:nabab9695ali@gmail.com" className="btn btn-primary btn-sm fw-bold px-4 py-2 rounded-pill">
                  nabab9695ali@gmail.com
                </a>
              </div>
            </div>

            <div className="col-12 col-md-4">
              <div className="p-4 rounded-3 border bg-light h-100 text-center">
                <i className="bi bi-box-seam-fill text-warning display-5 d-block mb-3"></i>
                <h5 className="fw-bold text-dark mb-2">Order Tracking</h5>
                <p className="text-muted small mb-3">Check real-time dispatch and delivery status of your active shipments.</p>
                <Link to="/track-order" className="btn btn-outline-dark btn-sm fw-bold px-4 py-2 rounded-pill">
                  Track Your Shipment
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default TechSupport;
