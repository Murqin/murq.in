// /blog rotası: ?post=<slug> isteklerinde blog.html'in genel meta
// etiketlerini yazıya özel olanlarla değiştirir. Link önizleme botları
// (Discord, Slack, X vb.) JS çalıştırmadığından bu iş sunucuda yapılmak
// zorunda. Yazı verisi posts.json'dan gelir (tools/update-rss.js üretir;
// Workers eval'e izin vermediğinden posts.js doğrudan okunamaz).

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

    const slug = url.searchParams.get('post');
    if (!slug) return asset;

    let post = null;
    try {
        const res = await fetchAsset(env, url.origin, '/posts.json');
        if (res) {
            const posts = await res.json();
            post = posts.find((p) => p.slug === slug) || null;
        }
    } catch (err) {
        // posts.json okunamazsa sayfa genel meta ile döner; sayfanın kendisi
        // istemcide zaten doğru yazıyı render eder
    }
    if (!post) return asset;

    const title = escapeHtml(post.title);
    const summary = escapeHtml(post.summary);
    const canonical = escapeHtml(
        url.origin + '/blog?post=' + encodeURIComponent(post.slug)
    );

    const html = (await asset.text())
        .replace(/<title>[^<]*<\/title>/, `<title>${title} — Icarus Murqin</title>`)
        .replace(/(name="description" content=")[^"]*(")/, `$1${summary}$2`)
        .replace(/(property="og:title" content=")[^"]*(")/, `$1${title}$2`)
        .replace(/(property="og:description" content=")[^"]*(")/, `$1${summary}$2`)
        .replace(/(property="og:url" content=")[^"]*(")/, `$1${canonical}$2`);

    return new Response(html, {
        status: 200,
        headers: { 'Content-Type': 'text/html; charset=utf-8' }
    });
}
