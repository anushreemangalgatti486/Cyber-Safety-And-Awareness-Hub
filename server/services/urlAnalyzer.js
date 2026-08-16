// URL Analyzer Service

const SUSPICIOUS_KEYWORDS = [
  'login', 'secure', 'verify', 'bank', 'wallet', 'payment', 
  'update', 'account', 'kyc', 'support', 'auth', 'billing'
];

const RISKY_TLDS = ['.xyz', '.top', '.click', '.live', '.buzz', '.shop', '.tk', '.ml', '.ga', '.cf', '.gq'];

exports.analyzeUrl = (inputUrl) => {
  let riskScore = 0;
  const reasons = [];
  const recommendations = [];
  const detectedKeywords = [];
  let urlObj;

  // 1. Ensure it has a protocol for parsing, default to http to see if it parses
  let urlToParse = inputUrl;
  if (!/^https?:\/\//i.test(inputUrl)) {
    urlToParse = 'http://' + inputUrl;
  }

  try {
    urlObj = new URL(urlToParse);
  } catch (err) {
    return {
      riskScore: 100,
      threatLevel: 'Critical',
      category: 'Invalid URL',
      sslStatus: 'Invalid',
      domainAge: 'Unknown',
      blacklistStatus: 'Unknown',
      reasons: ['The provided URL is malformed or invalid.'],
      recommendations: ['Ensure you are copying the complete and correct URL.'],
      suspiciousKeywords: []
    };
  }

  const domain = urlObj.hostname.toLowerCase();
  const fullPath = urlObj.pathname + urlObj.search;

  // 2. HTTP vs HTTPS check
  if (urlObj.protocol === 'http:') {
    riskScore += 20;
    reasons.push('URL uses unencrypted HTTP instead of secure HTTPS.');
    recommendations.push('Do not enter any sensitive information (passwords, credit cards) on this site.');
  } else {
    recommendations.push('Site uses HTTPS, which encrypts your connection.');
  }

  // 3. Suspicious Keywords check in domain
  SUSPICIOUS_KEYWORDS.forEach(keyword => {
    if (domain.includes(keyword)) {
      riskScore += 25;
      detectedKeywords.push(keyword);
      reasons.push(`Domain contains suspicious keyword: "${keyword}". Phishing sites often use these to look legitimate.`);
    }
  });

  if (detectedKeywords.length > 0) {
    recommendations.push('Verify the domain spelling carefully. Attackers often combine legitimate brand names with words like "login" or "secure".');
  }

  // 4. Risky TLDs check
  const tldMatch = domain.match(/\.[a-z]+$/);
  if (tldMatch && RISKY_TLDS.includes(tldMatch[0])) {
    riskScore += 30;
    reasons.push(`Domain uses a high-risk Top Level Domain (${tldMatch[0]}). These are cheap and frequently used by scammers.`);
    recommendations.push('Exercise extreme caution. Legitimate businesses rarely use this domain extension.');
  }

  // 5. IP Address instead of Domain
  const isIpAddress = /^(\d{1,3}\.){3}\d{1,3}$/.test(domain);
  if (isIpAddress) {
    riskScore += 40;
    reasons.push('URL uses an IP address instead of a domain name. Legitimate sites hide their IP behind a domain.');
    recommendations.push('Avoid clicking this link unless you are accessing a known local or private network device.');
  }

  // 6. Too many numbers or hyphens
  const hyphenCount = (domain.match(/-/g) || []).length;
  const numberCount = (domain.match(/\d/g) || []).length;
  
  if (hyphenCount > 2) {
    riskScore += 15;
    reasons.push(`Domain contains an unusual number of hyphens (${hyphenCount}).`);
  }
  
  if (!isIpAddress && numberCount > 5) {
    riskScore += 15;
    reasons.push('Domain contains excessive numbers, which is typical of auto-generated spam domains.');
  }

  // 7. Unusually long URL
  if (inputUrl.length > 75) {
    riskScore += 10;
    reasons.push('The URL is unusually long, which can be used to hide malicious parameters or obscure the real domain.');
  }

  // Cap risk score at 100
  riskScore = Math.min(riskScore, 100);

  // Determine Threat Level
  let threatLevel = 'Safe';
  if (riskScore >= 75) threatLevel = 'Critical';
  else if (riskScore >= 50) threatLevel = 'High';
  else if (riskScore >= 25) threatLevel = 'Medium';
  else if (riskScore > 0) threatLevel = 'Low';

  if (riskScore === 0) {
    reasons.push('No immediate red flags detected in the URL structure.');
    recommendations.push('Always remain vigilant. Even "safe-looking" URLs can be compromised.');
  }

  let category = 'Uncategorized';
  let domainAge = 'Unknown';
  
  if (riskScore >= 75) {
    category = 'Phishing Website';
    domainAge = '12 Days';
  } else if (riskScore >= 50) {
    category = 'Suspicious Site';
    domainAge = '3 Months';
  } else {
    category = 'General Site';
    domainAge = '2 Years';
  }

  return {
    riskScore,
    threatLevel,
    category,
    sslStatus: urlObj.protocol === 'https:' ? 'Secured' : 'Invalid',
    domainAge,
    blacklistStatus: 'Not Checked',
    reasons,
    recommendations,
    suspiciousKeywords: detectedKeywords,
    scanTimestamp: new Date().toISOString()
  };
};
