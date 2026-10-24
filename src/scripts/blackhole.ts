// Easter egg: mashing the dice (new theme) button opens a black hole that swallows the page, then
// lets it go. The page itself is only animated with CSS transforms, never rebuilt, so nothing has to
// be restored beyond removing two classes. The hole is ray-traced with WebGL (blackhole-gl.ts) and
// falls back to a CSS drawing where WebGL is unavailable.
import { startBlackHole } from './blackhole-gl';

const CLICKS = 7;
const WINDOW_MS = 3000;
// The ray-traced hole falls in from afar for two seconds, so it is held longer than the CSS one.
const SWALLOWED_MS = { gl: 4600, css: 2600 };
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

function cssHole(): HTMLElement {
    const hole = document.createElement('div');
    hole.className = 'black-hole';
    // Back to front: the far side of the disk, the light from it bent over and under the hole,
    // the shadow with its photon ring, then the near side of the disk crossing in front.
    for (const part of ['bh-disk bh-disk-back', 'bh-lensed', 'bh-shadow', 'bh-disk bh-disk-front']) {
        const layer = document.createElement('div');
        layer.className = part;
        hole.append(layer);
    }
    // The lensed ring needs two masks (ring shape, top-heavy fade). Nesting them instead of
    // compositing them: Firefox read -webkit-mask-composite differently and showed a hard disc.
    const ring = document.createElement('div');
    ring.className = 'bh-lensed-ring';
    hole.querySelector('.bh-lensed')?.append(ring);
    return hole;
}

function swallow(): void {
    busy = true;
    const canvas = document.createElement('canvas');
    canvas.className = 'bh-canvas';
    document.body.append(canvas);
    const stopGl = startBlackHole(canvas);
    const effect: HTMLElement = stopGl ? canvas : cssHole();
    if (!stopGl) {
        canvas.remove();
        document.body.append(effect);
    }
    effect.setAttribute('aria-hidden', 'true');

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
                effect.remove();
                column?.style.removeProperty('transform-origin');
                busy = false;
            }, RELEASE_MS);
        },
        stopGl ? SWALLOWED_MS.gl : SWALLOWED_MS.css,
    );
}
