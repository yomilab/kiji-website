import { ExtractionShot, ThemeFanShot } from '../../src/components/shots/Shots';
import { READER_THEMES } from '../../src/lib/readerThemes';
import { Brand, LINKS, NavLinks, PLATFORMS, copy } from './common';
import './library.css';

/**
 * Library: a night-blue reading room. The hero is a fan of the same article
 * in five reader themes; one before/after shot explains reader mode.
 */
export function LibraryLanding() {
  return (
    <div className="lp-library">
      <header className="lb-nav">
        <Brand className="lb-brand" />
        <NavLinks className="lb-links" />
      </header>

      <main>
        <section className="lb-hero">
          <h1>
            One article,
            <br />
            read {READER_THEMES.length} ways.
          </h1>
          <p>{copy.home.title.replace(/\.$/, '')} with book-style themes, stations, and nothing stored anywhere but your computer.</p>
          <div className="lb-actions">
            <a className="lb-button" href={LINKS.download}>
              {copy.home.downloadCta}
            </a>
            <a className="lb-link" href="/feed.xml">
              {copy.home.subscribeCta}
            </a>
          </div>
          <div className="lb-fan">
            <ThemeFanShot />
          </div>
        </section>

        <section className="lb-split">
          <div className="lb-split-copy">
            <h2>Leave the page. Keep the words.</h2>
            <p>{copy.home.readingText}</p>
          </div>
          <div className="lb-split-shot">
            <ExtractionShot theme="parchment" scheme="dark" split={0.5} />
          </div>
        </section>

        <section className="lb-notes">
          <p>
            <strong>{copy.home.privacyTitle}.</strong> {copy.home.privacyText}
          </p>
          <p>
            <strong>{copy.home.simpleTitle}.</strong> {copy.home.simpleText}
          </p>
        </section>

        <section className="lb-cta">
          <h2>Free for {PLATFORMS}.</h2>
          <a className="lb-button" href={LINKS.download}>
            {copy.home.downloadCta}
          </a>
        </section>
      </main>
    </div>
  );
}
