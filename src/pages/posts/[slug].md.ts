import type { APIRoute, GetStaticPaths } from 'astro';
import { getPosts, postSlug, type Post } from '../../lib/blog';
import { rawPost } from '../../lib/feeds';

// Raw markdown at /posts/<slug>.md — the URL the pre-Astro site already
// published (the no-JS fallback linked here) and what the "copy md" button
// fetches.
export const getStaticPaths: GetStaticPaths = async () => {
    const posts = await getPosts('en');
    return posts.map((post) => ({ params: { slug: postSlug(post) }, props: { post } }));
};

export const GET: APIRoute = ({ props }) => rawPost(props['post'] as Post, 'en');
