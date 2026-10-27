// Vercel serverless function: enquiry form handler (POST /api/contact).
// Sends the enquiry by e-mail through the Resend HTTP API (no npm dependency).
// Configuration (Vercel > Project > Settings > Environment Variables) — never commit these:
//   RESEND_API_KEY  API key from resend.com
//   CONTACT_FROM    sender on a domain verified in Resend, e.g. "Mastercraft Website <website@mastercraftengineers.com>"
//   CONTACT_TO      recipient mailbox (default: info@mcraft.net)
// MC_MAIL_DRY_RUN=1 writes the message to the OS temp dir instead of sending (local tests only).
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const SITE_HOST = 'mastercraftengineers.com';
const clean = (v, max) => String(v ?? '').replace(/[\r\0]/g, '').trim().slice(0, max);
const oneLine = (v) => v.replace(/[\r\n\t]+/g, ' ').trim();
const hostOnly = (h) => String(h || '').toLowerCase().replace(/:\d+$/, '');

function finish(req, res, ok, errors, code = 200) {
  const wantsJson = String(req.headers.accept || '').includes('application/json');
  res.setHeader('Cache-Control', 'no-store');
  if (wantsJson) return res.status(code).json({ ok, errors });
  res.statusCode = 303;
  res.setHeader('Location', ok ? '/contact/thank-you/' : '/contact/?error=1#enquiry');
  return res.end();
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    res.status(405).setHeader('Content-Type', 'text/plain; charset=utf-8');
    return res.end('Please use the enquiry form at /contact/.');
  }
  // same-origin check where the browser supplies Origin
  const origin = req.headers.origin;
  if (origin) {
    let oh = ''; try { oh = new URL(origin).hostname; } catch { /* malformed origin */ }
    const ok = oh === hostOnly(req.headers.host) || oh === SITE_HOST || oh === `www.${SITE_HOST}` || oh.endsWith('.vercel.app');
    if (!ok) return finish(req, res, false, { form: 'Request rejected.' }, 403);
  }
  const b = req.body && typeof req.body === 'object' ? req.body : {};

  // honeypot: bots fill the hidden field; pretend success so they learn nothing
  if (clean(b.website, 200)) return finish(req, res, true, {});
  // time trap: page stamps a start time; implausibly fast submissions are bots
  const started = Number(b.started) || 0;
  if (started > 0 && Date.now() - started < 2500) return finish(req, res, true, {});

  const name = oneLine(clean(b.name, 120));
  const email = oneLine(clean(b.email, 160));
  const company = oneLine(clean(b.company, 160));
  const phone = oneLine(clean(b.phone, 40));
  const type = oneLine(clean(b.type, 80));
  const message = clean(b.message, 5000);

  const errors = {};
  if (!name) errors.name = 'Please enter your name.';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) errors.email = 'Please enter a valid email address.';
  if (!company) errors.company = 'Please enter your company name.';
  if (phone && !/^[0-9+()\-\s.]{6,40}$/.test(phone)) errors.phone = 'Please enter a valid phone number, or leave it blank.';
  if (message.length < 10) errors.message = 'Please describe your requirement (at least a sentence).';
  if (Object.keys(errors).length) return finish(req, res, false, errors, 422);

  const subject = oneLine(`Website enquiry from ${name} (${company})`).slice(0, 200);
  const text = `New enquiry from https://${SITE_HOST}\n\nName: ${name}\nCompany: ${company}\nEmail: ${email}\nPhone: ${phone || '-'}\nNeed: ${type || '-'}\n\nProject details:\n${message}\n`;
  const to = process.env.CONTACT_TO || 'info@mcraft.net';

  if (process.env.MC_MAIL_DRY_RUN) {
    const safeName = name.replace(/["<>,]/g, '');
    fs.appendFileSync(path.join(os.tmpdir(), 'mastercraft-mail.log'), `TO: ${to}\nSUBJECT: ${subject}\nReply-To: ${safeName} <${email}>\n\n${text}\n---\n`);
    return finish(req, res, true, {});
  }
  if (!process.env.RESEND_API_KEY || !process.env.CONTACT_FROM) {
    console.error('contact form: RESEND_API_KEY / CONTACT_FROM not configured');
    return finish(req, res, false, { form: 'We could not send your enquiry just now. Please email info@mcraft.net or call +91-80-27839712.' }, 500);
  }
  try {
    const r = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ from: process.env.CONTACT_FROM, to: [to], reply_to: email, subject, text })
    });
    if (!r.ok) throw new Error(`Resend responded ${r.status}`);
    return finish(req, res, true, {});
  } catch (e) {
    console.error('contact form: send failed', e.message);
    return finish(req, res, false, { form: 'We could not send your enquiry just now. Please email info@mcraft.net or call +91-80-27839712.' }, 500);
  }
}
