import type { APIRoute, GetStaticPaths } from 'astro';
import { markdownPages, renderMarkdown, type MarkdownPage } from '../lib/agentContent';
import { markdownPath } from '../lib/markdownPath';

export const getStaticPaths: GetStaticPaths = async () => {
    const pages = await markdownPages(new URL('https://murq.in'));
    return pages.map(page => ({
        params: { page: markdownPath(page.path).slice(1, -3) },
        props: { page },
    }));
};

export const GET: APIRoute = ({ props, site }) =>
    new Response(renderMarkdown(props['page'] as MarkdownPage, site!), {
        headers: { 'Content-Type': 'text/markdown; charset=utf-8' },
    });
