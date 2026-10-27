// Local server that behaves like the Vercel deployment: static dist/ (gzip, trailing-slash redirects,
// 404.html) plus the /api/contact function. Used by `npm run serve`, the e2e tests and Lighthouse.
import http from 'node:http'; import fs from 'node:fs'; import path from 'node:path'; import zlib from 'node:zlib';
import handler from '../api/contact.js';
const dist = path.resolve(import.meta.dirname, '../dist'); const port = +process.env.PORT || 8080;
const types = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'application/javascript', '.json': 'application/json', '.xml': 'application/xml', '.txt': 'text/plain', '.svg': 'image/svg+xml', '.webp': 'image/webp', '.avif': 'image/avif', '.jpg': 'image/jpeg', '.png': 'image/png', '.woff2': 'font/woff2', '.ico': 'image/x-icon' };
function shim(res) { res.status = (c) => { res.statusCode = c; return res; }; res.json = (o) => { res.setHeader('Content-Type', 'application/json; charset=utf-8'); res.end(JSON.stringify(o)); }; return res; }
http.createServer(async (req, res) => {
  const url = new URL(req.url, 'http://x'); const p = decodeURIComponent(url.pathname);
  if (p === '/api/contact') {
    const chunks = []; for await (const c of req) chunks.push(c); const raw = Buffer.concat(chunks).toString();
    const ct = req.headers['content-type'] || '';
    req.body = ct.includes('json') ? JSON.parse(raw || '{}') : Object.fromEntries(new URLSearchParams(raw));
    return handler(req, shim(res));
  }
  let f = path.join(dist, p);
  if (fs.existsSync(f) && fs.statSync(f).isDirectory()) { if (!p.endsWith('/')) { res.writeHead(308, { Location: p + '/' + url.search }); return res.end(); } f = path.join(f, 'index.html'); }
  if (!fs.existsSync(f)) { res.writeHead(404, { 'Content-Type': types['.html'] }); return res.end(fs.readFileSync(path.join(dist, '404.html'))); }
  const ext = path.extname(f); const h = { 'Content-Type': types[ext] || 'application/octet-stream', 'Cache-Control': /\.(avif|webp|jpg|png|woff2)$/.test(ext) ? 'public, max-age=31536000, immutable' : 'public, max-age=0, must-revalidate' };
  let body = fs.readFileSync(f);
  if (/html|css|javascript|json|xml|svg|text/.test(h['Content-Type']) && /gzip/.test(req.headers['accept-encoding'] || '')) { body = zlib.gzipSync(body, { level: 9 }); h['Content-Encoding'] = 'gzip'; }
  h['Content-Length'] = body.length; res.writeHead(200, h); res.end(body);
}).listen(port, '127.0.0.1', () => console.log(`dev server http://127.0.0.1:${port}`));
