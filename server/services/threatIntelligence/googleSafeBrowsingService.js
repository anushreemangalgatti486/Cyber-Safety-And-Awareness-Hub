const axios = require('axios');

exports.analyzeUrl = async (url) => {
  const apiKey = process.env.SAFE_BROWSING_API_KEY;
  if (!apiKey) return null;

  try {
    const response = await axios.post(
      `https://safebrowsing.googleapis.com/v4/threatMatches:find?key=${apiKey}`,
      {
        client: {
          clientId: 'cybershield',
          clientVersion: '1.0.0'
        },
        threatInfo: {
          threatTypes: ['MALWARE', 'SOCIAL_ENGINEERING', 'UNWANTED_SOFTWARE'],
          platformTypes: ['ANY_PLATFORM'],
          threatEntryTypes: ['URL'],
          threatEntries: [{ url }]
        }
      }
    );

    const matches = response.data.matches;
    let status = 'Safe';
    if (matches && matches.length > 0) {
      status = 'Malicious';
    }

    return {
      status,
      matches: matches || [],
      provider: 'Google Safe Browsing'
    };
  } catch (error) {
    console.error('Google Safe Browsing API Error:', error.message);
    return null;
  }
};
