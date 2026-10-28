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
  // hero + floating header
  ok('hero h1 carries the full headline', /Precision\s+mould engineering,\s+from concept to finished component\./.test((await p.locator('h1').innerText()).replace(/\s+/g, ' ')));
  const bar0 = await p.evaluate(() => document.querySelector('.bar').getBoundingClientRect().top);
  await p.evaluate(() => window.scrollTo(0, 2500)); await p.waitForTimeout(500);
  const bar1 = await p.evaluate(() => document.querySelector('.bar').getBoundingClientRect().top);
  ok('pill header floats and stays visible while scrolling', bar0 > 5 && bar1 > 5 && bar1 < 40, `${bar0} / ${bar1}`);
  ok('header gains its stuck state when scrolled', await p.evaluate(() => document.querySelector('[data-header]').classList.contains('is-stuck')));
  ok('scroll progress bar advances', parseFloat(await p.evaluate(() => document.querySelector('[data-progress]').style.getPropertyValue('--p'))) > 0.1);
  // bento numbers end on the published values
  await p.evaluate(() => document.querySelector('.bento').scrollIntoView({ block: 'center' })); await p.waitForTimeout(2300);
  const bento = (await p.locator('.bento').innerText()).replace(/\s+/g, ' ');
  ok('bento shows the published values after counting', /45\s*–\s*150/.test(bento) && /0\.5\s*–\s*300/.test(bento) && /\b17\b/.test(bento) && /64/.test(bento), bento.slice(0, 200));
  // process timeline: 7 stages, line draws, stages light up, nothing sticky/trapping
  ok('process timeline has 7 stages', await p.locator('[data-step]').count() === 7);
  await p.evaluate(() => document.querySelector('#stage-moulding').scrollIntoView({ block: 'center' })); await p.waitForTimeout(700);
  ok('timeline line has drawn part-way and reached stages are lit', parseFloat(await p.evaluate(() => document.querySelector('[data-tl-prog]').style.getPropertyValue('--p'))) > 0.5 && await p.locator('#stage-assembly.is-on').count() === 1 && await p.locator('#stage-inspection.is-on').count() === 0);
  await p.evaluate(() => document.querySelector('#products').scrollIntoView()); await p.waitForTimeout(400);
  ok('page continues past the timeline (nothing sticky traps scrolling)', await p.evaluate(() => document.querySelector('#stage-inspection').getBoundingClientRect().top < 0));
  // product explorer tabs
  const tabs = p.locator('[role="tab"]');
  ok('explorer has 4 tabs, first selected, one panel visible', await tabs.count() === 4 && (await tabs.nth(0).getAttribute('aria-selected')) === 'true' && await p.locator('[role="tabpanel"]:visible').count() === 1);
  await tabs.nth(2).click(); await p.waitForTimeout(300);
  ok('clicking a tab swaps the panel', (await tabs.nth(2).getAttribute('aria-selected')) === 'true' && await p.locator('#panel-components').isVisible() && !(await p.locator('#panel-large').isVisible()));
  await tabs.nth(2).focus(); await p.keyboard.press('ArrowDown'); await p.waitForTimeout(200);
  ok('arrow keys move through the tabs', (await tabs.nth(3).getAttribute('aria-selected')) === 'true' && await p.evaluate(() => document.activeElement.id) === 'tab-twok');
  await p.keyboard.press('Home'); ok('Home selects the first tab', (await tabs.nth(0).getAttribute('aria-selected')) === 'true');
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
  const st = await p.evaluate(() => { const rv = [...document.querySelectorAll('.reveal, .rise')].map(e => getComputedStyle(e).opacity); const m = getComputedStyle(document.querySelector('.hero__h mark'), '::after').transform; return { minOp: Math.min(...rv), brush: m, main: getComputedStyle(document.querySelector('.hero__main')).opacity }; });
  ok('reduced motion: everything visible without animating in', st.minOp === 1 && st.main === '1', JSON.stringify(st));
  ok('reduced motion: headline highlight drawn immediately', st.brush === 'none' || st.brush === 'matrix(1, 0, 0, 1, 0, 0)', st.brush);
  await ctx.close();
}
{ // no JavaScript: content, nav and specs still available
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, javaScriptEnabled: false }); const p = await ctx.newPage(); await p.goto(BASE + '/');
  ok('no-JS: hero headline visible', await p.locator('h1').isVisible());
  ok('no-JS: process steps visible', await p.locator('#stage-machining .h3').isVisible() && await p.locator('#stage-machining img').isVisible());
  ok('no-JS: all four product panels are visible (tabs hidden)', await p.locator('.panel:visible').count() === 4 && await p.locator('.explorer__tabs').isHidden());
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
