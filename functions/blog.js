// /blog route: for ?post=<slug> requests, swaps blog.html's generic meta
// tags for the post's own. Link-preview bots (Discord, Slack, X, …) don't
// run JS, so this has to happen server-side. Post data comes from
// posts.json (the single source of the post index).

function escapeHtml(s) {
    return String(s)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

async function fetchAsset(env, origin, path) {
    const res = await env.ASSETS.fetch(new URL(path, origin));
    return res.ok ? res : null;
}

export async function onRequestGet(context) {
    const { request, env } = context;
    const url = new URL(request.url);

    // Fetch the static page from the asset layer (two paths to cover pretty-URL differences)
    const asset =
        (await fetchAsset(env, url.origin, '/blog')) ||
        (await fetchAsset(env, url.origin, '/blog.html'));
    if (!asset) return env.ASSETS.fetch(request);

    let posts = null;
    try {
        const res = await fetchAsset(env, url.origin, '/posts.json');
        if (res) posts = await res.json();
    } catch (err) {
        // If posts.json can't be read the page goes out untouched; client-side
        // rendering still works and noscript falls back to its static copy
    }
    if (!Array.isArray(posts)) return asset;

    const slug = url.searchParams.get('post');
    const post = slug ? posts.find((p) => p.slug === slug) || null : null;
    let html = await asset.text();

    // Fill the noscript with real content links for no-JS visitors:
    // raw .md files read fine as plain text in the browser
    const mdLink = (p) =>
        `<a href="/posts/${encodeURIComponent(p.slug)}.md">${escapeHtml(p.title)}</a>`;
    let noscript = null;
    if (post) {
        noscript =
            '<p class="blog-empty">JavaScript is off — read this post as plain markdown: ' +
            mdLink(post) + '.</p>';
    } else if (!slug && posts.length) {
        noscript =
            '<p class="blog-empty">JavaScript is off — read the posts as plain markdown:</p>' +
            '<ul class="blog-empty">' +
            posts
                .map((p) => `<li>${mdLink(p)} — ${escapeHtml(p.date)}</li>`)
                .join('') +
            '</ul>';
    }
    if (noscript) {
        html = html.replace(
            /<noscript>[\s\S]*?<\/noscript>/,
            '<noscript>' + noscript + '</noscript>'
        );
    }

    if (post) {
        const title = escapeHtml(post.title);
        const summary = escapeHtml(post.summary);
        const canonical = escapeHtml(
            url.origin + '/blog?post=' + encodeURIComponent(post.slug)
        );
        html = html
            .replace(/<title>[^<]*<\/title>/, `<title>${title} — Icarus Murqin</title>`)
            .replace(/(name="description" content=")[^"]*(")/, `$1${summary}$2`)
            .replace(/(property="og:title" content=")[^"]*(")/, `$1${title}$2`)
            .replace(/(property="og:description" content=")[^"]*(")/, `$1${summary}$2`)
            .replace(/(property="og:url" content=")[^"]*(")/, `$1${canonical}$2`);
    }

    return new Response(html, {
        status: 200,
        headers: { 'Content-Type': 'text/html; charset=utf-8' }
    });
}
