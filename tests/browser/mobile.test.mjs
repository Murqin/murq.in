import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { mkdtemp, rm } from 'node:fs/promises';
import { createServer } from 'node:net';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { once } from 'node:events';
import test from 'node:test';

const root = new URL('../../', import.meta.url);
const scratch = await mkdtemp(join(tmpdir(), 'murqin-mobile-'));
const probe = createServer();
probe.listen(0, '127.0.0.1');
await once(probe, 'listening');
const port = probe.address().port;
await new Promise(resolve => probe.close(resolve));
const origin = `http://localhost:${port}`;
const processes = [];
let socket;

function launch(command, args, options, ready) {
    const child = spawn(command, args, { cwd: root, ...options });
    processes.push(child);
    return new Promise((resolve, reject) => {
        let output = '';
        const timer = setTimeout(() => reject(new Error(`Startup timed out: ${output}`)), 15000);
        child.once('error', error => { clearTimeout(timer); reject(error); });
        child.once('exit', code => { clearTimeout(timer); reject(new Error(`Process exited (${code}): ${output}`)); });
        const read = data => {
            output += data;
            const match = output.match(ready);
            if (match) { clearTimeout(timer); resolve(match); }
        };
        child.stdout.on('data', read);
        child.stderr.on('data', read);
    });
}

await test('mobile layout and touch navigation', { timeout: 120000 }, async t => {
    t.after(async () => {
        socket?.close();
        await Promise.all(processes.map(async child => {
            if (child.exitCode !== null) return;
            const exited = once(child, 'exit');
            child.kill('SIGTERM');
            await exited;
        }));
        await rm(scratch, { recursive: true, force: true });
    });
    await launch(process.execPath, ['server/dist/server.js'], {
        env: { ...process.env, PORT: String(port), SITE_ROOT: join(root.pathname, 'dist'), DATA_DIR: join(scratch, 'counter'), ALLOWED_ORIGINS: origin },
    }, /serving .* on :\d+/);
    const chrome = await launch(process.env.CHROME_BIN || 'google-chrome', [
        '--headless=new', '--no-sandbox', '--disable-gpu', '--remote-debugging-port=0',
        `--user-data-dir=${join(scratch, 'chrome')}`, 'about:blank',
    ], {}, /DevTools listening on ws:\/\/127\.0\.0\.1:(\d+)\//);
    const targets = await (await fetch(`http://127.0.0.1:${chrome[1]}/json`)).json();
    socket = new WebSocket(targets.find(target => target.type === 'page').webSocketDebuggerUrl);
    await once(socket, 'open');
    let sequence = 0;
    const pending = new Map();
    socket.addEventListener('message', ({ data }) => {
        const message = JSON.parse(data);
        if (!message.id) return;
        const request = pending.get(message.id);
        pending.delete(message.id);
        message.error ? request.reject(new Error(JSON.stringify(message.error))) : request.resolve(message.result);
    });
    const call = (method, params = {}) => new Promise((resolve, reject) => {
        const id = ++sequence;
        pending.set(id, { resolve, reject });
        socket.send(JSON.stringify({ id, method, params }));
    });
    const evaluate = async expression => {
        const result = await call('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true });
        assert.ok(!result.exceptionDetails, JSON.stringify(result.exceptionDetails));
        return result.result.value;
    };
    const ready = async path => {
        for (let attempt = 0; attempt < 200; attempt++) {
            if (await evaluate(`location.pathname === ${JSON.stringify(path.split('?')[0])} && document.readyState === 'complete' && !!document.querySelector('.seed-star')?.dataset.seed`)) {
                await evaluate('document.fonts.ready.then(() => true)');
                return;
            }
            await new Promise(resolve => setTimeout(resolve, 25));
        }
        assert.fail(`Page did not become ready: ${path}`);
    };
    const navigate = async path => {
        await call('Page.navigate', { url: origin + path });
        await ready(path);
    };
    const tap = async selector => {
        const point = await evaluate(`(() => {const e=document.querySelector(${JSON.stringify(selector)});e.scrollIntoView({block:'center'});const r=e.getBoundingClientRect();return {x:r.x+r.width/2,y:r.y+r.height/2};})()`);
        await call('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [point] });
        await call('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
    };
    await call('Page.enable');
    await call('Emulation.setTouchEmulationEnabled', { enabled: true, maxTouchPoints: 5 });
    await call('Browser.grantPermissions', { origin, permissions: ['clipboardReadWrite', 'clipboardSanitizedWrite'] });
    const post = '/blog/fedora-migration-notes-anti-cheat-workarounds-drivers-and-my-ai-usage/';
    const paths = ['/', '/blog/', '/projects/', '/now/', '/ai/', '/colophon/', '/museum/', post,
        '/blog/opus-cheats-and-sketches/', '/blog/my-first-experience-with-claude-fable-5/'];
    for (const width of [320, 360, 390, 768]) {
        await call('Emulation.setDeviceMetricsOverride', { width, height: 800, deviceScaleFactor: 1, mobile: true });
        for (const lang of ['en', 'tr']) {
            for (const path of paths) {
                const route = (lang === 'tr' ? '/tr' : '') + path;
                await t.test(`${width}px ${route}`, async () => {
                    await navigate(route);
                    const layout = await evaluate(`(() => {
                        const rect=e=>{const r=e.getBoundingClientRect();return {x:r.x,y:r.y,w:r.width,h:r.height};};
                        const controls=[...document.querySelectorAll('.sky-controls button,.lang-switch-item')].map(rect);
                        const clipped=[...document.querySelectorAll('h1,h2,h3,p,li,a,button,summary,time,code')].filter(e=>{const r=e.getBoundingClientRect();return r.width && (r.left < -1 || r.right > innerWidth+1) && !e.closest('pre');}).map(e=>e.textContent.trim().slice(0,60));
                        return {width:innerWidth,scroll:document.documentElement.scrollWidth,clipped,controls,
                            rows:[...document.querySelectorAll('.now-item')].map(e=>({label:rect(e.querySelector('dt')),text:rect(e.querySelector('dd'))})),
                            tools:[...document.querySelectorAll('.post-tools > *')].map(rect),snap:getComputedStyle(document.documentElement).scrollSnapType};
                    })()`);
                    assert.equal(layout.width, width);
                    assert.ok(layout.scroll <= width, `Page overflows: ${layout.scroll}`);
                    assert.deepEqual(layout.clipped, []);
                    for (const button of layout.controls) {
                        assert.ok(button.w >= 44 && button.h >= 44, 'Touch target smaller than 44px');
                        assert.equal(button.y, layout.controls[0].y, 'Top controls are not aligned');
                    }
                    if (width <= 480) for (const row of layout.rows) {
                        assert.equal(row.label.x, row.text.x, 'Label and text should stack on phones');
                        assert.ok(row.text.y >= row.label.y + row.label.h);
                    }
                    for (const tool of layout.tools) assert.ok(tool.h >= 44, 'Post tool too short for touch');
                    if (path === '/') assert.equal(layout.snap, 'none');
                });
            }
            await t.test(`${width}px ${lang} touch controls and seed persistence`, async () => {
                const home = lang === 'tr' ? '/tr/' : '/';
                await navigate(home + '?s=1a2b3c4d5e6f');
                const seed = await evaluate("document.querySelector('.seed-star').dataset.seed");
                const before = await evaluate('document.documentElement.dataset.theme');
                await tap('.theme-btn');
                assert.notEqual(await evaluate('document.documentElement.dataset.theme'), before);
                assert.equal(await evaluate("document.querySelector('.seed-star').dataset.seed"), seed);
                await tap('.seed-star');
                assert.equal(await evaluate('navigator.clipboard.readText()'), origin + (lang === 'tr' ? `/tr/?s=${seed}` : `/${seed}`));
                await tap('.dice-btn');
                const newSeed = await evaluate("document.querySelector('.seed-star').dataset.seed");
                assert.match(newSeed, /^[0-9a-f]{12}$/);
                assert.notEqual(newSeed, seed);
                const href = await evaluate("document.querySelector('.lang-switch a').href");
                await tap('.lang-switch a');
                await ready(new URL(href).pathname + new URL(href).search);
                assert.equal(await evaluate('document.documentElement.lang'), lang === 'en' ? 'tr' : 'en');
                assert.equal(await evaluate("document.querySelector('.seed-star').dataset.seed"), newSeed);
                assert.notEqual(await evaluate('document.documentElement.dataset.theme'), before);
            });
            await t.test(`${width}px ${lang} post contents and Markdown copy`, async () => {
                await navigate((lang === 'tr' ? '/tr' : '') + post);
                assert.equal(await evaluate("document.querySelector('.post-toc').open"), false);
                await tap('.post-toc summary');
                assert.equal(await evaluate("document.querySelector('.post-toc').open"), true);
                await tap('.post-toc a');
                assert.ok(await evaluate('location.hash.length > 1'));
                await tap('.copy-md-btn');
                for (let attempt = 0; attempt < 100; attempt++) {
                    if (await evaluate("document.querySelector('.copy-md-btn').textContent === document.querySelector('.copy-md-btn').dataset.labelCopied")) break;
                    await new Promise(resolve => setTimeout(resolve, 20));
                }
                const copied = await evaluate('navigator.clipboard.readText()');
                const expected = await evaluate("fetch(document.querySelector('.copy-md-btn').dataset.mdUrl).then(r => r.text())");
                assert.ok(copied.endsWith(expected));
                assert.ok(copied.startsWith(await evaluate("document.querySelector('.copy-md-btn').dataset.summaryPrompt")));
            });
        }
    }
});
