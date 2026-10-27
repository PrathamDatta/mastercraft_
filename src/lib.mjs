import fs from 'node:fs';
import path from 'node:path';
import { SITE, NAV } from './data.mjs';
import { IMAGES } from './images.config.mjs';

import crypto from 'node:crypto';
const root = path.resolve(import.meta.dirname, '..');
const INLINE_JS = "document.documentElement.classList.add('js')";
const INLINE_HASH = crypto.createHash('sha256').update(INLINE_JS).digest('base64');
const CSP = `default-src 'self'; script-src 'self' 'sha256-${INLINE_HASH}'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self'; frame-src https://www.youtube-nocookie.com; connect-src 'self'; form-action 'self'; base-uri 'self'; object-src 'none'`;
export const MANIFEST = JSON.parse(fs.readFileSync(path.join(root, '.cache/img-manifest.json'), 'utf8'));

export const esc = (s = '') => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
export const abs = (p) => SITE.url + p;
export const imgUrl = (key, w, fmt = 'webp') => {
  const m = MANIFEST[key];
  const ww = w ?? m.widths[m.widths.length - 1];
  return `/assets/img/${m.slug}-${ww}.${fmt}`;
};
export const imgFallback = (key) => { const m = MANIFEST[key]; return `/assets/img/${m.slug}-${m.fallbackW}.jpg`; };
export const imgMaxUrl = (key, fmt = 'webp') => imgUrl(key, null, fmt);

/** Responsive <picture>: AVIF + WebP + JPEG fallback, intrinsic size attributes to prevent layout shift. */
export function pic(key, { alt, sizes = '100vw', cls = '', eager = false, maxW = 9999, style = '', decorative = false } = {}) {
  const m = MANIFEST[key];
  if (!m) throw new Error(`Unknown image key ${key}`);
  const ws = m.widths.filter(w => w <= maxW);
  const use = ws.length ? ws : [m.widths[0]];
  const top = use[use.length - 1];
  const h = Math.round(top * m.h / m.w);
  const srcset = (fmt) => use.map(w => `/assets/img/${m.slug}-${w}.${fmt} ${w}w`).join(', ');
  const altText = decorative ? '' : (alt ?? IMAGES[key].alt);
  return `<picture${cls ? ` class="${cls}"` : ''}><source type="image/avif" srcset="${srcset('avif')}" sizes="${sizes}"><source type="image/webp" srcset="${srcset('webp')}" sizes="${sizes}"><img src="/assets/img/${m.slug}-${m.fallbackW}.jpg" width="${top}" height="${h}" alt="${esc(altText)}"${eager ? ' fetchpriority="high"' : ' loading="lazy" decoding="async"'}${style ? ` style="${style}"` : ''}></picture>`;
}

/** Wrap each word of a headline so the entrance animation can stagger without JavaScript. */
export function splitWords(text, startIndex = 0) {
  return text.split(' ').map((w, i) => `<span class="w"><span style="--i:${startIndex + i}">${esc(w)}</span></span>`).join(' ');
}

export function breadcrumbLd(trail) {
  return {
    '@type': 'BreadcrumbList',
    itemListElement: trail.map((t, i) => ({ '@type': 'ListItem', position: i + 1, name: t.name, item: abs(t.href) }))
  };
}

export const ORG_ID = `${SITE.url}/#organization`;
export function orgLd() {
  return {
    '@type': ['Organization', 'LocalBusiness'],
    '@id': ORG_ID,
    name: SITE.name,
    legalName: SITE.legalName,
    url: SITE.url + '/',
    logo: abs('/assets/img/mastercraft-logo.png'),
    image: abs('/assets/img/mastercraft-engineers-og.jpg'),
    slogan: SITE.tagline,
    description: 'Precision injection mould design and manufacturing, and plastic injection moulding, in Bengaluru, India, operating since 1992.',
    foundingDate: String(SITE.founded),
    email: SITE.email,
    telephone: SITE.phones.map(p => p.tel),
    address: {
      '@type': 'PostalAddress',
      streetAddress: SITE.address.street,
      addressLocality: SITE.address.locality,
      addressRegion: SITE.address.region,
      postalCode: SITE.address.postalCode,
      addressCountry: SITE.address.country
    },
    areaServed: 'IN',
    knowsAbout: ['Injection mould design', 'Injection mould manufacturing', 'Plastic injection moulding', 'CNC machining', 'EDM', 'Two-component injection moulding'],
    sameAs: [SITE.youtube],
    contactPoint: [{ '@type': 'ContactPoint', contactType: 'sales and project enquiries', email: SITE.email, telephone: SITE.phones[0].tel, availableLanguage: ['English'] }]
  };
}
export const websiteLd = () => ({ '@type': 'WebSite', '@id': `${SITE.url}/#website`, url: SITE.url + '/', name: SITE.name, publisher: { '@id': ORG_ID }, inLanguage: 'en-IN' });

function navHtml(current) {
  const isIn = (href) => current === href || (href !== '/' && current.startsWith(href));
  const productHrefs = ['/injection-moulds/', '/large-size-injection-moulds/', '/components/', '/2k-parts/'];
  return NAV.map(item => {
    if (item.children) {
      const inGroup = productHrefs.some(h => current.startsWith(h));
      return `<li class="has-sub${inGroup ? ' is-current' : ''}">
        <a href="${item.href}" class="nav-link" data-sub-link>${item.label}</a>
        <button class="sub-toggle" type="button" aria-expanded="false" aria-controls="sub-products"><span class="sr-only">Show ${item.label} menu</span><svg width="10" height="6" viewBox="0 0 10 6" aria-hidden="true" focusable="false"><path d="M1 1l4 4 4-4" fill="none" stroke="currentColor" stroke-width="1.5"/></svg></button>
        <ul class="sub" id="sub-products">
          ${item.children.map(c => `<li><a href="${c.href}"${current.startsWith(c.href) ? ' aria-current="page"' : ''}><span class="sub__t">${c.label}</span><span class="sub__n">${c.note}</span></a></li>`).join('')}
        </ul></li>`;
    }
    const cur = isIn(item.href);
    return `<li><a href="${item.href}" class="nav-link${cur ? ' is-current' : ''}"${cur && current === item.href ? ' aria-current="page"' : cur ? ' aria-current="true"' : ''}>${item.label}</a></li>`;
  }).join('');
}

const FOOTER_LINKS = [
  ['Company', [['/about/', 'About Mastercraft'], ['/facilities/', 'Facilities and capabilities'], ['/quality/', 'Quality and testing'], ['/contact/', 'Contact and enquiries']]],
  ['Products', [['/injection-moulds/', 'Small precision injection moulds'], ['/large-size-injection-moulds/', 'Large injection moulds'], ['/components/', 'Plastic injection-moulded components'], ['/2k-parts/', 'Two-component (2K) parts']]]
];

export function layout({ path: pagePath, title, description, body, ld = [], noindex = false, home = false, preload = [], ogImage = '/assets/img/mastercraft-engineers-og.jpg', ogAlt = 'Milling head cutting a clamped workpiece at Mastercraft Engineers', pageClass = '', headerTone = 'dark' }) {
  const canonical = abs(pagePath);
  const fullTitle = title.includes('Mastercraft') ? title : `${title} | Mastercraft Engineers`;
  const graph = { '@context': 'https://schema.org', '@graph': ld };
  const a = SITE.address;
  return `<!doctype html>
<html lang="en-IN">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta http-equiv="Content-Security-Policy" content="${CSP}">
<title>${esc(fullTitle)}</title>
<meta name="description" content="${esc(description)}">
<link rel="canonical" href="${canonical}">
<meta name="robots" content="${noindex ? 'noindex, follow' : 'index, follow, max-image-preview:large'}">
<meta name="theme-color" content="#0b0c0e">
<meta property="og:type" content="website">
<meta property="og:site_name" content="${SITE.name}">
<meta property="og:locale" content="en_IN">
<meta property="og:title" content="${esc(fullTitle)}">
<meta property="og:description" content="${esc(description)}">
<meta property="og:url" content="${canonical}">
<meta property="og:image" content="${SITE.url}${ogImage}">
<meta property="og:image:width" content="1200"><meta property="og:image:height" content="630">
<meta property="og:image:alt" content="${esc(ogAlt)}">
<meta name="twitter:card" content="summary_large_image">
<link rel="icon" href="/favicon-32x32.png" sizes="32x32" type="image/png">
<link rel="icon" href="/favicon-192x192.png" sizes="192x192" type="image/png">
<link rel="apple-touch-icon" href="/apple-touch-icon.png">
<link rel="preload" href="/assets/fonts/archivo-var.woff2" as="font" type="font/woff2" crossorigin>
${preload.join('\n')}
<script>${INLINE_JS}</script>
<link rel="stylesheet" href="/assets/css/main.css?v=${SITE.buildDate}">
<script src="/assets/js/main.js?v=${SITE.buildDate}" defer></script>
<script type="application/ld+json">${JSON.stringify(graph)}</script>
</head>
<body class="${pageClass}">
<a class="skip" href="#main">Skip to main content</a>
<header class="site-header" data-header data-tone="${headerTone}">
  <div class="container nav-inner">
    <a class="brand" href="/" aria-label="Mastercraft Engineers, home">
      <picture><source type="image/webp" srcset="/assets/img/mastercraft-logo-light.webp"><img src="/assets/img/mastercraft-logo-light.png" width="400" height="106" alt="Mastercraft Engineers" fetchpriority="high"></picture>
    </a>
    <button class="menu-toggle" type="button" aria-expanded="false" aria-controls="primary-nav"><span class="menu-toggle__bars" aria-hidden="true"></span><span class="menu-toggle__label">Menu</span></button>
    <nav class="primary-nav" id="primary-nav" aria-label="Primary">
      <ul class="nav-list">${navHtml(pagePath)}</ul>
      <a class="btn btn--primary btn--sm nav-cta" href="/contact/">Discuss your project</a>
    </nav>
  </div>
</header>
<main id="main" tabindex="-1">
${body}
</main>
<footer class="site-footer">
  <div class="container footer-grid">
    <div class="footer-brand">
      <picture><source type="image/webp" srcset="/assets/img/mastercraft-logo-light.webp"><img src="/assets/img/mastercraft-logo-light.png" width="400" height="106" alt="Mastercraft Engineers" loading="lazy" decoding="async"></picture>
      <p class="footer-tag">${SITE.tagline}</p>
      <p class="footer-blurb">Precision injection mould design and manufacturing, and plastic injection moulding, in Bengaluru since ${SITE.founded}.</p>
    </div>
    ${FOOTER_LINKS.map(([h, links]) => `<nav aria-label="${h}"><h2 class="footer-h">${h}</h2><ul>${links.map(([href, l]) => `<li><a href="${href}">${l}</a></li>`).join('')}</ul></nav>`).join('')}
    <address class="footer-contact">
      <h2 class="footer-h">Contact</h2>
      <p>${esc(SITE.legalName)}<br>${a.lines.map(esc).join('<br>')}</p>
      <p>${SITE.phones.map(p => `<a href="tel:${p.tel}">${p.display}</a>`).join('<br>')}</p>
      <p><a href="mailto:${SITE.email}">${SITE.email}</a></p>
      <p><a href="${SITE.mapsLink}" rel="noopener" target="_blank">Open in Google Maps<span class="sr-only"> (opens in a new tab)</span></a></p>
    </address>
  </div>
  <div class="container footer-base">
    <p>© ${new Date().getFullYear()} ${esc(SITE.legalName)} All rights reserved.</p>
    <p><a href="${SITE.youtube}" rel="noopener" target="_blank">YouTube channel<span class="sr-only"> (opens in a new tab)</span></a></p>
  </div>
</footer>
</body>
</html>`;
}

export function breadcrumbHtml(trail) {
  return `<nav class="crumbs" aria-label="Breadcrumb"><ol>${trail.map((t, i) => i === trail.length - 1 ? `<li><span aria-current="page">${esc(t.name)}</span></li>` : `<li><a href="${t.href}">${esc(t.name)}</a></li>`).join('')}</ol></nav>`;
}

export const arrow = '<svg class="arr" width="18" height="12" viewBox="0 0 18 12" aria-hidden="true" focusable="false"><path d="M0 6h16M11 1l5 5-5 5" fill="none" stroke="currentColor" stroke-width="1.5"/></svg>';
