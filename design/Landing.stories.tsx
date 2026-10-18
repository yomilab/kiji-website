import type { Meta, StoryObj } from '@storybook/react-vite';
import type { ComponentType } from 'react';
import { THEME_IDS } from '../src/lib/readerThemes';
import { FeedLanding } from './landings/FeedLanding';
import { LibraryLanding } from './landings/LibraryLanding';
import { SignalLanding } from './landings/SignalLanding';
import { SwatchLanding } from './landings/SwatchLanding';

const meta: Meta = {
  title: 'Landing pages',
};

export default meta;

interface Option {
  id: string;
  name: string;
  note: string;
  Component: ComponentType;
}

const OPTIONS: Option[] = [
  {
    id: 'swatch',
    name: 'Swatch',
    note: 'The page wears the reader theme you pick. Hero is a live theme switcher. Newsreader + Inter.',
    Component: SwatchLanding,
  },
  {
    id: 'signal',
    name: 'Signal',
    note: 'Oversized grotesque headline, app bleeding off the edge, ripple blue for actions. Bricolage Grotesque.',
    Component: SignalLanding,
  },
  {
    id: 'library',
    name: 'Library',
    note: 'Night-blue reading room with a fan of themed pages and a reader-mode before/after. Instrument Serif + Geist.',
    Component: LibraryLanding,
  },
  {
    id: 'feed',
    name: 'Feed',
    note: 'Laid out like KiJi itself: features are unread items you open to see the screenshot. IBM Plex.',
    Component: FeedLanding,
  },
];

const PREVIEW_WIDTH = 1440;
const PREVIEW_HEIGHT = 1500;
const PREVIEW_SCALE = 0.3;

const storyHref = (id: string) => `/?path=/story/landing-pages--${id}`;

function open(id: string) {
  (window.top ?? window).location.href = storyHref(id);
}

function Picker() {
  return (
    <div style={{ minHeight: '100vh', padding: '40px 24px 64px', background: '#f1f1f3', fontFamily: 'Inter, system-ui, sans-serif', color: '#15171c' }}>
      <div style={{ maxWidth: 940, margin: '0 auto' }}>
        <h1 style={{ margin: 0, fontSize: 28, fontWeight: 650 }}>KiJi website themes</h1>
        <p style={{ margin: '6px 0 32px', color: '#5d6370' }}>Four directions for a short landing page. Open one to see it full size and try it on a phone width.</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(420px, 1fr))', gap: 28 }}>
          {OPTIONS.map(({ id, name, note, Component }) => (
            <div key={id}>
              <div
                aria-hidden
                onClick={() => open(id)}
                style={{
                  position: 'relative',
                  width: PREVIEW_WIDTH * PREVIEW_SCALE,
                  height: PREVIEW_HEIGHT * PREVIEW_SCALE,
                  maxWidth: '100%',
                  overflow: 'hidden',
                  borderRadius: 12,
                  boxShadow: '0 0 0 1px rgba(0,0,0,.08), 0 20px 40px -24px rgba(0,0,0,.35)',
                  background: '#fff',
                  cursor: 'pointer',
                }}
              >
                <div style={{ width: PREVIEW_WIDTH, height: PREVIEW_HEIGHT, overflow: 'hidden', transform: `scale(${PREVIEW_SCALE})`, transformOrigin: '0 0', pointerEvents: 'none' }}>
                  <Component />
                </div>
              </div>
              <h2 style={{ margin: '14px 0 2px', fontSize: 17 }}>
                <a href={storyHref(id)} target="_top" style={{ color: 'inherit' }}>
                  {name}
                </a>
              </h2>
              <p style={{ margin: 0, color: '#5d6370', fontSize: 14, maxWidth: 420 }}>{note}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export const PickATheme: StoryObj = {
  name: 'Pick a theme',
  render: () => <Picker />,
};

export const Swatch: StoryObj<{ initialTheme: string; initialScheme: 'light' | 'dark' }> = {
  args: { initialTheme: 'calm', initialScheme: 'light' },
  argTypes: {
    initialTheme: { control: 'select', options: THEME_IDS },
    initialScheme: { control: 'inline-radio', options: ['light', 'dark'] },
  },
  render: (args) => <SwatchLanding key={`${args.initialTheme}-${args.initialScheme}`} {...args} />,
};

export const Signal: StoryObj = {
  render: () => <SignalLanding />,
};

export const Library: StoryObj = {
  render: () => <LibraryLanding />,
};

export const Feed: StoryObj = {
  render: () => <FeedLanding />,
};
