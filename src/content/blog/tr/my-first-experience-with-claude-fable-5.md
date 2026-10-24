---
title: Claude Fable 5 ile ilk deneyimim
date: 2026-07-03
summary: Fable 5 ile yaşadığım deneyim.
---

## Önce küçük bir açıklama

Tarihler konusunda baştan dürüst olayım: Fable 5'i gerçek çıkış gününde (9 Haziran) deneyenlerden değildim. Bana erişim aslında 1–2 Temmuz civarında açıldı. Sonradan anlaşıldı ki bu da bir tür "ilk gün"dü: Fable 5, ABD'nin bir ihracat kontrolü direktifi yüzünden 12 Haziran'da dünya genelinde herkes için erişime kapatılmış, kontroller kaldırıldıktan sonra da ancak 1 Temmuz'da yeniden açılmıştı. Yani birkaç şanslının girebildiği bir dönemi kaçırmış değilim; arada geçen üç hafta kadar, seçilmiş küçük bir grup dışında kimse kullanamadı. Ben de tam herkese yeniden açıldığında atladım.

## Onunla yaptığım projeler

* **3D Sanat Müzesi** — Vite + Three.js + React ile yapılmış, kamu malı (public domain) sanat eserlerini dönemlere göre sergileyen bir müze. (Fikri bir YouTube videosundan aldım.)
* **Şu an okuduğunuz blog**, kendi sitemde.

## Proje proje deneyimim

### **3D Sanat Müzesi**:

Fikir, Fable 5 videoları izlerken YouTube'un önüme düşürdüğü bir videodan geldi. Modeli bizzat denemek için kendim yapmak istedim. Önce şunu belirteyim: Normalde [superpowers](https://github.com/obra/superpowers) kullanıyorum ama bu projede kapattım. Düşüncem şuydu: Modele skill enjekte eden bu tür araçlar onu biraz kısıtlıyor gibi geliyor, o yüzden bu projeye onsuz girdim. Yanılıyor olabilirim ama onsuz belirgin şekilde kötü bir sonuç da almadım.

Karşılaştığım tek gerçek sorun şuydu: Fable ve Opus'u karşılaştırmak için yan yana çalıştırdım ve daha yarıya gelmeden kotam bitti. 3–4 saat sonra Fable'ı tek başına çalıştırarak işi çözdüm. Kotayı yine hızlı yedi ama en azından projeyi bitirebildim.

### **Murq.in blog bölümü**:

Blog bölümü üzerinde bir iki gündür çalışıyordum, son hâlini bugün aldı. İtiraf edeyim, buna da epey Claude kotası gitti. Zamanın çoğu iş yapmaktan çok kotanın dolmasını beklemekle geçti. Her şeyi elle yazan, eski anlamıyla "gerçek" bir geliştirici değilim; bu yüzden bugünlerde düpedüz vibe coding yapıyorum. Model olmadan kod yazma lüksüm yok. Biraz programlama bilsem de tek başıma bir "hello world"ün ya da basit bir hesap makinesinin pek ötesine geçemem.

Açıklamaya değer bir şey daha var: Bu site ve blog için neden standart bir web framework'ü kullanmadım? Mesele aslında insanların sistemlerini yormak istememem değil. Hatta vibe coding ile üretilen kod sistemleri muhtemelen normalden *daha fazla* yorar. Daha çok, bu iş için framework'ün fazla geleceğini düşündüm, o yüzden düz HTML/CSS/JS ile gittim. Bir de böylesi biraz daha benim işim gibi geliyor. Gerçi yapay zekânın yazdığı bir kod ne kadar "benim" olabilir, ondan da emin değilim.

## Modelle genel deneyimim

Bu modellerle profesyonel bir geliştirici kadar yoğun çalışmıyorum. Ama daha önce kullandıklarımla karşılaştırınca bunda çok daha az düzeltme yapmam gerekti. Az yönlendirmeyle daha karmaşık işleri çıkarabildiğini 3D Sanat Müzesi'nde açıkça gördüm.

Şunu da söyleyeyim: Önce [Anthropic'in dokümantasyonunu](https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/prompting-claude-fable-5) Opus 4.8'e verip bana ayrıntılı bir ana prompt hazırlatmıştım. Ama bunu hesaba katsak bile proje bir iki rötuştan sonra neredeyse yayına hazırdı. Kod kalitesinin tartışılır olduğunun farkındayım. Ama yazılıma bakışım şu: İşini görüyor ve sorunu çözüyorsa benim için yeterince iyi. Arkamda bir yerlerde muhtemelen uçurum gibi bir teknik borç duruyordur. :D

## Bu yazının hazırlanışı üzerine bir not

Şeffaflık adına: Bu yazının İngilizce sürümü, Türkçe ilk taslağımdan yola çıkılarak Claude Sonnet 5 tarafından İngilizceye çevrildi ve okunabilirlik için hafifçe düzenlendi. Yeni bir iddia ya da içerik eklenmedi; düzenlemeler ifade, yapı ve çeviriyle sınırlı kaldı. Okuduğunuz bu Türkçe sürüm ise o İngilizce metinden yapay zekâ ile yeniden Türkçeye çevrildi.
