// Minimal static server with gzip + long-cache headers, mirroring the production .htaccess (for performance audits).
import http from 'node:http'; import fs from 'node:fs'; import path from 'node:path'; import zlib from 'node:zlib';
const dist = path.resolve(import.meta.dirname, '../dist'); const port = +process.env.PORT || 8090;
const types = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'application/javascript', '.json': 'application/json', '.xml': 'application/xml', '.txt': 'text/plain', '.svg': 'image/svg+xml', '.webp': 'image/webp', '.avif': 'image/avif', '.jpg': 'image/jpeg', '.png': 'image/png', '.woff2': 'font/woff2', '.ico': 'image/x-icon' };
http.createServer((req, res) => {
  let p = decodeURIComponent(req.url.split('?')[0]); let f = path.join(dist, p);
  if (fs.existsSync(f) && fs.statSync(f).isDirectory()) { if (!p.endsWith('/')) { res.writeHead(301, { Location: p + '/' }); return res.end(); } f = path.join(f, 'index.html'); }
  if (!fs.existsSync(f)) { res.writeHead(404, { 'Content-Type': types['.html'] }); return res.end(fs.readFileSync(path.join(dist, '404.html'))); }
  const ext = path.extname(f); const h = { 'Content-Type': types[ext] || 'application/octet-stream', 'Cache-Control': /\.(avif|webp|jpg|png|woff2)$/.test(ext) ? 'public, max-age=31536000' : ext === '.html' ? 'no-cache' : 'public, max-age=2592000' };
  let body = fs.readFileSync(f);
  if (/html|css|javascript|json|xml|svg|text/.test(h['Content-Type']) && /gzip/.test(req.headers['accept-encoding'] || '')) { body = zlib.gzipSync(body, { level: 9 }); h['Content-Encoding'] = 'gzip'; }
  h['Content-Length'] = body.length; res.writeHead(200, h); res.end(body);
}).listen(port, '127.0.0.1', () => console.log('gzip server on', port));
