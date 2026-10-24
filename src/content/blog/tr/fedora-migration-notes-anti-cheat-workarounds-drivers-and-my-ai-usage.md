---
title: "Fedora'ya geçiş notları: anti-cheat çözümleri, sürücüler ve yapay zekâ kullanımım"
date: 2026-07-29
summary: Fedora'ya geçiş deneyimim, Secure Boot kaynaklı anti-cheat sorunlarını çözmem ve yapay zekâya pragmatik bakışım.
---

Son zamanlarda günlük işlerim için Linux tabanlı dağıtımları, GNU/Linux sistemlerini kullanıyorum. İşletim sistemlerini yalnızca bir araç olarak görüyorum: gündelik işleri halletmemizi, bir şeyler üretmemizi ya da oyun oynamamızı sağlayan araçlar. Microsoft'un geliştirdiği bir sistem de olsa, açık kaynak topluluklarının yaptığı bir sistem de olsa, o anki ihtiyacımı kutudan çıktığı gibi karşılayanı tercih ederim.

Açıkçası bir "Linux haçlı seferi" yürütmüyorum. Farklı işletim sistemleri farklı alanlarda öne çıkıyor ve ben de tamamen ihtiyacıma göre seçiyorum:

- **Windows:** Çevrim içi çok oyunculu oyunlara (PUBG, CS FACEIT, League of Legends gibi) ve onların çekirdek seviyesindeki anti-cheat yazılımlarına ilk günden destek verdiği için çok işe yarıyor. Bu yüzden Windows'u, özellikle bu oyunlar için dual-boot düzeninde ikincil işletim sistemi olarak tutuyorum.
    
- **Linux:** Az yer kaplaması ve düşük bellek tüketimi sayesinde yazılım geliştirme, tek oyunculu oyunlar ve sunucu kurulumları için birinci tercihim.
    

## CachyOS'tan Fedora'ya: zorunlu geçiş ve sürücü kurulumu

Uzun süre ana dağıtımım CachyOS'tu ve ona epey bağlanmıştım. Ama anti-cheat sistemlerinin son dönemde getirdiği kısıtlamalar beni Fedora'ya geçmeye zorladı. Çekirdek seviyesindeki anti-cheat yazılımları anakart modüllerini ve TPM verilerini sorguladığı için, uyumsuz görülen en ufak şey oyuna erişimin engellenmesiyle sonuçlanıyor.

FACEIT'e girmeye çalışırken bir Secure Boot doğrulama (attestation) hatasıyla karşılaştım. CachyOS'ta imzalı önyükleme yapılandırmalarını ve Shim'i denesem de sorun çözülmedi. Fedora ise Microsoft imzalı Shim önyükleyicisini kullandığı için açılışta donanım seviyesindeki doğrulamadan sorunsuzca geçebiliyor.

Fedora'ya geçiş, Secure Boot altında ciddi sürücü ve imza sorunlarını da beraberinde getirdi:

- **Secure Boot ve Nvidia:** BIOS'um "Maximum Security" modunda olduğu için sistem varsayılan anahtarları reddediyordu. Yapay zekâ destekli araştırmayla kendi anahtar dosyamı oluşturup doğrudan anakartın UEFI `db`'sine (Signature Database) kaydetmeyi öğrendim. Bu sayede Secure Boot, Nvidia'nın kapalı kaynak sürücüsünün imzasını kabul etti.
    
- **SELinux ve masaüstü donmaları:** Geçiş sırasında `/home` dizinimi doğrudan CachyOS'tan taşıdım. Ancak Fedora'nın SELinux güvenlik modülü dosyalara belirli güvenlik bağlamı etiketleri uyguluyor. Taşınan yapılandırma dosyalarında bu etiketler olmadığı için erişim engellendi; KDE kullanıcı ayarlarını yükleyemedi ve karşıma siyah bir ekran çıktı. Yapay zekânın yönlendirmesiyle bir TTY terminaline geçtim ve güvenlik etiketlerini Fedora'nın varsayılanlarına döndürmek için `restorecon` çalıştırdım; sorun çözüldü.
    

Bu kurulum sorunlarını çözmek yarım günden fazla sürdü. Yapay zekâ olmasa forumlarda yolumu bulmak günler alabilirdi; anında gelen sorun giderme önerileri sistemi kısa sürede tamamen çalışır hâle getirdi.

## Arch (AUR) ve Fedora (COPR ve Flatpak)

Dağıtım değiştirmek, paket yönetimi alışkanlıklarımı da uyarlamamı gerektirdi:

- **AUR (Arch User Repository):** AUR, kurulumdan önce `PKGBUILD` dosyasını terminalde hızlıca incelemenize izin veriyor. Kaynak kodun nereden geldiğini, hangi işlemleri yaptığını ve zararlı bir komut içerip içermediğini gözden geçirebiliyorsunuz (gerekirse analiz için yapay zekâdan yardım alarak). Kodun tamamını incelemeseniz bile, kurulum anında derleme tarifine bakabilmek ciddi bir şeffaflık ve kontrol sağlıyor.
    
- **COPR (Fedora):** COPR da benzer bir topluluk modelini izliyor, ama paketler sunucu tarafında `.spec` dosyalarıyla derleniyor ve önceden derlenmiş ikili `.rpm` paketleri olarak dağıtılıyor. Derleme tarifleri web sitesinden kontrol edilebilse de `dnf` ile kurarken AUR'daki o anlık tarif inceleme adımı yok; bu da doğrudan kontrol hissini azaltıyor.
    

COPR, AUR kadar kapsamlı olmadığı ve kurulum öncesi inceleme imkânı sunmadığı için bazı uygulamalarda (Zen Browser gibi) Flatpak'e yöneldim. Ancak Flatpak'in de kendi ödünleşimleri var:

- **Entegrasyon sorunları:** İzole çalıştıkları için Flatpak uygulamaları sistem temalarına her zaman uymuyor. KDE'de bir Mac teması kullanmama rağmen bazı uygulamalar standart GTK/Qt kenarlıklarına dönüyor.
    
- **İzin kısıtlamaları:** Paket bakımcıları varsayılan izinleri tam doğru yapılandırmazsa dosya erişim sorunları çıkabiliyor.
    

## Yazılımda ve gündelik hayatta yapay zekânın rolü

Yapay zekâ kullanmak zihinsel yükümü ciddi ölçüde hafifletiyor. İkincil ayrıntıları ya da karmaşık sistem yapılandırmalarını yapay zekâya bırakmak, asıl kavramlara odaklanmamı sağlıyor.

- **Yazılım geliştirme:** Bir projeye başlarken mimari ve teknoloji yığını seçimlerinde yapay zekâya danışıyorum. Zaman zaman da deneme yanılmayla adım adım geliştirmek için bir kod ajanı kullanıyorum.
    
- **Gündelik hayat:** Teknoloji dışında da kullanıyorum. Geçenlerde saldırgan bir böcek tarafından ısırıldıktan sonra olasılıkları daraltmak için yapay zekâdan yararlandım ve büyük ihtimalle bir tatarcık ısırığı olduğu sonucuna vardım.
    

Bazı insanların yapay zekâya neden şüpheyle yaklaştığını anlıyorum. Kaygılar genellikle teknolojinin kendi faydasından değil, şirketlerin veri toplama politikalarından ve farklı ideolojik duruşlardan kaynaklanıyor.

## Hobiler ve müzik aletleri

Zaman içinde çeşitli uygulamalı hobileri denedim:

- **Çizim:** Görsel sanatla denemeler yapmak için bir grafik tablet aldım.
    
- **Piyano:** Bir MIDI klavye edindim. Piyano erişilebilir çıktı; bir iki saatlik çalışmayla temel ritimler ve melodiler çalınabiliyor. Ancak tuş sayısının fiziksel kısıtı yüzünden sonunda sattım.
    
- **Gitar ve mızıka:** Telli ve üflemeli çalgılar, sadece temiz bir ses çıkarabilmek için bile her gün düzenli teknik çalışma istiyor. Bir arkadaşım almaya hazır olduğunda Ibanez gitarımı satmayı düşünüyorum.
    

## Kariyer, teknoloji sektörü ve GitHub profilleri

Gerçekçi olmak gerekirse iş bulmak ve gelir elde etmek gerekli. Yazılım geliştirme alanında çalışmaya açık olsam da kendimi bir "uzman" olarak görmüyorum; projelerimi hobi seviyesinde yapıyorum.

Bir şirkette uzman olduğunu iddia edip ardından bir kod tabanını başka bir dile taşırken büyük hatalar yapmak hem mahcubiyete hem de işini kaybetmeye yol açar. Bu yüzden teknik yetkinliğimi olduğundan büyük göstermekten kaçınıyorum.

GitHub'da pek çok hobi geliştiricisinin son derece cilalı, profesyonel profilleri var. Benim profilim daha pragmatik bir yaklaşımı yansıtıyor: Commit mesajlarını sık sık yapay zekâya yazdırıyorum ve vitrine çıkarmaktan çok işe yarar bir çıktı üretmeyi önemsiyorum.

## Sonuç

Düşüncelerimi ve teknik adımları yaklaşık 20 dakika boyunca sesli olarak kaydettim; anlatıyı açık ve okunabilir bir yapıya oturtmak için de yapay zekâyı kullandım. İşletim sistemlerinde, yazılım geliştirmede ve gündelik işlerde amaç seçkincilik değil fayda olmaya devam ediyor: eldeki araçlardan yararlanarak pratik sonuçlara verimli biçimde ulaşmak.
