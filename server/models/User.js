const mongoose = require('mongoose');

/**
 * User Model - Stores registered users and admin accounts
 */
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ['user', 'admin', 'superadmin'],
    default: 'user',
  },
  avatar: {
    type: String,
    default: '',
  },
  // Stats
  reportsSubmitted: {
    type: Number,
    default: 0,
  },
  scamsBlocked: {
    type: Number,
    default: 0,
  },
  cyberScore: {
    type: Number,
    default: 0,
  },
  // Account status
  isActive: {
    type: Boolean,
    default: true,
  },
  lastLogin: {
    type: Date,
    default: null,
  },
  // Auth tokens
  refreshToken: {
    type: String,
    default: null,
  },
  resetPasswordToken: {
    type: String,
    default: null,
  },
  resetPasswordExpire: {
    type: Date,
    default: null,
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('User', userSchema);
