import { useState, useEffect } from 'react';

const WhyChooseUs = () => {
  const [selectedFeature, setSelectedFeature] = useState(null);

  // Close modal on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setSelectedFeature(null);
    };
    if (selectedFeature) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'auto';
    };
  }, [selectedFeature]);

  const features = [
    {
      id: 'fast-delivery',
      icon: 'bi bi-truck',
      title: 'Fast Delivery',
      subtitle: 'Express Pan-India Doorstep Logistics',
      description: 'Deliver across India',
      badge: 'Dispatched in 24 Hrs',
      color: '#2563eb',
      bgLight: '#eff6ff',
      textColor: 'text-primary',
      overview:
        'Hamari priority hoti hai ki aapke robotics aur electronics components bina kisi delay ke safe aur fastest speed se aap tak pahuchein.',
      points: [
        {
          title: 'Same-Day / 24h Dispatch',
          desc: 'Orders placed on working days are verified and dispatched within 24 hours from our fulfillment hub.',
          icon: 'bi bi-clock-history'
        },
        {
          title: 'Pan-India Express Coverage',
          desc: 'Delivery within 2-4 business days across all metro cities and 4-6 business days for the rest of India.',
          icon: 'bi bi-geo-alt-fill'
        },
        {
          title: 'Top Courier Partners',
          desc: 'Shipped via trusted logistics networks like BlueDart, Delhivery, DTDC, and India Post Speed Post.',
          icon: 'bi bi-box-seam-fill'
        },
        {
          title: 'Live Real-Time Tracking',
          desc: 'Instant SMS, WhatsApp & Email tracking links provided as soon as your parcel is handed over.',
          icon: 'bi bi-broadcast-pin'
        },
        {
          title: 'Free Shipping Threshold',
          desc: 'Enjoy free delivery across India on all eligible prepaid orders above ₹499.',
          icon: 'bi bi-gift-fill'
        }
      ]
    },
    {
      id: 'secure-payments',
      icon: 'bi bi-shield-lock',
      title: 'Secure Payments',
      subtitle: '256-Bit SSL Encrypted & COD Available',
      description: '100% secure checkout',
      badge: 'PCI-DSS Certified',
      color: '#16a34a',
      bgLight: '#f0fdf4',
      textColor: 'text-success',
      overview:
        'Aapka har transaction highest security standard ke sath protect hota hai. Zero hidden charges aur complete payment transparency.',
      points: [
        {
          title: 'Razorpay Powered Gateway',
          desc: 'Bank-grade 256-bit encryption with RBI-approved PCI-DSS compliant checkout technology.',
          icon: 'bi bi-shield-check'
        },
        {
          title: 'Instant UPI & QR Payments',
          desc: 'Pay easily using Google Pay, PhonePe, Paytm, BHIM, Cred or any bank UPI app with zero surcharge.',
          icon: 'bi bi-qr-code-scan'
        },
        {
          title: 'All Major Cards & Net Banking',
          desc: 'Seamless support for Visa, MasterCard, RuPay, Maestro and 50+ Indian net banking portals.',
          icon: 'bi bi-credit-card-2-front-fill'
        },
        {
          title: 'Cash on Delivery (COD) Available',
          desc: 'Pay conveniently in cash or UPI at your doorstep upon receiving your parcel safely.',
          icon: 'bi bi-cash-stack'
        },
        {
          title: 'Instant Auto-Refunds',
          desc: 'Failed or duplicate transaction amounts are auto-reversed to your original payment source immediately.',
          icon: 'bi bi-arrow-repeat'
        }
      ]
    },
    {
      id: 'quality-components',
      icon: 'bi bi-patch-check',
      title: 'Quality Components',
      subtitle: '100% Original & QA Lab Tested',
      description: 'Tested & reliable products',
      badge: 'Lab Tested',
      color: '#d97706',
      bgLight: '#fffbeb',
      textColor: 'text-warning',
      overview:
        'Electronics aur robotics me accuracy sabse jaruri hoti hai. Hum har board, sensor aur module ko double verify karke dispatch karte hain.',
      points: [
        {
          title: '100% Genuine Brands',
          desc: 'Sourced directly from authorized manufacturers: Raspberry Pi, Espressif, STMicroelectronics, Arduino.',
          icon: 'bi bi-award-fill'
        },
        {
          title: 'Pre-Dispatch QA Testing',
          desc: 'Microcontrollers, OLEDs, and sensor modules undergo power-on and voltage consistency checks.',
          icon: 'bi bi-cpu-fill'
        },
        {
          title: 'ESD Anti-Static Packaging',
          desc: 'Sensitive integrated circuits and breakout boards are packed in electrostatic discharge safe shielding.',
          icon: 'bi bi-box2-fill'
        },
        {
          title: 'Datasheets & Pinouts',
          desc: 'Comprehensive pin diagrams, schematic guides, and sample codes available for maker projects.',
          icon: 'bi bi-file-earmark-code-fill'
        },
        {
          title: 'Long-term Reliability',
          desc: 'Industrial-grade durability suitable for DIY hobbyists, college engineering students, and commercial IoT.',
          icon: 'bi bi-lightning-charge-fill'
        }
      ]
    },
    {
      id: 'expert-support',
      icon: 'bi bi-chat-dots',
      title: 'Expert Support',
      subtitle: 'Technical Engineers & Maker Helpdesk',
      description: 'Get help with your projects',
      badge: 'Dedicated Help',
      color: '#0284c7',
      bgLight: '#f0f9ff',
      textColor: 'text-info',
      overview:
        'Chahe aap beginner maker ho ya professional engineer, hamari technical team aapki project query solve karne ke liye ready rehti hai.',
      points: [
        {
          title: 'Hardware Selection Guidance',
          desc: 'Unsure which microcontroller, motor driver, or battery to use? Our team assists in component selection.',
          icon: 'bi bi-diagram-3-fill'
        },
        {
          title: 'Sample Code & Libraries',
          desc: 'Trouble connecting your module? We provide ready-to-run Arduino libraries and ESP32 code snippets.',
          icon: 'bi bi-code-slash'
        },
        {
          title: 'Fast Response Ticket System',
          desc: 'Reach our team via WhatsApp, Email support, or phone call Mon-Sat (10:00 AM to 7:00 PM IST).',
          icon: 'bi bi-whatsapp'
        },
        {
          title: 'Student & Capstone Project Support',
          desc: 'Special guidance for college mini/major engineering projects and school STEM robotics competitions.',
          icon: 'bi bi-mortarboard-fill'
        },
        {
          title: 'B2B & Bulk Inquiries',
          desc: 'Custom quotations and dedicated account management for labs, maker spaces, and prototyping houses.',
          icon: 'bi bi-building'
        }
      ]
    },
    {
      id: 'easy-returns',
      icon: 'bi bi-arrow-return-left',
      title: 'Easy Returns',
      subtitle: '7-Day Replacement & Buyer Guarantee',
      description: 'Simple return policy',
      badge: '7-Day Protection',
      color: '#dc2626',
      bgLight: '#fef2f2',
      textColor: 'text-danger',
      overview:
        'Aapka trust hamare liye sabse bada asset hai. Agar component defective ya transit me damage hota hai to hum bina kisi pareshani ke replace karte hain.',
      points: [
        {
          title: '7-Day Replacement Window',
          desc: 'Report any manufacturing defect or arrival issue within 7 days of delivery for a swift replacement.',
          icon: 'bi bi-calendar-check-fill'
        },
        {
          title: 'No-Hassle Resolution',
          desc: 'Simply share a short unboxing video or clear photo of the defective item with our support team.',
          icon: 'bi bi-camera-fill'
        },
        {
          title: 'Reverse Pickup Facility',
          desc: 'Courier pickup scheduled directly from your doorstep across eligible serviceable pin codes.',
          icon: 'bi bi-house-door-fill'
        },
        {
          title: '100% Money-Back Option',
          desc: 'If a replacement is unavailable, 100% full refund is credited back to your bank account / source.',
          icon: 'bi bi-currency-rupee'
        },
        {
          title: 'Warranty Backing',
          desc: 'All branded single-board computers carry manufacturer warranty coverage for complete peace of mind.',
          icon: 'bi bi-patch-check-fill'
        }
      ]
    }
  ];

  return (
    <section className="py-5" style={{ backgroundColor: '#f8fafc' }}>
      <div className="container">
        {/* Section Heading */}
        <div className="text-center mb-5">
          <div className="d-inline-flex align-items-center gap-2 px-3 py-1 rounded-pill mb-2" style={{ background: '#eff6ff', border: '1px solid #bfdbfe' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#2563eb' }}></span>
            <span style={{ fontSize: '12px', fontWeight: '700', color: '#1d4ed8', letterSpacing: '0.4px', textTransform: 'uppercase' }}>
              The SoftPro Promise
            </span>
          </div>
          <h2 className="fw-bold" style={{ color: '#0f172a', fontSize: '2rem' }}>
            Why Makers Choose Us
          </h2>
          <p className="text-secondary mx-auto mt-2" style={{ maxWidth: '620px', fontSize: '14.5px' }}>
            Engineered for students, robotics makers, and electronics developers. Click on any feature card below to see our full service commitment.
          </p>
          <div className="mx-auto mt-2" style={{ width: '56px', height: '3px', backgroundColor: '#2563eb', borderRadius: '2px' }}></div>
        </div>

        {/* Feature Cards Grid */}
        <div className="row g-4 justify-content-center">
          {features.map((feature) => (
            <div key={feature.id} className="col-12 col-sm-6 col-md-4 col-lg">
              <div
                role="button"
                tabIndex={0}
                className="card h-100 border-0 shadow-sm text-center p-3 p-lg-4 position-relative"
                onClick={() => setSelectedFeature(feature)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setSelectedFeature(feature);
                  }
                }}
                style={{
                  borderRadius: '16px',
                  backgroundColor: '#ffffff',
                  border: '1px solid #e2e8f0',
                  transition: 'all 0.28s cubic-bezier(0.16, 1, 0.3, 1)',
                  cursor: 'pointer'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-8px)';
                  e.currentTarget.style.boxShadow = '0 16px 30px rgba(15, 23, 42, 0.12)';
                  e.currentTarget.style.borderColor = feature.color;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 2px 6px rgba(0, 0, 0, 0.04)';
                  e.currentTarget.style.borderColor = '#e2e8f0';
                }}
              >
                {/* Micro Badge */}
                <div className="position-absolute top-0 end-0 mt-2 me-2">
                  <span
                    className="badge"
                    style={{
                      backgroundColor: feature.bgLight,
                      color: feature.color,
                      fontSize: '10px',
                      fontWeight: '700',
                      border: `1px solid ${feature.color}33`,
                      borderRadius: '10px'
                    }}
                  >
                    {feature.badge}
                  </span>
                </div>

                <div className="card-body p-0 d-flex flex-column align-items-center justify-content-between h-100">
                  <div className="w-100">
                    <div
                      className="d-inline-flex align-items-center justify-content-center mb-3 rounded-circle"
                      style={{
                        width: '68px',
                        height: '68px',
                        backgroundColor: feature.bgLight,
                        border: `1.5px solid ${feature.color}22`
                      }}
                    >
                      <i className={feature.icon} style={{ fontSize: '2rem', color: feature.color }}></i>
                    </div>
                    <h6 className="card-title fw-bold mb-2 text-dark" style={{ fontSize: '15px' }}>
                      {feature.title}
                    </h6>
                    <p className="card-text text-secondary small mb-3" style={{ fontSize: '12.5px', lineHeight: '1.4' }}>
                      {feature.description}
                    </p>
                  </div>

                  {/* Click hint pill */}
                  <div className="mt-auto pt-2 w-100 border-top border-light">
                    <span
                      className="d-inline-flex align-items-center gap-1 small fw-bold"
                      style={{ fontSize: '11.5px', color: feature.color }}
                    >
                      <span>Know More</span>
                      <i className="bi bi-arrow-right-short fs-6"></i>
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ======================================================================
          INTERACTIVE INFORMATION MODAL
          ====================================================================== */}
      {selectedFeature && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center p-3"
          style={{
            backgroundColor: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(4px)',
            zIndex: 9999,
            animation: 'fadeIn 0.2s ease-out'
          }}
          onClick={() => setSelectedFeature(null)}
        >
          <div
            className="bg-white rounded-4 shadow-lg overflow-hidden position-relative"
            style={{
              maxWidth: '620px',
              width: '100%',
              maxHeight: '90vh',
              display: 'flex',
              flexDirection: 'column',
              animation: 'slideUp 0.25s cubic-bezier(0.16, 1, 0.3, 1)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div
              className="p-4 border-bottom d-flex align-items-center justify-content-between"
              style={{
                backgroundColor: selectedFeature.bgLight,
                borderBottomColor: `${selectedFeature.color}22`
              }}
            >
              <div className="d-flex align-items-center gap-3">
                <div
                  className="rounded-circle d-flex align-items-center justify-content-center shadow-xs"
                  style={{
                    width: '52px',
                    height: '52px',
                    backgroundColor: '#ffffff',
                    border: `2px solid ${selectedFeature.color}33`,
                    flexShrink: 0
                  }}
                >
                  <i className={selectedFeature.icon} style={{ fontSize: '1.7rem', color: selectedFeature.color }}></i>
                </div>
                <div>
                  <div className="d-flex align-items-center gap-2 mb-1">
                    <h5 className="mb-0 fw-bold text-dark">{selectedFeature.title}</h5>
                    <span
                      className="badge rounded-pill"
                      style={{
                        backgroundColor: selectedFeature.color,
                        color: '#ffffff',
                        fontSize: '10.5px',
                        fontWeight: '700'
                      }}
                    >
                      {selectedFeature.badge}
                    </span>
                  </div>
                  <small className="text-secondary fw-semibold" style={{ fontSize: '12.5px' }}>
                    {selectedFeature.subtitle}
                  </small>
                </div>
              </div>

              {/* Close Button */}
              <button
                type="button"
                className="btn btn-sm btn-light rounded-circle p-2 d-flex align-items-center justify-content-center shadow-xs"
                style={{ width: '34px', height: '34px' }}
                onClick={() => setSelectedFeature(null)}
                aria-label="Close"
              >
                <i className="bi bi-x-lg text-dark"></i>
              </button>
            </div>

            {/* Modal Body with Detailed Information */}
            <div className="p-4 overflow-y-auto" style={{ maxHeight: 'calc(90vh - 160px)' }}>
              {/* Overview Callout */}
              <div
                className="p-3 rounded-3 mb-4"
                style={{
                  backgroundColor: '#f8fafc',
                  borderLeft: `4px solid ${selectedFeature.color}`
                }}
              >
                <p className="mb-0 text-dark fw-medium" style={{ fontSize: '13.5px', lineHeight: '1.6' }}>
                  {selectedFeature.overview}
                </p>
              </div>

              {/* Points List */}
              <h6 className="fw-bold text-dark mb-3" style={{ fontSize: '14px', letterSpacing: '0.2px' }}>
                <i className="bi bi-check2-circle me-1" style={{ color: selectedFeature.color }}></i>
                Key Highlights &amp; Guarantee:
              </h6>

              <div className="d-flex flex-column gap-3 mb-3">
                {selectedFeature.points.map((pt, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-3 d-flex align-items-start gap-3"
                    style={{
                      backgroundColor: '#ffffff',
                      border: '1px solid #eef2f6',
                      transition: 'border-color 0.2s ease'
                    }}
                  >
                    <div
                      className="rounded-circle d-flex align-items-center justify-content-center flex-shrink-0 mt-1"
                      style={{
                        width: '32px',
                        height: '32px',
                        backgroundColor: selectedFeature.bgLight,
                        color: selectedFeature.color,
                        fontSize: '15px'
                      }}
                    >
                      <i className={pt.icon}></i>
                    </div>
                    <div>
                      <div className="fw-bold text-dark mb-1" style={{ fontSize: '13.5px' }}>
                        {pt.title}
                      </div>
                      <div className="text-secondary small" style={{ fontSize: '12.5px', lineHeight: '1.55' }}>
                        {pt.desc}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-3 px-4 border-top bg-light d-flex align-items-center justify-content-between">
              <div className="text-muted small">
                <i className="bi bi-shield-fill-check text-success me-1"></i>
                100% Verified SoftPro Standard
              </div>
              <button
                type="button"
                className="btn btn-sm px-4 py-2 text-white fw-bold shadow-xs"
                style={{
                  backgroundColor: selectedFeature.color,
                  borderRadius: '8px',
                  fontSize: '13px'
                }}
                onClick={() => setSelectedFeature(null)}
              >
                Got It
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default WhyChooseUs;
