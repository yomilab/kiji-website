#!/usr/bin/env node
import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DEFAULT_MANIFEST_URL = 'https://github.com/yomilab/kiji-releases/releases/latest/download/release.json';

const args = new Map();
for (let index = 0; index < process.argv.slice(2).length; index += 1) {
  const rawArgs = process.argv.slice(2);
  const arg = rawArgs[index];
  if (!arg.startsWith('--')) {
    continue;
  }
  const key = arg.slice(2);
  const value = rawArgs[index + 1];
  if (value && !value.startsWith('--')) {
    args.set(key, value);
    index += 1;
  }
}

const manifestUrl = args.get('manifest-url') ?? process.env.RELEASE_MANIFEST_URL ?? DEFAULT_MANIFEST_URL;

const xmlEscape = (value) => String(value)
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;')
  .replaceAll("'", '&apos;');

const fetchManifest = async () => {
  if (manifestUrl.startsWith('file://')) {
    return JSON.parse(await readFile(new URL(manifestUrl), 'utf8'));
  }

  if (!manifestUrl.startsWith('http://') && !manifestUrl.startsWith('https://')) {
    return JSON.parse(await readFile(path.resolve(ROOT_DIR, manifestUrl), 'utf8'));
  }

  const response = await fetch(manifestUrl, { cache: 'no-store' });
  if (!response.ok) {
    throw new Error(`Failed to fetch release manifest ${manifestUrl}: ${response.status}`);
  }
  return response.json();
};

const toRfc822 = (value) => {
  const date = value ? new Date(value) : new Date();
  return Number.isNaN(date.getTime()) ? new Date().toUTCString() : date.toUTCString();
};

const manifest = await fetchManifest();
const version = manifest.version ?? '0.0.0';
const productName = manifest.productName ?? 'KiJi';
const websiteUrl = manifest.notesUrl ? new URL(manifest.notesUrl).origin : 'https://kiji.yomilab.app';
const releaseDate = toRfc822(manifest.date);

await writeFile(
  path.join(ROOT_DIR, 'src/data/latestRelease.json'),
  `${JSON.stringify(manifest, null, 2)}\n`,
  'utf8'
);

const feedXml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>${xmlEscape(productName)} Updates</title>
    <link>${xmlEscape(websiteUrl)}/</link>
    <description>Release notes, app changes, resource repo updates, and service announcements for ${xmlEscape(productName)}.</description>
    <language>en</language>
    <lastBuildDate>${releaseDate}</lastBuildDate>
    <item>
      <title>${xmlEscape(productName)} ${xmlEscape(version)} released</title>
      <link>${xmlEscape(manifest.notesUrl ?? `${websiteUrl}/changelog/`)}</link>
      <guid>${xmlEscape(`${websiteUrl}/changelog/#${manifest.tag ?? `v${version}`}`)}</guid>
      <pubDate>${releaseDate}</pubDate>
      <description>${xmlEscape(`${productName} ${version} is available with updated desktop downloads and checksums.`)}</description>
    </item>
  </channel>
</rss>
`;

await writeFile(path.join(ROOT_DIR, 'public/feed.xml'), feedXml, 'utf8');

console.log(`Synced ${productName} ${version} release metadata from ${manifestUrl}`);
