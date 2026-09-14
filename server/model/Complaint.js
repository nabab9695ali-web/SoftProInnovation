const mongoose = require('mongoose');

const complaintSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    category: { type: String, required: true, trim: true },
    subject: { type: String, required: true, trim: true },
    message: { type: String, required: true, trim: true },
    adminReply: { type: String, default: '', trim: true },
    repliedAt: { type: Date, default: null },
    status: { type: String, enum: ['Open', 'In Progress', 'Resolved', 'Closed'], default: 'Open' }
  },
  { timestamps: true }
);

const Complaint = mongoose.models.Complaint || mongoose.model('Complaint', complaintSchema);
module.exports = Complaint;