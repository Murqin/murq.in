import type { Lang } from '../lib/blog';

export interface NowItem {
    label: Record<Lang, string>;
    text: Record<Lang, string>;
}

// The /now page (nownownow.com): what I am doing this month. Edit the items and bump `updated`;
// both language versions are built from this one list so they cannot drift apart.
export const NOW = {
    updated: new Date('2026-10-24'),
    items: [
        {
            label: { en: 'Building', tr: 'Yapıyorum' },
            text: {
                en: 'Made this site bilingual. The blog is written from my voice notes.',
                tr: 'Bu siteyi iki dilli hâle getirdim. Blog yazılarını sesli notlarımdan yazıyorum.',
            },
        },
        {
            label: { en: 'Trying', tr: 'Deniyorum' },
            text: {
                en: 'Generating images with AI: reference images, ComfyUI, and prompts written by Claude.',
                tr: 'Yapay zekâyla görsel üretmek: referans görseller, ComfyUI ve Claude’a yazdırdığım prompt’lar.',
            },
        },
        {
            label: { en: 'Using', tr: 'Kullanıyorum' },
            text: {
                en: 'Claude Code with Opus 5.5 for most things, on Fedora.',
                tr: 'İşlerimin çoğunda Claude Code ve Opus 5.5; sistem Fedora.',
            },
        },
        {
            label: { en: 'Listening to', tr: 'Dinliyorum' },
            text: { en: 'Voz’mi Moe Serdtse', tr: 'Voz’mi Moe Serdtse' },
        },
    ] satisfies NowItem[],
};
