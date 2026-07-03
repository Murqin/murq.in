// Blog sayfası: parametresiz açılışta yazı listesi, ?post=<slug> ile tek yazı.
// Veri posts.js'ten, içerik posts/<slug>.md'den gelir; markdown.js çevirir.

function blogMessage(root, message) {
    const p = document.createElement('p');
    p.className = 'blog-empty';
    p.textContent = message;
    root.replaceChildren(p);
}

// Mevcut tema seed'ini linke ekler ki sayfa geçişinde tema korunsun
// (currentSeeds script.js'te tanımlanır; o yüklenmediyse link sade kalır)
function withSeed(url) {
    if (typeof currentSeeds === 'undefined') return url;
    return url + (url.includes('?') ? '&' : '?') + 's=' + currentSeeds.hex;
}

// Yazı görünümünde üst bar "← murq.in" yerine listeye döner; böylece
// sayfada tek bir geri yolu bulunur
function pointNavBackToList() {
    const nav = document.getElementById('blog-nav-back');
    if (!nav) return;
    // script.js'in seed-link güncellemesi bu linki artık ele almasın
    nav.removeAttribute('data-seed-nav');
    nav.href = withSeed('/blog');
    nav.textContent = '← all posts';
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

// Yazının ham markdown'ını (posts.js'teki başlıkla birlikte) panoya kopyalar
let copyMdTimer = null;

function copyMarkdownButton(post, md) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'copy-md-btn';
    btn.textContent = 'copy md';
    btn.addEventListener('click', () => {
        navigator.clipboard.writeText('# ' + post.title + '\n\n' + md);
        btn.textContent = 'copied!';
        clearTimeout(copyMdTimer);
        copyMdTimer = setTimeout(() => { btn.textContent = 'copy md'; }, 1500);
    });
    return btn;
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
        // Kanonik yol /blog: Pages, blog.html'i 308 ile /blog'a yönlendirir
        item.href = withSeed('/blog?post=' + encodeURIComponent(post.slug));

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

        const article = document.createElement('article');
        article.className = 'post-content';
        const title = document.createElement('h1');
        title.className = 'post-title';
        title.textContent = post.title;

        const actions = document.createElement('div');
        actions.className = 'post-actions';
        const meta = document.createElement('p');
        meta.className = 'post-meta';
        meta.textContent = formatPostDate(post.date);
        actions.append(meta, copyMarkdownButton(post, md));

        const body = document.createElement('div');
        body.className = 'post-body';
        // Güvenli: markdownToHtml tüm girdiyi escape eder, yalnızca kendi
        // ürettiği etiketleri ve beyaz listeli URL'leri çıktıya koyar
        body.innerHTML = markdownToHtml(md);
        article.append(title, actions, body);

        root.replaceChildren(article);
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
    pointNavBackToList();
    if (!post) {
        blogMessage(root, 'Post not found.');
        return;
    }
    renderPost(root, post);
})();
