// Light-theme counterpart of the black hole: a total solar eclipse, the one time a day sky goes dark.
// The sun rises into the sky layer, the moon slides across it, and at totality the page really turns
// to night (the dark theme, so the text stays readable and the stars come out white) with the corona
// around the moon. The diamond ring flashes as the moon moves off, and the day comes back.
// Everything is timed with the Web Animations API from one start time, so the steps cannot drift.

const TOTAL_MS = 7600;

// Fractions of TOTAL_MS: the moon reaches full cover at 0.46, totality lasts until 0.72.
const COVER = 0.46;
const THIRD_CONTACT = 0.72;

function el(className: string, parent: HTMLElement): HTMLElement {
    const div = document.createElement('div');
    div.className = className;
    parent.append(div);
    return div;
}

/** Runs the eclipse once; resolves when the page is back to its own state. */
export function startEclipse(): Promise<void> {
    const root = document.documentElement;
    const before = root.dataset['theme'];

    // The night overlay sits in the sky stack: above the day gradient, under the stars.
    const night = el('eclipse-night', document.body);
    night.setAttribute('aria-hidden', 'true');
    const sky = el('eclipse', document.body);
    sky.setAttribute('aria-hidden', 'true');
    const corona = el('eclipse-corona', sky);
    const sun = el('eclipse-sun', sky);
    const moon = el('eclipse-moon', sky);
    const ring = el('eclipse-ring', sky);

    const timing = { duration: TOTAL_MS, fill: 'both' as const };
    const anims = [
        sun.animate(
            [
                { opacity: 0, transform: 'scale(0.85)', offset: 0 },
                { opacity: 1, transform: 'scale(1)', offset: 0.1 },
                { opacity: 1, transform: 'scale(1)', offset: 0.9 },
                { opacity: 0, transform: 'scale(1)', offset: 1 },
            ],
            timing
        ),
        // First contact to fourth: the moon crosses from left to right, covering the sun at COVER and
        // uncovering its right limb from THIRD_CONTACT on.
        moon.animate(
            [
                { transform: 'translateX(-135%)', offset: 0.08, easing: 'cubic-bezier(0.3, 0, 0.4, 1)' },
                { transform: 'translateX(0)', offset: COVER },
                { transform: 'translateX(0)', offset: THIRD_CONTACT, easing: 'cubic-bezier(0.6, 0, 0.7, 1)' },
                { transform: 'translateX(135%)', offset: 1 },
            ],
            timing
        ),
        night.animate(
            [
                { opacity: 0, offset: 0.28 },
                { opacity: 0.94, offset: COVER },
                { opacity: 0.94, offset: THIRD_CONTACT },
                { opacity: 0, offset: 0.9 },
            ],
            timing
        ),
        corona.animate(
            [
                { opacity: 0, transform: 'scale(0.9) rotate(0deg)', offset: COVER - 0.02 },
                { opacity: 1, transform: 'scale(1) rotate(6deg)', offset: COVER + 0.06 },
                { opacity: 1, transform: 'scale(1.04) rotate(14deg)', offset: THIRD_CONTACT - 0.02 },
                { opacity: 0, transform: 'scale(1.04) rotate(16deg)', offset: THIRD_CONTACT + 0.04 },
            ],
            timing
        ),
        // Diamond ring: the first sunlight through a lunar valley as the moon starts to move off.
        ring.animate(
            [
                { opacity: 0, transform: 'scale(0.4)', offset: THIRD_CONTACT - 0.01 },
                { opacity: 1, transform: 'scale(1.3)', offset: THIRD_CONTACT + 0.02 },
                { opacity: 0, transform: 'scale(0.8)', offset: THIRD_CONTACT + 0.09 },
            ],
            timing
        ),
    ];

    // The theme follows the light: night just before full cover, day back right after the ring.
    const toNight = setTimeout(() => (root.dataset['theme'] = 'dark'), TOTAL_MS * (COVER - 0.06));
    const toDay = setTimeout(() => {
        if (before) root.dataset['theme'] = before;
    }, TOTAL_MS * (THIRD_CONTACT + 0.04));

    return Promise.all(anims.map((a) => a.finished)).then(
        () => {
            clearTimeout(toNight);
            clearTimeout(toDay);
            if (before) root.dataset['theme'] = before;
            night.remove();
            sky.remove();
        },
        () => {
            // A cancelled animation (tab closed mid-way) still leaves the page as it was.
            if (before) root.dataset['theme'] = before;
            night.remove();
            sky.remove();
        }
    );
}
