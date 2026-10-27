# Mastercraft Engineers — website

Static redesign of https://mastercraftengineers.com/ (previously WordPress 5.2.21 + WPBakery + Slider Revolution).

- **Zero runtime dependencies.** Plain HTML/CSS/JS output, one small PHP file for the enquiry form.
- **Build-time dependencies:** `sharp` (image pipeline), `esbuild` (minify), `axe-core` + Playwright (tests).
- All existing public URLs are preserved (`/`, `/facilities/`, `/components/`, `/injection-moulds/`, `/2k-parts/`, `/large-size-injection-moulds/`, `/contact/`).

## Commands

```bash
npm install
npm run build     # images (AVIF/WebP/JPEG, cached) -> pages -> dist/
npm run serve     # http://127.0.0.1:8080 (PHP built-in server; form runs in dry-run mode)
npm run check     # static SEO/link/structured-data checks over dist/
npm run e2e       # Playwright: overflow, console errors, axe a11y, keyboard, form, reduced-motion, no-JS
npm test          # all of the above
```

Requires Node 20+, and PHP (only for `serve`/`e2e`, to exercise `contact.php`).

## Layout

| Path | Purpose |
|---|---|
| `src/data.mjs` | **Single source of truth** for company facts, process, every mould/component spec, FAQ, glossary. Edit content here. |
| `src/images.config.mjs` | Photo registry (descriptive output filenames + default alt text). |
| `src/lib.mjs` | Layout, head/SEO tags, CSP, JSON-LD builders, responsive `<picture>` helper. |
| `src/components.mjs` | Process route, mould anatomy, machine-envelope diagram, range rulers, weight chart, spec tables. |
| `src/pages-main.mjs`, `src/pages-products.mjs` | Page templates (home, about, facilities, quality, listings, **product-detail template**, contact, 404). |
| `src/assets/css/main.css` | Design system + motion system (tokens at the top). |
| `src/assets/js/main.js` | Progressive-enhancement interactions (no libraries). |
| `src/static/` | `contact.php`, `.htaccess` template, favicons. |
| `dist/` | Build output — this is what gets deployed. |

To add a product, append an entry to `LARGE_MOULDS`, `SMALL_MOULDS`, `COMPONENTS` or `TWOK` in `src/data.mjs`, add its photo to `images.config.mjs` and `src/assets/img-src/`, then `npm run build`. Its listing row, detail page, sitemap entry, `Product` and breadcrumb JSON-LD are generated automatically.

See `docs/IMPLEMENTATION.md` for the audit, design decisions, test results and open items, and `docs/DEPLOY.md` for the deployment checklist.
