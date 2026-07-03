#!/usr/bin/env node
// README preview screenshot:
//
//   node tools/screenshot.js [url] [output]
//
// Defaults: http://127.0.0.1:8788/a1b2c3d4e5f6 -> assets/preview.png
// (a fixed seed keeps the theme reproducible between captures).
//
// Requirements — both are dev-only, nothing ships to the site:
//   * a running local server:  npx wrangler pages dev .
//   * puppeteer (headless Chromium), not a repo dependency on purpose:
//       npm install --no-save puppeteer
//
// After deploying you can also capture production for a real visitor
// count:  node tools/screenshot.js https://murq.in/a1b2c3d4e5f6
'use strict';

const path = require('path');

let puppeteer;
try {
    puppeteer = require('puppeteer');
} catch (err) {
    console.error('error: puppeteer is not installed (dev-only dependency)');
    console.error('run: npm install --no-save puppeteer');
    process.exit(1);
}

const ROOT = path.join(__dirname, '..');
const url = process.argv[2] || 'http://127.0.0.1:8788/a1b2c3d4e5f6';
const out = path.resolve(ROOT, process.argv[3] || 'assets/preview.png');

(async () => {
    const browser = await puppeteer.launch({
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 900, deviceScaleFactor: 1 });
    await page.goto(url, { waitUntil: 'networkidle0', timeout: 30000 });
    // Let the entrance choreography and the counter count-up finish
    await new Promise((resolve) => setTimeout(resolve, 3000));

    // fullPage capture draws beyond the viewport, but the fixed-position
    // backgrounds (#gradient, #stars, film grain) only paint inside the real
    // viewport — the classic "starry band on top, flat below" bug. Resize the
    // viewport to the full document height first so 100vh covers everything
    const height = await page.evaluate(
        () => Math.ceil(document.documentElement.scrollHeight)
    );
    await page.setViewport({ width: 1280, height, deviceScaleFactor: 1 });
    await new Promise((resolve) => setTimeout(resolve, 500));
    await page.screenshot({ path: out, fullPage: false });
    await browser.close();
    console.log('written: ' + path.relative(ROOT, out) + ' (' + url + ')');
})().catch((err) => {
    console.error('error: ' + err.message);
    process.exit(1);
});
