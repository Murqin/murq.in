// Yazı dizini — yeni yazı eklemek için:
//   1. posts/<slug>.md dosyasını oluştur (başlık buradan gelir, .md'ye h1 koyma)
//   2. Bu diziye kayıt ekle
//   3. `python3 tools/update-rss.py` çalıştır (doğrular, rss.xml'i üretir,
//      değişikliği stage'ler)
// Alanlar: slug (dosya adıyla birebir aynı), title, date (YYYY-AA-GG), summary
// Not: tools/generate-rss.js bu dosyayı Node'da değerlendirir — düz
// `const POSTS = [...]` biçimini koru (export/IIFE/window ekleme).
const POSTS = [
    {
        slug: 'hello-world',
        title: 'Hello, world',
        date: '2026-07-03',
        summary:
            'First notes: why this site has no build step, and how the ' +
            'seed-driven themes work.'
    }
];
