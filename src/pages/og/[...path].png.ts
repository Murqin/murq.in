import type { APIRoute, GetStaticPaths } from 'astro';
import { LANGS, getPosts, postSlug } from '../../lib/blog';
import { formatPostDate } from '../../lib/date';
import { ui } from '../../lib/i18n';
import { ogPath } from '../../lib/ogPath';
import { renderOg, type OgCard } from '../../lib/og';

// One PNG per page and language, built with the site; Base.astro points og:image at ogPath().
export const getStaticPaths = (async () => {
    const pages: { params: { path: string }; props: OgCard }[] = [];
    for (const lang of LANGS) {
        const t = ui[lang];
        const page = (id: string, card: OgCard) => pages.push({ params: { path: ogPath(lang, id) }, props: card });
        page('home', { title: 'Icarus Murqin', kicker: t.tagline });
        page('blog', { title: t.blogTitle, kicker: t.blogDescription });
        page('now', { title: t.nowTitle, kicker: t.nowIntro });
        for (const post of await getPosts(lang)) {
            page(`blog/${postSlug(post)}`, { title: post.data.title, kicker: `blog · ${formatPostDate(post.data.date, lang)}` });
        }
    }
    return pages;
}) satisfies GetStaticPaths;

export const GET: APIRoute = async ({ props }) =>
    new Response(new Uint8Array(await renderOg(props as OgCard)), { headers: { 'Content-Type': 'image/png' } });
