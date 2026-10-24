// Easter egg: mashing the dice (new theme) button sends the page away and brings it back. Usually a
// ray-traced black hole swallows it (blackhole-gl.ts); TELEPORT_CHANCE of the time, and always where
// WebGL is unavailable, it teleports out like an old CRT switching off. The page is only animated
// with CSS, never rebuilt, so nothing has to be restored beyond removing classes.
import { startBlackHole } from './blackhole-gl';

const CLICKS = 7;
const WINDOW_MS = 3000;
const TELEPORT_CHANCE = 0.15;
// The ray-traced camera needs time to approach and settle, so it is held longer than the teleport.
const AWAY_MS = { blackHole: 4600, teleport: 2400 };
const RETURN_MS = { blackHole: 1400, teleport: 1000 };

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
        sendAway();
    }
}

// Dev-only switch to see each version on demand: ?bh=nogl (no WebGL, so the teleport) or
// ?bh=teleport. import.meta.env.DEV is false in the production build, so it is compiled out. Read
// at load: every dice click rewrites the URL to the new seed and drops the query.
const FORCED = import.meta.env.DEV ? new URLSearchParams(window.location.search).get('bh') : null;

function sendAway(): void {
    busy = true;
    const root = document.documentElement;
    const column = document.querySelector<HTMLElement>('.container');
    if (column) {
        // Both effects collapse toward the centre of the screen, not of the (long) column.
        const box = column.getBoundingClientRect();
        column.style.transformOrigin = `${window.innerWidth / 2 - box.left}px ${window.innerHeight / 2 - box.top}px`;
    }

    const canvas = document.createElement('canvas');
    canvas.className = 'bh-canvas';
    canvas.setAttribute('aria-hidden', 'true');
    const teleport = FORCED === 'nogl' || FORCED === 'teleport' || Math.random() < TELEPORT_CHANCE;
    let stopGl: (() => void) | null = null;
    if (!teleport) {
        document.body.append(canvas);
        stopGl = startBlackHole(canvas);
        if (!stopGl) canvas.remove();
    }
    const kind = stopGl ? 'blackHole' : 'teleport';
    const [away, back] = stopGl ? ['swallowed', 'released'] : ['teleported', 'returning'];

    // Next frame, so the effect starts from the page's resting state and the transition runs.
    requestAnimationFrame(() => root.classList.add(away));
    setTimeout(() => {
        root.classList.replace(away, back);
        setTimeout(() => {
            root.classList.remove(back);
            stopGl?.();
            canvas.remove();
            column?.style.removeProperty('transform-origin');
            busy = false;
        }, RETURN_MS[kind]);
    }, AWAY_MS[kind]);
}
