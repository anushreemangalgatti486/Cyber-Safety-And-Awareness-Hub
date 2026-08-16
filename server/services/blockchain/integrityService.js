const { generateIntegrityHash } = require('./hashService');

/**
 * Builds the standard payload used for report hashing
 * @param {Object} report - The Mongoose report document
 * @returns {Object} The standard payload
 */
const buildReportPayload = (report) => {
  return {
    reportId: report._id.toString(),
    userId: report.userId ? report.userId.toString() : null,
    scamType: report.scamType,
    description: report.description,
    timestamp: report.hashCreatedAt ? new Date(report.hashCreatedAt).toISOString() : null,
  };
};

/**
 * Verifies the integrity of a report by recalculating its hash
 * and comparing it against the stored hash.
 * 
 * @param {Object} report - The Mongoose report document
 * @returns {Object} Verification result containing status and hashes
 */
const verifyReportIntegrity = (report) => {
  if (!report.reportHash) {
    return {
      integrity: 'Tampered',
      message: 'No integrity hash found on this report.',
    };
  }

  const payload = buildReportPayload(report);
  const calculatedHash = generateIntegrityHash(payload);

  if (calculatedHash === report.reportHash) {
    return {
      integrity: 'Verified',
      storedHash: report.reportHash,
      calculatedHash,
      verifiedAt: new Date().toISOString(),
    };
  }

  return {
    integrity: 'Tampered',
    storedHash: report.reportHash,
    calculatedHash,
    verifiedAt: new Date().toISOString(),
  };
};

module.exports = {
  buildReportPayload,
  verifyReportIntegrity
};
