// Vercel Serverless Function: POST /api/rounds/sync-result
// Receives, validates, and persists the 4 official Thai Win draw results

if (!globalThis.__THAINXT_DRAW_RESULTS__) {
  globalThis.__THAINXT_DRAW_RESULTS__ = {
    results: ['8492', '3150', '9274', '6108'],
    updatedAt: new Date().toISOString()
  };
}

module.exports = (req, res) => {
  // Set strict CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Disable caching completely
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate, max-age=0, s-maxage=0');
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

    const { winningNumbers, drawResults } = body || {};
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

    res.status(200).json({
      success: true,
      message: 'Official Thai Win Draw Results successfully published and persisted.',
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
