import { useEffect, useState, type CSSProperties } from 'react';
import { ShotCanvas } from './ShotCanvas';
import { READER_THEMES, dualVars, getTheme, themeVars, type Scheme } from '../../lib/readerThemes';
import { ARTICLE, FEED_LISTS, ITEMS, MARKDOWN_FILES, type ShotLocale } from '../../data/shotSample';
import './shots.css';

/**
 * With `theme` and `scheme`, a shot renders in that theme. Without them it
 * inherits the page's `--rt-*` tokens and `data-scheme`, so it follows the
 * theme the visitor picked on the website.
 */
export interface ShotProps {
  theme?: string;
  scheme?: Scheme;
  className?: string;
  /** Accessible description; the mockup itself is hidden from assistive tech. */
  label?: string;
}

const vars = (theme?: string, scheme?: Scheme) =>
  theme ? (themeVars(theme, scheme ?? 'light') as CSSProperties) : undefined;

/** Colors for one theme's swatch: fixed when the scheme is known, else both versions for CSS to pick. */
function swatchVars(id: string, scheme?: Scheme): CSSProperties {
  if (!scheme) return dualVars(id) as CSSProperties;
  const tokens = getTheme(id)[scheme];
  return {
    '--c-page': tokens.page,
    '--c-ink': tokens.ink,
    '--c-soft': tokens.inkSoft,
    '--c-accent': tokens.accent,
    '--c-on-accent': tokens.onAccent,
  } as CSSProperties;
}

function SchemeSegment({ scheme }: { scheme?: Scheme }) {
  return (
    <div className={`ks-seg ${scheme ? '' : 'ks-seg-auto'}`}>
      <span data-v="light" className={scheme === 'light' ? 'is-on' : ''}>Light</span>
      <span data-v="dark" className={scheme === 'dark' ? 'is-on' : ''}>Dark</span>
      <span>Auto</span>
    </div>
  );
}

/* ---------- Small parts ---------- */

/**
 * The page's reader theme (`<html data-reader-theme data-scheme>`), kept in
 * sync with the website's picker. Null on the server and before mount, so
 * hydration matches the server HTML.
 */
function usePageTheme() {
  const [page, setPage] = useState<{ theme: string; scheme: Scheme } | null>(null);
  useEffect(() => {
    const read = () => {
      const root = document.documentElement;
      const theme = root.dataset.readerTheme;
      if (theme) setPage({ theme, scheme: root.dataset.scheme === 'dark' ? 'dark' : 'light' });
    };
    read();
    document.addEventListener('kiji:reader-theme', read);
    return () => document.removeEventListener('kiji:reader-theme', read);
  }, []);
  return page;
}

/** Window title naming the theme the shot is drawn in, e.g. "Midnight  Dark". */
function ThemeTitle({ theme, scheme }: { theme?: string; scheme?: Scheme }) {
  const page = usePageTheme();
  const id = theme ?? page?.theme;
  const version = scheme ?? page?.scheme;
  if (!id) return null;
  return (
    <span className="ks-title">
      <b>{getTheme(id).label}</b>
      {version && <span>{version === 'dark' ? 'Dark' : 'Light'}</span>}
    </span>
  );
}

function Lights() {
  return (
    <div className="ks-lights" aria-hidden>
      <i style={{ background: '#FF5F57' }} />
      <i style={{ background: '#FEBC2E' }} />
      <i style={{ background: '#28C840' }} />
    </div>
  );
}

function Icon({ d, size = 18 }: { d: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d={d} />
    </svg>
  );
}

const ICONS = {
  back: 'M15 18l-6-6 6-6',
  refresh: 'M20 11a8 8 0 1 0-2.3 5.7M20 4v7h-7',
  plus: 'M12 5v14M5 12h14',
  search: 'M11 18a7 7 0 1 0 0-14 7 7 0 0 0 0 14zM20 20l-4-4',
  bookmark: 'M6 4h12v16l-6-4-6 4z',
  inbox: 'M4 13l2-8h12l2 8M4 13v6h16v-6M4 13h5l1 2h4l1-2h5',
  reader: 'M5 4h14v16H5zM8 8h8M8 12h8M8 16h5',
  more: 'M12 6h.01M12 12h.01M12 18h.01',
  gear: 'M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z',
  check: 'M5 12l5 5 9-10',
  folder: 'M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z',
  file: 'M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8zM14 3v5h5',
};

function Sidebar({ locale = 'en', active }: { locale?: ShotLocale; active?: string }) {
  const list = FEED_LISTS[locale];
  const selected = active ?? list.active;
  return (
    <aside className="ks-sidebar">
      <div className="ks-sidebar-top">
        <Lights />
        <div className="ks-sidebar-tools">
          <Icon d={ICONS.refresh} />
          <Icon d={ICONS.plus} />
        </div>
      </div>
      <div className="ks-sidebar-title">
        Feeds <small>{list.syncedAt}</small>
      </div>
      <div className="ks-group">Library</div>
      <div className={`ks-nav ${selected === 'Saved' ? 'is-active' : ''}`}>
        <Icon d={ICONS.bookmark} size={16} /> Saved
      </div>
      <div className="ks-nav">
        <Icon d={ICONS.inbox} size={16} /> All Items
      </div>
      <div className="ks-group">Stations</div>
      {list.stations.map((station) => (
        <div key={station.name} className={`ks-nav ${station.name === selected ? 'is-active' : ''}`}>
          <span className="ks-emoji">{station.emoji}</span>
          {station.name}
          <span className="ks-count">{station.count}</span>
        </div>
      ))}
      <div className="ks-sidebar-foot">
        <Icon d={ICONS.gear} size={16} />
      </div>
    </aside>
  );
}

function ArticleList({ title, count, items = ITEMS, compact = false }: { title: string; count: number; items?: typeof ITEMS; compact?: boolean }) {
  return (
    <section className={`ks-list ${compact ? 'is-compact' : ''}`}>
      <header className="ks-list-head">
        <h2>{title}</h2>
        <p>{count} items</p>
        <span className="ks-list-search">
          <Icon d={ICONS.search} />
        </span>
      </header>
      {items.map((item, index) => (
        <article key={item.title} className={`ks-item ${index === 0 ? 'is-selected' : ''}`}>
          <span className="ks-favicon" style={{ background: item.color }}>
            {item.initials}
          </span>
          <div className="ks-item-body">
            <div className="ks-item-meta">
              <span>{item.source}</span>
              <span>{item.time}</span>
            </div>
            <h3>
              {item.unread && <i className="ks-unread" />}
              {item.title}
            </h3>
            <p>{item.summary}</p>
          </div>
        </article>
      ))}
    </section>
  );
}

function ReaderArticle({ paragraphs = ARTICLE.paragraphs.length }: { paragraphs?: number }) {
  return (
    <article className="ks-article">
      <div className="ks-headline">{ARTICLE.title}</div>
      <p className="ks-byline">
        {ARTICLE.author}
        <br />
        {ARTICLE.source}
      </p>
      {ARTICLE.paragraphs.slice(0, paragraphs).map((text, index) => (
        <p key={index}>
          {index === 1 ? (
            <>
              Then people started building their own corners again. <a>Small sites</a>, long letters, and plain RSS feeds came back, not as nostalgia but as a way to read on purpose.
            </>
          ) : (
            text
          )}
        </p>
      ))}
      {paragraphs > 2 && <blockquote>{ARTICLE.quote}</blockquote>}
    </article>
  );
}

function ThemeSwatch({ id, scheme, selected }: { id: string; scheme?: Scheme; selected?: boolean }) {
  return (
    <span
      className={`ks-swatch ks-dual ${selected ? 'is-selected' : ''}`}
      style={swatchVars(id, scheme)}
      data-theme-id={scheme ? undefined : id}
    >
      <b style={{ fontFamily: getTheme(id).titleFont }}>Aa</b>
      <i />
    </span>
  );
}

/* ---------- Shots ---------- */

/** Stations sidebar + article list, filled with real feeds picked for the page language. */
export function ArticleListShot({ theme, scheme, className, label, locale = 'en' }: ShotProps & { locale?: ShotLocale }) {
  const list = FEED_LISTS[locale];
  const station = list.stations.find((item) => item.name === list.active);
  return (
    <ShotCanvas className={className} label={label}>
      <div className="ks-window" style={vars(theme, scheme)} data-scheme={scheme}>
        <Sidebar locale={locale} />
        <ArticleList title={list.active} count={station?.count ?? list.items.length} items={list.items} />
      </div>
    </ShotCanvas>
  );
}

/** Reader mode, optionally with the theme popover open. */
export function ReaderShot({ theme, scheme, className, label, showThemeMenu = true }: ShotProps & { showThemeMenu?: boolean }) {
  const current = theme ? getTheme(theme) : undefined;
  return (
    <ShotCanvas className={className} label={label}>
      <div className="ks-window ks-reader" style={vars(theme, scheme)} data-scheme={scheme}>
        <div className="ks-toolbar">
          <Lights />
          <span className="ks-tool">
            <Icon d={ICONS.back} />
          </span>
          <ThemeTitle theme={theme} scheme={scheme} />
          <div className="ks-toolbar-right">
            <span className="ks-tool is-on">
              <Icon d={ICONS.reader} />
            </span>
            <span className="ks-tool">
              <Icon d={ICONS.bookmark} />
            </span>
            <span className={`ks-tool ks-aa ${showThemeMenu ? 'is-on' : ''}`}>Aa</span>
            <span className="ks-tool">
              <Icon d={ICONS.more} />
            </span>
          </div>
        </div>
        <ReaderArticle />
        {showThemeMenu && (
          <div className="ks-popover">
            <div className="ks-popover-head">
              <strong>Reader theme</strong>
              <span>{current?.label}</span>
            </div>
            <SchemeSegment scheme={scheme} />
            <div className="ks-swatches">
              {READER_THEMES.map((item) => (
                <ThemeSwatch key={item.id} id={item.id} scheme={scheme} selected={item.id === theme} />
              ))}
            </div>
            <div className="ks-slider">
              <span>A</span>
              <i>
                <b />
              </i>
              <span style={{ fontSize: 18 }}>A</span>
            </div>
          </div>
        )}
      </div>
    </ShotCanvas>
  );
}

/** Settings → Appearance with all reader themes as cards. */
export function ThemeGalleryShot({ theme, scheme, className, label }: ShotProps) {
  return (
    <ShotCanvas className={className} label={label}>
      <div className="ks-window ks-settings" style={vars(theme, scheme)} data-scheme={scheme}>
        <aside className="ks-settings-nav">
          <Lights />
          {['General', 'Appearance', 'Feeds', 'Reader', 'Sync', 'About'].map((label) => (
            <div key={label} className={`ks-nav ${label === 'Appearance' ? 'is-active' : ''}`}>
              {label}
            </div>
          ))}
        </aside>
        <section className="ks-settings-body">
          <h2>Appearance</h2>
          <div className="ks-row">
            <span>Mode</span>
            <SchemeSegment scheme={scheme} />
          </div>
          <h3>Reader theme</h3>
          <p className="ks-hint">Each theme has a light and a dark version.</p>
          <div className="ks-theme-grid">
            {READER_THEMES.map((item) => {
              const selected = item.id === theme;
              return (
                <figure key={item.id} className={`ks-theme-card ${selected ? 'is-selected' : ''}`}>
                  <div className="ks-theme-preview ks-dual" style={swatchVars(item.id, scheme)} data-theme-id={scheme ? undefined : item.id}>
                    <b style={{ fontFamily: item.titleFont }}>Aa</b>
                    <i />
                    <i style={{ width: '62%' }} />
                    <u />
                    <span className="ks-check">
                      <Icon d={ICONS.check} size={12} />
                    </span>
                  </div>
                  <figcaption>
                    {item.label}
                    <small>{item.inspiration}</small>
                  </figcaption>
                </figure>
              );
            })}
          </div>
        </section>
      </div>
    </ShotCanvas>
  );
}

const MOSAIC: Array<{ theme: string; scheme: Scheme }> = [
  { theme: 'solarized', scheme: 'dark' },
  { theme: 'eye-care', scheme: 'light' },
  { theme: 'sepia', scheme: 'light' },
  { theme: 'midnight', scheme: 'dark' },
  { theme: 'washi', scheme: 'light' },
];

/** A fan of reader pages in different themes. Transparent background. */
export function ThemeFanShot({ className, label, themes = MOSAIC }: { className?: string; label?: string; themes?: typeof MOSAIC }) {
  const middle = (themes.length - 1) / 2;
  return (
    <ShotCanvas className={className} label={label}>
      <div className="ks-fan">
        {themes.map((item, index) => {
          const offset = index - middle;
          const style = {
            ...vars(item.theme, item.scheme),
            transform: `translateX(${offset * 190}px) translateY(${Math.abs(offset) * 26}px) rotate(${offset * 5}deg)`,
            zIndex: 10 - Math.round(Math.abs(offset) * 2),
          } as CSSProperties;
          return (
            <div key={`${item.theme}-${item.scheme}`} className="ks-fan-page" style={style}>
              <span className="ks-fan-label">{getTheme(item.theme).label}</span>
              <ReaderArticle paragraphs={3} />
            </div>
          );
        })}
      </div>
    </ShotCanvas>
  );
}

/** Saved articles beside the Markdown folder they sync to. */
export function MarkdownSyncShot({ theme, scheme, className, label, locale = 'en' }: ShotProps & { locale?: ShotLocale }) {
  const saved = ITEMS.slice(0, 5).map((item) => ({ ...item, saved: true }));
  return (
    <ShotCanvas className={className} label={label}>
      <div className="ks-stage">
        <div className="ks-window ks-stage-back" style={vars(theme, scheme)} data-scheme={scheme}>
          <Sidebar locale={locale} active="Saved" />
          <ArticleList title="Saved" count={128} items={saved} compact />
        </div>
        <div className="ks-editor" data-scheme={scheme}>
          <div className="ks-editor-bar">
            <Lights />
            <span>
              <Icon d={ICONS.folder} size={15} /> ~/Notes/KiJi
            </span>
            <em>
              <Icon d={ICONS.check} size={13} /> Synced
            </em>
          </div>
          <div className="ks-editor-body">
            <ul className="ks-files">
              {MARKDOWN_FILES.map((file, index) => (
                <li key={file} className={index === 0 ? 'is-on' : ''}>
                  <Icon d={ICONS.file} size={14} />
                  {file}
                </li>
              ))}
            </ul>
            <pre className="ks-md">
              <span className="m">---</span>
              {'\n'}
              <span className="k">title:</span> {ARTICLE.title}
              {'\n'}
              <span className="k">author:</span> {ARTICLE.author}
              {'\n'}
              <span className="k">source:</span> {ARTICLE.source}
              {'\n'}
              <span className="k">saved:</span> 2026-10-18
              {'\n'}
              <span className="k">tags:</span> [daily, web]
              {'\n'}
              <span className="m">---</span>
              {'\n\n'}
              <span className="h"># {ARTICLE.title}</span>
              {'\n\n'}
              {wrap(ARTICLE.paragraphs[0])}
              {'\n\n'}
              {wrap(ARTICLE.paragraphs[1])}
              {'\n\n'}
              <span className="q">&gt; {ARTICLE.quote}</span>
            </pre>
          </div>
        </div>
      </div>
    </ShotCanvas>
  );
}

function wrap(text: string, width = 44) {
  const lines: string[] = [];
  let line = '';
  for (const word of text.split(' ')) {
    if ((line + ' ' + word).trim().length > width) {
      lines.push(line);
      line = word;
    } else {
      line = (line + ' ' + word).trim();
    }
  }
  lines.push(line);
  return lines.join('\n');
}

/** Before/after: a cluttered web page and the same article in reader mode. */
export function ExtractionShot({ theme, scheme, className, label, split = 0.46 }: ShotProps & { split?: number }) {
  const pct = `${Math.round(split * 100)}%`;
  return (
    <ShotCanvas className={className} label={label}>
      <div className="ks-window ks-extract" style={vars(theme, scheme)} data-scheme={scheme}>
        <div className="ks-web" aria-hidden>
          <div className="ks-web-bar">
            <Lights />
            <span className="ks-web-url">fieldnotes.example/slow-web</span>
          </div>
          <div className="ks-web-nav">
            {Array.from({ length: 7 }, (_, index) => (
              <i key={index} />
            ))}
          </div>
          <div className="ks-web-main">
            <div className="ks-web-col">
              <div className="ks-web-ad">Advertisement</div>
              <div className="ks-headline">{ARTICLE.title}</div>
              <p>{ARTICLE.paragraphs[0]}</p>
              <div className="ks-web-ad is-wide">Sponsored</div>
              <p>{ARTICLE.paragraphs[1]}</p>
            </div>
            <div className="ks-web-side">
              {Array.from({ length: 4 }, (_, index) => (
                <div key={index} className="ks-web-card" />
              ))}
            </div>
          </div>
          <div className="ks-web-cookie">
            We use cookies to improve your experience. <b>Accept all</b>
          </div>
        </div>
        <div className="ks-clean" style={{ clipPath: `inset(0 0 0 ${pct})`, paddingLeft: `calc(${pct} + 72px)` }}>
          <ReaderArticle paragraphs={3} />
        </div>
        <div className="ks-split" style={{ left: pct }}>
          <span>Reader mode</span>
        </div>
      </div>
    </ShotCanvas>
  );
}
