import type { Lang } from '../lib/blog';

interface MuseumEntry {
    id: string;
    date: string;
    commit: string;
    title: Record<Lang, string>;
    description: Record<Lang, string>;
}

// Dates identify the captured revision, rather than claiming when each design first appeared.
export const MUSEUM: MuseumEntry[] = [
    {
        id: 'feel-nothing',
        date: '2025-06-23',
        commit: 'a0c6f666b1e57791904f2bdd213328da5684c42d',
        title: { en: 'Feel Nothing', tr: 'Feel Nothing' },
        description: {
            en: 'A centred bio, two blurred colours, an Instagram link, and a language switch. The tab said “For Nothing”; the page still said “Feel Nothing”.',
            tr: 'Ortada kısa bir biyografi, iki bulanık renk, Instagram bağlantısı ve dil seçici. Sekmede “For Nothing”, sayfada hâlâ “Feel Nothing” yazıyordu.',
        },
    },
    {
        id: 'back-to-2005',
        date: '2025-10-07',
        commit: '18508947ceff7e0f53bb3a14f56ceb064732dfb6',
        title: { en: 'Back to 2005', tr: '2005’e dönüş' },
        description: {
            en: 'A light blue background, small Verdana text, and a boxed layout. A detour into the older web.',
            tr: 'Açık mavi arka plan, küçük Verdana yazılar ve kutulu bir düzen. Eski web’e kısa bir dönüş.',
        },
    },
    {
        id: 'monospace-cards',
        date: '2025-11-10',
        commit: '57bd41faab54a503bce182616e91be5075f9cbdb',
        title: { en: 'Monospace and cards', tr: 'Monospace ve kartlar' },
        description: {
            en: 'JetBrains Mono, an avatar, and separate cards for the about and contact sections.',
            tr: 'JetBrains Mono, bir avatar, hakkımda ve iletişim için ayrı kartlar.',
        },
    },
    {
        id: 'blue',
        date: '2026-05-20',
        commit: '82b8f0b72b8071a9060c1692de189f71120bf893',
        title: { en: 'Rounded cards', tr: 'Yuvarlak kartlar' },
        description: {
            en: 'Dark cards, social links, and a source code section. Just before the seeded backgrounds arrived.',
            tr: 'Koyu kartlar, sosyal bağlantılar ve kaynak kod bölümü. Seed’li arka planlardan hemen önce.',
        },
    },
    {
        id: 'seeded-sky',
        date: '2026-07-29',
        commit: '2d9bde13b7262f5477389f1c1785640273291ae7',
        title: { en: 'A sky with an address', tr: 'Adresi olan bir gökyüzü' },
        description: {
            en: 'Seed links, stars, glass cards, projects, and a blog. This design stayed around for a while after the move to Astro, too.',
            tr: 'Seed bağlantıları, yıldızlar, cam kartlar, projeler ve blog. Bu tasarımı Astro’ya geçtikten sonra da bir süre kullandım.',
        },
    },
];
