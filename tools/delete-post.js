#!/usr/bin/env node
// Post deletion tool:
//
//   node tools/delete-post.js <slug>        # asks for confirmation
//   node tools/delete-post.js <slug> --yes  # no confirmation (for scripts)
//
// Removes the posts.json record, deletes posts/<slug>.md, reruns
// update-rss.js to refresh rss.xml, and stages the changes. Lists the
// existing posts when no slug is given.
'use strict';

const fs = require('fs');
const path = require('path');
const readline = require('node:readline');
const { execFileSync } = require('child_process');

const ROOT = path.join(__dirname, '..');
const jsonPath = path.join(ROOT, 'posts.json');

function loadPosts() {
    const posts = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
    if (!Array.isArray(posts)) throw new Error('posts.json must contain an array');
    return posts;
}

// A single question asked right after the interface is created; the
// buffering trap from new-post.js can't occur (no async gap in between)
function confirm(prompt) {
    return new Promise((resolve) => {
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });
        rl.question(prompt, (answer) => {
            rl.close();
            resolve(/^y(es)?$/i.test(answer.trim()));
        });
    });
}

function stage(paths) {
    try {
        execFileSync('git', ['-C', ROOT, 'add', '--', ...paths], {
            stdio: 'ignore'
        });
    } catch (err) {
        // Skip staging when git is missing or this isn't a repo
    }
}

async function main() {
    const args = process.argv.slice(2).filter((a) => a !== '--yes' && a !== '-y');
    const skipConfirm = process.argv.includes('--yes') || process.argv.includes('-y');
    const slug = args[0];

    let posts;
    try {
        posts = loadPosts();
    } catch (err) {
        console.error('error: posts.json could not be read: ' + err.message);
        process.exit(1);
    }

    if (!slug) {
        console.error('usage: node tools/delete-post.js <slug> [--yes]');
        if (posts.length) {
            console.error('posts:');
            for (const p of posts) console.error(`  ${p.slug} — ${p.title} (${p.date})`);
        } else {
            console.error('posts: (none)');
        }
        process.exit(1);
    }

    const post = posts.find((p) => p.slug === slug);
    const mdPath = path.join(ROOT, 'posts', slug + '.md');
    const mdExists = fs.existsSync(mdPath);

    if (!post && !mdExists) {
        console.error(`error: '${slug}' is neither in posts.json nor in posts/`);
        process.exit(1);
    }

    const label = post ? `"${post.title}" (${slug})` : `draft file posts/${slug}.md`;
    if (!skipConfirm) {
        const ok = await confirm(`Delete ${label}? [y/N] `);
        if (!ok) {
            console.log('aborted — nothing deleted');
            return;
        }
    }

    const staged = [];
    if (post) {
        const remaining = posts.filter((p) => p.slug !== slug);
        fs.writeFileSync(jsonPath, JSON.stringify(remaining, null, 4) + '\n');
        staged.push('posts.json');
        console.log('removed record from posts.json');
    }
    if (mdExists) {
        fs.unlinkSync(mdPath);
        staged.push(path.join('posts', slug + '.md'));
        console.log(`deleted posts/${slug}.md`);
    }

    // Refresh the feed (this also validates the remaining posts) and stage
    // the deletions. If a remaining post is invalid (e.g. an unwritten
    // draft) the deletion still completes; the feed catches up on the next
    // successful update-rss run
    try {
        execFileSync('node', [path.join(__dirname, 'update-rss.js')], {
            stdio: 'inherit'
        });
    } catch (err) {
        console.warn(
            'warning: feed not refreshed — fix the remaining posts, then run `node tools/update-rss.js`'
        );
    }
    stage(staged);
    console.log('done — commit the staged changes when ready');
}

main();
