import { SITE, FAQ, GLOSSARY, PROCESS, LARGE_MOULDS, SMALL_MOULDS, COMPONENTS, TWOK } from './data.mjs';
import { layout, pic, esc, splitWords, splitChars, orgLd, websiteLd, breadcrumbLd, breadcrumbHtml, arrow, imgUrl, MANIFEST, markUse, badge } from './lib.mjs';
import { STATS, processSection, anatomySection, envelopeSection, rangeRulers, ctaBand } from './components.mjs';

const faqLd = () => ({ '@type': 'FAQPage', mainEntity: FAQ.map(f => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })) });

export function faqSection(id = 'faq') {
  return `<section class="section section--white faq" id="${id}" aria-labelledby="${id}-h">
  <div class="container faq__layout">
    <div>
      <p class="eyebrow"><span class="idx">05</span> Questions</p>
      <h2 id="${id}-h" class="h2">Procurement questions, answered from <em>our own records</em></h2>
      <p class="lede lede--sm">Every answer here repeats information published on this site. If your question is not covered, <a href="/contact/">ask us directly</a>.</p>
    </div>
    <div class="faq__list">
      ${FAQ.map((f, i) => `<details class="qa"${i === 0 ? ' open' : ''}><summary><span>${esc(f.q)}</span><svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true" focusable="false"><path d="M7 0v14M0 7h14" stroke="currentColor" stroke-width="1.5" fill="none"/></svg></summary><div class="qa__a"><p>${esc(f.a)}</p></div></details>`).join('')}
    </div>
  </div>
</section>`;
}

// ================= HOME =================
const MARQUEE = ['CAD design', 'CAM programming', '5-axis machining', 'Wire EDM', 'CNC EDM', 'Mould assembly', 'Injection moulding', 'CMM inspection', 'MFI testing', 'SPC monitoring'];
const marqueeRow = (hidden) => `<ul class="marquee__row"${hidden ? ' aria-hidden="true"' : ''}>${MARQUEE.map(t => `<li>${esc(t)}<svg viewBox="0 0 20 20" aria-hidden="true" focusable="false"><use href="#mc-mark"/></svg></li>`).join('')}</ul>`;

export function homePage() {
  const heroPre = [`<link rel="preload" as="image" type="image/avif" imagesrcset="${MANIFEST.machining5.widths.filter(w => w >= 480).map(w => `${imgUrl('machining5', w, 'avif')} ${w}w`).join(', ')}" imagesizes="100vw" fetchpriority="high">`];
  const body = `
<section class="hero" id="top" aria-labelledby="hero-h" data-hero>
  <div class="hero__bg" aria-hidden="false">
    ${pic('machining5', { eager: true, sizes: '100vw', maxW: 1600, alt: 'Milling head cutting a clamped workpiece on a machine table, with blue coolant hoses', cls: 'hero__base' })}
    ${pic('machining5', { sizes: '100vw', maxW: 1600, decorative: true, cls: 'hero__color' })}
  </div>
  <div class="hero__shade" aria-hidden="true"></div>
  <div class="hero__glow" aria-hidden="true"><i></i><i></i></div>
  <div class="hero__scan" aria-hidden="true"></div>
  <div class="container hero__inner">
    <p class="eyebrow hero__eyebrow"><span class="dot"></span> Precision mould makers · Bengaluru · Since ${SITE.founded}</p>
    <h1 id="hero-h" class="hero__h" aria-label="Precision mould engineering, from concept to finished component."><span aria-hidden="true"><span class="hero__k">${splitChars('Precision')}</span><span class="hero__s"><em>mould engineering,</em></span><span class="hero__t">from concept to finished component.</span></span></h1>
    <p class="lede hero__lede">Mastercraft Engineers designs and builds precision injection moulds, small and large, and moulds plastic components at its facility in the Bommasandra Industrial Area, Bengaluru.</p>
    <div class="hero__cta">
      <a class="btn btn--primary btn--lg magnetic" href="/contact/"><span>Discuss your project</span> ${arrow}</a>
      <a class="btn btn--ghost btn--lg magnetic" href="#process"><span>See how we work</span></a>
    </div>
  </div>
  <div class="hero__chips" aria-hidden="true">
    <span class="chip chip--a" data-depth="0.5"><b>45–150 t</b> clamping</span>
    <span class="chip chip--b" data-depth="0.9"><b>0.5–300 g</b> parts</span>
    <span class="chip chip--c" data-depth="0.7"><b>${STATS.largeMin}–${STATS.largeMax} t</b> moulds</span>
  </div>
  ${badge('Precision injection moulds · Bengaluru · Since 1992 · ', 'hero__badge')}
  <a class="scroll-cue" href="#company" aria-label="Scroll to company introduction"><span></span></a>
  <ul class="container hero__facts" aria-label="Company facts">
    <li><strong>${SITE.founded}</strong><span>Mould making and moulding since</span></li>
    <li><strong>Bengaluru</strong><span>Bommasandra Industrial Area</span></li>
    <li><strong>45 – 150 t</strong><span>Injection moulding clamping capacity</span></li>
    <li><strong>${STATS.largeMin} – ${STATS.largeMax} t</strong><span>Weights of documented large moulds</span></li>
  </ul>
</section>

<section class="marquee" aria-label="Capabilities">
  <div class="marquee__track" data-marquee>${marqueeRow(false)}${marqueeRow(true)}</div>
</section>

<section class="section section--white intro" id="company" aria-labelledby="company-h">
  <div class="intro__ghost" aria-hidden="true"><span data-fill>${SITE.founded}</span></div>
  <div class="container">
    <p class="eyebrow"><span class="idx">01</span> Company</p>
    <h2 id="company-h" class="display display--md intro__h">Specialised in <em>precision</em> mould making and moulding since ${SITE.founded}.</h2>
    <div class="intro__grid">
      <div class="intro__text">
        <p class="lede">Mastercraft is based in Bangalore, South India. A modern design and manufacturing facility, a highly specialised technical team and advanced communication systems provide the conditions for efficient and reliable development of customer projects, from concept to finish.</p>
        <p>Satisfying customers in every way remains the primary goal: building moulds and moulding components that rank high in quality at competitive costs. The company aims to be the moulder of your creation.</p>
        <blockquote class="vision"><p class="mono">Our vision</p><p>We will be the leader, setting standards in every domain that our business will be in, by delivering on time products and services of high quality, by leveraging technology, with the best-in-class people, eventually adding value to our customers’ businesses.</p></blockquote>
        <a class="link-arrow" href="/about/">About Mastercraft${arrow}</a>
      </div>
      <figure class="intro__fig">
        <div class="intro__img reveal-mask" data-parallax-y="-40">${pic('campus', { sizes: '(min-width: 960px) 52vw, 92vw', maxW: 1600 })}</div>
        ${markUse('intro__mark')}
        <figcaption class="mono">The Mastercraft Engineers facility, Bommasandra Industrial Area, Bengaluru (aerial view)</figcaption>
      </figure>
    </div>

    <div class="chain" aria-labelledby="chain-h">
      <h3 id="chain-h" class="mono chain__h">Design, tooling and product — one line of work</h3>
      <ol class="chain__list">
        <li class="reveal"><figure class="plate plate--dark tilt">${pic('camToolpath', { sizes: '(min-width: 960px) 30vw, 92vw', maxW: 1200, alt: 'CAM simulation showing machining toolpaths over a mould block' })}</figure><p class="mono">01 · Design and toolpaths</p><p>CAD designs and CAM toolpaths define how the mould is cut.</p></li>
        <li class="chain__arrow" aria-hidden="true"><svg viewBox="0 0 60 20" width="60" height="20"><path d="M0 10h54M46 3l8 7-8 7" fill="none" stroke="currentColor" stroke-width="2"/></svg></li>
        <li class="reveal"><figure class="plate tilt">${pic('mouldSmall2', { sizes: '(min-width: 960px) 30vw, 92vw', maxW: 1200, alt: 'Opened injection mould for a base plate with a four-drop hot runner' })}</figure><p class="mono">02 · The mould</p><p>Machined, assembled and mounted on an injection moulding machine.</p></li>
        <li class="chain__arrow" aria-hidden="true"><svg viewBox="0 0 60 20" width="60" height="20"><path d="M0 10h54M46 3l8 7-8 7" fill="none" stroke="currentColor" stroke-width="2"/></svg></li>
        <li class="reveal"><figure class="plate tilt">${pic('componentsHero', { sizes: '(min-width: 960px) 30vw, 92vw', maxW: 1200 })}</figure><p class="mono">03 · The component</p><p>Plastic parts moulded in production and inspected.</p></li>
      </ol>
    </div>
  </div>
</section>

<section class="stats" aria-label="Capacity and range, as documented">
  <div class="container stats__grid">
    <div class="stat"><p class="stat__n"><span data-count-to="45">45</span><i>–</i><span data-count-to="150">150</span><small>t</small></p><p class="stat__l">Injection moulding clamping capacity</p></div>
    <div class="stat"><p class="stat__n"><span data-count-to="0.5" data-dec="1">0.5</span><i>–</i><span data-count-to="300">300</span><small>g</small></p><p class="stat__l">Moulded part weight range</p></div>
    <div class="stat"><p class="stat__n"><span data-count-to="${STATS.largeCount}">${STATS.largeCount}</span></p><p class="stat__l">Large injection moulds documented</p></div>
    <div class="stat"><p class="stat__n"><span data-count-to="${STATS.largeMin}" data-dec="1">${STATS.largeMin}</span><i>–</i><span data-count-to="${STATS.largeMax}" data-dec="1">${STATS.largeMax}</span><small>t</small></p><p class="stat__l">Documented large mould weights</p></div>
  </div>
</section>

${processSection()}

<section class="section section--white products" id="products" aria-labelledby="products-h">
  <div class="container products__head">
    <div>
      <p class="eyebrow"><span class="idx">03</span> Products</p>
      <h2 id="products-h" class="display display--md">Moulds and moulded parts, <em>documented</em> to the millimetre and the gram.</h2>
    </div>
    <div class="rail__ctrl" aria-label="Scroll products">
      <button type="button" class="rail__btn" data-rail-prev aria-label="Previous products"><svg width="18" height="12" viewBox="0 0 18 12" aria-hidden="true"><path d="M18 6H2M7 1L2 6l5 5" fill="none" stroke="currentColor" stroke-width="1.8"/></svg></button>
      <button type="button" class="rail__btn" data-rail-next aria-label="Next products"><svg width="18" height="12" viewBox="0 0 18 12" aria-hidden="true"><path d="M0 6h16M11 1l5 5-5 5" fill="none" stroke="currentColor" stroke-width="1.8"/></svg></button>
    </div>
  </div>
  <div class="rail" data-rail role="region" aria-label="Product categories (scrollable)" tabindex="0">
    <a class="pcard tilt" href="/large-size-injection-moulds/" data-cursor-label="View">
      <div class="plate">${pic('frDoorTrim', { sizes: '(min-width: 960px) 40vw, 82vw', maxW: 1200 })}</div>
      <div class="pcard__body"><span class="pcard__n" aria-hidden="true">01</span><p class="mono">Large injection moulds</p><h3 class="h3">Moulds from ${STATS.largeMin} to ${STATS.largeMax} tonnes</h3><p>${STATS.largeCount} documented moulds for door trims, pillars, a cowl, a side sill and wheel arches, with hot-runner configurations of up to six drops.</p><span class="link-arrow">View the large moulds${arrow}</span></div>
    </a>
    <a class="pcard tilt" href="/injection-moulds/" data-cursor-label="View">
      <div class="plate">${pic('mouldSmall1', { sizes: '(min-width: 960px) 40vw, 82vw', maxW: 1200 })}</div>
      <div class="pcard__body"><span class="pcard__n" aria-hidden="true">02</span><p class="mono">Small precision injection moulds</p><h3 class="h3">From two cavities to ${STATS.maxCavities}</h3><p>${STATS.smallCount} documented moulds with size, cavity count and material.</p><span class="link-arrow">View the small moulds${arrow}</span></div>
    </a>
    <a class="pcard tilt" href="/components/" data-cursor-label="View">
      <div class="plate">${pic('componentsHero', { sizes: '(min-width: 960px) 40vw, 82vw', maxW: 1200 })}</div>
      <div class="pcard__body"><span class="pcard__n" aria-hidden="true">03</span><p class="mono">Plastic injection-moulded components</p><h3 class="h3">${STATS.partCount} parts, ${STATS.partMin} – ${STATS.partMax} g</h3><p>Part weights and raw materials, including POM, PC, PP and glass-filled polyamides.</p><span class="link-arrow">View the components${arrow}</span></div>
    </a>
    <a class="pcard tilt" href="/2k-parts/" data-cursor-label="View">
      <div class="plate">${pic('hvacFlap', { sizes: '(min-width: 960px) 40vw, 82vw', maxW: 1200 })}</div>
      <div class="pcard__body"><span class="pcard__n" aria-hidden="true">04</span><p class="mono">Two-component (2K) parts</p><h3 class="h3">Two materials in one part</h3><p>${STATS.twokCount} documented parts, such as PPGF40 + TPE and PCABS + TPE combinations.</p><span class="link-arrow">View the 2K parts${arrow}</span></div>
    </a>
  </div>
  <div class="container"><div class="rail__bar" aria-hidden="true"><i data-rail-bar></i></div></div>
</section>

<section class="section section--black qteaser" id="quality" aria-labelledby="quality-h">
  <div class="kinetic" aria-hidden="true">
    <div class="kinetic__row" data-kinetic="-1"><span>Moulding the future…</span><span>Moulding the future…</span></div>
    <div class="kinetic__row kinetic__row--o" data-kinetic="1"><span>your way</span><span>your way</span><span>your way</span></div>
  </div>
  <div class="container qteaser__grid">
    <div class="qteaser__text">
      <p class="eyebrow"><span class="idx">04</span> Quality</p>
      <h2 id="quality-h" class="display display--md">Inspected against <em>design intent.</em></h2>
      <p class="lede">Mould inserts and plastic components are inspected to ensure they meet the design intent and customer expectations.</p>
      <ul class="methods">
        <li><span class="methods__n" aria-hidden="true">01</span><div><strong>CMM touch probe, video and laser measurement</strong><span>Dimensional inspection of mould inserts and components.</span></div></li>
        <li><span class="methods__n" aria-hidden="true">02</span><div><strong>MFI testing machine</strong><span>Melt flow index testing of plastic material.</span></div></li>
        <li><span class="methods__n" aria-hidden="true">03</span><div><strong>Statistical Process Control</strong><span>Injection moulding is monitored with SPC techniques on an hourly basis.</span></div></li>
      </ul>
      <a class="link-arrow link-arrow--light" href="/quality/">Quality and testing${arrow}</a>
    </div>
    <div class="qteaser__fig">
      <figure class="reveal-mask scan q1 tilt">${pic('qualityCmm', { sizes: '(min-width: 960px) 28vw, 60vw', maxW: 1200 })}<figcaption class="mono">CMM touch probe</figcaption></figure>
      <figure class="reveal-mask scan q2 tilt">${pic('qualityMfi', { sizes: '(min-width: 960px) 22vw, 50vw', maxW: 800 })}<figcaption class="mono">MFI testing machine</figcaption></figure>
    </div>
  </div>
</section>

${faqSection()}
${ctaBand()}`;
  return layout({
    path: '/', home: true,
    title: 'Precision Injection Mould Maker in Bengaluru | Mastercraft Engineers',
    description: 'Mastercraft Engineers designs and builds precision injection moulds, small and large, and moulds plastic components in Bengaluru, India. Operating since 1992.',
    body, preload: heroPre, pageClass: 'page-home',
    ld: [orgLd(), websiteLd(), { '@type': 'WebPage', '@id': SITE.url + '/#webpage', url: SITE.url + '/', name: 'Mastercraft Engineers: precision injection mould maker in Bengaluru', isPartOf: { '@id': `${SITE.url}/#website` }, about: { '@id': `${SITE.url}/#organization` } }, faqLd()]
  });
}

// ================= ABOUT =================
export function aboutPage() {
  const trail = [{ name: 'Home', href: '/' }, { name: 'About', href: '/about/' }];
  const a = SITE.address;
  const body = `
<section class="page-hero page-hero--dark">
  <div class="page-hero__fx" aria-hidden="true"><i></i>${markUse('ph-mark')}</div>
  <div class="container">
    ${breadcrumbHtml(trail)}
    <p class="eyebrow">About Mastercraft</p>
    <h1 class="display">${splitWords('A precision mould making and moulding company, since 1992.')}</h1>
    <p class="lede">Mastercraft Engineers Pvt. Ltd. is based in Bangalore, South India, and takes customer projects from concept to finish: mould design, machining, assembly, injection moulding and inspection.</p>
  </div>
</section>
<section class="section section--white">
  <div class="container about__grid">
    <div class="prose">
      <h2 class="h2">How the company describes its work</h2>
      <p>Mastercraft is a specialised precision mould making and moulding company, operating since 1992 in Bangalore. A modern design and manufacturing facility, a highly specialised technical team and advanced communication systems provide the conditions for an efficient and reliable development of customer projects, from concept to finish, meeting high standards of productivity and delivery.</p>
      <p>Satisfying customers in every way remains the primary goal. The company continues to work on improving its skills in building moulds and moulding components that rank high in quality at competitive costs.</p>
      <h2 class="h3">Our vision</h2>
      <blockquote class="vision vision--plain"><p>We will be the leader, setting standards in every domain that our business will be in, by delivering on time products and services of high quality, by leveraging technology, with the best-in-class people, eventually adding value to our customers’ businesses.</p></blockquote>
      <h2 class="h3">What this means in practice</h2>
      <p>The workflow covers <a href="/facilities/#design">design and engineering</a>, <a href="/facilities/#machining">precision machining and EDM</a>, <a href="/facilities/#assembly">mould assembly</a>, <a href="/facilities/#moulding">injection moulding</a> and <a href="/quality/">quality inspection</a>. The resulting <a href="/injection-moulds/">small precision moulds</a>, <a href="/large-size-injection-moulds/">large injection moulds</a>, <a href="/components/">plastic components</a> and <a href="/2k-parts/">2K parts</a> are documented with their sizes, weights and materials.</p>
    </div>
    <aside class="factsheet" aria-labelledby="fs-h">
      <h2 id="fs-h" class="mono">Company at a glance</h2>
      <dl>
        <div><dt>Company</dt><dd>${esc(SITE.legalName)}</dd></div>
        <div><dt>Operating since</dt><dd>${SITE.founded}</dd></div>
        <div><dt>Location</dt><dd>${a.lines.slice(0, 3).map(esc).join(', ')}, India</dd></div>
        <div><dt>Business</dt><dd>Precision injection mould design and manufacturing; plastic injection moulding</dd></div>
        <div><dt>Products</dt><dd>Small and large injection moulds, moulded components, 2K parts</dd></div>
        <div><dt>Telephone</dt><dd>${SITE.phones.map(p => `<a href="tel:${p.tel}">${p.display}</a>`).join('<br>')}</dd></div>
        <div><dt>Email</dt><dd><a href="mailto:${SITE.email}">${SITE.email}</a></dd></div>
      </dl>
    </aside>
  </div>
</section>
<section class="section section--black" id="video" aria-labelledby="video-h">
  <div class="container video__grid">
    <div>
      <p class="eyebrow">Corporate video</p>
      <h2 id="video-h" class="h2">See the facility</h2>
      <p class="lede lede--sm">The company’s corporate video is hosted on its YouTube channel. It loads only when you press play, so it does not slow down this page.</p>
      <p class="note">No transcript is published for this video. Everything it shows is also described on the <a href="/facilities/">facilities page</a>.</p>
      <a class="link-arrow link-arrow--light" href="${SITE.youtube}" rel="noopener" target="_blank">Mastercraft Engineers on YouTube${arrow}<span class="sr-only"> (opens in a new tab)</span></a>
    </div>
    <div class="video" data-video="${SITE.videoId}">
      <button type="button" class="video__play" aria-label="Play corporate video: Mastercraft Engineers">
        ${pic('videoThumb', { sizes: '(min-width: 960px) 56vw, 92vw', maxW: 1200, alt: '' , decorative: true})}
        <span class="video__icon" aria-hidden="true"><svg width="28" height="32" viewBox="0 0 28 32"><path d="M2 2l24 14L2 30z" fill="currentColor"/></svg></span>
      </button>
      <noscript><p><a href="https://www.youtube.com/watch?v=${SITE.videoId}" rel="noopener">Watch the corporate video on YouTube</a></p></noscript>
    </div>
  </div>
</section>
<section class="section section--white">
  <div class="container">
    <figure class="wide-fig reveal-mask">${pic('campus', { sizes: '100vw', maxW: 2200 })}<figcaption class="mono">Aerial view of the facility, Bommasandra Industrial Area, Bengaluru</figcaption></figure>
  </div>
</section>
${ctaBand()}`;
  return layout({
    path: '/about/', title: 'About Mastercraft Engineers, Mould Makers in Bengaluru since 1992',
    description: 'Mastercraft Engineers is a precision mould making and moulding company in Bengaluru, operating since 1992. Company profile, vision, facility and contact details.',
    body, ld: [orgLd(), { '@type': 'AboutPage', url: SITE.url + '/about/', name: 'About Mastercraft Engineers', about: { '@id': `${SITE.url}/#organization` } }, breadcrumbLd(trail)], pageClass: 'page-inner'
  });
}

// ================= FACILITIES =================
export function facilitiesPage() {
  const trail = [{ name: 'Home', href: '/' }, { name: 'Facilities', href: '/facilities/' }];
  const gal = [['machining2', 'Machining centre spindle and rotary fixture'], ['machining3', 'CNC machine carriage and control panel'], ['machining4', 'Mould plate clamped in a machine bed'], ['machining5', 'Milling a clamped workpiece'], ['machining6', 'Tool measurement']];
  const body = `
<section class="page-hero page-hero--dark">
  <div class="page-hero__fx" aria-hidden="true"><i></i>${markUse('ph-mark')}</div>
  <div class="container">
    ${breadcrumbHtml(trail)}
    <p class="eyebrow">Facilities and capabilities</p>
    <h1 class="display">${splitWords('The equipment and workflow behind every mould and component.')}</h1>
    <p class="lede">The documented equipment and workflow behind Mastercraft’s moulds and moulded components, grouped by stage.</p>
    <ul class="jump" aria-label="On this page"><li><a href="#design">Design and engineering</a></li><li><a href="#machining">Machining, CNC and EDM</a></li><li><a href="#assembly">Mould assembly</a></li><li><a href="#moulding">Injection moulding</a></li><li><a href="#inspection">Quality and testing</a></li></ul>
  </div>
</section>

<section class="section section--white fac" id="design" aria-labelledby="design-h">
  <div class="container fac__grid">
    <div class="fac__text">
      <p class="eyebrow"><span class="idx">01</span> Design and engineering</p>
      <h2 id="design-h" class="h2">Planning, CAD and CAM</h2>
      <p>Meticulous planning of each project supports execution and adherence to delivery commitments. Advanced CAD software, used by a strong team of designers, results in efficient mould designs. CAM software then generates the NC codes that output cutter paths for precise machining.</p>
      <dl class="facts facts--light"><div><dt>Project management</dt><dd>Planning and delivery commitments</dd></div><div><dt>CAD</dt><dd>Mould design by in-house designers</dd></div><div><dt>CAM</dt><dd>NC codes and cutter paths</dd></div></dl>
    </div>
    <div class="fac__figs">
      <figure class="reveal-mask">${pic('projectMgmt', { sizes: '(min-width: 960px) 46vw, 92vw', maxW: 1200 })}<figcaption class="mono">Project review of a 3D mould design</figcaption></figure>
      <figure class="reveal-mask">${pic('cadOffice', { sizes: '(min-width: 960px) 46vw, 92vw', maxW: 1200 })}<figcaption class="mono">CAD/CAM design office</figcaption></figure>
      <figure class="reveal-mask">${pic('camToolpath', { sizes: '(min-width: 960px) 46vw, 92vw', maxW: 1200 })}<figcaption class="mono">CAM toolpath simulation</figcaption></figure>
    </div>
  </div>
</section>

<section class="section section--black fac fac--machining" id="machining" aria-labelledby="machining-h">
  <div class="container">
    <div class="fac__head">
      <p class="eyebrow"><span class="idx">02</span> Machining, CNC and EDM</p>
      <h2 id="machining-h" class="display display--md">A battery of precision machines.</h2>
      <p class="lede">Contemporary precision machines translate cutter paths to complex shapes, holding very close tolerances and good surface quality.</p>
    </div>
    <div class="env-layout">
      ${envelopeSection()}
      <div>
        <table class="spec spec--dark"><caption>Machining equipment and published stroke</caption>
          <thead><tr><th scope="col">Equipment</th><th scope="col">Stroke</th></tr></thead>
          <tbody>
            <tr><th scope="row">Machining centres, 5-axis</th><td>600 mm × 400 mm</td></tr>
            <tr><th scope="row">Machining centres, 3-axis</th><td>900 mm to 700 mm</td></tr>
            <tr><th scope="row">Ultra-precision wire EDM</th><td>500 mm × 350 mm</td></tr>
            <tr><th scope="row">CNC EDM</th><td>500 mm × 400 mm</td></tr>
            <tr><th scope="row">Tool presetter and tool measurement</th><td>—</td></tr>
          </tbody></table>
      </div>
    </div>
    <ul class="gallery" aria-label="Machining photographs">
      ${gal.map(([k, c], i) => `<li class="reveal reveal-mask">${pic(k, { sizes: '(min-width: 960px) 30vw, 92vw', maxW: 1200, alt: c })}<span class="mono" aria-hidden="true">${c}</span></li>`).join('')}
    </ul>
  </div>
</section>

<section class="section section--white fac" id="assembly" aria-labelledby="assembly-h">
  <div class="container fac__grid fac__grid--rev">
    <div class="fac__text">
      <p class="eyebrow"><span class="idx">03</span> Mould assembly</p>
      <h2 id="assembly-h" class="h2">Assembled by skilled craftsmen</h2>
      <p>Mould elements are assembled by skilled craftsmen. The assembly bay is served by an overhead EOT crane.</p>
      <dl class="facts facts--light"><div><dt>EOT crane</dt><dd>5 / 3 tons</dd></div></dl>
    </div>
    <figure class="reveal-mask fac__one">${pic('crane', { sizes: '(min-width: 960px) 50vw, 92vw', maxW: 1600 })}<figcaption class="mono">Mould assembly bay</figcaption></figure>
  </div>
</section>

<section class="section section--black fac" id="moulding" aria-labelledby="moulding-h">
  <div class="container">
    <div class="fac__head">
      <p class="eyebrow"><span class="idx">04</span> Injection moulding</p>
      <h2 id="moulding-h" class="display display--md">High-precision moulding, monitored hourly.</h2>
      <p class="lede">High-precision injection moulding machines produce high-precision parts. The production process is closely monitored with Statistical Process Control (SPC) techniques on an hourly basis.</p>
    </div>
    ${rangeRulers()}
    <figure class="wide-fig reveal-mask">${pic('moulding', { sizes: '100vw', maxW: 1600 })}<figcaption class="mono">Injection moulding hall</figcaption></figure>
  </div>
</section>

<section class="section section--white fac" id="inspection" aria-labelledby="inspection-h">
  <div class="container fac__grid">
    <div class="fac__text">
      <p class="eyebrow"><span class="idx">05</span> Quality and testing</p>
      <h2 id="inspection-h" class="h2">Inspection equipment</h2>
      <p>Mould inserts and plastic components are inspected to ensure they meet the design intent and customer expectations.</p>
      <dl class="facts facts--light"><div><dt>Dimensional</dt><dd>CMM touch probe, video and laser measurement</dd></div><div><dt>Material</dt><dd>MFI testing machine</dd></div><div><dt>Process</dt><dd>SPC, hourly</dd></div></dl>
      <a class="link-arrow" href="/quality/">Quality and testing in detail${arrow}</a>
    </div>
    <div class="fac__figs fac__figs--two">
      <figure class="reveal-mask">${pic('qualityCmm', { sizes: '(min-width: 960px) 30vw, 92vw', maxW: 1200 })}<figcaption class="mono">CMM touch probe</figcaption></figure>
      <figure class="reveal-mask">${pic('qualityMfi', { sizes: '(min-width: 960px) 30vw, 92vw', maxW: 1200 })}<figcaption class="mono">MFI testing machine</figcaption></figure>
    </div>
  </div>
</section>
${ctaBand({ title: 'Bring us a mould or component requirement', ref: 'facilities' })}`;
  return layout({
    path: '/facilities/', title: 'Facilities: CNC, EDM, Assembly & Injection Moulding | Mastercraft',
    description: 'Facilities at Mastercraft Engineers, Bengaluru: CAD/CAM, 5-axis and 3-axis machining, wire and CNC EDM, mould assembly, 45–150 t injection moulding.',
    body, ld: [orgLd(), { '@type': 'WebPage', url: SITE.url + '/facilities/', name: 'Facilities and capabilities', about: { '@id': `${SITE.url}/#organization` } }, breadcrumbLd(trail)], pageClass: 'page-inner'
  });
}

// ================= QUALITY =================
export function qualityPage() {
  const trail = [{ name: 'Home', href: '/' }, { name: 'Quality and testing', href: '/quality/' }];
  const body = `
<section class="page-hero page-hero--dark">
  <div class="page-hero__fx" aria-hidden="true"><i></i>${markUse('ph-mark')}</div>
  <div class="container">
    ${breadcrumbHtml(trail)}
    <p class="eyebrow">Quality and testing</p>
    <h1 class="display">${splitWords('Inspection equipment and process control, in plain terms.')}</h1>
    <p class="lede">Mould inserts and plastic components are inspected to ensure they meet the design intent and customer expectations. This page describes the equipment and methods documented by the company.</p>
  </div>
</section>

<section class="section section--white qrows">
  <div class="container">
    <article class="qrow reveal">
      <figure class="reveal-mask">${pic('qualityCmm', { sizes: '(min-width: 960px) 50vw, 92vw', maxW: 1600 })}<figcaption class="mono">CMM with touch probe</figcaption></figure>
      <div class="qrow__body">
        <p class="eyebrow"><span class="idx">01</span> Dimensional inspection</p>
        <h2 class="h2">CMM touch probe, video and laser measurement</h2>
        <p>Mastercraft inspects mould inserts and plastic components with CMM touch-probe, video and laser measurement. A coordinate measuring machine records a part’s geometry and compares it with the design, so deviations from the design intent can be found.</p>
        <p class="mono qrow__where">Applies to: mould inserts, plastic components</p>
      </div>
    </article>
    <article class="qrow qrow--flip reveal">
      <figure class="reveal-mask">${pic('qualityMfi', { sizes: '(min-width: 960px) 40vw, 92vw', maxW: 1200 })}<figcaption class="mono">MFI testing machine</figcaption></figure>
      <div class="qrow__body">
        <p class="eyebrow"><span class="idx">02</span> Material testing</p>
        <h2 class="h2">MFI testing machine</h2>
        <p>The facility operates a melt flow index (MFI) testing machine. MFI testing measures how readily a thermoplastic melt flows under a set temperature and load, which is a standard way to check the flow behaviour of plastic material.</p>
        <p class="mono qrow__where">Applies to: plastic material</p>
      </div>
    </article>
    <article class="qrow reveal">
      <figure class="reveal-mask">${pic('moulding', { sizes: '(min-width: 960px) 50vw, 92vw', maxW: 1600 })}<figcaption class="mono">Injection moulding hall</figcaption></figure>
      <div class="qrow__body">
        <p class="eyebrow"><span class="idx">03</span> Process control</p>
        <h2 class="h2">Statistical Process Control, hourly</h2>
        <p>Production on the injection moulding machines is closely monitored with Statistical Process Control (SPC) techniques on an hourly basis. SPC uses statistical methods to detect process variation early.</p>
        <p class="mono qrow__where">Applies to: injection moulding production</p>
      </div>
    </article>
  </div>
</section>

<section class="section section--black" aria-labelledby="qsum-h">
  <div class="container">
    <h2 id="qsum-h" class="h2">Summary of documented methods</h2>
    <table class="spec spec--dark spec--wide"><caption>Quality methods documented by Mastercraft Engineers</caption>
      <thead><tr><th scope="col">Method</th><th scope="col">Used for</th><th scope="col">Where in the workflow</th></tr></thead>
      <tbody>
        <tr><th scope="row">CMM touch probe, video and laser measurement</th><td>Dimensional inspection</td><td>Mould inserts and plastic components</td></tr>
        <tr><th scope="row">MFI testing machine</th><td>Melt flow index testing</td><td>Plastic material</td></tr>
        <tr><th scope="row">Statistical Process Control (SPC)</th><td>Process monitoring, hourly</td><td>Injection moulding production</td></tr>
      </tbody></table>
    <p class="note">This site does not list quality certifications or guaranteed performance levels. If you need documentation for a particular requirement, <a href="/contact/">ask the team</a>.</p>
  </div>
</section>

<section class="section section--white" aria-labelledby="gloss-h">
  <div class="container gloss">
    <h2 id="gloss-h" class="h2">Terms used on this site</h2>
    <dl class="gloss__list">${GLOSSARY.map(([t, d]) => `<div><dt>${esc(t)}</dt><dd>${esc(d)}</dd></div>`).join('')}</dl>
  </div>
</section>
${ctaBand({ title: 'Have an inspection or quality requirement?', body: 'Tell us what needs to be measured or controlled on your mould or component.', ref: 'quality' })}`;
  return layout({
    path: '/quality/', title: 'Quality & Testing: CMM, MFI and SPC | Mastercraft Engineers',
    description: 'How Mastercraft Engineers inspects mould inserts and plastic components: CMM touch-probe, video and laser measurement, MFI testing and hourly SPC.',
    body, ld: [orgLd(), { '@type': 'WebPage', url: SITE.url + '/quality/', name: 'Quality and testing', about: { '@id': `${SITE.url}/#organization` } }, breadcrumbLd(trail)], pageClass: 'page-inner'
  });
}
