const express = require('express');
const router = express.Router();
const { 
  registerUser, 
  loginUser, 
  logoutUser,
  refreshToken,
  changePassword,
  forgotPassword,
  resetPassword,
  getMe 
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/logout', logoutUser);
router.get('/refresh', refreshToken);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:token', resetPassword);

// Protected routes
router.post('/change-password', protect, changePassword);
router.get('/me', protect, getMe);

module.exports = router;
