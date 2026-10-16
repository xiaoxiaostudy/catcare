import { defineConfig } from 'astro/config';
import rehypeNoteSections from './src/lib/rehype-note-sections.mjs';

export default defineConfig({
  site: 'https://xiaoxiaostudy.github.io',
  base: '/catcare',
  trailingSlash: 'always',
  markdown: {
    rehypePlugins: [rehypeNoteSections],
  },
});
