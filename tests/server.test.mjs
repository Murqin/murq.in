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
    ['/tr/blog/', 200], ['/tr/blog', 200], [`/tr/blog/${post}/`, 200], [`/tr/posts/${post}.md`, 200], ['/tr/rss.xml', 200]]) {
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
  // Separate feeds: the English one must not pick up Turkish posts.
  assert.ok(!readFileSync('dist/rss.xml', 'utf8').includes('/tr/blog/'));
  assert.ok(readFileSync('dist/tr/rss.xml', 'utf8').includes(`/tr/blog/${post}/`));
});
