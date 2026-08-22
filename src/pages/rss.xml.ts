import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import type { APIContext } from 'astro';

export async function GET(context: APIContext): Promise<Response> {
    const posts = (await getCollection('blog')).sort(
        (a, b) => b.data.date.getTime() - a.data.date.getTime()
    );

    return rss({
        title: 'murq.in — blog',
        description: 'Notes on projects, tools, and tinkering by Icarus Murqin',
        // context.site comes from `site` in astro.config.mjs, which is always set.
        site: context.site ?? 'https://murq.in',
        xmlns: { atom: 'http://www.w3.org/2005/Atom' },
        customData:
            '<language>en</language>' +
            '<atom:link href="https://murq.in/rss.xml" rel="self" type="application/rss+xml"/>',
        items: posts.map((post) => ({
            title: post.data.title,
            description: post.data.summary,
            pubDate: post.data.date,
            link: `/blog/${post.id}/`,
        })),
    });
}
