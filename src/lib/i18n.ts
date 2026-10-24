import type { Lang } from './blog';

// Only the blog is bilingual; the rest of the site stays English.
export const ui = {
    en: {
        htmlLang: 'en',
        blogDescription: 'Notes on projects, tools, and tinkering',
        rssDescription: 'Notes on projects, tools, and tinkering by Icarus Murqin',
        noPosts: 'No posts yet.',
        allPosts: '← all posts',
        copyMd: 'copy md',
        copied: 'copied!',
        copyFailed: 'failed',
        switchLabel: 'Language',
        aiNote: 'Written with AI assistance from my voice notes, and translated with AI.',
    },
    tr: {
        htmlLang: 'tr',
        blogDescription: 'Projeler, araçlar ve kurcalamalar üzerine notlar',
        rssDescription: 'Icarus Murqin’den projeler, araçlar ve kurcalamalar üzerine notlar',
        noPosts: 'Henüz yazı yok.',
        allPosts: '← tüm yazılar',
        copyMd: 'md kopyala',
        copied: 'kopyalandı!',
        copyFailed: 'hata',
        switchLabel: 'Dil',
        aiNote: 'Bu yazı sesli notlarımdan yapay zekâ desteğiyle düzenlenerek yazıldı; çevirisi de yapay zekâ ile yapıldı.',
    },
} satisfies Record<Lang, Record<string, string>>;
