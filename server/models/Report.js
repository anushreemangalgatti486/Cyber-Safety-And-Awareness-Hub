const mongoose = require('mongoose');

/**
 * Report Model - Stores user-submitted scam/fraud reports
 * Includes blockchain-style hash linking for immutability
 */
const reportSchema = new mongoose.Schema({
  // Reporter info
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false, // Allow anonymous reports
  },
  reporterName: {
    type: String,
    default: 'Anonymous',
  },

  // Report content
  scamType: {
    type: String,
    required: true,
    enum: ['SMS Scam', 'WhatsApp Scam', 'Fraud Call', 'Email Phishing', 'Scam URL', 'Phishing', 'Ransomware', 'Identity Theft', 'Social Engineering', 'Other'],
  },
  description: {
    type: String,
    required: true,
  },
  screenshot: {
    type: String, // File path
    default: '',
  },
  scamUrl: {
    type: String,
    default: '',
  },
  phoneNumber: {
    type: String,
    default: '',
  },

  // Risk assessment
  riskLevel: {
    type: String,
    enum: ['Low', 'Medium', 'High'],
    default: 'Low',
  },
  aiRiskScore: {
    type: Number,
    default: 0,
    min: 0,
    max: 100,
  },

  // Admin review status
  status: {
    type: String,
    enum: ['Pending', 'Verified', 'Safe', 'Rejected'],
    default: 'Pending',
  },
  adminNote: {
    type: String,
    default: '',
  },
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
  },
  reviewedAt: {
    type: Date,
    default: null,
  },

  // Blockchain simulation fields
  reportHash: {
    type: String,
    default: '',
  },
  hashCreatedAt: {
    type: Date,
    default: null,
  },
  previousHash: {
    type: String,
    default: '0000000000000000000000000000000000000000000000000000000000000000',
  },
  blockIndex: {
    type: Number,
    default: 0,
  },
}, {
  timestamps: true,
});

// Index for fast queries
reportSchema.index({ status: 1, riskLevel: 1, createdAt: -1 });

module.exports = mongoose.model('Report', reportSchema);
