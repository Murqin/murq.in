// Seed-driven theme engine: a 12-char hex seed in the URL (6 for the gradient,
// 6 for the star field) reproduces the exact same background on every visit.
// The project list used to be rendered here too; it is built at build time now.

interface Seeds {
    gradSeed: number;
    starSeed: number;
    hex: string;
}

const SEED_PATTERN = /^[0-9a-f]{12}$/i;

// Reduced-motion preference — gates crossfade, parallax, shooting stars and count-up
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

function mulberry32(seed: number): () => number {
    return function () {
        seed |= 0;
        seed = (seed + 0x6d2b79f5) | 0;
        let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
        t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}

function parseSeedHex(hex: string): Seeds {
    return {
        gradSeed: parseInt(hex.slice(0, 6), 16),
        starSeed: parseInt(hex.slice(6, 12), 16),
        hex,
    };
}

function randomSeeds(): Seeds {
    const gradSeed = Math.floor(Math.random() * 0xffffff) + 1;
    const starSeed = Math.floor(Math.random() * 0xffffff) + 1;
    const hex =
        gradSeed.toString(16).padStart(6, '0') + starSeed.toString(16).padStart(6, '0');
    return { gradSeed, starSeed, hex };
}

function resolveSeeds(): Seeds {
    const segment = window.location.pathname.slice(1);
    if (SEED_PATTERN.test(segment)) return parseSeedHex(segment);

    // No path segment: fall back to ?s= — fixed-path pages like the blog
    // carry the seed in the query so the theme survives navigation
    const qs = new URLSearchParams(window.location.search).get('s');
    if (qs && SEED_PATTERN.test(qs)) return parseSeedHex(qs);

    return randomSeeds();
}

function gradientCSS(gradSeed: number): string {
    const randGrad = mulberry32(gradSeed);
    const x1 = Math.floor(randGrad() * 30) + 5;
    const y1 = Math.floor(randGrad() * 30) + 5;
    const x2 = Math.floor(randGrad() * 30) + 65;
    const y2 = Math.floor(randGrad() * 30) + 65;
    const x3 = Math.floor(randGrad() * 60) + 20;
    const hue1 = Math.floor(randGrad() * 60) + 210;
    const hue2 = Math.floor(randGrad() * 60) + 260;
    return [
        `radial-gradient(at ${x1}% ${y1}%, hsl(${hue1}, 38%, 16%) 0px, transparent 50%)`,
        `radial-gradient(at ${x2}% ${y2}%, hsl(${hue2}, 38%, 16%) 0px, transparent 50%)`,
        `radial-gradient(circle at ${x3}% 0%, rgba(139, 126, 255, 0.08) 0px, transparent 40%)`,
    ].join(', ');
}

function applyGradient(gradSeed: number, animate: boolean): void {
    const container = document.getElementById('gradient');
    if (!container) {
        // No container (stale cached HTML) — fall back to the old behaviour
        document.body.style.backgroundImage = gradientCSS(gradSeed);
        return;
    }
    const layer = document.createElement('div');
    layer.className = 'gradient-layer';
    layer.style.backgroundImage = gradientCSS(gradSeed);
    if (!animate) {
        container.replaceChildren(layer);
        return;
    }
    layer.style.opacity = '0';
    container.appendChild(layer);
    // Double rAF guarantees the browser paints opacity 0 before the transition starts
    requestAnimationFrame(() => {
        requestAnimationFrame(() => {
            layer.style.opacity = '1';
        });
    });
    // Clean up old layers once the transition ends (a timer instead of
    // transitionend, which can be delayed or lost in background tabs)
    setTimeout(() => {
        while (container.firstChild && container.firstChild !== layer) {
            container.firstChild.remove();
        }
    }, 800);
}

function buildStars(starSeed: number, container: HTMLElement): void {
    container.replaceChildren();
    const randStars = mulberry32(starSeed);
    const isMobile = window.innerWidth < 600;
    const starCount = isMobile
        ? 15 + Math.floor(randStars() * 15) // Reduce count on mobile to optimize performance
        : 40 + Math.floor(randStars() * 30);

    for (let i = 0; i < starCount; i++) {
        const starDiv = document.createElement('div');
        starDiv.className = 'star';

        const x = randStars() * 100;
        const y = randStars() * 100;
        const size = 1 + randStars() * 2.5;
        const baseOpacity = 0.1 + randStars() * 0.5;
        const duration = 2 + randStars() * 4;
        const delay = randStars() * -5;

        starDiv.style.left = `${x}%`;
        starDiv.style.top = `${y}%`;
        starDiv.style.width = `${size}px`;
        starDiv.style.height = `${size}px`;
        starDiv.style.setProperty('--base-opacity', String(baseOpacity));
        starDiv.style.opacity = String(baseOpacity);
        starDiv.style.animation = `starTwinkle ${duration}s infinite ease-in-out ${delay}s`;

        container.appendChild(starDiv);
    }
}

function updateSeedStar(hex: string): void {
    const star = document.querySelector<HTMLElement>('.seed-star');
    if (!star) return;
    star.dataset['seed'] = hex;
    star.dataset['hex'] = hex;
}

// Keep the theme across pages: links marked data-seed-nav get the current
// seed appended ("/" -> /hex, anything else -> <base>?s=hex)
function updateSeedLinks(hex: string): void {
    for (const a of document.querySelectorAll<HTMLAnchorElement>('a[data-seed-nav]')) {
        const base = a.getAttribute('data-seed-nav');
        if (!base) continue;
        a.href = base === '/' ? '/' + hex : base + '?s=' + hex;
    }
}

function applyCombinedSystem(seeds: Seeds): void {
    applyGradient(seeds.gradSeed, false);
    updateSeedStar(seeds.hex);
    updateSeedLinks(seeds.hex);
    const starsContainer = document.getElementById('stars');
    if (starsContainer) buildStars(seeds.starSeed, starsContainer);
}

// --- Dice button: new random theme (with crossfade) ---
let starsRebuildTimer: ReturnType<typeof setTimeout> | undefined;

function rerollTheme(): void {
    clearTimeout(starsRebuildTimer);
    const seeds = randomSeeds();
    history.replaceState(null, '', '/' + seeds.hex);

    if (reduceMotion.matches) {
        applyCombinedSystem(seeds);
        return;
    }

    // Gradient: the new layer fades in on top (~700ms)
    applyGradient(seeds.gradSeed, true);
    updateSeedStar(seeds.hex);
    updateSeedLinks(seeds.hex);

    // Stars: current ones fade out (~300ms), new ones light up in new positions
    const starsContainer = document.getElementById('stars');
    if (starsContainer) {
        starsContainer.style.opacity = '0';
        starsRebuildTimer = setTimeout(() => {
            buildStars(seeds.starSeed, starsContainer);
            starsContainer.style.opacity = '1';
        }, 320);
    }
}

// --- Mouse parallax (desktop only) ---
function initParallax(): void {
    // Only on fine-pointer devices and only when motion isn't reduced
    if (!window.matchMedia('(pointer: fine)').matches || reduceMotion.matches) return;
    const stars = document.getElementById('stars');
    if (!stars) return;

    let offsetX = 0;
    let offsetY = 0;
    let pendingFrame: number | null = null;

    window.addEventListener('mousemove', (e) => {
        // The star field shifts up to ±4px opposite the cursor's offset from center
        offsetX = (e.clientX / window.innerWidth - 0.5) * -8;
        offsetY = (e.clientY / window.innerHeight - 0.5) * -8;
        if (pendingFrame) return;
        pendingFrame = requestAnimationFrame(() => {
            stars.style.transform = `translate3d(${offsetX.toFixed(2)}px, ${offsetY.toFixed(2)}px, 0)`;
            pendingFrame = null;
        });
    });
}

// --- Shooting star: a random trajectory every ~15-25s ---
function spawnShootingStar(): void {
    if (reduceMotion.matches || document.hidden) return;
    const container = document.getElementById('stars');
    if (!container) return;

    const star = document.createElement('div');
    star.className = 'shooting-star';

    const angleDeg = 20 + Math.random() * 40; // tilted downward-right trajectory
    const angleRad = angleDeg * (Math.PI / 180);
    const distance = 150 + Math.random() * 250;

    star.style.left = 5 + Math.random() * 70 + '%';
    star.style.top = Math.random() * 40 + '%';
    star.style.setProperty('--angle', angleDeg.toFixed(1) + 'deg');
    star.style.setProperty('--travel-x', (Math.cos(angleRad) * distance).toFixed(0) + 'px');
    star.style.setProperty('--travel-y', (Math.sin(angleRad) * distance).toFixed(0) + 'px');

    container.appendChild(star);
    star.addEventListener('animationend', () => star.remove(), { once: true });
    // Safety net: remove the element even if animationend never fires (e.g. mid-reroll)
    setTimeout(() => star.remove(), 3000);
}

function scheduleShootingStar(): void {
    const delay = 15000 + Math.random() * 10000;
    setTimeout(() => {
        spawnShootingStar();
        scheduleShootingStar();
    }, delay);
}

// --- Visitor counter count-up ---
function animateCount(el: HTMLElement, target: number): void {
    if (reduceMotion.matches || !Number.isFinite(target) || target <= 0) {
        el.textContent = Number.isFinite(target) ? target.toLocaleString() : '---';
        return;
    }
    const duration = 800;
    const start = performance.now();
    function frame(now: number): void {
        const t = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - t, 3); // ease-out cubic
        el.textContent = Math.round(target * eased).toLocaleString();
        if (t < 1) requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
}

// --- Copy the combined seed link ---
let copiedPulseTimer: ReturnType<typeof setTimeout> | undefined;

function copySeed(): void {
    const star = document.querySelector<HTMLElement>('.seed-star');
    if (!star) return;
    const hex = star.dataset['hex'];
    if (!hex) return;
    void navigator.clipboard?.writeText(window.location.origin + '/' + hex);
    star.dataset['seed'] = 'seed copied!';
    // Make the pulse retriggerable: drop the class, force a reflow, re-add it
    star.classList.remove('copied');
    void star.offsetWidth;
    star.classList.add('copied');
    clearTimeout(copiedPulseTimer);
    copiedPulseTimer = setTimeout(() => star.classList.remove('copied'), 500);
    setTimeout(() => {
        star.dataset['seed'] = hex;
    }, 1800);
}

// --- Copy e-mail ---
const MAIL = 'murqin@proton.me';

function copyMail(btn: HTMLElement): void {
    void navigator.clipboard?.writeText(MAIL);
    btn.textContent = 'copied!';
    setTimeout(() => {
        btn.textContent = MAIL;
    }, 1500);
}

// --- Visitor counter ---
async function fetchVisitorCount(): Promise<void> {
    const countEl = document.querySelector<HTMLElement>('#visitor-count .count-value');
    if (!countEl) return;

    // First load in a session increments via POST; later loads only read
    const hasVisited = sessionStorage.getItem('murqin-visited');

    try {
        let res = await fetch('/api/visitors', hasVisited ? undefined : { method: 'POST' });
        if (!res.ok && !hasVisited) {
            // If the increment was rejected (e.g. an unauthorised preview origin), still show the count
            res = await fetch('/api/visitors');
        }
        if (!res.ok) throw new Error('API request failed');
        const data: unknown = await res.json();
        const count =
            typeof data === 'object' && data !== null && 'count' in data
                ? Number((data as { count: unknown }).count)
                : NaN;
        if (Number.isFinite(count)) {
            animateCount(countEl, count);
            sessionStorage.setItem('murqin-visited', 'true');
        } else {
            countEl.textContent = '---';
        }
    } catch (err) {
        console.warn('Visitor count could not be loaded:', err);
        countEl.textContent = '---';
    }
}

// Bundled as a module, so this runs after the document is parsed. Handlers are
// bound here rather than with inline onclick attributes: a bundled module has
// its own scope, so global onclick="..." would not resolve.
applyCombinedSystem(resolveSeeds());

document.querySelector<HTMLElement>('.dice-btn')?.addEventListener('click', rerollTheme);
document.querySelector<HTMLElement>('.seed-star')?.addEventListener('click', copySeed);

const mailBtn = document.querySelector<HTMLElement>('.mail-btn');
mailBtn?.addEventListener('click', () => copyMail(mailBtn));

void fetchVisitorCount();
initParallax();
scheduleShootingStar();
