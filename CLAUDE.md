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
- The blog is bilingual, nothing else is. English posts keep the unprefixed URLs; a Turkish translation
  is `src/content/blog/tr/<same slug>.md` and is served at `/tr/blog/<slug>/`, `/tr/posts/<slug>.md`,
  listed at `/tr/blog/` and in `/tr/rss.xml`. Sharing the file name is what pairs the two for the
  language switch, hreflang and the sitemap. `aiAssisted` (default true) shows the AI-disclosure badge.
- Projects on the home page: `src/data/projects.ts`. Only list projects whose links resolve publicly.
- Styles: `src/styles/style.css`, imported in `src/layouts/Base.astro`. Keep it imported, never linked
  from `public/`: Vite gives it a content-hashed `/_astro/` URL, which is what stops Cloudflare from
  pairing new HTML with an old stylesheet. Anything under `public/` is served as-is and cached for an hour.
- Theme engine, star field, counter fetch: `src/scripts/theme.ts`.

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
