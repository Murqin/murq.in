import type { Lang } from '../lib/blog';

export type ProjectStatus = 'active' | 'wip' | 'archived';

export interface ProjectLink {
    label: string;
    url: string;
}

export interface Project {
    name: string;
    /** One per language, so a missing translation fails type-checking instead of showing English. */
    description: Record<Lang, string>;
    tags: string[];
    /** Rendered in order, left to right. */
    links: ProjectLink[];
    status: ProjectStatus;
}

// Project data — adding a record here is all it takes to add a project.
// Rendered at build time by Projects.astro, so there is no longer a hand-kept
// <noscript> copy to drift out of sync.
export const PROJECTS: Project[] = [
    {
        name: 'murq.in',
        description: {
            en:
                'A minimalist personal website with a seed-driven PRNG theme engine ' +
                'and a dynamic star field. Statically built and self-hosted.',
            tr:
                'Seed tabanlı PRNG tema motoru ve dinamik yıldız alanı olan minimalist bir kişisel site. ' +
                'Statik olarak derleniyor ve kendi sunucumda barınıyor.',
        },
        tags: ['Astro', 'TypeScript'],
        links: [{ label: 'GitHub', url: 'https://github.com/murqin/murq.in' }],
        status: 'active',
    },
    {
        name: 'No Crop Trample',
        description: {
            en: 'A Minecraft mod that stops players and mobs from trampling farmland crops.',
            tr: 'Oyuncuların ve yaratıkların tarladaki ekinleri ezmesini engelleyen bir Minecraft modu.',
        },
        tags: ['Java', 'Fabric/Forge/NeoForge'],
        links: [
            { label: 'Modrinth', url: 'https://modrinth.com/mod/nocroptrample' },
            { label: 'CurseForge', url: 'https://www.curseforge.com/minecraft/mc-mods/no-crop-trample' },
            { label: 'GitHub', url: 'https://github.com/Murqin/NoCropTrample' },
        ],
        status: 'active',
    },
    {
        name: 'Scribo',
        description: {
            en:
                'A Telegram bot in Go that transcribes and summarizes voice notes, audio ' +
                'and video with Google Gemini. Runs in under 10 MB of RAM as a 15 MB container.',
            tr:
                'Sesli notları, ses ve video dosyalarını Google Gemini ile yazıya döküp özetleyen, Go ile ' +
                'yazılmış bir Telegram botu. 15 MB’lık bir konteyner olarak 10 MB’tan az RAM ile çalışıyor.',
        },
        tags: ['Go', 'Docker'],
        links: [{ label: 'GitHub', url: 'https://github.com/Murqin/Scribo' }],
        status: 'archived',
    },
];
