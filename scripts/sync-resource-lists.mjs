#!/usr/bin/env node
import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const RESOURCE_REPO = 'https://github.com/yomilab/kiji-resource';
const DEFAULT_METADATA_URL = 'https://raw.githubusercontent.com/yomilab/kiji-resource/main/metadata/feeds.json';

const args = new Map();
const rawArgs = process.argv.slice(2);
for (let index = 0; index < rawArgs.length; index += 1) {
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

const metadataUrl = args.get('metadata-url') ?? process.env.RESOURCE_METADATA_URL ?? DEFAULT_METADATA_URL;

const DISPLAY_NAMES = {
  recommended: 'Recommended',
  tech: 'Tech',
  ai: 'AI',
  security: 'Security',
  dev: 'Dev',
  coins: 'Coins',
  news: 'News',
  korea: 'Korea',
  japan: 'Japan',
  'hn-popular': 'HN Popular',
  'awesome-tech-rss': 'Awesome Tech RSS',
  'recommend-1': 'Recommend 1',
  'recommend-2': 'Recommend 2',
  'recommend-all': 'Recommend All',
};

const SPECIAL_ORDER = ['hn-popular', 'awesome-tech-rss', 'recommend-1', 'recommend-2', 'recommend-all'];

const fetchMetadata = async () => {
  if (metadataUrl.startsWith('file://')) {
    return JSON.parse(await readFile(new URL(metadataUrl), 'utf8'));
  }

  if (!metadataUrl.startsWith('http://') && !metadataUrl.startsWith('https://')) {
    return JSON.parse(await readFile(path.resolve(ROOT_DIR, metadataUrl), 'utf8'));
  }

  const response = await fetch(metadataUrl, { cache: 'no-store' });
  if (!response.ok) {
    throw new Error(`Failed to fetch resource metadata ${metadataUrl}: ${response.status}`);
  }
  return response.json();
};

const metadata = await fetchMetadata();

const toList = (id, opmlPath) => ({
  id,
  name: DISPLAY_NAMES[id] ?? id,
  path: opmlPath,
  rawUrl: `https://raw.githubusercontent.com/yomilab/kiji-resource/main/${opmlPath}`,
  browseUrl: `${RESOURCE_REPO}/blob/main/${opmlPath}`,
});

const lists = [];
if (metadata.recommendedOpml) {
  lists.push(toList('recommended', metadata.recommendedOpml));
}
for (const id of metadata.categories ?? []) {
  lists.push(toList(id, `feeds/${id}.opml`));
}
const specialIds = [...(metadata.specialCategories ?? [])].sort((left, right) => {
  const leftIndex = SPECIAL_ORDER.indexOf(left);
  const rightIndex = SPECIAL_ORDER.indexOf(right);
  return (leftIndex === -1 ? Number.MAX_SAFE_INTEGER : leftIndex) - (rightIndex === -1 ? Number.MAX_SAFE_INTEGER : rightIndex);
});
for (const id of specialIds) {
  lists.push(toList(id, `feeds/${id}.opml`));
}

const output = {
  version: 1,
  source: RESOURCE_REPO,
  syncedAt: new Date().toISOString(),
  lists,
};

await writeFile(
  path.join(ROOT_DIR, 'src/data/resourceLists.json'),
  `${JSON.stringify(output, null, 2)}\n`,
  'utf8'
);

console.log(`Synced ${lists.length} resource lists from ${metadataUrl}`);
