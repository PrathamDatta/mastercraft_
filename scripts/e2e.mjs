// Browser tests (Playwright): console errors, overflow, accessibility (axe), keyboard, form, reduced motion, no-JS.
import { chromium } from '/opt/node-tools/node_modules/playwright/index.mjs';
import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
import os from 'node:os';
import { fileURLToPath } from 'node:url';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const BASE = process.env.BASE || 'http://127.0.0.1:8099';
const axeSrc = fs.readFileSync(path.join(root, 'node_modules/axe-core/axe.min.js'), 'utf8');
let server;
if (!process.env.BASE) {
  server = spawn('node', ['scripts/dev-server.mjs'], { cwd: root, env: { ...process.env, PORT: '8099', MC_MAIL_DRY_RUN: '1' }, stdio: 'ignore' });
  await new Promise(r => setTimeout(r, 1200));
}
const MAILLOG = path.join(os.tmpdir(), 'mastercraft-mail.log');
const results = []; const bad = [];
const ok = (name, cond, extra = '') => { results.push([cond, name]); if (!cond) bad.push(`${name} ${extra}`); };
const sitemap = fs.readFileSync(path.join(root, 'dist/sitemap.xml'), 'utf8');
const pages = [...sitemap.matchAll(/<loc>(https:\/\/mastercraftengineers\.com[^<]*)<\/loc>/g)].map(m => m[1].replace('https://mastercraftengineers.com', '')).filter(u => !/\.(jpg|png)$/.test(u));
pages.push('/contact/thank-you/', '/does-not-exist/');
const browser = await chromium.launch();
// tests drive the page programmatically, so neutralise smooth scrolling (a real-user nicety) to avoid stale click coordinates
const _nc = browser.newContext.bind(browser);
browser.newContext = async (o) => { const c = await _nc(o); await c.addInitScript(() => document.addEventListener('DOMContentLoaded', () => { document.documentElement.style.scrollBehavior = 'auto'; })); return c; };
const sample = ['/', '/about/', '/facilities/', '/quality/', '/injection-moulds/', '/large-size-injection-moulds/', '/components/', '/2k-parts/', '/contact/', '/large-size-injection-moulds/side-sill-mould/', '/components/centre-tube-with-caps/'];

// 1) every page: loads, no console errors, no horizontal overflow at 3 widths
for (const w of [375, 820, 1440]) {
  const ctx = await browser.newContext({ viewport: { width: w, height: 900 } });
  for (const u of pages) {
    const p = await ctx.newPage(); const errs = [];
    p.on('console', m => { if (m.type() === 'error' || m.type() === 'warning') errs.push(m.text()); }); p.on('pageerror', e => errs.push(e.message));
    const r = await p.goto(BASE + u, { waitUntil: 'load' });
    const expect404 = u === '/does-not-exist/';
    // a 404 document legitimately logs one failed resource
    const realErrs = expect404 ? errs.filter(e => !/404/.test(e)) : errs;
    ok(`[${w}] ${u} status`, expect404 ? r.status() === 404 : r.status() === 200, r.status());
    ok(`[${w}] ${u} no console errors`, realErrs.length === 0, realErrs.join(' | '));
    const over = await p.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    ok(`[${w}] ${u} no horizontal overflow`, over <= 0, `overflow ${over}px`);
    const broken = await p.evaluate(async () => { await Promise.all([...document.images].filter(i => i.loading === 'lazy').map(i => { i.loading = 'eager'; return i.decode().catch(() => {}); })); return [...document.images].filter(i => !i.naturalWidth).map(i => i.src); });
    ok(`[${w}] ${u} no broken images`, broken.length === 0, broken.join(','));
    await p.close();
  }
  await ctx.close();
}

// 2) accessibility (axe, WCAG 2.0/2.1/2.2 A+AA) on representative pages, desktop and mobile
for (const w of [1440, 390]) {
  const ctx = await browser.newContext({ viewport: { width: w, height: 900 }, bypassCSP: true });
  for (const u of sample) {
    const p = await ctx.newPage(); await p.goto(BASE + u); await p.waitForTimeout(300);
    await p.evaluate(async () => { for (let y = 0; y < document.body.scrollHeight; y += 700) { window.scrollTo(0, y); await new Promise(r => setTimeout(r, 60)); } window.scrollTo(0, 0); });
    await p.waitForTimeout(1800); // let entrance animations finish so colour contrast is measured on final state
    await p.addScriptTag({ content: axeSrc });
    const res = await p.evaluate(() => axe.run(document, { runOnly: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa', 'best-practice'] }));
    const v = res.violations.map(x => `${x.id}(${x.nodes.length}): ${x.nodes.slice(0, 2).map(n => n.target.join(' ')).join(' ; ')}`);
    ok(`[axe ${w}] ${u}`, v.length === 0, '\n      ' + v.join('\n      '));
    await p.close();
  }
  await ctx.close();
}

// 3) behaviours
{
  const ctx = await browser.newContext({ viewport: { width: 390, height: 800 } }); const p = await ctx.newPage(); await p.goto(BASE + '/');
  const t = p.locator('.menu-toggle'); await t.click();
  ok('mobile menu opens', (await t.getAttribute('aria-expanded')) === 'true' && await p.locator('#primary-nav').isVisible());
  ok('mobile menu focuses first link', await p.evaluate(() => document.activeElement.closest('#primary-nav') !== null));
  await p.keyboard.press('Escape'); ok('Escape closes mobile menu and returns focus', (await t.getAttribute('aria-expanded')) === 'false' && await p.evaluate(() => document.activeElement.classList.contains('menu-toggle')));
  await t.click(); await p.locator('#primary-nav a', { hasText: 'Quality' }).first().click(); await p.waitForURL('**/quality/');
  ok('mobile nav navigates', p.url().endsWith('/quality/'));
  ok('quality marked current', await p.locator('#primary-nav a[aria-current="page"]').count() >= 1);
  await ctx.close();
}
{
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } }); const p = await ctx.newPage(); await p.goto(BASE + '/');
  await p.locator('.sub-toggle').focus(); await p.keyboard.press('Enter');
  ok('desktop dropdown opens with keyboard', (await p.locator('.sub-toggle').getAttribute('aria-expanded')) === 'true' && await p.locator('.sub a').first().isVisible());
  await p.keyboard.press('Escape'); ok('dropdown closes with Escape', (await p.locator('.sub-toggle').getAttribute('aria-expanded')) === 'false');
  // hero: accessible name, spotlight follows the pointer
  ok('hero h1 has the full accessible name', (await p.locator('h1').getAttribute('aria-label')) === 'Precision mould engineering, from concept to finished component.');
  const before = await p.evaluate(() => getComputedStyle(document.querySelector('[data-hero]')).getPropertyValue('--mx'));
  await p.mouse.move(200, 300); await p.mouse.move(260, 320); await p.waitForTimeout(2000);
  const after = await p.evaluate(() => getComputedStyle(document.querySelector('[data-hero]')).getPropertyValue('--mx'));
  ok('hero spotlight follows the pointer', before !== after && parseFloat(after) < 60, `${before} -> ${after}`);
  // process deck: seven cards, sticky stacking, then releases
  ok('process deck has 7 stages', await p.locator('[data-card]').count() === 7);
  await p.evaluate(() => document.querySelector('#stage-moulding').scrollIntoView({ block: 'start' })); await p.waitForTimeout(500);
  const stuck = await p.evaluate(() => { const t = document.querySelector('#stage-cad').getBoundingClientRect().top; const t2 = document.querySelector('#stage-moulding').getBoundingClientRect().top; return [t, t2]; });
  ok('earlier cards stay stuck near the top while later ones stack over them', stuck[0] > 40 && stuck[0] < 140 && stuck[1] >= stuck[0], JSON.stringify(stuck));
  ok('stacked cards sink (depth effect applied)', parseFloat(await p.evaluate(() => document.querySelector('#stage-cad').style.getPropertyValue('--d'))) > 0.3);
  await p.evaluate(() => document.querySelector('#products').scrollIntoView()); await p.waitForTimeout(400);
  ok('sticky deck releases after the section (page not trapped)', await p.evaluate(() => document.querySelector('#stage-quality-inspection, #stage-inspection').getBoundingClientRect().bottom < 0));
  // header tucks away on scroll down and returns on scroll up
  await p.evaluate(() => window.scrollTo(0, 3000)); await p.waitForTimeout(300); await p.evaluate(() => window.scrollTo(0, 3400)); await p.waitForTimeout(500);
  ok('header hides while scrolling down', await p.evaluate(() => document.querySelector('[data-header]').classList.contains('is-hidden')));
  await p.evaluate(() => window.scrollTo(0, 3100)); await p.waitForTimeout(500);
  ok('header returns when scrolling up', await p.evaluate(() => !document.querySelector('[data-header]').classList.contains('is-hidden')));
  ok('scroll progress bar advances', parseFloat(await p.evaluate(() => document.querySelector('[data-progress]').style.getPropertyValue('--p'))) > 0.1);
  // product rail
  await p.evaluate(() => document.querySelector('[data-rail]').scrollIntoView({ block: 'center' })); await p.waitForTimeout(400);
  await p.locator('[data-rail-next]').click(); await p.waitForTimeout(900);
  ok('product rail next button scrolls the rail', await p.evaluate(() => document.querySelector('[data-rail]').scrollLeft) > 100);
  ok('product rail is keyboard focusable', await p.evaluate(() => document.querySelector('[data-rail]').tabIndex === 0));
  // counters end on the published values
  await p.evaluate(() => document.querySelector('.stats').scrollIntoView({ block: 'center' })); await p.waitForTimeout(2200);
  const stats = await p.locator('.stats').innerText(); ok('stats show the published values after counting', /45\s*–\s*150/.test(stats) && /0\.5\s*–\s*300/.test(stats) && /1\.3\s*–\s*18\.5/.test(stats) && /\b17\b/.test(stats), stats.replace(/\s+/g, ' '));
  await ctx.close();
}
{
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } }); const p = await ctx.newPage(); await p.goto(BASE + '/injection-moulds/');
  const hs = p.locator('[data-spot="a3"]'); await hs.scrollIntoViewIfNeeded(); await hs.click();
  ok('hotspot toggles pressed + list item', (await hs.getAttribute('aria-pressed')) === 'true' && await p.locator('#a3.is-on').count() === 1);
  await p.keyboard.press('Escape'); ok('hotspot Escape clears', (await hs.getAttribute('aria-pressed')) === 'false');
  await ctx.close();
}
{ // video facade
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } }); const p = await ctx.newPage(); await p.goto(BASE + '/about/');
  ok('video not loaded until requested', await p.locator('iframe').count() === 0);
  await ctx.close();
}
{ // form
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } }); const p = await ctx.newPage(); await p.goto(BASE + '/contact/?ref=Side%20sill%20mould');
  const submit = async () => { await p.locator('[data-submit]').scrollIntoViewIfNeeded(); await p.waitForTimeout(700); await p.locator('[data-submit]').click(); };
  ok('form prefilled from ?ref=', (await p.inputValue('#f-msg')).includes('Side sill mould'));
  await p.fill('#f-msg', ''); await submit();
  ok('empty submit shows errors', await p.locator('.err:not([hidden])').count() >= 3 && await p.evaluate(() => document.activeElement.id) === 'f-name');
  ok('invalid fields flagged aria-invalid', await p.locator('[aria-invalid="true"]').count() >= 3);
  await p.fill('#f-name', 'Test Buyer'); await p.fill('#f-email', 'bad'); await p.fill('#f-company', 'Test Co'); await p.fill('#f-msg', 'Need a 4 cavity mould in PP, 50 g part.');
  await submit(); ok('bad email rejected', (await p.locator('#e-email').textContent()).includes('valid email'));
  await p.fill('#f-email', 'buyer@example.com'); await p.waitForTimeout(2700);
  fs.rmSync(MAILLOG, { force: true });
  await submit(); await p.waitForSelector('.form__status.is-ok', { timeout: 5000 }).catch(() => {});
  ok('valid submit shows success', await p.locator('.form__status.is-ok').count() === 1);
  const log = fs.existsSync(MAILLOG) ? fs.readFileSync(MAILLOG, 'utf8') : '';
  ok('server received and formatted the enquiry', /Test Buyer/.test(log) && /buyer@example\.com/.test(log) && /Reply-To: Test Buyer <buyer@example\.com>/.test(log));
  // server-side validation + header injection + honeypot via direct POST
  const post = (body) => fetch(BASE + '/api/contact', { method: 'POST', headers: { 'Accept': 'application/json', 'Content-Type': 'application/x-www-form-urlencoded', 'Origin': BASE }, body: new URLSearchParams(body) });
  let r = await post({ name: '', email: 'x', company: '', message: 'hi' }); ok('server rejects invalid input (422)', r.status === 422);
  fs.rmSync(MAILLOG, { force: true });
  r = await post({ name: 'Evil\r\nBcc: spam@x.com', email: 'a@b.co', company: 'C', message: 'A long enough message here.' });
  const log2 = fs.existsSync(MAILLOG) ? fs.readFileSync(MAILLOG, 'utf8') : '';
  ok('header injection neutralised', r.status === 200 && !/^Bcc:/m.test(log2));
  fs.rmSync(MAILLOG, { force: true });
  r = await post({ name: 'Bot', email: 'a@b.co', company: 'C', message: 'A long enough message here.', website: 'http://spam' });
  ok('honeypot swallows bot posts without sending', r.status === 200 && !fs.existsSync(MAILLOG));
  r = await fetch(BASE + '/api/contact', { method: 'POST', headers: { Accept: 'application/json', 'Content-Type': 'application/x-www-form-urlencoded', Origin: 'https://evil.example' }, body: 'name=a&email=a@b.co&company=c&message=long enough message' }); ok('cross-origin POST rejected (403)', r.status === 403);
  r = await fetch(BASE + '/api/contact'); ok('GET /api/contact rejected (405)', r.status === 405);
  await ctx.close();
}
{ // reduced motion: everything visible, no hidden-until-reveal state
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' }); const p = await ctx.newPage(); await p.goto(BASE + '/');
  await p.waitForTimeout(300);
  const st = await p.evaluate(() => { const w = document.querySelector('.ch'); const rv = [...document.querySelectorAll('.reveal')].map(e => getComputedStyle(e).opacity); const m = document.querySelector('.marquee__track'); return { tr: getComputedStyle(w).transform, minOp: Math.min(...rv), marquee: getComputedStyle(m).animationName, t: getComputedStyle(document.querySelector('.hero__t')).opacity, prog: document.documentElement.classList.contains('has-cursor') }; });
  ok('reduced motion: headline letters static', st.tr === 'none' || st.tr === 'matrix(1, 0, 0, 1, 0, 0)', st.tr);
  ok('reduced motion: reveals visible, marquee stopped, no cursor effect', st.minOp === 1 && st.marquee === 'none' && st.t === '1' && !st.prog, JSON.stringify(st));
  await ctx.close();
}
{ // no JavaScript: content, nav and specs still available
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, javaScriptEnabled: false }); const p = await ctx.newPage(); await p.goto(BASE + '/');
  ok('no-JS: hero headline visible', await p.locator('h1').isVisible());
  ok('no-JS: process steps visible', await p.locator('#stage-machining .h3').isVisible() && await p.locator('#stage-machining img').isVisible());
  ok('no-JS: product rail links visible', await p.locator('.pcard').first().isVisible());
  ok('no-JS: nav links visible', await p.locator('.nav-list a', { hasText: 'Contact' }).isVisible());
  await p.goto(BASE + '/injection-moulds/'); ok('no-JS: anatomy list readable, no dead hotspots', await p.locator('#a1').isVisible() && await p.locator('.hotspot').first().isHidden());
  await p.goto(BASE + '/contact/'); ok('no-JS: form posts natively', (await p.locator('form').getAttribute('action')) === '/api/contact');
  await ctx.close();
}
{ // 404 + redirect-ish behaviours
  const r = await fetch(BASE + '/injection-moulds', { redirect: 'manual' }); ok('missing trailing slash redirects to canonical', [301, 308].includes(r.status));
}
await browser.close(); server?.kill();
const passN = results.filter(r => r[0]).length;
console.log(`e2e: ${passN}/${results.length} passed`);
if (bad.length) { console.log('FAILURES:\n  ' + bad.join('\n  ')); process.exit(1); }
