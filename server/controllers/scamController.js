const { createThreatLog } = require('../utils/threatLogger');

/**
 * @route   POST /api/detect-scam
 * @desc    AI-powered scam detection using keyword analysis
 * @access  Private
 */
const detectScam = async (req, res) => {
  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ message: 'Message content is required' });
    }

    const text = message.toLowerCase();

    // HIGH RISK KEYWORDS - immediate danger
    const highRiskKeywords = [
      'urgent', 'click now', 'kyc', 'otp', 'verify now', 'bank account',
      'upi', 'lottery', 'free gift', 'claim reward', 'suspended', 'win money',
      'password', 'credit card', 'ssn', 'social security', 'wire transfer',
      'western union', 'gift card', 'bitcoin', 'verify your account',
      'account suspended', 'immediate action', 'limited time', 'act now',
      'congratulations you won', 'selected winner', 'claim your prize',
    ];

    // MEDIUM RISK - social engineering
    const mediumRiskKeywords = [
      'wrong number', 'you seem nice', 'investment opportunity', 'crypto',
      'telegram', 'whatsapp me', 'part time job', 'easy money', 'work from home',
      'passive income', 'double your money', 'guaranteed returns', 'no risk',
      'secret method', 'exclusive offer', 'limited seats', 'join now',
    ];

    // LOW RISK - suspicious but not definitive
    const lowRiskKeywords = [
      'click here', 'free', 'discount', 'offer', 'deal', 'subscribe',
      'unsubscribe', 'confirm', 'update', 'verify',
    ];

    let matchedHigh = [];
    let matchedMedium = [];
    let matchedLow = [];

    highRiskKeywords.forEach(kw => { if (text.includes(kw)) matchedHigh.push(kw); });
    mediumRiskKeywords.forEach(kw => { if (text.includes(kw)) matchedMedium.push(kw); });
    lowRiskKeywords.forEach(kw => { if (text.includes(kw)) matchedLow.push(kw); });

    // URL detection
    const urlPattern = /https?:\/\/[^\s]+/gi;
    const urls = message.match(urlPattern) || [];
    const suspiciousUrlPatterns = ['bit.ly', 'tinyurl', 'goo.gl', 't.co', 'ow.ly', 'short.link'];
    const hasSuspiciousUrl = urls.some(url =>
      suspiciousUrlPatterns.some(pattern => url.includes(pattern))
    );

    // Determine risk level
    let riskLevel, warningMessage, riskScore;

    if (matchedHigh.length >= 2 || (matchedHigh.length >= 1 && hasSuspiciousUrl)) {
      riskLevel = 'High';
      riskScore = Math.min(60 + matchedHigh.length * 10 + matchedMedium.length * 5, 100);
      warningMessage = `⚠️ CRITICAL THREAT DETECTED. This message contains ${matchedHigh.length} high-risk indicator(s). This is almost certainly a scam. Do NOT click any links, share personal information, or respond to this message. Report it immediately.`;
    } else if (matchedHigh.length === 1 || matchedMedium.length >= 2) {
      riskLevel = 'Medium';
      riskScore = Math.min(30 + matchedHigh.length * 10 + matchedMedium.length * 8, 59);
      warningMessage = `⚡ SUSPICIOUS ACTIVITY DETECTED. This message shows signs of social engineering or phishing. Exercise extreme caution. Do not share personal or financial information. Verify the sender through official channels before taking any action.`;
    } else if (matchedLow.length > 0 || matchedMedium.length === 1) {
      riskLevel = 'Low';
      riskScore = Math.min(5 + matchedLow.length * 3 + matchedMedium.length * 5, 29);
      warningMessage = `ℹ️ LOW RISK DETECTED. This message contains some common marketing or notification language. While not immediately dangerous, remain cautious and verify the sender's identity before clicking any links or providing information.`;
    } else {
      riskLevel = 'Low';
      riskScore = 0;
      warningMessage = `✅ NO SIGNIFICANT THREATS DETECTED. This message appears to be safe based on our analysis. However, always exercise caution with unsolicited messages and never share sensitive personal information.`;
    }

    const allMatched = [...matchedHigh, ...matchedMedium, ...matchedLow];

    // Log high-risk detections
    if (riskLevel === 'High') {
      await createThreatLog({
        action: 'SCAM_DETECTED',
        description: `High-risk scam detected: keywords [${matchedHigh.join(', ')}]`,
        actorId: req.user?._id || null,
        actorName: req.user?.name || 'Anonymous',
        severity: 'high',
        metadata: { riskLevel, riskScore, matchedKeywords: allMatched },
      });
    }

    res.status(200).json({
      riskLevel,
      riskScore,
      warningMessage,
      matchedKeywords: allMatched,
      matchedHigh,
      matchedMedium,
      matchedLow,
      urlsFound: urls,
      hasSuspiciousUrl,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { detectScam };
