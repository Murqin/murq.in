#!/usr/bin/env node
// rss.xml üretici — yeni yazı ekledikten sonra çalıştır:
//   node tools/generate-rss.js
// posts.js'i okur, repo köküne rss.xml yazar. Çıktı commit'lenir; site
// tarafında çalışma zamanı maliyeti yoktur.
'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const SITE = 'https://murq.in';

// posts.js tarayıcı için yazılmış bir veri modülü (const POSTS = [...]);
// değerlendirilip dizi olarak alınır
const src = fs.readFileSync(path.join(ROOT, 'posts.js'), 'utf8');
const POSTS = eval(src + '\nPOSTS');

function escapeXml(s) {
    return String(s)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

const posts = [...POSTS].sort((a, b) => b.date.localeCompare(a.date));

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

const xml = `<?xml version="1.0" encoding="UTF-8"?>
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

fs.writeFileSync(path.join(ROOT, 'rss.xml'), xml);
console.log(`rss.xml written (${posts.length} post${posts.length === 1 ? '' : 's'})`);
