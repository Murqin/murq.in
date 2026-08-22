import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

// The schema replaces posts.json: title/date/summary now live in each post's
// frontmatter and are validated at build time. A post missing a field fails
// the build instead of shipping a half-rendered page.
const blog = defineCollection({
    loader: glob({ base: './src/content/blog', pattern: '**/*.md' }),
    schema: z.object({
        title: z.string(),
        date: z.coerce.date(),
        summary: z.string(),
    }),
});

export const collections = { blog };
