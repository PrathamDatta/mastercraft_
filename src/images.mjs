// Image pipeline: AVIF + WebP at several widths, plus a JPEG fallback, and a manifest used by build.mjs.
import sharp from 'sharp';
import fs from 'node:fs';
import path from 'node:path';
import { IMAGES, WIDTHS } from './images.config.mjs';

const root = path.resolve(import.meta.dirname, '..');
const srcDir = path.join(root, 'src/assets/img-src');
const outDir = path.join(root, 'dist/assets/img');
const cacheDir = path.join(root, '.cache');
fs.mkdirSync(outDir, { recursive: true });
fs.mkdirSync(cacheDir, { recursive: true });

const manifest = {};
let made = 0;
for (const [key, cfg] of Object.entries(IMAGES)) {
  const input = path.join(srcDir, cfg.src);
  const meta = await sharp(input).metadata();
  const ws = [...new Set(WIDTHS.filter(w => w < meta.width).concat([meta.width > 2200 ? 2200 : meta.width]))].sort((a, b) => a - b);
  const entry = { widths: ws, w: meta.width, h: meta.height, slug: cfg.slug };
  entry.ratio = { w: ws[ws.length - 1], h: Math.round(ws[ws.length - 1] * meta.height / meta.width) };
  const srcStat = fs.statSync(input).mtimeMs;
  for (const w of ws) {
    for (const [fmt, opts] of [['avif', { quality: 48, effort: 4 }], ['webp', { quality: 74 }], ['jpg', { quality: 78, mozjpeg: true }]]) {
      if (fmt === 'jpg' && w !== (ws.find(x => x >= 800) ?? ws[ws.length - 1])) continue; // one JPEG fallback per image
      const out = path.join(outDir, `${cfg.slug}-${w}.${fmt}`);
      if (fs.existsSync(out) && fs.statSync(out).mtimeMs > srcStat) continue;
      await sharp(input).resize({ width: w, withoutEnlargement: true })[fmt === 'jpg' ? 'jpeg' : fmt](opts).toFile(out);
      made++;
    }
  }
  entry.fallbackW = ws.find(x => x >= 800) ?? ws[ws.length - 1];
  manifest[key] = entry;
}

// Logos: the supplied wordmark on light backgrounds, plus a light variant for dark backgrounds
// (black letterforms recoloured to near-white; the orange mark is untouched).
const logoIn = path.join(srcDir, 'mastercraft_logo.png');
const { data, info } = await sharp(logoIn).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
const light = Buffer.from(data);
for (let i = 0; i < light.length; i += 4) {
  const [r, g, b] = [light[i], light[i + 1], light[i + 2]];
  const isOrange = r > 180 && g > 90 && b < 120 && r - b > 100;
  const lum = (r + g + b) / 3;
  if (!isOrange) { // dark pixels -> white, keep anti-aliased alpha by luminance
    const a = Math.round(255 - lum);
    light[i] = light[i + 1] = light[i + 2] = 244; light[i + 3] = Math.min(light[i + 3], a);
  }
}
await sharp(light, { raw: info }).resize({ width: 400 }).webp({ quality: 90 }).toFile(path.join(outDir, 'mastercraft-logo-light.webp'));
await sharp(light, { raw: info }).resize({ width: 400 }).png({ compressionLevel: 9 }).toFile(path.join(outDir, 'mastercraft-logo-light.png'));
await sharp(logoIn).resize({ width: 400 }).png({ compressionLevel: 9 }).toFile(path.join(outDir, 'mastercraft-logo.png'));
// social/sharing image (real photo, 1200x630 crop)
await sharp(path.join(srcDir, 'machining5.jpg')).resize(1200, 630, { fit: 'cover', position: 'centre' }).jpeg({ quality: 82, mozjpeg: true }).toFile(path.join(outDir, 'mastercraft-engineers-og.jpg'));

fs.writeFileSync(path.join(cacheDir, 'img-manifest.json'), JSON.stringify(manifest, null, 1));
console.log(`images: ${Object.keys(manifest).length} sources, ${made} files written`);
