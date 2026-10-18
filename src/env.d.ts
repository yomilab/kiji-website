/// <reference types="astro/client" />

interface Window {
  /** Site reader theme, set up before paint in Base.astro. `scheme: null` follows the OS. */
  kijiReaderTheme?: {
    get(): { theme: string | null; scheme: string | null };
    set(theme: string, scheme: 'light' | 'dark' | null): void;
  };
}
