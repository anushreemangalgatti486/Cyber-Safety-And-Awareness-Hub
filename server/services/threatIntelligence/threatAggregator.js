const urlAnalyzer = require('../urlAnalyzer');
const virusTotalService = require('./virusTotalService');
const googleSafeBrowsingService = require('./googleSafeBrowsingService');
const abuseIPDBService = require('./abuseIPDBService');

exports.analyze = async (url) => {
  const baseResult = urlAnalyzer.analyzeUrl(url);

  const [vtResult, gsbResult, abuseResult] = await Promise.allSettled([
    virusTotalService.analyzeUrl(url),
    googleSafeBrowsingService.analyzeUrl(url),
    abuseIPDBService.analyzeUrl(url)
  ]);

  const vt = vtResult.status === 'fulfilled' && vtResult.value ? vtResult.value : { status: 'Unavailable', stats: null };
  const gsb = gsbResult.status === 'fulfilled' && gsbResult.value ? gsbResult.value : { status: 'Unavailable', matches: null };
  const abuse = abuseResult.status === 'fulfilled' && abuseResult.value ? abuseResult.value : { status: 'Unavailable', score: null };

  let additionalRisk = 0;
  
  if (vt.status === 'Malicious') additionalRisk += 40;
  else if (vt.status === 'Suspicious') additionalRisk += 20;

  if (gsb.status === 'Malicious') additionalRisk += 50;
  
  if (abuse.status === 'Malicious') additionalRisk += 30;
  else if (abuse.status === 'Suspicious') additionalRisk += (abuse.score / 5);

  let finalRiskScore = Math.min(baseResult.riskScore + additionalRisk, 100);

  let finalThreatLevel = 'Safe';
  if (finalRiskScore >= 75) finalThreatLevel = 'Critical';
  else if (finalRiskScore >= 50) finalThreatLevel = 'High';
  else if (finalRiskScore >= 25) finalThreatLevel = 'Medium';
  else if (finalRiskScore > 0) finalThreatLevel = 'Low';

  let finalCategory = baseResult.category;
  if (finalRiskScore >= 75) {
    finalCategory = 'Phishing/Malicious Website';
  } else if (finalRiskScore >= 50) {
    finalCategory = 'Suspicious Site';
  }

  const allReasons = [...baseResult.reasons];
  if (vt.status === 'Malicious') allReasons.push('VirusTotal flagged this URL as Malicious.');
  if (gsb.status === 'Malicious') allReasons.push('Google Safe Browsing identified this URL as dangerous.');
  if (abuse.status === 'Malicious') allReasons.push('AbuseIPDB reported high abuse confidence for this host IP.');

  return {
    ...baseResult,
    riskScore: Math.round(finalRiskScore),
    threatLevel: finalThreatLevel,
    category: finalCategory,
    reasons: allReasons,
    virusTotalStatus: vt.status,
    safeBrowsingStatus: gsb.status,
    abuseIPDBStatus: abuse.status,
    scanTimestamp: new Date().toISOString()
  };
};
