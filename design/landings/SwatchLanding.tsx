import { useState, type CSSProperties } from 'react';
import { READER_THEMES, getTheme, type Scheme } from '../../src/lib/readerThemes';
import { ExtractionShot, ReaderShot } from '../../src/components/shots/Shots';
import { Brand, LINKS, NavLinks, PLATFORMS, copy } from './common';
import './swatch.css';

/**
 * Swatch: the page itself wears the reader theme you pick.
 * The hero is the theme switcher; everything else stays quiet.
 */
export function SwatchLanding({ initialTheme = 'calm', initialScheme = 'light' }: { initialTheme?: string; initialScheme?: Scheme }) {
  const [themeId, setThemeId] = useState(initialTheme);
  const [scheme, setScheme] = useState<Scheme>(initialScheme);
  const theme = getTheme(themeId);
  const tokens = theme[scheme];

  const style = {
    '--sw-page': tokens.page,
    '--sw-ink': tokens.ink,
    '--sw-soft': tokens.inkSoft,
    '--sw-accent': tokens.accent,
    '--sw-on-accent': tokens.onAccent,
  } as CSSProperties;

  return (
    <div className="lp-swatch" style={style} data-scheme={scheme}>
      <header className="sw-nav">
        <Brand className="sw-brand" />
        <NavLinks className="sw-links" />
      </header>

      <main>
        <section className="sw-hero">
          <h1>Your feeds, in the light you read best.</h1>
          <p className="sw-lead">
            KiJi is a free, local RSS reader. Pick one of {READER_THEMES.length} book-style themes and every article follows it.
          </p>

          <div className="sw-picker" role="radiogroup" aria-label="Reader theme">
            {READER_THEMES.map((item) => {
              const swatch = item[scheme];
              return (
                <button
                  key={item.id}
                  type="button"
                  role="radio"
                  aria-checked={item.id === themeId}
                  className="sw-chip"
                  onClick={() => setThemeId(item.id)}
                  style={{ background: swatch.page, color: swatch.ink, fontFamily: item.titleFont }}
                  title={item.label}
                >
                  Aa
                  <i style={{ background: swatch.accent }} />
                </button>
              );
            })}
            <button type="button" className="sw-scheme" onClick={() => setScheme(scheme === 'light' ? 'dark' : 'light')}>
              {scheme === 'light' ? 'Dark version' : 'Light version'}
            </button>
          </div>
          <div className="sw-shot">
            <ReaderShot theme={themeId} scheme={scheme} showThemeMenu={false} />
          </div>
        </section>

        <section className="sw-showcase">
          <div>
            <h2>{copy.home.readingHeadline}</h2>
            <p>{copy.home.readingText}</p>
          </div>
          <div className="sw-showcase-shot">
            <ExtractionShot theme={themeId} scheme={scheme} split={0.5} />
          </div>
        </section>

        <section className="sw-facts">
          <div>
            <h2>{copy.home.privacyTitle}</h2>
            <p>{copy.home.privacyText}</p>
          </div>
          <div>
            <h2>{copy.home.feedsTitle}</h2>
            <p>Group feeds by tag. Read unread or saved, newest first. No algorithm.</p>
          </div>
          <div>
            <h2>{copy.home.simpleTitle}</h2>
            <p>{copy.home.simpleText}</p>
          </div>
        </section>

        <section className="sw-cta">
          <h2>Free for {PLATFORMS}.</h2>
          <a className="sw-button" href={LINKS.download}>
            {copy.home.downloadCta}
          </a>
        </section>
      </main>

      <footer className="sw-foot">
        <span>{copy.footer.disclaimer}</span>
        <a href="/privacy/">{copy.footer.privacy}</a>
      </footer>
    </div>
  );
}
