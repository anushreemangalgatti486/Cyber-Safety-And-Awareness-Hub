const axios = require('axios');
const dns = require('dns');
const { promisify } = require('util');

const lookup = promisify(dns.lookup);

exports.analyzeUrl = async (url) => {
  const apiKey = process.env.ABUSEIPDB_API_KEY;
  if (!apiKey) return null;

  try {
    let hostname;
    try {
      const urlObj = new URL(url.startsWith('http') ? url : `http://${url}`);
      hostname = urlObj.hostname;
    } catch (e) {
      return null;
    }

    let ip = hostname;
    if (!/^(\d{1,3}\.){3}\d{1,3}$/.test(hostname)) {
      const { address } = await lookup(hostname);
      ip = address;
    }

    const response = await axios.get('https://api.abuseipdb.com/api/v2/check', {
      params: { ipAddress: ip, maxAgeInDays: 90 },
      headers: {
        'Key': apiKey,
        'Accept': 'application/json'
      }
    });

    const data = response.data.data;
    const score = data.abuseConfidenceScore;
    let status = 'Safe';
    if (score > 50) {
      status = 'Malicious';
    } else if (score > 0) {
      status = 'Suspicious';
    }

    return {
      status,
      score,
      provider: 'AbuseIPDB'
    };
  } catch (error) {
    console.error('AbuseIPDB API Error:', error.message);
    return null;
  }
};
