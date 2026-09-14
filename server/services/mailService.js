const nodemailer = require('nodemailer');

const isMailConfigured = () => Boolean(
  process.env.MAIL_USER &&
  process.env.MAIL_PASSWORD
);

const getTransporter = () => {
  const pass = (process.env.MAIL_PASSWORD || '').replace(/\s+/g, '');
  return nodemailer.createTransport({
    host: process.env.MAIL_HOST || 'smtp.gmail.com',
    port: Number(process.env.MAIL_PORT) || 465,
    secure: process.env.MAIL_SECURE !== 'false',
    auth: {
      user: process.env.MAIL_USER,
      pass: pass,
    },
  });
};

/**
 * Send a welcome email to newly registered users
 */
const sendWelcomeEmail = async ({ to, name }) => {
  if (!isMailConfigured()) {
    console.warn('Mail service not configured: skipping welcome email.');
    return { sent: false, reason: 'SMTP settings are not configured' };
  }

  const customerName = name || 'Valued Customer';
  const transporter = getTransporter();

  const mailOptions = {
    from: `"SoftPro Innovation" <${process.env.MAIL_FROM || process.env.MAIL_USER}>`,
    to,
    subject: `Welcome to SoftPro Innovation, ${customerName}! 🎉`,
    text: `Hello ${customerName},\n\nWelcome to SoftPro Innovation! Your account has been registered successfully.\n\nWe are excited to have you on board. Start browsing our latest products and enjoy exclusive deals!\n\nHappy Shopping,\nTeam SoftPro Innovation`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; margin: 0; padding: 0; background-color: #f4f6f9; color: #333333; }
          .container { max-width: 600px; margin: 30px auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.06); }
          .header { background: linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%); padding: 36px 30px; text-align: center; color: #ffffff; }
          .header h1 { margin: 0; font-size: 26px; font-weight: 700; letter-spacing: -0.5px; }
          .header p { margin: 8px 0 0 0; font-size: 14px; opacity: 0.9; }
          .content { padding: 35px 30px; }
          .greeting { font-size: 18px; font-weight: 600; color: #1e293b; margin-bottom: 16px; }
          .message { font-size: 15px; line-height: 1.6; color: #475569; margin-bottom: 24px; }
          .feature-box { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 20px; margin-bottom: 28px; }
          .feature-item { display: flex; align-items: center; margin-bottom: 12px; font-size: 14px; color: #334155; }
          .feature-item:last-child { margin-bottom: 0; }
          .feature-icon { margin-right: 12px; font-size: 18px; }
          .btn-container { text-align: center; margin: 32px 0 20px 0; }
          .btn { display: inline-block; background: #2563eb; color: #ffffff !important; text-decoration: none; padding: 14px 34px; border-radius: 8px; font-size: 15px; font-weight: 600; box-shadow: 0 4px 12px rgba(37, 99, 235, 0.25); }
          .footer { background: #f8fafc; border-top: 1px solid #e2e8f0; padding: 24px 30px; text-align: center; font-size: 13px; color: #94a3b8; }
          .footer p { margin: 4px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>SoftPro Innovation</h1>
            <p>Your Premier Shopping Destination</p>
          </div>
          <div class="content">
            <div class="greeting">Hi ${customerName} 👋,</div>
            <p class="message">
              Thank you for creating an account with <strong>SoftPro Innovation</strong>! We're thrilled to have you with us.
              Your account has been successfully set up and is ready to use.
            </p>
            <div class="feature-box">
              <div class="feature-item">
                <span class="feature-icon">✨</span>
                <span>Explore the latest technology and top products</span>
              </div>
              <div class="feature-item">
                <span class="feature-icon">🚚</span>
                <span>Fast, reliable doorstep delivery</span>
              </div>
              <div class="feature-item">
                <span class="feature-icon">🔒</span>
                <span>100% secure payments via UPI, Cards, and Cash on Delivery</span>
              </div>
            </div>
            <div class="btn-container">
              <a href="${process.env.CLIENT_URL || 'http://localhost:5173'}" class="btn">Start Shopping Now</a>
            </div>
          </div>
          <div class="footer">
            <p>Need assistance? Reach out to us at <a href="mailto:${process.env.MAIL_USER}" style="color: #2563eb; text-decoration: none;">${process.env.MAIL_USER}</a></p>
            <p>&copy; ${new Date().getFullYear()} SoftPro Innovation. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`Welcome email sent to ${to}: ${info.messageId}`);
    return { sent: true, messageId: info.messageId };
  } catch (error) {
    console.error(`Failed to send welcome email to ${to}:`, error.message);
    return { sent: false, error: error.message };
  }
};

/**
 * Send reply to user complaints
 */
const sendComplaintReply = async ({ to, customerName, subject, reply }) => {
  if (!isMailConfigured()) {
    return { sent: false, reason: 'SMTP settings are not configured' };
  }

  const transporter = getTransporter();

  try {
    const info = await transporter.sendMail({
      from: `"SoftPro Innovation" <${process.env.MAIL_FROM || process.env.MAIL_USER}>`,
      to,
      subject: `Re: ${subject}`,
      text: `Hello ${customerName || 'Customer'},\n\n${reply}\n\nRegards,\nSoftPro Innovation`,
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px;">
          <h3 style="color: #2563eb;">SoftPro Innovation Support</h3>
          <p>Hello <strong>${customerName || 'Customer'}</strong>,</p>
          <p>${reply.replace(/\n/g, '<br>')}</p>
          <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
          <p style="font-size: 12px; color: #888;">SoftPro Innovation Customer Support Team</p>
        </div>
      `,
    });
    return { sent: true, messageId: info.messageId };
  } catch (error) {
    console.error('Failed to send complaint reply:', error.message);
    return { sent: false, error: error.message };
  }
};

/**
 * Send an email notification to admin when someone submits a contact inquiry
 */
const sendContactInquiryNotification = async ({ name, email, category, subject, message }) => {
  if (!isMailConfigured()) {
    console.warn('Mail service not configured: skipping contact notification.');
    return { sent: false, reason: 'SMTP settings are not configured' };
  }

  const transporter = getTransporter();
  const adminEmail = process.env.ADMIN_EMAIL || 'nabab9695ali@gmail.com';

  const mailOptions = {
    from: `"SoftPro Innovation Support" <${process.env.MAIL_FROM || process.env.MAIL_USER}>`,
    to: adminEmail,
    replyTo: email,
    subject: `📩 New Contact Message from ${name}: ${subject}`,
    text: `New customer inquiry on SoftPro Innovation:\n\nCustomer: ${name}\nEmail: ${email}\nCategory: ${category}\nSubject: ${subject}\n\nMessage:\n${message}\n\nReceived At: ${new Date().toLocaleString('en-IN')}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f1f5f9; margin: 0; padding: 20px; }
          .card { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.08); border: 1px solid #e2e8f0; }
          .header { background: linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%); color: #ffffff; padding: 28px 24px; text-align: center; }
          .header h2 { margin: 0; font-size: 22px; font-weight: 700; }
          .content { padding: 28px 24px; color: #334155; }
          .info-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
          .info-table td { padding: 10px 12px; border-bottom: 1px solid #f1f5f9; font-size: 14px; }
          .info-label { font-weight: 600; color: #64748b; width: 140px; }
          .info-val { color: #0f172a; font-weight: 500; }
          .msg-box { background: #f8fafc; border-left: 4px solid #2563eb; padding: 16px; border-radius: 6px; font-size: 14px; line-height: 1.6; color: #1e293b; margin: 12px 0 20px 0; }
          .footer { background: #f8fafc; border-top: 1px solid #e2e8f0; padding: 16px; text-align: center; font-size: 12px; color: #94a3b8; }
          .btn { display: inline-block; background: #2563eb; color: #ffffff !important; padding: 12px 28px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="card">
          <div class="header">
            <h2>📩 New Customer Contact Message</h2>
            <p style="margin: 6px 0 0 0; opacity: 0.9; font-size: 13px;">SoftPro Innovation Contact Us Inquiry</p>
          </div>
          <div class="content">
            <table class="info-table">
              <tr>
                <td class="info-label">Customer Name:</td>
                <td class="info-val"><strong>${name}</strong></td>
              </tr>
              <tr>
                <td class="info-label">Customer Email:</td>
                <td class="info-val"><a href="mailto:${email}" style="color: #2563eb; font-weight: 600;">${email}</a></td>
              </tr>
              <tr>
                <td class="info-label">Category:</td>
                <td class="info-val"><span style="background: #eff6ff; color: #1d4ed8; padding: 4px 10px; border-radius: 12px; font-size: 12px; font-weight: 600;">${category}</span></td>
              </tr>
              <tr>
                <td class="info-label">Subject:</td>
                <td class="info-val"><strong>${subject}</strong></td>
              </tr>
              <tr>
                <td class="info-label">Received At:</td>
                <td class="info-val">${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}</td>
              </tr>
            </table>

            <div style="font-weight: 600; color: #0f172a; font-size: 14px;">Customer Message:</div>
            <div class="msg-box">
              ${message.replace(/\n/g, '<br>')}
            </div>

            <div style="text-align: center; margin-top: 24px;">
              <a href="mailto:${email}?subject=Re: ${encodeURIComponent(subject)}" class="btn">Reply to Customer (${email})</a>
            </div>
          </div>
          <div class="footer">
            This message was submitted via the Contact Us page on SoftPro Innovation.
          </div>
        </div>
      </body>
      </html>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`Contact notification email sent to ${adminEmail}: ${info.messageId}`);
    return { sent: true, messageId: info.messageId };
  } catch (error) {
    console.error(`Failed to send contact notification to ${adminEmail}:`, error.message);
    return { sent: false, error: error.message };
  }
};

module.exports = { sendWelcomeEmail, sendComplaintReply, sendContactInquiryNotification };
