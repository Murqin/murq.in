// The fixed footer names the page in view: the one crossing the middle of the screen. A visibility
// ratio would never be reached by a page taller than the screen (projects on a phone).
const here = document.getElementById('here');
const count = document.getElementById('here-count');
const pages = [...document.querySelectorAll<HTMLElement>('.snap-page')];
const pad = (n: number) => String(n).padStart(2, '0');
// "02 / 04" beside the label is the only hint on the first screen that more pages follow.
const show = (page: HTMLElement) => {
    here!.textContent = page.dataset.here ?? '';
    if (count) count.textContent = `${pad(pages.indexOf(page) + 1)} / ${pad(pages.length)}`;
};

if (here && pages.length > 0) {
    show(pages[0]);
    const observer = new IntersectionObserver(
        (entries) => {
            for (const entry of entries) {
                if (!entry.isIntersecting) continue;
                const page = entry.target as HTMLElement;
                show(page);
                // Each page gets its own address (/#projects) without adding a history entry per
                // scroll; path and query stay, so a seed URL keeps its theme.
                if (location.hash !== `#${page.id}`) history.replaceState(null, '', `#${page.id}`);
            }
        },
        { rootMargin: '-50% 0px -50% 0px' },
    );
    pages.forEach((page) => observer.observe(page));
}
