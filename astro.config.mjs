// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
    site: 'https://murq.in',
    integrations: [sitemap()],
    // Posts are served from /blog/<slug>/ so link-preview bots and crawlers get
    // a real document per post — the old /blog?post=<slug> was a single URL
    // rendered client-side.
    build: { format: 'directory' },
    markdown: {
        shikiConfig: {
            // defaultColor:false makes Shiki emit colours as --shiki-dark custom
            // properties instead of inline background/color, so .post-body pre in
            // style.css keeps owning the code block's panel background.
            themes: { dark: 'github-dark-default' },
            defaultColor: false,
            wrap: true,
        },
    },
});
