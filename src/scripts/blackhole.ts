// Easter egg: mashing the dice (new theme) button opens a black hole that swallows the page, then
// lets it go. The page itself is only animated with CSS transforms, never rebuilt, so nothing has to
// be restored beyond removing two classes. The hole is ray-traced with WebGL (blackhole-gl.ts); where
// WebGL is unavailable there is no hole at all, the page just spirals away and comes back.
import { startBlackHole } from './blackhole-gl';

const CLICKS = 7;
const WINDOW_MS = 3000;
// The ray-traced hole falls in from afar for two seconds, so it is held longer than the empty page.
const SWALLOWED_MS = { gl: 4600, empty: 2600 };
const RELEASE_MS = 1400;

let clicks: number[] = [];
let busy = false;

/** Call on every dice click; triggers once the clicks come fast enough. */
export function registerRerollClick(reduceMotion: boolean): void {
    if (busy || reduceMotion) return;
    const now = performance.now();
    clicks = clicks.filter((t) => now - t < WINDOW_MS);
    clicks.push(now);
    if (clicks.length >= CLICKS) {
        clicks = [];
        swallow();
    }
}

// Dev-only switch (?bh=nogl) to see the no-WebGL version without disabling WebGL in the browser;
// import.meta.env.DEV is false in the production build, so the check is compiled out. Read at load:
// every dice click rewrites the URL to the new seed and drops the query.
const WEBGL_OFF_FOR_TESTING =
    import.meta.env.DEV && new URLSearchParams(window.location.search).get('bh') === 'nogl';

function swallow(): void {
    busy = true;
    const canvas = document.createElement('canvas');
    canvas.className = 'bh-canvas';
    canvas.setAttribute('aria-hidden', 'true');
    document.body.append(canvas);
    const stopGl = WEBGL_OFF_FOR_TESTING ? null : startBlackHole(canvas);
    if (!stopGl) canvas.remove();

    const column = document.querySelector<HTMLElement>('.container');
    if (column) {
        const box = column.getBoundingClientRect();
        column.style.transformOrigin = `${window.innerWidth / 2 - box.left}px ${window.innerHeight / 2 - box.top}px`;
    }
    // Next frame, so the hole starts from its collapsed state and the transition runs.
    requestAnimationFrame(() => document.documentElement.classList.add('swallowed'));
    setTimeout(
        () => {
            document.documentElement.classList.remove('swallowed');
            document.documentElement.classList.add('released');
            setTimeout(() => {
                document.documentElement.classList.remove('released');
                stopGl?.();
                canvas.remove();
                column?.style.removeProperty('transform-origin');
                busy = false;
            }, RELEASE_MS);
        },
        stopGl ? SWALLOWED_MS.gl : SWALLOWED_MS.empty,
    );
}
