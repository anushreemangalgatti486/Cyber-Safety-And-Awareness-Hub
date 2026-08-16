const express = require('express');
const router = express.Router();
const { analyzeText } = require('../services/scamAnalyzer');

// @route   POST /api/ai/analyze
// @desc    Analyze text for potential scams using rule-based AI
// @access  Public (or protected depending on requirements, currently Public to match Scam Scanner)
router.post('/analyze', async (req, res) => {
  try {
    const { text } = req.body;
    
    if (!text || typeof text !== 'string') {
      return res.status(400).json({ success: false, error: 'Valid text is required for analysis.' });
    }

    const result = analyzeText(text);

    return res.status(200).json(result);
  } catch (error) {
    console.error('[AI Analyzer Error]', error.message);
    res.status(500).json({ success: false, error: 'Internal Server Error during analysis.' });
  }
});

module.exports = router;
