export function markdownPath(path: string): string {
    if (path === '/404' || path === '/404/' || path === '/404.html') return '/404.md';
    if (path.endsWith('.html')) return path.slice(0, -5) + '.md';
    return path.replace(/\/$/, '') + '/index.md';
}
