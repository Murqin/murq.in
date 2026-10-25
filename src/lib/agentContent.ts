import { AI } from '../data/ai';
import { COLOPHON } from '../data/colophon';
import { MUSEUM } from '../data/museum';
import { NOW } from '../data/now';
import { PROFILE } from '../data/profile';
import { PINNED_PROJECTS, PROJECTS, type Project, type ProjectStatus } from '../data/projects';
import { LANGS, getPosts, postSlug, postUrl, rssUrl, type Lang, type Post } from './blog';
import { ui } from './i18n';

export interface MarkdownPage {
    path: string;
    lang: Lang;
    title: string;
    summary: string;
    body: string;
    date?: string;
    error?: boolean;
}

const text = (value: string): string => value.replace(/([\\\[\]])/g, '\\$1');
const link = (label: string, url: string): string => `[${text(label)}](${url})`;

export async function markdownPages(site: URL): Promise<MarkdownPage[]> {
    const pages: MarkdownPage[] = [];
    const absolute = (path: string): string => new URL(path, site).href;
    for (const lang of LANGS) {
        const t = ui[lang];
        const statusLabels: Record<ProjectStatus, string> = {
            active: t.statusActive,
            wip: t.statusWip,
            archived: t.statusArchived,
        };
        const posts = await getPosts(lang);
        const add = (path: string, title: string, summary: string, body: string, extra: Pick<MarkdownPage, 'date' | 'error'> = {}) => {
            pages.push({ path, lang, title, summary, body, ...extra });
        };
        const projects = (items: Project[], headingLevel = 2) => items.map(project => [
            `${'#'.repeat(headingLevel)} ${project.name}`,
            project.description[lang],
            `${statusLabels[project.status]} · ${project.tags.join(', ')}`,
            project.links.map(item => link(item.label, item.url)).join(' · '),
        ].join('\n\n')).join('\n\n');
        const postList = (items: Post[]) => items.map(post =>
            `- ${link(post.data.title, absolute(postUrl(lang, postSlug(post))))} (${post.data.date.toISOString().slice(0, 10)}): ${post.data.summary}`,
        ).join('\n');
        const other = [
            [t.nowTitle, t.nowUrl], [t.aiTitle, t.aiUrl],
            [t.colophonTitle, t.colophonUrl], [t.museumTitle, t.museumUrl],
        ] as const;
        add(t.homeUrl, PROFILE.name, t.homeDescription, [
            t.tagline, `${PROFILE.name} (${PROFILE.givenName})`,
            `## ${t.aboutTitle}`, t.about,
            PROFILE.socials.map(item => link(item.label, item.url)).join(' · '),
            `${t.contactMe} ${link(PROFILE.email, `mailto:${PROFILE.email}`)}`,
            `## ${t.blogHomeTitle}`, t.blogTeaser, postList(posts.slice(0, 6)),
            link(t.allPostsHome, absolute(lang === 'en' ? '/blog/' : '/tr/blog/')),
            `## ${t.projectsTitle}`, projects(PINNED_PROJECTS, 3),
            link(t.allProjects, absolute(t.projectsUrl)),
            `## ${t.otherTitle}`, other.map(([title, path]) => `- ${link(title, absolute(path))}`).join('\n'),
        ].join('\n\n'));
        add(lang === 'en' ? '/blog/' : '/tr/blog/', t.blogTitle, t.blogDescription,
            `${t.blogDescription}\n\n${postList(posts)}\n\n${link('RSS', absolute(rssUrl(lang)))}`);
        add(t.projectsUrl, t.projectsTitle, t.projectsIntro, projects(PROJECTS));
        for (const [id, data] of [['now', NOW], ['ai', AI], ['colophon', COLOPHON]] as const) {
            const body = data.items.map(item => {
                const links = 'links' in item ? item.links : undefined;
                return [
                    `## ${item.label[lang]}`, item.text[lang],
                    links?.map(itemLink => link(itemLink.label[lang], absolute(itemLink.href === 'ai' ? t.aiUrl : itemLink.href))).join(' · '),
                ].filter(Boolean).join('\n\n');
            }).join('\n\n');
            add(t[`${id}Url`], t[`${id}Title`], t[`${id}Intro`], body, { date: data.updated.toISOString().slice(0, 10) });
        }
        add(t.museumUrl, t.museumTitle, t.museumIntro, [t.museumNote, ...MUSEUM.map(entry => [
            `## ${entry.title[lang]}`, entry.date, entry.description[lang],
            link(t.museumScreenshot, absolute(`/assets/museum/${entry.id}.webp`)),
            link(t.museumSource, `https://github.com/Murqin/murq.in/tree/${entry.commit}`),
        ].join('\n\n'))].join('\n\n'));
        for (const post of posts) {
            add(postUrl(lang, postSlug(post)), post.data.title, post.data.summary, [
                post.data.aiAssisted ? `> ${t.aiNote}` : '',
                post.body ?? '',
                `${t.postLicense} — https://creativecommons.org/publicdomain/zero/1.0/`,
            ].filter(Boolean).join('\n\n'), { date: post.data.date.toISOString().slice(0, 10) });
        }
        add(lang === 'en' ? '/404.html' : '/tr/404/', '404', t.notFoundText,
            `${t.notFoundText}\n\n${link('murq.in', absolute(t.homeUrl))}`, { error: true });
    }
    return pages;
}

export function renderMarkdown(page: MarkdownPage, site: URL): string {
    const metadata: Record<string, string> = {
        title: page.title,
        description: page.summary,
        url: new URL(page.path, site).href,
        language: page.lang,
    };
    if (page.date) metadata['date'] = page.date;
    const frontmatter = Object.entries(metadata).map(([key, value]) => `${key}: ${JSON.stringify(value)}`).join('\n');
    return `---\n${frontmatter}\n---\n\n# ${page.title}\n\n${page.body}\n`;
}
