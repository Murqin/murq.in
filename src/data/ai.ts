import type { ListItem } from './listItem';

// The /ai page (slashpages.net): how AI is used on this site. The per-post badge links here, so the
// badge can stay one line. Bump `updated` when the tools or the way I work change.
export const AI = {
    updated: new Date('2026-10-24'),
    items: [
        {
            label: { en: 'Code', tr: 'Kod' },
            text: {
                en: 'This site’s code is written almost entirely by AI coding agents. I decide what gets built, try it out and say what is wrong; the agent writes the code.',
                tr: 'Bu sitenin kodunu neredeyse tamamen yapay zekâ kod ajanları yazıyor. Neyin yapılacağına ben karar veriyorum, deniyorum ve neyin yanlış olduğunu söylüyorum; kodu ajan yazıyor.',
            },
        },
        {
            label: { en: 'Posts', tr: 'Yazılar' },
            text: {
                en: 'Posts start as my voice notes. AI turns them into readable text. The ideas, experiences and opinions are mine.',
                tr: 'Yazılar sesli notlarım olarak başlıyor. Yapay zekâ onları okunur bir metne çeviriyor. Fikirler, deneyimler ve görüşler benim.',
            },
        },
        {
            label: { en: 'Translation', tr: 'Çeviri' },
            text: {
                en: 'Every post is published in English and Turkish, and the translation is done by AI.',
                tr: 'Her yazı İngilizce ve Türkçe yayımlanıyor; çevirisini yapay zekâ yapıyor.',
            },
        },
        {
            label: { en: 'Tools', tr: 'Araçlar' },
            text: {
                en: 'Claude Code with Opus 5.5 for most things and Codex now and then. For images, ChatGPT in the cloud and ComfyUI with local models.',
                tr: 'İşlerin çoğunda Claude Code ve Opus 5.5, ara sıra Codex. Görsel için bulutta ChatGPT, yerel modellerle ComfyUI.',
            },
        },
    ] satisfies ListItem[],
};
