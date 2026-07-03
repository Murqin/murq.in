#!/usr/bin/env bash
# Tek komutla yazı akışı:
#
#   tools/new-post.sh
#
# 1. tools/new-post.js  — soruları sorar, iskeleti kurar
# 2. $EDITOR            — oluşan .md dosyasını açar (varsayılan: nano)
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
"${EDITOR:-nano}" "$newest"

node tools/update-rss.js
