const https = require('https');

module.exports = (req, res) => {
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
      let modifiedHtml = data;

      // Injected script to patch fetch & XHR for CORS bypass on ritmu.tv API calls
      const injectedScript = `
        <base href="https://www.ritmu.tv/">
        <script>
          (function() {
            var origFetch = window.fetch;
            if (origFetch) {
              window.fetch = function(input, init) {
                var url = typeof input === 'string' ? input : (input && input.url ? input.url : '');
                if (url && !url.includes('corsproxy.io') && !url.includes('static/')) {
                  var target = url.startsWith('http') ? url : ('https://www.ritmu.tv' + (url.startsWith('/') ? '' : '/') + url);
                  var proxied = 'https://corsproxy.io/?' + encodeURIComponent(target);
                  if (typeof input === 'string') {
                    input = proxied;
                  } else if (input && input.url) {
                    input = new Request(proxied, init);
                  }
                }
                return origFetch.call(this, input, init);
              };
            }

            var origOpen = XMLHttpRequest.prototype.open;
            XMLHttpRequest.prototype.open = function(method, url, async, user, pass) {
              if (url && typeof url === 'string' && !url.includes('corsproxy.io') && !url.includes('static/')) {
                var target = url.startsWith('http') ? url : ('https://www.ritmu.tv' + (url.startsWith('/') ? '' : '/') + url);
                url = 'https://corsproxy.io/?' + encodeURIComponent(target);
              }
              return origOpen.call(this, method, url, async, user, pass);
            };
          })();
        </script>
      `;

      if (modifiedHtml.includes('<head>')) {
        modifiedHtml = modifiedHtml.replace('<head>', '<head>' + injectedScript);
      } else if (modifiedHtml.includes('<head ')) {
        modifiedHtml = modifiedHtml.replace(/<head[^>]*>/, '$&' + injectedScript);
      } else {
        modifiedHtml = injectedScript + modifiedHtml;
      }

      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      res.status(200).send(modifiedHtml);
    });
  }).on('error', (err) => {
    res.status(500).send('Ritmu Proxy Error: ' + err.message);
  });
};
