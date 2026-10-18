// Schema.org JSON-LD shared by the home and download pages.
// Only facts the site already states: free, desktop platforms, version from the
// release manifest, publisher Yomi Lab. No ratings or reviews.
import { localePath, type LanguageCode } from '../i18n';

const SITE = 'https://kiji.yomilab.app';
export const ORGANIZATION_ID = `${SITE}/#organization`;
export const APP_ID = `${SITE}/#app`;
export const WEBSITE_ID = `${SITE}/#website`;

export const organizationJsonLd = () => ({
  '@context': 'https://schema.org',
  '@type': 'Organization',
  '@id': ORGANIZATION_ID,
  name: 'Yomi Lab',
  email: 'hello@yomilab.app',
  sameAs: ['https://github.com/yomilab'],
});

export const websiteJsonLd = (locale: LanguageCode) => ({
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  '@id': WEBSITE_ID,
  name: 'KiJi',
  url: `${SITE}/`,
  inLanguage: locale,
  publisher: { '@id': ORGANIZATION_ID },
});

interface AppOptions {
  locale: LanguageCode;
  description: string;
  version: string;
  releaseDate?: string;
  /** Direct installer link; defaults to the localized download page. */
  downloadUrl?: string;
  screenshot?: string;
}

export const softwareApplicationJsonLd = ({
  locale,
  description,
  version,
  releaseDate,
  downloadUrl,
  screenshot,
}: AppOptions) => ({
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  '@id': APP_ID,
  name: 'KiJi',
  alternateName: 'KiJi Reader',
  description,
  url: new URL(localePath(locale, '/'), SITE).href,
  applicationCategory: 'UtilitiesApplication',
  applicationSubCategory: 'RSS reader',
  operatingSystem: 'macOS, Windows, Linux',
  softwareVersion: version,
  ...(releaseDate ? { dateModified: releaseDate } : {}),
  downloadUrl: downloadUrl ?? new URL(localePath(locale, '/download/'), SITE).href,
  releaseNotes: new URL(localePath(locale, '/changelog/'), SITE).href,
  image: `${SITE}/images/kiji-logo.png`,
  ...(screenshot ? { screenshot } : {}),
  isAccessibleForFree: true,
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
  publisher: { '@id': ORGANIZATION_ID },
});
