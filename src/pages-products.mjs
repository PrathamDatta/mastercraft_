import { SITE, SMALL_MOULDS, LARGE_MOULDS, COMPONENTS, TWOK } from './data.mjs';
import { layout, pic, esc, splitWords, orgLd, breadcrumbLd, breadcrumbHtml, arrow, abs, imgFallback } from './lib.mjs';
import { STATS, anatomySection, weightChart, productRow, specTable, ctaBand } from './components.mjs';

export const CATEGORIES = {
  small: {
    base: '/injection-moulds/', items: SMALL_MOULDS, name: 'Small precision injection moulds', short: 'Small precision injection moulds',
    kind: 'Injection mould', parent: { name: 'Small precision injection moulds', href: '/injection-moulds/' }
  },
  large: {
    base: '/large-size-injection-moulds/', items: LARGE_MOULDS, name: 'Large injection moulds', short: 'Large injection moulds',
    kind: 'Large injection mould', parent: { name: 'Large injection moulds', href: '/large-size-injection-moulds/' }
  },
  components: {
    base: '/components/', items: COMPONENTS, name: 'Plastic injection-moulded components', short: 'Plastic injection-moulded components',
    kind: 'Moulded component', parent: { name: 'Plastic injection-moulded components', href: '/components/' }
  },
  twok: {
    base: '/2k-parts/', items: TWOK, name: 'Two-component (2K) parts', short: 'Two-component (2K) parts',
    kind: '2K moulded part', parent: { name: 'Two-component (2K) parts', href: '/2k-parts/' }
  }
};

function itemListLd(cat) {
  return {
    '@type': 'ItemList', name: cat.name,
    itemListElement: cat.items.map((it, i) => ({ '@type': 'ListItem', position: i + 1, url: abs(`${cat.base}${it.slug}/`), name: it.name }))
  };
}

function head(trail, eyebrow, h1, lede) {
  return `<section class="page-hero page-hero--dark">
  <div class="container">
    ${breadcrumbHtml(trail)}
    <p class="eyebrow">${eyebrow}</p>
    <h1 class="display">${splitWords(h1)}</h1>
    <p class="lede">${lede}</p>
  </div>
</section>`;
}

// ---------- Small moulds ----------
export function smallMouldsPage() {
  const cat = CATEGORIES.small;
  const trail = [{ name: 'Home', href: '/' }, { name: cat.name, href: cat.base }];
  const body = `${head(trail, 'Products', 'Small precision injection moulds', `Compact production tools, from two-cavity moulds for battery lids to a ${STATS.maxCavities}-cavity mould for telephone socket parts. Each entry lists mould size, cavities, hot-runner configuration where documented, part size and plastic material.`)}
${anatomySection()}
<section class="section section--paper plist" aria-labelledby="list-h">
  <div class="container">
    <h2 id="list-h" class="h2">${STATS.smallCount} documented moulds</h2>
    <div class="plist__items">${cat.items.map((it, i) => productRow(it, cat.base, i)).join('')}</div>
    <p class="note">Looking for larger tooling? See the <a href="/large-size-injection-moulds/">large injection moulds</a>. Parts moulded in tools like these are shown under <a href="/components/">plastic components</a>.</p>
  </div>
</section>
${ctaBand({ title: 'Need a small precision mould?', ref: 'small-moulds' })}`;
  return layout({
    path: cat.base, title: 'Small Precision Injection Moulds | Mastercraft Engineers',
    description: `Documented small precision injection moulds from Mastercraft Engineers, Bengaluru: two- to ${STATS.maxCavities}-cavity moulds with mould size, cavity count, part size and material.`,
    body, ld: [orgLd(), { '@type': 'CollectionPage', url: abs(cat.base), name: cat.name, about: { '@id': `${SITE.url}/#organization` } }, itemListLd(cat), breadcrumbLd(trail)], pageClass: 'page-inner'
  });
}

// ---------- Large moulds ----------
export function largeMouldsPage() {
  const cat = CATEGORIES.large;
  const trail = [{ name: 'Home', href: '/' }, { name: cat.name, href: cat.base }];
  const sorted = [...cat.items];
  const body = `${head(trail, 'Products', 'Large injection moulds', `Moulds from ${STATS.largeMin} to ${STATS.largeMax} tonnes for large plastic parts: door trims, pillars, a cowl, a side sill and wheel arches among them. Hot-runner configurations of up to six drops are documented.`)}
<section class="section section--ink2" aria-labelledby="chart-h">
  <div class="container chart-grid">
    <div>
      <p class="eyebrow"><span class="idx">A</span> Range</p>
      <h2 id="chart-h" class="h2">${STATS.largeCount} documented moulds, by weight</h2>
      <p class="lede lede--sm">Weights are as published for each mould. Select a bar to open its full specification.</p>
    </div>
    ${weightChart()}
  </div>
</section>
<section class="section section--paper" aria-labelledby="idx-h">
  <div class="container">
    <h2 id="idx-h" class="h2">Specification index</h2>
    <div class="table-wrap" tabindex="0" role="region" aria-label="Large mould specifications (scrollable table)">
    <table class="spec spec--wide spec--index"><caption>Large injection moulds: size, weight, hot runner and part data as published</caption>
      <thead><tr><th scope="col">Mould</th><th scope="col">Mould size (mm)</th><th scope="col">Mould weight</th><th scope="col">Hot runner</th><th scope="col">Part size (mm)</th><th scope="col">Part weight</th><th scope="col">Material</th></tr></thead>
      <tbody>${sorted.map(m => { const g = (l) => m.specs.find(s => s.label === l)?.value ?? '—'; return `<tr><th scope="row"><a href="${cat.base}${m.slug}/">${esc(m.name)}</a></th><td>${esc(g('Mould size').replace(' mm', ''))}</td><td>${esc(g('Mould weight'))}</td><td>${esc(g('Hot runner (HRS)'))}</td><td>${esc(g('Part size').replace(' mm', ''))}</td><td>${esc(g('Part weight'))}</td><td>${esc(g('Plastic raw material'))}</td></tr>`; }).join('')}</tbody></table></div>
  </div>
</section>
<section class="section section--paper gridlist" aria-labelledby="gal-h">
  <div class="container">
    <h2 id="gal-h" class="h2">Mould photographs</h2>
    <ul class="mgrid">${cat.items.map((m, i) => `<li class="reveal"><a href="${cat.base}${m.slug}/"><figure class="plate">${pic(m.img, { sizes: '(min-width: 960px) 30vw, (min-width: 600px) 46vw, 92vw', maxW: 800 })}</figure><span class="mono">${esc(m.specs.find(s => s.label === 'Mould weight').value)}</span><span class="mgrid__t">${esc(m.name)}</span></a></li>`).join('')}</ul>
    <p class="note">Smaller tooling is shown under <a href="/injection-moulds/">small precision injection moulds</a>. Facilities that build these moulds are described on the <a href="/facilities/">facilities page</a>.</p>
  </div>
</section>
${ctaBand({ title: 'Planning a large mould?', ref: 'large-moulds' })}`;
  return layout({
    path: cat.base, title: 'Large Injection Moulds up to 18.5 t | Mastercraft Engineers',
    description: `Large injection moulds from Mastercraft Engineers, Bengaluru: ${STATS.largeCount} documented moulds, ${STATS.largeMin} to ${STATS.largeMax} tonnes, with size, hot-runner drops and material.`,
    body, ld: [orgLd(), { '@type': 'CollectionPage', url: abs(cat.base), name: cat.name, about: { '@id': `${SITE.url}/#organization` } }, itemListLd(cat), breadcrumbLd(trail)], pageClass: 'page-inner'
  });
}

// ---------- Components ----------
export function componentsPage() {
  const cat = CATEGORIES.components;
  const trail = [{ name: 'Home', href: '/' }, { name: cat.name, href: cat.base }];
  const mats = [...new Set(cat.items.flatMap(c => c.items.map(i => i.material)).filter(Boolean))];
  const body = `${head(trail, 'Products', 'Plastic injection-moulded components', `Small precision parts moulded at Mastercraft, from ${STATS.partMin} g clips to ${STATS.partMax} g housings, each with its plastic raw material documented.`)}
<section class="section section--ink2" aria-labelledby="mat-h">
  <div class="container chart-grid">
    <div>
      <p class="eyebrow"><span class="idx">A</span> Materials</p>
      <h2 id="mat-h" class="h2">Plastic raw materials documented on this page</h2>
      <p class="lede lede--sm">As published for the ${STATS.partCount} parts below. Grade names are given as recorded.</p>
    </div>
    <ul class="chips">${mats.map(m => `<li>${esc(m)}</li>`).join('')}</ul>
  </div>
</section>
<section class="section section--paper plist" aria-labelledby="list-h">
  <div class="container">
    <h2 id="list-h" class="h2">${cat.items.length} part groups, ${STATS.partCount} parts</h2>
    <div class="plist__items">${cat.items.map((it, i) => productRow(it, cat.base, i)).join('')}</div>
    <p class="note">Two-material parts are listed separately under <a href="/2k-parts/">2K parts</a>. The tooling behind such parts is shown under <a href="/injection-moulds/">small precision injection moulds</a>.</p>
  </div>
</section>
${ctaBand({ title: 'Need moulded components?', ref: 'components' })}`;
  return layout({
    path: cat.base, title: 'Plastic Injection-Moulded Components | Mastercraft Engineers',
    description: `Plastic injection-moulded components from Mastercraft Engineers, Bengaluru: ${STATS.partCount} documented parts, ${STATS.partMin} to ${STATS.partMax} g, with materials such as POM, PC, PP.`,
    body, ld: [orgLd(), { '@type': 'CollectionPage', url: abs(cat.base), name: cat.name, about: { '@id': `${SITE.url}/#organization` } }, itemListLd(cat), breadcrumbLd(trail)], pageClass: 'page-inner'
  });
}

// ---------- 2K ----------
export function twokPage() {
  const cat = CATEGORIES.twok;
  const trail = [{ name: 'Home', href: '/' }, { name: cat.name, href: cat.base }];
  const body = `${head(trail, 'Products', 'Two-component (2K) parts', 'Parts moulded from two materials in one part, documented with cavity count, material combination and weight.')}
<section class="section section--paper plist" aria-labelledby="list-h">
  <div class="container">
    <h2 id="list-h" class="h2">${STATS.twokCount} documented 2K parts</h2>
    <div class="plist__items">${cat.items.map((it, i) => productRow(it, cat.base, i)).join('')}</div>
    <p class="note">Single-material parts are listed under <a href="/components/">plastic components</a>.</p>
  </div>
</section>
${ctaBand({ title: 'Need a two-component part?', ref: '2k-parts' })}`;
  return layout({
    path: cat.base, title: '2K Two-Component Moulded Parts | Mastercraft Engineers',
    description: 'Two-component (2K) moulded parts from Mastercraft Engineers, Bengaluru: over-moulded cover, HVAC flap, knob and dial, with cavities, materials and weight.',
    body, ld: [orgLd(), { '@type': 'CollectionPage', url: abs(cat.base), name: cat.name, about: { '@id': `${SITE.url}/#organization` } }, itemListLd(cat), breadcrumbLd(trail)], pageClass: 'page-inner'
  });
}

// ---------- Detail template (all categories) ----------
function summarySentence(cat, it) {
  const g = (l) => it.specs.find(s => s.label === l)?.value;
  if (it.kind === 'mould') {
    const bits = [`mould envelope ${g('Mould size')}`, g('Mould weight') && `weighing ${g('Mould weight')}`].filter(Boolean).join(', ');
    const hrs = g('Hot runner (HRS)') ? ` Hot-runner configuration: ${g('Hot runner (HRS)')}.` : '';
    const cav = g('Cavities') ? ` Cavities: ${g('Cavities')}.` : '';
    const part = [g('Part size') && `${g('Part size')}`, g('Part weight') && `${g('Part weight')}`, g('Plastic raw material') && `in ${g('Plastic raw material')}`].filter(Boolean).join(', ');
    return `${it.name}: ${bits}.${cav}${hrs}${part ? ` The moulded part is ${part}.` : ''}`;
  }
  if (it.kind === 'part') {
    return `${it.name}: ` + it.items.map(p => `${p.name} (${p.weight} g${p.material ? `, ${p.material}` : ''})`).join('; ') + '.';
  }
  return `${it.name}: ${g('Cavities') ? `${g('Cavities')} cavities, ` : ''}${g('Plastic material')}, ${g('Part weight')}.`;
}

export function detailPage(catKey, it, idx) {
  const cat = CATEGORIES[catKey];
  const url = `${cat.base}${it.slug}/`;
  const trail = [{ name: 'Home', href: '/' }, cat.parent, { name: it.name, href: url }];
  const prev = cat.items[(idx - 1 + cat.items.length) % cat.items.length];
  const next = cat.items[(idx + 1) % cat.items.length];
  const others = cat.items.filter(x => x !== it).slice(0, 4);
  const sentence = summarySentence(cat, it);
  const product = {
    '@type': 'Product', '@id': abs(url) + '#product', name: it.name, description: sentence,
    image: abs(imgFallback(it.img)), url: abs(url), category: cat.kind,
    manufacturer: { '@id': `${SITE.url}/#organization` },
    additionalProperty: it.specs.map(s => ({ '@type': 'PropertyValue', name: s.label, value: s.value }))
  };
  let title = `${it.name} | ${cat.kind} | Mastercraft Engineers`;
  if (title.length > 66) title = `${it.name} | Mastercraft Engineers`;
  if (title.length > 66) title = `${it.name} | Mastercraft`;
  let desc = sentence.length < 110 ? `${sentence} Specification from Mastercraft Engineers, Bengaluru.` : sentence;
  if (desc.length > 158) desc = desc.slice(0, 155).replace(/\s+\S*$/, '') + '…';
  const body = `
<section class="page-hero page-hero--dark page-hero--detail">
  <div class="container">
    ${breadcrumbHtml(trail)}
    <p class="eyebrow">${esc(cat.kind)}</p>
    <h1 class="display display--md">${splitWords(it.name)}</h1>
  </div>
</section>
<section class="section section--paper detail">
  <div class="container detail__grid">
    <figure class="detail__fig plate reveal-mask">${pic(it.img, { sizes: '(min-width: 960px) 54vw, 92vw', maxW: 1600, eager: true })}<figcaption class="mono">${esc(it.name)}</figcaption></figure>
    <div class="detail__body">
      <h2 class="h3">Specification</h2>
      ${specTable(it, `Specification: ${it.name}`)}
      <p class="detail__sum">${esc(sentence)}</p>
      <p class="note">Values are as published by Mastercraft Engineers. Tolerances, finishes and other details are not part of this listing.</p>
      <div class="detail__cta">
        <a class="btn btn--primary" href="/contact/?ref=${encodeURIComponent(it.name)}">Enquire about a similar requirement ${arrow}</a>
        <a class="btn btn--line" href="${cat.base}">All ${esc(cat.short.toLowerCase())}</a>
      </div>
    </div>
  </div>
</section>
<section class="section section--ink2 related" aria-labelledby="rel-h">
  <div class="container">
    <div class="related__head"><h2 id="rel-h" class="h3">More ${esc(cat.short.toLowerCase())}</h2>
      <nav class="pn" aria-label="Previous and next"><a href="${cat.base}${prev.slug}/" rel="prev"><span class="mono">Previous</span> ${esc(prev.name)}</a><a href="${cat.base}${next.slug}/" rel="next"><span class="mono">Next</span> ${esc(next.name)}</a></nav></div>
    <ul class="mgrid mgrid--dark">${others.map(m => `<li><a href="${cat.base}${m.slug}/"><figure class="plate">${pic(m.img, { sizes: '(min-width: 960px) 22vw, 46vw', maxW: 800 })}</figure><span class="mgrid__t">${esc(m.name)}</span></a></li>`).join('')}</ul>
  </div>
</section>`;
  return {
    path: url,
    html: layout({
      path: url,
      title: title,
      description: desc,
      body, ld: [orgLd(), product, breadcrumbLd(trail)], pageClass: 'page-inner page-detail',
      ogImage: imgFallback(it.img), ogAlt: `${it.name}`
    })
  };
}

// ---------- Contact ----------
export function contactPage() {
  const trail = [{ name: 'Home', href: '/' }, { name: 'Contact', href: '/contact/' }];
  const a = SITE.address;
  const body = `${head(trail, 'Contact and project enquiries', 'Discuss your mould or component requirement.', 'Send the details of what you want made. The more of the information below you can share, the more useful the first reply can be.')}
<section class="section section--paper contact" id="enquiry">
  <div class="container contact__grid">
    <form class="form" id="enquiry-form" method="post" action="/api/contact" novalidate data-enquiry-form aria-labelledby="form-h">
      <h2 id="form-h" class="h3">Project enquiry</h2>
      <p class="note" id="form-note">Fields marked <span aria-hidden="true">*</span><span class="sr-only">with an asterisk</span> are required.</p>
      <div class="form__status" role="status" aria-live="polite" data-status></div>
      <div class="field"><label for="f-name">Your name <span aria-hidden="true">*</span></label><input id="f-name" name="name" type="text" autocomplete="name" required aria-describedby="e-name"><p class="err" id="e-name" hidden></p></div>
      <div class="field"><label for="f-email">Email <span aria-hidden="true">*</span></label><input id="f-email" name="email" type="email" autocomplete="email" required aria-describedby="e-email"><p class="err" id="e-email" hidden></p></div>
      <div class="field"><label for="f-company">Company name <span aria-hidden="true">*</span></label><input id="f-company" name="company" type="text" autocomplete="organization" required aria-describedby="e-company"><p class="err" id="e-company" hidden></p></div>
      <div class="field"><label for="f-phone">Phone <span class="opt">(optional)</span></label><input id="f-phone" name="phone" type="tel" autocomplete="tel" inputmode="tel" aria-describedby="e-phone"><p class="err" id="e-phone" hidden></p></div>
      <div class="field"><label for="f-type">What do you need?</label>
        <select id="f-type" name="type"><option value="">Select (optional)</option><option>A new injection mould</option><option>A large injection mould</option><option>Plastic moulded components</option><option>A two-component (2K) part</option><option>Something else</option></select></div>
      <div class="field"><label for="f-msg">Project details <span aria-hidden="true">*</span></label><textarea id="f-msg" name="message" rows="7" required aria-describedby="e-msg hint-msg"></textarea><p class="hint" id="hint-msg">Part or mould description, material, size and weight, expected quantities, and any timeline.</p><p class="err" id="e-msg" hidden></p></div>
      <div class="hp" aria-hidden="true"><label>Leave this field empty<input type="text" name="website" tabindex="-1" autocomplete="off"></label></div>
      <input type="hidden" name="started" value="" data-started>
      <button class="btn btn--primary btn--lg" type="submit" data-submit>Send enquiry ${arrow}</button>
      <p class="note">By sending this form you agree that Mastercraft Engineers may use your details to reply to your enquiry. Prefer email? Write to <a href="mailto:${SITE.email}">${SITE.email}</a>; drawings and 3D models can be sent there.</p>
    </form>
    <aside class="contact__aside">
      <div class="card-line">
        <h2 class="h4">Mastercraft Engineers Pvt. Ltd.</h2>
        <address>${a.lines.map(esc).join('<br>')}</address>
        <p class="contact__links"><span class="mono">Phone</span>${SITE.phones.map(p => `<a href="tel:${p.tel}">${p.display}</a>`).join('')}<span class="mono">Email</span><a href="mailto:${SITE.email}">${SITE.email}</a></p>
        <a class="link-arrow" href="${SITE.mapsLink}" rel="noopener" target="_blank">Open in Google Maps${arrow}<span class="sr-only"> (opens in a new tab)</span></a>
      </div>
      <div class="card-line">
        <h2 class="h4">Helpful to include</h2>
        <ul class="checklist">
          <li>What you need: a mould, moulded components, or both</li>
          <li>Part drawings or a 3D model, if available</li>
          <li>Plastic material and any colour or finish requirements</li>
          <li>Part size, weight and number of cavities you have in mind</li>
          <li>Expected quantities and timeline</li>
        </ul>
        <p class="note">If something is missing, the team will ask.</p>
      </div>
    </aside>
  </div>
</section>`;
  return layout({
    path: '/contact/', title: 'Contact & Project Enquiries | Mastercraft Engineers, Bengaluru',
    description: 'Contact Mastercraft Engineers at Bommasandra Industrial Area, Bengaluru: project enquiry form, telephone +91-80-27839712, email info@mcraft.net.',
    body, ld: [orgLd(), { '@type': 'ContactPage', url: abs('/contact/'), name: 'Contact Mastercraft Engineers', about: { '@id': `${SITE.url}/#organization` } }, breadcrumbLd(trail)], pageClass: 'page-inner'
  });
}

export function thanksPage() {
  const body = `<section class="page-hero page-hero--dark"><div class="container"><p class="eyebrow">Enquiry sent</p><h1 class="display display--md">Thank you. We have your enquiry.</h1><p class="lede">The team will reply to the email address you provided. If your matter is urgent, call ${SITE.phones.map(p => `<a href="tel:${p.tel}">${p.display}</a>`).join(' or ')}.</p><p><a class="btn btn--primary" href="/">Back to the home page</a></p></div></section>`;
  return layout({ path: '/contact/thank-you/', title: 'Enquiry Sent | Mastercraft Engineers', description: 'Your enquiry to Mastercraft Engineers has been sent.', body, noindex: true, ld: [orgLd()], pageClass: 'page-inner' });
}

export function notFoundPage() {
  const body = `<section class="page-hero page-hero--dark"><div class="container"><p class="eyebrow">Error 404</p><h1 class="display display--md">This page could not be found.</h1><p class="lede">The address may have changed. These pages are the best places to continue.</p>
  <ul class="jump"><li><a href="/">Home</a></li><li><a href="/injection-moulds/">Small precision injection moulds</a></li><li><a href="/large-size-injection-moulds/">Large injection moulds</a></li><li><a href="/components/">Components</a></li><li><a href="/facilities/">Facilities</a></li><li><a href="/contact/">Contact</a></li></ul></div></section>`;
  return layout({ path: '/404.html', title: 'Page Not Found | Mastercraft Engineers', description: 'The page you requested could not be found.', body, noindex: true, ld: [orgLd()], pageClass: 'page-inner' });
}
