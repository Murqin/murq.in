// Static host for the built Astro site, plus the two bits of behaviour that
// static files cannot provide: the seed-URL fallback and the visitor counter.
// Runtime dependencies: none beyond Node itself.

import { createServer, type IncomingMessage, type ServerResponse } from 'node:http';
import { createReadStream } from 'node:fs';
import { stat, readFile, writeFile, rename, mkdir, rm } from 'node:fs/promises';
import { join, normalize, resolve, extname, sep } from 'node:path';

const PORT = Number(process.env['PORT'] ?? 8080);
// resolve() so the containment check below compares two absolute, normalized
// paths — a relative SITE_ROOT would never match and every file would 404.
const SITE_ROOT = resolve(process.env['SITE_ROOT'] ?? '/srv/site');
const DATA_DIR = process.env['DATA_DIR'] ?? '/data';
const COUNTER_FILE = join(DATA_DIR, 'visitors.json');

// Only these origins may increment the counter. Comma-separated so the staging
// host can be allowed during the migration without a rebuild.
const ALLOWED_ORIGINS = (process.env['ALLOWED_ORIGINS'] ?? 'https://murq.in')
    .split(',')
    .map((o) => o.trim())
    .filter(Boolean);

// A 12-char hex path is a theme seed, not a page: it renders the home page.
// Deliberately narrower than the old `/* /index.html 200` catch-all, which
// answered every typo with a soft 404.
const SEED_PATH = /^\/[0-9a-f]{12}$/i;

const MIME: Record<string, string> = {
    '.html': 'text/html; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.js': 'text/javascript; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.xml': 'application/xml; charset=utf-8',
    '.txt': 'text/plain; charset=utf-8',
    '.md': 'text/markdown; charset=utf-8',
    '.svg': 'image/svg+xml',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.webp': 'image/webp',
    '.ico': 'image/x-icon',
    '.woff2': 'font/woff2',
    '.woff': 'font/woff',
};

function cacheControl(pathname: string, ext: string): string {
    // Vite writes content-hashed filenames under /_astro, so they can be pinned.
    if (pathname.startsWith('/_astro/')) return 'public, max-age=31536000, immutable';
    if (ext === '.woff2' || ext === '.woff') return 'public, max-age=604800';
    if (ext === '.html' || ext === '') return 'public, max-age=0, must-revalidate';
    return 'public, max-age=3600';
}

/* ------------------------------- counter ------------------------------- */

let visitorCount = 0;
// Serialises writes so two increments in the same tick cannot interleave.
let writeChain: Promise<unknown> = Promise.resolve();

/**
 * A read-only /data is the one failure that is invisible at runtime: the count
 * still increments in memory and the API keeps answering, but every container
 * recreation silently rolls it back. Fail loudly at boot instead.
 */
async function checkDataDirWritable(): Promise<void> {
    const probe = join(DATA_DIR, '.write-probe');
    try {
        await writeFile(probe, '');
        await rm(probe);
    } catch (err) {
        console.error(
            `FATAL: ${DATA_DIR} is not writable — the visitor count would reset on ` +
                `every restart. Give the mounted directory to uid ${process.getuid?.() ?? '?'} ` +
                `(chown -R 1000:1000 <host dir>).`
        );
        console.error(err);
        process.exit(1);
    }
}

async function loadCount(): Promise<void> {
    try {
        const raw = await readFile(COUNTER_FILE, 'utf8');
        const parsed: unknown = JSON.parse(raw);
        const value =
            typeof parsed === 'object' && parsed !== null && 'count' in parsed
                ? Number((parsed as { count: unknown }).count)
                : NaN;
        visitorCount = Number.isFinite(value) && value >= 0 ? Math.floor(value) : 0;
    } catch {
        // First boot, or an unreadable file: start from zero rather than refusing
        // to serve. Seed the file by hand to carry a count over from elsewhere.
        visitorCount = 0;
    }
    console.log(`visitor count loaded: ${visitorCount}`);
}

function persistCount(): void {
    const value = visitorCount;
    writeChain = writeChain
        .then(async () => {
            // Write-then-rename: a crash mid-write leaves the old file intact
            // instead of a truncated one.
            const tmp = `${COUNTER_FILE}.tmp`;
            await writeFile(tmp, JSON.stringify({ count: value }), 'utf8');
            await rename(tmp, COUNTER_FILE);
        })
        .catch((err: unknown) => {
            console.error('visitor count could not be persisted:', err);
        });
}

/* ------------------------------ responses ------------------------------ */

function sendJson(res: ServerResponse, status: number, body: unknown): void {
    const payload = JSON.stringify(body);
    res.writeHead(status, {
        'Content-Type': 'application/json; charset=utf-8',
        'Content-Length': Buffer.byteLength(payload),
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'no-store',
    });
    res.end(payload);
}

function redirect(res: ServerResponse, location: string): void {
    res.writeHead(301, { Location: location, 'Cache-Control': 'public, max-age=3600' });
    res.end();
}

/**
 * Resolves a URL path to a file inside SITE_ROOT, following the directory
 * build format (`/blog/` and `/blog` both mean `blog/index.html`).
 * Returns null when nothing matches or the path escapes the root.
 */
async function resolveFile(pathname: string): Promise<string | null> {
    const decoded = decodeURIComponent(pathname);
    // normalize() collapses ".." before the prefix check, so traversal cannot
    // slip through by encoding.
    const candidate = normalize(join(SITE_ROOT, decoded));
    if (candidate !== SITE_ROOT && !candidate.startsWith(SITE_ROOT + sep)) return null;

    try {
        const info = await stat(candidate);
        if (info.isFile()) return candidate;
        if (info.isDirectory()) {
            const index = join(candidate, 'index.html');
            const indexInfo = await stat(index);
            if (indexInfo.isFile()) return index;
        }
    } catch {
        return null;
    }
    return null;
}

async function sendFile(
    req: IncomingMessage,
    res: ServerResponse,
    filePath: string,
    pathname: string,
    status = 200
): Promise<void> {
    const info = await stat(filePath);
    const ext = extname(filePath);
    const etag = `W/"${info.size.toString(16)}-${info.mtimeMs.toString(16)}"`;

    if (req.headers['if-none-match'] === etag) {
        res.writeHead(304, { ETag: etag, 'Cache-Control': cacheControl(pathname, ext) });
        res.end();
        return;
    }

    res.writeHead(status, {
        'Content-Type': MIME[ext] ?? 'application/octet-stream',
        'Content-Length': info.size,
        'Cache-Control': cacheControl(pathname, ext),
        ETag: etag,
        'X-Content-Type-Options': 'nosniff',
    });

    if (req.method === 'HEAD') {
        res.end();
        return;
    }
    createReadStream(filePath).pipe(res);
}

async function sendNotFound(req: IncomingMessage, res: ServerResponse): Promise<void> {
    const page = await resolveFile('/404.html');
    if (page) {
        await sendFile(req, res, page, '/404.html', 404);
        return;
    }
    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Not found');
}

/* -------------------------------- routes ------------------------------- */

async function handleVisitors(req: IncomingMessage, res: ServerResponse): Promise<void> {
    if (req.method === 'GET' || req.method === 'HEAD') {
        sendJson(res, 200, { count: visitorCount });
        return;
    }
    if (req.method !== 'POST') {
        sendJson(res, 405, { error: 'Method not allowed' });
        return;
    }

    const origin = req.headers.origin;
    if (!origin || !ALLOWED_ORIGINS.includes(origin)) {
        sendJson(res, 403, { error: 'Forbidden' });
        return;
    }

    // Node runs this handler to completion on one thread, so unlike the
    // Cloudflare KV get/put pair this increment cannot lose a concurrent visit.
    visitorCount += 1;
    persistCount();
    sendJson(res, 200, { count: visitorCount });
}

async function handle(req: IncomingMessage, res: ServerResponse): Promise<void> {
    const url = new URL(req.url ?? '/', 'http://localhost');
    const pathname = url.pathname;

    if (pathname === '/api/visitors') {
        await handleVisitors(req, res);
        return;
    }

    if (req.method !== 'GET' && req.method !== 'HEAD') {
        res.writeHead(405, { Allow: 'GET, HEAD' });
        res.end();
        return;
    }

    // Pre-Astro permalinks. /blog?post=<slug> was the only URL every post had.
    if (pathname === '/blog' || pathname === '/blog/' || pathname === '/blog.html') {
        const slug = url.searchParams.get('post');
        if (slug) {
            redirect(res, `/blog/${encodeURIComponent(slug)}/`);
            return;
        }
        if (pathname === '/blog.html') {
            redirect(res, '/blog/');
            return;
        }
    }

    if (SEED_PATH.test(pathname)) {
        const home = await resolveFile('/index.html');
        if (home) {
            await sendFile(req, res, home, '/index.html');
            return;
        }
    }

    const file = await resolveFile(pathname);
    if (file) {
        await sendFile(req, res, file, pathname);
        return;
    }

    await sendNotFound(req, res);
}

/* --------------------------------- boot -------------------------------- */

await mkdir(DATA_DIR, { recursive: true });
await checkDataDirWritable();
await loadCount();

const server = createServer((req, res) => {
    handle(req, res).catch((err: unknown) => {
        console.error(`${req.method} ${req.url} failed:`, err);
        if (!res.headersSent) res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('Internal server error');
    });
});

server.listen(PORT, () => {
    console.log(`murq.in serving ${SITE_ROOT} on :${PORT}`);
    console.log(`increment origins: ${ALLOWED_ORIGINS.join(', ')}`);
});

// Without this the runtime waits out its full stop timeout and then SIGKILLs —
// on every auto-update redeploy, with a counter write possibly still in flight.
for (const signal of ['SIGTERM', 'SIGINT'] as const) {
    process.on(signal, () => {
        console.log(`${signal} received, shutting down`);
        server.close(() => {
            // Let the last persist settle before the process goes away.
            void writeChain.finally(() => process.exit(0));
        });
        // Don't hang forever on a wedged keep-alive connection.
        setTimeout(() => process.exit(0), 5000).unref();
    });
}
