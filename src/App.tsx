import { useEffect, useMemo, useRef, useState } from 'react';
import latestReleaseManifest from './data/latestRelease.json';

type PageKey = 'home' | 'download' | 'resource' | 'changelog' | 'privacy' | 'support';
type LogoVariant = 'light' | 'dark' | 'theme';

interface PageMeta {
  title: string;
  description: string;
  canonicalPath: string;
}

type DownloadPlatform = 'mac' | 'windows' | 'linux';

interface DownloadOption {
  id: string;
  platform: DownloadPlatform;
  label: string;
  detail: string;
  version: string;
  fileType: string;
  url: string;
}

interface LogoDownload {
  id: LogoDownloadId;
  href: string;
  fileType: string;
  previewVariant: LogoVariant;
}

type LogoDownloadId = 'logo-pack' | 'light-logo' | 'dark-logo';

const OPML_DIRECTORY_URL = 'https://github.com/yomilab/kiji-resource';
const DOWNLOAD_MANIFEST_URL = 'https://github.com/yomilab/kiji-release/releases/latest/download/release.json';
const DEFAULT_CHECKSUMS_URL = 'https://github.com/yomilab/kiji-release/releases/latest/download/checksums.txt';
const YOMILAB_GITHUB_URL = 'https://github.com/yomilab';
const DOWNLOAD_ORDER = ['mac-arm64', 'mac-x64'];
const DOWNLOADS_UNDER_DEVELOPMENT = true;
const LANGUAGE_STORAGE_KEY = 'kiji-website-language';
const LANGUAGE_OPTIONS = [
  { code: 'en', label: 'English', shortLabel: 'EN' },
  { code: 'zh-Hans', label: '简体中文', shortLabel: 'ZH' },
  { code: 'ja', label: '日本語', shortLabel: 'JP' },
] as const;
const DEFAULT_LANGUAGE_CODE = 'en';
type LanguageCode = (typeof LANGUAGE_OPTIONS)[number]['code'];
const LOGO_DOWNLOADS: LogoDownload[] = [
  {
    id: 'logo-pack',
    href: '/downloads/kiji-app-logos.zip',
    fileType: 'ZIP',
    previewVariant: 'theme',
  },
  {
    id: 'light-logo',
    href: '/images/kiji-logo.png',
    fileType: 'PNG',
    previewVariant: 'light',
  },
  {
    id: 'dark-logo',
    href: '/images/kiji-logo-dark.png',
    fileType: 'PNG',
    previewVariant: 'dark',
  },
];

interface ReleaseDownloadAsset {
  id?: string;
  platform?: string;
  label?: string;
  detail?: string;
  fileType?: string;
  fileName: string;
  version?: string;
  url: string;
  sha256?: string;
  size?: number;
}

interface ReleaseManifest {
  productName: string;
  version: string;
  tag?: string;
  date?: string;
  notesUrl?: string;
  updatesFeedUrl?: string;
  checksumsUrl?: string;
  downloads?: Record<string, ReleaseDownloadAsset>;
  downloadOptions?: ReleaseDownloadAsset[];
}

const localReleaseManifest: ReleaseManifest = latestReleaseManifest;

interface LocalizedText {
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
    privacy: string;
    support: string;
    resource: string;
    github: string;
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
    featuresAria: string;
    downloadsTitle: string;
    downloadsText: string;
    privacyTitle: string;
    privacyText: string;
    feedsTitle: string;
    feedsText: string;
    opmlLink: string;
    simpleTitle: string;
    simpleText: string;
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

const TEXT: Record<LanguageCode, LocalizedText> = {
  en: {
    pageMeta: {
      home: {
        title: 'KiJi - A simple, private RSS reader',
        description: 'KiJi is a simple, private RSS reader that keeps feeds, saved articles, Markdown folder sync, and reading data local and exportable.',
        canonicalPath: '/',
      },
      download: {
        title: 'Download KiJi',
        description: 'KiJi desktop downloads are currently under development, with macOS as the active release target.',
        canonicalPath: '/download/',
      },
      resource: {
        title: 'KiJi Resources',
        description: 'Download the official KiJi app logo pack and individual light and dark logo assets.',
        canonicalPath: '/resource/',
      },
      changelog: {
        title: 'KiJi Changelog',
        description: 'KiJi release notes and product updates.',
        canonicalPath: '/changelog/',
      },
      privacy: {
        title: 'KiJi Privacy',
        description: 'KiJi stores reading data locally, collects no personal reading data, and keeps exports under user control.',
        canonicalPath: '/privacy/',
      },
      support: {
        title: 'KiJi Feedback',
        description: 'Share feedback, feature ideas, questions, and bug reports with KiJi.',
        canonicalPath: '/support/',
      },
    },
    nav: {
      aria: 'Main navigation',
      download: 'Download',
      resource: 'Resource',
      changelog: 'Changelog',
      rss: 'RSS',
      support: 'Feedback',
    },
    footer: {
      privacy: 'Privacy',
      support: 'Feedback',
      resource: 'Resource',
      github: 'YomiLab GitHub',
    },
    language: {
      triggerAria: 'Language',
      setAria: 'Set language to',
    },
    home: {
      eyebrow: 'Simple, private RSS reader',
      title: 'A practical RSS reader that runs locally.',
      lead: 'KiJi helps you follow feeds, save articles, sync saved reading to a local Markdown folder, and export your data without tracking or algorithmic noise.',
      downloadCta: 'Download KiJi',
      subscribeCta: 'Subscribe to updates',
      featuresAria: 'Product highlights',
      downloadsTitle: 'macOS release status',
      downloadsText: 'Desktop downloads are under development. KiJi is focusing on macOS packaging first, and Windows/Linux builds will come later.',
      privacyTitle: 'No personal reading data collected',
      privacyText: 'Your feeds, articles, saved items, Markdown files, and reading state stay under your control on your device.',
      feedsTitle: 'Import and export feeds',
      feedsText: 'Start with OPML feed collections and keep your subscriptions portable.',
      opmlLink: 'View OPML directory',
      simpleTitle: 'Markdown sync and saved exports',
      simpleText: 'Sync saved articles to a local Markdown folder and export all saved articles when you want a portable archive.',
    },
    download: {
      eyebrow: 'Downloads',
      title: 'Get KiJi for your desktop.',
      lead: 'Desktop downloads are currently under development. KiJi is stabilizing macOS packaging first, and Windows/Linux builds are paused for later.',
      panelAria: 'Download KiJi',
      kicker: 'Download recommended build',
      chooseAria: 'Choose another download',
      directUrl: 'Direct release asset URL:',
      checksums: 'Checksums',
      releaseRss: 'Release RSS',
    },
    changelog: {
      eyebrow: 'Changelog',
      title: 'KiJi updates',
      lead: 'Release notes will be synced here from the app repo and public release manifest.',
      rssCta: 'Subscribe with RSS',
    },
    resource: {
      eyebrow: 'Brand assets',
      title: 'Download KiJi resources.',
      lead: 'Use the official KiJi logo set for website links, app listings, release notes, and support material. The complete pack includes the current light and dark app logos.',
      downloadPack: 'Download logo pack',
      downloadLight: 'Download light PNG',
      gridAria: 'KiJi logo downloads',
      downloadPrefix: 'Download',
    },
    privacy: {
      eyebrow: 'Privacy',
      title: 'No personal reading data collected.',
      lead: 'KiJi\'s desktop reader keeps your feeds, articles, saved items, and reading state on your device. Your data can be exported, and the core reader does not use tracking or an algorithmic timeline.',
    },
    support: {
      eyebrow: 'Feedback',
      title: 'We would love to hear from you.',
      leadPrefix: 'Send us a note at',
      leadSuffix: 'If there is a feature you would like to see, a bug you ran into, or anything that felt confusing, please let us know.',
    },
    logoDownloads: {
      'logo-pack': {
        title: 'Complete logo pack',
        detail: 'ZIP with the light and dark 1024x1024 transparent app logos.',
      },
      'light-logo': {
        title: 'Light app logo',
        detail: '1024x1024 transparent PNG for light placements.',
      },
      'dark-logo': {
        title: 'Dark app logo',
        detail: '1024x1024 transparent PNG for dark placements.',
      },
    },
    downloadOptions: {
      'mac-arm64': { label: 'macOS Apple Silicon', detail: 'Recommended for M1, M2, M3, and newer Macs' },
      'mac-x64': { label: 'macOS Intel', detail: 'For Intel-based Macs' },
      'windows-x64': { label: 'Windows x64', detail: 'Recommended for most Windows PCs' },
      'linux-deb': { label: 'Linux Debian/Ubuntu', detail: 'For Debian, Ubuntu, and compatible distributions' },
      'linux-rpm': { label: 'Linux Fedora/RHEL', detail: 'For Fedora, RHEL, and compatible distributions' },
    },
  },
  'zh-Hans': {
    pageMeta: {
      home: {
        title: 'KiJi - 简单、私密的 RSS 阅读器',
        description: 'KiJi 是一个简单、私密的 RSS 阅读器，让订阅、收藏文章、Markdown 文件夹同步和阅读数据保存在本地，并可由用户导出。',
        canonicalPath: '/',
      },
      download: {
        title: '下载 KiJi',
        description: 'KiJi 桌面下载目前仍在完善中，当前以 macOS 发布为主。',
        canonicalPath: '/download/',
      },
      resource: {
        title: 'KiJi 资源',
        description: '下载官方 KiJi 应用 Logo 包，以及浅色和深色 Logo 资源。',
        canonicalPath: '/resource/',
      },
      changelog: {
        title: 'KiJi 更新日志',
        description: 'KiJi 发布说明和产品更新。',
        canonicalPath: '/changelog/',
      },
      privacy: {
        title: 'KiJi 隐私',
        description: 'KiJi 将阅读数据保存在本地，不收集个人阅读数据，并让导出由用户控制。',
        canonicalPath: '/privacy/',
      },
      support: {
        title: 'KiJi 反馈',
        description: '向 KiJi 提交反馈、功能建议、问题和 bug 报告。',
        canonicalPath: '/support/',
      },
    },
    nav: {
      aria: '主导航',
      download: '下载',
      resource: '资源',
      changelog: '更新',
      rss: 'RSS',
      support: '反馈',
    },
    footer: {
      privacy: '隐私',
      support: '反馈',
      resource: '资源',
      github: 'YomiLab GitHub',
    },
    language: {
      triggerAria: '语言',
      setAria: '切换语言到',
    },
    home: {
      eyebrow: '简单、私密的 RSS 阅读器',
      title: '在本地运行的实用 RSS 阅读器。',
      lead: 'KiJi 帮你跟进订阅、保存文章，把已保存内容同步到本地 Markdown 文件夹，并导出你的数据，没有追踪，也没有算法信息流。',
      downloadCta: '下载 KiJi',
      subscribeCta: '订阅更新',
      featuresAria: '产品亮点',
      downloadsTitle: 'macOS 发布状态',
      downloadsText: '桌面下载仍在开发中。KiJi 当前优先完善 macOS 打包，Windows 和 Linux 版本会在之后再开放。',
      privacyTitle: '不收集个人阅读数据',
      privacyText: '你的订阅、文章、收藏、Markdown 文件和阅读状态都由你掌控，保存在设备本地。',
      feedsTitle: '导入和导出订阅',
      feedsText: '可以从 OPML 订阅集合开始，并保持订阅列表可迁移。',
      opmlLink: '查看 OPML 目录',
      simpleTitle: 'Markdown 同步与收藏导出',
      simpleText: '把已保存文章同步到本地 Markdown 文件夹，也可以在需要时导出全部收藏文章，保留可迁移的归档。',
    },
    download: {
      eyebrow: '下载',
      title: '为你的桌面设备获取 KiJi。',
      lead: '桌面下载目前仍在完善中。KiJi 当前优先稳定 macOS 打包，Windows 和 Linux 版本暂缓到后续阶段。',
      panelAria: '下载 KiJi',
      kicker: '下载推荐版本',
      chooseAria: '选择其他下载',
      directUrl: '直接发布资源地址：',
      checksums: '校验文件',
      releaseRss: '发布 RSS',
    },
    changelog: {
      eyebrow: '更新日志',
      title: 'KiJi 更新',
      lead: '这里会同步来自应用仓库和公开发布清单的发布说明。',
      rssCta: '通过 RSS 订阅',
    },
    resource: {
      eyebrow: '品牌资源',
      title: '下载 KiJi 资源。',
      lead: '可将官方 KiJi Logo 用于网站链接、应用列表、发布说明和支持材料。完整资源包包含当前浅色和深色应用 Logo。',
      downloadPack: '下载 Logo 包',
      downloadLight: '下载浅色 PNG',
      gridAria: 'KiJi Logo 下载',
      downloadPrefix: '下载',
    },
    privacy: {
      eyebrow: '隐私',
      title: '不收集个人阅读数据。',
      lead: 'KiJi 桌面阅读器会将你的订阅、文章、收藏和阅读状态保存在设备本地。你的数据可以导出，核心阅读器不使用追踪或算法信息流。',
    },
    support: {
      eyebrow: '反馈',
      title: '我们很想听听你的想法。',
      leadPrefix: '欢迎发邮件到',
      leadSuffix: '如果你有想加入的功能、遇到 bug，或使用中有任何让你感到困惑的地方，都欢迎告诉我们。',
    },
    logoDownloads: {
      'logo-pack': {
        title: '完整 Logo 包',
        detail: '包含浅色和深色 1024x1024 透明应用 Logo 的 ZIP 文件。',
      },
      'light-logo': {
        title: '浅色应用 Logo',
        detail: '适合浅色场景的 1024x1024 透明 PNG。',
      },
      'dark-logo': {
        title: '深色应用 Logo',
        detail: '适合深色场景的 1024x1024 透明 PNG。',
      },
    },
    downloadOptions: {
      'mac-arm64': { label: 'macOS Apple Silicon', detail: '推荐用于 M1、M2、M3 和更新的 Mac' },
      'mac-x64': { label: 'macOS Intel', detail: '用于 Intel Mac' },
      'windows-x64': { label: 'Windows x64', detail: '推荐用于大多数 Windows 电脑' },
      'linux-deb': { label: 'Linux Debian/Ubuntu', detail: '用于 Debian、Ubuntu 和兼容发行版' },
      'linux-rpm': { label: 'Linux Fedora/RHEL', detail: '用于 Fedora、RHEL 和兼容发行版' },
    },
  },
  ja: {
    pageMeta: {
      home: {
        title: 'KiJi - シンプルでプライベートなRSSリーダー',
        description: 'KiJiは、フィード、保存記事、Markdownフォルダ同期、読書データをローカルに保ち、エクスポートできるシンプルでプライベートなRSSリーダーです。',
        canonicalPath: '/',
      },
      download: {
        title: 'KiJiをダウンロード',
        description: 'KiJiのデスクトップ配布は現在整備中で、当面はmacOS版を優先しています。',
        canonicalPath: '/download/',
      },
      resource: {
        title: 'KiJi リソース',
        description: '公式KiJiアプリロゴパックと、ライト/ダークのロゴ素材をダウンロードできます。',
        canonicalPath: '/resource/',
      },
      changelog: {
        title: 'KiJi 更新履歴',
        description: 'KiJiのリリースノートと製品アップデート。',
        canonicalPath: '/changelog/',
      },
      privacy: {
        title: 'KiJi プライバシー',
        description: 'KiJiは読書データをローカルに保存し、個人の読書データを収集せず、エクスポートをユーザーの管理下に置きます。',
        canonicalPath: '/privacy/',
      },
      support: {
        title: 'KiJi フィードバック',
        description: 'KiJi へのフィードバック、機能要望、質問、不具合報告はこちら。',
        canonicalPath: '/support/',
      },
    },
    nav: {
      aria: 'メインナビゲーション',
      download: 'ダウンロード',
      resource: 'リソース',
      changelog: '更新履歴',
      rss: 'RSS',
      support: 'フィードバック',
    },
    footer: {
      privacy: 'プライバシー',
      support: 'フィードバック',
      resource: 'リソース',
      github: 'YomiLab GitHub',
    },
    language: {
      triggerAria: '言語',
      setAria: '言語を変更',
    },
    home: {
      eyebrow: 'シンプルでプライベートなRSSリーダー',
      title: 'ローカルで動く実用的なRSSリーダー。',
      lead: 'KiJiはフィードの購読、記事の保存、保存した読み物のローカルMarkdownフォルダ同期、データのエクスポートを支えます。トラッキングやアルゴリズム型タイムラインはありません。',
      downloadCta: 'KiJiをダウンロード',
      subscribeCta: '更新を購読',
      featuresAria: '製品の特徴',
      downloadsTitle: 'macOSリリース状況',
      downloadsText: 'デスクトップ配布は現在開発中です。KiJiはまずmacOS向けパッケージの安定化を進め、WindowsとLinuxはその後に対応します。',
      privacyTitle: '個人の読書データを収集しません',
      privacyText: 'フィード、記事、保存項目、Markdownファイル、読書状態は、あなたの管理下でデバイス上に残ります。',
      feedsTitle: 'フィードのインポートとエクスポート',
      feedsText: 'OPMLフィードコレクションから始めて、購読リストを持ち運べます。',
      opmlLink: 'OPMLディレクトリを見る',
      simpleTitle: 'Markdown同期と保存記事のエクスポート',
      simpleText: '保存した記事をローカルのMarkdownフォルダに同期し、必要なときにすべての保存記事をポータブルなアーカイブとしてエクスポートできます。',
    },
    download: {
      eyebrow: 'ダウンロード',
      title: 'デスクトップ向けKiJiを入手。',
      lead: 'デスクトップ配布は現在整備中です。KiJiはまずmacOS向けパッケージの安定化を進めており、WindowsとLinuxは後続対応です。',
      panelAria: 'KiJiをダウンロード',
      kicker: 'おすすめビルドをダウンロード',
      chooseAria: '別のダウンロードを選択',
      directUrl: '直接リリースアセットURL:',
      checksums: 'チェックサム',
      releaseRss: 'リリースRSS',
    },
    changelog: {
      eyebrow: '更新履歴',
      title: 'KiJiの更新',
      lead: 'アプリリポジトリと公開リリースマニフェストからリリースノートを同期します。',
      rssCta: 'RSSで購読',
    },
    resource: {
      eyebrow: 'ブランド素材',
      title: 'KiJiリソースをダウンロード。',
      lead: '公式KiJiロゴセットは、Webサイトリンク、アプリ掲載、リリースノート、サポート資料に利用できます。完全パックには現在のライト/ダークのアプリロゴが含まれます。',
      downloadPack: 'ロゴパックをダウンロード',
      downloadLight: 'ライトPNGをダウンロード',
      gridAria: 'KiJiロゴダウンロード',
      downloadPrefix: 'ダウンロード',
    },
    privacy: {
      eyebrow: 'プライバシー',
      title: '個人の読書データを収集しません。',
      lead: 'KiJiのデスクトップリーダーは、フィード、記事、保存項目、読書状態をデバイス上に保ちます。データはエクスポートでき、コアリーダーはトラッキングやアルゴリズム型タイムラインを使いません。',
    },
    support: {
      eyebrow: 'フィードバック',
      title: 'ぜひご意見をお聞かせください。',
      leadPrefix: 'メールはこちら',
      leadSuffix: '追加してほしい機能、遭遇した不具合、わかりにくかった点があれば、ぜひお知らせください。',
    },
    logoDownloads: {
      'logo-pack': {
        title: '完全ロゴパック',
        detail: 'ライト/ダークの1024x1024透明アプリロゴを含むZIPです。',
      },
      'light-logo': {
        title: 'ライトアプリロゴ',
        detail: 'ライトな配置向けの1024x1024透明PNGです。',
      },
      'dark-logo': {
        title: 'ダークアプリロゴ',
        detail: 'ダークな配置向けの1024x1024透明PNGです。',
      },
    },
    downloadOptions: {
      'mac-arm64': { label: 'macOS Apple Silicon', detail: 'M1、M2、M3以降のMacにおすすめ' },
      'mac-x64': { label: 'macOS Intel', detail: 'Intel搭載Mac向け' },
      'windows-x64': { label: 'Windows x64', detail: 'ほとんどのWindows PCにおすすめ' },
      'linux-deb': { label: 'Linux Debian/Ubuntu', detail: 'Debian、Ubuntu、互換ディストリビューション向け' },
      'linux-rpm': { label: 'Linux Fedora/RHEL', detail: 'Fedora、RHEL、互換ディストリビューション向け' },
    },
  },
};

const getPageKey = (): PageKey => {
  const path = window.location.pathname;
  if (path.startsWith('/download')) return 'download';
  if (path.startsWith('/resource') || path.startsWith('/logos')) return 'resource';
  if (path.startsWith('/changelog')) return 'changelog';
  if (path.startsWith('/privacy')) return 'privacy';
  if (path.startsWith('/support')) return 'support';
  return 'home';
};

const isLanguageCode = (value: string | null): value is LanguageCode => (
  LANGUAGE_OPTIONS.some((option) => option.code === value)
);

const detectPreferredLanguage = (): LanguageCode => {
  const languages = window.navigator.languages?.length ? window.navigator.languages : [window.navigator.language];
  for (const language of languages) {
    const normalizedLanguage = language.toLowerCase();
    if (normalizedLanguage.startsWith('zh')) return 'zh-Hans';
    if (normalizedLanguage.startsWith('ja')) return 'ja';
  }

  return DEFAULT_LANGUAGE_CODE;
};

const readStoredLanguage = (): LanguageCode => {
  const storedLanguage = window.localStorage.getItem(LANGUAGE_STORAGE_KEY);
  return isLanguageCode(storedLanguage) ? storedLanguage : detectPreferredLanguage();
};

const setMetaContent = (selector: string, content: string): void => {
  const element = document.head.querySelector<HTMLMetaElement>(selector);
  if (element) {
    element.content = content;
  }
};

const usePageMeta = (page: PageKey, language: LanguageCode): void => {
  useEffect(() => {
    const meta = TEXT[language].pageMeta[page];
    document.documentElement.lang = language;
    document.title = meta.title;
    setMetaContent('meta[name="description"]', meta.description);
    setMetaContent('meta[property="og:title"]', meta.title);
    setMetaContent('meta[property="og:description"]', meta.description);

    const canonical = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (canonical) {
      canonical.href = `https://kiji.yomilab.app${meta.canonicalPath}`;
    }
  }, [language, page]);
};

const normalizePlatform = (platform?: string): DownloadPlatform | null => {
  if (platform === 'mac' || platform === 'windows' || platform === 'linux') {
    return platform;
  }
  return null;
};

const inferFileType = (fileName: string): string => {
  const extension = fileName.split('.').pop();
  return extension ? extension.toUpperCase() : 'FILE';
};

const inferDownloadLabel = (id: string, fileName: string): Pick<DownloadOption, 'platform' | 'label' | 'detail' | 'fileType'> => {
  const fileType = inferFileType(fileName);
  if (id === 'mac-arm64') {
    return {
      platform: 'mac',
      label: 'macOS Apple Silicon',
      detail: 'Recommended for M1, M2, M3, and newer Macs',
      fileType,
    };
  }
  if (id === 'mac-x64') {
    return {
      platform: 'mac',
      label: 'macOS Intel',
      detail: 'For Intel-based Macs',
      fileType,
    };
  }
  if (id === 'windows-x64') {
    return {
      platform: 'windows',
      label: 'Windows x64',
      detail: 'Recommended for most Windows PCs',
      fileType,
    };
  }
  if (id === 'linux-deb') {
    return {
      platform: 'linux',
      label: 'Linux Debian/Ubuntu',
      detail: 'For Debian, Ubuntu, and compatible distributions',
      fileType,
    };
  }
  if (id === 'linux-rpm') {
    return {
      platform: 'linux',
      label: 'Linux Fedora/RHEL',
      detail: 'For Fedora, RHEL, and compatible distributions',
      fileType,
    };
  }
  return {
    platform: 'linux',
    label: fileName,
    detail: 'Additional KiJi package',
    fileType,
  };
};

const normalizeDownloadOption = (
  asset: ReleaseDownloadAsset,
  fallbackId: string,
  fallbackVersion: string
): DownloadOption => {
  const id = asset.id ?? fallbackId;
  const inferred = inferDownloadLabel(id, asset.fileName);
  return {
    id,
    platform: normalizePlatform(asset.platform) ?? inferred.platform,
    label: asset.label ?? inferred.label,
    detail: asset.detail ?? inferred.detail,
    version: asset.version ?? fallbackVersion,
    fileType: asset.fileType ?? inferred.fileType,
    url: asset.url,
  };
};

const downloadOptionsFromManifest = (manifest: ReleaseManifest): DownloadOption[] => {
  const assets = manifest.downloadOptions?.length
    ? manifest.downloadOptions.map((asset) => normalizeDownloadOption(asset, asset.id ?? asset.fileName, manifest.version))
    : Object.entries(manifest.downloads ?? {}).map(([key, asset]) => normalizeDownloadOption(asset, key, manifest.version));

  return assets
    .filter((asset) => asset.platform === 'mac')
    .sort((left, right) => {
      const leftIndex = DOWNLOAD_ORDER.indexOf(left.id);
      const rightIndex = DOWNLOAD_ORDER.indexOf(right.id);
      return (leftIndex === -1 ? Number.MAX_SAFE_INTEGER : leftIndex) - (rightIndex === -1 ? Number.MAX_SAFE_INTEGER : rightIndex);
    });
};

const useReleaseManifest = (enabled = true): ReleaseManifest => {
  const [manifest, setManifest] = useState<ReleaseManifest>(localReleaseManifest);

  useEffect(() => {
    if (!enabled) {
      return undefined;
    }

    const controller = new AbortController();

    const loadManifest = async (): Promise<void> => {
      try {
        const response = await fetch(DOWNLOAD_MANIFEST_URL, {
          cache: 'no-store',
          signal: controller.signal,
        });
        if (!response.ok) {
          throw new Error(`Release manifest request failed with ${response.status}`);
        }

        const nextManifest = await response.json() as ReleaseManifest;
        const options = downloadOptionsFromManifest(nextManifest);
        if (options.length === 0) {
          throw new Error('Release manifest did not include download options');
        }
        setManifest(nextManifest);
      } catch (error) {
        if (!controller.signal.aborted) {
          console.warn('Using bundled KiJi release manifest fallback.', error);
        }
      }
    };

    void loadManifest();

    return () => {
      controller.abort();
    };
  }, [enabled]);

  return manifest;
};

const detectRecommendedDownload = (options: DownloadOption[]): DownloadOption => {
  const userAgent = window.navigator.userAgent.toLowerCase();
  const platform = window.navigator.platform.toLowerCase();
  const isMac = userAgent.includes('mac') || platform.includes('mac');
  const isWindows = userAgent.includes('win') || platform.includes('win');
  const isLinux = userAgent.includes('linux') || platform.includes('linux');
  const isLikelyAppleSilicon = isMac && !userAgent.includes('intel') && !platform.includes('intel');

  if (isMac) {
    return options.find((option) => option.id === (isLikelyAppleSilicon ? 'mac-arm64' : 'mac-x64')) ?? options[0];
  }

  if (isWindows) {
    return options.find((option) => option.id === 'windows-x64') ?? options[0];
  }

  if (isLinux) {
    return options.find((option) => option.id === 'linux-deb') ?? options[0];
  }

  return options[0];
};

const getLocalizedDownloadOption = (option: DownloadOption, text: LocalizedText): Pick<DownloadOption, 'label' | 'detail'> => (
  text.downloadOptions[option.id] ?? { label: option.label, detail: option.detail }
);

function AppLogo({ className, variant = 'theme' }: { className?: string; variant?: LogoVariant }) {
  if (variant === 'dark') {
    return <img className={className} src="/images/kiji-logo-dark.png" alt="" aria-hidden="true" />;
  }

  if (variant === 'light') {
    return <img className={className} src="/images/kiji-logo.png" alt="" aria-hidden="true" />;
  }

  return (
    <picture>
      <source srcSet="/images/kiji-logo-dark.png" media="(prefers-color-scheme: dark)" />
      <img className={className} src="/images/kiji-logo.png" alt="" aria-hidden="true" />
    </picture>
  );
}

const useDismissibleDetails = () => {
  const detailsRef = useRef<HTMLDetailsElement | null>(null);

  useEffect(() => {
    const closeOnOutsideClick = (event: PointerEvent): void => {
      const detailsElement = detailsRef.current;
      if (!detailsElement?.open || !(event.target instanceof Node) || detailsElement.contains(event.target)) {
        return;
      }

      detailsElement.removeAttribute('open');
    };

    document.addEventListener('pointerdown', closeOnOutsideClick);
    return () => {
      document.removeEventListener('pointerdown', closeOnOutsideClick);
    };
  }, []);

  return detailsRef;
};

interface LanguageMenuProps {
  selectedLanguage: LanguageCode;
  text: LocalizedText['language'];
  onSelectLanguage: (language: LanguageCode) => void;
}

function LanguageMenu({ selectedLanguage, text, onSelectLanguage }: LanguageMenuProps) {
  const menuRef = useDismissibleDetails();
  const selectedOption = LANGUAGE_OPTIONS.find((option) => option.code === selectedLanguage) ?? LANGUAGE_OPTIONS[0];

  return (
    <details className="language-menu" ref={menuRef}>
      <summary className="language-trigger" aria-label={`${text.triggerAria}: ${selectedOption.shortLabel}`}>
        <svg className="language-icon" viewBox="0 0 24 24" aria-hidden="true">
          <circle cx="12" cy="12" r="9" />
          <path d="M3 12h18" />
          <path d="M12 3c2.4 2.4 3.6 5.4 3.6 9s-1.2 6.6-3.6 9c-2.4-2.4-3.6-5.4-3.6-9S9.6 5.4 12 3Z" />
        </svg>
        <span className="language-short">{selectedOption.shortLabel}</span>
      </summary>
      <div className="language-options">
        {LANGUAGE_OPTIONS.map((option) => (
          <button
            key={option.code}
            type="button"
            className={option.code === selectedLanguage ? 'language-option active' : 'language-option'}
            aria-pressed={option.code === selectedLanguage}
            aria-label={`${text.setAria} ${option.shortLabel}`}
            onClick={(event) => {
              onSelectLanguage(option.code);
              event.currentTarget.closest('details')?.removeAttribute('open');
            }}
          >
            <span>{option.shortLabel}</span>
          </button>
        ))}
      </div>
    </details>
  );
}

function Header({
  text,
  selectedLanguage,
  onSelectLanguage,
}: {
  text: LocalizedText;
  selectedLanguage: LanguageCode;
  onSelectLanguage: (language: LanguageCode) => void;
}) {
  return (
    <header className="shell nav">
      <a className="brand" href="/">
        <AppLogo className="brand-mark" />
        <span>KiJi</span>
      </a>
      <nav className="nav-links" aria-label={text.nav.aria}>
        <a href="/download/">{text.nav.download}</a>
        <a href="/resource/">{text.nav.resource}</a>
        <a href="/changelog/">{text.nav.changelog}</a>
        <a href="/feed.xml">{text.nav.rss}</a>
        <a href="/support/">{text.nav.support}</a>
        <LanguageMenu selectedLanguage={selectedLanguage} text={text.language} onSelectLanguage={onSelectLanguage} />
      </nav>
    </header>
  );
}

function Footer({ text }: { text: LocalizedText }) {
  return (
    <footer className="shell footer">
      <span>KiJi</span>
      <span className="footer-links">
        <a href="/privacy/">{text.footer.privacy}</a> · <a href="/support/">{text.footer.support}</a> · <a href="/resource/">{text.footer.resource}</a> · <a href="/llms.txt">llms.txt</a> ·
        <a className="github-link" href={YOMILAB_GITHUB_URL} target="_blank" rel="noreferrer" aria-label={`${text.footer.github}: KiJi open repositories`}>
          <svg className="github-icon" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M12 2C6.48 2 2 6.58 2 12.24c0 4.52 2.87 8.35 6.84 9.7.5.1.68-.22.68-.49v-1.72c-2.78.62-3.37-1.38-3.37-1.38-.45-1.18-1.11-1.49-1.11-1.49-.91-.64.07-.62.07-.62 1 .07 1.53 1.06 1.53 1.06.9 1.57 2.35 1.12 2.92.86.09-.67.35-1.12.64-1.38-2.22-.26-4.55-1.14-4.55-5.06 0-1.12.39-2.03 1.03-2.75-.1-.26-.45-1.3.1-2.71 0 0 .84-.28 2.75 1.05A9.36 9.36 0 0 1 12 6.96c.85 0 1.7.12 2.5.35 1.9-1.33 2.74-1.05 2.74-1.05.55 1.41.2 2.45.1 2.71.64.72 1.03 1.63 1.03 2.75 0 3.93-2.34 4.8-4.57 5.05.36.32.68.94.68 1.9v2.78c0 .27.18.59.69.49A10.18 10.18 0 0 0 22 12.24C22 6.58 17.52 2 12 2Z" />
          </svg>
          <span>{text.footer.github}</span>
        </a>
      </span>
    </footer>
  );
}

function HomePage({ text }: { text: LocalizedText }) {
  return (
    <>
      <main className="shell">
        <section className="hero" id="top">
          <p className="eyebrow">{text.home.eyebrow}</p>
          <h1>{text.home.title}</h1>
          <p className="lead">
            {text.home.lead}
          </p>
          <div className="actions">
            <a className="button primary" href="/download/">{text.home.downloadCta}</a>
            <a className="button" href="/feed.xml">{text.home.subscribeCta}</a>
          </div>
        </section>

        <section className="grid" aria-label={text.home.featuresAria}>
          <article className="card" id="privacy">
            <h2>{text.home.privacyTitle}</h2>
            <p className="muted">{text.home.privacyText}</p>
          </article>
          <article className="card" id="opml-directory">
            <h2>{text.home.feedsTitle}</h2>
            <p className="muted">{text.home.feedsText}</p>
            <a href={OPML_DIRECTORY_URL}>{text.home.opmlLink}</a>
          </article>
          <article className="card" id="pro">
            <h2>{text.home.simpleTitle}</h2>
            <p className="muted">{text.home.simpleText}</p>
          </article>
          <article className="card" id="downloads">
            <h2>{text.home.downloadsTitle}</h2>
            <p className="muted">{text.home.downloadsText}</p>
          </article>
        </section>
      </main>
      <Footer text={text} />
    </>
  );
}

function DownloadPage({ text }: { text: LocalizedText }) {
  const downloadMenuRef = useDismissibleDetails();
  const releaseManifest = useReleaseManifest(!DOWNLOADS_UNDER_DEVELOPMENT);
  const downloadOptions = useMemo(() => downloadOptionsFromManifest(releaseManifest), [releaseManifest]);
  const recommendedDownload = useMemo(
    () => (downloadOptions.length > 0 ? detectRecommendedDownload(downloadOptions) : null),
    [downloadOptions]
  );
  const [selectedDownloadId, setSelectedDownloadId] = useState<string | null>(null);
  const selectedDownload = recommendedDownload
    ? downloadOptions.find((option) => option.id === selectedDownloadId) ?? recommendedDownload
    : null;
  const selectedDownloadText = selectedDownload ? getLocalizedDownloadOption(selectedDownload, text) : null;

  useEffect(() => {
    if (recommendedDownload && (!selectedDownloadId || !downloadOptions.some((option) => option.id === selectedDownloadId))) {
      setSelectedDownloadId(recommendedDownload.id);
    }
  }, [downloadOptions, recommendedDownload, selectedDownloadId]);

  if (DOWNLOADS_UNDER_DEVELOPMENT || !selectedDownload || !selectedDownloadText) {
    return (
      <main className="shell hero">
        <p className="eyebrow">{text.download.eyebrow}</p>
        <h1>{text.download.title}</h1>
        <p className="lead">{text.download.lead}</p>
        <div className="actions">
          <a className="button" href="/feed.xml">{text.download.releaseRss}</a>
        </div>
      </main>
    );
  }

  return (
    <main className="shell hero">
      <p className="eyebrow">{text.download.eyebrow}</p>
      <h1>{text.download.title}</h1>
      <p className="lead">{text.download.lead}</p>
      <div className="download-panel">
        <div className="split-download" aria-label={text.download.panelAria}>
          <a className="download-primary" href={selectedDownload.url}>
            <span className="download-kicker">{text.download.kicker}</span>
            <strong>{selectedDownloadText.label}</strong>
            <span>KiJi {selectedDownload.version} · {selectedDownload.fileType}</span>
          </a>
          <details className="download-menu" ref={downloadMenuRef}>
            <summary aria-label={text.download.chooseAria}>⌄</summary>
            <div className="download-options">
              {downloadOptions.map((option) => {
                const optionText = getLocalizedDownloadOption(option, text);
                return (
                  <button
                    key={option.id}
                    type="button"
                    className={option.id === selectedDownload.id ? 'download-option active' : 'download-option'}
                    onClick={(event) => {
                      setSelectedDownloadId(option.id);
                      event.currentTarget.closest('details')?.removeAttribute('open');
                    }}
                  >
                    <span>{optionText.label}</span>
                    <small>KiJi {option.version} · {option.fileType} · {optionText.detail}</small>
                  </button>
                );
              })}
            </div>
          </details>
        </div>
        <p className="muted download-note">
          {text.download.directUrl} <a href={selectedDownload.url}>{selectedDownload.url}</a>
        </p>
      </div>
      <div className="actions">
        <a className="button" href={releaseManifest.checksumsUrl ?? DEFAULT_CHECKSUMS_URL}>{text.download.checksums}</a>
        <a className="button" href="/feed.xml">{text.download.releaseRss}</a>
      </div>
    </main>
  );
}

function ChangelogPage({ text }: { text: LocalizedText }) {
  return (
    <main className="shell hero">
      <p className="eyebrow">{text.changelog.eyebrow}</p>
      <h1>{text.changelog.title}</h1>
      <p className="lead">{text.changelog.lead}</p>
      <a className="button" href="/feed.xml">{text.changelog.rssCta}</a>
    </main>
  );
}

function ResourcePage({ text }: { text: LocalizedText }) {
  return (
    <main className="shell hero">
      <p className="eyebrow">{text.resource.eyebrow}</p>
      <h1>{text.resource.title}</h1>
      <p className="lead">
        {text.resource.lead}
      </p>
      <div className="actions">
        <a className="button primary" href="/downloads/kiji-app-logos.zip" download>{text.resource.downloadPack}</a>
        <a className="button" href="/images/kiji-logo.png" download>{text.resource.downloadLight}</a>
      </div>
      <section className="logo-grid" aria-label={text.resource.gridAria}>
        {LOGO_DOWNLOADS.map((asset) => {
          const assetText = text.logoDownloads[asset.id];
          return (
            <article className="logo-card" key={asset.id}>
              <div className="logo-preview">
                <AppLogo variant={asset.previewVariant} />
              </div>
              <div>
                <h2>{assetText.title}</h2>
                <p className="muted">{assetText.detail}</p>
              </div>
              <a className="button" href={asset.href} download>
                {text.resource.downloadPrefix} {asset.fileType}
              </a>
            </article>
          );
        })}
      </section>
    </main>
  );
}

function PrivacyPage({ text }: { text: LocalizedText }) {
  return (
    <main className="shell hero">
      <p className="eyebrow">{text.privacy.eyebrow}</p>
      <h1>{text.privacy.title}</h1>
      <p className="lead">{text.privacy.lead}</p>
    </main>
  );
}

function SupportPage({ text }: { text: LocalizedText }) {
  return (
    <main className="shell hero">
      <p className="eyebrow">{text.support.eyebrow}</p>
      <h1>{text.support.title}</h1>
      <p className="lead">
        {text.support.leadPrefix} <a href="mailto:hello@yomilab.app">hello@yomilab.app</a>. {text.support.leadSuffix}
      </p>
    </main>
  );
}

export default function App() {
  const page = getPageKey();
  const [selectedLanguage, setSelectedLanguage] = useState<LanguageCode>(readStoredLanguage);
  const text = TEXT[selectedLanguage];

  usePageMeta(page, selectedLanguage);

  useEffect(() => {
    window.localStorage.setItem(LANGUAGE_STORAGE_KEY, selectedLanguage);
  }, [selectedLanguage]);

  return (
    <>
      <Header text={text} selectedLanguage={selectedLanguage} onSelectLanguage={setSelectedLanguage} />
      {page === 'home' && <HomePage text={text} />}
      {page === 'download' && <DownloadPage text={text} />}
      {page === 'resource' && <ResourcePage text={text} />}
      {page === 'changelog' && <ChangelogPage text={text} />}
      {page === 'privacy' && <PrivacyPage text={text} />}
      {page === 'support' && <SupportPage text={text} />}
      {page !== 'home' && <Footer text={text} />}
    </>
  );
}
