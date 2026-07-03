// Blog page: the post list by default, a single post via ?post=<slug>.
// The index is fetched from posts.json, content from posts/<slug>.md;
// markdown.js renders it.

function blogMessage(root, message) {
    const p = document.createElement('p');
    p.className = 'blog-empty';
    p.textContent = message;
    root.replaceChildren(p);
}

// Append the current theme seed so the theme survives navigation
// (currentSeeds comes from script.js; without it the link stays plain)
function withSeed(url) {
    if (typeof currentSeeds === 'undefined') return url;
    return url + (url.includes('?') ? '&' : '?') + 's=' + currentSeeds.hex;
}

// On the post view the top bar points back to the list instead of
// "← murq.in", so each view has exactly one way back
function pointNavBackToList() {
    const nav = document.getElementById('blog-nav-back');
    if (!nav) return;
    // Stop script.js's seed-link pass from reclaiming this link
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

// Copies the post's raw markdown (prefixed with the title from the index)
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
        // Canonical path is /blog: Pages 308-redirects blog.html there
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
        // The _redirects catch-all serves index.html with 200 for missing
        // files; an HTML content type means the file doesn't exist
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
        // Safe: markdownToHtml escapes all input and only emits its own
        // tags and allow-listed URLs
        body.innerHTML = markdownToHtml(md);
        article.append(title, actions, body);

        root.replaceChildren(article);
    } catch (err) {
        console.warn('Post could not be loaded:', err);
        blogMessage(root, 'This post could not be loaded.');
    }
}

(async function initBlog() {
    const root = document.getElementById('blog-root');
    if (!root) return;

    if (typeof markdownToHtml !== 'function') {
        blogMessage(root, 'Posts failed to load — please refresh the page.');
        return;
    }

    let posts;
    try {
        const res = await fetch('/posts.json');
        // The _redirects catch-all serves index.html with 200 for missing
        // files; if JSON parsing fails, the index doesn't exist
        if (!res.ok) throw new Error('http ' + res.status);
        posts = await res.json();
        if (!Array.isArray(posts)) throw new Error('unexpected payload');
    } catch (err) {
        console.warn('Post index could not be loaded:', err);
        blogMessage(root, 'Posts failed to load — please refresh the page.');
        return;
    }

    posts.sort((a, b) => b.date.localeCompare(a.date));
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
