import type { Lang } from './blog';

/**
 * Post dates are date-only in frontmatter, so they parse as UTC midnight.
 * Formatting in UTC keeps the displayed day from shifting for readers west of
 * Greenwich.
 */
export function formatPostDate(date: Date, lang: Lang = 'en'): string {
    return date.toLocaleDateString(lang === 'tr' ? 'tr-TR' : 'en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        timeZone: 'UTC',
    });
}
