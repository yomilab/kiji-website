/**
 * Mirror of the KiJi app's reader themes. The website wears the theme the
 * visitor picks on the home page (see `readerThemeCss` and Base.astro), and the
 * app mockups in `src/components/shots/` render with the same tokens.
 * Source of truth: kiji-app/src/services/settings/readerThemes.ts (fonts)
 * and kiji-app/src/styles/reader-themes.css (colors). Keep in sync by hand.
 */

export type Scheme = 'light' | 'dark';

export interface ThemeTokens {
  page: string;
  ink: string;
  inkSoft: string;
  accent: string;
  onAccent: string;
}

export interface ReaderTheme {
  id: string;
  label: string;
  inspiration: string;
  titleFont: string;
  bodyFont: string;
  lineHeight: number;
  light: ThemeTokens;
  dark: ThemeTokens;
}

const t = (page: string, ink: string, inkSoft: string, accent: string, onAccent: string): ThemeTokens => ({
  page,
  ink,
  inkSoft,
  accent,
  onAccent,
});

const NEW_YORK = '"New York", "Newsreader", ui-serif, Georgia, serif';
const IOWAN = '"Iowan Old Style", "Newsreader", Georgia, serif';
const PALATINO = '"Palatino", "Palatino Linotype", "Book Antiqua", Georgia, serif';
const ATHELAS = '"Athelas", "Newsreader", Georgia, serif';
const AVENIR = '"Avenir Next", "PingFang SC", "Inter", system-ui, sans-serif';
const MINCHO = '"Hiragino Mincho ProN", "Songti SC", "Newsreader", serif';
const CHARTER = '"Charter", "Bitstream Charter", "Newsreader", Georgia, serif';
const SYSTEM = '-apple-system, "SF Pro Text", "Inter", system-ui, sans-serif';
const GEORGIA = 'Georgia, "Newsreader", serif';

export const READER_THEMES: readonly ReaderTheme[] = [
  {
    id: 'paper', label: 'Paper', inspiration: 'Apple Books Original',
    titleFont: NEW_YORK, bodyFont: IOWAN, lineHeight: 1.7,
    light: t('#FBF8F1', '#2B2620', '#6B6257', '#B4532A', '#FFFFFF'),
    dark: t('#1F1D1A', '#E6DFD3', '#A69E91', '#E08A5E', '#1F1D1A'),
  },
  {
    id: 'sepia', label: 'Sepia', inspiration: 'Kindle Sepia',
    titleFont: PALATINO, bodyFont: PALATINO, lineHeight: 1.75,
    light: t('#F4ECD8', '#4E3B2C', '#77624F', '#9C5B2E', '#FFFFFF'),
    dark: t('#2A2118', '#E8D9BF', '#B19F85', '#D9955E', '#2A2118'),
  },
  {
    id: 'calm', label: 'Calm', inspiration: 'Apple Books Calm',
    titleFont: ATHELAS, bodyFont: ATHELAS, lineHeight: 1.75,
    light: t('#EEE5D3', '#3A3127', '#6A5E4D', '#8A5520', '#FFFFFF'),
    dark: t('#1E1B18', '#D8CCB6', '#A09380', '#D4A55A', '#1E1B18'),
  },
  {
    id: 'eye-care', label: 'Eye Care', inspiration: 'Soft green',
    titleFont: AVENIR, bodyFont: AVENIR, lineHeight: 1.85,
    light: t('#CCE8CF', '#1F3326', '#45614D', '#246B42', '#FFFFFF'),
    dark: t('#14241A', '#CFE6D3', '#8FB09A', '#6CC492', '#14241A'),
  },
  {
    id: 'washi', label: 'Washi', inspiration: 'Japanese paper and ink',
    titleFont: MINCHO, bodyFont: MINCHO, lineHeight: 1.85,
    light: t('#F4EFE3', '#24242A', '#5C584F', '#B0352A', '#FFFFFF'),
    dark: t('#1C1C21', '#E9E4D8', '#A8A397', '#E9705F', '#1C1C21'),
  },
  {
    id: 'parchment', label: 'Parchment', inspiration: 'Old manuscript',
    titleFont: PALATINO, bodyFont: CHARTER, lineHeight: 1.75,
    light: t('#F1E4C3', '#3B2A1A', '#6B5639', '#7A3B1E', '#FFFFFF'),
    dark: t('#261C12', '#ECDDB9', '#B3A07C', '#D98A62', '#261C12'),
  },
  {
    id: 'newsprint', label: 'Newsprint', inspiration: 'Morning paper',
    titleFont: GEORGIA, bodyFont: GEORGIA, lineHeight: 1.65,
    light: t('#EFEDE7', '#161616', '#55534E', '#B3261E', '#FFFFFF'),
    dark: t('#161616', '#E6E4DE', '#A3A09A', '#F0645A', '#161616'),
  },
  {
    id: 'e-ink', label: 'E-Ink', inspiration: 'E-reader screen',
    titleFont: CHARTER, bodyFont: CHARTER, lineHeight: 1.7,
    light: t('#E7E6E1', '#1B1B1B', '#494946', '#2F4F5F', '#FFFFFF'),
    dark: t('#232323', '#DCDBD6', '#9E9D98', '#8FB3C4', '#232323'),
  },
  {
    id: 'solarized', label: 'Solarized', inspiration: 'Solarized palette',
    titleFont: SYSTEM, bodyFont: CHARTER, lineHeight: 1.7,
    light: t('#FDF6E3', '#073642', '#586E75', '#1A6BA8', '#FFFFFF'),
    dark: t('#002B36', '#EEE8D5', '#93A1A1', '#3CB4A8', '#002B36'),
  },
  {
    id: 'quiet', label: 'Quiet', inspiration: 'Apple Books Quiet',
    titleFont: SYSTEM, bodyFont: SYSTEM, lineHeight: 1.7,
    light: t('#E8E8EA', '#2E2E31', '#5F5F66', '#4F5B6E', '#FFFFFF'),
    dark: t('#2C2C2E', '#BDBDC2', '#98989D', '#A0A7B4', '#2C2C2E'),
  },
  {
    id: 'midnight', label: 'Midnight', inspiration: 'Night-shift blue',
    titleFont: SYSTEM, bodyFont: IOWAN, lineHeight: 1.7,
    light: t('#EEF2F8', '#1A2233', '#4E5A70', '#2F5BC4', '#FFFFFF'),
    dark: t('#131A2A', '#CBD3E3', '#8792A8', '#7AA2F7', '#131A2A'),
  },
  {
    id: 'oled-night', label: 'OLED Night', inspiration: 'True black',
    titleFont: SYSTEM, bodyFont: CHARTER, lineHeight: 1.7,
    light: t('#FFF9F0', '#2B231A', '#6B5E4E', '#9A5B12', '#FFFFFF'),
    dark: t('#000000', '#B0ABA4', '#7A756F', '#E0A458', '#000000'),
  },
  {
    id: 'high-contrast', label: 'High Contrast', inspiration: 'Maximum legibility',
    titleFont: SYSTEM, bodyFont: SYSTEM, lineHeight: 1.65,
    light: t('#FFFFFF', '#000000', '#333333', '#0037C1', '#FFFFFF'),
    dark: t('#000000', '#FFFFFF', '#D6D6D6', '#FFD60A', '#000000'),
  },
];

export const THEME_IDS = READER_THEMES.map((theme) => theme.id);

/** Theme the site wears before the visitor picks one. */
export const DEFAULT_SITE_THEME = 'calm';

/** localStorage key for the visitor's `{ theme, scheme }` choice. */
export const SITE_THEME_STORAGE_KEY = 'kiji-website-reader-theme';

export function getTheme(id: string): ReaderTheme {
  return READER_THEMES.find((theme) => theme.id === id) ?? READER_THEMES[0];
}

/** CSS custom properties consumed by the screenshot components. */
export function themeVars(id: string, scheme: Scheme): Record<string, string> {
  const theme = getTheme(id);
  const tokens = theme[scheme];
  return {
    '--rt-page': tokens.page,
    '--rt-ink': tokens.ink,
    '--rt-ink-soft': tokens.inkSoft,
    '--rt-accent': tokens.accent,
    '--rt-on-accent': tokens.onAccent,
    '--rt-title-font': theme.titleFont,
    '--rt-body-font': theme.bodyFont,
    '--rt-line-height': String(theme.lineHeight),
  };
}

const SCHEMES: Scheme[] = ['light', 'dark'];

const declarations = (vars: Record<string, string>) =>
  Object.entries(vars)
    .map(([key, value]) => `${key}:${value}`)
    .join(';');

/** Light and dark tokens side by side (`--l-*`, `--d-*`), for swatches that follow the page scheme. */
export function dualVars(id: string): Record<string, string> {
  const theme = getTheme(id);
  const vars: Record<string, string> = {};
  for (const scheme of SCHEMES) {
    const prefix = scheme === 'light' ? '--l' : '--d';
    const tokens = theme[scheme];
    vars[`${prefix}-page`] = tokens.page;
    vars[`${prefix}-ink`] = tokens.ink;
    vars[`${prefix}-soft`] = tokens.inkSoft;
    vars[`${prefix}-accent`] = tokens.accent;
    vars[`${prefix}-on-accent`] = tokens.onAccent;
  }
  return vars;
}

/**
 * Stylesheet that puts the chosen theme's `--rt-*` tokens on `:root`.
 * `<html data-reader-theme data-scheme>` is set before paint by Base.astro;
 * without it the default theme follows the OS light/dark preference.
 */
export function readerThemeCss(): string {
  const rules: string[] = [];
  rules.push(`:root{${declarations(themeVars(DEFAULT_SITE_THEME, 'light'))}}`);
  rules.push(
    `@media (prefers-color-scheme: dark){:root:not([data-scheme="light"]){${declarations(themeVars(DEFAULT_SITE_THEME, 'dark'))}}}`,
  );
  for (const theme of READER_THEMES) {
    for (const scheme of SCHEMES) {
      rules.push(`:root[data-reader-theme="${theme.id}"][data-scheme="${scheme}"]{${declarations(themeVars(theme.id, scheme))}}`);
    }
    // Ring the matching swatch / gallery card and show its check mark.
    const current = `:root[data-reader-theme="${theme.id}"] [data-theme-id="${theme.id}"]`;
    rules.push(`${current}{outline:2px solid var(--rt-accent);outline-offset:3px}`);
    rules.push(`${current} .ks-check{display:grid}`);
  }
  return rules.join('\n');
}
