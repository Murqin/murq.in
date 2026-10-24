// Each home page section gets its own address (/#projects) as it scrolls into view, so a link can
// point at a section and the back button is not flooded: replaceState adds no history entries.
// Path and query stay, so a seed URL keeps its theme. "In view" is the section crossing the middle
// of the screen; a visibility ratio would never be reached by a section taller than a phone screen.
const pages = document.querySelectorAll<HTMLElement>('.snap-page[id]');

const observer = new IntersectionObserver(
    (entries) => {
        for (const entry of entries) {
            if (!entry.isIntersecting) continue;
            const id = (entry.target as HTMLElement).id;
            if (location.hash !== `#${id}`) history.replaceState(null, '', `#${id}`);
        }
    },
    { rootMargin: '-50% 0px -50% 0px' },
);
pages.forEach((page) => observer.observe(page));

// Switching language keeps the section: both homes use the same section ids, so EN/TR carries the
// current #section across instead of landing at the top. Done at click time, because theme.ts
// rewrites these hrefs (seed) after load and after every dice roll.
for (const link of document.querySelectorAll<HTMLAnchorElement>('.lang-switch a')) {
    link.addEventListener('click', () => {
        if (!location.hash) return;
        const target = new URL(link.href);
        target.hash = location.hash;
        link.href = target.href;
    });
}
