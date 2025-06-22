// i18next'i başlatma ve yapılandırma fonksiyonu
async function initializeI18n() {
    await i18next
        .use(i18nextHttpBackend) // Dil dosyalarını sunucudan çekme eklentisini kullan
        .init({
            lng: localStorage.getItem('language') || 'tr', // Başlangıç dili (hafızadan al veya tr yap)
            fallbackLng: 'en', // Eğer bir çeviri bulunamazsa İngilizce'yi kullan
            debug: true, // Geliştirme aşamasında konsolda bilgi görmek için
            backend: {
                loadPath: 'lang/{{lng}}.json' // Dil dosyalarının yolunu belirtir
            }
        });
    
    // Sayfa içeriğini ilk yüklemede güncelle
    updateContent();

    // Dil değiştiğinde içeriği tekrar güncellemek için olay dinleyicisi
    i18next.on('languageChanged', () => {
        updateContent();
    });
}

// Sayfadaki metinleri i18next ile güncelleme fonksiyonu
function updateContent() {
    document.querySelectorAll('[data-key]').forEach(element => {
        const key = element.getAttribute('data-key');
        element.textContent = i18next.t(key);
    });

    // Aktif buton stilini ayarla
    const currentLang = i18next.language;
    const activeLangButton = document.querySelector('.lang-switcher .active');
    if (activeLangButton) {
        activeLangButton.classList.remove('active');
    }
    const newActiveButton = document.querySelector(`.lang-switcher [data-lang="${currentLang}"]`);
    if (newActiveButton) {
        newActiveButton.classList.add('active');
    }
}

// Dil değiştirme butonlarının olay dinleyicileri
document.querySelectorAll('.lang-switcher button').forEach(button => {
    button.addEventListener('click', (event) => {
        const lang = event.target.dataset.lang;
        i18next.changeLanguage(lang, (err, t) => {
            if (err) return console.error('Dil değiştirilirken hata oluştu', err);
            localStorage.setItem('language', lang); // Tercihi hafızaya kaydet
            document.documentElement.lang = lang; // Sayfanın ana dilini güncelle
        });
    });
});

// Sayfa ilk yüklendiğinde çalışacak kodlar
document.addEventListener('DOMContentLoaded', () => {
    // Yılı dinamik olarak ayarla (bu çeviriden bağımsız)
    const yearSpan = document.getElementById('yil');
    if (yearSpan) {
        yearSpan.textContent = " " + new Date().getFullYear();
    }
    
    // i18next'i başlat
    initializeI18n();
});


// ==========================================================
// Açılır Menü Kontrolleri (Değişiklik yok, aynı kalıyor)
// ==========================================================
const menuToggle = document.querySelector('.menu-toggle');
const menuClose = document.querySelector('.menu-close');
const overlayMenu = document.querySelector('.overlay-menu');

if (menuToggle && menuClose && overlayMenu) {
    menuToggle.addEventListener('click', () => {
        overlayMenu.classList.add('is-open');
    });

    menuClose.addEventListener('click', () => {
        overlayMenu.classList.remove('is-open');
    });

    window.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && overlayMenu.classList.contains('is-open')) {
            overlayMenu.classList.remove('is-open');
        }
    });
}