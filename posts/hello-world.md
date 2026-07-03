This site finally has a blog. Nothing fancy — markdown files rendered in the
browser, a tiny hand-written parser, and an RSS feed. No frameworks, no build
step, same as the rest of the site.

## Why no build step

Every tool you add is a tool that can break while you are away. This whole
site is plain HTML, CSS, and JavaScript served as-is:

- No bundler, no transpiler, no dependencies to update
- Deploys are just a `git push`
- The code you read in the repo is the code the browser runs

## The seeded themes

If the URL contains a 12-character hex string (like `/a1b2c3d4e5f6`), the site
uses it to seed a small PRNG and rebuilds the exact same gradient and star
field every time. The dice button rolls a new one; the star next to it copies
a link to the current theme.

> Small, deterministic, shareable — that's the whole trick.

More notes on projects and tinkering will land here occasionally. There's an
[RSS feed](/rss.xml) if you want them delivered.
