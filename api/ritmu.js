const https = require('https');

module.exports = (req, res) => {
  // Target URL on ritmu.tv
  const targetUrl = 'https://www.ritmu.tv/';

  const options = {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.9',
      'Referer': 'https://www.ritmu.tv/',
      'Origin': 'https://www.ritmu.tv'
    }
  };

  https.get(targetUrl, options, (remoteRes) => {
    let data = '';

    remoteRes.on('data', (chunk) => {
      data += chunk;
    });

    remoteRes.on('end', () => {
      // Inject <base href="https://www.ritmu.tv/"> right after <head>
      // so all script, css, and image requests fetch directly from ritmu.tv!
      let modifiedHtml = data;
      if (modifiedHtml.includes('<head>')) {
        modifiedHtml = modifiedHtml.replace('<head>', '<head><base href="https://www.ritmu.tv/">');
      } else if (modifiedHtml.includes('<head ')) {
        modifiedHtml = modifiedHtml.replace(/<head[^>]*>/, '$&<base href="https://www.ritmu.tv/">');
      }

      // Send response without X-Frame-Options or Content-Security-Policy
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      res.status(200).send(modifiedHtml);
    });
  }).on('error', (err) => {
    res.status(500).send('Ritmu Proxy Error: ' + err.message);
  });
};
