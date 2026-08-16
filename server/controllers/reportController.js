const mongoose = require('mongoose');
const Report = require('../models/Report');
const User = require('../models/User');
const { createThreatLog } = require('../utils/threatLogger');
const { generateIntegrityHash } = require('../services/blockchain/hashService');
const { buildReportPayload, verifyReportIntegrity } = require('../services/blockchain/integrityService');

/**
 * @route   POST /api/reports
 * @desc    Submit a new scam report
 * @access  Private
 */
const createReport = async (req, res) => {
  try {
    const { scamType, description, riskLevel, scamUrl, phoneNumber } = req.body;
    let screenshot = '';

    if (req.file) {
      screenshot = req.file.path;
    }

    if (!scamType || !description) {
      return res.status(400).json({ message: 'Scam type and description are required' });
    }

    // Pre-generate report ID and timestamp for hashing
    const reportId = new mongoose.Types.ObjectId();
    const hashCreatedAt = new Date();
    const userId = req.user?._id || null;
    
    // Construct payload for the hash
    const payload = {
      reportId: reportId.toString(),
      userId: userId ? userId.toString() : null,
      scamType,
      description,
      timestamp: hashCreatedAt.toISOString(),
    };

    // Generate blockchain hash using the new service
    const reportHash = generateIntegrityHash(payload);

    // Get last report for legacy blockchain linking (if needed)
    const lastReport = await Report.findOne().sort({ createdAt: -1 });
    const previousHash = lastReport
      ? lastReport.reportHash
      : '0000000000000000000000000000000000000000000000000000000000000000';
    const blockIndex = lastReport ? lastReport.blockIndex + 1 : 0;

    // Calculate AI risk score based on keywords
    const aiRiskScore = calculateRiskScore(description, riskLevel);

    const reportData = {
      _id: reportId,
      scamType,
      description,
      screenshot,
      scamUrl: scamUrl || '',
      phoneNumber: phoneNumber || '',
      riskLevel: riskLevel || 'Low',
      aiRiskScore,
      previousHash,
      blockIndex,
      userId,
      reporterName: req.user?.name || 'Anonymous',
      hashCreatedAt,
      reportHash,
    };

    const report = await Report.create(reportData);

    // Update user stats
    if (req.user) {
      await User.findByIdAndUpdate(req.user._id, {
        $inc: { reportsSubmitted: 1, cyberScore: 10 },
      });
    }

    // Create threat log entry
    await createThreatLog({
      action: 'REPORT_SUBMITTED',
      description: `New ${riskLevel || 'Low'} risk ${scamType} report submitted`,
      actorId: userId,
      actorName: req.user?.name || 'Anonymous',
      reportId: report._id,
      severity: riskLevel === 'High' ? 'high' : riskLevel === 'Medium' ? 'medium' : 'low',
      metadata: { scamType, riskLevel, aiRiskScore },
    });

    // Emit socket event for real-time update
    const io = req.app.get('io');
    if (io) {
      io.emit('new_report', {
        report,
        message: `New ${riskLevel || 'Low'} risk ${scamType} report submitted`,
        type: riskLevel === 'High' ? 'danger' : riskLevel === 'Medium' ? 'warning' : 'info',
      });

      io.emit('new_activity', {
        type: 'REPORT_SUBMITTED',
        message: `New ${riskLevel || 'Low'} risk ${scamType} report submitted`,
        timestamp: new Date().toISOString(),
        actorName: req.user?.name || 'Anonymous'
      });

      // Update dashboard stats for all connected clients
      const stats = await getDashboardStats();
      io.emit('stats_update', stats);
    }

    res.status(201).json(report);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @route   GET /api/reports
 * @desc    Get all reports (user sees own, admin sees all)
 * @access  Private
 */
const getReports = async (req, res) => {
  try {
    let query = {};
    if (req.user.role !== 'admin' && req.user.role !== 'superadmin') {
      query.userId = req.user._id;
    }

    const reports = await Report.find(query)
      .sort({ createdAt: -1 })
      .populate('userId', 'name email')
      .populate('reviewedBy', 'name');

    res.status(200).json(reports);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @route   DELETE /api/reports/:id
 * @desc    Delete a report (admin only)
 * @access  Private/Admin
 */
const deleteReport = async (req, res) => {
  try {
    const report = await Report.findById(req.params.id);
    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }

    await Report.deleteOne({ _id: req.params.id });

    res.status(200).json({ id: req.params.id, message: 'Report deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @route   PUT /api/reports/:id/verify
 * @desc    Admin marks report as verified scam
 * @access  Private/Admin
 */
const verifyReport = async (req, res) => {
  try {
    const { adminNote } = req.body;
    const report = await Report.findById(req.params.id).populate('userId', 'name email');

    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }

    report.status = 'Verified';
    report.adminNote = adminNote || 'This has been verified as a scam threat.';
    report.reviewedBy = req.user._id;
    report.reviewedAt = new Date();
    await report.save();

    // Log the action
    await createThreatLog({
      action: 'REPORT_VERIFIED',
      description: `Report #${report._id} verified as scam by admin ${req.user.name}`,
      actorId: req.user._id,
      actorName: req.user.name,
      reportId: report._id,
      severity: report.riskLevel === 'High' ? 'critical' : 'high',
      metadata: { scamType: report.scamType, riskLevel: report.riskLevel },
    });

    // Emit real-time notification to the reporter
    const io = req.app.get('io');
    if (io) {
      const notification = {
        type: 'danger',
        title: '⚠️ CyberShield Warning',
        message: `Your report has been verified. This ${report.scamType} is a confirmed threat. ${report.adminNote}`,
        reportId: report._id,
        targetUserId: report.userId?._id?.toString(),
      };

      // Broadcast to all (in production, target specific user via room)
      io.emit('admin_notification', notification);

      io.emit('new_activity', {
        type: 'REPORT_VERIFIED',
        message: `Report verified as scam by admin ${req.user.name}`,
        timestamp: new Date().toISOString(),
        actorName: req.user.name
      });

      // Update stats
      const stats = await getDashboardStats();
      io.emit('stats_update', stats);
    }

    res.status(200).json(report);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @route   PUT /api/reports/:id/safe
 * @desc    Admin marks report as safe
 * @access  Private/Admin
 */
const markSafe = async (req, res) => {
  try {
    const { adminNote } = req.body;
    const report = await Report.findById(req.params.id).populate('userId', 'name email');

    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }

    report.status = 'Safe';
    report.adminNote = adminNote || 'This content has been reviewed and marked as safe.';
    report.reviewedBy = req.user._id;
    report.reviewedAt = new Date();
    await report.save();

    // Log the action
    await createThreatLog({
      action: 'REPORT_MARKED_SAFE',
      description: `Report #${report._id} marked safe by admin ${req.user.name}`,
      actorId: req.user._id,
      actorName: req.user.name,
      reportId: report._id,
      severity: 'info',
      metadata: { scamType: report.scamType },
    });

    // Emit real-time notification
    const io = req.app.get('io');
    if (io) {
      const notification = {
        type: 'safe',
        title: '✅ CyberShield Clearance',
        message: `Your report has been reviewed. ${report.adminNote}`,
        reportId: report._id,
        targetUserId: report.userId?._id?.toString(),
      };

      io.emit('admin_notification', notification);

      io.emit('new_activity', {
        type: 'REPORT_REJECTED',
        message: `Report marked safe by admin ${req.user.name}`,
        timestamp: new Date().toISOString(),
        actorName: req.user.name
      });

      const stats = await getDashboardStats();
      io.emit('stats_update', stats);
    }

    res.status(200).json(report);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @route   POST /api/reports/:id/verify-integrity
 * @desc    Verify the integrity hash of a report
 * @access  Private/Admin
 */
const verifyIntegrity = async (req, res) => {
  try {
    const report = await Report.findById(req.params.id);
    
    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }

    const verificationResult = verifyReportIntegrity(report);
    
    res.status(200).json(verificationResult);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * Helper: Calculate AI risk score from description text
 */
const calculateRiskScore = (description, riskLevel) => {
  const text = description.toLowerCase();
  let score = 0;

  const highRiskTerms = ['urgent', 'click now', 'kyc', 'otp', 'verify now', 'bank account', 'upi', 'lottery', 'free gift', 'claim reward', 'suspended', 'win money', 'password', 'credit card', 'ssn', 'social security'];
  const mediumRiskTerms = ['investment', 'crypto', 'telegram', 'whatsapp', 'part time job', 'easy money', 'work from home', 'prize', 'winner', 'selected'];

  highRiskTerms.forEach(term => { if (text.includes(term)) score += 15; });
  mediumRiskTerms.forEach(term => { if (text.includes(term)) score += 8; });

  // Factor in user-selected risk level
  if (riskLevel === 'High') score += 30;
  else if (riskLevel === 'Medium') score += 15;

  return Math.min(score, 100);
};

/**
 * Helper: Get current dashboard stats
 */
const getDashboardStats = async () => {
  const [totalReports, pendingReports, highRiskReports, verifiedReports, safeReports] = await Promise.all([
    Report.countDocuments(),
    Report.countDocuments({ status: 'Pending' }),
    Report.countDocuments({ riskLevel: 'High' }),
    Report.countDocuments({ status: 'Verified' }),
    Report.countDocuments({ status: 'Safe' }),
  ]);

  return { totalReports, pendingReports, highRiskReports, verifiedReports, safeReports };
};

module.exports = { 
  createReport, 
  getReports, 
  deleteReport, 
  verifyReport, 
  markSafe, 
  verifyIntegrity 
};
