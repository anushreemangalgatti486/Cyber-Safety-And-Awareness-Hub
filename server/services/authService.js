const jwt = require('jsonwebtoken');
const crypto = require('crypto');

/**
 * Generate Access Token
 * Expires relatively quickly (e.g., 15 minutes or 1 hour)
 */
const generateAccessToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, {
    expiresIn: '15m',
  });
};

/**
 * Generate Refresh Token
 * Expires in 30 days
 */
const generateRefreshToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

/**
 * Generate Password Reset Token
 */
const generateResetPasswordToken = () => {
  // Generate token
  const resetToken = crypto.randomBytes(20).toString('hex');

  // Hash token to save in db
  const resetPasswordToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  return { resetToken, resetPasswordToken };
};

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  generateResetPasswordToken
};
