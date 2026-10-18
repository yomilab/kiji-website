/**
 * Sample content for website screenshots. The article, its byline and the
 * Markdown files are fictional; the stations list uses real feeds (FEED_LISTS).
 */

export interface SampleItem {
  source: string;
  initials: string;
  color: string;
  time: string;
  title: string;
  summary: string;
  unread?: boolean;
  saved?: boolean;
}

export const ITEMS: SampleItem[] = [
  {
    source: 'Field Notes Weekly', initials: 'FN', color: '#3E7C59', time: '09:12', unread: true,
    title: 'The quiet return of the slow web',
    summary: 'Personal sites, newsletters, and feeds are filling the space social timelines left behind.',
  },
  {
    source: 'Lumen Science', initials: 'LS', color: '#2F5BC4', time: '08:40', unread: true, saved: true,
    title: 'What tide pools teach us about resilience',
    summary: 'A decade of measurements shows small ecosystems recovering faster than expected.',
  },
  {
    source: 'Workbench', initials: 'WB', color: '#B4532A', time: '07:55',
    title: 'Building a desk that outlives its owner',
    summary: 'Joinery, oil finishes, and the case for furniture you can repair with one tool.',
  },
  {
    source: 'Northern Dispatch', initials: 'ND', color: '#6B4FA0', time: '06:30', unread: true,
    title: 'A harbor town rebuilds its library, one shelf at a time',
    summary: 'Volunteers catalogued twelve thousand donated books in a single winter.',
  },
  {
    source: 'Compiler Diaries', initials: 'CD', color: '#1F6F78', time: '05:02',
    title: 'Notes on writing software that runs for twenty years',
    summary: 'Plain files, boring formats, and the long tail of maintenance.',
  },
  {
    source: 'Field Notes Weekly', initials: 'FN', color: '#3E7C59', time: 'Yesterday',
    title: 'Ten feeds worth following this autumn',
    summary: 'From bird migration logs to a typographer’s sketchbook.',
  },
  {
    source: 'Lumen Science', initials: 'LS', color: '#2F5BC4', time: 'Yesterday',
    title: 'The mathematics of a perfect paper fold',
    summary: 'Origami researchers find a shortcut through a forty-year-old problem.',
  },
];

export const ARTICLE = {
  title: 'The quiet return of the slow web',
  author: 'Mara Okafor',
  source: 'Field Notes Weekly',
  paragraphs: [
    'For a while it seemed the feed was finished. Timelines ranked everything for us, and the habit of choosing what to read faded into the background.',
    'Then people started building their own corners again. Small sites, long letters, and plain RSS feeds came back, not as nostalgia but as a way to read on purpose.',
    'A feed reader does one simple thing: it shows you what the people you chose have written, in the order they wrote it. There is nothing to optimize and nothing to outrun.',
    'The result is a calmer kind of attention. You open the app, read what is new, save what matters, and close it. The internet is still there tomorrow.',
  ],
  quote: 'Reading on purpose is the whole idea.',
};

export const MARKDOWN_FILES = [
  'the-quiet-return-of-the-slow-web.md',
  'what-tide-pools-teach-us.md',
  'building-a-desk-that-outlives-its-owner.md',
  'notes-on-software-that-runs-for-20-years.md',
  'a-harbor-town-rebuilds-its-library.md',
];

/* ---------- Stations screenshot: real feeds ---------- */

export type ShotLocale = 'en' | 'zh-Hans' | 'ja';

export interface FeedListSample {
  /** Clock shown next to "Feeds" in the sidebar. */
  syncedAt: string;
  stations: Array<{ emoji: string; name: string; count: number }>;
  /** Name of the selected station; its items fill the list. */
  active: string;
  items: SampleItem[];
}

/*
 * Real headlines from each source's public feed, fetched 2026-10-18.
 * Times are in the locale's usual time zone (New York, Beijing, Tokyo).
 * Summaries are our own one-line descriptions, not copied feed text;
 * Hacker News items show the linked site, as its feed does.
 * Feeds: hnrss.org/frontpage, feeds.bloomberg.com/markets/news.rss,
 * techcrunch.com/feed, simonwillison.net/atom/everything,
 * economist.com/latest/rss.xml, ruanyifeng.com/blog/atom.xml,
 * nhk.or.jp/rss/news/cat0.xml; 世界苦茶 from its episode list (podwise.ai/podcasts/603).
 * English sources fill in where a language has few sources of its own.
 */
const SOURCE = {
  hn: { source: 'Hacker News', initials: 'Y', color: '#FF6600' },
  bloomberg: { source: 'Bloomberg', initials: 'B', color: '#1A1A1A' },
  techcrunch: { source: 'TechCrunch', initials: 'TC', color: '#0A9E01' },
  simon: { source: 'Simon Willison’s Weblog', initials: 'SW', color: '#7B4FA6' },
  economist: { source: 'The Economist', initials: 'E', color: '#E3120B' },
  ruanyf: { source: '阮一峰的网络日志', initials: '阮', color: '#B03A2E' },
  kucha: { source: '世界苦茶', initials: '苦', color: '#5B4636' },
  nhk: { source: 'NHK ニュース', initials: 'N', color: '#2B2B2B' },
};

const STATION_EMOJI = ['☀️', '💻', '🌏', '📈', '🛠️', '🎧', '🗾', '📚'];
const STATION_COUNTS = [48, 36, 52, 27, 31, 8, 19, 12];
const stations = (names: string[]) =>
  names.map((name, index) => ({ emoji: STATION_EMOJI[index], name, count: STATION_COUNTS[index] }));

export const FEED_LISTS: Record<ShotLocale, FeedListSample> = {
  en: {
    syncedAt: 'Today 07:30',
    stations: stations(['Daily', 'Tech', 'World', 'Markets', 'Programming', 'Podcasts', 'Japan', 'Long reads']),
    active: 'Daily',
    items: [
      { ...SOURCE.hn, time: '07:02', unread: true, title: 'Kids are outsmarting social media bans. That’s not a problem we need to solve', summary: 'technologyreview.com' },
      { ...SOURCE.economist, time: '06:29', unread: true, title: 'Plot Twist Newsletter: Culture’s 20-year nostalgia rule', summary: 'Why pop culture keeps returning to whatever was popular two decades ago.' },
      { ...SOURCE.hn, time: '06:14', unread: true, title: 'It’s time to talk about TEEs', summary: 'alinush.github.io' },
      { ...SOURCE.hn, time: '04:19', title: 'Parser Combinators', summary: 't3.at' },
      { ...SOURCE.bloomberg, time: 'Yesterday', title: 'China Rail Logs Record 3.71 Billion Trips in First Nine Months', summary: 'Passenger trips rose 4.8% from a year earlier over the first three quarters.' },
      { ...SOURCE.simon, time: 'Yesterday', title: 'Inline rendering with document.currentScript', summary: 'A small trick for rendering output right where an inline script tag sits.' },
      { ...SOURCE.techcrunch, time: 'Yesterday', title: 'Ember’s new temperature-controlled mug makes my nightly tea ritual even better', summary: 'The new mug changes your drink’s temperature without opening the app.' },
    ],
  },
  'zh-Hans': {
    syncedAt: 'Today 19:30',
    stations: stations(['每日', '科技', '国际', '财经', '编程', '播客', '日本', '长文']),
    active: '每日',
    items: [
      { ...SOURCE.hn, time: '16:19', unread: true, title: 'Parser Combinators', summary: 't3.at' },
      { ...SOURCE.bloomberg, time: '11:34', unread: true, title: 'China Rail Logs Record 3.71 Billion Trips in First Nine Months', summary: 'Passenger trips rose 4.8% from a year earlier over the first three quarters.' },
      { ...SOURCE.economist, time: '昨天', title: 'Can joggers outrun injury?', summary: 'What it takes to keep running without getting hurt.' },
      { ...SOURCE.ruanyf, time: '10月16日', unread: true, title: '科技爱好者周刊（第 415 期）：3D 版《看不见的城市》', summary: '每周五发布的科技内容合集。' },
      { ...SOURCE.ruanyf, time: '10月8日', title: '科技爱好者周刊（第 414 期）：Jev 决策模型有什么用', summary: '每周五发布的科技内容合集。' },
      { ...SOURCE.ruanyf, time: '9月18日', title: '科技爱好者周刊（第 413 期）：再见了，React Native', summary: '每周五发布的科技内容合集。' },
      { ...SOURCE.kucha, time: '2025年5月', title: 'E160《民营经济促进法》以效力极低方式推出，以及4月进口惊喜数据的真相', summary: '透明茶室，每日新闻事件分析（30 分钟）' },
    ],
  },
  ja: {
    syncedAt: 'Today 20:30',
    stations: stations(['毎日', 'テック', '国際', 'マーケット', 'プログラミング', 'ポッドキャスト', '国内', '長文']),
    active: '毎日',
    items: [
      { ...SOURCE.nhk, time: '19:31', unread: true, title: 'SUBARU 車の衝突実験を“実機ではなくデジタルで”なぜ?【QA】', summary: '衝突実験をコンピューター上で再現する取り組みを解説。' },
      { ...SOURCE.nhk, time: '19:29', unread: true, title: 'プロ野球 阪神 藤川球児監督が会見 来シーズンへの決意語る', summary: '今シーズンを振り返り、来季への思いを語りました。' },
      { ...SOURCE.nhk, time: '19:04', title: '台風30号 22日ごろ沖縄の南海上に達する予想 今後の情報に注意', summary: '最新の進路予想と、今後の注意点。' },
      { ...SOURCE.hn, time: '17:19', unread: true, title: 'Parser Combinators', summary: 't3.at' },
      { ...SOURCE.bloomberg, time: '12:34', title: 'China Rail Logs Record 3.71 Billion Trips in First Nine Months', summary: 'Passenger trips rose 4.8% from a year earlier over the first three quarters.' },
      { ...SOURCE.simon, time: '06:11', title: 'Inline rendering with document.currentScript', summary: 'A small trick for rendering output right where an inline script tag sits.' },
      { ...SOURCE.techcrunch, time: '00:30', title: 'Ember’s new temperature-controlled mug makes my nightly tea ritual even better', summary: 'The new mug changes your drink’s temperature without opening the app.' },
    ],
  },
};
