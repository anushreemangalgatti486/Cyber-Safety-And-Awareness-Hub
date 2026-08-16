const crypto = require('crypto');

/**
 * Generates a SHA-256 hash for a given payload.
 * Deterministically stringifies the object before hashing.
 * 
 * @param {Object} payload - The data to hash
 * @returns {string} The SHA-256 hash in hex format
 */
const generateIntegrityHash = (payload) => {
  // Ensure consistent property order by sorting keys
  const sortedPayload = {};
  Object.keys(payload).sort().forEach(key => {
    sortedPayload[key] = payload[key];
  });

  const stringifiedData = JSON.stringify(sortedPayload);
  return crypto.createHash('sha256').update(stringifiedData).digest('hex');
};

module.exports = {
  generateIntegrityHash
};
