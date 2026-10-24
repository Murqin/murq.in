// Starts the compiled server against a throwaway data directory and checks the behaviour the
// production review asked for. Run after `npm run build:all` (npm test does both).
import test from 'node:test';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { mkdtempSync, writeFileSync, readFileSync, readdirSync, existsSync, rmSync, chmodSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const ORIGIN = 'http://test.local';
let nextPort = 18400;

function start(dataDir) {
  const port = nextPort++;
  const proc = spawn(process.execPath, ['server/dist/server.js'], {
    env: { ...process.env, PORT: String(port), SITE_ROOT: './dist', DATA_DIR: dataDir, ALLOWED_ORIGINS: ORIGIN },
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  let log = '';
  proc.stdout.on('data', (d) => (log += d));
  proc.stderr.on('data', (d) => (log += d));
  const exited = new Promise((r) => proc.on('exit', (code) => r(code)));
  const ready = new Promise((resolve, reject) => {
    proc.stdout.on('data', () => { if (log.includes('serving')) resolve(); });
    exited.then((code) => reject(new Error(`exited ${code}: ${log}`)));
  });
  // Tests that expect a failed boot never await ready; keep its rejection from going unhandled.
  ready.catch(() => {});
  return { proc, port, ready, exited, log: () => log, url: (p) => `http://127.0.0.1:${port}${p}` };
}

async function stop(s) {
  s.proc.kill('SIGTERM');
  return s.exited;
}

const tmp = () => mkdtempSync(join(tmpdir(), 'murqin-test-'));

test('missing counter file starts at zero', async () => {
  const dir = tmp();
  const s = start(dir);
  await s.ready;
  const r = await fetch(s.url('/api/visitors'));
  assert.deepEqual(await r.json(), { count: 0 });
  await stop(s);
  rmSync(dir, { recursive: true });
});

test('corrupt counter file stops the server and is left untouched', async () => {
  const dir = tmp();
  writeFileSync(join(dir, 'visitors.json'), '{"count": oops');
  const s = start(dir);
  assert.equal(await s.exited, 1);
  assert.equal(readFileSync(join(dir, 'visitors.json'), 'utf8'), '{"count": oops');
  rmSync(dir, { recursive: true });
});

test('unreadable counter file stops the server instead of reading as zero', { skip: process.getuid?.() === 0 }, async () => {
  const dir = tmp();
  const f = join(dir, 'visitors.json');
  writeFileSync(f, '{"count": 42}');
  chmodSync(f, 0o000);
  const s = start(dir);
  assert.equal(await s.exited, 1);
  chmodSync(f, 0o600);
  assert.equal(readFileSync(f, 'utf8'), '{"count": 42}');
  rmSync(dir, { recursive: true });
});

test('a burst of increments ends with the right count on disk', async () => {
  const dir = tmp();
  writeFileSync(join(dir, 'visitors.json'), '{"count": 100}');
  const s = start(dir);
  await s.ready;
  // 20 per client per window; use distinct client addresses so all are counted.
  const posts = Array.from({ length: 200 }, (_, i) =>
    fetch(s.url('/api/visitors'), { method: 'POST', headers: { Origin: ORIGIN, 'CF-Connecting-IP': `10.0.${i >> 8}.${i & 255}` } }));
  const codes = (await Promise.all(posts)).map((r) => r.status);
  assert.ok(codes.every((c) => c === 200));
  await stop(s);
  assert.deepEqual(JSON.parse(readFileSync(join(dir, 'visitors.json'), 'utf8')), { count: 300 });
  rmSync(dir, { recursive: true });
});

test('one client is rate-limited but still gets the count', async () => {
  const dir = tmp();
  const s = start(dir);
  await s.ready;
  const statuses = [];
  for (let i = 0; i < 25; i++) {
    const r = await fetch(s.url('/api/visitors'), { method: 'POST', headers: { Origin: ORIGIN, 'CF-Connecting-IP': '10.9.9.9' } });
    statuses.push(r.status);
    if (i === 24) assert.deepEqual(await r.json(), { count: 20 });
  }
  assert.equal(statuses.filter((c) => c === 200).length, 20);
  assert.equal(statuses.filter((c) => c === 429).length, 5);
  await stop(s);
  rmSync(dir, { recursive: true });
});

test('a forbidden origin does not count', async () => {
  const dir = tmp();
  const s = start(dir);
  await s.ready;
  const r = await fetch(s.url('/api/visitors'), { method: 'POST', headers: { Origin: 'https://evil.example' } });
  assert.equal(r.status, 403);
  await stop(s);
  rmSync(dir, { recursive: true });
});

test('malformed percent-encoding is a 404, not a 500', async () => {
  const dir = tmp();
  const s = start(dir);
  await s.ready;
  const r = await fetch(s.url('/%E0%A4%A'));
  assert.equal(r.status, 404);
  await stop(s);
  rmSync(dir, { recursive: true });
});

test('the stylesheet ships under a content-hashed /_astro/ URL with an immutable cache', async () => {
  const html = readFileSync('dist/index.html', 'utf8');
  const href = /<link rel="stylesheet" href="(\/_astro\/[^"]+\.css)"/.exec(html);
  assert.ok(href, 'index.html links a hashed stylesheet');
  assert.ok(!existsSync('dist/style.css'), 'no unversioned /style.css left in the build');
  const dir = tmp();
  const s = start(dir);
  await s.ready;
  const r = await fetch(s.url(href[1]));
  assert.equal(r.status, 200);
  assert.match(r.headers.get('cache-control'), /immutable/);
  assert.match(await r.text(), /\/assets\/fonts\//, 'font URLs survived the move');
  await stop(s);
  rmSync(dir, { recursive: true });
});

test('core routes still answer', async () => {
  const dir = tmp();
  const s = start(dir);
  await s.ready;
  const post = readdirSync('dist/blog', { withFileTypes: true }).find((d) => d.isDirectory()).name;
  for (const [p, code] of [['/', 200], ['/blog/', 200], [`/blog/${post}/`, 200], ['/rss.xml', 200], ['/sitemap-index.xml', 200],
    ['/1a2b3c4d5e6f', 200], ['/nope', 404], [`/blog?post=${post}`, 301], [`/posts/${post}.md`, 200],
    ['/tr/blog/', 200], ['/tr/blog', 200], [`/tr/blog/${post}/`, 200], [`/tr/posts/${post}.md`, 200], ['/tr/rss.xml', 200], ['/tr/', 200], ['/now/', 200], ['/tr/now/', 200],
    ['/ai/', 200], ['/tr/ai/', 200], ['/projects/', 200], ['/tr/projects/', 200], ['/colophon/', 200], ['/tr/colophon/', 200]]) {
    const r = await fetch(s.url(p), { redirect: 'manual' });
    assert.equal(r.status, code, p);
  }
  await stop(s);
  rmSync(dir, { recursive: true });
});

test('each language version of a post links to the other, and English stays the default', () => {
  const post = readdirSync('dist/tr/blog', { withFileTypes: true }).find((d) => d.isDirectory()).name;
  const en = readFileSync(`dist/blog/${post}/index.html`, 'utf8');
  const tr = readFileSync(`dist/tr/blog/${post}/index.html`, 'utf8');
  assert.match(en, /<html lang="en"/);
  assert.match(tr, /<html lang="tr"/);
  for (const html of [en, tr]) {
    assert.ok(html.includes(`hreflang="en" href="https://murq.in/blog/${post}/"`), 'hreflang en');
    assert.ok(html.includes(`hreflang="tr" href="https://murq.in/tr/blog/${post}/"`), 'hreflang tr');
    assert.ok(html.includes(`hreflang="x-default" href="https://murq.in/blog/${post}/"`), 'x-default');
    assert.match(html, /class="ai-badge"/);
  }
  // The copy button carries a summarising prompt in the page's own language.
  assert.match(en, /data-summary-prompt="Below is a blog post/);
  assert.match(tr, /data-summary-prompt="Aşağıda murq\.in/);
  assert.ok(en.includes(`href="/tr/blog/${post}/"`), 'EN post links to its Turkish version');
  assert.ok(tr.includes(`href="/blog/${post}/"`), 'TR post links to its English version');
  // The visible RSS button points at the page's own feed, on the post and on the index.
  const enIndex = readFileSync('dist/blog/index.html', 'utf8');
  const trIndex = readFileSync('dist/tr/blog/index.html', 'utf8');
  for (const html of [en, enIndex]) assert.match(html, /<a href="\/rss\.xml" class="rss-link"/);
  for (const html of [tr, trIndex]) assert.match(html, /<a href="\/tr\/rss\.xml" class="rss-link"/);
  // Separate feeds: the English one must not pick up Turkish posts.
  assert.ok(!readFileSync('dist/rss.xml', 'utf8').includes('/tr/blog/'));
  assert.ok(readFileSync('dist/tr/rss.xml', 'utf8').includes(`/tr/blog/${post}/`));
});

test('the home page exists in both languages and each links to its own blog', () => {
  const en = readFileSync('dist/index.html', 'utf8');
  const tr = readFileSync('dist/tr/index.html', 'utf8');
  assert.match(en, /<html lang="en"/);
  assert.match(tr, /<html lang="tr"/);
  for (const html of [en, tr]) {
    assert.ok(html.includes('hreflang="en" href="https://murq.in/"'), 'hreflang en');
    assert.ok(html.includes('hreflang="tr" href="https://murq.in/tr/"'), 'hreflang tr');
  }
  assert.match(en, /href="\/blog\/" class="source-link[ "]/, 'EN home links to the English blog');
  assert.match(tr, /href="\/tr\/blog\/" class="source-link[ "]/, 'TR home links to the Turkish blog');
  assert.match(tr, /Projelerim/);
  // Snapping home: each section has an id for its address, and the page ends on the hit counter
  // instead of a footer strip.
  assert.match(en, /class="snap-page" id="about-me"/);
  assert.doesNotMatch(en, /<footer/);
  assert.match(tr, /id="other-pages"[\s\S]*id="visitor-count"/);
  const count = (re, html = en) => (html.match(re) ?? []).length;
  // The home page lists only pinned projects, and links the full list (in its own language) only
  // when that list has more to show.
  const all = count(/class="project-item"/g, readFileSync('dist/tr/projects/index.html', 'utf8'));
  assert.equal(/href="\/tr\/projects\/" class="source-link[ "]/.test(tr), all > count(/class="project-item"/g, tr));
  assert.ok(count(/class="project-item"/g) >= 1 && count(/class="project-item"/g) <= 3, 'one to three projects on the home page');
  assert.ok(count(/class="snap-post-date"/g) >= 1 && count(/class="snap-post-date"/g) <= 6, 'one to six posts on the home page');
  assert.doesNotMatch(readFileSync('dist/tr/blog/index.html', 'utf8'), /<footer/);
  // The Turkish blog leads back to the Turkish home, not the English one.
  assert.match(readFileSync('dist/tr/blog/index.html', 'utf8'), /href="\/tr\/" class="blog-nav-link[ "]/);
});

test('every page picks its light or dark theme in the head, before any stylesheet loads', () => {
  for (const page of ['dist/index.html', 'dist/tr/blog/index.html', 'dist/blog/opus-cheats-and-sketches/index.html', 'dist/404.html']) {
    const html = readFileSync(page, 'utf8');
    const script = html.indexOf("localStorage.getItem('theme')");
    const css = html.indexOf('rel="stylesheet"');
    assert.ok(script > 0 && script < html.indexOf('</head>'), `${page}: theme script in head`);
    assert.ok(css === -1 || script < css, `${page}: theme set before the stylesheet`);
  }
  assert.match(readFileSync('dist/index.html', 'utf8'), /class="theme-btn"/);
  // Every icon the head links to is in the build.
  for (const [, href] of readFileSync('dist/index.html', 'utf8').matchAll(/rel="(?:icon|apple-touch-icon)"[^>]*href="([^"]+)"/g)) {
    assert.ok(existsSync(`dist${href}`), href);
  }
});

test('a miss under /tr/ gets the Turkish 404 page, any other miss the English one', async () => {
  const dir = tmp();
  const s = start(dir);
  await s.ready;
  const tr = await fetch(s.url('/tr/nope'));
  assert.equal(tr.status, 404);
  assert.match(await tr.text(), /<html lang="tr"/);
  const en = await fetch(s.url('/nope'));
  assert.equal(en.status, 404);
  assert.match(await en.text(), /<html lang="en"/);
  await stop(s);
  rmSync(dir, { recursive: true });
});

test('long posts get a contents list and every post a reading time', () => {
  const html = readFileSync('dist/blog/opus-cheats-and-sketches/index.html', 'utf8');
  assert.match(html, /class="post-toc"/);
  assert.match(html, /href="#from-fable-5-to-opus-55"/);
  assert.match(html, /\d+ min read/);
  assert.match(readFileSync('dist/tr/blog/opus-cheats-and-sketches/index.html', 'utf8'), /\d+ dk okuma/);
  // Posts are CC0, the rest of the site is not: the notice is on each post and on the colophon,
  // which carries the site's licences.
  assert.match(html, /publicdomain\/zero\/1\.0\//);
  assert.doesNotMatch(readFileSync('dist/index.html', 'utf8'), /publicdomain\/zero/);
  const colophon = readFileSync('dist/tr/colophon/index.html', 'utf8');
  for (const needle of ['publicdomain/zero/1.0/', 'blob/main/LICENSE"', 'LICENSES.md', 'github.com/murqin/murq.in"']) {
    assert.ok(colophon.includes(needle), `colophon links ${needle}`);
  }
});

test('the AI badge on a post links to the /ai page in the post language', () => {
  assert.match(readFileSync('dist/blog/opus-cheats-and-sketches/index.html', 'utf8'), /class="ai-badge"[\s\S]*?href="\/ai\/"/);
  assert.match(readFileSync('dist/tr/blog/opus-cheats-and-sketches/index.html', 'utf8'), /class="ai-badge"[\s\S]*?href="\/tr\/ai\/"/);
});

test('every page points og:image at a preview generated for it, in its own language', () => {
  const png = (p) => readFileSync(`dist${p}`).subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]));
  for (const [page, image] of [
    ['/index.html', '/og/en/home.png'],
    ['/tr/index.html', '/og/tr/home.png'],
    ['/tr/now/index.html', '/og/tr/now.png'],
    ['/ai/index.html', '/og/en/ai.png'],
    ['/tr/projects/index.html', '/og/tr/projects.png'],
    ['/404.html', '/og/en/404.png'],
    ['/blog/opus-cheats-and-sketches/index.html', '/og/en/blog/opus-cheats-and-sketches.png'],
    ['/tr/blog/opus-cheats-and-sketches/index.html', '/og/tr/blog/opus-cheats-and-sketches.png'],
  ]) {
    assert.ok(readFileSync(`dist${page}`, 'utf8').includes(`property="og:image" content="https://murq.in${image}"`), page);
    assert.ok(png(image), `${image} is a PNG`);
  }
});

test('preview images draw Turkish letters, not empty boxes', async () => {
  // Node 22 strips the types itself, so the real renderer is exercised, not a copy of its config.
  const { renderOg } = await import('../src/lib/og.ts');
  // Cyrillic is in neither subset: in a monospace font its empty box matches a missing ş exactly.
  const missing = await renderOg({ title: 'Ж', kicker: '' });
  for (const letter of ['ş', 'ğ', 'ı', 'İ', 'Ş', 'Ğ']) {
    const png = await renderOg({ title: letter, kicker: '' });
    assert.ok(!png.equals(missing), `${letter} is drawn`);
  }
});
