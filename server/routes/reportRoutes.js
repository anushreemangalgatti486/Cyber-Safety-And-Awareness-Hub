const express = require('express');
const router = express.Router();
const {
  createReport,
  getReports,
  deleteReport,
  verifyReport,
  markSafe,
  verifyIntegrity,
} = require('../controllers/reportController');
const { protect, admin, authorize } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

// User routes
router.route('/')
  .post(protect, upload.single('screenshot'), createReport)
  .get(protect, getReports);

// Admin actions on specific reports
router.route('/:id')
  .delete(protect, admin, deleteReport);

router.put('/:id/verify', protect, admin, verifyReport);
router.put('/:id/safe', protect, admin, markSafe);
router.post('/:id/verify-integrity', protect, admin, verifyIntegrity);

module.exports = router;
