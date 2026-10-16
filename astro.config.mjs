import { defineConfig } from 'astro/config';
import rehypeNoteSections from './src/lib/rehype-note-sections.mjs';

import preact from '@astrojs/preact';

export default defineConfig({
  site: 'https://xiaoxiaostudy.github.io',
  base: '/catcare',
  trailingSlash: 'always',

  markdown: {
    rehypePlugins: [rehypeNoteSections],
  },

  integrations: [preact()],
});