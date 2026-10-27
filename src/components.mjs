import { SITE, PROCESS, ENVELOPES, SMALL_MOULDS, LARGE_MOULDS, COMPONENTS, TWOK } from './data.mjs';
import { pic, esc, arrow } from './lib.mjs';

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

// ---------- Process: sticky route + steps ----------
export function processSection({ headingLevel = 2 } = {}) {
  const ROW = 56;
  const n = PROCESS.length;
  const ys = PROCESS.map((_, i) => ROW / 2 + i * ROW);
  const H = n * ROW;
  const q = [3, 5, 6]; // machining, moulding, inspection are linked by the inspection track
  const route = `<svg class="route" width="120" height="${H}" viewBox="0 0 120 ${H}" aria-hidden="true" focusable="false">
    <path class="route__base" d="M30 ${ys[0]} V ${ys[n - 1]}"/>
    <path class="route__prog" id="route-prog" pathLength="1" d="M30 ${ys[0]} V ${ys[n - 1]}"/>
    <path class="route__q" d="M84 ${ys[q[0]]} V ${ys[q[2]]}" />
    ${q.map(i => `<path class="route__tick" d="M30 ${ys[i]} H84"/><rect class="route__dia" x="80" y="${ys[i] - 4}" width="8" height="8" transform="rotate(45 84 ${ys[i]})"/>`).join('')}
    ${ys.map((y, i) => `<circle class="route__node" data-node="${i}" cx="30" cy="${y}" r="7"/>`).join('')}
    <text class="route__lbl" transform="translate(106 ${(ys[q[0]] + ys[q[2]]) / 2}) rotate(90)" text-anchor="middle">INSPECTION</text>
  </svg>`;
  return `<section class="section section--dark process" id="process" aria-labelledby="process-h">
  <div class="container process__layout">
    <div class="process__rail" data-process-rail>
      <p class="eyebrow"><span class="idx">02</span> Process</p>
      <h${headingLevel} id="process-h" class="h2">From project planning to inspected parts</h${headingLevel}>
      <p class="lede lede--sm">Seven stages, each documented on the facilities page. Inspection applies to mould inserts and to the plastic components.</p>
      <div class="route-wrap">
        ${route}
        <ol class="route-legend" style="--row:${ROW}px">${PROCESS.map((s, i) => `<li><a href="#stage-${s.id}" data-stage-link="${i}"><span class="n">${s.n}</span><span class="t">${s.title}</span></a></li>`).join('')}</ol>
      </div>
    </div>
    <ol class="steps" data-steps>
      ${PROCESS.map((s, i) => `<li class="step" id="stage-${s.id}" data-step="${i}">
        <figure class="step__fig reveal-mask">${pic(s.img, { sizes: '(min-width: 960px) 52vw, 92vw', maxW: 1200 })}<span class="step__no mono" aria-hidden="true">${s.n}<i>/ ${String(n).padStart(2, '0')}</i></span></figure>
        <div class="step__body">
          <p class="mono step__grp">${esc(s.group)}</p>
          <h3 class="h3">${esc(s.title)}</h3>
          <p>${esc(s.text)}</p>
          <dl class="facts">${s.facts.map(([k, v]) => `<div><dt>${esc(k)}</dt><dd>${esc(v)}</dd></div>`).join('')}</dl>
        </div>
      </li>`).join('')}
    </ol>
  </div>
</section>`;
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
  return `<section class="section section--paper anatomy" id="anatomy" aria-labelledby="anatomy-h">
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
    <a class="prow__fig plate reveal-mask" href="${href}" tabindex="-1" aria-hidden="true">${pic(item.img, { sizes: '(min-width: 960px) 46vw, 92vw', maxW: 1200 })}</a>
    <div class="prow__body">
      <p class="mono prow__no">${String(i + 1).padStart(2, '0')}</p>
      <h2 class="h3"><a href="${href}">${esc(item.name)}</a></h2>
      ${specTable(item, `Specification: ${item.name}`)}
      <a class="link-arrow" href="${href}">Specification and enquiry${arrow}<span class="sr-only"> for ${esc(item.name)}</span></a>
    </div>
  </article>`;
}

export function ctaBand({ title = 'Discuss a mould or component requirement', body = 'Tell us what you want made, the material, the size and the quantities you expect. We will come back to you on whether and how we can help.', ref = '' } = {}) {
  return `<section class="cta" aria-labelledby="cta-h">
  <div class="container cta__inner">
    <div>
      <p class="eyebrow eyebrow--ink">Start a project</p>
      <h2 id="cta-h" class="display display--md">${esc(title)}</h2>
      <p class="lede">${esc(body)}</p>
    </div>
    <div class="cta__actions">
      <a class="btn btn--ink btn--lg" href="/contact/${ref ? `?ref=${encodeURIComponent(ref)}` : ''}">Open the enquiry form ${arrow}</a>
      <ul class="cta__contacts">
        <li><span class="mono">Phone</span> ${SITE.phones.map(p => `<a href="tel:${p.tel}">${p.display}</a>`).join(' · ')}</li>
        <li><span class="mono">Email</span> <a href="mailto:${SITE.email}">${SITE.email}</a></li>
      </ul>
    </div>
  </div>
</section>`;
}
