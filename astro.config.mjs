import { defineConfig } from 'astro/config';
import rehypeNoteSections from './src/lib/rehype-note-sections.mjs';

import preact from '@astrojs/preact';

export default defineConfig({
  site: 'https://xiaoxiaostudy.github.io',
  base: '/catcare',
  trailingSlash: 'always',

  markdown: {
    // 自动弯引号不认识中文，会把汉字后面的引号都变成右引号，所以关掉，引号按原样显示
    smartypants: false,
    rehypePlugins: [rehypeNoteSections],
  },

  integrations: [preact()],
});