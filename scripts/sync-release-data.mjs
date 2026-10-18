#!/usr/bin/env node
import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DEFAULT_MANIFEST_URL = 'https://kiji.yomilab.app/release.json';

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
const releaseDate = toRfc822(manifest.date);

await writeFile(
  path.join(ROOT_DIR, 'src/data/latestRelease.json'),
  `${JSON.stringify(manifest, null, 2)}\n`,
  'utf8'
);

await writeFile(
  path.join(ROOT_DIR, 'public/release.json'),
  `${JSON.stringify(manifest, null, 2)}\n`,
  'utf8'
);

// Release index that powers /changelog/ and the RSS feed. Upsert by version so a
// corrected notes section in kiji-app CHANGELOG.md re-syncs on the next run.
const releasesPath = path.join(ROOT_DIR, 'src/data/releases.json');
let releases = [];
try {
  const parsed = JSON.parse(await readFile(releasesPath, 'utf8'));
  if (Array.isArray(parsed)) {
    releases = parsed;
  }
} catch {
  // Missing or unreadable file — start a fresh index.
}

const tag = manifest.tag ?? `v${version}`;
const isGithubUrl = (url) => typeof url === 'string' && url.startsWith('https://github.com/');
const normalizeNotes = (notes, { withTranslations = true } = {}) => {
  if (!notes || !Array.isArray(notes.sections)) {
    return undefined;
  }
  const translations = withTranslations && notes.translations && typeof notes.translations === 'object'
    ? Object.fromEntries(
      Object.entries(notes.translations)
        .map(([locale, value]) => [locale, normalizeNotes(value, { withTranslations: false })])
        .filter(([, value]) => value),
    )
    : {};
  const sections = notes.sections
    .filter((section) => typeof section?.title === 'string' && Array.isArray(section.items))
    .map((section) => ({
      title: section.title,
      items: section.items.filter((item) => typeof item === 'string' && item.trim()),
    }))
    .filter((section) => section.items.length > 0);
  if (sections.length === 0 && !notes.summary) {
    return undefined;
  }
  return {
    ...(typeof notes.summary === 'string' && notes.summary.trim() ? { summary: notes.summary } : {}),
    sections,
    ...(Object.keys(translations).length ? { translations } : {}),
  };
};

const existing = releases.find((entry) => entry?.version === version);
const entry = {
  ...existing,
  version,
  tag,
  date: manifest.date ?? existing?.date ?? new Date().toISOString(),
  assetsUrl: [manifest.checksumsUrl, manifest.notesUrl, existing?.assetsUrl, existing?.notesUrl].find(isGithubUrl),
  notes: normalizeNotes(manifest.notes) ?? existing?.notes,
};
delete entry.notesUrl;
for (const key of Object.keys(entry)) {
  if (entry[key] === undefined) delete entry[key];
}
releases = [entry, ...releases.filter((candidate) => candidate?.version !== version)]
  .sort((left, right) => String(right.date ?? '').localeCompare(String(left.date ?? '')));
await writeFile(releasesPath, `${JSON.stringify(releases, null, 2)}\n`, 'utf8');

const changelogUrl = 'https://kiji.yomilab.app/changelog/';
const cdata = (value) => `<![CDATA[${String(value).replaceAll(']]>', ']]]]><![CDATA[>')}]]>`;
const htmlEscape = (value) => String(value)
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;');
const notesHtml = (release) => {
  const parts = [];
  if (release.notes?.summary) {
    parts.push(`<p>${htmlEscape(release.notes.summary)}</p>`);
  }
  for (const section of release.notes?.sections ?? []) {
    parts.push(`<h3>${htmlEscape(section.title)}</h3><ul>${section.items.map((item) => `<li>${htmlEscape(item)}</li>`).join('')}</ul>`);
  }
  return parts.join('') || `<p>${htmlEscape(`${productName} ${release.version} is available.`)}</p>`;
};

const feedItems = releases.slice(0, 20).map((release) => {
  const releaseTag = release.tag ?? `v${release.version}`;
  return `    <item>
      <title>${xmlEscape(`${productName} ${release.version}`)}</title>
      <link>${xmlEscape(`${changelogUrl}#${releaseTag}`)}</link>
      <guid isPermaLink="false">${xmlEscape(`kiji-release-${releaseTag}`)}</guid>
      <pubDate>${toRfc822(release.date)}</pubDate>
      <description>${cdata(notesHtml(release))}</description>
    </item>`;
}).join('\n');

const feedXml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>${xmlEscape(productName)} Updates</title>
    <link>${xmlEscape(changelogUrl)}</link>
    <description>Release notes for ${xmlEscape(productName)}.</description>
    <language>en</language>
    <lastBuildDate>${releaseDate}</lastBuildDate>
${feedItems}
  </channel>
</rss>
`;

await writeFile(path.join(ROOT_DIR, 'public/feed.xml'), feedXml, 'utf8');

console.log(`Synced ${productName} ${version} release metadata from ${manifestUrl}`);
