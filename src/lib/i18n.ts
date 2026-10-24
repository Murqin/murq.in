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
        // Prepended to the copied markdown (not to /posts/*.md): people paste the post into
        // an LLM, so the copy already carries a faithful summarising instruction.
        summaryPrompt:
            'Below is a blog post from murq.in by Icarus Murqin, written with AI assistance from voice notes. ' +
            'Summarise it for me: start with a two-sentence overview, then list the main points, and end with ' +
            'what the author concludes or recommends. Use only what is in the post; do not add outside information. ' +
            'Reply in the language I write to you in.',
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
        summaryPrompt:
            'Aşağıda murq.in’den, Icarus Murqin’in sesli notlarından yapay zekâ desteğiyle yazılmış bir blog yazısı var. ' +
            'Bunu benim için özetle: iki cümlelik bir genel bakışla başla, sonra ana noktaları listele ve yazarın vardığı ' +
            'sonuç ya da önerisiyle bitir. Yalnızca yazıda olanı kullan, dışarıdan bilgi ekleme. ' +
            'Sana hangi dilde yazıyorsam o dilde cevap ver.',
    },
} satisfies Record<Lang, Record<string, string>>;
