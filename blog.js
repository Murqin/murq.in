// Blog sayfası: parametresiz açılışta yazı listesi, ?post=<slug> ile tek yazı.
// Veri posts.js'ten, içerik posts/<slug>.md'den gelir; markdown.js çevirir.

function blogMessage(root, message) {
    const p = document.createElement('p');
    p.className = 'blog-empty';
    p.textContent = message;
    root.replaceChildren(p);
}

function formatPostDate(isoDate) {
    const d = new Date(isoDate + 'T00:00:00Z');
    return d.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        timeZone: 'UTC'
    });
}

function renderPostList(root, posts) {
    if (!posts.length) {
        blogMessage(root, 'No posts yet.');
        return;
    }
    const frag = document.createDocumentFragment();
    for (const post of posts) {
        const item = document.createElement('a');
        item.className = 'post-list-item';
        item.href = 'blog.html?post=' + encodeURIComponent(post.slug);

        const header = document.createElement('div');
        header.className = 'post-list-header';
        const title = document.createElement('span');
        title.className = 'post-list-title';
        title.textContent = post.title;
        const date = document.createElement('span');
        date.className = 'post-list-date';
        date.textContent = formatPostDate(post.date);
        header.append(title, date);

        const summary = document.createElement('p');
        summary.className = 'post-list-summary';
        summary.textContent = post.summary;

        item.append(header, summary);
        frag.appendChild(item);
    }
    root.replaceChildren(frag);
}

async function renderPost(root, post) {
    document.title = post.title + ' — Icarus Murqin';
    blogMessage(root, 'Loading…');

    try {
        const res = await fetch('posts/' + encodeURIComponent(post.slug) + '.md');
        const type = res.headers.get('Content-Type') || '';
        // _redirects catch-all eksik dosyada index.html'i 200 ile döndürür;
        // markdown yerine HTML gelirse dosya yok demektir
        if (!res.ok || type.includes('text/html')) {
            throw new Error('post file missing');
        }
        const md = await res.text();

        const back = document.createElement('a');
        back.className = 'post-back';
        back.href = 'blog.html';
        back.textContent = '← all posts';

        const article = document.createElement('article');
        article.className = 'post-content';
        const title = document.createElement('h1');
        title.className = 'post-title';
        title.textContent = post.title;
        const meta = document.createElement('p');
        meta.className = 'post-meta';
        meta.textContent = formatPostDate(post.date);
        const body = document.createElement('div');
        body.className = 'post-body';
        // Güvenli: markdownToHtml tüm girdiyi escape eder, yalnızca kendi
        // ürettiği etiketleri ve beyaz listeli URL'leri çıktıya koyar
        body.innerHTML = markdownToHtml(md);
        article.append(title, meta, body);

        root.replaceChildren(back, article);
    } catch (err) {
        console.warn('Post could not be loaded:', err);
        blogMessage(root, 'This post could not be loaded.');
    }
}

(function initBlog() {
    const root = document.getElementById('blog-root');
    if (!root) return;

    if (typeof POSTS === 'undefined' || typeof markdownToHtml !== 'function') {
        blogMessage(root, 'Posts failed to load — please refresh the page.');
        return;
    }

    const posts = [...POSTS].sort((a, b) => b.date.localeCompare(a.date));
    const slug = new URLSearchParams(window.location.search).get('post');

    if (!slug) {
        renderPostList(root, posts);
        return;
    }

    const post = posts.find((p) => p.slug === slug);
    if (!post) {
        blogMessage(root, 'Post not found.');
        const back = document.createElement('a');
        back.className = 'post-back';
        back.href = 'blog.html';
        back.textContent = '← all posts';
        root.prepend(back);
        return;
    }
    renderPost(root, post);
})();
