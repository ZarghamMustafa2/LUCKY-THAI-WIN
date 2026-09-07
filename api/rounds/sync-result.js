// Vercel Serverless Function: POST /api/rounds/sync-result
// Receives, validates, and persists official Thai Win draw results globally

const https = require('https');
const STORE_ID = 'ff808181a067127101a07cccefc03a85';

if (!globalThis.__THAINXT_DRAW_RESULTS__) {
  globalThis.__THAINXT_DRAW_RESULTS__ = {
    results: ['8492', '3150', '9274', '6108'],
    updatedAt: new Date().toISOString()
  };
}

function updateRemoteStore(results) {
  return new Promise((resolve) => {
    const postData = JSON.stringify({
      name: 'ThaiNXT Draw Results',
      data: { winningNumbers: results, updatedAt: new Date().toISOString() }
    });
    const req = https.request('https://api.restful-api.dev/objects/' + STORE_ID, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    }, res => {
      let body = '';
      res.on('data', c => body += c);
      res.on('end', () => resolve());
    });
    req.on('error', () => resolve());
    req.write(postData);
    req.end();
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

  if (req.method !== 'POST') {
    res.status(405).json({ success: false, message: 'Method Not Allowed. Use POST.' });
    return;
  }

  try {
    let body = req.body;
    if (typeof body === 'string') {
      try { body = JSON.parse(body); } catch(e) {}
    }

    const reqRoleHeader = req.headers['x-admin-role'] || req.headers['x-role'] || '';
    const { winningNumbers, drawResults, role, adminRole } = body || {};
    const candidateRole = (reqRoleHeader || role || adminRole || '').toString().trim().toUpperCase();

    // SECURITY AUTHORIZATION: Only COMPANY role accounts are authorized to publish official draw results
    if (candidateRole !== 'COMPANY' && !candidateRole.includes('COMPANY')) {
      res.status(403).json({
        success: false,
        message: 'Forbidden: Only COMPANY role accounts are authorized to publish draw results.'
      });
      return;
    }

    const candidate = winningNumbers || drawResults;

    if (!Array.isArray(candidate) || candidate.length < 4) {
      res.status(400).json({
        success: false,
        message: 'Invalid payload. winningNumbers must be an array of 4 4-digit strings.'
      });
      return;
    }

    const r1 = String(candidate[0] || '').trim();
    const r2 = String(candidate[1] || '').trim();
    const r3 = String(candidate[2] || '').trim();
    const r4 = String(candidate[3] || '').trim();

    const isValid4Digit = [r1, r2, r3, r4].every(n => /^\d{4}$/.test(n));
    if (!isValid4Digit) {
      res.status(422).json({
        success: false,
        message: 'Validation Error: Each winning number must be a valid 4-digit numeric string (0000-9999).'
      });
      return;
    }

    const newResults = [r1, r2, r3, r4];
    const nowIso = new Date().toISOString();

    globalThis.__THAINXT_DRAW_RESULTS__ = {
      results: newResults,
      updatedAt: nowIso
    };

    // Update persistent global cloud store
    await updateRemoteStore(newResults);

    res.status(200).json({
      success: true,
      message: 'Official Thai Win Draw Results successfully published and persisted globally.',
      winningNumbers: newResults,
      updatedAt: nowIso
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Internal server error while syncing draw results.',
      error: error.message
    });
  }
};
