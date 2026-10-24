---
title: Claude Fable 5 ile ilk deneyimim
date: 2026-07-03
summary: Fable 5 ile yaşadığım deneyim.
---

## Önce küçük bir açıklama

Zaman çizelgesi konusunda baştan dürüst olayım: Fable 5'i gerçek çıkış gününde (9 Haziran) deneyenlerden değildim. Benim erişimim aslında 1–2 Temmuz civarında geldi. Sonradan anlaşıldı ki bu da bir tür "ilk gün"dü: Fable 5, ABD'nin bir ihracat kontrolü direktifi yüzünden 12 Haziran'da dünya genelinde herkes için erişime kapatılmış, kontroller kaldırıldıktan sonra da ancak 1 Temmuz'da yeniden açılmıştı. Yani şanslı birkaç kişinin girebildiği erken bir dönemi kaçırmış değilim; arada geçen yaklaşık üç hafta boyunca, küçük ve özenle seçilmiş bir grup dışında kimse onu hiç kullanamadı. Ben de tam herkese yeniden açıldığı sırada atlamış oldum.

## Onunla yaptığım projeler

* **3D Sanat Müzesi** — Vite + Three.js + React ile yapılmış, kamu malı (public domain) sanat eserlerini dönemlere göre sergileyen bir müze. (Fikri bir YouTube videosundan aldım.)
* **Şu an okuduğun blog**, kendi sitemde.

## Proje proje deneyimim

### **3D Sanat Müzesi**:

Bu proje fikri, Fable 5 içerikleri izlerken YouTube algoritmamın önüme düşürdüğü bir videodan geldi. Modelle kendi elimle edindiğim deneyimlerden biri olsun diye kendim yapmak istedim. Önce şunu belirteyim: Normalde [superpowers](https://github.com/obra/superpowers) kullanıyorum ama bu projede kapattım. Düşüncem şuydu: Bu tür skill enjekte eden araçlar modeli biraz kısıtlama eğiliminde, o yüzden bu projeye onsuz girdim. Bu konuda yanılıyor olabilirim, ama onsuz da gözle görülür biçimde daha kötü sonuç almadım.

Karşılaştığım tek gerçek sorun şuydu: Fable ve Opus'u karşılaştırmak için yan yana çalıştırdım ve daha yarıya gelmeden kotam bitti. Sonunda 3–4 saat sonra Fable'ı tek başına çalıştırarak çözdüm. Kotayı yine hızlı yedi ama en azından projeyi sonuna kadar götürebildim.

### **Murq.in blog bölümü**:

Bu blog bölümü üzerinde aslında bir iki gündür çalışıyordum, son hâlini de bugün aldı. Kabul etmeliyim ki bunda da epey Claude kotası harcadım. Açıkçası zamanın çoğu gerçek işten çok kotanın yenilenmesini beklemekle geçti. Her şeyi elle yazan, eski anlamıyla "gerçek" bir geliştirici değilim; bu yüzden bugünlerde düpedüz vibe coding yapıyorum. Model olmadan kod yazma lüksüm yok. Biraz programlama bilsem de kendi başıma bir "hello world"ün ya da basit bir hesap makinesinin pek ötesine geçemem.

Açıklamaya değer bir şey daha var: Bu site ve blog için neden standart bir web framework'ü kullanmadım? Mesele aslında insanların sistemlerini yormak istememem değil. Hatta vibe coding ile üretilen kod sistemleri muhtemelen normalden *daha fazla* yorar. Daha çok, bu iş için bir framework'ün aşırı mühendislik olacağını hissettim, o yüzden vanilla gittim. Bir de böylesi biraz daha benim imzamı taşıyormuş gibi geliyor. Gerçi sitenin gerçekten benim imzamı taşıyıp taşımadığından, ya da yapay zekânın ürettiği bir kodun ne kadar "benim" olabileceğinden açıkçası emin değilim.

## Modelle genel deneyimim

Bu modellerle profesyonel bir geliştiricinin çalıştığı kadar yakından bile çalışan biri değilim. Ama bu modeli kullanım geçmişimdeki diğerleriyle karşılaştırınca, bununla çok daha az düzeltme yapmam gerekti. Az yönlendirmeyle daha karmaşık işlerin üstesinden gelebildiğini 3D Sanat Müzesi projesinde açıkça gördüm.

Hakkını vermek gerekirse: Önce [Anthropic'in dokümantasyonunu](https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/prompting-claude-fable-5) Opus 4.8'e verip bana ayrıntılı bir ana prompt hazırlatmıştım. Yine de proje, bir iki cila turundan sonra neredeyse yayına hazır gibiydi. Kod kalitesinin kendisinin tartışmaya açık olduğunun farkındayım. Ama yazılıma bakışım şu: İşini görüyor ve sorunu çözüyorsa benim için yeterince iyi. Arkamda bir yerlerde muhtemelen uçurum gibi bir teknik borç duruyordur. :D

## Bu yazının hazırlanışı üzerine bir not

Şeffaflık adına: Bu yazının İngilizce sürümü, Türkçe ilk taslağımdan yola çıkılarak Claude Sonnet 5 tarafından İngilizceye çevrildi ve okunabilirlik için hafifçe düzenlendi. Yeni bir iddia ya da içerik eklenmedi; düzenlemeler ifade, yapı ve çeviriyle sınırlı kaldı. Okuduğun bu Türkçe sürüm ise o İngilizce metinden yapay zekâ ile yeniden Türkçeye çevrildi.
