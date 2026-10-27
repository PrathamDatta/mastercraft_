// Static site build: pages -> dist/, plus sitemap, robots, .htaccess, contact handler, minified assets.
import fs from 'node:fs';
import path from 'node:path';
import { build as esbuild } from 'esbuild';
import { SITE, SMALL_MOULDS, LARGE_MOULDS, COMPONENTS, TWOK } from './data.mjs';
import { IMAGES } from './images.config.mjs';
import { MANIFEST, abs, imgFallback } from './lib.mjs';
import { homePage, aboutPage, facilitiesPage, qualityPage } from './pages-main.mjs';
import { CATEGORIES, smallMouldsPage, largeMouldsPage, componentsPage, twokPage, detailPage, contactPage, thanksPage, notFoundPage } from './pages-products.mjs';

const root = path.resolve(import.meta.dirname, '..');
const dist = path.join(root, 'dist');
const write = (rel, content) => { const f = path.join(dist, rel); fs.mkdirSync(path.dirname(f), { recursive: true }); fs.writeFileSync(f, content); };

const pages = []; // {path, html, lastmod, images[], noindex}
const add = (p, html, opts = {}) => { pages.push({ path: p, html, ...opts }); };

add('/', homePage(), { priority: '1.0', images: ['machining5', 'campus'] });
add('/about/', aboutPage(), { priority: '0.7', images: ['campus'] });
add('/facilities/', facilitiesPage(), { priority: '0.8', images: ['machining5', 'crane', 'moulding'] });
add('/quality/', qualityPage(), { priority: '0.7', images: ['qualityCmm', 'qualityMfi'] });
add('/injection-moulds/', smallMouldsPage(), { priority: '0.9', images: ['mouldSmall1'] });
add('/large-size-injection-moulds/', largeMouldsPage(), { priority: '0.9', images: ['frDoorTrim'] });
add('/components/', componentsPage(), { priority: '0.9', images: ['componentsHero'] });
add('/2k-parts/', twokPage(), { priority: '0.8', images: ['hvacFlap'] });
add('/contact/', contactPage(), { priority: '0.8' });
for (const [key, items] of [['small', SMALL_MOULDS], ['large', LARGE_MOULDS], ['components', COMPONENTS], ['twok', TWOK]]) {
  items.forEach((it, i) => { const d = detailPage(key, it, i); add(d.path, d.html, { priority: '0.6', images: [it.img] }); });
}
const thanks = { path: '/contact/thank-you/', html: thanksPage(), noindex: true };
pages.push(thanks);

fs.rmSync(path.join(dist, 'assets/css'), { recursive: true, force: true });
for (const p of pages) write(p.path.endsWith('/') ? `${p.path.slice(1)}index.html` : p.path.slice(1), p.html);
write('404.html', notFoundPage());

// ---- assets ----
await esbuild({ entryPoints: [path.join(root, 'src/assets/css/main.css')], outfile: path.join(dist, 'assets/css/main.css'), minify: true, bundle: false, loader: { '.css': 'css' }, logLevel: 'warning' });
await esbuild({ entryPoints: [path.join(root, 'src/assets/js/main.js')], outfile: path.join(dist, 'assets/js/main.js'), minify: true, bundle: false, target: 'es2019', logLevel: 'warning' });
fs.cpSync(path.join(root, 'src/assets/fonts'), path.join(dist, 'assets/fonts'), { recursive: true });
fs.cpSync(path.join(root, 'generated/img'), path.join(dist, 'assets/img'), { recursive: true });

// ---- static files ----
const st = path.join(root, 'src/static');
fs.copyFileSync(path.join(st, 'fav-32x32.png'), path.join(dist, 'favicon-32x32.png'));
fs.copyFileSync(path.join(st, 'fav-192x192.png'), path.join(dist, 'favicon-192x192.png'));
fs.copyFileSync(path.join(st, 'fav-180x180.png'), path.join(dist, 'apple-touch-icon.png'));
{ // real .ico container wrapping the 32x32 PNG
  const png = fs.readFileSync(path.join(st, 'fav-32x32.png'));
  const h = Buffer.alloc(22); h.writeUInt16LE(0, 0); h.writeUInt16LE(1, 2); h.writeUInt16LE(1, 4);
  h[6] = 32; h[7] = 32; h.writeUInt16LE(1, 10); h.writeUInt16LE(32, 12); h.writeUInt32LE(png.length, 14); h.writeUInt32LE(22, 18);
  fs.writeFileSync(path.join(dist, 'favicon.ico'), Buffer.concat([h, png]));
}

// ---- sitemap (indexable pages only, with image entries) ----
const urls = pages.filter(p => !p.noindex).map(p => {
  const imgs = (p.images || []).map(k => `<image:image><image:loc>${abs(imgFallback(k))}</image:loc></image:image>`).join('');
  return `<url><loc>${abs(p.path)}</loc><lastmod>${SITE.buildDate}</lastmod><priority>${p.priority || '0.5'}</priority>${imgs}</url>`;
});
write('sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n${urls.join('\n')}\n</urlset>\n`);
write('robots.txt', `User-agent: *\nAllow: /\nDisallow: /api/\nDisallow: /contact/thank-you/\n\nSitemap: ${SITE.url}/sitemap.xml\n`);

// ---- vercel.json (generated: headers, redirects incl. legacy WordPress image URLs) ----
const legacy = Object.entries(IMAGES).filter(([, i]) => !i.src.startsWith('corporate-video')).flatMap(([key, i]) => {
  const name = i.src.replace(/\.jpg$/, ''); const dest = imgFallback(key);
  return [
    { source: `/wp/wp-content/uploads/:y/:m/${name}.jpg`, destination: dest, permanent: true },
    { source: `/wp/wp-content/uploads/:y/:m/${name}-:w(\\d+)x:h(\\d+).jpg`, destination: dest, permanent: true }
  ];
});
const vercel = {
  $schema: 'https://openapi.vercel.sh/vercel.json',
  buildCommand: 'npm run build',
  outputDirectory: 'dist',
  trailingSlash: true,
  cleanUrls: false,
  redirects: [
    { source: '/:path*', has: [{ type: 'host', value: 'www.mastercraftengineers.com' }], destination: 'https://mastercraftengineers.com/:path*', permanent: true },
    { source: '/index.html', destination: '/', permanent: true },
    { source: '/wp/wp-content/uploads/:y/:m/mastercraft_logo.png', destination: '/assets/img/mastercraft-logo.png', permanent: true },
    ...legacy
  ],
  headers: [
    { source: '/(.*)', headers: [
      { key: 'X-Content-Type-Options', value: 'nosniff' },
      { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
      { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
      { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
      { key: 'Strict-Transport-Security', value: 'max-age=31536000' }
    ] },
    { source: '/assets/img/(.*)', headers: [{ key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }] },
    { source: '/assets/fonts/(.*)', headers: [{ key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }] },
    { source: '/assets/(css|js)/(.*)', headers: [{ key: 'Cache-Control', value: 'public, max-age=86400, stale-while-revalidate=604800' }] },
    { source: '/api/(.*)', headers: [{ key: 'Cache-Control', value: 'no-store' }] }
  ]
};
fs.writeFileSync(path.join(root, 'vercel.json'), JSON.stringify(vercel, null, 2) + '\n');

console.log(`build: ${pages.length} pages, sitemap ${urls.length} urls`);
