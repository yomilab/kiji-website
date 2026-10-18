import type { StorybookConfig } from '@storybook/react-vite';

/** Design lab for website themes and screenshots. Not part of the Astro build. */
const config: StorybookConfig = {
  stories: ['../design/**/*.stories.@(ts|tsx)'],
  framework: { name: '@storybook/react-vite', options: {} },
  staticDirs: ['../public'],
};

export default config;
