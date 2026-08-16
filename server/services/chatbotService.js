const { analyzeText } = require('./scamAnalyzer');
const { analyzeUrl } = require('./urlAnalyzer');
const { getAggregatedThreatIntelligence } = require('./threatIntelligence/threatAggregator');

const INCIDENT_RESPONSE_GUIDE = {
  title: "⚠️ Incident Response Guide",
  immediateActions: [
    "Disconnect from the internet immediately if you downloaded a file.",
    "Do not click any further links or provide information.",
    "Take a screenshot of the message/website for evidence."
  ],
  recoverySteps: [
    "Change your passwords immediately using a different, secure device.",
    "Contact your bank or credit card company to freeze your accounts if financial info was shared.",
    "Run a full antivirus scan on your device."
  ],
  prevention: [
    "Enable Two-Factor Authentication (2FA) on all accounts.",
    "Never trust urgent requests for money or personal data."
  ],
  reporting: "Report this incident to your local cybercrime authority or via our 'Report Scam' portal."
};

/**
 * Handle a chat message and determine the best response using rule-based logic or existing scanners
 */
const processChatMessage = async (message) => {
  const text = message.toLowerCase().trim();

  // 1. Check if the message is a URL
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const urls = text.match(urlRegex);
  
  if (urls && urls.length > 0) {
    const targetUrl = urls[0];
    
    // Attempt threat intel first, fallback to basic analyzeUrl
    try {
      const threatData = await getAggregatedThreatIntelligence(targetUrl);
      const isHighRisk = threatData.finalRiskScore >= 50 || threatData.basicAnalysis.riskLevel === 'High' || threatData.basicAnalysis.riskLevel === 'Critical';
      
      return {
        reply: `I analyzed the URL you provided: **${targetUrl}**.`,
        scanResult: {
          type: 'url',
          data: threatData
        },
        incidentGuide: isHighRisk ? INCIDENT_RESPONSE_GUIDE : null
      };
    } catch (e) {
      // Fallback
      const basicAnalysis = analyzeUrl(targetUrl);
      const isHighRisk = basicAnalysis.riskLevel === 'High' || basicAnalysis.riskLevel === 'Critical';
      
      return {
        reply: `I ran a basic scan on the URL you provided: **${targetUrl}**.`,
        scanResult: {
          type: 'url_basic',
          data: basicAnalysis
        },
        incidentGuide: isHighRisk ? INCIDENT_RESPONSE_GUIDE : null
      };
    }
  }

  // 2. Check for educational intents
  if (text.includes('what is phishing')) {
    return { reply: "Phishing is a cyber attack where attackers disguise themselves as a trustworthy entity to trick you into revealing sensitive information, like passwords or credit card numbers. They often use urgent emails or SMS messages." };
  }
  if (text.includes('what is ransomware')) {
    return { reply: "Ransomware is malicious software that encrypts your files or locks your device, demanding payment (usually cryptocurrency) in exchange for the decryption key." };
  }
  if (text.includes('what is social engineering')) {
    return { reply: "Social engineering is the psychological manipulation of people into performing actions or divulging confidential information. It relies on human error rather than technical vulnerabilities." };
  }
  if (text.includes('what is a qr scam') || text.includes('qr code scam')) {
    return { reply: "A QR scam occurs when fraudsters replace a legitimate QR code (e.g., at a parking meter or payment terminal) with their own. Scanning it directs your payment to the scammer or downloads malware to your device." };
  }
  if (text.includes('how do i create a strong password') || text.includes('strong password')) {
    return { reply: "A strong password should be at least 12 characters long and include a mix of uppercase letters, lowercase letters, numbers, and symbols. Avoid using easily guessable information like birthdays. Consider using a passphrase like 'Blue!Elephant$Walking99'." };
  }
  if (text.includes('protect my online accounts')) {
    return { reply: "To protect your accounts: 1) Use strong, unique passwords for every site. 2) Enable Two-Factor Authentication (2FA). 3) Be wary of suspicious emails or messages. 4) Keep your software updated." };
  }
  if (text.includes('secure my bank account')) {
    return { reply: "To secure your bank account: Never share your OTP or PIN. Enable login alerts for all transactions. Use 2FA via an authenticator app if possible. Do not access your bank over public Wi-Fi." };
  }
  if (text.includes('clicked a phishing link') || text.includes('clicked a link')) {
    return { 
      reply: "If you clicked a phishing link, do not panic but act quickly.",
      incidentGuide: INCIDENT_RESPONSE_GUIDE
    };
  }
  if (text.includes('report cybercrime')) {
    return { reply: "You can report cybercrimes directly through our 'Report Scam' portal, or contact your local law enforcement. In the US, you can file a report with the FBI's Internet Crime Complaint Center (IC3)." };
  }

  // 3. If it looks like a pasted scam message, run Scam Analyzer
  if (text.length > 20 && (text.includes('urgent') || text.includes('winner') || text.includes('dear') || text.includes('account'))) {
    const analysis = analyzeText(message);
    const isHighRisk = analysis.riskLevel === 'High' || analysis.riskLevel === 'Critical';
    
    return {
      reply: "I ran this text through our AI Scam Analyzer. Here is what I found:",
      scanResult: {
        type: 'text',
        data: analysis
      },
      incidentGuide: isHighRisk ? INCIDENT_RESPONSE_GUIDE : null
    };
  }

  // 4. Default fallback
  return { 
    reply: "I'm your Cyber AI Assistant. I can help you analyze suspicious messages, scan URLs, or answer questions about cybersecurity. Try pasting a suspicious message or asking 'What is phishing?'." 
  };
};

module.exports = {
  processChatMessage
};
