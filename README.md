<div align="center">

# murq.in 🪐

**Icarus Murqin's personal minimalist space. Randomly surfing the web.**

[![Live Site](https://img.shields.io/badge/Live-murq.in-%238B7EFF?style=for-the-badge)](https://murq.in)
[![License: MIT](https://img.shields.io/badge/License-MIT-%235A7FFF?style=for-the-badge)](./LICENSE)

<img src="./docs/preview.png" alt="murq.in home page in the dark and the light theme, side by side" width="800"/>

</div>

> [!CAUTION]
> This project was written largely with AI coding agents to solve my own problems.
> It is shared as-is, without warranty, and is not reviewed to production standards.
> Use at your own risk; read the code before running it.

---

## ✨ Features

- **🌀 Seeded PRNG System:** A custom `mulberry32` implementation resolves a unique theme from a 12-character hexadecimal path (`6-char gradient + 6-char starfield`), so `/1a2b3c4d5e6f` always renders the same sky.
- **🌌 Dynamic Starfield Twinkling:** Twinkling stardust laid out strictly from the active seed, with mouse parallax and the occasional shooting star.
- **🧭 Full-screen home:** The home page scrolls in snapping sections (`#about-me`, `#blog`, `#projects`, `#other-pages`), each with its own address. No cards: text sits on the sky, with square corners and an ice-cyan accent.
- **🌗 Light and dark:** The same seed draws a night sky or a day sky; the theme follows the system until the button picks one, and is set before the first paint.
- **🌍 English & Turkish:** Every page exists in both languages; English keeps the root URLs, Turkish lives under `/tr/`, with a language switch, `hreflang` links and a feed per language.
- **📝 Real pages per post:** Every post is a pre-rendered document at `/blog/<slug>/` with a reading time, an AI-disclosure badge and, on long posts, a contents list. "copy md" puts the post on the clipboard with a summarising prompt in front of it.
- **🖼️ Generated link previews:** Each page and post gets its own Open Graph image, drawn at build time with [Satori](https://github.com/vercel/satori) and sharp.
- **🗓️ Slash pages:** `/now` (what I am up to), `/ai` (how AI is used here) and `/colophon` (how the site is made, licences), each kept in one data file for both languages; `/projects` lists every project, the home page only the pinned ones.
- **🌠 Easter eggs:** Some seeds draw a real constellation into the sky. Mash the dice button and a ray-traced WebGL black hole swallows the page (in the light theme, a total solar eclipse turns the day to night), or once in a while it teleports out like an old CRT.
- **👁️ Visitor Counter:** Served by the site's own Node process; the count lives in a JSON file on a mounted volume.

---

## 🛠️ Technology Stack

- **Site:** [Astro](https://astro.build) (static output) + TypeScript
- **Content:** Markdown in `src/content/blog/`, validated at build time by a Zod schema
- **Frontend:** CSS3 Custom Properties, TypeScript compiled to a single module
- **Server:** ~400 lines of Node, zero runtime dependencies
- **Graphics:** link previews with Satori + sharp at build time; the black hole is a raw WebGL1 fragment shader
- **Typography:** [IBM Plex Sans & IBM Plex Mono](https://github.com/IBM/plex)
- **Infrastructure:** Self-hosted behind [Cosmos Cloud](https://cosmos-cloud.io); image built by GitHub Actions and published to GHCR

---

## 📂 File Architecture

```text
murq.in/
├── src/
│   ├── content/blog/       # English posts (markdown + frontmatter)
│   ├── content/blog/tr/    # Turkish posts, paired with the English one by file name
│   ├── content.config.ts   # Zod schema: a post missing a field fails the build
│   ├── data/               # projects.ts, now.ts, ai.ts, colophon.ts (all bilingual), constellations.ts
│   ├── layouts/Base.astro  # The one <head> (theme picked before paint) and the background layers
│   ├── components/         # Home, BlogIndex, BlogPost, ListPage (/now /ai /colophon), ProjectsPage, Controls, ...
│   ├── lib/                # i18n strings, blog URLs, dates, Open Graph image renderer
│   ├── scripts/            # theme.ts (seed engine, stars, light/dark), snap.ts, constellation, black hole + WebGL shader, eclipse
│   ├── styles/style.css    # Bundled by Vite into a content-hashed /_astro/ file
│   └── pages/
│       ├── index.astro, now.astro, ai.astro, colophon.astro, projects.astro, 404.astro
│       ├── rss.xml.ts          # Feed, generated from the collection
│       ├── posts/[slug].md.ts  # Raw markdown at /posts/<slug>.md
│       ├── blog/               # Post list and one page per post
│       ├── og/[...path].png.ts # Link preview image for every page
│       └── tr/                 # The same pages in Turkish
├── public/                 # Copied verbatim: robots.txt, assets/
├── server/src/server.ts    # Static host + seed fallback + visitor counter + per-language 404
├── tests/                  # node:test suites, run by `npm test` against the built site
├── docs/preview.png        # README screenshot (not shipped with the site)
├── tools/screenshot.js     # Regenerates docs/preview.png (needs puppeteer)
├── Dockerfile              # Multi-stage: build the site, then run the server
└── .github/workflows/      # Builds linux/arm64 and pushes to GHCR
```

### ✍️ Adding a blog post

Create `src/content/blog/<slug>.md` with frontmatter:

```markdown
---
title: The post title
date: 2026-08-22
summary: One sentence, used in the list, the feed and the link preview.
---

The post body. No `h1` — the title above is rendered for you.
```

For the Turkish version, add `src/content/blog/tr/<same slug>.md`; the shared file
name is what links the two for the language switch. Posts carry the AI-disclosure
badge by default; set `aiAssisted: false` for one written by hand.

Commit and push. The post page, the list entry, the RSS item, the sitemap entry,
the Open Graph tags and the preview image are all generated from that one file. A
missing or malformed field fails the build rather than shipping a broken page.

---

## 🚀 Running Locally

Needs Node 22.22 or newer.

```bash
git clone https://github.com/murqin/murq.in.git
cd murq.in
npm install
npm run dev          # http://localhost:4321
```

`astro dev` serves the pages but not the Node server's own routes. To exercise
seed URLs (`/1a2b3c4d5e6f`), the legacy `/blog?post=…` redirects and the visitor
counter, run the real thing:

```bash
npm run build:all    # astro check + astro build + tsc for the server
npm run serve        # http://localhost:8080
npm test             # build:all, then the test suites
```

In `npm run dev`, `?bh=teleport` or `?bh=nogl` forces the teleport instead of the
black hole for the next dice mash, and `?bh=eclipse` the light theme's eclipse (the
switch is compiled out of production).

### Server configuration

| Variable | Default | Purpose |
| --- | --- | --- |
| `PORT` | `8080` | Listen port |
| `SITE_ROOT` | `/srv/site` | Directory holding the built site |
| `DATA_DIR` | `/data` | Where `visitors.json` lives — must be writable |
| `ALLOWED_ORIGINS` | `https://murq.in` | Comma-separated origins allowed to increment the counter |

The container runs as uid 1000, so the mounted data directory has to be owned by
it (`chown -R 1000:1000 <host dir>`). The server refuses to start otherwise
rather than silently losing the count on every restart.

---

## 📄 Licensing

- **Codebase:** Distributed under the terms of the MIT License — see [LICENSE](./LICENSE).
- **Blog posts:** The posts in `src/content/blog/` are dedicated to the public domain under [CC0 1.0](https://creativecommons.org/publicdomain/zero/1.0/).
- **Media & Fonts:** Third-party notices and asset licensing are detailed in [LICENSES.md](./LICENSES.md).

---

<div align="center">
Built by Icarus Murqin • 2026
</div>
