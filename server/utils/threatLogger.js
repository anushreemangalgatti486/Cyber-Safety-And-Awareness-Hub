const ThreatLog = require('../models/ThreatLog');
const { generateBlockHash } = require('./hash');

/**
 * Creates an immutable blockchain-style threat log entry
 * @param {Object} params
 * @param {string} params.action - Log action type
 * @param {string} params.description - Human-readable description
 * @param {string} [params.actorId] - User ID of actor
 * @param {string} [params.actorName] - Name of actor
 * @param {string} [params.reportId] - Related report ID
 * @param {string} [params.severity] - Severity level
 * @param {Object} [params.metadata] - Extra metadata
 * @returns {Promise<ThreatLog>}
 */
const createThreatLog = async ({
  action,
  description,
  actorId = null,
  actorName = 'System',
  reportId = null,
  severity = 'info',
  metadata = {},
}) => {
  try {
    // Get last log for blockchain linking
    const lastLog = await ThreatLog.findOne().sort({ createdAt: -1 });
    const previousLogHash = lastLog
      ? lastLog.logHash
      : '0000000000000000000000000000000000000000000000000000000000000000';
    const blockIndex = lastLog ? lastLog.blockIndex + 1 : 0;

    const logData = { action, description, actorId, actorName, reportId, severity, metadata };
    const logHash = generateBlockHash(logData, previousLogHash, blockIndex);

    const log = await ThreatLog.create({
      action,
      description,
      actorId,
      actorName,
      reportId,
      severity,
      metadata,
      logHash,
      previousLogHash,
      blockIndex,
    });

    return log;
  } catch (err) {
    // Non-critical: log to console but don't crash the request
    console.error('[ThreatLogger] Failed to create log:', err.message);
    return null;
  }
};

module.exports = { createThreatLog };
