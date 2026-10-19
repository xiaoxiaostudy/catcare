import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';
import { STATUSES, MODULE_IDS } from './data/map';

const notes = defineCollection({
  loader: glob({ pattern: '*.md', base: './src/content/notes' }),
  schema: z.object({
    title: z.string(),
    module: z.enum(MODULE_IDS),
    order: z.number(),
    status: z.enum(STATUSES),
    date: z.coerce.date(),
    author: z.string(),
    summary: z.string(),
    widget: z.enum(['breath-timer', 'body-condition', 'litter-watch']).optional(),
  }),
});

const pages = defineCollection({
  loader: glob({ pattern: '*.md', base: './src/content/pages' }),
  schema: z.object({ title: z.string() }),
});

export const collections = { notes, pages };
