import type { Lang } from './blog';

/** The `[...path]` param of src/pages/og/[...path].png.ts for one page, e.g. "tr/blog/<slug>". */
export const ogPath = (lang: Lang, id: string): string => `${lang}/${id}`;

/** Public URL of that page's preview image. */
export const ogImageUrl = (lang: Lang, id: string): string => `/og/${ogPath(lang, id)}.png`;
