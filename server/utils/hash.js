const crypto = require('crypto');

/**
 * Generate SHA-256 hash for blockchain simulation
 * @param {Object|string} data - Data to hash
 * @returns {string} Hex hash string
 */
const generateHash = (data) => {
  const str = typeof data === 'string' ? data : JSON.stringify(data);
  return crypto.createHash('sha256').update(str).digest('hex');
};

/**
 * Generate a blockchain-style log hash
 * @param {Object} logData - Log entry data
 * @param {string} previousHash - Previous block hash
 * @param {number} blockIndex - Block index
 * @returns {string} Hex hash string
 */
const generateBlockHash = (logData, previousHash, blockIndex) => {
  const blockString = JSON.stringify({
    ...logData,
    previousHash,
    blockIndex,
    timestamp: Date.now(),
  });
  return crypto.createHash('sha256').update(blockString).digest('hex');
};

module.exports = { generateHash, generateBlockHash };
