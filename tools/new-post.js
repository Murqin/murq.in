#!/usr/bin/env node
// İnteraktif yazı iskeleti — tek komutla yeni yazı açar:
//
//   node tools/new-post.js
//
// Sorar: başlık, slug (başlıktan önerilir), tarih (bugün önerilir), özet.
// Yapar: boş posts/<slug>.md oluşturur ve kaydı posts.json dizisinin başına
// ekler. Sonrası: yazıyı yaz, `node tools/update-rss.js` çalıştır.
'use strict';

const fs = require('fs');
const path = require('path');
const readline = require('node:readline');

const ROOT = path.join(__dirname, '..');

// readline.question, soru sorulmadan önce gelen satırları tamponlamaz;
// pipe'lanmış girdide satırlar kaybolur. Bu sarmalayıcı satırları kuyruğa
// alır, böylece araç hem interaktif hem `printf ... | node` ile çalışır
function makeAsker() {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });
    const buffered = [];
    const waiting = [];
    let closed = false;
    rl.on('line', (line) => {
        const resolve = waiting.shift();
        if (resolve) resolve(line);
        else buffered.push(line);
    });
    rl.on('close', () => {
        closed = true;
        while (waiting.length) waiting.shift()('');
    });
    return {
        ask(prompt) {
            process.stdout.write(prompt);
            if (buffered.length) return Promise.resolve(buffered.shift());
            if (closed) return Promise.resolve('');
            return new Promise((resolve) => waiting.push(resolve));
        },
        close() {
            rl.close();
        }
    };
}

// Türkçe karakterleri çevirip başlıktan URL-güvenli slug üretir
function slugify(title) {
    const map = { ç: 'c', ğ: 'g', ı: 'i', ö: 'o', ş: 's', ü: 'u' };
    return title
        .toLowerCase()
        .replace(/[çğıöşü]/g, (ch) => map[ch])
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '') // aksan işaretlerini at (é -> e)
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
}

function todayIso() {
    const now = new Date();
    const pad = (n) => String(n).padStart(2, '0');
    return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
}

async function main() {
    const rl = makeAsker();

    const title = (await rl.ask('Title: ')).trim();
    if (!title) {
        rl.close();
        console.error('error: title is required');
        process.exit(1);
    }

    const suggested = slugify(title) || 'post';
    const slugAnswer = (await rl.ask(`Slug [${suggested}]: `)).trim();
    const slug = slugAnswer || suggested;
    if (!/^[a-z0-9-]+$/.test(slug)) {
        rl.close();
        console.error('error: slug must be lowercase letters/digits/dashes');
        process.exit(1);
    }

    const dateAnswer = (await rl.ask(`Date [${todayIso()}]: `)).trim();
    const date = dateAnswer || todayIso();
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
        rl.close();
        console.error('error: date must be YYYY-MM-DD');
        process.exit(1);
    }

    const summary = (await rl.ask('Summary: ')).trim();
    rl.close();
    if (!summary) {
        console.error('error: summary is required');
        process.exit(1);
    }

    const mdPath = path.join(ROOT, 'posts', slug + '.md');
    const jsonPath = path.join(ROOT, 'posts.json');

    let posts;
    try {
        posts = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
        if (!Array.isArray(posts)) throw new Error('not an array');
    } catch (err) {
        console.error('error: posts.json could not be read: ' + err.message);
        process.exit(1);
    }

    if (fs.existsSync(mdPath)) {
        console.error(`error: posts/${slug}.md already exists`);
        process.exit(1);
    }
    if (posts.some((p) => p.slug === slug)) {
        console.error(`error: slug '${slug}' is already in posts.json`);
        process.exit(1);
    }

    // Kayıt dizinin başına eklenir (en yeni üstte)
    posts.unshift({ slug, title, date, summary });
    fs.writeFileSync(jsonPath, JSON.stringify(posts, null, 4) + '\n');

    // Dosya bilerek boş bırakılır: içi boş indeksli yazıyı update-rss.js
    // hata sayar, yani yazılmadan yayınlanamaz. Klasör de yoksa oluşturulur
    // (git boş klasör izlemediğinden taze klonda bulunmayabilir)
    fs.mkdirSync(path.dirname(mdPath), { recursive: true });
    fs.writeFileSync(mdPath, '');

    console.log(`created posts/${slug}.md (empty — write your post there)`);
    console.log('added record to posts.json');
    console.log('next: write the post, then run `node tools/update-rss.js`');
}

main();
