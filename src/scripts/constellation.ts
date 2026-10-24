import { CONSTELLATIONS } from '../data/constellations';

// Easter egg: now and then a real constellation is drawn into the star field. The seed's own
// random stream picks whether (CHANCE on page load), which one and where, so everyone who opens
// the same seed link sees the same figure. Copying the seed always draws it.
const CHANCE = 0.15;
const SVG_NS = 'http://www.w3.org/2000/svg';

let layer: HTMLElement | null = null;

export function clearConstellation(): void {
    layer?.remove();
    layer = null;
}

/** `rand` must be a fresh stream derived from the seed, so the outcome is the same every visit. */
export function showConstellation(rand: () => number, force: boolean, animate: boolean): void {
    const roll = rand();
    const figure = CONSTELLATIONS[Math.floor(rand() * CONSTELLATIONS.length)];
    const side = rand();
    const drift = rand();
    if (!figure || (!force && roll >= CHANCE)) return;

    clearConstellation();
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    // In a gutter beside the text column, measured from the page itself (the home sections, the
    // post layout), shrunk to fit it. Text now sits straight on the sky with no card to blur what is
    // behind it, so a figure drawn across the text tangled with the letters. Without a usable gutter
    // (phones) it becomes a faint watermark behind the text instead (the .faint class).
    // The column is measured from the blocks that hold text, not their padded containers. Children,
    // because on phones the post's two columns are display: contents and measure as zero.
    let contentLeft = vw;
    let contentRight = 0;
    for (const el of document.querySelectorAll('.snap-page > *, .post-aside > *, .post-content > *')) {
        const box = el.getBoundingClientRect();
        if (box.width === 0) continue;
        contentLeft = Math.min(contentLeft, box.left);
        contentRight = Math.max(contentRight, box.right);
    }
    // Nothing measured means no known column: treat it as no room rather than all room.
    const measured = contentRight > contentLeft;
    const freeLeft = measured ? contentLeft : 0;
    const freeRight = measured ? vw - contentRight : 0;
    // The seed still picks the side, among the sides wide enough to hold a figure.
    const useRight = freeRight >= 150 && (freeLeft < 150 || side >= 0.5);
    const gutter = useRight ? freeRight : freeLeft;
    const inGutter = gutter >= 150;
    const size = inGutter ? Math.min(300, gutter - 30) : Math.min(300, vw * 0.8);
    const left = inGutter
        ? useRight
            ? contentRight + (gutter - size) / 2
            : (gutter - size) / 2
        : (vw - size) / 2 + (side - 0.5) * Math.max(0, vw - size - 32);
    const top = vh * (0.08 + drift * 0.4);

    const svg = document.createElementNS(SVG_NS, 'svg');
    svg.setAttribute('viewBox', '-0.05 -0.05 1.1 1.1');
    svg.setAttribute('width', String(size));
    svg.setAttribute('height', String(size));
    for (const [i, j] of figure.lines) {
        const a = figure.stars[i];
        const b = figure.stars[j];
        if (!a || !b) continue;
        const line = document.createElementNS(SVG_NS, 'line');
        line.setAttribute('x1', String(a[0]));
        line.setAttribute('y1', String(a[1]));
        line.setAttribute('x2', String(b[0]));
        line.setAttribute('y2', String(b[1]));
        line.setAttribute('pathLength', '1');
        line.classList.add('constellation-line');
        svg.append(line);
    }
    for (const [x, y] of figure.stars) {
        const dot = document.createElementNS(SVG_NS, 'circle');
        dot.setAttribute('cx', String(x));
        dot.setAttribute('cy', String(y));
        dot.setAttribute('r', '0.012');
        dot.classList.add('constellation-star');
        svg.append(dot);
    }

    const lang = document.documentElement.lang === 'tr' ? 'tr' : 'en';
    const label = document.createElement('span');
    label.className = 'constellation-name';
    label.textContent = figure.name[lang];

    layer = document.createElement('div');
    layer.className = animate ? 'constellation drawing' : 'constellation';
    if (!inGutter) layer.classList.add('faint');
    layer.setAttribute('aria-hidden', 'true');
    layer.style.left = `${left}px`;
    layer.style.top = `${top}px`;
    layer.append(svg, label);
    document.body.append(layer);
}
