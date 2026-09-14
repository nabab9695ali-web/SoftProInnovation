import { useState } from 'react'
import Header from '../../components/Header'
import Footer from '../../components/Footer'
import { Link } from 'react-router-dom'
import axios from 'axios'
import { API_BASE_URL } from '../../config/api'

const Contact = () => {
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [category, setCategory] = useState('')
  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setSubmitError('')
    try {
      await axios.post(`${API_BASE_URL}/api/complaint/create`, { name: fullName, email, category, subject, message })
      setSubmitted(true)
      setFullName('')
      setEmail('')
      setCategory('')
      setSubject('')
      setMessage('')
      setTimeout(() => setSubmitted(false), 5000)
    } catch (error) {
      setSubmitError(error.response?.data?.message || 'Your message could not be submitted. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <>
      <Header />
      {/* Contact Hero Banner */}
      <section className="about-section position-relative overflow-hidden d-flex align-items-center">
        {/* Decorative background circles on right side */}
        <div className="about-decor-circle-1"></div>
        <div className="about-decor-circle-2"></div>

        <div className="container position-relative py-3" style={{ zIndex: 2 }}>
          <div className="row">
            <div className="col-12 col-lg-9 col-md-11">
              <div className="about-content text-start">
                {/* Breadcrumb Navigation */}
                <div className="contact-breadcrumb mb-3">
                  <Link to="/" className="text-decoration-none" style={{ color: '#3945E0', fontSize: '13px' }}>Home</Link>
                  <span className="mx-2 text-white-50" style={{ fontSize: '13px' }}>&rsaquo;</span>
                  <span className="text-white-50" style={{ fontSize: '13px' }}>Contact Us</span>
                </div>

                {/* Main Heading */}
                <h1 className="about-heading mb-3">
                  We'd Love to <span className="highlight-italic">Hear</span> from You
                </h1>

                {/* Subtitle Paragraph */}
                <p className="about-text mb-0">
                  Got a technical question, need help with an order, or just want to say hi? We respond to every message within one business day.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Contact Section */}
      <section className="contact-main-section py-5">
        <div className="container py-4">
          <div className="row g-4 g-lg-5">
            {/* Left Column: Contact Info & Quick Help */}
            <div className="col-12 col-lg-4">
              {/* Card 1: Contact Info */}
              <div className="contact-info-card text-start p-4 p-lg-4 mb-4">
                <h3 className="contact-card-title mb-4">
                  Contact <span className="highlight-italic">Info</span>
                </h3>

                <div className="contact-info-list d-flex flex-column gap-4">
                  {/* Address */}
                  <div className="d-flex align-items-start gap-3">
                    <div className="contact-icon-box flex-shrink-0">
                      <i className="bi bi-geo-alt-fill"></i>
                    </div>
                    <div>
                      <p className="contact-info-label mb-1">ADDRESS</p>
                      <p className="contact-info-text mb-0 fw-semibold">
                        Softpro House<br />
                        3/213, Sec-J, Jankipuram, Kursi Road<br />
                        Near Gudamba Police Station<br />
                        Lucknow - 226021,<br />
                        Uttar Pradesh, India
                      </p>
                    </div>
                  </div>

                  {/* Phone */}
                  <div className="d-flex align-items-start gap-3">
                    <div className="contact-icon-box flex-shrink-0">
                      <i className="bi bi-telephone-fill text-success"></i>
                    </div>
                    <div>
                      <p className="contact-info-label mb-1">PHONE / MOBILE</p>
                      <a href="tel:+919695572272" className="contact-info-link fw-bold text-decoration-none text-dark d-block mb-2 fs-6">
                        +91 96955 72272
                      </a>
                      <div className="d-flex flex-wrap gap-2">
                        <a
                          href="tel:+919695572272"
                          className="btn btn-sm btn-success px-2.5 py-1 text-white fw-semibold d-inline-flex align-items-center gap-1 shadow-xs"
                          style={{ fontSize: '12px', borderRadius: '8px' }}
                        >
                          <i className="bi bi-telephone-outbound-fill"></i>
                          <span>Call Now</span>
                        </a>
                        <a
                          href="https://wa.me/919695572272?text=Hello%20Softpro%20Innovation%20Team,%20I%20want%20to%20inquire%20about%20a%20product."
                          target="_blank"
                          rel="noreferrer"
                          className="btn btn-sm btn-outline-success px-2.5 py-1 fw-semibold d-inline-flex align-items-center gap-1"
                          style={{ fontSize: '12px', borderRadius: '8px' }}
                        >
                          <i className="bi bi-whatsapp"></i>
                          <span>WhatsApp</span>
                        </a>
                      </div>
                    </div>
                  </div>

                  {/* Email */}
                  <div className="d-flex align-items-start gap-3">
                    <div className="contact-icon-box flex-shrink-0">
                      <i className="bi bi-envelope-fill text-primary"></i>
                    </div>
                    <div>
                      <p className="contact-info-label mb-1">EMAIL ADDRESS</p>
                      <a href="mailto:nabab9695ali@gmail.com" className="contact-info-link fw-bold text-decoration-none text-primary d-block mb-2 fs-6">
                        nabab9695ali@gmail.com
                      </a>
                      <a
                        href="mailto:nabab9695ali@gmail.com?subject=Softpro%20Innovation%20Inquiry"
                        className="btn btn-sm btn-primary px-2.5 py-1 text-white fw-semibold d-inline-flex align-items-center gap-1 shadow-xs"
                        style={{ fontSize: '12px', borderRadius: '8px' }}
                      >
                        <i className="bi bi-send-fill"></i>
                        <span>Send Email</span>
                      </a>
                    </div>
                  </div>

                  {/* Business Hours */}
                  <div className="d-flex align-items-start gap-3">
                    <div className="contact-icon-box flex-shrink-0">
                      <i className="bi bi-clock-fill"></i>
                    </div>
                    <div>
                      <p className="contact-info-label mb-1">BUSINESS HOURS</p>
                      <p className="contact-info-text mb-0 fw-semibold">
                        Mon &ndash; Sat: 9:00 AM &ndash; 7:00 PM
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Card 2: Quick Help */}
              <div className="contact-info-card text-start p-4">
                <h4 className="quick-help-title mb-3">Quick Help</h4>
                <div className="quick-help-list d-flex flex-column gap-2">
                  <Link to="/track-order" className="quick-help-item d-flex align-items-center justify-content-between p-2 rounded-2 text-decoration-none">
                    <span className="d-flex align-items-center gap-2">
                      <span className="fs-5">📦</span> Track your order
                    </span>
                    <i className="bi bi-arrow-right text-muted fs-6"></i>
                  </Link>

                  <Link to="/returns" className="quick-help-item d-flex align-items-center justify-content-between p-2 rounded-2 text-decoration-none">
                    <span className="d-flex align-items-center gap-2">
                      <span className="fs-5">🔄</span> Return & refund policy
                    </span>
                    <i className="bi bi-arrow-right text-muted fs-6"></i>
                  </Link>

                  <Link to="/support" className="quick-help-item d-flex align-items-center justify-content-between p-2 rounded-2 text-decoration-none">
                    <span className="d-flex align-items-center gap-2">
                      <span className="fs-5">🔧</span> Technical support
                    </span>
                    <i className="bi bi-arrow-right text-muted fs-6"></i>
                  </Link>

                  <Link to="/b2b" className="quick-help-item d-flex align-items-center justify-content-between p-2 rounded-2 text-decoration-none">
                    <span className="d-flex align-items-center gap-2">
                      <span className="fs-5">💼</span> Bulk / B2B orders
                    </span>
                    <i className="bi bi-arrow-right text-muted fs-6"></i>
                  </Link>
                </div>
              </div>
            </div>

            {/* Right Column: Send Us a Message Form Card */}
            <div className="col-12 col-lg-8">
              <div className="contact-form-card text-start p-4 p-sm-5">
                <h2 className="contact-form-title mb-1">
                  Send Us a <span className="highlight-italic">Message</span>
                </h2>
                <p className="contact-form-subtitle mb-4">
                  Fill in the form and our team will get back to you within 24 hours.
                </p>

                <form onSubmit={handleSubmit}>
                  {/* Row 1: Full Name & Email */}
                  <div className="row g-3 mb-3">
                    <div className="col-12 col-md-6">
                      <label htmlFor="contactFullName" className="form-label login-label">Full Name</label>
                      <input
                        id="contactFullName"
                        type="text"
                        className="form-control login-input px-3"
                        placeholder="Arjun Sharma"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        required
                      />
                    </div>

                    <div className="col-12 col-md-6">
                      <label htmlFor="contactEmail" className="form-label login-label">Email Address</label>
                      <input
                        id="contactEmail"
                        type="email"
                        className="form-control login-input px-3"
                        placeholder="you@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  {/* Row 2: Category & Subject */}
                  <div className="row g-3 mb-3">
                    <div className="col-12 col-md-6">
                      <label htmlFor="contactCategory" className="form-label login-label">Category</label>
                      <select
                        id="contactCategory"
                        className="form-select login-input px-3"
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        required
                      >
                        <option value="" disabled>Select a topic...</option>
                        <option value="General Inquiry">General Inquiry</option>
                        <option value="Order Status">Order Status</option>
                        <option value="Technical Support">Technical Support</option>
                        <option value="Bulk Purchase">Bulk Purchase</option>
                      </select>
                    </div>

                    <div className="col-12 col-md-6">
                      <label htmlFor="contactSubject" className="form-label login-label">Subject</label>
                      <input
                        id="contactSubject"
                        type="text"
                        className="form-control login-input px-3"
                        placeholder="Brief summary"
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  {/* Row 3: Message Textarea */}
                  <div className="mb-4">
                    <label htmlFor="contactMessage" className="form-label login-label">Message</label>
                    <textarea
                      id="contactMessage"
                      className="form-control login-input px-3 py-3"
                      rows="5"
                      placeholder="Tell us how we can help..."
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      required
                    ></textarea>
                  </div>

                  {submitted && (
                    <div className="alert alert-success d-flex align-items-center mb-3 py-2 px-3 rounded-2" role="alert">
                      <i className="bi bi-check-circle-fill me-2 fs-5"></i>
                      <span>Thank you! Your message has been emailed directly to <strong>nabab9695ali@gmail.com</strong>. We will get back to you shortly!</span>
                    </div>
                  )}
                  {submitError && (
                    <div className="alert alert-danger d-flex align-items-center mb-3 py-2 px-3 rounded-2" role="alert">
                      <i className="bi bi-exclamation-triangle-fill me-2"></i>
                      <span>{submitError}</span>
                    </div>
                  )}

                  {/* Submit Button */}
                  <button type="submit" className="btn btn-orangered-about px-4 py-2.5 rounded-3 text-decoration-none" disabled={submitting}>
                    {submitting ? 'Submitting...' : 'Send Message'}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </>
  )
}

export default Contact