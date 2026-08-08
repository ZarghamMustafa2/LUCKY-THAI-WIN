import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';

const TARGET = 'https://www.ritmu.tv';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const path = searchParams.get('path') || '/';
  const targetUrl = `${TARGET}${path.startsWith('/') ? path : '/' + path}`;

  try {
    const res = await fetch(targetUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Accept-Encoding': 'gzip, deflate, br',
        'Referer': TARGET,
        'Origin': TARGET,
      },
    });

    const contentType = res.headers.get('content-type') || 'text/html';

    // For HTML pages: rewrite URLs to go through our proxy
    if (contentType.includes('text/html')) {
      let html = await res.text();

      // Rewrite absolute and relative URLs to go through proxy
      html = html
        .replace(/src="\/static\//g, `src="${TARGET}/static/`)
        .replace(/href="\/static\//g, `href="${TARGET}/static/`)
        .replace(/src="\.\/static\//g, `src="${TARGET}/static/`)
        .replace(/href="\.\/static\//g, `href="${TARGET}/static/`)
        .replace(/src="\/([^"]+)"/g, (m, p) => `src="${TARGET}/${p}"`)
        .replace(/href="\/([^"]+)"/g, (m, p) => {
          if (p.startsWith('http')) return m;
          return `href="${TARGET}/${p}"`;
        });

      return new NextResponse(html, {
        status: 200,
        headers: {
          'Content-Type': 'text/html; charset=utf-8',
          'X-Frame-Options': 'ALLOWALL',
          'Access-Control-Allow-Origin': '*',
          // Explicitly remove blocking headers
        },
      });
    }

    // For other resources (JS, CSS, images etc.) — pass through
    const body = await res.arrayBuffer();
    const headers = new Headers();
    headers.set('Content-Type', contentType);
    headers.set('Access-Control-Allow-Origin', '*');
    headers.set('Cache-Control', 'public, max-age=60');

    return new NextResponse(body, {
      status: res.status,
      headers,
    });

  } catch (err) {
    return new NextResponse('Proxy error: ' + String(err), { status: 502 });
  }
}
