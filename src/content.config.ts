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
    // 开头的小场景，两三句，让读者先觉得「我需要知道这个」
    scene: z.string().optional(),
    widget: z.enum(['breath-timer', 'body-condition', 'litter-watch', 'heart-timer', 'spot-change', 'body-language', 'toxin-room', 'food-calc', 'life-stage']).optional(),
  }),
});

export const collections = { notes };
