/// <reference types="astro/client" />

interface Window {
  /** Site reader theme, set up before paint in Base.astro. Light or dark always follows the OS. */
  kijiReaderTheme?: {
    get(): { theme: string | null; scheme: string | null };
    set(theme: string): void;
  };
}
