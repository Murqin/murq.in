// Yazı dizini — yeni yazı eklemek için:
//   1. posts/<slug>.md dosyasını oluştur (başlık buradan gelir, .md'ye h1 koyma)
//   2. Bu diziye kayıt ekle
//   3. `node tools/update-rss.js` çalıştır (doğrular, rss.xml'i üretir,
//      değişikliği stage'ler)
// Alanlar: slug (dosya adıyla birebir aynı), title, date (YYYY-AA-GG), summary
// Not: tools/update-rss.js bu dosyayı Node'da değerlendirir — düz
// `const POSTS = [...]` biçimini koru (export/IIFE/window ekleme).
const POSTS = [
];
