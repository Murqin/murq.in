# CLAUDE.md

Notes for Claude Code working on murq.in. Humans: start with README.md.

## What this is

A personal site: Astro (static output) + TypeScript, served by a small Node server with no runtime
dependencies (`server/src/server.ts`). The server adds what static files cannot: the 12-hex seed URLs
(`/1a2b3c4d5e6f` renders the home page with that theme) and the visitor counter (`/api/visitors`).

## Commands

```sh
npm ci
npm run dev        # Astro dev server, pages only (no seed URLs, no /api/visitors)
npm run build:all  # site -> dist/, server -> server/dist/
npm run serve      # the real Node server on :8080, after build:all
npm test           # build:all, then tests/server.test.mjs against the built server
```

`npm test` must pass before every commit. It is the only automated check.

## Where things live

- Blog posts: `src/content/blog/<slug>.md` with frontmatter `title`, `date`, `summary` (schema in
  `src/content.config.ts`; a missing field fails the build). The list, `/rss.xml`, the sitemap and the
  raw `/posts/<slug>.md` are generated from these files. Do not hand-edit any of them.
- The whole site is bilingual. English keeps the unprefixed URLs, Turkish lives under `/tr/` (home,
  blog, `/now/`, 404). UI strings are in `src/lib/i18n.ts`; project descriptions are `{ en, tr }` in
  `src/data/projects.ts` (`pinned: true` puts up to three on the home page; all are on `/projects`);
  the `/now`, `/ai` and `/colophon` items are in `src/data/{now,ai,colophon}.ts`, rendered by
  `ListPage.astro`. A Turkish post is
  `src/content/blog/tr/<same slug>.md`, served at `/tr/blog/<slug>/` and `/tr/posts/<slug>.md`; sharing
  the file name pairs the two for the language switch, hreflang and the sitemap. `aiAssisted` (default
  true) shows the AI-disclosure badge. The Turkish home carries its seed as `/tr/?s=<hex>`; the bare
  `/<hex>` path is always the English home.
- Link preview images are generated at build time (`src/lib/og.ts`, `src/pages/og/[...path].png.ts`);
  a new page gets one by passing `ogImagePath` to `Base`.
- Museum exhibits: `src/data/museum.ts`, rendered by `MuseumPage.astro` at `/museum/` and `/tr/museum/`.
  Screenshots live in `public/assets/museum/`. Dates identify the pinned source revision; these are
  captures of archived code rendered today, not images saved on the historical date.
- Projects on the home page: `src/data/projects.ts`. Only list projects whose links resolve publicly.
- Styles: `src/styles/style.css`, imported in `src/layouts/Base.astro`. Keep it imported, never linked
  from `public/`: Vite gives it a content-hashed `/_astro/` URL, which is what stops Cloudflare from
  pairing new HTML with an old stylesheet. Anything under `public/` is served as-is and cached for an hour.
- Theme engine, star field, light/dark switch, counter fetch: `src/scripts/theme.ts`. The light or
  dark theme is set by an inline script in `Base.astro`'s head, before the stylesheet, so a light-theme
  reader never sees a dark flash; colours are CSS variables with a `:root[data-theme="light"]` block.
- Easter eggs: `blackhole.ts` picks the black hole (dark), the eclipse (light, `eclipse.ts`) or the
  CRT teleport; in dev `?bh=teleport|nogl|eclipse` forces one.

## Rules

- Code, comments and commit messages in English. Comments say why, not what.
- Never commit `dist/`, `server/dist/`, `.data/` or `node_modules/`.
- The visitor counter refuses to start on an unreadable or invalid `visitors.json`. That is deliberate:
  it protects the real count. Do not change it back to "default to zero".
- Changes to `server/src/server.ts` need a test in `tests/server.test.mjs`.
- Keep the server dependency-free.

## Deploying

Pushing to `main` builds a linux/arm64 image and publishes `ghcr.io/murqin/murq.in:latest`
(`.github/workflows/publish.yml`); other branches publish `:staging`. On the server a 2-minute timer
runs `deploy/auto-update.sh`, which redeploys a new image, health-checks it and rolls back on failure.
The server keeps its own copy of that script: when you change it here, the server copy must be updated
too. Production sits behind Cosmos Cloud and Cloudflare. Do not push to `main` or touch the server
unless the user asks.
