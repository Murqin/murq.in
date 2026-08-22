/**
 * Post dates are date-only in frontmatter, so they parse as UTC midnight.
 * Formatting in UTC keeps the displayed day from shifting for readers west of
 * Greenwich.
 */
export function formatPostDate(date: Date): string {
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        timeZone: 'UTC',
    });
}
