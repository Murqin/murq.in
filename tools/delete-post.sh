#!/usr/bin/env bash
# new-post.sh'ın simetriği — yazı silme:
#
#   tools/delete-post.sh <slug>        # onay sorar
#   tools/delete-post.sh <slug> --yes  # onaysız
#   tools/delete-post.sh               # mevcut yazıları listeler
#
# Tüm iş tools/delete-post.js'te; bu sarmalayıcı yalnızca repo kökünden
# çalışmayı garantiler ve argümanları aynen iletir.
set -euo pipefail
cd "$(dirname "$0")/.."

node tools/delete-post.js "$@"
