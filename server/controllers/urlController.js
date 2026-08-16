const threatAggregator = require('../services/threatIntelligence/threatAggregator');

exports.analyzeUrl = async (req, res) => {
  try {
    const { url } = req.body;
    
    if (!url || typeof url !== 'string' || url.trim() === '') {
      return res.status(400).json({ error: 'Please provide a valid URL to analyze.' });
    }

    // Run the aggregated threat intelligence logic
    const analysisResult = await threatAggregator.analyze(url.trim());

    // Artificial delay to simulate scanning and make the UI loading state visible
    setTimeout(() => {
      res.json(analysisResult);
    }, 1500);

  } catch (error) {
    console.error('URL Analysis Error:', error);
    res.status(500).json({ error: 'Failed to analyze URL' });
  }
};
