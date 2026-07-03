#!/usr/bin/env bash
# Tek komutla yazı akışı:
#
#   tools/new-post.sh
#
# 1. tools/new-post.js  — soruları sorar, iskeleti kurar
# 2. Editör             — $EDITOR ayarlıysa o; değilse VS Code (code --wait),
#                         o da yoksa nano. --wait şart: code normalde hemen
#                         döner, script de dosya boşken doğrulamaya geçerdi
# 3. tools/update-rss.js — doğrular, lintler, rss.xml'i üretip stage'ler
#
# Dosyayı boş bırakıp çıkarsan 3. adım hata verir — yazılmamış yazı
# beslemeye giremez; yazıyı tamamlayıp `node tools/update-rss.js` ile
# devam edersin.
set -euo pipefail
cd "$(dirname "$0")/.."

node tools/new-post.js

# new-post.js'in az önce oluşturduğu dosya: posts/ altındaki en yenisi
newest="$(ls -t posts/*.md | head -n 1)"

if [ -n "${EDITOR:-}" ]; then
    # $EDITOR argüman içerebilir (ör. "code --wait") — bilerek tırnaksız
    ${EDITOR} "$newest"
elif command -v code >/dev/null 2>&1; then
    code --wait "$newest"
else
    nano "$newest"
fi

node tools/update-rss.js
