import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

// The schema replaces posts.json: title/date/summary now live in each post's
// frontmatter and are validated at build time. A post missing a field fails
// the build instead of shipping a half-rendered page.
// English posts sit at the top level, Turkish translations in tr/ under the same file name; see
// src/lib/blog.ts for how the two are paired.
const blog = defineCollection({
    loader: glob({ base: './src/content/blog', pattern: '**/*.md' }),
    schema: z.object({
        title: z.string(),
        date: z.coerce.date(),
        summary: z.string(),
        // Shows the AI-disclosure badge. On by default because every post so far was written from
        // voice notes with AI and translated with AI; a post written by hand can opt out.
        aiAssisted: z.boolean().default(true),
    }),
});

export const collections = { blog };
