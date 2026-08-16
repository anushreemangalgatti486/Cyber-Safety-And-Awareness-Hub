const express = require('express');
const router = express.Router();
const {
  getStats,
  getReports,
  getUsers,
  getThreatLogs,
  sendBroadcast,
  deactivateUser,
  getAnalytics,
} = require('../controllers/adminController');
const { protect, admin } = require('../middleware/authMiddleware');

// All admin routes require authentication + admin role
router.use(protect, admin);

router.get('/stats', getStats);
router.get('/reports', getReports);
router.get('/users', getUsers);
router.get('/threat-logs', getThreatLogs);
router.get('/analytics', getAnalytics);
router.post('/broadcast', sendBroadcast);
router.put('/users/:id/deactivate', deactivateUser);

module.exports = router;
