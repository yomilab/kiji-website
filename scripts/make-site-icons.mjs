// Builds the site's logo, mark, favicon and download-pack files from the KiJi Circle app icon
// (appIcons/products/kiji/concepts/kiji-circle, shipped in kiji-app as `circle` / `circle-dark`).
//
// Light pages use the gradient-outline version (kiji-circle-light-b-gradient, the app's
// `circle-dark`); dark pages use the white-outline version (kiji-circle-dark, the app's `circle`).
// The file names here describe the page background, as before.
//
// Run: node scripts/make-site-icons.mjs   (needs the appIcons repo next to this one)
// It also copies every app icon the KiJi app offers in Settings (1024 masters from kiji-app)
// to public/images/app-icons/ for the Resource page and the logo pack.
//
// Run: node scripts/make-site-icons.mjs   (needs the appIcons and kiji-app repos next to this one)
// Output: public/images/kiji-logo{,-dark}.png, public/images/kiji-mark{,-dark}.{svg,png},
//         public/images/kiji-mark-bold.svg (header), public/images/app-icons/*.png,
//         public/favicon.svg, public/favicon.ico, public/apple-touch-icon.png,
//         public/downloads/kiji-app-logos.zip
import { execFileSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SOURCE = path.resolve(ROOT, '../appIcons/products/kiji/concepts/kiji-circle');
const PUBLIC = path.join(ROOT, 'public');
const APP_IMAGES = path.resolve(ROOT, '../kiji-app/src/assets/images');

// Settings → App icon in kiji-app (APP_ICON_VARIANT_OPTIONS), same order. Keep in sync with
// src/lib/appIcons.ts.
const APP_ICONS = {
  ripple: 'kiji-logo-ripple.png',
  'ripple-dark': 'kiji-logo-ripple-dark.png',
  light: 'kiji-logo.png',
  dark: 'kiji-logo-dark.png',
  circle: 'kiji-logo-circle.png',
  'circle-dark': 'kiji-logo-circle-dark.png',
};

const iconSvg = {
  light: readFileSync(path.join(SOURCE, 'kiji-circle-light-b-gradient.svg'), 'utf8').trim(),
  dark: readFileSync(path.join(SOURCE, 'kiji-circle-dark.svg'), 'utf8').trim(),
};

// The app icon sits in the Dock-safe box (outer edge r 415). The mark drops that scale so the
// circle fills the canvas like the old Ripple mark.
const fullBleed = (svg) => svg.replace(/<g transform="[^"]*">/, '<g>');
// Small sizes: double the ring and outline strokes so the waves still read at 16 px.
const bold = (svg) =>
  svg.replace(/stroke-width="([\d.]+)"/g, (_, w) => `stroke-width="${+(w * 2).toFixed(2)}"`);
const inner = (svg) => svg.replace(/^<svg[^>]*>/, '').replace(/<\/svg>$/, '');
const svgDoc = (body) =>
  `<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024" viewBox="0 0 1024 1024">${body}</svg>\n`;
const png = (svg, size) => sharp(Buffer.from(svg)).resize(size, size).png().toBuffer();

const mark = { light: fullBleed(iconSvg.light), dark: fullBleed(iconSvg.dark) };

// favicon.svg follows the browser's light/dark setting. Only the light version has the
// gradient, so it brings the shared defs (clip `c`, gradient `bd`); the dark body reuses them.
function faviconSvg() {
  const light = inner(bold(mark.light));
  const dark = inner(bold(mark.dark)).replace(/<defs>.*?<\/defs>/, '');
  const style = '<style>.d{display:none}@media (prefers-color-scheme: dark){.l{display:none}.d{display:inline}}</style>';
  const defs = light.match(/<defs>.*?<\/defs>/)[0];
  return svgDoc(`${style}${defs}<g class="l">${light.replace(defs, '')}</g><g class="d">${dark}</g>`);
}

// ICO with PNG entries (16, 32, 48).
function ico(images) {
  const header = Buffer.alloc(6 + 16 * images.length);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(images.length, 4);
  let offset = header.length;
  images.forEach(({ size, data }, i) => {
    const at = 6 + 16 * i;
    header.writeUInt8(size, at);
    header.writeUInt8(size, at + 1);
    header.writeUInt16LE(1, at + 4);
    header.writeUInt16LE(32, at + 6);
    header.writeUInt32LE(data.length, at + 8);
    header.writeUInt32LE(offset, at + 12);
    offset += data.length;
  });
  return Buffer.concat([header, ...images.map((image) => image.data)]);
}

const out = (file, data) => {
  writeFileSync(path.join(PUBLIC, file), data);
  console.log(`public/${file}`);
};

const files = {
  logoLight: await png(iconSvg.light, 1024),
  logoDark: await png(iconSvg.dark, 1024),
  markLight: await png(mark.light, 1024),
  markDark: await png(mark.dark, 1024),
};
out('images/kiji-logo.png', files.logoLight);
out('images/kiji-logo-dark.png', files.logoDark);
out('images/kiji-mark.svg', svgDoc(inner(mark.light)));
out('images/kiji-mark-dark.svg', svgDoc(inner(mark.dark)));
out('images/kiji-mark.png', files.markLight);
out('images/kiji-mark-dark.png', files.markDark);
// Header logo: the favicon's bold mark in the gradient outline (the app's Circle Dark), on
// light and dark pages alike.
out('images/kiji-mark-bold.svg', svgDoc(inner(bold(mark.light))));

const appIconFiles = Object.fromEntries(
  Object.entries(APP_ICONS).map(([id, file]) => [`kiji-icon-${id}.png`, readFileSync(path.join(APP_IMAGES, file))]),
);
mkdirSync(path.join(PUBLIC, 'images/app-icons'), { recursive: true });
for (const [name, data] of Object.entries(appIconFiles)) out(`images/app-icons/${name}`, data);

out('favicon.svg', faviconSvg());
const boldLight = bold(mark.light);
out('favicon.ico', ico(await Promise.all([16, 32, 48].map(async (size) => ({ size, data: await png(boldLight, size) })))));

// iOS fills transparency with black, so the touch icon is the light mark on white.
const TOUCH = 180, TOUCH_MARK = 156;
out(
  'apple-touch-icon.png',
  await sharp({ create: { width: TOUCH, height: TOUCH, channels: 4, background: '#FFFFFF' } })
    .composite([{ input: await png(mark.light, TOUCH_MARK), left: (TOUCH - TOUCH_MARK) / 2, top: (TOUCH - TOUCH_MARK) / 2 }])
    .flatten({ background: '#FFFFFF' })
    .png()
    .toBuffer(),
);

// Download pack (same file names as before).
const pack = mkdtempSync(path.join(tmpdir(), 'kiji-logos-'));
const packFiles = {
  'README.txt':
    'Official KiJi logo assets (Circle).\n\n' +
    'kiji-logo-light-1024.png / kiji-logo-dark-1024.png  App icon, transparent 1024x1024, for light / dark backgrounds.\n' +
    'kiji-mark-light-*  Mark filling the canvas, for light backgrounds.\n' +
    'kiji-mark-dark-*   Mark filling the canvas, for dark backgrounds.\n' +
    'app-icons/kiji-icon-*.png  Every app icon offered in KiJi Settings, transparent 1024x1024.\n\n' +
    'Website: https://kiji.yomilab.app\n',
  'kiji-logo-light-1024.png': files.logoLight,
  'kiji-logo-dark-1024.png': files.logoDark,
  'kiji-mark-light-1024.png': files.markLight,
  'kiji-mark-dark-1024.png': files.markDark,
  'kiji-mark-light.svg': svgDoc(inner(mark.light)),
  'kiji-mark-dark.svg': svgDoc(inner(mark.dark)),
};
for (const [name, data] of Object.entries(appIconFiles)) packFiles[`app-icons/${name}`] = data;
mkdirSync(path.join(pack, 'app-icons'));
for (const [name, data] of Object.entries(packFiles)) writeFileSync(path.join(pack, name), data);
const zip = path.join(PUBLIC, 'downloads/kiji-app-logos.zip');
rmSync(zip, { force: true });
execFileSync('zip', ['-X', '-q', zip, ...Object.keys(packFiles)], { cwd: pack });
rmSync(pack, { recursive: true });
console.log('public/downloads/kiji-app-logos.zip');
