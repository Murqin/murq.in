import type { Lang } from '../lib/blog';

export interface ListItem {
    label: Record<Lang, string>;
    text: Record<Lang, string>;
    /** Shown after the text as bracketed links. */
    links?: { label: Record<Lang, string>; href: string }[];
}
