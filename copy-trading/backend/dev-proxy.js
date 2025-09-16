// A simple development proxy server to help debug CORS issues
const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');
const httpProxy = require('http-proxy');

const dev = process.env.NODE_ENV !== 'production';
const hostname = 'localhost';
const port = 3001; // Use a different port than your main Next.js app

// Create a proxy server
const proxy = httpProxy.createProxyServer({
  target: {
    host: 'learn-ledger-api.vercel.app',
    port: 443,
    protocol: 'https:'
  },
  changeOrigin: true,
  secure: false, // Don't verify SSL certs
  xfwd: true, // Add x-forwarded headers
});

// Start the HTTP server
const server = createServer((req, res) => {
  const parsedUrl = parse(req.url, true);
  const { pathname } = parsedUrl;

  console.log(`[Proxy] ${req.method} ${pathname}`);

  // Add CORS headers to all proxy responses
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH, HEAD');
  res.setHeader('Access-Control-Allow-Headers', [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'Accept',
    'Origin',
    'Cache-Control'
  ].join(', '));
  res.setHeader('Access-Control-Max-Age', '86400');
  
  // Handle OPTIONS preflight requests directly
  if (req.method === 'OPTIONS') {
    res.statusCode = 204;
    res.end();
    return;
  }

  // Only proxy /api/* requests
  if (pathname.startsWith('/api/')) {
    proxy.web(req, res, {}, (err) => {
      console.error('Proxy error:', err);
      res.statusCode = 500;
      res.end('Proxy error');
    });
    return;
  }

  // Otherwise just return a simple page
  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/html');
  res.end(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>CORS Debug Proxy</title>
        <style>
          body { font-family: -apple-system, system-ui, sans-serif; padding: 2rem; }
          code { background: #f1f1f1; padding: 0.2rem 0.4rem; border-radius: 4px; }
        </style>
      </head>
      <body>
        <h1>LearnLedger API Proxy</h1>
        <p>This is a development proxy for testing CORS issues.</p>
        <p>All requests to <code>/api/*</code> will be proxied to the production API with CORS headers added.</p>
        <p>Current setup:</p>
        <ul>
          <li>Proxy URL: <code>http://localhost:${port}/api/*</code></li>
          <li>Target API: <code>https://learn-ledger-api.vercel.app/api/*</code></li>
        </ul>
      </body>
    </html>
  `);
});

server.listen(port, hostname, () => {
  console.log(`CORS Debug Proxy running at http://${hostname}:${port}/`);
  console.log(`Proxying /api/* requests to https://learn-ledger-api.vercel.app/api/*`);
}); 