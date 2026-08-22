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
        name: 'Whitelist Managers',
        description:
            'Ultra-lightweight, high-performance whitelist management built for ' +
            'modern Minecraft servers (Paper & Purpur).',
        tags: ['Java', 'Paper/Purpur'],
        links: [
            { label: 'Modrinth', url: 'https://modrinth.com/plugin/whitelist-managers' },
            { label: 'GitHub', url: 'https://github.com/Murqin/whitelist-managers/' },
        ],
        status: 'active',
    },
    {
        name: 'Global Villager Discounts',
        description:
            'A Minecraft plugin that synchronizes villager curing discounts ' +
            'across every player on the server.',
        tags: ['Java', 'Paper/Purpur'],
        links: [
            { label: 'Modrinth', url: 'https://modrinth.com/plugin/globalvillagerdiscounts' },
            { label: 'GitHub', url: 'https://github.com/Murqin/GlobalVillagerDiscounts' },
        ],
        status: 'active',
    },
];
