import { SITE, PROCESS, ENVELOPES, SMALL_MOULDS, LARGE_MOULDS, COMPONENTS, TWOK } from './data.mjs';
import { pic, esc, arrow, markUse } from './lib.mjs';

// ---------- derived, verified statistics ----------
export const STATS = (() => {
  const wts = LARGE_MOULDS.map(m => m.weightT);
  const partWts = COMPONENTS.flatMap(c => c.items.map(i => parseFloat(i.weight)));
  const partCount = COMPONENTS.reduce((n, c) => n + c.items.length, 0);
  return {
    largeCount: LARGE_MOULDS.length,
    largeMin: Math.min(...wts),
    largeMax: Math.max(...wts),
    smallCount: SMALL_MOULDS.length,
    maxCavities: 64,
    partCount,
    partMin: Math.min(...partWts),
    partMax: Math.max(...partWts),
    twokCount: TWOK.length
  };
})();

export const fmt = (n) => String(n);

// ---------- Process: zig-zag timeline with a line that draws as you scroll ----------
export function processSection({ headingLevel = 2 } = {}) {
  const inspected = new Set(['machining', 'moulding', 'inspection']);
  return `<section class="section section--tint process" id="process" aria-labelledby="process-h">
  <div class="container">
    <header class="sec-head sec-head--center">
      <p class="eyebrow"><span class="idx">02</span> Process</p>
      <h${headingLevel} id="process-h" class="h2">From <em>project planning</em> to inspected parts</h${headingLevel}>
      <p class="lede">Seven stages, each documented on the facilities page. Inspection applies to mould inserts and to the plastic components.</p>
    </header>
    <div class="tl" data-tl>
      <div class="tl__prog" data-tl-prog aria-hidden="true"></div>
      <ol class="tl__list">
        ${PROCESS.map((s, i) => `<li class="tl__item reveal" id="stage-${s.id}" data-step="${i}">
          <span class="tl__dot" aria-hidden="true">${s.n}</span>
          <div class="tl__card">
            <figure class="tl__fig reveal-mask">${pic(s.img, { sizes: '(min-width: 860px) 46vw, 80vw', maxW: 1200 })}</figure>
            <div class="tl__body">
              <p class="tl__tags"><span class="tag">${esc(s.group)}</span>${inspected.has(s.id) ? '<span class="tag tag--solid">Inspection point</span>' : ''}</p>
              <h3 class="h3">${esc(s.title)}</h3>
              <p>${esc(s.text)}</p>
              <dl class="facts">${s.facts.map(([k, v]) => `<div><dt>${esc(k)}</dt><dd>${esc(v)}</dd></div>`).join('')}</dl>
            </div>
          </div>
        </li>`).join('')}
      </ol>
    </div>
  </div>
</section>`;
}

// ---------- Bento "what we do" grid (numbers are the published figures) ----------
export function bentoSection() {
  const go = '<span class="tile__go" aria-hidden="true"><svg width="18" height="12" viewBox="0 0 18 12"><path d="M0 6h16M11 1l5 5-5 5" fill="none" stroke="currentColor" stroke-width="1.8"/></svg></span>';
  return `<section class="bento" aria-labelledby="bento-h">
  <div class="container">
    <h2 id="bento-h" class="sr-only">Capabilities at a glance</h2>
    <div class="bento__grid">
      <a class="tile tile--orange reveal" href="/facilities/#moulding">${go}
        <div><p class="tile__k">Injection moulding</p>
        <div class="tile__stack">
          <div><p class="tile__n"><span data-count-to="45">45</span>–<span data-count-to="150">150</span><small>t</small></p><p class="tile__t">Clamping capacity of the moulding machines</p></div>
          <div><p class="tile__n"><span data-count-to="0.5" data-dec="1">0.5</span>–<span data-count-to="300">300</span><small>g</small></p><p class="tile__t">Moulded part weight range, monitored by hourly SPC</p></div>
        </div></div>
        <div class="tile__img">${pic('moulding', { sizes: '(min-width: 1100px) 40vw, 90vw', maxW: 1200, alt: 'Row of injection moulding machines in the production hall' })}</div>
      </a>
      <a class="tile tile--photo reveal" href="/facilities/#machining">${go}${pic('machining2', { sizes: '(min-width: 1100px) 30vw, 90vw', maxW: 1200, decorative: true })}
        <div class="tile__label"><strong>Precision machining</strong><span>5-axis and 3-axis machining centres, wire EDM and CNC EDM</span></div></a>
      <a class="tile tile--tint reveal" href="/large-size-injection-moulds/">${go}
        <p class="tile__k">Large moulds</p>
        <div><p class="tile__n"><span data-count-to="${STATS.largeCount}">${STATS.largeCount}</span></p><p class="tile__t">documented, from ${STATS.largeMin} to ${STATS.largeMax} tonnes</p></div></a>
      <a class="tile tile--photo reveal" href="/quality/">${go}${pic('qualityCmm', { sizes: '(min-width: 1100px) 30vw, 90vw', maxW: 1200, decorative: true })}
        <div class="tile__label"><strong>Quality inspection</strong><span>CMM touch probe, video and laser measurement · MFI · SPC</span></div></a>
      <a class="tile tile--tint2 reveal" href="/injection-moulds/">${go}
        <p class="tile__k">Small precision moulds</p>
        <div><p class="tile__n"><span data-count-to="${STATS.maxCavities}">${STATS.maxCavities}</span><small>cavities</small></p><p class="tile__t">in the largest documented small mould (${STATS.smallCount} moulds listed)</p></div></a>
    </div>
  </div>
</section>`;
}

// ---------- Product explorer (tabs) ----------
export function productExplorer() {
  const cats = [
    { id: 'large', n: '01', title: 'Large injection moulds', sub: `${STATS.largeCount} documented · ${STATS.largeMin}–${STATS.largeMax} t`, href: '/large-size-injection-moulds/', img: 'frDoorTrim',
      text: `Moulds for door trims, pillars, a cowl, a side sill and wheel arches, with hot-runner configurations of up to six drops.`, stats: [`${STATS.largeCount} documented moulds`, `${STATS.largeMin}–${STATS.largeMax} t`, 'Up to 6 hot-runner drops'], cta: 'View the large moulds' },
    { id: 'small', n: '02', title: 'Small precision injection moulds', sub: `${STATS.smallCount} documented · up to ${STATS.maxCavities} cavities`, href: '/injection-moulds/', img: 'mouldSmall1',
      text: 'Compact production tools, from a two-cavity battery-lid mould to a 64-cavity mould for telephone socket parts.', stats: [`${STATS.smallCount} documented moulds`, `2 to ${STATS.maxCavities} cavities`, 'PP, PC FR, LDPE and more'], cta: 'View the small moulds' },
    { id: 'components', n: '03', title: 'Plastic moulded components', sub: `${STATS.partCount} parts · ${STATS.partMin}–${STATS.partMax} g`, href: '/components/', img: 'componentsHero',
      text: 'Precision parts with weight and plastic raw material documented for each one.', stats: [`${STATS.partCount} parts`, `${STATS.partMin}–${STATS.partMax} g`, 'POM, PC, PP, PA 6'], cta: 'View the components' },
    { id: 'twok', n: '04', title: 'Two-component (2K) parts', sub: `${STATS.twokCount} documented parts`, href: '/2k-parts/', img: 'hvacFlap',
      text: 'Parts moulded from two materials in one part, such as a glass-filled polypropylene with a thermoplastic elastomer.', stats: [`${STATS.twokCount} documented parts`, 'PPGF40 + TPE', 'PCABS + TPE'], cta: 'View the 2K parts' }
  ];
  const arr = '<svg width="18" height="12" viewBox="0 0 18 12" aria-hidden="true"><path d="M0 6h16M11 1l5 5-5 5" fill="none" stroke="currentColor" stroke-width="1.8"/></svg>';
  return `<div class="explorer" data-tabs>
    <div class="explorer__tabs" role="tablist" aria-label="Product categories" aria-orientation="vertical">
      ${cats.map((c, i) => `<button class="tab" role="tab" type="button" id="tab-${c.id}" aria-controls="panel-${c.id}" aria-selected="${i === 0}" tabindex="${i === 0 ? 0 : -1}"><span class="tab__n">${c.n}</span><strong>${esc(c.title)}</strong>${arr}<small>${esc(c.sub)}</small></button>`).join('')}
    </div>
    <div class="explorer__panels">
      ${cats.map((c, i) => `<div class="panel" role="tabpanel" id="panel-${c.id}" aria-labelledby="tab-${c.id}"${i ? ' data-initial-hidden' : ''}>
        <div class="plate">${pic(c.img, { sizes: '(min-width: 960px) 34vw, 90vw', maxW: 1200 })}</div>
        <div class="panel__body"><p class="mono panel__k">${esc(c.title)}</p><h3 class="h3">${esc(c.sub.split(' · ').pop().replace(/^up to /, 'Up to '))}</h3><p>${esc(c.text)}</p>
          <ul class="panel__stats">${c.stats.map(t => `<li>${esc(t)}</li>`).join('')}</ul>
          <a class="link-arrow" href="${c.href}">${esc(c.cta)}${arrow}</a></div>
      </div>`).join('')}
    </div>
  </div>`;
}

// ---------- Mould anatomy (annotated real photograph) ----------
const SPOTS = [
  { id: 'a1', title: 'Cavity-side face', x: [95, 510], y: [85, 560], text: 'The part geometry is machined into the face of the mould. This half carries the pockets that form one side of the moulded battery lid.' },
  { id: 'a2', title: 'Mating face', x: [545, 880], y: [125, 575], text: 'The second half closes against the first. Its contoured surface forms the opposite side of the part, so the two faces must register accurately when the mould closes.' },
  { id: 'a3', title: 'Cooling-water hoses', x: [862, 958], y: [172, 525], text: 'The blue hoses link the cooling channels inside the mould. Controlling mould temperature is part of holding part quality in production.' },
  { id: 'a4', title: 'Guide pins', x: [800, 872], y: [520, 582], text: 'Cylindrical guide pins at the corners of the mould half help align the two halves each time the mould closes.' }
];
export function anatomySection() {
  const W = 1005, H = 701;
  return `<section class="section section--white anatomy" id="anatomy" aria-labelledby="anatomy-h">
  <div class="container">
    <div class="anatomy__head">
      <p class="eyebrow"><span class="idx">A</span> Reading a mould</p>
      <h2 id="anatomy-h" class="h2">What you are looking at in a two-cavity mould</h2>
      <p class="lede lede--sm">An opened Mastercraft mould for a battery lid. Only features that are visible in the photograph are labelled.</p>
    </div>
    <div class="anatomy__layout">
      <figure class="anatomy__fig" data-anatomy>
        <div class="anatomy__stage">
        ${pic('mouldSmall1', { sizes: '(min-width: 960px) 56vw, 92vw', maxW: 1200, alt: 'Opened two-cavity injection mould for a battery lid, showing both mould halves, blue cooling hoses and guide pins' })}
        <svg class="anatomy__svg" viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid meet" aria-hidden="true" focusable="false">
          ${SPOTS.map(s => `<rect class="anatomy__rect" data-rect="${s.id}" x="${s.x[0]}" y="${s.y[0]}" width="${s.x[1] - s.x[0]}" height="${s.y[1] - s.y[0]}" pathLength="1"/>`).join('')}
        </svg>
        ${SPOTS.map((s, i) => `<button type="button" class="hotspot" hidden data-spot="${s.id}" style="left:${(((s.x[0] + s.x[1]) / 2) / W * 100).toFixed(2)}%;top:${(((s.y[0] + s.y[1]) / 2) / H * 100).toFixed(2)}%" aria-pressed="false" aria-controls="${s.id}"><span class="hotspot__n">${i + 1}</span><span class="sr-only">${esc(s.title)}</span></button>`).join('')}
        </div>
        <figcaption class="mono">Fig. A — Two-cavity mould for battery lid, 600 × 500 × 475 mm, 750 kg. <a href="/injection-moulds/2-cavity-lid-battery-mould/">View specification</a></figcaption>
      </figure>
      <ol class="anatomy__list">
        ${SPOTS.map((s, i) => `<li id="${s.id}" data-item="${s.id}"><h3 class="h4"><span class="mono">${String(i + 1).padStart(2, '0')}</span> ${esc(s.title)}</h3><p>${esc(s.text)}</p></li>`).join('')}
      </ol>
    </div>
    <p class="note">Hot runners, valve gates and other internal systems are not visible from outside the mould; where a mould’s hot-runner configuration is documented it appears in that mould’s specification table.</p>
  </div>
</section>`;
}

// ---------- Machine envelopes (to scale, published strokes) ----------
export function envelopeSection() {
  const s = 0.78, x0 = 70, y0 = 610, W = 880, H = 680;
  const letters = ['A', 'B', 'C', 'D'];
  const rects = ENVELOPES.map((e, i) => {
    const w = e.w * s, h = e.h * s;
    const tag = { '3ax': { x: x0 + w - 4, y: y0 - h - 8, a: 'end' }, '5ax': { x: x0 + w + 8, y: y0 - h + 5, a: 'start' }, 'cnc-edm': { x: x0 + w - 4, y: y0 - h - 8, a: 'end' }, 'wire-edm': { x: x0 + w - 8, y: y0 - 10, a: 'end' } }[e.id];
    return `<g class="env env--${e.id}${e.dash ? ' is-dash' : ''}" data-env="${e.id}">
      <rect x="${x0}" y="${y0 - h}" width="${w}" height="${h}" pathLength="1"/>
      <text x="${tag.x}" y="${tag.y}" text-anchor="${tag.a}" class="env__tag"><tspan class="env__l">${letters[i]}</tspan> ${e.w} × ${e.h}</text>
    </g>`;
  }).join('');
  const ticks = Array.from({ length: 10 }, (_, i) => `<path d="M${x0 + i * 100 * s} ${y0 + 6} v${i % 5 === 0 ? 12 : 7}"/>`).join('');
  return `<figure class="envelopes" data-envelopes>
    <svg viewBox="0 0 ${W} ${H}" role="img" aria-labelledby="env-t env-d">
      <title id="env-t">Machining stroke envelopes drawn to scale</title>
      <desc id="env-d">Four nested rectangles from a common corner: 3-axis machining centres 900 by 700 millimetres, 5-axis machining centres 600 by 400, CNC EDM 500 by 400, and wire EDM 500 by 350 millimetres.</desc>
      <g class="env__grid" aria-hidden="true">${Array.from({ length: 10 }, (_, i) => `<path d="M${x0 + i * 100 * s} ${y0 - 700 * s} V${y0}"/>`).join('')}${Array.from({ length: 8 }, (_, i) => `<path d="M${x0} ${y0 - i * 100 * s} H${x0 + 900 * s}"/>`).join('')}</g>
      ${rects}
      <g class="env__ruler" aria-hidden="true"><path d="M${x0} ${y0 + 6} H${x0 + 900 * s}"/>${ticks}<text x="${x0}" y="${y0 + 42}">0</text><text x="${x0 + 500 * s}" y="${y0 + 42}" text-anchor="middle">500 mm</text><text x="${x0 + 900 * s}" y="${y0 + 42}" text-anchor="end">900 mm</text></g>
    </svg>
    <figcaption>
      <ol class="env-legend">${ENVELOPES.map((e, i) => `<li><button type="button" data-env-btn="${e.id}"><span class="env__l">${letters[i]}</span><span>${esc(e.label)}</span><span class="mono">${e.w} × ${e.h} mm</span></button></li>`).join('')}</ol>
      <p class="note">Stroke figures are as published on the facilities page. The 3-axis stroke is published as “900 mm to 700 mm” and is drawn here as 900 × 700 mm. Rectangles share a common corner purely for size comparison and do not show machine position.</p>
    </figcaption>
  </figure>`;
}

// ---------- Range rulers (published capacity ranges) ----------
export function rangeRulers() {
  // clamp: 0–200 t linear; part weight: 0.1–1000 g log scale
  const lin = (v) => (v / 200 * 100).toFixed(2);
  const log = (v) => ((Math.log10(v) - Math.log10(0.1)) / (Math.log10(1000) - Math.log10(0.1)) * 100).toFixed(2);
  return `<div class="rulers">
    <div class="ruler" data-ruler>
      <p class="ruler__h"><span class="mono">Clamping capacity</span><strong><span data-count-to="45">45</span> – <span data-count-to="150">150</span> tons</strong></p>
      <div class="ruler__track" aria-hidden="true"><span class="ruler__bar" style="left:${lin(45)}%;width:${(lin(150) - lin(45)).toFixed(2)}%"></span>${[0, 50, 100, 150, 200].map(v => `<i style="left:${lin(v)}%"><b>${v}</b></i>`).join('')}</div>
    </div>
    <div class="ruler" data-ruler>
      <p class="ruler__h"><span class="mono">Moulded part weight</span><strong><span>0.5</span> – <span data-count-to="300">300</span> g</strong></p>
      <div class="ruler__track" aria-hidden="true"><span class="ruler__bar" style="left:${log(0.5)}%;width:${(log(300) - log(0.5)).toFixed(2)}%"></span>${[0.1, 1, 10, 100, 1000].map(v => `<i style="left:${log(v)}%"><b>${v}</b></i>`).join('')}</div>
      <p class="ruler__note mono">Logarithmic scale, grams</p>
    </div>
  </div>`;
}

// ---------- Large mould weight chart ----------
export function weightChart() {
  const sorted = [...LARGE_MOULDS].sort((a, b) => b.weightT - a.weightT);
  const max = STATS.largeMax;
  return `<div class="wchart" data-wchart>
    <p class="mono wchart__h">Documented mould weight (tonnes) — each bar links to its specification</p>
    <ol class="wchart__rows">${sorted.map((m, i) => `<li style="--w:${(m.weightT / max * 100).toFixed(1)}%;--i:${i}"><a href="/large-size-injection-moulds/${m.slug}/"><span class="wchart__name">${esc(m.name.replace(/^Mould for /, ''))}</span><span class="wchart__bar" aria-hidden="true"></span><span class="wchart__v mono">${m.weightT} t</span></a></li>`).join('')}</ol>
  </div>`;
}

// ---------- Spec table ----------
export function specTable(item, caption) {
  return `<table class="spec"><caption>${esc(caption)}</caption><tbody>${item.specs.map(s => `<tr><th scope="row">${esc(s.label)}</th><td>${esc(s.value)}</td></tr>`).join('')}</tbody></table>`;
}

// ---------- Listing row (alternating editorial layout) ----------
export function productRow(item, base, i) {
  const href = `${base}${item.slug}/`;
  return `<article class="prow${i % 2 ? ' prow--flip' : ''} reveal" id="${item.slug}">
    <span class="prow__bignum" aria-hidden="true">${String(i + 1).padStart(2, '0')}</span>
    <a class="prow__fig plate tilt reveal-mask" href="${href}" tabindex="-1" aria-hidden="true" data-cursor-label="View">${pic(item.img, { sizes: '(min-width: 960px) 46vw, 92vw', maxW: 1200 })}</a>
    <div class="prow__body">
      <p class="mono prow__no">No. ${String(i + 1).padStart(2, '0')}</p>
      <h2 class="h3"><a href="${href}">${esc(item.name)}</a></h2>
      ${specTable(item, `Specification: ${item.name}`)}
      <a class="link-arrow" href="${href}">Specification and enquiry${arrow}<span class="sr-only"> for ${esc(item.name)}</span></a>
    </div>
  </article>`;
}

export function ctaBand({ title = 'Discuss a mould or component requirement', body = 'Tell us what you want made, the material, the size and the quantities you expect. We will come back to you on whether and how we can help.', ref = '' } = {}) {
  return `<section class="cta" aria-labelledby="cta-h">
  <div class="cta__bg" aria-hidden="true">${markUse('cta__mark')}</div>
  <div class="container cta__inner">
    <div>
      <p class="eyebrow eyebrow--ink">Start a project</p>
      <h2 id="cta-h" class="display display--md">${esc(title)}</h2>
      <p class="lede">${esc(body)}</p>
    </div>
    <div class="cta__actions">
      <a class="btn btn--ink btn--lg magnetic" href="/contact/${ref ? `?ref=${encodeURIComponent(ref)}` : ''}"><span>Open the enquiry form</span> ${arrow}</a>
      <ul class="cta__contacts">
        <li><span class="mono">Phone</span> ${SITE.phones.map(p => `<a href="tel:${p.tel}">${p.display}</a>`).join(' · ')}</li>
        <li><span class="mono">Email</span> <a href="mailto:${SITE.email}">${SITE.email}</a></li>
      </ul>
    </div>
  </div>
</section>`;
}
