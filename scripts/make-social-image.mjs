// Builds the 1200x630 social preview images (Open Graph / Twitter) from real assets:
// the app logo (public/images/kiji-logo.png) and a real app capture
// (src/assets/captures/tech-light-dark.png). Nothing is drawn by hand except the
// background color (Calm theme page color) and the wordmark + tagline text.
//
// Run: node scripts/make-social-image.mjs
// Output: public/images/og/kiji-og-{en,zh-Hans,ja}.png
import { mkdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT_DIR = path.join(ROOT, 'public/images/og');
const WIDTH = 1200;
const HEIGHT = 630;
const PAGE = '#EEE5D3'; // Calm theme page color (default site theme)
const INK = '#3B3428';

const TAGLINES = {
  en: ['A modern, performant', 'RSS reader.'],
  'zh-Hans': ['现代、高性能的', 'RSS 阅读器。'],
  ja: ['モダンで高性能な', 'RSSリーダー。'],
};

const SHOT_X = 470;
const SHOT_Y = 70;
const SHOT_W = 900; // runs off the right edge on purpose
const SHOT_H = HEIGHT - SHOT_Y;

const escape = (value) => value.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');

async function shot() {
  const resized = await sharp(path.join(ROOT, 'src/assets/captures/tech-light-dark.png'))
    .resize({ width: SHOT_W })
    .toBuffer();
  const visibleW = WIDTH - SHOT_X;
  const cropped = await sharp(resized)
    .extract({ left: 0, top: 0, width: visibleW, height: SHOT_H })
    .toBuffer();
  // Rounded top-left corner like a window edge.
  const mask = Buffer.from(
    `<svg width="${visibleW}" height="${SHOT_H}"><rect x="0" y="0" width="${visibleW + 40}" height="${SHOT_H + 40}" rx="18" ry="18" fill="#fff"/></svg>`,
  );
  return sharp(cropped).composite([{ input: mask, blend: 'dest-in' }]).png().toBuffer();
}

async function build(locale, shotBuffer, logoBuffer) {
  const [line1, line2] = TAGLINES[locale];
  const text = Buffer.from(`<svg width="${WIDTH}" height="${HEIGHT}" xmlns="http://www.w3.org/2000/svg">
  <text x="64" y="300" font-family="Georgia, 'Times New Roman', serif" font-size="72" font-weight="600" fill="${INK}">KiJi</text>
  <text x="64" y="372" font-family="'PingFang SC', 'Hiragino Sans', 'Helvetica Neue', Arial, sans-serif" font-size="34" fill="${INK}">${escape(line1)}</text>
  <text x="64" y="418" font-family="'PingFang SC', 'Hiragino Sans', 'Helvetica Neue', Arial, sans-serif" font-size="34" fill="${INK}">${escape(line2)}</text>
</svg>`);
  // A soft shadow behind the capture so it reads as a window on the page color.
  const shadow = Buffer.from(`<svg width="${WIDTH}" height="${HEIGHT}" xmlns="http://www.w3.org/2000/svg">
  <defs><filter id="s" x="-10%" y="-10%" width="130%" height="130%"><feGaussianBlur stdDeviation="14"/></filter></defs>
  <rect x="${SHOT_X}" y="${SHOT_Y + 6}" width="${WIDTH}" height="${HEIGHT}" rx="18" fill="#000" fill-opacity="0.18" filter="url(#s)"/>
</svg>`);
  const out = path.join(OUT_DIR, `kiji-og-${locale}.png`);
  await sharp({ create: { width: WIDTH, height: HEIGHT, channels: 4, background: PAGE } })
    .composite([
      { input: shadow, left: 0, top: 0 },
      { input: shotBuffer, left: SHOT_X, top: SHOT_Y },
      { input: logoBuffer, left: 64, top: 120 },
      { input: text, left: 0, top: 0 },
    ])
    .flatten({ background: PAGE })
    .png({ compressionLevel: 9, palette: false })
    .toFile(out);
  console.log(`Wrote ${path.relative(ROOT, out)}`);
}

await mkdir(OUT_DIR, { recursive: true });
const shotBuffer = await shot();
const logoBuffer = await sharp(path.join(ROOT, 'public/images/kiji-logo.png')).resize(112, 112).toBuffer();
for (const locale of Object.keys(TAGLINES)) {
  await build(locale, shotBuffer, logoBuffer);
}
