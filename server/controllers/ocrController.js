const fs = require('fs');
const ocrService = require('../services/ocrService');

exports.extractText = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'No image uploaded.' });
    }

    const imagePath = req.file.path;
    const result = await ocrService.extractText(imagePath);

    // Clean up the uploaded file to save disk space
    fs.unlink(imagePath, (err) => {
      if (err) console.error('Failed to delete temporary OCR image:', err);
    });

    if (!result.extractedText) {
      return res.status(400).json({ 
        success: false, 
        error: 'No text could be found in this image. Try a clearer image.' 
      });
    }

    return res.status(200).json(result);

  } catch (error) {
    console.error('OCR Extraction Error:', error);
    
    // Attempt cleanup if an error occurred
    if (req.file && req.file.path) {
      fs.unlink(req.file.path, () => {});
    }

    res.status(500).json({ success: false, error: 'Internal Server Error during OCR.' });
  }
};
