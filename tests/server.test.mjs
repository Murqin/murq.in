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
    ['/tr/blog/', 200], ['/tr/blog', 200], [`/tr/blog/${post}/`, 200], [`/tr/posts/${post}.md`, 200], ['/tr/rss.xml', 200], ['/tr/', 200], ['/now/', 200], ['/tr/now/', 200]]) {
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
  assert.ok(en.includes('href="/blog/" class="source-link"'), 'EN home links to the English blog');
  assert.ok(tr.includes('href="/tr/blog/" class="source-link"'), 'TR home links to the Turkish blog');
  assert.match(tr, /Projelerim/);
  // The Turkish blog leads back to the Turkish home, not the English one.
  assert.ok(readFileSync('dist/tr/blog/index.html', 'utf8').includes('href="/tr/" class="blog-nav-link"'));
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
});

test('every page points og:image at a preview generated for it, in its own language', () => {
  const png = (p) => readFileSync(`dist${p}`).subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]));
  for (const [page, image] of [
    ['/index.html', '/og/en/home.png'],
    ['/tr/index.html', '/og/tr/home.png'],
    ['/tr/now/index.html', '/og/tr/now.png'],
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
