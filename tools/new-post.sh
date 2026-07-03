#!/usr/bin/env bash
# One-command post flow:
#
#   tools/new-post.sh
#
# 1. tools/new-post.js  — asks the questions, scaffolds the post
# 2. Editor             — $EDITOR if set; otherwise VS Code (code --wait),
#                         falling back to nano. --wait matters: code returns
#                         immediately without it and validation would run
#                         against the still-empty file
# 3. tools/update-rss.js — validates, lints, regenerates and stages rss.xml
#
# Leaving the file empty makes step 3 fail — an unwritten post can't reach
# the feed; finish writing and continue with `node tools/update-rss.js`.
set -euo pipefail
cd "$(dirname "$0")/.."

node tools/new-post.js

# The file new-post.js just created: the newest one under posts/
newest="$(ls -t posts/*.md | head -n 1)"

if [ -n "${EDITOR:-}" ]; then
    # $EDITOR may carry arguments (e.g. "code --wait") — unquoted on purpose
    ${EDITOR} "$newest"
elif command -v code >/dev/null 2>&1; then
    code --wait "$newest"
else
    nano "$newest"
fi

node tools/update-rss.js
