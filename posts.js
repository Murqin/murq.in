// Yazı dizini — yeni yazı eklemek için:
//   1. posts/<slug>.md dosyasını oluştur (başlık buradan gelir, .md'ye h1 koyma)
//   2. Bu diziye kayıt ekle
//   3. `node tools/generate-rss.js` çalıştırıp rss.xml'i güncelle
// Alanlar: slug (dosya adıyla birebir aynı), title, date (YYYY-AA-GG), summary
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
