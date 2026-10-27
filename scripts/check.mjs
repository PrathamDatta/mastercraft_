// Static checks over dist/: SEO basics, structured data, links, images, ids.
import fs from 'node:fs';
import path from 'node:path';
const dist = path.resolve(import.meta.dirname, '../dist');
const SITE = 'https://mastercraftengineers.com';
const files = [];
(function walk(d) { for (const f of fs.readdirSync(d, { withFileTypes: true })) { const p = path.join(d, f.name); f.isDirectory() ? walk(p) : p.endsWith('.html') && files.push(p); } })(dist);
const fail = []; const warn = [];
const titles = new Map(), descs = new Map();
const exists = (u) => { const p = u.split('#')[0].split('?')[0]; if (!p) return true; const f = path.join(dist, p); return fs.existsSync(f) && (fs.statSync(f).isFile() || fs.existsSync(path.join(f, 'index.html'))); };
const idsOf = new Map();
const htmlOf = (u) => { const p = u.split('#')[0] || '/'; const f = path.join(dist, p.endsWith('/') ? p + 'index.html' : p); return fs.existsSync(f) ? fs.readFileSync(f, 'utf8') : ''; };
let linkCount = 0, imgCount = 0;
for (const file of files) {
  const rel = '/' + path.relative(dist, file).replace(/index\.html$/, '');
  const h = fs.readFileSync(file, 'utf8'); const is404 = rel === '/404.html';
  const t = (h.match(/<title>([^<]*)<\/title>/) || [])[1]; const d = (h.match(/<meta name="description" content="([^"]*)"/) || [])[1];
  const canon = (h.match(/<link rel="canonical" href="([^"]*)"/) || [])[1];
  const noindex = /name="robots" content="noindex/.test(h);
  if (!t) fail.push(`${rel}: no <title>`); if (!d) fail.push(`${rel}: no meta description`);
  if (t && t.length > 70) warn.push(`${rel}: title ${t.length} chars`); if (d && (d.length > 165 || d.length < 70)) warn.push(`${rel}: description ${d.length} chars`);
  if (titles.has(t)) fail.push(`${rel}: duplicate title with ${titles.get(t)}`); titles.set(t, rel);
  if (descs.has(d)) fail.push(`${rel}: duplicate description with ${descs.get(d)}`); descs.set(d, rel);
  if (canon !== SITE + (is404 ? '/404.html' : rel)) fail.push(`${rel}: canonical ${canon}`);
  const h1s = (h.match(/<h1[\s>]/g) || []).length; if (h1s !== 1) fail.push(`${rel}: ${h1s} <h1>`);
  // heading order
  const hs = [...h.matchAll(/<h([1-6])[\s>]/g)].map(m => +m[1]); for (let i = 1; i < hs.length; i++) if (hs[i] - hs[i - 1] > 1) { fail.push(`${rel}: heading jump h${hs[i - 1]}->h${hs[i]}`); break; }
  // JSON-LD
  const ld = [...h.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)];
  if (!ld.length) fail.push(`${rel}: no JSON-LD`);
  for (const m of ld) { try { const j = JSON.parse(m[1]); if (!j['@graph']?.length) fail.push(`${rel}: empty graph`); } catch (e) { fail.push(`${rel}: bad JSON-LD ${e.message}`); } }
  // images
  for (const m of h.matchAll(/<img\b[^>]*>/g)) { imgCount++; const tag = m[0]; if (!/ alt="/.test(tag)) fail.push(`${rel}: img without alt`); if (!/ width="\d+"/.test(tag) || !/ height="\d+"/.test(tag)) fail.push(`${rel}: img without dimensions`); const src = (tag.match(/ src="([^"]+)"/) || [])[1]; if (src && !exists(src)) fail.push(`${rel}: missing image ${src}`); }
  for (const m of h.matchAll(/srcset="([^"]+)"/g)) for (const part of m[1].split(',')) { const u = part.trim().split(' ')[0]; if (u.startsWith('/') && !exists(u)) fail.push(`${rel}: missing srcset ${u}`); }
  // ids
  const ids = [...h.matchAll(/ id="([^"]+)"/g)].map(m => m[1]); const dup = ids.find((x, i) => ids.indexOf(x) !== i); if (dup) fail.push(`${rel}: duplicate id ${dup}`); idsOf.set(rel, new Set(ids));
  // links
  for (const m of h.matchAll(/<a\b[^>]*href="([^"]*)"[^>]*>([\s\S]*?)<\/a>/g)) {
    const href = m[1]; linkCount++;
    if (/^(mailto:|tel:|https?:)/.test(href)) { if (href.startsWith('http://')) fail.push(`${rel}: insecure link ${href}`); continue; }
    if (href === '#' || href === '') { fail.push(`${rel}: empty link`); continue; }
    const target = href.startsWith('#') ? rel + href : href;
    if (!exists(target)) fail.push(`${rel}: broken link ${href}`);
    const hash = target.split('#')[1];
    if (hash) { const pg = target.split('#')[0] || rel; const html = htmlOf(pg); if (!html.includes(` id="${hash}"`)) fail.push(`${rel}: missing anchor ${target}`); }
    const text = m[2].replace(/<[^>]+>/g, '').trim(); if (!text && !/aria-label/.test(m[0]) && !/aria-hidden="true"/.test(m[0])) fail.push(`${rel}: link without text ${href}`);
  }
}
// sitemap
const sm = fs.readFileSync(path.join(dist, 'sitemap.xml'), 'utf8');
const locs = [...sm.matchAll(/<loc>([^<]*)<\/loc>/g)].map(m => m[1]).filter(u => u.startsWith(SITE) && !/\.(jpg|png)$/.test(u));
for (const u of locs) if (!exists(u.replace(SITE, ''))) fail.push(`sitemap: ${u} missing`);
const indexable = files.filter(f => !/thank-you|404/.test(f)).length; if (locs.length !== indexable) fail.push(`sitemap has ${locs.length} urls but ${indexable} indexable pages`);
// orphan check: every indexable page linked from another page
const linked = new Set(); for (const f of files) for (const m of fs.readFileSync(f, 'utf8').matchAll(/href="(\/[^"#?]*)"/g)) linked.add(m[1]);
for (const f of files) { const rel = '/' + path.relative(dist, f).replace(/index\.html$/, ''); if (rel !== '/' && !/404|thank-you/.test(rel) && !linked.has(rel)) fail.push(`orphan: ${rel}`); }
const robots = fs.readFileSync(path.join(dist, 'robots.txt'), 'utf8'); if (!/Sitemap: https:\/\/mastercraftengineers.com\/sitemap.xml/.test(robots)) fail.push('robots.txt lacks sitemap');
console.log(`checked ${files.length} pages, ${linkCount} links, ${imgCount} <img>, ${locs.length} sitemap urls`);
if (warn.length) console.log('WARN\n  ' + warn.join('\n  '));
if (fail.length) { console.log('FAIL\n  ' + fail.join('\n  ')); process.exit(1); }
console.log('static checks: PASS');
