import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://kiji.yomilab.app',
  output: 'static',
  trailingSlash: 'always',
  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'zh-Hans', 'ja'],
    routing: { prefixDefaultLocale: false },
  },
  integrations: [
    react(),
    sitemap({
      filter: (page) => !page.includes('404'),
      i18n: {
        defaultLocale: 'en',
        locales: {
          en: 'en',
          'zh-Hans': 'zh-Hans',
          ja: 'ja',
        },
      },
    }),
  ],
});
