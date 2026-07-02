# Faz 2 — Görsel Cila Paketi Uygulama Planı

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** murq.in'in mevcut glassmorphic kimliğini koruyarak "ödüllü site" hissi veren hareket koreografisi, tema geçiş sahnesi, derinlik efektleri, mikro-etkileşimler ve tipografik incelik eklemek (spec Faz 2, bölüm 2.1–2.5).

**Architecture:** Tüm değişiklikler mevcut üç dosyada yapılır: `style.css` (animasyonlar, değişkenler, efekt stilleri), `script.js` (crossfade, parallax, kayan yıldız, count-up) ve `index.html` (tek yeni element: `#gradient` katman konteyneri). Gradyan `body.style.backgroundImage`'den `#gradient` içindeki katman div'lerine taşınır; crossfade eski katmanın üzerine yeni katmanın opacity ile bindirilmesiyle yapılır. Yeni animasyonların tamamı mevcut `prefers-reduced-motion` bloğuna ve JS tarafında `matchMedia` kontrolüne bağlanır.

**Tech Stack:** Saf HTML/CSS/JS (zero-build). Yeni bağımlılık YOK, yeni araç YOK.

## Global Constraints

- Zero-build felsefesi korunur: derleme adımı yok, framework yok, yeni bağımlılık yok.
- Glassmorphic/uzay estetiği ve mor accent (`#8B7EFF` / CSS'te `--accent: #8b7eff`) kimliği korunur.
- Mevcut mobil performans optimizasyonları bozulmaz: düşük blur (6px), az yıldız, box-shadow'suz yıldızlar. Mobil kırılım noktası **600px**'dir (mevcut media query'lerle tutarlı kalınır).
- **Tüm** yeni animasyonlar `prefers-reduced-motion: reduce` altında kapanır. CSS animasyonları mevcut `@media (prefers-reduced-motion: reduce)` bloğuna `animation: none !important` ile eklenir (inline stiller `!important`'sız kuralı ezer — Faz 1'de öğrenilen ders). JS ile sürülen efektler `window.matchMedia('(prefers-reduced-motion: reduce)')` kontrol eder.
- Mouse parallax ve film grain **yalnızca masaüstünde** çalışır (parallax: `(pointer: fine)`, grain: `min-width: 601px`).
- Projede test altyapısı yoktur; doğrulama = JS için `node --check script.js` (beklenen: çıktı yok, exit 0) + grep kontrolleri + görev raporunda insan için manuel tarayıcı kontrol notları. Görsel doğrulama insan tarafından yapılacaktır — implementer raporunda "manuel kontrol gerekli" maddelerini listeler.
- Çalışma dalı: `feat/phase2-visual-polish` (main'den açılır).
- Mevcut `applyCombinedSystem(seeds)` çağrı sözleşmesi korunur: `seeds = { gradSeed: number, starSeed: number, hex: string }`.

## Dosya Yapısı

- `style.css` — Görev 1, 2, 3, 4, 5, 6: değişkenler, koreografi, katman/efekt stilleri (tek stylesheet mevcut desen; bölünmez).
- `script.js` — Görev 3, 4, 5, 6: gradyan katman yönetimi, `rerollTheme` crossfade, `initParallax`, `scheduleShootingStar`, `animateCount`.
- `index.html` — Görev 3: `<div id="gradient">` eklenir (başka HTML değişikliği yok).

---

### Görev 1: Temeller — easing değişkenleri, tipografik skala, ::selection

**Files:**
- Modify: `style.css` (`:root` bloğu ~73-81; font-size/letter-spacing kullanan kurallar; `cubic-bezier(0.16, 1, 0.3, 1)` geçen tüm kurallar)

**Interfaces:**
- Produces: `:root` altında `--ease-out-expo`, `--ease-spring`, `--text-2xs`, `--text-xs`, `--text-sm`, `--text-md`, `--text-xl` CSS değişkenleri. Sonraki tüm görevler easing için **yalnızca** bu değişkenleri kullanır.

- [ ] **Adım 1: `:root` bloğuna değişkenleri ekle**

`style.css` içindeki `:root` bloğunu şöyle genişlet (mevcut renk değişkenleri aynen kalır):

```css
:root {
    --bg: #0b0e1a;
    --card: rgba(16, 20, 39, 0.55);
    --text: #e8e9f3;
    --text-dim: #a4a9d6;
    --accent: #8b7eff;
    --accent-2: #5a7fff;
    --border: rgba(139, 126, 255, 0.12);

    /* Easing eğrileri (Faz 2) — tüm animasyon/transition'lar bunları kullanır */
    --ease-out-expo: cubic-bezier(0.16, 1, 0.3, 1);
    --ease-spring: cubic-bezier(0.34, 1.56, 0.64, 1);

    /* Tipografik skala (Faz 2) — mevcut boyutlar merkezileştirildi */
    --text-2xs: 11px;
    --text-xs: 13px;
    --text-sm: 14px;
    --text-md: 16px;
    --text-xl: 26px;
}
```

Not: skala mevcut boyutları **birebir korur** (görsel regresyon istenmiyor); kazanç boyutların tek yerden yönetilmesi. Yeni boyut icat etme.

- [ ] **Adım 2: Hardcoded easing'leri değişkenle değiştir**

`style.css` içinde `cubic-bezier(0.16, 1, 0.3, 1)` geçen **her** yeri `var(--ease-out-expo)` yap. Geçtiği kurallar: `.card` (animation + transition), `.avatar` (transition), `.social-icon` (transition), `.mail-btn` (transition), `.project-item` (transition). `:root` tanımı dışında literal kalmamalı.

- [ ] **Adım 3: Font boyutlarını değişkenle değiştir**

Aşağıdaki eşlemeyle `font-size` değerlerini değiştir:

| Kural | Eski | Yeni |
|---|---|---|
| `h1` | `26px` | `var(--text-xl)` |
| `.tagline` | `14px` | `var(--text-sm)` |
| `.section-title` | `11px` | `var(--text-2xs)` |
| `.social-icon` | `13px` | `var(--text-xs)` |
| `.mail-btn` | `14px` | `var(--text-sm)` |
| `.source-link, .source-licenses-link` | `13px` | `var(--text-xs)` |
| `footer` | `11px` | `var(--text-2xs)` |
| `.project-name` | `16px` | `var(--text-md)` |
| `.project-link-btn` | `11px` | `var(--text-2xs)` |
| `.project-desc` | `13px` | `var(--text-xs)` |

`.seed-star`'ın `font-size: 20px` değeri ve `.seed-star::after`'ın `11px` değeri skala dışıdır — **dokunma** (ikonik boyutlar).

- [ ] **Adım 4: Letter-spacing'i em birimine çevir ve text-wrap ekle**

```css
h1 {
    /* ... mevcut satırlar ... */
    letter-spacing: -0.02em;   /* eski: -0.5px — 26px'te ~aynı değer, artık boyutla ölçeklenir */
    text-wrap: balance;
}

.tagline {
    /* ... mevcut satırlar ... */
    text-wrap: balance;
}

.section-title {
    /* ... mevcut satırlar ... */
    letter-spacing: 0.18em;    /* eski: 2px — 11px'te ~aynı değer */
}
```

- [ ] **Adım 5: `::selection` rengini ekle**

`:focus-visible` kuralının hemen üstüne ekle:

```css
::selection {
    background: rgba(139, 126, 255, 0.35);
    color: #fff;
}
```

- [ ] **Adım 6: Doğrula**

Çalıştır: `grep -n 'cubic-bezier(0.16' style.css`
Beklenen: yalnızca `:root` içindeki `--ease-out-expo` tanım satırı.

Çalıştır: `grep -cn 'var(--text-' style.css`
Beklenen: en az 10 kullanım.

- [ ] **Adım 7: Commit**

```bash
git add style.css
git commit -m "feat: add easing variables, typographic scale and ::selection color"
```

---

### Görev 2: Giriş koreografisi (kademeli sahneleme)

**Files:**
- Modify: `style.css` (`.card` kuralı; yeni koreografi kuralları; `prefers-reduced-motion` bloğu ~536-542)

**Interfaces:**
- Consumes: `var(--ease-out-expo)` (Görev 1).
- Produces: `--enter-delay` custom property deseni (container çocukları üzerinde). Başka görev tüketmez.

- [ ] **Adım 1: `.card` animasyonunu gecikme destekli yap**

`.card` kuralındaki animation satırını değiştir:

```css
.card {
    /* ... diğer satırlar aynı ... */
    animation: fadeIn 0.7s var(--ease-out-expo) both;
    animation-delay: var(--enter-delay, 0ms);
    /* ... */
}
```

`both` fill-mode kritik: gecikme süresince kart görünmez başlamalı (yoksa "önce görünür sonra animasyon" flaşı olur).

- [ ] **Adım 2: Container çocuklarına kademeli gecikme ver**

`@keyframes fadeIn` tanımının üstüne ekle:

```css
/* --- Giriş Koreografisi (Faz 2.1): hero → grid → projeler → kaynak → footer --- */
.container > :nth-child(1) { --enter-delay: 0ms; }
.container > :nth-child(2) { --enter-delay: 70ms; }
.container > :nth-child(3) { --enter-delay: 140ms; }
.container > :nth-child(4) { --enter-delay: 210ms; }
.container > :nth-child(5) { --enter-delay: 280ms; }
/* grid içindeki ikinci kart, ilkinden 60ms sonra gelir */
.grid > .card:nth-child(2) { --enter-delay: 130ms; }
```

(Custom property kalıtımla `.grid` çocuğu kartlara geçer; ikinci kart override edilir.)

- [ ] **Adım 3: Hero içi kademeli giriş**

Aynı bölgeye ekle:

```css
/* Hero içi sahneleme: avatar → başlık → tagline → section-title → sosyaller */
.hero .avatar,
.hero h1,
.hero .tagline,
.hero .section-title,
.hero .socials {
    animation: fadeIn 0.6s var(--ease-out-expo) both;
}
.hero .avatar { animation-delay: 60ms; }
.hero h1 { animation-delay: 130ms; }
.hero .tagline { animation-delay: 200ms; }
.hero .section-title { animation-delay: 260ms; }
.hero .socials { animation-delay: 320ms; }
```

- [ ] **Adım 4: Footer kutusuna giriş animasyonu ekle**

`.footer-box` kuralına ekle (footer, container'ın 5. çocuğu olduğundan `--enter-delay: 280ms` kalıtımla gelir):

```css
.footer-box {
    /* ... mevcut satırlar ... */
    animation: fadeIn 0.7s var(--ease-out-expo) both;
    animation-delay: var(--enter-delay, 0ms);
}
```

- [ ] **Adım 5: Reduced-motion bloğunu genişlet**

Mevcut bloğu şöyle güncelle:

```css
@media (prefers-reduced-motion: reduce) {
    .star,
    .seed-star,
    .card,
    .hero .avatar,
    .hero h1,
    .hero .tagline,
    .hero .section-title,
    .hero .socials,
    .footer-box {
        animation: none !important;
    }
}
```

- [ ] **Adım 6: Doğrula**

Çalıştır: `grep -c 'animation-delay' style.css`
Beklenen: 7 (.card + .footer-box + 5 hero elemanı).

Çalıştır: `grep -n 'both' style.css`
Beklenen: `.card`, hero grubu ve `.footer-box` animation satırları.

Manuel kontrol notu (rapora yaz): sayfa yenilenince kartlar yukarıdan aşağıya dalga halinde girmeli; reduced-motion emülasyonunda her şey anında görünmeli.

- [ ] **Adım 7: Commit**

```bash
git add style.css
git commit -m "feat: add staggered entrance choreography for cards and hero"
```

---

### Görev 3: Tema geçiş sahnesi (crossfade)

**Files:**
- Modify: `index.html` (body başına `#gradient` div)
- Modify: `script.js` (`applyCombinedSystem` yeniden yapılanır; `rerollTheme` crossfade olur)
- Modify: `style.css` (`#gradient`, `.gradient-layer`, `#stars` transition)

**Interfaces:**
- Consumes: yok (easing'i kendi transition değerinde kullanır).
- Produces: modül seviyesinde `const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)')` (Görev 4, 5, 6 bunu kullanır); `buildStars(starSeed, container)` fonksiyonu; `applyCombinedSystem(seeds)` imzası DEĞİŞMEZ.

- [ ] **Adım 1: HTML'e gradyan konteyneri ekle**

`index.html` içinde `<div id="stars" aria-hidden="true"></div>` satırının **üstüne** ekle:

```html
<div id="gradient" aria-hidden="true"></div>
```

- [ ] **Adım 2: CSS katman stillerini ekle**

`style.css`'te `#stars` kuralının üstüne ekle ve `#stars`'a transition ver:

```css
/* Gradyan katmanları (Faz 2.2 crossfade) */
#gradient {
    position: fixed;
    inset: 0;
    z-index: -2;
    pointer-events: none;
}

.gradient-layer {
    position: absolute;
    inset: 0;
    transition: opacity 0.7s ease;
}
```

`#stars` kuralına ekle:

```css
#stars {
    /* ... mevcut satırlar ... */
    transition: opacity 0.3s ease;
}
```

- [ ] **Adım 3: script.js'i yeniden yapılandır**

`applyCombinedSystem` fonksiyonunu üç parçaya ayır. Gradyan artık `body.style.backgroundImage`'e DEĞİL `#gradient` katmanlarına yazılır (yedek olarak body korunur). Mevcut gradyan/yıldız hesaplama kodu aynen taşınır:

```js
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

// --- Kombine Sistemi Uygulama ---
function applyCombinedSystem(seeds) {
    applyGradient(seeds.gradSeed, false);
    updateSeedStar(seeds.hex);
    const starsContainer = document.getElementById('stars');
    if (starsContainer) {
        buildStars(seeds.starSeed, starsContainer);
    }
}
```

Eski `applyCombinedSystem` gövdesi tamamen silinir; `// Sistemi yükle` bölümü (`const currentSeeds = resolveSeeds(); applyCombinedSystem(currentSeeds);`) aynen kalır.

- [ ] **Adım 4: `rerollTheme`'i crossfade yap**

Mevcut `rerollTheme`'i değiştir:

```js
// --- Zar Butonu: Yeni Rastgele Tema (crossfade ile) ---
let starsRebuildTimer = null;

function rerollTheme() {
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

    // Yıldızlar: mevcutlar söner (~300ms), yenileri yeni konumlarında yanar
    const starsContainer = document.getElementById('stars');
    if (starsContainer) {
        starsContainer.style.opacity = '0';
        clearTimeout(starsRebuildTimer);
        starsRebuildTimer = setTimeout(() => {
            buildStars(starSeed, starsContainer);
            starsContainer.style.opacity = '1';
        }, 320);
    }
}
```

- [ ] **Adım 5: Doğrula**

Çalıştır: `node --check script.js`
Beklenen: çıktı yok, exit 0.

Çalıştır: `grep -n 'body.style.backgroundImage' script.js`
Beklenen: yalnızca `applyGradient` içindeki fallback satırı.

Çalıştır: `grep -n 'id="gradient"' index.html`
Beklenen: 1 eşleşme, `#stars`'tan önce.

Manuel kontrol notu (rapora yaz): zar butonuna basınca arka plan yumuşak geçmeli, yıldızlar sönüp yeni konumda yanmalı (~700ms); reduced-motion emülasyonunda geçiş anlık olmalı; zar'a hızlı çift tıklama görsel bozulma yaratmamalı.

- [ ] **Adım 6: Commit**

```bash
git add index.html script.js style.css
git commit -m "feat: crossfade theme transition on dice reroll"
```

---

### Görev 4: Mouse parallax (yalnızca masaüstü)

**Files:**
- Modify: `script.js` (`initParallax` + DOMContentLoaded çağrısı)
- Modify: `style.css` (`#stars` boyut telafisi)

**Interfaces:**
- Consumes: `reduceMotion` (Görev 3), `#stars` elementi.
- Produces: `initParallax()` — yalnızca DOMContentLoaded'dan çağrılır.

- [ ] **Adım 1: `#stars`'ı kaydırma payı için büyüt**

Parallax `#stars`'ı ±4px kaydırır; kenarlarda boşluk görünmemesi için konteyner 12px taşırılır. `#stars` kuralını güncelle:

```css
#stars {
    position: fixed;
    top: -12px;
    left: -12px;
    width: calc(100vw + 24px);
    height: calc(100vh + 24px);
    pointer-events: none;
    z-index: -1;
    overflow: hidden;
    transition: opacity 0.3s ease;
}
```

(Yıldız konumları %-tabanlı olduğundan 12px büyüme dağılımı fark edilir düzeyde değiştirmez.)

- [ ] **Adım 2: `initParallax` fonksiyonunu ekle**

`script.js`'e, `copySeed`'in üstüne ekle:

```js
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
```

Bilinen ve kabul edilen sınırlama: `pointer`/`reduced-motion` tercihi sayfa açıkken değişirse parallax durumu ancak yenilemede güncellenir.

- [ ] **Adım 3: DOMContentLoaded'a bağla**

```js
document.addEventListener('DOMContentLoaded', () => {
    fetchVisitorCount();
    initParallax();
});
```

- [ ] **Adım 4: Doğrula**

Çalıştır: `node --check script.js`
Beklenen: çıktı yok, exit 0.

Çalıştır: `grep -n 'requestAnimationFrame' script.js`
Beklenen: `initParallax` içinde throttle amaçlı kullanım görünür.

Manuel kontrol notu (rapora yaz): masaüstünde imleç hareketiyle yıldız alanı çok hafif kaymalı; kenarlarda boşluk görünmemeli; mobil emülasyonda ve reduced-motion'da hiç kaymamalı.

- [ ] **Adım 5: Commit**

```bash
git add script.js style.css
git commit -m "feat: add subtle desktop-only mouse parallax to starfield"
```

---

### Görev 5: Kayan yıldız + film grain

**Files:**
- Modify: `script.js` (`spawnShootingStar`, `scheduleShootingStar` + DOMContentLoaded çağrısı)
- Modify: `style.css` (`.shooting-star`, `@keyframes shoot`, grain `body::after`, reduced-motion bloğu)

**Interfaces:**
- Consumes: `reduceMotion` (Görev 3), `#stars` konteyneri (kayan yıldız içine eklenir; Görev 4 parallax'ı kalıtımla alır).
- Produces: `scheduleShootingStar()` — yalnızca DOMContentLoaded'dan çağrılır.

- [ ] **Adım 1: Kayan yıldız CSS'ini ekle**

`@keyframes starTwinkle`'ın altına ekle:

```css
/* --- Kayan Yıldız (Faz 2.3) --- */
.shooting-star {
    position: absolute;
    width: 2px;
    height: 2px;
    border-radius: 50%;
    background: #fff;
    box-shadow: 0 0 6px 1px rgba(255, 255, 255, 0.5);
    opacity: 0;
    pointer-events: none;
    animation: shoot 1.4s ease-out forwards;
}

/* Kuyruk: hareket yönünün tersine uzanır (element yörünge açısıyla döndürülür) */
.shooting-star::after {
    content: "";
    position: absolute;
    top: 50%;
    right: 1px;
    width: 80px;
    height: 1px;
    transform: translateY(-50%);
    background: linear-gradient(to left, rgba(255, 255, 255, 0.6), transparent);
}

@keyframes shoot {
    0% {
        opacity: 0;
        transform: translate3d(0, 0, 0) rotate(var(--angle, 30deg));
    }
    15% {
        opacity: 1;
    }
    100% {
        opacity: 0;
        transform: translate3d(var(--travel-x, 200px), var(--travel-y, 120px), 0) rotate(var(--angle, 30deg));
    }
}
```

- [ ] **Adım 2: Kayan yıldız JS'ini ekle**

`script.js`'e `initParallax`'ın altına ekle:

```js
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
```

Not: reroll `#stars` içeriğini silerse uçan yıldız da silinir — kabul edilir (bir sonraki zamanlayıcı yenisini üretir). `remove()` DOM'dan kopmuş elementte hatasız çalışır.

- [ ] **Adım 3: DOMContentLoaded'a bağla**

```js
document.addEventListener('DOMContentLoaded', () => {
    fetchVisitorCount();
    initParallax();
    scheduleShootingStar();
});
```

- [ ] **Adım 4: Film grain'i ekle (yalnızca masaüstü)**

`style.css`'te reduced-motion bloğunun üstüne ekle:

```css
/* --- Film Grain (Faz 2.3): statik SVG noise, yalnızca masaüstü --- */
@media (min-width: 601px) {
    body::after {
        content: "";
        position: fixed;
        inset: 0;
        z-index: 10;
        pointer-events: none;
        opacity: 0.025;
        background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='128' height='128'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='128' height='128' filter='url(%23n)'/%3E%3C/svg%3E");
        background-size: 128px 128px;
    }
}
```

- [ ] **Adım 5: Reduced-motion bloğunu genişlet**

Bloğa `.shooting-star`'ı ekle ve grain'i kapat (spec: Faz 2 maddelerinin tamamı reduced-motion ile kapatılabilir olmalı):

```css
@media (prefers-reduced-motion: reduce) {
    .star,
    .seed-star,
    .card,
    .hero .avatar,
    .hero h1,
    .hero .tagline,
    .hero .section-title,
    .hero .socials,
    .footer-box,
    .shooting-star {
        animation: none !important;
    }
    body::after {
        content: none;
    }
}
```

- [ ] **Adım 6: Doğrula**

Çalıştır: `node --check script.js`
Beklenen: çıktı yok, exit 0.

Çalıştır: `grep -n 'shooting-star' style.css script.js`
Beklenen: CSS'te sınıf + keyframe + reduced-motion; JS'te spawn fonksiyonu.

Manuel kontrol notu (rapora yaz): sayfada ~15-25 sn bekleyince kuyruğuyla süzülen tek yıldız görünmeli; masaüstünde çok hafif grain dokusu algılanmalı (mobil emülasyonda olmamalı); reduced-motion'da ikisi de kapalı.

- [ ] **Adım 7: Commit**

```bash
git add script.js style.css
git commit -m "feat: add shooting star ambience and desktop film grain"
```

---

### Görev 6: Mikro-etkileşimler

**Files:**
- Modify: `script.js` (`animateCount`, `fetchVisitorCount` entegrasyonu, `copySeed` pulse)
- Modify: `style.css` (`seedPulse` keyframe, `:active` geri bildirimi)

**Interfaces:**
- Consumes: `reduceMotion` (Görev 3), `var(--ease-spring)` (Görev 1).
- Produces: yok (bu son görevdir).

- [ ] **Adım 1: Count-up animasyonunu ekle**

`script.js`'te `fetchVisitorCount`'un üstüne ekle:

```js
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
```

- [ ] **Adım 2: `fetchVisitorCount`'u count-up kullanacak şekilde güncelle**

Yalnızca başarı dalındaki satırı değiştir:

```js
        if (data && typeof data.count !== 'undefined') {
            animateCount(countEl, Number(data.count));
            sessionStorage.setItem('murqin-visited', 'true');
        } else {
            countEl.textContent = '---';
        }
```

(Hata dalları ve `---` davranışı aynen kalır.)

- [ ] **Adım 3: Seed kopyalama pulse'ını ekle**

`style.css`'te `@keyframes twinkle`'ın altına ekle:

```css
/* Seed kopyalama parıltısı (Faz 2.4) */
@keyframes seedPulse {
    0% {
        transform: scale(1);
        text-shadow: 0 0 0 rgba(139, 126, 255, 0);
    }
    40% {
        transform: scale(1.35);
        text-shadow: 0 0 12px rgba(139, 126, 255, 0.8);
    }
    100% {
        transform: scale(1);
        text-shadow: 0 0 0 rgba(139, 126, 255, 0);
    }
}

.seed-star.copied {
    animation: seedPulse 0.45s var(--ease-spring);
    opacity: 1;
}
```

`.seed-star` reduced-motion bloğunda zaten olduğundan pulse otomatik kapanır — ek satır gerekmez.

`script.js`'te `copySeed`'i güncelle:

```js
// --- Kombine Seed Linkini Kopyalama ---
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
    setTimeout(() => { star.classList.remove('copied'); }, 500);
    setTimeout(() => { star.dataset.seed = hex; }, 1800);
}
```

- [ ] **Adım 4: Basılma geri bildirimini ekle**

`style.css`'te `:focus-visible` kuralının üstüne ekle:

```css
/* Basılma geri bildirimi (Faz 2.4) */
.mail-btn:active,
.social-icon:active,
.project-link-btn:active,
.source-link:active,
.source-licenses-link:active {
    transform: scale(0.97);
}

.dice-btn:active {
    transform: rotate(18deg) scale(0.94);
}

.seed-star:active {
    transform: scale(0.94);
}
```

(`:active` bir animasyon değil anlık transform'dur; reduced-motion kapsamı dışında kalması kabul edilir — WCAG hareket kriterleri tetiklenen geçişleri değil kendiliğinden oynayan hareketi hedefler.)

- [ ] **Adım 5: Doğrula**

Çalıştır: `node --check script.js`
Beklenen: çıktı yok, exit 0.

Çalıştır: `grep -n 'animateCount\|seedPulse\|:active' script.js style.css`
Beklenen: count-up JS'te, pulse + active kuralları CSS'te.

Manuel kontrol notu (rapora yaz): sayaç değere kısa bir sayımla ulaşmalı; ✦'a tıklayınca parıltı oynamalı; butonlara basılı tutunca hafif küçülme olmalı; metin seçimi mor olmalı; reduced-motion'da sayaç anında yazılmalı, pulse oynamamalı.

- [ ] **Adım 6: Commit**

```bash
git add script.js style.css
git commit -m "feat: add micro-interactions (count-up, copy pulse, press feedback)"
```

---

## Doğrulama Özeti (görevler bittikten sonra, insan için)

Masaüstü tarayıcıda:
1. Yenile → kartlar kademeli girer (hero içi de kademeli).
2. Zar → gradyan crossfade + yıldızlar söner/yanar; URL güncellenir; ✦ kopyalama hâlâ doğru linki verir.
3. İmleci gezdir → yıldız alanı hafif kayar, kenar boşluğu yok.
4. ~20 sn bekle → kayan yıldız geçer.
5. Grain dokusu fark edilir ama rahatsız etmez.
6. Sayaç count-up ile gelir; ✦ pulse oynar; butonlar basınca küçülür; seçim rengi mor.

DevTools ile:
7. `prefers-reduced-motion: reduce` emülasyonu → hiçbir animasyon oynamaz, zar anlık geçer, grain kapalı, sayaç anında yazılır.
8. Mobil emülasyon (<600px) → parallax ve grain yok; scroll akıcı.
9. Konsol temiz (hata/uyarı yok).
