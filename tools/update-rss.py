#!/usr/bin/env python3
"""Yarı otomatik RSS güncelleme aracı.

Yeni yazı ekledikten sonra tek komut yeter:

    python3 tools/update-rss.py

Yaptıkları:
1. posts.js kayıtlarını doğrular (slug <-> dosya eşleşmesi, tarih biçimi,
   zorunlu alanlar, slug tekrarı)
2. posts/ altında dizinde kaydı olmayan (sahipsiz) .md dosyalarını raporlar
3. rss.xml'i yeniden üretir (XML'in tek kaynağı tools/generate-rss.js'tir)
4. rss.xml değiştiyse git'e stage'ler ve eklenen yazıları listeler
"""

import json
import re
import subprocess
import sys
from datetime import date
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent


def load_posts() -> list[dict]:
    """posts.js'teki POSTS dizisini okur.

    posts.js tarayıcı için yazılmış bir JS veri modülü; onu güvenilir
    biçimde okumanın tek yolu bir JS motorundan geçirmek. Node zaten
    generate-rss.js için gerekli olduğundan ek bağımlılık yaratmaz.
    """
    dump = (
        "const fs = require('fs');"
        "const src = fs.readFileSync(process.argv[1], 'utf8');"
        "const POSTS = eval(src + '\\nPOSTS');"
        "console.log(JSON.stringify(POSTS));"
    )
    result = subprocess.run(
        ["node", "-e", dump, str(ROOT / "posts.js")],
        capture_output=True,
        text=True,
    )
    if result.returncode != 0:
        sys.exit(f"error: posts.js could not be evaluated:\n{result.stderr}")
    return json.loads(result.stdout)


def validate(posts: list[dict]) -> list[str]:
    """Kayıt hatalarını insan okunur mesajlar olarak döndürür."""
    errors = []
    seen_slugs = set()
    for post in posts:
        slug = post.get("slug", "")
        label = slug or "<missing slug>"
        if not re.fullmatch(r"[a-z0-9-]+", slug):
            errors.append(f"{label}: slug must be lowercase letters/digits/dashes")
        elif slug in seen_slugs:
            errors.append(f"{label}: duplicate slug")
        seen_slugs.add(slug)

        if slug and not (ROOT / "posts" / f"{slug}.md").is_file():
            errors.append(f"{label}: posts/{slug}.md does not exist")

        raw_date = post.get("date", "")
        try:
            date.fromisoformat(raw_date)
        except ValueError:
            errors.append(f"{label}: invalid date {raw_date!r} (expected YYYY-MM-DD)")

        for field in ("title", "summary"):
            if not post.get(field):
                errors.append(f"{label}: missing {field}")
    return errors


def orphan_files(posts: list[dict]) -> list[str]:
    """posts/ altında olup dizinde kaydı olmayan .md dosyaları."""
    indexed = {p.get("slug") for p in posts}
    return sorted(
        f.name for f in (ROOT / "posts").glob("*.md") if f.stem not in indexed
    )


def rss_titles(xml: str) -> list[str]:
    return re.findall(r"<item>.*?<title>(.*?)</title>", xml, flags=re.DOTALL)


def main() -> None:
    posts = load_posts()

    errors = validate(posts)
    if errors:
        for e in errors:
            print(f"error: {e}")
        sys.exit(1)
    print(f"posts.js OK ({len(posts)} post{'s' if len(posts) != 1 else ''})")

    for orphan in orphan_files(posts):
        print(f"warning: posts/{orphan} is not listed in posts.js (draft?)")

    rss_path = ROOT / "rss.xml"
    old_xml = rss_path.read_text(encoding="utf-8") if rss_path.is_file() else ""

    subprocess.run(
        ["node", str(ROOT / "tools" / "generate-rss.js")],
        check=True,
        capture_output=True,
    )
    new_xml = rss_path.read_text(encoding="utf-8")

    if new_xml == old_xml:
        print("rss.xml already up to date — nothing to do")
        return

    added = set(rss_titles(new_xml)) - set(rss_titles(old_xml))
    for title in sorted(added):
        print(f"added to feed: {title}")
    print("rss.xml regenerated")

    # Yarı otomatik kısım: değişen rss.xml'i stage'le (git yoksa sessizce geç)
    staged = subprocess.run(
        ["git", "-C", str(ROOT), "add", "rss.xml"],
        capture_output=True,
    )
    if staged.returncode == 0:
        print("rss.xml staged — commit it together with your post")


if __name__ == "__main__":
    main()
