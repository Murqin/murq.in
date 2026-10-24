---
title: "Fedora'ya geçiş notları: anti-cheat çözümleri, sürücüler ve yapay zekâ kullanımım"
date: 2026-07-29
summary: Fedora'ya geçiş deneyimim, Secure Boot kaynaklı anti-cheat sorunlarını çözmem ve yapay zekâya pragmatik bakışım.
---

Bir süredir günlük işlerimde Linux kullanıyorum. İşletim sistemlerini yalnızca bir araç olarak görüyorum: gündelik işleri halletmemizi, bir şeyler üretmemizi ya da oyun oynamamızı sağlayan araçlar. Microsoft'un geliştirdiği bir sistem de olsa, açık kaynak topluluklarının yaptığı bir sistem de olsa, o an işimi uğraştırmadan görüyorsa onu kullanırım.

Açıkçası Linux'un bayraktarlığını yapan biri değilim. Her işletim sisteminin iyi olduğu bir alan var, ben de tamamen ihtiyacıma göre seçiyorum:

- **Windows:** Çevrim içi çok oyunculu oyunlar (PUBG, CS FACEIT, League of Legends gibi) ve bunların çekirdek seviyesindeki anti-cheat yazılımları Windows'ta zaten sorunsuz çalışıyor. Bu yüzden Windows'u özellikle bu oyunlar için dual-boot'ta ikinci sistem olarak tutuyorum.
    
- **Linux:** Az yer kaplaması ve düşük bellek tüketimi sayesinde yazılım geliştirme, tek oyunculu oyunlar ve sunucu kurulumları için birinci tercihim.
    

## CachyOS'tan Fedora'ya: zorunlu geçiş ve sürücü kurulumu

Uzun süre ana dağıtımım CachyOS'tu ve ona epey alışmıştım. Ama anti-cheat sistemlerinin son dönemde getirdiği kısıtlamalar yüzünden Fedora'ya geçmek zorunda kaldım. Çekirdek seviyesindeki anti-cheat yazılımları anakart modüllerini ve TPM verilerini kontrol ediyor; en ufak uyumsuzlukta oyuna giremiyorsunuz.

FACEIT'e girmeye çalışırken bir Secure Boot doğrulama (attestation) hatasıyla karşılaştım. CachyOS'ta imzalı önyüklemeyi de Shim'i de denedim, sorun çözülmedi. Fedora ise Microsoft imzalı Shim önyükleyicisini kullandığı için açılışta donanım seviyesindeki doğrulamadan sorunsuzca geçebiliyor.

Fedora'ya geçince de Secure Boot yüzünden ciddi sürücü ve imza sorunları çıktı:

- **Secure Boot ve Nvidia:** BIOS'um "Maximum Security" modunda olduğu için sistem varsayılan anahtarları reddediyordu. Yapay zekâyla araştırırken kendi anahtar dosyamı oluşturup doğrudan anakartın UEFI `db`'sine (Signature Database) kaydetmeyi öğrendim. Bu sayede Secure Boot, Nvidia'nın kapalı kaynak sürücüsünün imzasını kabul etti.
    
- **SELinux ve masaüstü donmaları:** `/home` dizinimi olduğu gibi CachyOS'tan taşıdım. Ama Fedora'nın SELinux güvenlik modülü dosyalara güvenlik bağlamı etiketleri koyuyor. Taşınan yapılandırma dosyalarında bu etiketler olmadığı için erişim engellendi; KDE kullanıcı ayarlarını yükleyemedi ve karşıma siyah ekran çıktı. Yapay zekânın tarifiyle TTY'ye geçip etiketleri Fedora'nın varsayılanlarına döndürmek için `restorecon` çalıştırdım, sorun çözüldü.
    

Bütün bunları çözmek yarım günden fazla sürdü. Yapay zekâ olmasa forumlarda günlerce dolaşırdım; anında gelen önerilerle sistemi kısa sürede tamamen ayağa kaldırdım.

## Arch (AUR) ve Fedora (COPR ve Flatpak)

Dağıtım değişince paket kurma alışkanlıklarım da değişti:

- **AUR (Arch User Repository):** AUR, kurulumdan önce `PKGBUILD` dosyasını terminalde hızlıca incelemenize izin veriyor. Kaynak kodun nereden geldiğini, hangi işlemleri yaptığını ve zararlı bir komut içerip içermediğini gözden geçirebiliyorsunuz (gerekirse analiz için yapay zekâdan yardım alarak). Kodun tamamını okumasanız bile kurarken derleme tarifine bakabilmek işi epey şeffaf yapıyor, kontrol sizde kalıyor.
    
- **COPR (Fedora):** COPR da benzer bir topluluk modelini izliyor, ama paketler sunucu tarafında `.spec` dosyalarıyla derleniyor ve önceden derlenmiş ikili `.rpm` paketleri olarak dağıtılıyor. Derleme tarifleri web sitesinden kontrol edilebilse de `dnf` ile kurarken AUR'daki gibi o an tarife bakma adımı yok; kontrol sizdeymiş gibi hissettirmiyor.
    

COPR, AUR kadar kapsamlı olmadığı ve kurulum öncesi inceleme imkânı sunmadığı için bazı uygulamalarda (Zen Browser gibi) Flatpak'e yöneldim. Ama Flatpak'in de kendine göre dertleri var:

- **Entegrasyon sorunları:** Flatpak uygulamaları izole çalıştığı için sistem temasına her zaman uymuyor. KDE'de bir Mac teması kullanmama rağmen bazı uygulamalar standart GTK/Qt kenarlıklarına dönüyor.
    
- **İzin kısıtlamaları:** Paket bakımcıları varsayılan izinleri tam doğru yapılandırmazsa dosya erişim sorunları çıkabiliyor.
    

## Yazılımda ve gündelik hayatta yapay zekânın rolü

Yapay zekâ kafamdaki yükü epey hafifletiyor. Ayrıntıları ya da karmaşık sistem ayarlarını ona bırakınca asıl meseleye odaklanabiliyorum.

- **Yazılım geliştirme:** Bir projeye başlarken mimariyi ve hangi teknolojileri kullanacağımı yapay zekâya danışıyorum. Bazen de deneme yanılmayla adım adım ilerlemek için bir kod ajanı kullanıyorum.
    
- **Gündelik hayat:** Teknoloji dışında da kullanıyorum. Geçenlerde beni bir böcek fena ısırdı; ne olabileceğini yapay zekâyla daralttım, büyük ihtimalle tatarcıkmış.
    

Bazı insanların yapay zekâya neden şüpheyle yaklaştığını anlıyorum. Kaygıların çoğu teknolojinin kendisinden değil, şirketlerin veri toplama politikalarından ve ideolojik duruşlardan geliyor.

## Hobiler ve müzik aletleri

Zamanında elle yapılan birkaç hobiyi denedim:

- **Çizim:** Görsel sanatla denemeler yapmak için bir grafik tablet aldım.
    
- **Piyano:** Bir MIDI klavye aldım. Piyanoya başlamak kolaymış; bir iki saat çalışınca basit ritimler ve melodiler çalabiliyorsunuz. Ama tuş sayısı yetmediği için sonunda sattım.
    
- **Gitar ve mızıka:** Telli ve üflemeli çalgılarda temiz bir ses çıkarmak için bile her gün düzenli çalışmak gerekiyor. Ibanez gitarımı bir arkadaşım almak istiyor, o hazır olunca satmayı düşünüyorum.
    

## Kariyer, teknoloji sektörü ve GitHub profilleri

Gerçekçi olalım, iş bulup para kazanmak lazım. Yazılım geliştirme alanında çalışmaya açık olsam da kendimi bir "uzman" olarak görmüyorum; projelerimi hobi seviyesinde yapıyorum.

Bir şirkette uzman olduğunuzu söyleyip sonra bir kod tabanını başka dile taşırken büyük hatalar yaparsanız hem rezil olursunuz hem de işinizden. Bu yüzden kendimi olduğumdan iyi göstermiyorum.

GitHub'da pek çok hobi geliştiricisinin son derece cilalı, profesyonel profilleri var. Benimki daha pragmatik: Commit mesajlarını çoğu zaman yapay zekâya yazdırıyorum, vitrinden çok işe yarayan bir şey çıkarmayı önemsiyorum.

## Sonuç

Düşüncelerimi ve teknik adımları yaklaşık 20 dakikalık bir ses kaydında anlattım; bunu okunur bir yazıya dönüştürmek için de yapay zekâyı kullandım. İşletim sisteminde de, yazılımda da, gündelik işlerde de derdim seçkincilik değil fayda: elimdeki araçlarla pratik sonuca en kısa yoldan ulaşmak.
