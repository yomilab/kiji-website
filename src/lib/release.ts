import type { DownloadOption, DownloadPlatform } from '../i18n/types';

export interface ReleaseDownloadAsset {
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

export interface ReleaseManifest {
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

export interface ReleaseEntry {
  version: string;
  tag?: string;
  date?: string;
  notesUrl?: string;
}

export const DOWNLOAD_MANIFEST_URL = '/release.json';

export const DOWNLOAD_ORDER = [
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

export const formatVersionedCopy = (template: string, version: string): string => (
  template.replaceAll('{version}', version)
);

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

export const downloadOptionsFromManifest = (manifest: ReleaseManifest): DownloadOption[] => {
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

export const DEFAULT_DOWNLOAD_ID = 'mac-arm64';

export const detectRecommendedDownload = (options: DownloadOption[]): DownloadOption | undefined => {
  const defaultDownload = options.find((option) => option.id === DEFAULT_DOWNLOAD_ID) ?? options[0];
  if (typeof window === 'undefined') {
    return defaultDownload;
  }

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
