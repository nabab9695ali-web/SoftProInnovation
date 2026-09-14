const express = require('express');
const Complaint = require('../model/Complaint');
const { sendComplaintReply, sendContactInquiryNotification } = require('../services/mailService');

const Router = express.Router();

Router.post('/create', async (req, res) => {
  try {
    const { name, email, category, subject, message } = req.body;
    if (!name || !email || !category || !subject || !message) {
      return res.status(400).json({ success: false, message: 'All complaint fields are required' });
    }

    const complaint = await Complaint.create({ name, email, category, subject, message });

    // Send email notification to Admin (nabab9695ali@gmail.com)
    try {
      await sendContactInquiryNotification({ name, email, category, subject, message });
    } catch (mailErr) {
      console.error('Contact notification mail trigger failed:', mailErr.message);
    }

    return res.status(201).json({ success: true, message: 'Your message has been sent successfully!', complaint });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to submit complaint', error: error.message });
  }
});

Router.get('/show', async (req, res) => {
  try {
    const complaints = await Complaint.find().sort({ createdAt: -1 });
    return res.json(complaints);
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to fetch complaints', error: error.message });
  }
});

Router.post('/:id/reply', async (req, res) => {
  try {
    const reply = String(req.body.reply || '').trim();
    if (!reply) return res.status(400).json({ success: false, message: 'Reply message is required' });

    const complaint = await Complaint.findByIdAndUpdate(
      req.params.id,
      { adminReply: reply, repliedAt: new Date(), status: 'Resolved' },
      { new: true, runValidators: true }
    );
    if (!complaint) return res.status(404).json({ success: false, message: 'Complaint not found' });

    try {
      const mailResult = await sendComplaintReply({
        to: complaint.email,
        customerName: complaint.name,
        subject: complaint.subject,
        reply,
      });

      if (!mailResult.sent) {
        return res.status(503).json({
          success: false,
          saved: true,
          message: 'Reply saved, but email was not sent because SMTP settings are not configured.',
          complaint,
        });
      }

      return res.json({ success: true, emailSent: true, message: 'Reply saved and emailed to the customer.', complaint });
    } catch (mailError) {
      console.error('Complaint reply email error:', mailError.message);
      return res.status(502).json({
        success: false,
        saved: true,
        message: 'Reply saved, but email could not be sent. Check SMTP settings.',
        complaint,
      });
    }
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to save reply', error: error.message });
  }
});

Router.patch('/:id/status', async (req, res) => {
  try {
    const allowed = ['Open', 'In Progress', 'Resolved', 'Closed'];
    if (!allowed.includes(req.body.status)) {
      return res.status(400).json({ success: false, message: 'Invalid complaint status' });
    }
    const complaint = await Complaint.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true });
    if (!complaint) return res.status(404).json({ success: false, message: 'Complaint not found' });
    return res.json({ success: true, complaint });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to update complaint', error: error.message });
  }
});

module.exports = Router;