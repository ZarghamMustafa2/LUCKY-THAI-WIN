// Vercel Serverless Function: GET /api/rounds/results
// Serves authoritative 4-digit Thai Win draw results across all devices and domains

const https = require('https');
const STORE_ID = 'ff808181a067127101a07cccefc03a85';

if (!globalThis.__THAINXT_DRAW_RESULTS__) {
  globalThis.__THAINXT_DRAW_RESULTS__ = {
    results: ['8492', '3150', '9274', '6108'],
    updatedAt: new Date().toISOString()
  };
}

function fetchRemoteStore() {
  return new Promise((resolve) => {
    https.get('https://api.restful-api.dev/objects/' + STORE_ID, res => {
      let body = '';
      res.on('data', c => body += c);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(body);
          if (parsed && parsed.data && Array.isArray(parsed.data.winningNumbers) && parsed.data.winningNumbers.length >= 4) {
            resolve(parsed.data);
            return;
          }
        } catch(e) {}
        resolve(null);
      });
    }).on('error', () => resolve(null));
  });
}

module.exports = async (req, res) => {
  // Set strict CORS & No-Cache headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate, max-age=0');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // First check remote persistent cloud store
  const remote = await fetchRemoteStore();
  let results = ['8492', '3150', '9274', '6108'];
  let updatedAt = new Date().toISOString();

  if (remote && Array.isArray(remote.winningNumbers) && remote.winningNumbers.length >= 4) {
    results = remote.winningNumbers.map(n => String(n).trim());
    if (remote.updatedAt) updatedAt = remote.updatedAt;
    globalThis.__THAINXT_DRAW_RESULTS__ = { results, updatedAt };
  } else if (globalThis.__THAINXT_DRAW_RESULTS__) {
    results = globalThis.__THAINXT_DRAW_RESULTS__.results;
    updatedAt = globalThis.__THAINXT_DRAW_RESULTS__.updatedAt;
  }

  res.status(200).json({
    success: true,
    winningNumbers: results,
    drawId: 'DRAW-' + Date.parse(updatedAt),
    updatedAt: updatedAt
  });
};
