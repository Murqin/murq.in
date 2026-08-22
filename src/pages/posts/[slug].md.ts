import { getCollection } from 'astro:content';
import type { CollectionEntry } from 'astro:content';
import type { APIRoute, GetStaticPaths } from 'astro';

// Raw markdown at /posts/<slug>.md — the URL the pre-Astro site already
// published (the no-JS fallback linked here) and what the "copy md" button
// fetches. The H1 is re-added because the title now lives in frontmatter.
export const getStaticPaths: GetStaticPaths = async () => {
    const posts = await getCollection('blog');
    return posts.map((post) => ({ params: { slug: post.id }, props: { post } }));
};

export const GET: APIRoute = ({ props }) => {
    const post = props['post'] as CollectionEntry<'blog'>;
    return new Response(`# ${post.data.title}\n\n${post.body ?? ''}`, {
        headers: { 'Content-Type': 'text/markdown; charset=utf-8' },
    });
};
