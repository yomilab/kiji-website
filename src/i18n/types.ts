export type PageKey = 'home' | 'download' | 'resource' | 'changelog' | 'privacy' | 'support';
export type LogoVariant = 'light' | 'dark' | 'theme';
export type LogoDownloadId = 'logo-pack' | 'light-logo' | 'dark-logo';
export type DownloadPlatform = 'mac' | 'windows' | 'linux';

export interface PageMeta {
  title: string;
  description: string;
  canonicalPath: string;
}

export interface DownloadOption {
  id: string;
  platform: DownloadPlatform;
  label: string;
  detail: string;
  version: string;
  fileType: string;
  url: string;
}

export interface LogoDownload {
  id: LogoDownloadId;
  href: string;
  fileType: string;
  previewVariant: LogoVariant;
}

export const LANGUAGE_OPTIONS = [
  { code: 'en', label: 'English', shortLabel: 'EN' },
  { code: 'zh-Hans', label: '简体中文', shortLabel: 'ZH' },
  { code: 'ja', label: '日本語', shortLabel: 'JP' },
] as const;

export type LanguageCode = (typeof LANGUAGE_OPTIONS)[number]['code'];
export const DEFAULT_LANGUAGE_CODE: LanguageCode = 'en';
export const LANGUAGE_STORAGE_KEY = 'kiji-website-language';

export const isLanguageCode = (value: string | null | undefined): value is LanguageCode => (
  LANGUAGE_OPTIONS.some((option) => option.code === value)
);

/** Locale-aware public path: English stays unprefixed, other locales get /locale prefix. */
export const localePath = (locale: LanguageCode, canonicalPath: string): string => (
  locale === DEFAULT_LANGUAGE_CODE ? canonicalPath : `/${locale}${canonicalPath}`
);

export const OG_LOCALES: Record<LanguageCode, string> = {
  en: 'en_US',
  'zh-Hans': 'zh_CN',
  ja: 'ja_JP',
};

export interface LocalizedText {
  pageMeta: Record<PageKey, PageMeta>;
  nav: {
    aria: string;
    download: string;
    resource: string;
    changelog: string;
    rss: string;
    support: string;
  };
  footer: {
    brandTagline: string;
    productHeading: string;
    legalHeading: string;
    disclaimer: string;
    privacy: string;
    support: string;
    resource: string;
    github: string;
    llms: string;
  };
  language: {
    triggerAria: string;
    setAria: string;
  };
  home: {
    eyebrow: string;
    title: string;
    lead: string;
    downloadCta: string;
    subscribeCta: string;
    heroShotAlt: string;
    featuresAria: string;
    privacyTitle: string;
    privacyText: string;
    feedsTitle: string;
    feedsText: string;
    opmlLink: string;
    readingTitle: string;
    readingText: string;
    readerShotAlt: string;
    simpleTitle: string;
    simpleText: string;
    closingTitle: string;
    closingText: string;
  };
  download: {
    eyebrow: string;
    title: string;
    lead: string;
    panelAria: string;
    kicker: string;
    chooseAria: string;
    directUrl: string;
    checksums: string;
    releaseRss: string;
  };
  changelog: {
    eyebrow: string;
    title: string;
    lead: string;
    rssCta: string;
    releaseNotes: string;
  };
  resource: {
    eyebrow: string;
    title: string;
    lead: string;
    downloadPack: string;
    downloadLight: string;
    gridAria: string;
    downloadPrefix: string;
  };
  resourceFeeds: {
    title: string;
    lead: string;
    gridAria: string;
    openOpml: string;
  };
  feedLists: Record<string, {
    description: string;
  }>;
  privacy: {
    eyebrow: string;
    title: string;
    lead: string;
  };
  support: {
    eyebrow: string;
    title: string;
    leadPrefix: string;
    leadSuffix: string;
  };
  logoDownloads: Record<LogoDownloadId, {
    title: string;
    detail: string;
  }>;
  downloadOptions: Record<string, {
    label: string;
    detail: string;
  }>;
}
