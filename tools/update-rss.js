#!/usr/bin/env node
// Yarı otomatik RSS güncelleme aracı — yeni yazı ekledikten sonra tek komut:
//
//   node tools/update-rss.js
//
// Yaptıkları:
// 1. posts.js kayıtlarını doğrular (slug <-> dosya eşleşmesi, tarih biçimi,
//    zorunlu alanlar, slug tekrarı)
// 2. posts/ altında dizinde kaydı olmayan (sahipsiz) .md dosyalarını raporlar
// 3. rss.xml'i yeniden üretir
// 4. rss.xml değiştiyse git'e stage'ler ve beslemeye eklenen yazıları listeler
'use strict';

const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const ROOT = path.join(__dirname, '..');
const SITE = 'https://murq.in';

// posts.js tarayıcı için yazılmış düz bir veri modülü (const POSTS = [...]);
// export/IIFE içermediği sürece doğrudan değerlendirilebilir
function loadPosts() {
    const src = fs.readFileSync(path.join(ROOT, 'posts.js'), 'utf8');
    return eval(src + '\nPOSTS');
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

        if (slug && !fs.existsSync(path.join(ROOT, 'posts', slug + '.md'))) {
            errors.push(label + ': posts/' + slug + '.md does not exist');
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

// posts/ altında olup dizinde kaydı olmayan .md dosyaları
function orphanFiles(posts) {
    const indexed = new Set(posts.map((p) => p.slug));
    return fs
        .readdirSync(path.join(ROOT, 'posts'))
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

    const lastBuild = posts.length
        ? new Date(posts[0].date + 'T00:00:00Z').toUTCString()
        : new Date().toUTCString();

    return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
    <channel>
        <title>murq.in — blog</title>
        <link>${SITE}/blog</link>
        <description>Notes on projects, tools, and tinkering by Icarus Murqin</description>
        <language>en</language>
        <lastBuildDate>${lastBuild}</lastBuildDate>
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
    const posts = loadPosts();

    const errors = validate(posts);
    if (errors.length) {
        for (const e of errors) console.error('error: ' + e);
        process.exit(1);
    }
    console.log(`posts.js OK (${posts.length} post${posts.length === 1 ? '' : 's'})`);

    for (const orphan of orphanFiles(posts)) {
        console.log(`warning: posts/${orphan} is not listed in posts.js (draft?)`);
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
