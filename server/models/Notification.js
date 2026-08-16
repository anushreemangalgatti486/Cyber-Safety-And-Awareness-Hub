const mongoose = require('mongoose');

/**
 * Notification Model - Stores admin-sent alerts and system notifications
 */
const notificationSchema = new mongoose.Schema({
  // Target: 'all' for broadcast, userId for specific user
  targetType: {
    type: String,
    enum: ['all', 'user'],
    default: 'all',
  },
  targetUserId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
  },

  // Notification content
  title: {
    type: String,
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: ['warning', 'danger', 'safe', 'info', 'emergency'],
    default: 'info',
  },

  // Related report (if any)
  reportId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Report',
    default: null,
  },

  // Sent by admin
  sentBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
  },

  // Read tracking
  readBy: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],
}, {
  timestamps: true,
});

module.exports = mongoose.model('Notification', notificationSchema);
