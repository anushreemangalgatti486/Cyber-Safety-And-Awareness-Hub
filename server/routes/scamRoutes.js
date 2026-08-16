const express = require('express');
const router = express.Router();
const { detectScam } = require('../controllers/scamController');
const { protect } = require('../middleware/authMiddleware');

router.post('/detect-scam', protect, detectScam);

module.exports = router;
