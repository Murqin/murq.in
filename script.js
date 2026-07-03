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

// --- Kombine Seed Çözümleme (6 Karakter Gradyan + 6 Karakter Yıldız) ---
function parseSeedHex(hex) {
    return {
        gradSeed: parseInt(hex.slice(0, 6), 16),
        starSeed: parseInt(hex.slice(6, 12), 16),
        hex
    };
}

function resolveSeeds() {
    const segment = window.location.pathname.slice(1);

    // 12 karakterlik geçerli bir hex var mı kontrolü
    if (/^[0-9a-f]{12}$/i.test(segment)) {
        return parseSeedHex(segment);
    }

    // Yol segmenti yoksa ?s= parametresine bak — blog gibi sabit yollu
    // sayfalar seed'i query ile taşır, tema geçişlerde korunur
    const qs = new URLSearchParams(window.location.search).get('s');
    if (qs && /^[0-9a-f]{12}$/i.test(qs)) {
        return parseSeedHex(qs);
    }

    // Yoksa veya geçersizse iki adet bağımsız seed üret ve birleştir
    const gradSeed = Math.floor(Math.random() * 0xFFFFFF) + 1;
    const starSeed = Math.floor(Math.random() * 0xFFFFFF) + 1;
    const hex = gradSeed.toString(16).padStart(6, '0') + starSeed.toString(16).padStart(6, '0');
    
    return { gradSeed, starSeed, hex };
}

// Reduced-motion tercihi — crossfade, parallax, kayan yıldız ve count-up bunu kontrol eder
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
        // Konteyner yoksa (eski önbellekli HTML) eski davranışa düş
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
    // İki rAF: tarayıcının 0 opaklığı boyamasını garantiler, sonra geçiş başlar
    requestAnimationFrame(() => {
        requestAnimationFrame(() => { layer.style.opacity = '1'; });
    });
    // Geçiş bitince eski katmanları temizle (transitionend yerine zamanlayıcı: sekme
    // arka plandayken transitionend gecikebilir/kaçabilir)
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

// Sayfalar arası geçişte tema korunsun: data-seed-nav="<hedef>" taşıyan
// linklere geçerli seed eklenir ("/" -> /hex, "/blog" -> /blog?s=hex)
function updateSeedLinks(hex) {
    for (const a of document.querySelectorAll('a[data-seed-nav]')) {
        const base = a.getAttribute('data-seed-nav');
        a.href = base === '/' ? '/' + hex : base + '?s=' + hex;
    }
}

// --- Kombine Sistemi Uygulama ---
function applyCombinedSystem(seeds) {
    applyGradient(seeds.gradSeed, false);
    updateSeedStar(seeds.hex);
    updateSeedLinks(seeds.hex);
    const starsContainer = document.getElementById('stars');
    if (starsContainer) {
        buildStars(seeds.starSeed, starsContainer);
    }
}

// --- Projeler: projects.js veri modülünden render edilir ---
function renderProjects() {
    const list = document.querySelector('.projects-list');
    if (!list) return;

    // Veri modülü yüklenemediyse (404, ağ hatası) kartı boş bırakma
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

        // Taban satırı: solda etiketler, sağda linkler — konumları karttan
        // karta değişmesin diye başlıktan bağımsız sabit bir bölge
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

// Sistemi yükle
const currentSeeds = resolveSeeds();
applyCombinedSystem(currentSeeds);
renderProjects();

// --- Zar Butonu: Yeni Rastgele Tema (crossfade ile) ---
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

    // Gradyan: yeni katman üstte yumuşakça belirir (~700ms)
    applyGradient(gradSeed, true);
    updateSeedStar(hex);
    updateSeedLinks(hex);

    // Yıldızlar: mevcutlar söner (~300ms), yenileri yeni konumlarında yanar
    const starsContainer = document.getElementById('stars');
    if (starsContainer) {
        starsContainer.style.opacity = '0';
        starsRebuildTimer = setTimeout(() => {
            buildStars(starSeed, starsContainer);
            starsContainer.style.opacity = '1';
        }, 320);
    }
}

// --- Mouse Parallax (Faz 2.3, yalnızca masaüstü) ---
function initParallax() {
    // Yalnızca hassas imleçli (mouse/trackpad) cihazlarda ve hareket kısıtı yokken
    if (!window.matchMedia('(pointer: fine)').matches || reduceMotion.matches) return;
    const stars = document.getElementById('stars');
    if (!stars) return;

    let offsetX = 0;
    let offsetY = 0;
    let pendingFrame = null;

    window.addEventListener('mousemove', (e) => {
        // İmleç merkezden uzaklaştıkça yıldız alanı ters yönde en fazla ±4px kayar
        offsetX = (e.clientX / window.innerWidth - 0.5) * -8;
        offsetY = (e.clientY / window.innerHeight - 0.5) * -8;
        if (pendingFrame) return;
        pendingFrame = requestAnimationFrame(() => {
            stars.style.transform = `translate3d(${offsetX.toFixed(2)}px, ${offsetY.toFixed(2)}px, 0)`;
            pendingFrame = null;
        });
    });
}

// --- Kayan Yıldız (Faz 2.3): ~15-25 sn'de bir rastgele yörünge ---
function spawnShootingStar() {
    if (reduceMotion.matches || document.hidden) return;
    const container = document.getElementById('stars');
    if (!container) return;

    const star = document.createElement('div');
    star.className = 'shooting-star';

    const angleDeg = 20 + Math.random() * 40;          // aşağı-sağa eğik yörünge
    const angleRad = angleDeg * (Math.PI / 180);
    const distance = 150 + Math.random() * 250;

    star.style.left = (5 + Math.random() * 70) + '%';
    star.style.top = (Math.random() * 40) + '%';
    star.style.setProperty('--angle', angleDeg.toFixed(1) + 'deg');
    star.style.setProperty('--travel-x', (Math.cos(angleRad) * distance).toFixed(0) + 'px');
    star.style.setProperty('--travel-y', (Math.sin(angleRad) * distance).toFixed(0) + 'px');

    container.appendChild(star);
    star.addEventListener('animationend', () => star.remove(), { once: true });
    // Emniyet: animationend kaçarsa (ör. reroll sırasında) elementi yine de temizle
    setTimeout(() => star.remove(), 3000);
}

function scheduleShootingStar() {
    const delay = 15000 + Math.random() * 10000;
    setTimeout(() => {
        spawnShootingStar();
        scheduleShootingStar();
    }, delay);
}

// --- Ziyaretçi Sayacı Count-Up (Faz 2.4) ---
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

// --- Kombine Seed Linkini Kopyalama ---
let copiedPulseTimer = null;

function copySeed() {
    const star = document.querySelector('.seed-star');
    if (!star) return;
    const hex = star.dataset.hex;
    navigator.clipboard.writeText(window.location.origin + '/' + hex);
    star.dataset.seed = 'seed copied!';
    // Pulse'ı yeniden tetiklenebilir kıl: sınıfı kaldır, reflow zorla, tekrar ekle
    star.classList.remove('copied');
    void star.offsetWidth;
    star.classList.add('copied');
    clearTimeout(copiedPulseTimer);
    copiedPulseTimer = setTimeout(() => { star.classList.remove('copied'); }, 500);
    setTimeout(() => { star.dataset.seed = hex; }, 1800);
}

// --- E-posta Kopyalama ---
function copyMail() {
    navigator.clipboard.writeText('murqin@proton.me');
    const btn = document.querySelector('.mail-btn');
    if (!btn) return;
    btn.textContent = 'copied!';
    setTimeout(() => { btn.textContent = 'murqin@proton.me'; }, 1500);
}

// --- Ziyaretçi Sayacı (Cloudflare KV) Entegrasyonu ---
async function fetchVisitorCount() {
    const countEl = document.querySelector('#visitor-count .count-value');
    if (!countEl) return;

    // İlk oturum yüklemesinde POST ile artır, sonrakilerde GET ile yalnızca oku
    const hasVisited = sessionStorage.getItem('murqin-visited');

    try {
        let res = await fetch(
            '/api/visitors',
            hasVisited ? undefined : { method: 'POST' }
        );
        if (!res.ok && !hasVisited) {
            // Artırma reddedildiyse (ör. izinli olmayan önizleme ortamı) sayacı yine de göster
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

// Sayfa yüklendiğinde çalıştır
document.addEventListener('DOMContentLoaded', () => {
    fetchVisitorCount();
    initParallax();
    scheduleShootingStar();
});