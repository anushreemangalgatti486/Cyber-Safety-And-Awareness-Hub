const User = require('../models/User');
const Report = require('../models/Report');
const ThreatLog = require('../models/ThreatLog');
const Notification = require('../models/Notification');
const { createThreatLog } = require('../utils/threatLogger');

/**
 * @route   GET /api/admin/stats
 * @desc    Get dashboard statistics (all start at 0, grow with real data)
 * @access  Private/Admin
 */
const getStats = async (req, res) => {
  try {
    const [
      totalUsers,
      totalReports,
      pendingReports,
      highRiskReports,
      verifiedReports,
      safeReports,
      totalLogs,
    ] = await Promise.all([
      User.countDocuments({ role: 'user' }),
      Report.countDocuments(),
      Report.countDocuments({ status: 'Pending' }),
      Report.countDocuments({ riskLevel: 'High' }),
      Report.countDocuments({ status: 'Verified' }),
      Report.countDocuments({ status: 'Safe' }),
      ThreatLog.countDocuments(),
    ]);

    // Active threats = pending + verified (not yet resolved)
    const activeThreats = pendingReports + verifiedReports;

    // Mock numbers for new dashboard widgets
    const aiScans = Math.floor(totalReports * 1.5) + 120; // Example derivation
    const webRepScans = Math.floor(totalReports * 0.8) + 45;
    const ocrScans = Math.floor(totalReports * 0.4) + 12;
    const tiApiChecks = Math.floor(totalReports * 2.2) + 200;

    res.status(200).json({
      totalUsers,
      totalReports,
      pendingReports,
      highRiskReports,
      verifiedReports,
      safeReports,
      activeThreats,
      totalLogs,
      // Scam alerts = verified reports
      scamAlerts: verifiedReports,
      rejectedReports: totalReports - pendingReports - verifiedReports - safeReports > 0 
        ? totalReports - pendingReports - verifiedReports - safeReports 
        : 0,
      aiScans,
      webRepScans,
      ocrScans,
      tiApiChecks,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @route   GET /api/admin/reports
 * @desc    Get all reports with full details
 * @access  Private/Admin
 */
const getReports = async (req, res) => {
  try {
    const { status, riskLevel, limit = 100 } = req.query;
    let query = {};

    if (status) query.status = status;
    if (riskLevel) query.riskLevel = riskLevel;

    const reports = await Report.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .populate('userId', 'name email')
      .populate('reviewedBy', 'name');

    res.status(200).json(reports);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @route   GET /api/admin/users
 * @desc    Get all users
 * @access  Private/Admin
 */
const getUsers = async (req, res) => {
  try {
    const users = await User.find({ role: 'user' })
      .select('-password')
      .sort({ createdAt: -1 });

    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @route   GET /api/admin/threat-logs
 * @desc    Get blockchain activity logs
 * @access  Private/Admin
 */
const getThreatLogs = async (req, res) => {
  try {
    const { limit = 50 } = req.query;
    const logs = await ThreatLog.find()
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .populate('actorId', 'name email')
      .populate('reportId', 'scamType riskLevel');

    res.status(200).json(logs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @route   POST /api/admin/broadcast
 * @desc    Send emergency broadcast to all users
 * @access  Private/Admin
 */
const sendBroadcast = async (req, res) => {
  try {
    const { title, message, type = 'warning' } = req.body;

    if (!title || !message) {
      return res.status(400).json({ message: 'Title and message are required' });
    }

    // Save notification to DB
    const notification = await Notification.create({
      targetType: 'all',
      title,
      message,
      type,
      sentBy: req.user._id,
    });

    // Log the broadcast
    await createThreatLog({
      action: 'EMERGENCY_BROADCAST',
      description: `Emergency broadcast sent by ${req.user.name}: "${title}"`,
      actorId: req.user._id,
      actorName: req.user.name,
      severity: type === 'emergency' ? 'critical' : 'high',
      metadata: { title, message, type },
    });

    // Emit via Socket.io
    const io = req.app.get('io');
    if (io) {
      io.emit('admin_notification', {
        type,
        title,
        message,
        id: notification._id,
        timestamp: new Date().toISOString(),
      });

      io.emit('new_activity', {
        type: 'BROADCAST_SENT',
        message: `Emergency broadcast sent: "${title}"`,
        timestamp: new Date().toISOString(),
        actorName: req.user.name
      });
    }

    res.status(201).json({ success: true, notification });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @route   PUT /api/admin/users/:id/deactivate
 * @desc    Deactivate a user account
 * @access  Private/Admin
 */
const deactivateUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.isActive = false;
    await user.save();

    res.status(200).json({ message: 'User deactivated successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @route   GET /api/admin/analytics
 * @desc    Get threat analytics data for charts
 * @access  Private/Admin
 */
const getAnalytics = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    // Build date filter query for Reports
    const dateQuery = {};
    if (startDate && endDate) {
      dateQuery.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    } else {
      // Default to last 7 days if not provided
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      dateQuery.createdAt = { $gte: sevenDaysAgo };
    }

    // Build match stage
    const matchStage = Object.keys(dateQuery).length > 0 ? { $match: dateQuery } : { $match: {} };

    // 1. Reports by scam type
    const byType = await Report.aggregate([
      matchStage,
      { $group: { _id: '$scamType', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    // 2. Reports by risk level
    const byRisk = await Report.aggregate([
      matchStage,
      { $group: { _id: '$riskLevel', count: { $sum: 1 } } },
    ]);

    // 3. Reports by status
    const byStatus = await Report.aggregate([
      matchStage,
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);

    // 4. Daily Reports Trend
    const dailyReports = await Report.aggregate([
      matchStage,
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // 5. Monthly Reports (Mock or derive from daily)
    // For simplicity, we can aggregate by month if the range is large, but let's do monthly grouping explicitly
    const monthlyReports = await Report.aggregate([
      matchStage,
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } },
          count: { $sum: 1 },
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // 6. User Registration Trend
    const userQuery = Object.keys(dateQuery).length > 0 ? { createdAt: dateQuery.createdAt } : {};
    const userRegistrationTrend = await User.aggregate([
      { $match: { role: 'user', ...userQuery } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 },
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // 7. Threat Intelligence Dashboard (Derived/Mocked based on data)
    const mostCommonScamType = byType.length > 0 ? byType[0]._id : 'Unknown';
    
    // Calculate average risk score
    // Assuming High=90, Medium=50, Low=20 for average mapping
    let totalScore = 0;
    let totalRated = 0;
    byRisk.forEach(r => {
      const val = r._id === 'High' ? 90 : r._id === 'Medium' ? 50 : 20;
      totalScore += val * r.count;
      totalRated += r.count;
    });
    const averageRiskScore = totalRated > 0 ? Math.round(totalScore / totalRated) : 0;

    // Mock TI data
    const threatIntelligenceBoard = {
      mostCommonScamType,
      averageRiskScore,
      mostDangerousURLs: ['http://secure-login-update.com', 'http://free-crypto-giveaway.net', 'http://irs-tax-refund.org'],
      mostFrequentKeywords: ['urgent', 'password', 'verify', 'account suspended', 'crypto'],
      topCategories: ['Phishing', 'Malware', 'Financial Fraud']
    };

    // 8. Mock Geographical Heatmap Data (State level for US)
    const geoHeatmap = [
      { id: 'US-CA', value: Math.floor(Math.random() * 100) + 20 },
      { id: 'US-TX', value: Math.floor(Math.random() * 80) + 10 },
      { id: 'US-NY', value: Math.floor(Math.random() * 70) + 10 },
      { id: 'US-FL', value: Math.floor(Math.random() * 60) + 5 },
      { id: 'US-IL', value: Math.floor(Math.random() * 50) + 5 },
      { id: 'US-PA', value: Math.floor(Math.random() * 40) + 5 }
    ];

    // 9. Mock AI Detection Accuracy & TI Hits (Time series)
    // We'll generate a few data points to match dailyReports dates
    const aiAccuracy = dailyReports.map(d => ({
      date: d._id,
      accuracy: 85 + Math.floor(Math.random() * 10) // 85-95%
    }));

    const tiHits = dailyReports.map(d => ({
      date: d._id,
      virusTotal: Math.floor(d.count * 0.8),
      safeBrowsing: Math.floor(d.count * 0.6),
      abuseIPDB: Math.floor(d.count * 0.4)
    }));

    res.status(200).json({ 
      byType, 
      byRisk, 
      byStatus, 
      dailyReports,
      monthlyReports,
      userRegistrationTrend,
      threatIntelligenceBoard,
      geoHeatmap,
      aiAccuracy,
      tiHits
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getStats,
  getReports,
  getUsers,
  getThreatLogs,
  sendBroadcast,
  deactivateUser,
  getAnalytics,
};
