// Vercel Serverless Function: GET /api/rounds/results
// Serves the authoritative 4-digit Thai Win draw results across all devices and domains

let globalDrawResults = ['8492', '3150', '9274', '6108'];
let globalUpdatedAt = new Date().toISOString();

// Helper to access shared in-memory state across lambdas
if (!globalThis.__THAINXT_DRAW_RESULTS__) {
  globalThis.__THAINXT_DRAW_RESULTS__ = {
    results: ['8492', '3150', '9274', '6108'],
    updatedAt: new Date().toISOString()
  };
}

module.exports = (req, res) => {
  // Set strict CORS headers to allow cross-domain requests
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

  const current = globalThis.__THAINXT_DRAW_RESULTS__ || { results: globalDrawResults, updatedAt: globalUpdatedAt };

  res.status(200).json({
    success: true,
    winningNumbers: current.results,
    drawId: 'DRAW-' + Date.parse(current.updatedAt),
    updatedAt: current.updatedAt
  });
};
