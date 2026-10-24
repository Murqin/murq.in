import type { ListItem } from './listItem';

// The /colophon page (slashpages.net): how the site is made and under which licences. It took over
// the licence and source links from the footer.
export const COLOPHON = {
    updated: new Date('2026-10-25'),
    items: [
        {
            label: { en: 'Built with', tr: 'Yapım' },
            text: {
                en: 'Astro, built to static files and served by a small Node server with no dependencies, on my own server.',
                tr: 'Astro ile statik dosyalara derleniyor; bağımlılığı olmayan küçük bir Node sunucusu kendi sunucumda yayınlıyor.',
            },
            links: [{ label: { en: 'source code', tr: 'kaynak kod' }, href: 'https://github.com/murqin/murq.in' }],
        },
        {
            label: { en: 'Written with', tr: 'Yazım' },
            text: {
                en: 'AI coding agents write most of the code; the posts start as my voice notes.',
                tr: 'Kodun çoğunu yapay zekâ kod ajanları yazıyor; yazılar sesli notlarımdan başlıyor.',
            },
            links: [{ label: { en: 'how I use AI', tr: 'yapay zekâyı nasıl kullanıyorum' }, href: 'ai' }],
        },
        {
            label: { en: 'Type', tr: 'Yazı tipi' },
            text: { en: 'IBM Plex Sans and IBM Plex Mono.', tr: 'IBM Plex Sans ve IBM Plex Mono.' },
        },
        {
            label: { en: 'Sky', tr: 'Gökyüzü' },
            text: {
                en: 'Every visit draws a sky from a 12-character seed. The dice draws a new one, the star copies its link, and the seed stays in the address as you browse.',
                tr: 'Her ziyaret 12 karakterlik bir seed’den bir gökyüzü çiziyor. Zar yenisini çiziyor, yıldız bağlantısını kopyalıyor; gezinirken seed adreste kalıyor.',
            },
        },
        {
            label: { en: 'Licences', tr: 'Lisanslar' },
            text: {
                en: 'Code under MIT, posts under CC0 (public domain). Fonts and images keep their own licences.',
                tr: 'Kod MIT, yazılar CC0 (kamu malı). Yazı tipleri ve görseller kendi lisanslarıyla.',
            },
            links: [
                { label: { en: 'MIT', tr: 'MIT' }, href: 'https://github.com/murqin/murq.in/blob/main/LICENSE' },
                { label: { en: 'CC0', tr: 'CC0' }, href: 'https://creativecommons.org/publicdomain/zero/1.0/' },
                {
                    label: { en: 'third-party notices', tr: 'üçüncü taraf bildirimleri' },
                    href: 'https://github.com/murqin/murq.in/blob/main/LICENSES.md',
                },
            ],
        },
    ] satisfies ListItem[],
};
