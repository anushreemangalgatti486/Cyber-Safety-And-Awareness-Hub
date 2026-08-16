const express = require('express');
const router = express.Router();
const uploadOcr = require('../middleware/uploadOcrMiddleware');
const ocrController = require('../controllers/ocrController');

// Define route, handling potential multer errors smoothly
router.post('/extract', (req, res, next) => {
  uploadOcr.single('image')(req, res, (err) => {
    if (err) {
      return res.status(400).json({ success: false, error: err.message });
    }
    next();
  });
}, ocrController.extractText);

module.exports = router;
