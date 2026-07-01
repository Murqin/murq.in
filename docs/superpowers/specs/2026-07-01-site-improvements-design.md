# murq.in Site İyileştirmeleri — Tasarım Dokümanı

**Tarih:** 2026-07-01
**Durum:** Onaylandı (kullanıcı ile birlikte tasarlandı)
**Kapsam:** Üç fazlı iyileştirme: temel düzeltmeler ve sadeleştirme, görsel cila, blog.

## Genel Bakış

murq.in; glassmorphic kartlar, seed tabanlı tema motoru ve canvas'sız yıldız alanı
animasyonuna sahip, zero-build (saf HTML/CSS/JS) kişisel bir sitedir. Bu tasarım,
mevcut görsel kimliği **koruyarak** siteyi üç fazda iyileştirir:

- **Faz 1:** Müzik çaların kaldırılması, sosyal paylaşım kartları, erişilebilirlik,
  zar butonu, ziyaretçi sayacı sertleştirme, fontların self-host edilmesi.
- **Faz 2:** Görsel cila paketi — hareket koreografisi, tema geçiş sahnesi, derinlik,
  mikro-etkileşimler, tipografik incelik.
- **Faz 3:** Markdown tabanlı blog (istemci tarafında render, karışık dil, RSS).

Değişmezler (tüm fazlar için geçerli):

- Zero-build felsefesi korunur: derleme adımı yok, framework yok.
- Glassmorphic/uzay estetiği ve mor accent (`#8B7EFF`) kimliği korunur.
- Mevcut mobil performans optimizasyonları (düşük blur, az yıldız, box-shadow'suz
  yıldızlar) bozulmaz.
- Tüm animasyonlar `prefers-reduced-motion: reduce` kuralına saygılıdır.

---

## Faz 1 — Temel Düzeltmeler ve Sadeleştirme

### 1.1 Müzik çaların kaldırılması

Arka plan müziği özelliği siteden tamamen kaldırılır:

- `index.html`: `<audio id="bg-music">` elementi ve `.music-player-container`
  bloğu (play/pause butonu, parça adı, ekolayzer) silinir.
- `script.js`: `initBackgroundMusic()` fonksiyonu, autoplay recovery mantığı ve
  `DOMContentLoaded` içindeki çağrısı silinir.
- `style.css`: `.music-player-container`, `.music-btn`, `.track-title`,
  `.equalizer`, `.bar`, `bounceBar` keyframe'i ve ilgili tüm kurallar silinir.
- `assets/Before_the_City_Wakes.mp3` dosyası repodan silinir.
- `README.md`: "Autoplay-Proof Background Music" özellik maddesi kaldırılır.
- `LICENSES.md`: parçaya ait lisans/atıf kaydı kaldırılır.
- `localStorage`'daki eski `music-enabled` anahtarına dokunulmaz (zararsız kalıntı).

### 1.2 Sosyal paylaşım kartları (Open Graph / Twitter)

`index.html` `<head>` bölümüne eklenir:

- `og:title` — "Icarus Murqin"
- `og:description` — mevcut meta description ile aynı
- `og:image` — `https://murq.in/assets/preview.png` (mutlak URL)
- `og:url` — `https://murq.in`
- `og:type` — `website`
- `twitter:card` — `summary_large_image`

Görünür hiçbir değişiklik yoktur; yalnızca link paylaşımlarında önizleme kartı çıkar.

### 1.3 Erişilebilirlik

- `.seed-star`, `onclick`'li `<span>` yerine gerçek bir `<button>` olur;
  `aria-label` eklenir, klavyeyle odaklanıp Enter ile tetiklenebilir.
  Mevcut görsel stil korunur (buton varsayılan stilleri sıfırlanır).
- Tüm interaktif öğelere (linkler, butonlar) mor accent ile uyumlu, görünür bir
  `:focus-visible` stili eklenir.
- `@media (prefers-reduced-motion: reduce)` bloğu eklenir: yıldız titremesi,
  seed yıldızı animasyonu ve kart giriş animasyonları kapatılır (Faz 2'de eklenen
  tüm animasyonlar da bu bloğa dahil edilir).

### 1.4 Zar butonu (tema yenileme)

- Seed yıldızının yanına küçük bir zar ikonu butonu eklenir (SVG, mevcut
  minimalist ikon diliyle uyumlu).
- Tıklanınca: yeni rastgele gradyan + yıldız seed'i üretilir, tema **sayfa
  yenilenmeden** `applyCombinedSystem()` ile uygulanır, URL
  `history.replaceState` ile `/<12-karakter-hex>` biçiminde güncellenir.
- Seed yıldızının kopyalama davranışı değişmez; zar butonu yalnızca yeni tema üretir.
- Klavye erişilebilirliği ve `aria-label` 1.3 ile tutarlıdır.

### 1.5 Ziyaretçi sayacı sertleştirme

`functions/api/visitors.js` değişiklikleri:

- Artırma işlemi `GET ?inc=true` yerine **POST** isteğine taşınır; `GET` yalnızca
  mevcut sayıyı okur. (Crawler'lar ve rastgele GET'ler sayacı artıramaz.)
- POST isteklerinde `Origin` başlığı `https://murq.in` ile eşleşmiyorsa artırma
  reddedilir (403). Okuma isteklerinde kontrol yoktur.
- `script.js` buna uygun güncellenir: ilk oturumda POST, sonraki yüklemelerde GET.
- KV binding yoksa mevcut mock-count davranışı (9999 + uyarı) korunur.

**Bilinen sınırlama:** KV get/put atomik değildir; eşzamanlı ziyaretlerde nadiren
bir sayım kaybolabilir. Kişisel site ölçeğinde kabul edilebilir; Durable Objects
bu iş için gereksiz karmaşıklık olurdu.

### 1.6 Fontların self-host edilmesi

- Inter (300, 400) ve JetBrains Mono (400, 600) woff2 dosyaları
  `assets/fonts/` altına eklenir.
- `style.css` başına `@font-face` tanımları (`font-display: swap`) eklenir.
- `index.html`'deki Google Fonts `<link>` ve `preconnect` etiketleri kaldırılır.
- `LICENSES.md`'ye font lisansları (SIL OFL) eklenir/güncellenir.

---

## Faz 2 — Görsel Cila Paketi

Amaç: mevcut kimliği koruyarak "ödüllü site" hissi veren detay yoğunluğu ve hareket
koreografisi. Tüm maddeler `prefers-reduced-motion` ile kapatılabilir olmalıdır;
parallax ve grain mobilde devre dışıdır.

### 2.1 Hareket koreografisi

- Kart girişleri kademeli sahnelenir: hero → grid kartları → projeler → footer,
  her biri ~60–80ms gecikmeyle (CSS `animation-delay`).
- Hero içi öğeler de kendi içinde kademelidir: avatar → başlık → tagline → sosyaller.
- Easing eğrileri `:root` altında CSS değişkenleri olarak toplanır
  (ör. `--ease-out-expo`, `--ease-spring`); tüm animasyon/transition'lar bu
  değişkenleri kullanır.

### 2.2 Tema geçiş sahnesi

- Zar butonuna basınca yeni tema crossfade ile gelir: arka plan gradyanı
  yumuşak geçiş yapar, mevcut yıldızlar söner, yenileri yeni konumlarında yanar
  (~600–800ms toplam).
- `reduced-motion` altında geçiş anlıktır.

### 2.3 Derinlik ve atmosfer

- **Mouse parallax (yalnızca masaüstü):** yıldız alanı imleç hareketiyle çok hafif
  kayar (birkaç px, `transform` ile; `requestAnimationFrame` üzerinden throttle).
- **Kayan yıldız:** ~15–25 sn'de bir, rastgele bir yörüngede süzülen tek bir
  kayan yıldız animasyonu.
- **Film grain:** tüm sayfanın üzerinde %2–3 opaklıkta, sabit boyutlu bir SVG/PNG
  noise dokusu (`pointer-events: none`). Mobilde uygulanmaz.

### 2.4 Mikro-etkileşimler

- Ziyaretçi sayacı, değere kısa bir count-up animasyonuyla ulaşır.
- Seed kopyalandığında yıldızda minik bir parıltı/pulse efekti oynar.
- Butonlarda ve tıklanabilir kartlarda basılma anında ince bir `scale(0.97)`
  geri bildirimi.
- `::selection` rengi mor accent ile eşleştirilir.

### 2.5 Tipografik incelik

- Başlık/gövde boyutları modüler bir skalaya oturtulur (CSS değişkenleriyle).
- `h1` ve tagline'da `text-wrap: balance` kullanılır.
- Harf aralıkları (letter-spacing) başlık ve section-title'larda gözden geçirilir.

---

## Faz 3 — Blog / Notlar

### 3.1 Mimari

Zero-build korunur: yazılar repoda `.md` dosyası olarak durur, tarayıcıda
vendored bir markdown parser ile render edilir. Yeni yazı yayınlamak =
markdown dosyası eklemek + manifest'e bir kayıt eklemek + push.

Dosya yapısı:

```text
posts/
├── index.json          # Manifest: tüm yazıların metadata'sı
└── YYYY-MM-DD-slug.md  # Yazı gövdeleri (yalnızca markdown içerik)
blog.html               # Blog sayfası (liste + yazı görünümü)
assets/js/blog.js       # Blog mantığı (manifest yükleme, routing, render)
assets/js/marked.min.js # Vendored markdown parser
functions/rss.xml.js    # RSS feed üreten Pages Function
```

### 3.2 Metadata — tek kaynak: manifest

Yazı metadata'sı **yalnızca** `posts/index.json` içinde tutulur; `.md` dosyasında
front-matter yoktur (çift kayıt önlenir):

```json
[
  {
    "slug": "2026-07-01-ilk-yazi",
    "title": "İlk Yazı",
    "date": "2026-07-01",
    "lang": "tr",
    "summary": "Kısa özet..."
  }
]
```

- `lang` değeri `"tr"` veya `"en"` olabilir (karışık dilli blog).
- Manifest tarihe göre yeniden-eskiye sıralı tutulur; istemci yine de tarihe göre
  sıralayarak savunmacı davranır.

### 3.3 blog.html sayfası

- Mevcut `style.css`, yıldız alanı ve glassmorphic kart estetiği aynen kullanılır;
  seed tabanlı tema motoru blog sayfasında da çalışır.
- İki görünüm, tek sayfa (hash routing):
  - `/blog` → yazı listesi: kart başına başlık, tarih, dil rozeti (`TR`/`EN`), özet.
  - `/blog#<slug>` → yazı görünümü; sayfa yenilenmeden açılır, tarayıcı geri tuşu
    çalışır (`hashchange` dinlenir).
- Yazı görünümünde: başlık, tarih, dil rozeti, render edilmiş içerik ve listeye
  dönüş linki.
- Markdown içindeki başlıklar, kod blokları, linkler ve listeler mevcut
  JetBrains Mono / Inter tipografisiyle stillenir. Blog'a özel stiller ayrı bir
  `blog.css` dosyasında tutulur ve yalnızca `blog.html` tarafından yüklenir
  (ana sayfa yükü büyümez).

**Routing notu:** Cloudflare Pages statik dosyaları `_redirects` kurallarından önce
sunar; mevcut `/* → /index.html 200` seed yönlendirmesi bozulmaz. `/blog` isteği
Pages'in otomatik HTML çözümlemesiyle `blog.html`'e gider.

### 3.4 Markdown render

- `marked.min.js` yerel olarak vendor edilir (CDN bağımlılığı yok);
  `LICENSES.md`'ye lisansı eklenir.
- Sanitizer katmanı eklenmez: içerik yalnızca site sahibinin kendi yazdığı
  markdown'dır, üçüncü taraf girdisi yoktur. (Bilinen ve kabul edilen karar.)

### 3.5 RSS

- `functions/rss.xml.js` Pages Function'ı `/rss.xml` yolunda feed üretir.
- Manifest'i `env.ASSETS.fetch` ile okur; her yazı için `<item>` üretir
  (başlık, link `https://murq.in/blog#<slug>`, tarih, özet, dil).
- Manifest güncellenince RSS otomatik güncel kalır; elle XML bakımı yoktur.
- `blog.html` `<head>`'ine `<link rel="alternate" type="application/rss+xml">`
  eklenir.

### 3.6 Ana sayfa entegrasyonu

- `index.html`'de sosyal linklerin (`.socials`) yanına, aynı `.social-icon`
  stilinde bir "Blog" linki eklenir — mevcut düzenle bire bir uyumlu, yeni
  bileşen gerektirmez.

### 3.7 Hata durumları

- Manifest yüklenemezse: liste yerine sade bir hata mesajı.
- Geçersiz/bilinmeyen slug: "yazı bulunamadı" mesajı + listeye dönüş linki.
- Markdown dosyası yüklenemezse (manifest'te var ama dosya yok): aynı
  "yazı bulunamadı" akışı.

---

## Test Yaklaşımı

Projede test altyapısı yoktur (saf statik site); doğrulama manueldir:

- **Faz 1:** Sayfa müzik çalar olmadan hatasız yüklenir (konsol temiz); OG kartı
  bir link-preview aracıyla doğrulanır; klavye ile tüm interaktif öğeler gezilir;
  `?inc=true` GET isteğinin sayacı artırmadığı, POST'un artırdığı `wrangler pages dev`
  ile yerelde doğrulanır; fontlar network sekmesinde yerelden yüklenir.
- **Faz 2:** Animasyonlar masaüstü + mobil görünümde ve `prefers-reduced-motion`
  emülasyonuyla kontrol edilir; mobilde scroll performansı gözlemlenir.
- **Faz 3:** Örnek TR + EN yazılarla liste, yazı görünümü, geri tuşu, hata
  durumları ve `/rss.xml` çıktısı (`wrangler pages dev` ile) doğrulanır.

## Uygulama Sırası

Fazlar sırayla uygulanır (1 → 2 → 3); her faz kendi başına yayınlanabilir
durumda biter. Her faz için ayrı uygulama planı yazılır.
