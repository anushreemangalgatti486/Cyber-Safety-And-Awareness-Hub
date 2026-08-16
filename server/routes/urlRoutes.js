const express = require('express');
const router = express.Router();
const urlController = require('../controllers/urlController');

// Analyze URL route
router.post('/analyze', urlController.analyzeUrl);

module.exports = router;
