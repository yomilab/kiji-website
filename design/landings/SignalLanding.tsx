import { ArticleListShot, ThemeGalleryShot } from '../../src/components/shots/Shots';
import { Brand, LINKS, NavLinks, PLATFORMS, copy } from './common';
import './signal.css';

/**
 * Signal: one oversized grotesque headline, the app bleeding off the right
 * edge, and the KiJi ripple blue used only for the call to action.
 */
export function SignalLanding() {
  return (
    <div className="lp-signal">
      <header className="sg-nav">
        <Brand className="sg-brand" />
        <NavLinks className="sg-links" />
      </header>

      <main>
        <section className="sg-hero">
          <h1>
            Read what
            <br />
            you chose.
          </h1>
          <div className="sg-hero-side">
            <p>{copy.home.lead}</p>
            <a className="sg-button" href={LINKS.download}>
              {copy.home.downloadCta}
            </a>
          </div>
        </section>

        <div className="sg-bleed">
          <ArticleListShot theme="quiet" scheme="light" />
        </div>

        <section className="sg-terms" aria-label={copy.home.featuresAria}>
          <dl>
            <div>
              <dt>{copy.home.privacyTitle}</dt>
              <dd>{copy.home.privacyText}</dd>
            </div>
            <div>
              <dt>{copy.home.readingTitle}</dt>
              <dd>{copy.home.readingText}</dd>
            </div>
            <div>
              <dt>{copy.home.themesTitle}</dt>
              <dd>{copy.home.themesText}</dd>
            </div>
          </dl>
        </section>

        <section className="sg-gallery">
          <ThemeGalleryShot theme="newsprint" scheme="light" />
        </section>
      </main>

      <section className="sg-cta">
        <h2>Free and open source for {PLATFORMS}.</h2>
        <a className="sg-button is-inverse" href={LINKS.download}>
          {copy.home.downloadCta}
        </a>
      </section>
    </div>
  );
}
