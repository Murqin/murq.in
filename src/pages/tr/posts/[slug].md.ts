import type { APIRoute, GetStaticPaths } from 'astro';
import { getPosts, postSlug, type Post } from '../../../lib/blog';
import { rawPost } from '../../../lib/feeds';

export const getStaticPaths: GetStaticPaths = async () => {
    const posts = await getPosts('tr');
    return posts.map((post) => ({ params: { slug: postSlug(post) }, props: { post } }));
};

export const GET: APIRoute = ({ props }) => rawPost(props['post'] as Post, 'tr');
