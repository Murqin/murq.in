// /blog rotası: ?post=<slug> isteklerinde blog.html'in genel meta
// etiketlerini yazıya özel olanlarla değiştirir. Link önizleme botları
// (Discord, Slack, X vb.) JS çalıştırmadığından bu iş sunucuda yapılmak
// zorunda. Yazı verisi posts.json'dan gelir (yazı dizininin tek kaynağı;
// blog.js ve araçlar da aynı dosyayı okur).

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

    // Statik sayfayı asset katmanından al (pretty-URL farkları için iki yol)
    const asset =
        (await fetchAsset(env, url.origin, '/blog')) ||
        (await fetchAsset(env, url.origin, '/blog.html'));
    if (!asset) return env.ASSETS.fetch(request);

    let posts = null;
    try {
        const res = await fetchAsset(env, url.origin, '/posts.json');
        if (res) posts = await res.json();
    } catch (err) {
        // posts.json okunamazsa sayfa dokunulmadan döner; istemci tarafı
        // render zaten çalışır, noscript de statik yedeğine düşer
    }
    if (!Array.isArray(posts)) return asset;

    const slug = url.searchParams.get('post');
    const post = slug ? posts.find((p) => p.slug === slug) || null : null;
    let html = await asset.text();

    // JS kapalı ziyaretçiler için noscript'i gerçek içerik linkleriyle doldur:
    // ham .md dosyaları düz metin olarak tarayıcıda okunabilir
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
