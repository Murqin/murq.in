import { getCollection } from 'astro:content';
import type { CollectionEntry } from 'astro:content';

export type Lang = 'en' | 'tr';
export type Post = CollectionEntry<'blog'>;

export const LANGS: readonly Lang[] = ['en', 'tr'];

// English keeps the unprefixed URLs it had before the blog went bilingual, so
// every link already shared (/blog/<slug>/, /posts/<slug>.md, /rss.xml) still
// resolves. Other languages live under their own prefix.
export function langPrefix(lang: Lang): string {
    return lang === 'en' ? '' : `/${lang}`;
}

// The language comes from the folder (src/content/blog/tr/<slug>.md), not from
// frontmatter: a translation is paired with its original by sharing the same
// file name, and a folder cannot disagree with itself the way a field could.
export function postLang(post: Post): Lang {
    return post.id.startsWith('tr/') ? 'tr' : 'en';
}

export function postSlug(post: Post): string {
    return postLang(post) === 'en' ? post.id : post.id.slice('tr/'.length);
}

export const blogIndexUrl = (lang: Lang): string => `${langPrefix(lang)}/blog/`;
export const postUrl = (lang: Lang, slug: string): string => `${langPrefix(lang)}/blog/${slug}/`;
export const rawPostUrl = (lang: Lang, slug: string): string => `${langPrefix(lang)}/posts/${slug}.md`;
export const rssUrl = (lang: Lang): string => `${langPrefix(lang)}/rss.xml`;

/** Posts in one language, newest first. */
export async function getPosts(lang: Lang): Promise<Post[]> {
    return (await getCollection('blog'))
        .filter((post) => postLang(post) === lang)
        .sort((a, b) => b.data.date.getTime() - a.data.date.getTime());
}

/** Every language a post exists in, keyed by language, for the switch and hreflang. */
export async function getTranslations(slug: string): Promise<Partial<Record<Lang, Post>>> {
    const found: Partial<Record<Lang, Post>> = {};
    for (const post of await getCollection('blog')) {
        if (postSlug(post) === slug) found[postLang(post)] = post;
    }
    return found;
}
