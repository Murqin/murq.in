// Easter egg: mashing the dice (new theme) button opens a black hole that swallows the page, then lets it go.
// Pure CSS transforms on existing layers (no WebGL): the page is only animated, never rebuilt,
// so nothing has to be restored beyond removing two classes.
const CLICKS = 7;
const WINDOW_MS = 3000;
const SWALLOWED_MS = 2600;
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

function swallow(): void {
    busy = true;
    const hole = document.createElement('div');
    hole.className = 'black-hole';
    hole.setAttribute('aria-hidden', 'true');
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
    document.body.append(hole);
    const column = document.querySelector<HTMLElement>('.container');
    if (column) {
        const box = column.getBoundingClientRect();
        column.style.transformOrigin = `${window.innerWidth / 2 - box.left}px ${window.innerHeight / 2 - box.top}px`;
    }
    // Next frame, so the hole starts from its collapsed state and the transition runs.
    requestAnimationFrame(() => document.documentElement.classList.add('swallowed'));
    setTimeout(() => {
        document.documentElement.classList.remove('swallowed');
        document.documentElement.classList.add('released');
        setTimeout(() => {
            document.documentElement.classList.remove('released');
            hole.remove();
            column?.style.removeProperty('transform-origin');
            busy = false;
        }, RELEASE_MS);
    }, SWALLOWED_MS);
}
