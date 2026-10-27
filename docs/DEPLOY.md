# Deployment checklist

**Nothing has been deployed.** The production site was not touched. Deployment needs the owner's authorisation and hosting access.

## Current hosting (as observed)
WordPress 5.2.21 (end-of-life) with WPBakery and Slider Revolution, files under `/wp/`, served from `mastercraftengineers.com`. PHP is therefore available, which is why the form handler is a single `contact.php` using PHP `mail()`.

## Before go-live
1. **Back up** the current WordPress site (files + database) and keep it until the new site is verified.
2. Run `npm install && npm test` on the release commit; confirm `dist/` is current.
3. **Content sign-off** by Mastercraft (see "Items to confirm" in `IMPLEMENTATION.md`): published figures flagged there, the 3-axis stroke wording, the "Housing Drive" 4 t mould weight, and whether any part names may be shown publicly.
4. Confirm the **mailbox**: `contact.php` sends to `info@mcraft.net` from `website@mastercraftengineers.com`. Create/allow that sender address, and add SPF/DKIM for the domain so the mail is not filtered. Send a real test enquiry from the staging copy.
5. Confirm HTTPS is valid for both `mastercraftengineers.com` and `www.`.

## Staging
Upload `dist/` to a staging sub-domain (e.g. `staging.mastercraftengineers.com`) with `X-Robots-Tag: noindex` (or HTTP auth), then repeat `npm run e2e` with `BASE=https://staging…`. Staging must not be indexed.

## Go-live (Apache / cPanel-style hosting)
1. Upload the **contents** of `dist/` to the web root (including the hidden `.htaccess`). Keep the old WordPress files outside the web root or in a dated backup folder until verified.
2. Check the `.htaccess` modules exist (`mod_rewrite`, `mod_headers`, `mod_expires`, `mod_deflate`). If the host is Nginx or IIS, translate the redirects/headers (the rules are commented in `.htaccess`).
3. The `.htaccess` issues 301s from old WordPress image URLs (`/wp/wp-content/uploads/…`) to the optimised images and returns 410 for feeds/`wp-admin`/`xmlrpc.php`. All page URLs are unchanged, so no page redirects are needed.
4. Smoke test on production: every URL in `sitemap.xml` returns 200; `/contact/` form delivers mail; `/robots.txt` and `/sitemap.xml` load; a made-up URL shows the styled 404 with status 404; `http://` and `www.` redirect to `https://mastercraftengineers.com/`.
5. Optionally enable HSTS (line is commented in `.htaccess`) once HTTPS is confirmed everywhere.

## After go-live
- Submit `https://mastercraftengineers.com/sitemap.xml` in **Google Search Console** and Bing Webmaster Tools; inspect the home page and a product page; watch Coverage and Core Web Vitals reports (field data takes ~28 days).
- Run **Rich Results Test / Schema Markup Validator** on `/`, a listing and a detail page (JSON-LD was parse-checked locally; third-party validators were not run).
- Claim/verify the **Google Business Profile** with the exact address and phone numbers used on the site (external action; not done).
- Re-measure Lighthouse on the live URL; compare with the figures in `IMPLEMENTATION.md` (local numbers are indicative, not field data).
- Remove the old WordPress install, plugins and database once satisfied (they are an unpatched security risk).
- Redeploy cycle: `npm run build` → upload changed files in `dist/`. Asset URLs carry `?v=<build date>`.

## Rollback
Restore the backed-up WordPress files/database (or re-point the web root). No data migration is involved, since the new site holds no database.
