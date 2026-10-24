import rss from '@astrojs/rss';
import type { APIContext } from 'astro';
import { getPosts, postSlug, postUrl, rssUrl, type Lang, type Post } from './blog';
import { ui } from './i18n';

// One feed per language rather than a mixed one: /rss.xml subscribers signed up
// for English and would otherwise get every post twice, once in Turkish.
export async function blogFeed(context: APIContext, lang: Lang): Promise<Response> {
    const posts = await getPosts(lang);
    // context.site comes from `site` in astro.config.mjs, which is always set.
    const site = context.site ?? new URL('https://murq.in');
    return rss({
        title: lang === 'en' ? 'murq.in — blog' : `murq.in — blog (${lang.toUpperCase()})`,
        description: ui[lang].rssDescription,
        site,
        xmlns: { atom: 'http://www.w3.org/2005/Atom' },
        customData:
            `<language>${lang}</language>` +
            `<atom:link href="${new URL(rssUrl(lang), site)}" rel="self" type="application/rss+xml"/>`,
        items: posts.map((post) => ({
            title: post.data.title,
            description: post.data.summary,
            pubDate: post.data.date,
            link: postUrl(lang, postSlug(post)),
        })),
    });
}

// The H1 is re-added because the title lives in frontmatter, and the AI note
// travels with the text so a copied post keeps its disclosure.
export function rawPost(post: Post, lang: Lang): Response {
    const note = post.data.aiAssisted ? `> ${ui[lang].aiNote}\n\n` : '';
    return new Response(`# ${post.data.title}\n\n${note}${post.body ?? ''}`, {
        headers: { 'Content-Type': 'text/markdown; charset=utf-8' },
    });
}
