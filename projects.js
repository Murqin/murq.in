// Proje verisi — yeni proje eklemek için bu diziye kayıt eklemek yeterli.
// Alanlar: name, description, tags (dizi), links (sıralı {label, url} dizisi),
// status: "active" | "wip" | "archived"
const PROJECTS = [
    {
        name: 'murq.in',
        description:
            'A minimalist personal website with a seed-driven PRNG theme engine ' +
            'and a dynamic star field. Zero build tools, zero frameworks.',
        tags: ['Vanilla JS', 'Cloudflare Pages'],
        links: [
            { label: 'GitHub', url: 'https://github.com/murqin/murq.in' }
        ],
        status: 'active'
    },
    {
        name: 'Rep Counter',
        description:
            'A minimal workout rep counter — tap to count, nothing to configure, ' +
            'no distractions between sets.',
        tags: ['JavaScript', 'Web App'],
        links: [
            { label: 'Try', url: 'https://rep-counter-sapphire.vercel.app/' },
            { label: 'GitHub', url: 'https://github.com/Murqin/rep-counter' }
        ],
        status: 'wip'
    },
    {
        name: 'Whitelist Managers',
        description:
            'Ultra-lightweight, high-performance whitelist management built for ' +
            'modern Minecraft servers (Paper & Purpur).',
        tags: ['Java', 'Paper/Purpur'],
        links: [
            { label: 'Modrinth', url: 'https://modrinth.com/plugin/whitelist-managers' },
            { label: 'GitHub', url: 'https://github.com/Murqin/whitelist-managers/' }
        ],
        status: 'active'
    },
    {
        name: 'Global Villager Discounts',
        description:
            'A Minecraft plugin that synchronizes villager curing discounts ' +
            'across every player on the server.',
        tags: ['Java', 'Paper/Purpur'],
        links: [
            { label: 'Modrinth', url: 'https://modrinth.com/plugin/globalvillagerdiscounts' },
            { label: 'GitHub', url: 'https://github.com/Murqin/GlobalVillagerDiscounts' }
        ],
        status: 'active'
    }
];
