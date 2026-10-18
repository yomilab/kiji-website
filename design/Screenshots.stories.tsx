import type { Meta, StoryObj } from '@storybook/react-vite';
import type { ReactNode } from 'react';
import { THEME_IDS } from '../src/lib/readerThemes';
import { ArticleListShot, ExtractionShot, MarkdownSyncShot, ReaderShot, ThemeFanShot, ThemeGalleryShot } from '../src/components/shots/Shots';

/** Website screenshots drawn as HTML mockups of the KiJi app, so any reader theme can be shown. */
function Stage({ children, dark = false }: { children: ReactNode; dark?: boolean }) {
  return (
    <div style={{ minHeight: '100vh', padding: '48px 5vw', background: dark ? '#0d0f12' : '#e9e9ec', boxSizing: 'border-box' }}>
      <div style={{ maxWidth: 1280, margin: '0 auto' }}>{children}</div>
    </div>
  );
}

const themeArgTypes = {
  theme: { control: 'select', options: THEME_IDS },
  scheme: { control: 'inline-radio', options: ['light', 'dark'] },
} as const;

const meta: Meta = {
  title: 'Screenshots',
};

export default meta;

type Story = StoryObj<{ theme: string; scheme: 'light' | 'dark'; showThemeMenu?: boolean; split?: number; locale?: 'en' | 'zh-Hans' | 'ja' }>;

const localeArgType = { locale: { control: 'inline-radio', options: ['en', 'zh-Hans', 'ja'] } } as const;

export const ReaderThemes: Story = {
  name: 'Reader with theme menu',
  args: { theme: 'sepia', scheme: 'light', showThemeMenu: true },
  argTypes: themeArgTypes,
  render: (args) => (
    <Stage dark={args.scheme === 'dark'}>
      <ReaderShot {...args} />
    </Stage>
  ),
};

export const ThemeGallery: Story = {
  name: 'Theme gallery (Settings)',
  args: { theme: 'washi', scheme: 'light' },
  argTypes: themeArgTypes,
  render: (args) => (
    <Stage dark={args.scheme === 'dark'}>
      <ThemeGalleryShot {...args} />
    </Stage>
  ),
};

export const ThemeFan: Story = {
  name: 'Theme fan',
  render: () => (
    <Stage>
      <ThemeFanShot />
    </Stage>
  ),
};

export const Stations: Story = {
  name: 'Stations and article list',
  args: { theme: 'midnight', scheme: 'dark', locale: 'en' },
  argTypes: { ...themeArgTypes, ...localeArgType },
  render: (args) => (
    <Stage dark={args.scheme === 'dark'}>
      <ArticleListShot {...args} />
    </Stage>
  ),
};

export const MarkdownSync: Story = {
  name: 'Markdown sync',
  args: { theme: 'e-ink', scheme: 'light', locale: 'en' },
  argTypes: { ...themeArgTypes, ...localeArgType },
  render: (args) => (
    <Stage dark={args.scheme === 'dark'}>
      <MarkdownSyncShot {...args} />
    </Stage>
  ),
};

export const ReaderMode: Story = {
  name: 'Reader mode before/after',
  args: { theme: 'paper', scheme: 'light', split: 0.46 },
  argTypes: { ...themeArgTypes, split: { control: { type: 'range', min: 0.1, max: 0.9, step: 0.01 } } },
  render: (args) => (
    <Stage dark={args.scheme === 'dark'}>
      <ExtractionShot {...args} />
    </Stage>
  ),
};
