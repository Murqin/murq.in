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
    // In a gutter beside the 680px column, shrunk to fit it; the cards blur whatever is behind
    // them, so a full-size figure there was mostly lost. Without a usable gutter (phones) it sits
    // behind the cards anyway and shows through the gaps between them.
    const gutter = (vw - 680) / 2;
    const inGutter = gutter >= 150;
    const size = inGutter ? Math.min(300, gutter - 30) : Math.min(240, vw * 0.6);
    const left = inGutter
        ? side < 0.5
            ? (gutter - size) / 2
            : vw - gutter + (gutter - size) / 2
        : 16 + side * Math.max(0, vw - size - 32);
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
    layer.setAttribute('aria-hidden', 'true');
    layer.style.left = `${left}px`;
    layer.style.top = `${top}px`;
    layer.append(svg, label);
    document.body.append(layer);
}
