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
const DOWNLOAD_MANIFEST_URL = '/release.json';
const YOMILAB_GITHUB_URL = 'https://github.com/yomilab';
const DOWNLOAD_ORDER = [
  'mac-arm64',
  'mac-x64',
  'mac-arm64-zip',
  'mac-x64-zip',
  'windows-x64',
  'windows-arm64',
  'windows-x64-setup',
  'windows-arm64-setup',
  'linux-x86_64-appimage',
  'linux-x86_64-deb',
  'linux-x86_64-rpm',
  'linux-aarch64-appimage',
  'linux-aarch64-deb',
  'linux-aarch64-rpm',
];
const DOWNLOADS_UNDER_DEVELOPMENT = false;
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

const DEFAULT_CHECKSUMS_URL = localReleaseManifest.checksumsUrl ?? localReleaseManifest.notesUrl ?? 'https://github.com/yomilab/kiji-app/releases/latest';

const resolveReleaseVersion = (manifest: ReleaseManifest): string => (
  manifest.version ?? localReleaseManifest.version ?? '1.0.0'
);

const formatVersionedCopy = (template: string, version: string): string => (
  template.replaceAll('{version}', version)
);

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
        title: 'KiJi - A simple, modern RSS reader.',
        description: 'A simple, modern RSS reader with stations, Defuddle/Readability extraction, and Markdown sync.',
        canonicalPath: '/',
      },
      download: {
        title: 'Download KiJi',
        description: 'Download KiJi {version} for macOS, Windows, and Linux from GitHub Releases.',
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
      brandTagline: 'A simple, modern RSS reader.',
      productHeading: 'Product',
      legalHeading: 'Legal',
      disclaimer: '© 2026 KiJi by Yomi Lab. All processing is local.',
      privacy: 'Privacy',
      support: 'Feedback',
      resource: 'Resource',
      github: 'YomiLab GitHub',
      llms: 'llms.txt',
    },
    language: {
      triggerAria: 'Language',
      setAria: 'Set language to',
    },
    home: {
      eyebrow: 'Open source · v{version}',
      title: 'A simple, modern RSS reader.',
      lead: 'Feeds, articles, and reading state are stored on your device. KiJi groups feeds into stations, extracts article text with Defuddle and Readability, and syncs articles to disk as Markdown.',
      downloadCta: 'Download KiJi',
      subscribeCta: 'Subscribe to updates',
      heroShotAlt: 'Article list with stations sidebar',
      featuresAria: 'Product highlights',
      privacyTitle: 'Local-only',
      privacyText: 'No account, no server. All data is stored in a local SQLite database.',
      feedsTitle: 'Stations',
      feedsText: 'Feeds are grouped by tags into stations. Views switch between unread and saved; there is no algorithmic timeline.',
      opmlLink: 'Browse feed collections',
      readingTitle: 'Reader mode',
      readingText: 'Two extraction engines, Defuddle and Readability, convert full page HTML into clean article text.',
      readerShotAlt: 'Reader mode',
      simpleTitle: 'Markdown sync',
      simpleText: 'Saved articles are written to a local folder as Markdown files.',
      closingTitle: 'Native builds for macOS, Windows, and Linux.',
      closingText: 'Free and open source.',
    },
    download: {
      eyebrow: 'Downloads',
      title: 'Get KiJi {version} for your desktop.',
      lead: 'Choose the installer for your platform. KiJi ships native Tauri builds for macOS, Windows, and Linux on x64 and ARM64 where supported.',
      panelAria: 'Download KiJi',
      kicker: 'Download recommended build',
      chooseAria: 'Choose another download',
      directUrl: 'Direct release asset URL:',
      checksums: 'GitHub release',
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
      lead: 'KiJi stores feeds, articles, saved items, and reading state locally. Export when needed.',
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
      'mac-arm64-zip': { label: 'macOS Apple Silicon', detail: 'Portable .app archive' },
      'mac-x64-zip': { label: 'macOS Intel', detail: 'Portable .app archive' },
      'windows-x64': { label: 'Windows x64', detail: 'Recommended for most Windows PCs' },
      'windows-arm64': { label: 'Windows ARM64', detail: 'For ARM-based Windows devices' },
      'windows-x64-setup': { label: 'Windows x64', detail: 'NSIS installer executable' },
      'windows-arm64-setup': { label: 'Windows ARM64', detail: 'NSIS installer executable' },
      'linux-x86_64-appimage': { label: 'Linux x64', detail: 'Portable AppImage for most Linux desktops' },
      'linux-x86_64-deb': { label: 'Linux x64 Debian/Ubuntu', detail: 'For Debian, Ubuntu, and compatible distributions' },
      'linux-x86_64-rpm': { label: 'Linux x64 Fedora/RHEL', detail: 'For Fedora, RHEL, and compatible distributions' },
      'linux-aarch64-appimage': { label: 'Linux ARM64', detail: 'Portable AppImage for ARM64 Linux' },
      'linux-aarch64-deb': { label: 'Linux ARM64 Debian/Ubuntu', detail: 'For ARM64 Debian, Ubuntu, and compatible distributions' },
      'linux-aarch64-rpm': { label: 'Linux ARM64 Fedora/RHEL', detail: 'For ARM64 Fedora, RHEL, and compatible distributions' },
      'linux-deb': { label: 'Linux Debian/Ubuntu', detail: 'For Debian, Ubuntu, and compatible distributions' },
      'linux-rpm': { label: 'Linux Fedora/RHEL', detail: 'For Fedora, RHEL, and compatible distributions' },
    },
  },
  'zh-Hans': {
    pageMeta: {
      home: {
        title: 'KiJi - 简单现代的 RSS 阅读器。',
        description: '简单现代的 RSS 阅读器，支持站点分组、Defuddle/Readability 正文提取和 Markdown 同步。',
        canonicalPath: '/',
      },
      download: {
        title: '下载 KiJi',
        description: '从 GitHub Releases 下载适用于 macOS、Windows 和 Linux 的 KiJi {version}。',
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
      brandTagline: '简单现代的 RSS 阅读器。',
      productHeading: '产品',
      legalHeading: '法律与支持',
      disclaimer: '© 2026 KiJi by Yomi Lab。所有处理均在本地完成。',
      privacy: '隐私',
      support: '反馈',
      resource: '资源',
      github: 'YomiLab GitHub',
      llms: 'llms.txt',
    },
    language: {
      triggerAria: '语言',
      setAria: '切换语言到',
    },
    home: {
      eyebrow: '开源 · v{version}',
      title: '简单现代的 RSS 阅读器。',
      lead: '订阅、文章与阅读状态均保存在你的设备上。KiJi 将订阅按标签分组为站点，使用 Defuddle 和 Readability 提取正文，并将文章以 Markdown 同步到磁盘。',
      downloadCta: '下载 KiJi',
      subscribeCta: '订阅更新',
      heroShotAlt: '带站点侧栏的文章列表',
      featuresAria: '产品亮点',
      privacyTitle: '纯本地',
      privacyText: '无需账号，没有服务器。所有数据存储在本地 SQLite 数据库中。',
      feedsTitle: '站点',
      feedsText: '订阅按标签分组为站点；视图在未读与已保存之间切换——没有算法时间线。',
      opmlLink: '浏览订阅合集',
      readingTitle: '阅读模式',
      readingText: 'Defuddle 和 Readability 两个提取引擎，将完整网页 HTML 转换为干净的正文。',
      readerShotAlt: '阅读模式',
      simpleTitle: 'Markdown 同步',
      simpleText: '保存的文章会以 Markdown 文件写入本地文件夹。',
      closingTitle: '提供 macOS、Windows 和 Linux 原生构建。',
      closingText: '免费开源。',
    },
    download: {
      eyebrow: '下载',
      title: '为你的桌面获取 KiJi {version}。',
      lead: '选择适合你平台的安装包。KiJi 提供 macOS、Windows 和 Linux 的原生 Tauri 构建，并在支持的平台提供 x64 与 ARM64 版本。',
      panelAria: '下载 KiJi',
      kicker: '下载推荐版本',
      chooseAria: '选择其他下载',
      directUrl: '直接发布资源地址：',
      checksums: 'GitHub 发布页',
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
      lead: 'KiJi 在本地存储订阅、文章、收藏与阅读状态。需要时可导出。',
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
      'mac-arm64-zip': { label: 'macOS Apple Silicon', detail: '便携 .app 压缩包' },
      'mac-x64-zip': { label: 'macOS Intel', detail: '便携 .app 压缩包' },
      'windows-x64': { label: 'Windows x64', detail: '推荐用于大多数 Windows 电脑' },
      'windows-arm64': { label: 'Windows ARM64', detail: '适用于 ARM 架构 Windows 设备' },
      'windows-x64-setup': { label: 'Windows x64', detail: 'NSIS 安装程序' },
      'windows-arm64-setup': { label: 'Windows ARM64', detail: 'NSIS 安装程序' },
      'linux-x86_64-appimage': { label: 'Linux x64', detail: '适用于大多数 Linux 桌面的便携 AppImage' },
      'linux-x86_64-deb': { label: 'Linux x64 Debian/Ubuntu', detail: '用于 Debian、Ubuntu 和兼容发行版' },
      'linux-x86_64-rpm': { label: 'Linux x64 Fedora/RHEL', detail: '用于 Fedora、RHEL 和兼容发行版' },
      'linux-aarch64-appimage': { label: 'Linux ARM64', detail: '适用于 ARM64 Linux 的便携 AppImage' },
      'linux-aarch64-deb': { label: 'Linux ARM64 Debian/Ubuntu', detail: '用于 ARM64 Debian、Ubuntu 和兼容发行版' },
      'linux-aarch64-rpm': { label: 'Linux ARM64 Fedora/RHEL', detail: '用于 ARM64 Fedora、RHEL 和兼容发行版' },
      'linux-deb': { label: 'Linux Debian/Ubuntu', detail: '用于 Debian、Ubuntu 和兼容发行版' },
      'linux-rpm': { label: 'Linux Fedora/RHEL', detail: '用于 Fedora、RHEL 和兼容发行版' },
    },
  },
  ja: {
    pageMeta: {
      home: {
        title: 'KiJi - シンプルでモダンなRSSリーダー。',
        description: 'シンプルでモダンなRSSリーダー。ステーション、Defuddle/Readabilityによる本文抽出、Markdown同期。',
        canonicalPath: '/',
      },
      download: {
        title: 'KiJiをダウンロード',
        description: 'GitHub Releases から macOS、Windows、Linux 向け KiJi {version} をダウンロードできます。',
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
      brandTagline: 'シンプルでモダンなRSSリーダー。',
      productHeading: '製品',
      legalHeading: '法務とサポート',
      disclaimer: '© 2026 KiJi by Yomi Lab。すべての処理はローカルで行われます。',
      privacy: 'プライバシー',
      support: 'フィードバック',
      resource: 'リソース',
      github: 'YomiLab GitHub',
      llms: 'llms.txt',
    },
    language: {
      triggerAria: '言語',
      setAria: '言語を変更',
    },
    home: {
      eyebrow: 'オープンソース · v{version}',
      title: 'シンプルでモダンなRSSリーダー。',
      lead: 'フィード、記事、読書状態はすべてお使いのデバイスに保存されます。KiJi はフィードをタグでステーションに分類し、Defuddle と Readability で本文を抽出し、記事を Markdown としてディスクに同期します。',
      downloadCta: 'KiJiをダウンロード',
      subscribeCta: '更新を購読',
      heroShotAlt: 'ステーションサイドバー付き記事リスト',
      featuresAria: '製品の特徴',
      privacyTitle: 'ローカル専用',
      privacyText: 'アカウント不要、サーバーなし。すべてのデータはローカルの SQLite データベースに保存されます。',
      feedsTitle: 'ステーション',
      feedsText: 'フィードをタグでステーションに分類。未読と保存済みのビューを切替——アルゴリズムのタイムラインはありません。',
      opmlLink: 'フィードコレクションを見る',
      readingTitle: 'リーダーモード',
      readingText: 'Defuddle と Readability の2つの抽出エンジンが、ページ全体のHTMLをクリーンな本文に変換します。',
      readerShotAlt: 'リーダーモード',
      simpleTitle: 'Markdown同期',
      simpleText: '保存した記事は Markdown ファイルとしてローカルフォルダに書き出されます。',
      closingTitle: 'macOS、Windows、Linux 向けネイティブビルド。',
      closingText: '無料のオープンソース。',
    },
    download: {
      eyebrow: 'ダウンロード',
      title: 'デスクトップ向け KiJi {version} を入手。',
      lead: 'お使いのプラットフォーム向けインストーラーを選んでください。KiJi は macOS、Windows、Linux 向けのネイティブ Tauri ビルドを提供し、対応環境では x64 と ARM64 をサポートします。',
      panelAria: 'KiJiをダウンロード',
      kicker: 'おすすめビルドをダウンロード',
      chooseAria: '別のダウンロードを選択',
      directUrl: '直接リリースアセットURL:',
      checksums: 'GitHubリリース',
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
      lead: 'KiJiはフィード、記事、保存項目、読書状態をローカルに保存します。必要ならエクスポートできます。',
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
      'mac-arm64-zip': { label: 'macOS Apple Silicon', detail: 'ポータブル .app アーカイブ' },
      'mac-x64-zip': { label: 'macOS Intel', detail: 'ポータブル .app アーカイブ' },
      'windows-x64': { label: 'Windows x64', detail: 'ほとんどのWindows PCにおすすめ' },
      'windows-arm64': { label: 'Windows ARM64', detail: 'ARMベースのWindowsデバイス向け' },
      'windows-x64-setup': { label: 'Windows x64', detail: 'NSISインストーラー' },
      'windows-arm64-setup': { label: 'Windows ARM64', detail: 'NSISインストーラー' },
      'linux-x86_64-appimage': { label: 'Linux x64', detail: '多くのLinuxデスクトップ向けポータブルAppImage' },
      'linux-x86_64-deb': { label: 'Linux x64 Debian/Ubuntu', detail: 'Debian、Ubuntu、互換ディストリビューション向け' },
      'linux-x86_64-rpm': { label: 'Linux x64 Fedora/RHEL', detail: 'Fedora、RHEL、互換ディストリビューション向け' },
      'linux-aarch64-appimage': { label: 'Linux ARM64', detail: 'ARM64 Linux向けポータブルAppImage' },
      'linux-aarch64-deb': { label: 'Linux ARM64 Debian/Ubuntu', detail: 'ARM64 Debian、Ubuntu、互換ディストリビューション向け' },
      'linux-aarch64-rpm': { label: 'Linux ARM64 Fedora/RHEL', detail: 'ARM64 Fedora、RHEL、互換ディストリビューション向け' },
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

const usePageMeta = (page: PageKey, language: LanguageCode, releaseVersion: string): void => {
  useEffect(() => {
    const meta = TEXT[language].pageMeta[page];
    const description = page === 'download'
      ? formatVersionedCopy(meta.description, releaseVersion)
      : meta.description;
    document.documentElement.lang = language;
    document.title = meta.title;
    setMetaContent('meta[name="description"]', description);
    setMetaContent('meta[property="og:title"]', meta.title);
    setMetaContent('meta[property="og:description"]', description);

    const canonical = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (canonical) {
      canonical.href = `https://kiji.yomilab.app${meta.canonicalPath}`;
    }
  }, [language, page, releaseVersion]);
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
  if (id === 'mac-arm64' || id === 'mac-arm64-zip') {
    return {
      platform: 'mac',
      label: 'macOS Apple Silicon',
      detail: id.endsWith('-zip') ? 'Portable .app archive' : 'Recommended for M1, M2, M3, and newer Macs',
      fileType,
    };
  }
  if (id === 'mac-x64' || id === 'mac-x64-zip') {
    return {
      platform: 'mac',
      label: 'macOS Intel',
      detail: id.endsWith('-zip') ? 'Portable .app archive' : 'For Intel-based Macs',
      fileType,
    };
  }
  if (id === 'windows-x64' || id === 'windows-x64-setup') {
    return {
      platform: 'windows',
      label: 'Windows x64',
      detail: 'Recommended for most Windows PCs',
      fileType,
    };
  }
  if (id === 'windows-arm64' || id === 'windows-arm64-setup') {
    return {
      platform: 'windows',
      label: 'Windows ARM64',
      detail: 'For ARM-based Windows devices',
      fileType,
    };
  }
  if (id.startsWith('linux-x86_64') || id === 'linux-deb') {
    return {
      platform: 'linux',
      label: id.includes('rpm') ? 'Linux x64 Fedora/RHEL' : id.includes('appimage') ? 'Linux x64' : 'Linux x64 Debian/Ubuntu',
      detail: id.includes('rpm')
        ? 'For Fedora, RHEL, and compatible distributions'
        : id.includes('appimage')
          ? 'Portable AppImage for most Linux desktops'
          : 'For Debian, Ubuntu, and compatible distributions',
      fileType,
    };
  }
  if (id.startsWith('linux-aarch64')) {
    return {
      platform: 'linux',
      label: id.includes('rpm') ? 'Linux ARM64 Fedora/RHEL' : id.includes('appimage') ? 'Linux ARM64' : 'Linux ARM64 Debian/Ubuntu',
      detail: id.includes('rpm')
        ? 'For ARM64 Fedora, RHEL, and compatible distributions'
        : id.includes('appimage')
          ? 'Portable AppImage for ARM64 Linux'
          : 'For ARM64 Debian, Ubuntu, and compatible distributions',
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

const DEFAULT_DOWNLOAD_ID = 'mac-arm64';

const detectRecommendedDownload = (options: DownloadOption[]): DownloadOption => {
  const defaultDownload = options.find((option) => option.id === DEFAULT_DOWNLOAD_ID) ?? options[0];
  const userAgent = window.navigator.userAgent.toLowerCase();
  const platform = window.navigator.platform.toLowerCase();
  const isMac = userAgent.includes('mac') || platform.includes('mac');
  const isWindows = userAgent.includes('win') || platform.includes('win');
  const isLinux = userAgent.includes('linux') || platform.includes('linux');
  const isLikelyArm = userAgent.includes('arm') || platform.includes('arm') || userAgent.includes('aarch64');

  // Apple Silicon Macs often report platform "MacIntel" for web compatibility.
  if (isMac) {
    return defaultDownload;
  }

  if (isWindows) {
    return options.find((option) => option.id === (isLikelyArm ? 'windows-arm64' : 'windows-x64')) ?? defaultDownload;
  }

  if (isLinux) {
    return options.find((option) => option.id === (isLikelyArm ? 'linux-aarch64-appimage' : 'linux-x86_64-appimage'))
      ?? options.find((option) => option.id === 'linux-x86_64-deb')
      ?? defaultDownload;
  }

  return defaultDownload;
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

const useScrolled = (): boolean => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = (): void => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return scrolled;
};

function Header({
  text,
  selectedLanguage,
  onSelectLanguage,
}: {
  text: LocalizedText;
  selectedLanguage: LanguageCode;
  onSelectLanguage: (language: LanguageCode) => void;
}) {
  const scrolled = useScrolled();

  return (
    <header className={scrolled ? 'site-nav scrolled' : 'site-nav'}>
      <div className="shell nav-inner">
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
      </div>
    </header>
  );
}

function Footer({ text }: { text: LocalizedText }) {
  return (
    <footer className="shell footer">
      <div className="footer-grid">
        <div className="footer-brand">
          <div className="footer-brand-name">KiJi</div>
          <p>{text.footer.brandTagline}</p>
        </div>
        <div className="footer-col">
          <h4>{text.footer.productHeading}</h4>
          <a href="/download/">{text.nav.download}</a>
          <a href="/changelog/">{text.nav.changelog}</a>
          <a href="/resource/">{text.nav.resource}</a>
          <a href="/feed.xml">{text.nav.rss}</a>
        </div>
        <div className="footer-col">
          <h4>{text.footer.legalHeading}</h4>
          <a href="/privacy/">{text.footer.privacy}</a>
          <a href="/support/">{text.footer.support}</a>
          <a href="/llms.txt">{text.footer.llms}</a>
          <a className="github-link" href={YOMILAB_GITHUB_URL} target="_blank" rel="noreferrer" aria-label={`${text.footer.github}: KiJi open repositories`}>
            <svg className="github-icon" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M12 2C6.48 2 2 6.58 2 12.24c0 4.52 2.87 8.35 6.84 9.7.5.1.68-.22.68-.49v-1.72c-2.78.62-3.37-1.38-3.37-1.38-.45-1.18-1.11-1.49-1.11-1.49-.91-.64.07-.62.07-.62 1 .07 1.53 1.06 1.53 1.06.9 1.57 2.35 1.12 2.92.86.09-.67.35-1.12.64-1.38-2.22-.26-4.55-1.14-4.55-5.06 0-1.12.39-2.03 1.03-2.75-.1-.26-.45-1.3.1-2.71 0 0 .84-.28 2.75 1.05A9.36 9.36 0 0 1 12 6.96c.85 0 1.7.12 2.5.35 1.9-1.33 2.74-1.05 2.74-1.05.55 1.41.2 2.45.1 2.71.64.72 1.03 1.63 1.03 2.75 0 3.93-2.34 4.8-4.57 5.05.36.32.68.94.68 1.9v2.78c0 .27.18.59.69.49A10.18 10.18 0 0 0 22 12.24C22 6.58 17.52 2 12 2Z" />
            </svg>
            <span>{text.footer.github}</span>
          </a>
        </div>
      </div>
      <p className="footer-bottom">{text.footer.disclaimer}</p>
    </footer>
  );
}

const useRevealOnScroll = (): void => {
  useEffect(() => {
    const elements = Array.from(document.querySelectorAll<HTMLElement>('[data-reveal]'));
    if (elements.length === 0) return undefined;

    if (!('IntersectionObserver' in window)) {
      elements.forEach((element) => element.classList.add('revealed'));
      return undefined;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('revealed');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 }
    );

    elements.forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, []);
};

function CardIcon({ children }: { children: React.ReactNode }) {
  return (
    <svg className="card-icon" viewBox="0 0 24 24" aria-hidden="true">
      {children}
    </svg>
  );
}

function ShotImage({ base, alt, className }: { base: string; alt: string; className?: string }) {
  return (
    <picture>
      <source media="(prefers-color-scheme: dark)" srcSet={`${base}-dark.png`} />
      <img className={className} src={`${base}-light.png`} alt={alt} loading="lazy" />
    </picture>
  );
}

function ShotWindow({ base, alt }: { base: string; alt: string }) {
  return (
    <figure className="shot-window">
      <ShotImage base={base} alt={alt} />
    </figure>
  );
}

function HomePage({ text, releaseVersion }: { text: LocalizedText; releaseVersion: string }) {
  return (
    <>
      <main className="shell">
        <section className="hero home-hero" id="top">
          <div className="hero-copy">
            <p className="eyebrow">{formatVersionedCopy(text.home.eyebrow, releaseVersion)}</p>
            <h1>{text.home.title}</h1>
            <p className="lead">{text.home.lead}</p>
            <div className="actions">
              <a className="button primary" href="/download/">{text.home.downloadCta}</a>
              <a className="button" href="/feed.xml">{text.home.subscribeCta}</a>
            </div>
          </div>
          <ShotWindow base="/images/screenshots/preview-article-list" alt={text.home.heroShotAlt} />
        </section>

        <section className="bento" aria-label={text.home.featuresAria}>
          <article className="card feature-large" id="reading" data-reveal>
            <div>
              <CardIcon>
                <path d="M4 5a2 2 0 0 1 2-2h13v18H6a2 2 0 0 0-2 2Z" />
                <path d="M4 19a2 2 0 0 1 2-2h13" />
                <path d="M9 8h6M9 12h6" />
              </CardIcon>
              <h2>{text.home.readingTitle}</h2>
              <p className="muted">{text.home.readingText}</p>
            </div>
            <ShotImage
              base="/images/screenshots/preview-reader-mode"
              alt={text.home.readerShotAlt}
            />
          </article>
          <article className="card" id="privacy" data-reveal>
            <CardIcon>
              <rect x="5" y="11" width="14" height="9" rx="2" />
              <path d="M8 11V8a4 4 0 0 1 8 0v3" />
            </CardIcon>
            <h2>{text.home.privacyTitle}</h2>
            <p className="muted">{text.home.privacyText}</p>
          </article>
          <article className="card" id="opml-directory" data-reveal>
            <CardIcon>
              <path d="M4 4h6l10 10-6 6L4 10Z" />
              <circle cx="9" cy="9" r="1.5" />
            </CardIcon>
            <h2>{text.home.feedsTitle}</h2>
            <p className="muted">{text.home.feedsText}</p>
            <a href={OPML_DIRECTORY_URL}>{text.home.opmlLink}</a>
          </article>
          <article className="card feature-wide" id="pro" data-reveal>
            <CardIcon>
              <path d="M6 3h8l4 4v14H6Z" />
              <path d="M14 3v4h4" />
              <path d="M12 11v5M12 16l-2.5-2.5M12 16l2.5-2.5" />
            </CardIcon>
            <h2>{text.home.simpleTitle}</h2>
            <p className="muted">{text.home.simpleText}</p>
          </article>
        </section>

        <section className="closing" data-reveal>
          <h2>{text.home.closingTitle}</h2>
          <p className="muted">{text.home.closingText}</p>
          <div className="actions">
            <a className="button primary" href="/download/">{text.home.downloadCta}</a>
          </div>
        </section>
      </main>
      <Footer text={text} />
    </>
  );
}

function DownloadPage({ text, releaseVersion }: { text: LocalizedText; releaseVersion: string }) {
  const downloadTitle = formatVersionedCopy(text.download.title, releaseVersion);
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
        <h1>{downloadTitle}</h1>
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
      <h1>{downloadTitle}</h1>
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
  const releaseManifest = useReleaseManifest(!DOWNLOADS_UNDER_DEVELOPMENT);
  const releaseVersion = resolveReleaseVersion(releaseManifest);

  usePageMeta(page, selectedLanguage, releaseVersion);
  useRevealOnScroll();

  useEffect(() => {
    window.localStorage.setItem(LANGUAGE_STORAGE_KEY, selectedLanguage);
  }, [selectedLanguage]);

  return (
    <>
      <Header text={text} selectedLanguage={selectedLanguage} onSelectLanguage={setSelectedLanguage} />
      {page === 'home' && <HomePage text={text} releaseVersion={releaseVersion} />}
      {page === 'download' && <DownloadPage text={text} releaseVersion={releaseVersion} />}
      {page === 'resource' && <ResourcePage text={text} />}
      {page === 'changelog' && <ChangelogPage text={text} />}
      {page === 'privacy' && <PrivacyPage text={text} />}
      {page === 'support' && <SupportPage text={text} />}
      {page !== 'home' && <Footer text={text} />}
    </>
  );
}
