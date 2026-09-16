import en from './en';
import zhHans from './zh-Hans';
import ja from './ja';
import type { LanguageCode, LocalizedText } from './types';

export * from './types';

export const TEXT: Record<LanguageCode, LocalizedText> = {
  en,
  'zh-Hans': zhHans,
  ja,
};

export const getText = (locale: string | undefined): LocalizedText => (
  locale && locale in TEXT ? TEXT[locale as LanguageCode] : TEXT.en
);
