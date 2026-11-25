import type { ListItem } from './listItem';

// The /now page (nownownow.com): what I am doing this month. Edit the items and bump `updated`;
// both language versions are built from this one list so they cannot drift apart.
export const NOW = {
    updated: new Date('2026-11-25'),
    items: [
        {
            label: { en: 'Building', tr: 'Yapıyorum' },
            text: {
                en: 'Korkuluk, a personal AFK client in Rust. It runs on a frozen copy of Azalea that we patch as needed, and the code is written by agents.',
                tr: 'Korkuluk: kendim için Rust’la yazılan bir AFK client. Azalea’nın sabitlenmiş bir kopyası üzerinde çalışıyor, gerektikçe yamalıyoruz; kodu ajanlar yazıyor.',
            },
        },
        {
            label: { en: 'Changed', tr: 'Yeniledim' },
            text: {
                en: 'How I work with agents. I use the CLI a lot less now.',
                tr: 'Ajanlarla çalışma şeklimi. Artık CLI’ı çok daha az kullanıyorum.',
            },
        },
        {
            label: { en: 'Preparing', tr: 'Hazırlıyorum' },
            text: {
                en: 'Mod projects: Korkuluk, Advancement Crates, Field Helper and a few more.',
                tr: 'Mod projeleri: Korkuluk, Advancement Crates, Field Helper ve birkaçı daha.',
            },
        },
        {
            label: { en: 'Using', tr: 'Kullanıyorum' },
            text: {
                en: 'T3 Code, with Antigravity, Claude Desktop or Claude Code depending on the job. Same foundation underneath anyway.',
                tr: 'T3 Code; işe göre Antigravity, Claude Desktop ya da Claude Code. Altta zaten aynı temel var.',
            },
            links: [{ label: { en: 'T3 Code', tr: 'T3 Code' }, href: 'https://github.com/pingdotgg/t3code' }],
        },
        {
            label: { en: 'Trying', tr: 'Deniyorum' },
            text: {
                en: 'To be at peace, and working in the service industry.',
                tr: 'Huzurlu olmayı ve hizmet sektöründe çalışmayı.',
            },
        },
        {
            label: { en: 'Listening to', tr: 'Dinliyorum' },
            text: {
                en: 'Animal I Have Become by Three Days Grace',
                tr: 'Three Days Grace, Animal I Have Become',
            },
        },
    ] satisfies ListItem[],
};
