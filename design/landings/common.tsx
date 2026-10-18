import en from '../../src/i18n/en';

export const copy = en;

export const LINKS = {
  download: '/download/',
  changelog: '/changelog/',
  support: '/support/',
  github: 'https://github.com/yomilab',
};

export function Brand({ className }: { className?: string }) {
  return (
    <a className={className} href="/" aria-label="KiJi home" style={{ display: 'inline-flex', alignItems: 'center', gap: 10, textDecoration: 'none', color: 'inherit' }}>
      <img src="/images/kiji-mark.svg" alt="" width={28} height={28} />
      <span>KiJi</span>
    </a>
  );
}

export function NavLinks({ className }: { className?: string }) {
  return (
    <nav className={className} aria-label={copy.nav.aria}>
      <a href={LINKS.changelog}>{copy.nav.changelog}</a>
      <a href={LINKS.support}>{copy.nav.support}</a>
      <a href={LINKS.download}>{copy.nav.download}</a>
    </nav>
  );
}

export const PLATFORMS = 'macOS, Windows, and Linux';
