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
function resolveSeeds() {
    const segment = window.location.pathname.slice(1);
    
    // 12 karakterlik geçerli bir hex var mı kontrolü
    if (/^[0-9a-f]{12}$/i.test(segment)) {
        return {
            gradSeed: parseInt(segment.slice(0, 6), 16),
            starSeed: parseInt(segment.slice(6, 12), 16),
            hex: segment
        };
    }
    
    // Yoksa veya geçersizse iki adet bağımsız seed üret ve birleştir
    const gradSeed = Math.floor(Math.random() * 0xFFFFFF) + 1;
    const starSeed = Math.floor(Math.random() * 0xFFFFFF) + 1;
    const hex = gradSeed.toString(16).padStart(6, '0') + starSeed.toString(16).padStart(6, '0');
    
    return { gradSeed, starSeed, hex };
}

// --- Kombine Sistemi Uygulama ---
function applyCombinedSystem(seeds) {
    const randGrad = mulberry32(seeds.gradSeed);
    const randStars = mulberry32(seeds.starSeed);
    
    // 1. Gradyan Arka Plan Hesaplaması
    const x1 = Math.floor(randGrad() * 30) + 5;
    const y1 = Math.floor(randGrad() * 30) + 5;
    const x2 = Math.floor(randGrad() * 30) + 65;
    const y2 = Math.floor(randGrad() * 30) + 65;
    const x3 = Math.floor(randGrad() * 60) + 20;
    const hue1 = Math.floor(randGrad() * 60) + 210;
    const hue2 = Math.floor(randGrad() * 60) + 260;
    
    document.body.style.backgroundImage = [
        `radial-gradient(at ${x1}% ${y1}%, hsl(${hue1}, 38%, 16%) 0px, transparent 50%)`,
        `radial-gradient(at ${x2}% ${y2}%, hsl(${hue2}, 38%, 16%) 0px, transparent 50%)`,
        `radial-gradient(circle at ${x3}% 0%, rgba(139, 126, 255, 0.08) 0px, transparent 40%)`
    ].join(', ');
    
    // HTML elementine kombine hex kodunu bağlama
    const starElement = document.querySelector('.seed-star');
    if (starElement) {
        starElement.dataset.seed = seeds.hex;
        starElement.dataset.hex = seeds.hex;
    }

    // 2. Yıldız Tarlası Hesaplaması
    const starsContainer = document.getElementById('stars');
    if (starsContainer) {
        starsContainer.innerHTML = '';
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
            
            starsContainer.appendChild(starDiv);
        }
    }
}

// Sistemi yükle
const currentSeeds = resolveSeeds();
applyCombinedSystem(currentSeeds);

// --- Zar Butonu: Yeni Rastgele Tema ---
function rerollTheme() {
    const gradSeed = Math.floor(Math.random() * 0xFFFFFF) + 1;
    const starSeed = Math.floor(Math.random() * 0xFFFFFF) + 1;
    const hex = gradSeed.toString(16).padStart(6, '0') + starSeed.toString(16).padStart(6, '0');
    applyCombinedSystem({ gradSeed, starSeed, hex });
    history.replaceState(null, '', '/' + hex);
}

// --- Kombine Seed Linkini Kopyalama ---
function copySeed() {
    const star = document.querySelector('.seed-star');
    if (!star) return;
    const hex = star.dataset.hex;
    navigator.clipboard.writeText(window.location.origin + '/' + hex);
    star.dataset.seed = 'seed copied!';
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
        const res = await fetch(
            '/api/visitors',
            hasVisited ? undefined : { method: 'POST' }
        );
        if (!res.ok) throw new Error('API request failed');
        const data = await res.json();
        if (data && typeof data.count !== 'undefined') {
            countEl.textContent = data.count.toLocaleString();
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
});