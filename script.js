// --- Seeded PRNG (Mulberry32) ---
function mulberry32(seed) {
    return function () {
        seed |= 0;
        seed = (seed + 0x6D2B79F5) | 0;
        let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
        t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}

// --- Combined seed resolution (6-char gradient + 6-char stars) ---
function parseSeedHex(hex) {
    return {
        gradSeed: parseInt(hex.slice(0, 6), 16),
        starSeed: parseInt(hex.slice(6, 12), 16),
        hex
    };
}

function resolveSeeds() {
    const segment = window.location.pathname.slice(1);

    if (/^[0-9a-f]{12}$/i.test(segment)) {
        return parseSeedHex(segment);
    }

    // No path segment: fall back to ?s= — fixed-path pages like the blog
    // carry the seed in the query so the theme survives navigation
    const qs = new URLSearchParams(window.location.search).get('s');
    if (qs && /^[0-9a-f]{12}$/i.test(qs)) {
        return parseSeedHex(qs);
    }

    const gradSeed = Math.floor(Math.random() * 0xFFFFFF) + 1;
    const starSeed = Math.floor(Math.random() * 0xFFFFFF) + 1;
    const hex = gradSeed.toString(16).padStart(6, '0') + starSeed.toString(16).padStart(6, '0');
    
    return { gradSeed, starSeed, hex };
}

// Reduced-motion preference — gates crossfade, parallax, shooting stars and count-up
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

function gradientCSS(gradSeed) {
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
        `radial-gradient(circle at ${x3}% 0%, rgba(139, 126, 255, 0.08) 0px, transparent 40%)`
    ].join(', ');
}

function applyGradient(gradSeed, animate) {
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
        requestAnimationFrame(() => { layer.style.opacity = '1'; });
    });
    // Clean up old layers once the transition ends (a timer instead of
    // transitionend, which can be delayed or lost in background tabs)
    setTimeout(() => {
        while (container.firstChild && container.firstChild !== layer) {
            container.firstChild.remove();
        }
    }, 800);
}

function buildStars(starSeed, container) {
    container.innerHTML = '';
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
        starDiv.style.setProperty('--base-opacity', baseOpacity);
        starDiv.style.opacity = baseOpacity;
        starDiv.style.animation = `starTwinkle ${duration}s infinite ease-in-out ${delay}s`;

        container.appendChild(starDiv);
    }
}

function updateSeedStar(hex) {
    const starElement = document.querySelector('.seed-star');
    if (starElement) {
        starElement.dataset.seed = hex;
        starElement.dataset.hex = hex;
    }
}

// Keep the theme across pages: links marked data-seed-nav get the current
// seed appended ("/" -> /hex, "/blog" -> /blog?s=hex)
function updateSeedLinks(hex) {
    for (const a of document.querySelectorAll('a[data-seed-nav]')) {
        const base = a.getAttribute('data-seed-nav');
        a.href = base === '/' ? '/' + hex : base + '?s=' + hex;
    }
}

// --- Apply the combined system ---
function applyCombinedSystem(seeds) {
    applyGradient(seeds.gradSeed, false);
    updateSeedStar(seeds.hex);
    updateSeedLinks(seeds.hex);
    const starsContainer = document.getElementById('stars');
    if (starsContainer) {
        buildStars(seeds.starSeed, starsContainer);
    }
}

// --- Projects: rendered from the projects.js data module ---
function renderProjects() {
    const list = document.querySelector('.projects-list');
    if (!list) return;

    // Don't leave the card empty if the data module failed to load (404, network)
    if (typeof PROJECTS === 'undefined') {
        const fallback = document.createElement('p');
        fallback.className = 'project-desc';
        fallback.append('Projects failed to load — see them on ');
        const a = document.createElement('a');
        a.href = 'https://github.com/Murqin';
        a.textContent = 'GitHub';
        fallback.append(a, '.');
        list.replaceChildren(fallback);
        return;
    }

    list.replaceChildren();
    for (const project of PROJECTS) {
        const item = document.createElement('div');
        item.className = 'project-item';

        const header = document.createElement('div');
        header.className = 'project-header';
        const name = document.createElement('span');
        name.className = 'project-name';
        name.textContent = project.name;
        header.appendChild(name);
        if (project.status) {
            const status = document.createElement('span');
            status.className = 'project-status ' + String(project.status).toLowerCase();
            status.textContent = project.status;
            header.appendChild(status);
        }

        const desc = document.createElement('p');
        desc.className = 'project-desc';
        desc.textContent = project.description;

        // Bottom row: tags left, links right — a fixed zone independent of
        // the header so button positions don't vary from card to card
        const footer = document.createElement('div');
        footer.className = 'project-footer';

        if (project.tags && project.tags.length) {
            const tags = document.createElement('div');
            tags.className = 'project-tags';
            for (const tagName of project.tags) {
                const tag = document.createElement('span');
                tag.className = 'project-tag';
                tag.textContent = tagName;
                tags.appendChild(tag);
            }
            footer.appendChild(tags);
        }

        if (project.links && project.links.length) {
            const links = document.createElement('div');
            links.className = 'project-links';
            for (const link of project.links) {
                const a = document.createElement('a');
                a.className = 'project-link-btn';
                a.href = link.url;
                a.target = '_blank';
                a.rel = 'noopener noreferrer';
                a.textContent = link.label;
                links.appendChild(a);
            }
            footer.appendChild(links);
        }

        item.append(header, desc);
        if (footer.childElementCount) {
            item.appendChild(footer);
        }

        list.appendChild(item);
    }
}

const currentSeeds = resolveSeeds();
applyCombinedSystem(currentSeeds);
renderProjects();

// --- Dice button: new random theme (with crossfade) ---
let starsRebuildTimer = null;

function rerollTheme() {
    clearTimeout(starsRebuildTimer);
    const gradSeed = Math.floor(Math.random() * 0xFFFFFF) + 1;
    const starSeed = Math.floor(Math.random() * 0xFFFFFF) + 1;
    const hex = gradSeed.toString(16).padStart(6, '0') + starSeed.toString(16).padStart(6, '0');
    history.replaceState(null, '', '/' + hex);

    if (reduceMotion.matches) {
        applyCombinedSystem({ gradSeed, starSeed, hex });
        return;
    }

    // Gradient: the new layer fades in on top (~700ms)
    applyGradient(gradSeed, true);
    updateSeedStar(hex);
    updateSeedLinks(hex);

    // Stars: current ones fade out (~300ms), new ones light up in new positions
    const starsContainer = document.getElementById('stars');
    if (starsContainer) {
        starsContainer.style.opacity = '0';
        starsRebuildTimer = setTimeout(() => {
            buildStars(starSeed, starsContainer);
            starsContainer.style.opacity = '1';
        }, 320);
    }
}

// --- Mouse parallax (desktop only) ---
function initParallax() {
    // Only on fine-pointer devices and only when motion isn't reduced
    if (!window.matchMedia('(pointer: fine)').matches || reduceMotion.matches) return;
    const stars = document.getElementById('stars');
    if (!stars) return;

    let offsetX = 0;
    let offsetY = 0;
    let pendingFrame = null;

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
function spawnShootingStar() {
    if (reduceMotion.matches || document.hidden) return;
    const container = document.getElementById('stars');
    if (!container) return;

    const star = document.createElement('div');
    star.className = 'shooting-star';

    const angleDeg = 20 + Math.random() * 40;          // tilted downward-right trajectory
    const angleRad = angleDeg * (Math.PI / 180);
    const distance = 150 + Math.random() * 250;

    star.style.left = (5 + Math.random() * 70) + '%';
    star.style.top = (Math.random() * 40) + '%';
    star.style.setProperty('--angle', angleDeg.toFixed(1) + 'deg');
    star.style.setProperty('--travel-x', (Math.cos(angleRad) * distance).toFixed(0) + 'px');
    star.style.setProperty('--travel-y', (Math.sin(angleRad) * distance).toFixed(0) + 'px');

    container.appendChild(star);
    star.addEventListener('animationend', () => star.remove(), { once: true });
    // Safety net: remove the element even if animationend never fires (e.g. mid-reroll)
    setTimeout(() => star.remove(), 3000);
}

function scheduleShootingStar() {
    const delay = 15000 + Math.random() * 10000;
    setTimeout(() => {
        spawnShootingStar();
        scheduleShootingStar();
    }, delay);
}

// --- Visitor counter count-up ---
function animateCount(el, target) {
    if (reduceMotion.matches || !Number.isFinite(target) || target <= 0) {
        el.textContent = Number.isFinite(target) ? target.toLocaleString() : '---';
        return;
    }
    const duration = 800;
    const start = performance.now();
    function frame(now) {
        const t = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - t, 3); // ease-out cubic
        el.textContent = Math.round(target * eased).toLocaleString();
        if (t < 1) requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
}

// --- Copy the combined seed link ---
let copiedPulseTimer = null;

function copySeed() {
    const star = document.querySelector('.seed-star');
    if (!star) return;
    const hex = star.dataset.hex;
    navigator.clipboard.writeText(window.location.origin + '/' + hex);
    star.dataset.seed = 'seed copied!';
    // Make the pulse retriggerable: drop the class, force a reflow, re-add it
    star.classList.remove('copied');
    void star.offsetWidth;
    star.classList.add('copied');
    clearTimeout(copiedPulseTimer);
    copiedPulseTimer = setTimeout(() => { star.classList.remove('copied'); }, 500);
    setTimeout(() => { star.dataset.seed = hex; }, 1800);
}

// --- Copy e-mail ---
function copyMail() {
    navigator.clipboard.writeText('murqin@proton.me');
    const btn = document.querySelector('.mail-btn');
    if (!btn) return;
    btn.textContent = 'copied!';
    setTimeout(() => { btn.textContent = 'murqin@proton.me'; }, 1500);
}

// --- Visitor counter (Cloudflare KV) ---
async function fetchVisitorCount() {
    const countEl = document.querySelector('#visitor-count .count-value');
    if (!countEl) return;

    // First load in a session increments via POST; later loads only read
    const hasVisited = sessionStorage.getItem('murqin-visited');

    try {
        let res = await fetch(
            '/api/visitors',
            hasVisited ? undefined : { method: 'POST' }
        );
        if (!res.ok && !hasVisited) {
            // If the increment was rejected (e.g. an unauthorised preview origin), still show the count
            res = await fetch('/api/visitors');
        }
        if (!res.ok) throw new Error('API request failed');
        const data = await res.json();
        if (data && typeof data.count !== 'undefined') {
            animateCount(countEl, Number(data.count));
            sessionStorage.setItem('murqin-visited', 'true');
        } else {
            countEl.textContent = '---';
        }
    } catch (err) {
        console.warn('Visitor count could not be loaded:', err);
        countEl.textContent = '---';
    }
}

document.addEventListener('DOMContentLoaded', () => {
    fetchVisitorCount();
    initParallax();
    scheduleShootingStar();
});