#!/usr/bin/env bash
# Counterpart of new-post.sh — post deletion:
#
#   tools/delete-post.sh <slug>        # asks for confirmation
#   tools/delete-post.sh <slug> --yes  # no confirmation
#   tools/delete-post.sh               # lists the existing posts
#
# All the logic lives in tools/delete-post.js; this wrapper only guarantees
# running from the repo root and passes the arguments through.
set -euo pipefail
cd "$(dirname "$0")/.."

node tools/delete-post.js "$@"
