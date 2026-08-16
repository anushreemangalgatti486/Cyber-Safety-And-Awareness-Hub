const Tesseract = require('tesseract.js');

exports.extractText = async (imagePath) => {
  try {
    const { data: { text, confidence } } = await Tesseract.recognize(
      imagePath,
      'eng',
      {
        // Suppress verbose logging if needed, or keep for debugging
        logger: m => {} 
      }
    );
    
    return {
      success: true,
      extractedText: text.trim(),
      confidence: Math.round(confidence)
    };
  } catch (error) {
    console.error('Tesseract Error:', error);
    throw new Error('Failed to extract text from the image.');
  }
};
