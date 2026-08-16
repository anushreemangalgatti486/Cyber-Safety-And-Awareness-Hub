const axios = require('axios');

exports.analyzeUrl = async (url) => {
  const apiKey = process.env.VIRUSTOTAL_API_KEY;
  if (!apiKey) return null;

  try {
    const urlId = Buffer.from(url).toString('base64').replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
    const response = await axios.get(`https://www.virustotal.com/api/v3/urls/${urlId}`, {
      headers: { 'x-apikey': apiKey }
    });

    const stats = response.data.data.attributes.last_analysis_stats;
    let status = 'Safe';
    if (stats.malicious > 0 || stats.phishing > 0) {
      status = 'Malicious';
    } else if (stats.suspicious > 0) {
      status = 'Suspicious';
    }

    return {
      status,
      stats,
      provider: 'VirusTotal'
    };
  } catch (error) {
    console.error('VirusTotal API Error:', error.message);
    return null;
  }
};
