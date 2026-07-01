# Faz 1: Temel Düzeltmeler ve Sadeleştirme — Uygulama Planı

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Müzik çaları tamamen kaldır; sosyal paylaşım kartları, erişilebilirlik, tema zar butonu, sayaç sertleştirme ve self-host fontları ekle.

**Architecture:** Saf statik site (HTML/CSS/JS) + tek Cloudflare Pages Function. Tüm değişiklikler mevcut dosyalar üzerinde; yeni bağımlılık yok, build adımı yok. Test altyapısı yoktur — her görev, komut tabanlı doğrulama (grep/curl) ve tarayıcı kontrolüyle biter.

**Tech Stack:** HTML5, CSS3, Vanilla JS, Cloudflare Pages Functions + KV, `wrangler pages dev` (yerel doğrulama için).

**Spec:** `docs/superpowers/specs/2026-07-01-site-improvements-design.md` (Faz 1 bölümü)

## Global Constraints

- Zero-build korunur: derleme adımı, framework, CDN bağımlılığı eklenmez.
- Glassmorphic/uzay estetiği ve mor accent (`#8B7EFF`) korunur.
- Mevcut mobil optimizasyonlar (blur 6px, az yıldız, box-shadow'suz yıldız) bozulmaz.
- Yeni animasyonlar `prefers-reduced-motion: reduce` altında kapatılır (Task 3'teki blok).
- Çalışma dizini: repo kökü (`Murq.in/`). Tüm yollar köke görelidir.
- Tarayıcı doğrulaması için yerel sunucu: `python3 -m http.server 8000` (Functions gerekmeyen görevlerde) veya `npx wrangler pages dev . --kv KV` (Task 5).

---

### Task 1: Müzik çaların kaldırılması

**Files:**
- Modify: `index.html` (satır 19 `<audio>` + satır 32–49 müzik çalar bloğu)
- Modify: `script.js` (satır 145–211 `initBackgroundMusic` + satır 216 çağrısı)
- Modify: `style.css` (satır 183–272 müzik çalar/ekolayzer stilleri)
- Modify: `README.md` (müzik özellik maddesi)
- Delete: `assets/Before_the_City_Wakes.mp3`

**Interfaces:**
- Consumes: —
- Produces: Müziksiz temiz taban; sonraki görevler bu dosyaların müzik içermediğini varsayar.

**Not:** Spec, `LICENSES.md`'den parça kaydının silinmesini söyler; ancak dosya incelendi ve parça kaydı zaten yok — `LICENSES.md`'de değişiklik gerekmez.

- [ ] **Step 1: `index.html`'den audio elementini ve müzik çalar bloğunu sil**

Şu satırı sil:

```html
        <audio id="bg-music" src="./assets/Before_the_City_Wakes.mp3" loop preload="none"></audio>
```

Ve şu bloğun tamamını sil (yorum satırı dahil):

```html
                <!-- Glassmorphic Music Player Controller -->
                <div class="music-player-container">
                    <button id="music-toggle" class="music-btn" aria-label="Play/Pause background music">
                        <svg class="play-icon" viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
                            <path d="M8 5v14l11-7z"/>
                        </svg>
                        <svg class="pause-icon" viewBox="0 0 24 24" width="14" height="14" fill="currentColor" style="display: none;">
                            <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
                        </svg>
                    </button>
                    <span class="track-title">Before the City Wakes</span>
                    <div class="equalizer" aria-hidden="true">
                        <span class="bar"></span>
                        <span class="bar"></span>
                        <span class="bar"></span>
                        <span class="bar"></span>
                    </div>
                </div>
```

- [ ] **Step 2: `script.js`'den müzik mantığını sil**

`// --- Arka Plan Müzik Kontrolcüsü ---` yorumundan başlayıp `initBackgroundMusic` fonksiyonunun kapanış süslü parantezine kadar olan bloğun tamamını sil (yaklaşık satır 145–211).

Sonra dosya sonundaki listener'ı şu halden:

```js
document.addEventListener('DOMContentLoaded', () => {
    fetchVisitorCount();
    initBackgroundMusic();
});
```

şu hale getir:

```js
document.addEventListener('DOMContentLoaded', () => {
    fetchVisitorCount();
});
```

- [ ] **Step 3: `style.css`'den müzik çalar stillerini sil**

`/* Music Player Container Styling */` yorumundan başlayıp `bounceBar` keyframe'inin kapanışına kadar olan bloğun tamamını sil (yaklaşık satır 183–272). Silinen seçiciler: `.music-player-container`, `.music-player-container:hover`, `.music-btn`, `.music-btn:hover`, `.track-title`, `.equalizer`, `.equalizer .bar`, `.music-player-container.playing .equalizer .bar` (nth-child varyantları dahil), `@keyframes bounceBar`.

- [ ] **Step 4: MP3 dosyasını ve README maddesini kaldır**

```bash
git rm assets/Before_the_City_Wakes.mp3
```

`README.md`'den şu maddeyi sil:

```markdown
- **🎵 Autoplay-Proof Background Music:** Plays `assets/Before_the_City_Wakes.mp3` with a beautiful custom glassmorphic equalizer bar, featuring state persistence via `localStorage` and dynamic autoplay recovery.
```

- [ ] **Step 5: Kalıntı olmadığını doğrula**

Run: `grep -rin "music\|audio\|equalizer\|bounceBar\|track-title\|City_Wakes" index.html script.js style.css README.md`
Expected: hiçbir çıktı yok (exit code 1).

Run: `python3 -m http.server 8000` başlat, tarayıcıda `http://localhost:8000` aç.
Expected: Sayfa hatasız yüklenir, müzik çalar görünmez, konsolda hata yok (visitor count `---` gösterebilir — Functions yerelde yok, normal).

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat: remove background music player entirely"
```

---

### Task 2: Sosyal paylaşım kartları (Open Graph / Twitter)

**Files:**
- Modify: `index.html` (`<head>` bölümü)

**Interfaces:**
- Consumes: —
- Produces: —

- [ ] **Step 1: Meta etiketlerini ekle**

`index.html` içinde `<meta name="description" ...>` satırının hemen altına ekle:

```html
        <meta property="og:title" content="Icarus Murqin" />
        <meta property="og:description" content="Icarus Murqin's personal site" />
        <meta property="og:url" content="https://murq.in/" />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="https://murq.in/assets/preview.png" />
        <meta name="twitter:card" content="summary_large_image" />
```

- [ ] **Step 2: Doğrula**

Run: `grep -c 'property="og:' index.html && grep -c 'name="twitter:card"' index.html`
Expected: `5` ve `1`.

Tarayıcıda sayfanın hâlâ hatasız yüklendiğini kontrol et. (Canlı kart önizlemesi deploy sonrası opengraph.xyz gibi bir araçla doğrulanabilir — bu görevin kapsamı dışı.)

- [ ] **Step 3: Commit**

```bash
git add index.html
git commit -m "feat: add Open Graph and Twitter Card meta tags"
```

---

### Task 3: Erişilebilirlik (seed butonu, focus-visible, reduced-motion)

**Files:**
- Modify: `index.html` (seed-star span → button)
- Modify: `style.css` (buton reset, focus-visible, reduced-motion bloğu)

**Interfaces:**
- Consumes: `script.js` içindeki mevcut `copySeed()` (değişmez).
- Produces: `.seed-star` artık bir `<button>`; Task 4 zar butonunu bunun soluna konumlandırır. Reduced-motion bloğu Faz 2'nin genişleteceği yerdir.

**Not (mevcut hata):** `.seed-star` span'i tamamen boştur — görünür glifi ve genişliği yok, fiilen tıklanamaz. Butona `✦` glifi eklenerek bu da düzeltilir.

- [ ] **Step 1: Span'i butona çevir**

`index.html`'de şu bloğu:

```html
                <span class="seed-star" aria-hidden="true" onclick="copySeed()">
                </span>
```

şununla değiştir:

```html
                <button type="button" class="seed-star" aria-label="Copy theme seed link" onclick="copySeed()">✦</button>
```

- [ ] **Step 2: CSS'i güncelle**

`style.css`'de `.seed-star` kuralının başına buton reset özelliklerini ekle — kural şu hale gelir:

```css
.seed-star {
    background: none;
    border: none;
    padding: 0;
    font: inherit;
    line-height: 1;
    position: absolute;
    top: 24px;
    right: 24px;
    color: var(--accent);
    font-size: 20px;
    opacity: 0.5;
    animation: twinkle 3s ease-in-out infinite;
    cursor: pointer;
    user-select: none;
    transition:
        opacity 0.2s ease,
        transform 0.2s ease;
}
```

Dosyanın sonuna (media query'lerden önce) şu iki bloğu ekle:

```css
:focus-visible {
    outline: 2px solid var(--accent);
    outline-offset: 3px;
}

@media (prefers-reduced-motion: reduce) {
    .star,
    .seed-star,
    .card {
        animation: none;
    }
}
```

- [ ] **Step 3: Doğrula**

Run: `python3 -m http.server 8000` ile aç.
Expected:
- Hero sağ üstte mor `✦` glifi görünür ve tıklayınca "seed copied!" tooltip'i çalışır.
- Tab tuşuyla gezinirken `✦` dahil tüm linkler/butonlar mor outline ile odak gösterir.
- DevTools → Rendering → "Emulate CSS prefers-reduced-motion: reduce" açıkken yıldız titremesi ve kart giriş animasyonu oynamaz.

- [ ] **Step 4: Commit**

```bash
git add index.html style.css
git commit -m "feat: a11y pass - seed button, focus-visible, reduced-motion"
```

---

### Task 4: Zar butonu (tema yenileme)

**Files:**
- Modify: `index.html` (hero'ya zar butonu)
- Modify: `style.css` (`.dice-btn` stilleri)
- Modify: `script.js` (`rerollTheme()` fonksiyonu)

**Interfaces:**
- Consumes: `script.js` içindeki mevcut `applyCombinedSystem(seeds)` — imza: `{ gradSeed: number, starSeed: number, hex: string }` alır; arka planı, yıldızları ve `.seed-star`'ın `data-seed`/`data-hex`'ini günceller. Task 3'ün `.seed-star` butonu (sağ üst `right: 24px`).
- Produces: `rerollTheme()` global fonksiyonu; Faz 2'nin tema crossfade sahnesi bu fonksiyonu genişletecek.

- [ ] **Step 1: Butonu HTML'e ekle**

`index.html`'de `.seed-star` butonunun hemen üstüne (aynı girinti seviyesinde) ekle:

```html
                <button type="button" class="dice-btn" aria-label="Generate a new random theme" onclick="rerollTheme()">
                    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                        <rect x="3" y="3" width="18" height="18" rx="4"/>
                        <circle cx="8.5" cy="8.5" r="1" fill="currentColor"/>
                        <circle cx="15.5" cy="8.5" r="1" fill="currentColor"/>
                        <circle cx="12" cy="12" r="1" fill="currentColor"/>
                        <circle cx="8.5" cy="15.5" r="1" fill="currentColor"/>
                        <circle cx="15.5" cy="15.5" r="1" fill="currentColor"/>
                    </svg>
                </button>
```

- [ ] **Step 2: CSS ekle**

`style.css`'de `.seed-star:hover::after` kuralının altına ekle:

```css
.dice-btn {
    position: absolute;
    top: 25px;
    right: 56px;
    background: none;
    border: none;
    padding: 0;
    line-height: 1;
    color: var(--accent);
    opacity: 0.5;
    cursor: pointer;
    transition:
        opacity 0.2s ease,
        transform 0.2s ease;
}

.dice-btn:hover {
    opacity: 1;
    transform: rotate(18deg) scale(1.1);
}
```

- [ ] **Step 3: `rerollTheme()` fonksiyonunu ekle**

`script.js`'de `copySeed()` fonksiyonunun üstüne ekle:

```js
// --- Zar Butonu: Yeni Rastgele Tema ---
function rerollTheme() {
    const gradSeed = Math.floor(Math.random() * 0xFFFFFF) + 1;
    const starSeed = Math.floor(Math.random() * 0xFFFFFF) + 1;
    const hex = gradSeed.toString(16).padStart(6, '0') + starSeed.toString(16).padStart(6, '0');
    applyCombinedSystem({ gradSeed, starSeed, hex });
    history.replaceState(null, '', '/' + hex);
}
```

- [ ] **Step 4: Doğrula**

Run: `python3 -m http.server 8000` ile aç.
Expected:
- Seed yıldızının solunda zar ikonu görünür; hover'da hafif döner.
- Tıklayınca arka plan gradyanı ve yıldız dizilimi anında değişir, adres çubuğu `/[12 hex karakter]` olur.
- Yeni URL kopyalanıp yeni sekmede açılınca **aynı** tema gelir (`http.server` altında `/hex` yolu 404 verir — bu doğrulama `npx wrangler pages dev .` ile yapılır, `_redirects` orada çalışır).
- Zar sonrası seed yıldızına tıklayınca kopyalanan link yeni hex'i içerir.

- [ ] **Step 5: Commit**

```bash
git add index.html style.css script.js
git commit -m "feat: add dice button for random theme reroll"
```

---

### Task 5: Ziyaretçi sayacı sertleştirme

**Files:**
- Modify: `functions/api/visitors.js` (tamamen yeniden yazılır)
- Modify: `script.js` (`fetchVisitorCount`)

**Interfaces:**
- Consumes: —
- Produces: API sözleşmesi — `GET /api/visitors` → `{ count }` (yan etkisiz); `POST /api/visitors` → Origin `https://murq.in` veya `http://localhost:8788` değilse `403 { error }`, geçerliyse sayacı artırıp `{ count }` döner.

- [ ] **Step 1: `functions/api/visitors.js`'i yeniden yaz**

Dosyanın tüm içeriğini şununla değiştir:

```js
const ALLOWED_ORIGINS = [
    'https://murq.in',
    'http://localhost:8788', // wrangler pages dev
];

function jsonResponse(body, status = 200) {
    return new Response(JSON.stringify(body), {
        status,
        headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
        },
    });
}

// KV binding yoksa (yerel önizleme / eksik yapılandırma) mock değerle devam et
function kvMissingResponse() {
    return jsonResponse({
        count: 9999,
        warning: "Cloudflare KV Namespace 'KV' binding is missing. Using local fallback.",
    });
}

// GET: yalnızca okuma, yan etkisiz
export async function onRequestGet(context) {
    const kv = context.env.KV;
    if (!kv) return kvMissingResponse();

    try {
        const count = parseInt((await kv.get('visitor_count')) || '0');
        return jsonResponse({ count });
    } catch (err) {
        return jsonResponse({ error: err.message }, 500);
    }
}

// POST: Origin doğrulamalı artırma
export async function onRequestPost(context) {
    const { request, env } = context;

    const origin = request.headers.get('Origin');
    if (!ALLOWED_ORIGINS.includes(origin)) {
        return jsonResponse({ error: 'Forbidden' }, 403);
    }

    const kv = env.KV;
    if (!kv) return kvMissingResponse();

    try {
        // Not: KV get/put atomik değildir; eşzamanlı ziyaretlerde nadiren
        // bir sayım kaybolabilir. Kişisel site ölçeğinde kabul edilebilir.
        const count = parseInt((await kv.get('visitor_count')) || '0') + 1;
        await kv.put('visitor_count', count.toString());
        return jsonResponse({ count });
    } catch (err) {
        return jsonResponse({ error: err.message }, 500);
    }
}
```

- [ ] **Step 2: `script.js`'de `fetchVisitorCount`'u güncelle**

Fonksiyonu şu hale getir (yorumlar dahil değiştir):

```js
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
```

- [ ] **Step 3: Yerel Functions ortamıyla doğrula**

Run (arka planda): `npx wrangler pages dev . --kv KV --port 8788`

Sonra sırayla:

```bash
# 1. GET okur, artırmaz
curl -s http://localhost:8788/api/visitors
# Expected: {"count":0}

# 2. Origin'siz POST reddedilir
curl -s -o /dev/null -w "%{http_code}" -X POST http://localhost:8788/api/visitors
# Expected: 403

# 3. Yabancı Origin reddedilir
curl -s -o /dev/null -w "%{http_code}" -X POST -H "Origin: https://evil.example" http://localhost:8788/api/visitors
# Expected: 403

# 4. Geçerli Origin artırır
curl -s -X POST -H "Origin: http://localhost:8788" http://localhost:8788/api/visitors
# Expected: {"count":1}

# 5. Eski GET ?inc=true artık artırmaz
curl -s "http://localhost:8788/api/visitors?inc=true"
# Expected: {"count":1}  (değişmedi)
```

Tarayıcıda `http://localhost:8788` aç: sayaç bir artar; sayfayı yenileyince (aynı oturum) artmaz.

- [ ] **Step 4: Commit**

```bash
git add functions/api/visitors.js script.js
git commit -m "feat: harden visitor counter - POST-only increment with Origin check"
```

---

### Task 6: Fontların self-host edilmesi

**Files:**
- Create: `assets/fonts/` (8 woff2 dosyası)
- Modify: `style.css` (başa `@font-face` blokları)
- Modify: `index.html` (Google Fonts linklerini kaldır)
- Modify: `LICENSES.md` (font lisansları)

**Interfaces:**
- Consumes: —
- Produces: —

**Not:** `latin-ext` alt kümesi bilinçli dahildir — Faz 3 blog'u Türkçe içerik barındıracak (ş, ğ, ı, İ vb. karakterler `latin-ext`'tedir).

- [ ] **Step 1: Font dosyalarını indir**

```bash
mkdir -p assets/fonts
cd assets/fonts
curl -fL -o inter-latin-300.woff2              https://cdn.jsdelivr.net/fontsource/fonts/inter@latest/latin-300-normal.woff2
curl -fL -o inter-latin-400.woff2              https://cdn.jsdelivr.net/fontsource/fonts/inter@latest/latin-400-normal.woff2
curl -fL -o inter-latin-ext-300.woff2          https://cdn.jsdelivr.net/fontsource/fonts/inter@latest/latin-ext-300-normal.woff2
curl -fL -o inter-latin-ext-400.woff2          https://cdn.jsdelivr.net/fontsource/fonts/inter@latest/latin-ext-400-normal.woff2
curl -fL -o jetbrains-mono-latin-400.woff2     https://cdn.jsdelivr.net/fontsource/fonts/jetbrains-mono@latest/latin-400-normal.woff2
curl -fL -o jetbrains-mono-latin-600.woff2     https://cdn.jsdelivr.net/fontsource/fonts/jetbrains-mono@latest/latin-600-normal.woff2
curl -fL -o jetbrains-mono-latin-ext-400.woff2 https://cdn.jsdelivr.net/fontsource/fonts/jetbrains-mono@latest/latin-ext-400-normal.woff2
curl -fL -o jetbrains-mono-latin-ext-600.woff2 https://cdn.jsdelivr.net/fontsource/fonts/jetbrains-mono@latest/latin-ext-600-normal.woff2
cd ../..
ls -la assets/fonts/
```

Expected: 8 dosya, her biri > 10KB.

- [ ] **Step 2: `@font-face` tanımlarını ekle**

`style.css`'in en başına (mevcut `* { ... }` kuralından önce) ekle:

```css
/* --- Self-hosted Fonts (Inter & JetBrains Mono, SIL OFL 1.1) --- */
@font-face {
    font-family: "Inter";
    font-style: normal;
    font-weight: 300;
    font-display: swap;
    src: url("./assets/fonts/inter-latin-300.woff2") format("woff2");
    unicode-range: U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+2000-206F, U+20AC, U+2122, U+2212, U+FEFF, U+FFFD;
}
@font-face {
    font-family: "Inter";
    font-style: normal;
    font-weight: 300;
    font-display: swap;
    src: url("./assets/fonts/inter-latin-ext-300.woff2") format("woff2");
    unicode-range: U+0100-02AF, U+1E00-1E9F, U+1EF2-1EFF, U+2020, U+20A0-20AB, U+20AD-20C0, U+2113, U+2C60-2C7F, U+A720-A7FF;
}
@font-face {
    font-family: "Inter";
    font-style: normal;
    font-weight: 400;
    font-display: swap;
    src: url("./assets/fonts/inter-latin-400.woff2") format("woff2");
    unicode-range: U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+2000-206F, U+20AC, U+2122, U+2212, U+FEFF, U+FFFD;
}
@font-face {
    font-family: "Inter";
    font-style: normal;
    font-weight: 400;
    font-display: swap;
    src: url("./assets/fonts/inter-latin-ext-400.woff2") format("woff2");
    unicode-range: U+0100-02AF, U+1E00-1E9F, U+1EF2-1EFF, U+2020, U+20A0-20AB, U+20AD-20C0, U+2113, U+2C60-2C7F, U+A720-A7FF;
}
@font-face {
    font-family: "JetBrains Mono";
    font-style: normal;
    font-weight: 400;
    font-display: swap;
    src: url("./assets/fonts/jetbrains-mono-latin-400.woff2") format("woff2");
    unicode-range: U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+2000-206F, U+20AC, U+2122, U+2212, U+FEFF, U+FFFD;
}
@font-face {
    font-family: "JetBrains Mono";
    font-style: normal;
    font-weight: 400;
    font-display: swap;
    src: url("./assets/fonts/jetbrains-mono-latin-ext-400.woff2") format("woff2");
    unicode-range: U+0100-02AF, U+1E00-1E9F, U+1EF2-1EFF, U+2020, U+20A0-20AB, U+20AD-20C0, U+2113, U+2C60-2C7F, U+A720-A7FF;
}
@font-face {
    font-family: "JetBrains Mono";
    font-style: normal;
    font-weight: 600;
    font-display: swap;
    src: url("./assets/fonts/jetbrains-mono-latin-600.woff2") format("woff2");
    unicode-range: U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+2000-206F, U+20AC, U+2122, U+2212, U+FEFF, U+FFFD;
}
@font-face {
    font-family: "JetBrains Mono";
    font-style: normal;
    font-weight: 600;
    font-display: swap;
    src: url("./assets/fonts/jetbrains-mono-latin-ext-600.woff2") format("woff2");
    unicode-range: U+0100-02AF, U+1E00-1E9F, U+1EF2-1EFF, U+2020, U+20A0-20AB, U+20AD-20C0, U+2113, U+2C60-2C7F, U+A720-A7FF;
}
```

- [ ] **Step 3: Google Fonts linklerini kaldır**

`index.html`'den şu üç etiketi sil:

```html
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
        <link
            href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400&family=JetBrains+Mono:wght@400;600&display=swap"
            rel="stylesheet"
        />
```

- [ ] **Step 4: `LICENSES.md`'ye font bölümü ekle**

Dosyanın sonuna ekle:

```markdown

---

## Fonts

### 3. Inter

- **File Path**: `assets/fonts/inter-*.woff2`
- **Author**: Rasmus Andersson
- **Source**: [rsms.me/inter](https://rsms.me/inter/) — files obtained via [Fontsource](https://fontsource.org/)
- **License**: [SIL Open Font License 1.1](https://openfontlicense.org/)

### 4. JetBrains Mono

- **File Path**: `assets/fonts/jetbrains-mono-*.woff2`
- **Author**: JetBrains
- **Source**: [jetbrains.com/lp/mono](https://www.jetbrains.com/lp/mono/) — files obtained via [Fontsource](https://fontsource.org/)
- **License**: [SIL Open Font License 1.1](https://openfontlicense.org/)
```

- [ ] **Step 5: Doğrula**

Run: `grep -in "googleapis\|gstatic" index.html style.css`
Expected: hiçbir çıktı yok (exit code 1).

Run: `python3 -m http.server 8000` ile aç, DevTools → Network → Font filtresi.
Expected: Fontlar `assets/fonts/` yolundan yüklenir (`fonts.gstatic.com` isteği yok); başlıklar JetBrains Mono, gövde Inter olarak render olur (Network'te en az 2 woff2 isteği görünür).

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat: self-host Inter and JetBrains Mono fonts, drop Google Fonts"
```

---

## Plan Sonu Kontrolü

Tüm görevler bittiğinde:

- [ ] `git log --oneline` — 6 yeni commit görünmeli.
- [ ] `npx wrangler pages dev . --kv KV --port 8788` ile tam site turu: tema zarı, seed kopyalama, sayaç, fontlar, klavye gezinmesi.
- [ ] Faz 2 planına geçmeden önce kullanıcıya deploy edip canlıda kontrol etmesi önerilir (OG kartı ancak canlıda doğrulanır).
