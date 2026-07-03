#!/usr/bin/env node
// Yarı otomatik RSS güncelleme aracı — yeni yazı ekledikten sonra tek komut:
//
//   node tools/update-rss.js
//
// Yaptıkları:
// 1. posts.json kayıtlarını doğrular (slug <-> dosya eşleşmesi, tarih biçimi,
//    zorunlu alanlar, slug tekrarı)
// 2. posts/ altında dizinde kaydı olmayan (sahipsiz) .md dosyalarını raporlar
// 3. Yazı içeriğini lintler: Obsidian'a özgü sözdizimi ve site parser'ının
//    desteklemediği markdown için satır numaralı uyarı verir
// 4. rss.xml'i yeniden üretir
// 5. Değişiklik varsa git'e stage'ler ve beslemeye eklenen yazıları listeler
'use strict';

const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const ROOT = path.join(__dirname, '..');
const SITE = 'https://murq.in';

// posts.json hem bu aracın hem blog sayfasının hem de functions/blog.js'in
// okuduğu tek yazı dizinidir
function loadPosts() {
    const raw = fs.readFileSync(path.join(ROOT, 'posts.json'), 'utf8');
    const posts = JSON.parse(raw);
    if (!Array.isArray(posts)) {
        throw new Error('posts.json must contain an array');
    }
    return posts;
}

// Gerçek takvim kontrolü: 2026-13-99 gibi değerler biçime uysa da elenir
function isValidDate(s) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) return false;
    const [y, m, d] = s.split('-').map(Number);
    const dt = new Date(Date.UTC(y, m - 1, d));
    return (
        dt.getUTCFullYear() === y &&
        dt.getUTCMonth() === m - 1 &&
        dt.getUTCDate() === d
    );
}

function validate(posts) {
    const errors = [];
    const seen = new Set();
    for (const post of posts) {
        const slug = post.slug || '';
        const label = slug || '<missing slug>';

        if (!/^[a-z0-9-]+$/.test(slug)) {
            errors.push(label + ': slug must be lowercase letters/digits/dashes');
        } else if (seen.has(slug)) {
            errors.push(label + ': duplicate slug');
        }
        seen.add(slug);

        if (slug) {
            const mdPath = path.join(ROOT, 'posts', slug + '.md');
            if (!fs.existsSync(mdPath)) {
                errors.push(label + ': posts/' + slug + '.md does not exist');
            } else if (!fs.readFileSync(mdPath, 'utf8').trim()) {
                // new-post.js dosyayı boş açar; yazılmadan yayınlanmasın
                errors.push(label + ': posts/' + slug + '.md is empty — write it first');
            }
        }
        if (!isValidDate(post.date || '')) {
            errors.push(
                label + ': invalid date ' + JSON.stringify(post.date) +
                ' (expected YYYY-MM-DD)'
            );
        }
        for (const field of ['title', 'summary']) {
            if (!post[field]) errors.push(label + ': missing ' + field);
        }
    }
    return errors;
}

// Yazı içeriği linti: Obsidian'a özgü sözdizimi ve site parser'ının
// (markdown.js) desteklemediği markdown için uyarı üretir. Bunlar hata
// değildir — yayını engellemez, yalnızca satır numarasıyla haber verir.
const LINT_RULES = [
    // Obsidian'a özgü
    [/!\[\[[^\]]*\]\]/, '![[...]] embed is Obsidian-only'],
    [/\[\[[^\]]+\]\]/, '[[wikilink]] is Obsidian-only — use [text](url)'],
    [/^>\s*\[!\w+\]/, 'callout (> [!...]) is Obsidian-only — renders as a plain quote'],
    [/==[^=\s][^=]*==/, '==highlight== is Obsidian-only'],
    [/%%/, '%%...%% comment is Obsidian-only — the text will be visible'],
    // Site parser'ının desteklemediği markdown
    [/^\s*\|.*\|/, 'table syntax is not supported by the site renderer'],
    [/^=+\s*$/, 'setext heading underline (===) is not supported — use # headings'],
    [/^\s+([-*]|\d+\.)\s+/, 'nested/indented list is not supported'],
    [/^\+\s+/, "list marker '+' is not supported — use '-'"],
    [/(^|[^\w`])_[^_\s][^_]*_(?=\W|$)/, '_underscore emphasis_ is not supported — use *asterisks*'],
    [/~~[^~]+~~/, '~~strikethrough~~ is not supported'],
    [/^\s*[-*]\s+\[[ xX]\]/, 'task list (- [ ]) is not supported'],
    [/\[\^\w+\]/, 'footnote is not supported'],
    [/^\s*\[[^\]]+\]:\s+\S+/, 'reference-style link is not supported — use inline [text](url)'],
    [/<[a-zA-Z][^>]*>/, 'raw HTML renders as escaped literal text'],
    [/^#{1,6}[^#\s]/, 'heading needs a space after # (or is this an Obsidian #tag?)']
];

function lintMarkdown(text) {
    const warnings = [];
    let inFence = false;
    text.split('\n').forEach((rawLine, idx) => {
        if (/^```/.test(rawLine)) {
            inFence = !inFence;
            return;
        }
        if (inFence) return; // kod bloğu içeriği serbest bölgedir
        // Satır içi kod aralıkları da lintten muaftır
        const line = rawLine.replace(/`[^`]*`/g, '');
        for (const [pattern, message] of LINT_RULES) {
            if (pattern.test(line)) warnings.push({ line: idx + 1, message });
        }
    });
    return warnings;
}

// posts/ altında olup dizinde kaydı olmayan .md dosyaları
function orphanFiles(posts) {
    const postsDir = path.join(ROOT, 'posts');
    // Hiç yazı yokken klasör repoda bulunmayabilir (git boş klasör izlemez)
    if (!fs.existsSync(postsDir)) return [];
    const indexed = new Set(posts.map((p) => p.slug));
    return fs
        .readdirSync(postsDir)
        .filter((f) => f.endsWith('.md') && !indexed.has(f.slice(0, -3)))
        .sort();
}

function escapeXml(s) {
    return String(s)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

function buildRss(posts) {
    const items = posts
        .map((post) => {
            // Kanonik yol /blog: Pages, blog.html'i 308 ile /blog'a yönlendirir
            const url = `${SITE}/blog?post=${encodeURIComponent(post.slug)}`;
            return [
                '        <item>',
                `            <title>${escapeXml(post.title)}</title>`,
                `            <link>${escapeXml(url)}</link>`,
                `            <guid isPermaLink="true">${escapeXml(url)}</guid>`,
                `            <pubDate>${new Date(post.date + 'T00:00:00Z').toUTCString()}</pubDate>`,
                `            <description>${escapeXml(post.summary)}</description>`,
                '        </item>'
            ].join('\n');
        })
        .join('\n');

    // lastBuildDate en yeni yazıdan türetilir; yazı yokken hiç basılmaz
    // (opsiyoneldir) — böylece çıktı deterministik kalır, araç boş beslemeyi
    // her çalıştırmada yeniden yazmaz
    const lastBuild = posts.length
        ? `\n        <lastBuildDate>${new Date(posts[0].date + 'T00:00:00Z').toUTCString()}</lastBuildDate>`
        : '';

    return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
    <channel>
        <title>murq.in — blog</title>
        <link>${SITE}/blog</link>
        <description>Notes on projects, tools, and tinkering by Icarus Murqin</description>
        <language>en</language>${lastBuild}
        <atom:link href="${SITE}/rss.xml" rel="self" type="application/rss+xml"/>
${items}
    </channel>
</rss>
`;
}

function rssTitles(xml) {
    return [...xml.matchAll(/<item>[\s\S]*?<title>(.*?)<\/title>/g)].map(
        (m) => m[1]
    );
}

function main() {
    let posts;
    try {
        posts = loadPosts();
    } catch (err) {
        console.error('error: posts.json could not be read: ' + err.message);
        process.exit(1);
    }

    const errors = validate(posts);
    if (errors.length) {
        for (const e of errors) console.error('error: ' + e);
        process.exit(1);
    }
    console.log(`posts.json OK (${posts.length} post${posts.length === 1 ? '' : 's'})`);

    for (const orphan of orphanFiles(posts)) {
        console.log(`warning: posts/${orphan} is not listed in posts.json (draft?)`);
    }

    for (const post of posts) {
        const md = fs.readFileSync(
            path.join(ROOT, 'posts', post.slug + '.md'),
            'utf8'
        );
        for (const w of lintMarkdown(md)) {
            console.log(`warning: posts/${post.slug}.md:${w.line}: ${w.message}`);
        }
    }

    const rssPath = path.join(ROOT, 'rss.xml');
    const oldXml = fs.existsSync(rssPath) ? fs.readFileSync(rssPath, 'utf8') : '';
    const sorted = [...posts].sort((a, b) => b.date.localeCompare(a.date));
    const newXml = buildRss(sorted);

    if (newXml === oldXml) {
        console.log('rss.xml already up to date — nothing to do');
        return;
    }
    fs.writeFileSync(rssPath, newXml);

    const oldTitles = rssTitles(oldXml);
    for (const title of rssTitles(newXml)) {
        if (!oldTitles.includes(title)) console.log('added to feed: ' + title);
    }
    console.log('rss.xml regenerated');

    // Yarı otomatik kısım: değişen rss.xml'i stage'le (git yoksa sessizce geç)
    try {
        execFileSync('git', ['-C', ROOT, 'add', 'rss.xml'], { stdio: 'ignore' });
        console.log('rss.xml staged — commit it together with your post');
    } catch (err) {
        // git kurulu değilse ya da repo değilse stage adımı atlanır
    }
}

main();
