import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import satori from 'satori';
import sharp from 'sharp';

// Link-preview images, drawn at build time so every page gets one without anyone exporting a PNG
// by hand. Satori only reads TTF/OTF/WOFF, not the WOFF2 files the site serves, hence @fontsource.
// Both the latin and latin-ext subsets are loaded under one name: Satori falls back across fonts
// glyph by glyph, which is how Turkish letters (ı, ş, ğ) find the ext file.
const require = createRequire(import.meta.url);
const font = (pkg: string, file: string): Buffer => readFileSync(require.resolve(`${pkg}/files/${file}`));

const FONTS = [
    { name: 'Mono', data: font('@fontsource/jetbrains-mono', 'jetbrains-mono-latin-600-normal.woff'), weight: 600 },
    { name: 'Mono', data: font('@fontsource/jetbrains-mono', 'jetbrains-mono-latin-ext-600-normal.woff'), weight: 600 },
    { name: 'Mono', data: font('@fontsource/jetbrains-mono', 'jetbrains-mono-latin-400-normal.woff'), weight: 400 },
    { name: 'Mono', data: font('@fontsource/jetbrains-mono', 'jetbrains-mono-latin-ext-400-normal.woff'), weight: 400 },
    { name: 'Inter', data: font('@fontsource/inter', 'inter-latin-400-normal.woff'), weight: 400 },
    { name: 'Inter', data: font('@fontsource/inter', 'inter-latin-ext-400-normal.woff'), weight: 400 },
] as const;

const WIDTH = 1200;
const HEIGHT = 630;
const PAD_X = 80;
const PAD_Y = 72;

// Satori cannot decode WebP, so the avatar is converted once per build.
let avatarUri: Promise<string> | undefined;
function avatar(): Promise<string> {
    avatarUri ??= sharp(readFileSync('public/assets/avatar-netrunner.webp'))
        .resize(144, 144)
        .png()
        .toBuffer()
        .then((png) => `data:image/png;base64,${png.toString('base64')}`);
    return avatarUri;
}

// Long titles shrink instead of overflowing; three steps keep the look consistent across posts.
function titleSize(title: string): number {
    if (title.length <= 40) return 72;
    if (title.length <= 70) return 58;
    return 48;
}

type Node = { type: string; props: Record<string, unknown> };
const el = (type: string, style: Record<string, unknown>, children?: unknown, extra: Record<string, unknown> = {}): Node => ({
    type,
    props: { style, children, ...extra },
});

// A type alias, not an interface: Astro's getStaticPaths props must be assignable to a record.
export type OgCard = {
    title: string;
    /** Small line above the title: "blog", a date, or the page name. */
    kicker: string;
};

export async function renderOg({ title, kicker }: OgCard): Promise<Buffer> {
    const tree = el(
        'div',
        {
            // Satori sizes boxes content-box: padding is added on top of width/height, so the root
            // gets the canvas minus its padding (a full-size root pushed the bottom row off the card).
            width: WIDTH - 2 * PAD_X,
            height: HEIGHT - 2 * PAD_Y,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            padding: `${PAD_Y}px ${PAD_X}px`,
            backgroundColor: '#0b0e1a',
            backgroundImage:
                'radial-gradient(circle at 85% 15%, rgba(139,126,255,0.35), transparent 45%), ' +
                'radial-gradient(circle at 10% 95%, rgba(90,127,255,0.25), transparent 40%)',
            color: '#e8e9f3',
            fontFamily: 'Inter',
        },
        [
            el('div', { display: 'flex', alignItems: 'center', gap: 20, fontFamily: 'Mono', fontSize: 28 }, [
                el('span', { color: '#8b7eff', fontWeight: 600 }, 'murq.in'),
                el('span', { color: '#4b4f7a' }, '/'),
                el('span', { color: '#a4a9d6', fontWeight: 400 }, kicker),
            ]),
            el(
                'div',
                {
                    display: 'flex',
                    fontFamily: 'Mono',
                    fontWeight: 600,
                    fontSize: titleSize(title),
                    lineHeight: 1.2,
                    letterSpacing: '-0.01em',
                },
                title,
            ),
            el('div', { display: 'flex', alignItems: 'center', gap: 24 }, [
                el('img', { width: 72, height: 72, borderRadius: 36, border: '2px solid rgba(139,126,255,0.5)' }, undefined, {
                    src: await avatar(),
                    width: 72,
                    height: 72,
                }),
                el('span', { fontSize: 30, color: '#a4a9d6' }, 'Icarus Murqin'),
            ]),
        ],
    );
    const svg = await satori(tree as Parameters<typeof satori>[0], { width: WIDTH, height: HEIGHT, fonts: [...FONTS] });
    return sharp(Buffer.from(svg)).png().toBuffer();
}
