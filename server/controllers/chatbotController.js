const { processChatMessage } = require('../services/chatbotService');

/**
 * @route   POST /api/chat
 * @desc    Handle chat messages for the AI Assistant
 * @access  Public or Private (depending on implementation)
 */
const handleChat = async (req, res) => {
  try {
    const { message } = req.body;
    
    if (!message) {
      return res.status(400).json({ message: 'Message is required' });
    }

    const response = await processChatMessage(message);
    
    res.status(200).json(response);
  } catch (error) {
    res.status(500).json({ message: error.message || 'An error occurred while processing the chat.' });
  }
};

module.exports = {
  handleChat
};
