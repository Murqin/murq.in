import type { Lang } from '../lib/blog';

export interface ListItem {
    label: Record<Lang, string>;
    text: Record<Lang, string>;
}
