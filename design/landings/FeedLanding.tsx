import { useState, type ReactNode } from 'react';
import { ArticleListShot, ExtractionShot, MarkdownSyncShot, ReaderShot } from '../../src/components/shots/Shots';
import { Brand, LINKS, PLATFORMS, copy } from './common';
import './feed.css';

interface Entry {
  id: string;
  source: string;
  time: string;
  title: string;
  summary: string;
  shot: ReactNode;
}

const ENTRIES: Entry[] = [
  {
    id: 'themes',
    source: 'Reader',
    time: 'New',
    title: copy.home.themesTitle,
    summary: `${copy.home.themesText} Paper, Sepia, Washi, Solarized, OLED Night, and more.`,
    shot: <ReaderShot theme="washi" scheme="light" />,
  },
  {
    id: 'reader',
    source: 'Reader',
    time: 'Built in',
    title: copy.home.readingTitle,
    summary: copy.home.readingText,
    shot: <ExtractionShot theme="paper" scheme="light" />,
  },
  {
    id: 'stations',
    source: 'Library',
    time: 'Built in',
    title: copy.home.feedsTitle,
    summary: copy.home.feedsText,
    shot: <ArticleListShot theme="midnight" scheme="dark" />,
  },
  {
    id: 'sync',
    source: 'Library',
    time: 'Built in',
    title: copy.home.simpleTitle,
    summary: copy.home.simpleText,
    shot: <MarkdownSyncShot theme="e-ink" scheme="light" />,
  },
];

/**
 * Feed: the landing page is laid out like KiJi itself. Sections are stations,
 * features are unread items, and opening one shows its screenshot.
 */
export function FeedLanding() {
  const [open, setOpen] = useState<string>(ENTRIES[0].id);
  const [read, setRead] = useState<Set<string>>(() => new Set([ENTRIES[0].id]));

  const toggle = (id: string) => {
    setOpen((current) => (current === id ? '' : id));
    setRead((current) => new Set(current).add(id));
  };

  const unread = ENTRIES.length - read.size;

  return (
    <div className="lp-feed">
      <aside className="fd-side">
        <Brand className="fd-brand" />
        <nav aria-label={copy.nav.aria}>
          <a className="is-active" href="#features">
            KiJi <span>{unread > 0 ? unread : ''}</span>
          </a>
          <a href={LINKS.download}>{copy.nav.download}</a>
          <a href={LINKS.changelog}>{copy.nav.changelog}</a>
          <a href="/feed.xml">{copy.nav.rss}</a>
          <a href={LINKS.support}>{copy.nav.support}</a>
        </nav>
        <a className="fd-button" href={LINKS.download}>
          {copy.home.downloadCta}
        </a>
      </aside>

      <main className="fd-main">
        <header className="fd-head">
          <h1>{copy.home.title}</h1>
          <p>
            Free, open source, and local. For {PLATFORMS}.
          </p>
        </header>

        <ol className="fd-list" id="features">
          {ENTRIES.map((entry) => {
            const isOpen = open === entry.id;
            return (
              <li key={entry.id} className={`fd-item ${isOpen ? 'is-open' : ''}`}>
                <button type="button" className="fd-row" aria-expanded={isOpen} onClick={() => toggle(entry.id)}>
                  <span className="fd-meta">
                    <span>{entry.source}</span>
                    <span>{entry.time}</span>
                  </span>
                  <span className="fd-title">
                    {!read.has(entry.id) && <i className="fd-dot" aria-label="Unread" />}
                    {entry.title}
                  </span>
                  <span className="fd-summary">{entry.summary}</span>
                </button>
                <div className="fd-shot" hidden={!isOpen}>
                  {isOpen && entry.shot}
                </div>
              </li>
            );
          })}
        </ol>

        <footer className="fd-foot">
          <p>{copy.home.closingTitle}</p>
          <a className="fd-button" href={LINKS.download}>
            {copy.home.downloadCta}
          </a>
        </footer>
      </main>
    </div>
  );
}
