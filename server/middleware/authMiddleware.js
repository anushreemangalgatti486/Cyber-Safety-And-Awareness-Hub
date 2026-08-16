const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // Get token
      token = req.headers.authorization.split(' ')[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Get user
      req.user = await User.findById(decoded.id).select('-password');

      return next();
    } catch (error) {
      console.error(error);

      return res.status(401).json({
        message: 'Not authorized, token failed'
      });
    }
  }

  return res.status(401).json({
    message: 'Not authorized, no token'
  });
};

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        message: `User role '${req.user ? req.user.role : 'none'}' is not authorized to access this route`
      });
    }
    next();
  };
};

// Keep legacy admin middleware for backwards compatibility if needed, or point it to authorize
const admin = authorize('admin', 'superadmin');

module.exports = { protect, admin, authorize };