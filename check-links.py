#!/usr/bin/env python3
"""Assert every internal href / data-href / ROUTES entry resolves to a file."""
from __future__ import annotations

import re
import sys
from pathlib import Path
from urllib.parse import urlparse, unquote

ROOT = Path(__file__).resolve().parent
SKIP_PREFIXES = ("http://", "https://", "mailto:", "tel:", "javascript:", "data:")

def is_external(href: str) -> bool:
    h = href.strip()
    if not h or h.startswith("#"):
        return True
    if h.startswith("//"):
        return True
    return any(h.lower().startswith(p) for p in SKIP_PREFIXES)

def resolve(base: Path, href: str) -> Path:
    raw = href.split("#", 1)[0].split("?", 1)[0]
    raw = unquote(raw)
    if raw in ("", "./"):
        return (base.parent / "index.html").resolve()
    p = (base.parent / raw).resolve()
    if p.is_dir():
        p = p / "index.html"
    return p

def collect_from_html(path: Path) -> list[tuple[str, str]]:
    text = path.read_text()
    found: list[tuple[str, str]] = []
    for attr in ("href", "src", "data-href"):
        for m in re.finditer(rf"{attr}=[\"']([^\"']+)[\"']", text, flags=re.I):
            found.append((attr, m.group(1)))
    return found

def collect_js_routes(path: Path) -> list[str]:
    if not path.exists():
        return []
    text = path.read_text()
    # ROUTES object string values that look like files
    return re.findall(r'ROUTES\s*=\s*\{(.*?)\n\s*\}', text, flags=re.S) and \
        re.findall(r'["\']([0-9a-zA-Z._-]+\.html)["\']', text) or \
        re.findall(r'["\']([0-9a-zA-Z._-]+\.html)["\']', text)

def main() -> int:
    html_files = sorted(ROOT.glob("*.html"))
    missing = []
    checked = 0
    for html in html_files:
        for attr, href in collect_from_html(html):
            if is_external(href):
                continue
            # stylesheets / scripts / images too
            target = resolve(html, href)
            checked += 1
            if not target.exists():
                missing.append(f"{html.name}: {attr}=\"{href}\" -> {target}")

    js = ROOT / "proto.js"
    for name in collect_js_routes(js):
        target = (ROOT / name).resolve()
        checked += 1
        if not target.exists():
            missing.append(f"proto.js ROUTES: {name}")

    # required assets
    for name in ("styles.css", "proto.css", "proto.js", "index.html", "more.html"):
        checked += 1
        if not (ROOT / name).exists():
            missing.append(f"missing required file: {name}")

    if missing:
        print(f"FAIL: {len(missing)} broken link(s) / missing file(s) ({checked} checked)")
        print("\n".join(missing))
        return 1
    print(f"OK: {checked} href/src/data-href/route targets exist ({len(html_files)} HTML files)")
    return 0

if __name__ == "__main__":
    sys.exit(main())
