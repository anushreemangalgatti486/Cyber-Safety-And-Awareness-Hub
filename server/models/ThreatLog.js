const mongoose = require('mongoose');

/**
 * ThreatLog Model - Immutable blockchain-style activity log
 * Records all significant system events for audit trail
 */
const threatLogSchema = new mongoose.Schema({
  // Log entry type
  action: {
    type: String,
    required: true,
    enum: [
      'REPORT_SUBMITTED',
      'REPORT_VERIFIED',
      'REPORT_MARKED_SAFE',
      'REPORT_REJECTED',
      'ALERT_SENT',
      'EMERGENCY_BROADCAST',
      'USER_REGISTERED',
      'ADMIN_LOGIN',
      'SCAM_DETECTED',
      'THREAT_ESCALATED',
      'USER_LOGIN',
      'USER_LOGOUT',
      'FAILED_LOGIN',
      'PASSWORD_CHANGED',
      'PASSWORD_RESET_REQUESTED',
      'PASSWORD_RESET',
    ],
  },

  // Description
  description: {
    type: String,
    required: true,
  },

  // Actor
  actorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
  },
  actorName: {
    type: String,
    default: 'System',
  },

  // Related entities
  reportId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Report',
    default: null,
  },

  // Severity
  severity: {
    type: String,
    enum: ['info', 'low', 'medium', 'high', 'critical'],
    default: 'info',
  },

  // Blockchain fields
  logHash: {
    type: String,
    required: true,
  },
  previousLogHash: {
    type: String,
    default: '0000000000000000000000000000000000000000000000000000000000000000',
  },
  blockIndex: {
    type: Number,
    default: 0,
  },

  // Metadata
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {},
  },
}, {
  timestamps: true,
});

// Prevent updates to maintain immutability
threatLogSchema.pre('save', function(next) {
  if (!this.isNew) {
    const err = new Error('ThreatLog entries are immutable');
    return next(err);
  }
  next();
});

module.exports = mongoose.model('ThreatLog', threatLogSchema);
