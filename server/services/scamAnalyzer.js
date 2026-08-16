/**
 * Scam Analyzer Service
 * Rule-based engine to evaluate suspicious text for potential scams.
 * Can be swapped out for a true AI/LLM model in the future.
 */

const KEYWORDS = {
  high: ['otp', 'password', 'login', 'kyc', 'pan', 'aadhaar', 'urgent', 'verify', 'click here'],
  medium: ['prize', 'winner', 'bank', 'upi', 'qr code', 'gift card', 'cryptocurrency', 'investment', 'delivery', 'blocked', 'suspend'],
  low: ['offer', 'discount', 'job', 'work from home', 'part time'],
};

const PATTERNS = {
  url: /(https?:\/\/[^\s]+)/g,
  email: /([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/g,
  phone: /(\+?\d{1,4}?[-.\s]?\(?\d{1,3}?\)?[-.\s]?\d{1,4}[-.\s]?\d{1,4}[-.\s]?\d{1,9})/g, // simplistic phone matcher
  money: /([$₹€£]\s?\d+(?:,\d{3})*(?:\.\d{2})?|\d+(?:,\d{3})*(?:\.\d{2})?\s?(?:USD|INR|EUR|GBP|Rupees?|Dollars?))/ig,
};

const SCAM_CATEGORIES = [
  { name: 'Lottery Scam', required: ['prize', 'winner'] },
  { name: 'Bank KYC Scam', required: ['kyc', 'bank'] },
  { name: 'UPI/QR Code Scam', required: ['upi', 'qr code'] },
  { name: 'Fake Delivery Scam', required: ['delivery'] },
  { name: 'Investment Scam', required: ['investment', 'cryptocurrency'] },
  { name: 'Job Scam', required: ['job', 'part time', 'work from home'] },
];

function analyzeText(text) {
  if (!text || typeof text !== 'string') {
    throw new Error('Invalid input text');
  }

  const startTime = Date.now();
  const lowerText = text.toLowerCase();
  
  let riskScore = 0;
  let suspiciousKeywords = new Set();
  let detectedThreats = new Set();
  
  // 1. Keyword Analysis
  KEYWORDS.high.forEach(kw => {
    if (lowerText.includes(kw)) {
      riskScore += 25;
      suspiciousKeywords.add(kw);
    }
  });
  
  KEYWORDS.medium.forEach(kw => {
    if (lowerText.includes(kw)) {
      riskScore += 15;
      suspiciousKeywords.add(kw);
    }
  });

  KEYWORDS.low.forEach(kw => {
    if (lowerText.includes(kw)) {
      riskScore += 5;
      suspiciousKeywords.add(kw);
    }
  });

  // 2. Pattern Analysis (URLs, Emails, Phones, Money)
  const urls = text.match(PATTERNS.url) || [];
  if (urls.length > 0) {
    riskScore += 20;
    detectedThreats.add('Contains URL(s)');
  }

  const emails = text.match(PATTERNS.email) || [];
  if (emails.length > 0) {
    riskScore += 10;
    detectedThreats.add('Contains Email Address');
  }

  const money = text.match(PATTERNS.money) || [];
  if (money.length > 0) {
    riskScore += 15;
    detectedThreats.add('Financial Request (Money Amount Detected)');
  }
  
  // Basic phone number detection (if very long numbers exist)
  const phoneMatches = text.match(PATTERNS.phone) || [];
  const phones = phoneMatches.filter(p => p.replace(/[^0-9]/g, '').length >= 10);
  if (phones.length > 0) {
    riskScore += 10;
    detectedThreats.add('Contains Phone Number');
  }

  // Determine urgency
  if (lowerText.includes('urgent') || lowerText.includes('immediately') || lowerText.includes('24 hours')) {
    detectedThreats.add('Excessive Urgency');
    riskScore += 15;
  }

  // Determine requests for sensitive info
  if (lowerText.includes('otp') || lowerText.includes('password') || lowerText.includes('pan') || lowerText.includes('aadhaar')) {
    detectedThreats.add('Request for Sensitive Information');
    riskScore += 30;
  }

  // Cap score at 100
  riskScore = Math.min(riskScore, 100);

  // 3. Determine Risk Level
  let riskLevel = 'Low';
  if (riskScore >= 80) riskLevel = 'Critical';
  else if (riskScore >= 50) riskLevel = 'High';
  else if (riskScore >= 30) riskLevel = 'Medium';

  // 4. Categorize Scam
  let category = 'Unknown/General Suspicious Message';
  if (riskScore >= 30) {
    for (const cat of SCAM_CATEGORIES) {
      const match = cat.required.some(kw => suspiciousKeywords.has(kw));
      if (match) {
        category = cat.name;
        break; // Take first match
      }
    }
  }

  // 5. Generate Recommendations
  const recommendations = [];
  if (riskLevel === 'Critical' || riskLevel === 'High') {
    recommendations.push('Do NOT click on any links or download attachments.');
    recommendations.push('Do NOT reply or provide any personal information.');
  }
  if (suspiciousKeywords.has('otp') || suspiciousKeywords.has('password')) {
    recommendations.push('Never share your OTP, PIN, or Password with anyone. Bank officials never ask for them.');
  }
  if (suspiciousKeywords.has('bank') || suspiciousKeywords.has('kyc')) {
    recommendations.push('Contact your bank directly using the official customer care number on the back of your card.');
  }
  if (urls.length > 0) {
    recommendations.push('Verify the sender before opening links. Phishing links often look similar to legitimate ones.');
  }
  if (recommendations.length === 0) {
    recommendations.push('Exercise general caution. If you are unsure, do not interact with the sender.');
  }

  // 6. Calculate Confidence
  // Confidence is loosely based on how many distinct threat types/keywords were found.
  let confidenceVal = Math.min((suspiciousKeywords.size + detectedThreats.size) * 15, 99);
  if (riskScore === 0) confidenceVal = 85; // Confident it's clean if nothing found
  
  const analysisTimeMs = Date.now() - startTime + Math.floor(Math.random() * 50); // Add slight random delay for realism

  return {
    riskScore,
    riskLevel,
    category,
    detectedThreats: Array.from(detectedThreats),
    suspiciousKeywords: Array.from(suspiciousKeywords),
    recommendations,
    analysisTime: `${analysisTimeMs}ms`,
    confidence: `${confidenceVal}%`
  };
}

module.exports = {
  analyzeText
};
