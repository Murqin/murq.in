export type ProjectStatus = 'active' | 'wip' | 'archived';

export interface ProjectLink {
    label: string;
    url: string;
}

export interface Project {
    name: string;
    description: string;
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
        description:
            'A minimalist personal website with a seed-driven PRNG theme engine ' +
            'and a dynamic star field. Statically built and self-hosted.',
        tags: ['Astro', 'TypeScript'],
        links: [{ label: 'GitHub', url: 'https://github.com/murqin/murq.in' }],
        status: 'active',
    },
    {
        name: 'No Crop Trample',
        description: 'A Minecraft mod that stops players and mobs from trampling farmland crops.',
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
        description:
            'A Telegram bot in Go that transcribes and summarizes voice notes, audio ' +
            'and video with Google Gemini. Runs in under 10 MB of RAM as a 15 MB container.',
        tags: ['Go', 'Docker'],
        links: [{ label: 'GitHub', url: 'https://github.com/Murqin/Scribo' }],
        status: 'archived',
    },
];
