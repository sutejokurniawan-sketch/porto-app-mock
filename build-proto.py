#!/usr/bin/env python3
"""Build the clickable Porto App prototype into this folder.

Reads copies of the generated mockup HTML from /workspace/asset-app-mockups/html/
and injects navigation chrome. Does not modify those source files.
"""
from __future__ import annotations

import re
import shutil
from pathlib import Path

SRC = Path("/workspace/asset-app-mockups/html")
DST = Path(__file__).resolve().parent

INJECT = """<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<link rel="icon" href="logo.svg" type="image/svg+xml">
<link rel="stylesheet" href="proto.css">
<script src="proto.js" defer></script>
"""

SCREENS = [
    "00-brand-system.html",
    "01-dashboard.html",
    "02-portfolio.html",
    "03-instrument-antam.html",
    "04-asset-car.html",
    "05-add-asset.html",
    "06-dispose-sell.html",
    "07-dispose-hibah.html",
    "08-liabilities.html",
    "09-tax-l1.html",
    "10-vault.html",
    "11-prices.html",
    "12-settings.html",
    "d1-dashboard.html",
    "d2-tax-l1.html",
    "d3-prices.html",
]


def inject(html: str) -> str:
    # Insert viewport + proto assets immediately after charset, before title.
    needle = '<meta charset="utf-8">'
    if needle not in html:
        raise SystemExit("unexpected HTML head; charset meta missing")
    if "proto.js" in html:
        return html
    return html.replace(needle, needle + INJECT, 1)


def first_div(html: str, class_name: str) -> str:
    """Return the outer HTML of the first div with the given class."""
    token = f'<div class="{class_name}"'
    start = html.find(token)
    if start < 0:
        # tabbar / status sometimes have a trailing space in class attr? try regex
        m = re.search(rf'<div class="{class_name}(?:\s[^"]*)?"', html)
        if not m:
            raise SystemExit(f"could not find div.{class_name}")
        start = m.start()
    i = start
    depth = 0
    # walk tags
    for m in re.finditer(r"</?div\b[^>]*>", html[start:], flags=re.I):
        tag = m.group(0)
        if tag.startswith("</"):
            depth -= 1
            if depth == 0:
                return html[start : start + m.end()]
        else:
            # self-closing unlikely
            depth += 1
    raise SystemExit(f"unbalanced div.{class_name}")


def more_page(settings_html: str) -> str:
    status = first_div(settings_html, "status")
    tabbar = first_div(settings_html, "tabbar")
    # tab bar on settings already has More selected
    body = f"""<!doctype html><html><head><meta charset="utf-8">{INJECT}<title>More</title><link rel="stylesheet" href="styles.css">
<style>html,body{{width:390px;height:844px;overflow:hidden}}</style></head><body>
<div class="phone ">
{status}
<div class="hdr"><div><h1>More</h1><div class="sub">Vault, prices, settings and disposals</div></div></div>
<div class="content">
  <div class="card" style="padding:4px 14px 2px">
    <a class="it" style="padding:12px 0;text-decoration:none;color:inherit" href="08-liabilities.html" data-proto="nav" data-href="08-liabilities.html">
      <div class="tile" style="background:#FBE9E5;color:#C0432D"><svg fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" viewBox="0 0 24 24"><rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20M6 15h4"/></svg></div>
      <div><div class="t">Liabilities</div><div class="s">SPT L-1 B · 4 debts</div></div>
      <span class="r" style="color:var(--muted)"><svg fill="none" height="16" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" viewBox="0 0 24 24" width="16"><path d="M9 5l7 7-7 7"/></svg></span>
    </a>
    <a class="it" style="padding:12px 0;text-decoration:none;color:inherit" href="10-vault.html" data-proto="nav" data-href="10-vault.html">
      <div class="tile" style="background:#F1EFE8;color:#3C4B45"><svg fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" viewBox="0 0 24 24"><path d="M3 6a1 1 0 0 1 1-1h5l2 2h9a1 1 0 0 1 1 1v11a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1z"/></svg></div>
      <div><div class="t">Document vault</div><div class="s">148 files · encrypted</div></div>
      <span class="r" style="color:var(--muted)"><svg fill="none" height="16" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" viewBox="0 0 24 24" width="16"><path d="M9 5l7 7-7 7"/></svg></span>
    </a>
    <a class="it" style="padding:12px 0;text-decoration:none;color:inherit" href="11-prices.html" data-proto="nav" data-href="11-prices.html">
      <div class="tile" style="background:#E6EEF8;color:#2E63A6"><svg fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" viewBox="0 0 24 24"><path d="M3 3v18h18"/><path d="M7 15l4-5 3 3 5-7"/></svg></div>
      <div><div class="t">Prices</div><div class="s">9 instruments · update sheet</div></div>
      <span class="r" style="color:var(--muted)"><svg fill="none" height="16" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" viewBox="0 0 24 24" width="16"><path d="M9 5l7 7-7 7"/></svg></span>
    </a>
    <a class="it" style="padding:12px 0;text-decoration:none;color:inherit" href="12-settings.html" data-proto="nav" data-href="12-settings.html">
      <div class="tile" style="background:#E8E1F5;color:#5B4A8B"><svg fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/></svg></div>
      <div><div class="t">Settings &amp; family</div><div class="s">Currency, feeds, hibah relatives</div></div>
      <span class="r" style="color:var(--muted)"><svg fill="none" height="16" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" viewBox="0 0 24 24" width="16"><path d="M9 5l7 7-7 7"/></svg></span>
    </a>
  </div>

  <div class="cap" style="margin:14px 2px 6px">Disposals</div>
  <div class="card" style="padding:4px 14px 2px">
    <a class="it" style="padding:12px 0;text-decoration:none;color:inherit" href="06-dispose-sell.html" data-proto="nav" data-href="06-dispose-sell.html">
      <div class="tile" style="background:#E3ECE8;color:#0E3B30"><svg fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" viewBox="0 0 24 24"><path d="M3 11 12 4l9 7"/><path d="M5 10v10h14V10M10 20v-6h4v6"/></svg></div>
      <div><div class="t">Sell land</div><div class="s">Tanah kavling · Gowa</div></div>
      <span class="r" style="color:var(--muted)"><svg fill="none" height="16" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" viewBox="0 0 24 24" width="16"><path d="M9 5l7 7-7 7"/></svg></span>
    </a>
    <a class="it" style="padding:12px 0;text-decoration:none;color:inherit" href="07-dispose-hibah.html" data-proto="nav" data-href="07-dispose-hibah.html">
      <div class="tile" style="background:#E8E1F5;color:#5B4A8B"><svg fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" viewBox="0 0 24 24"><path d="M12 8v13M8 12h8"/><path d="M20 12v9H4v-9"/><path d="M2 12h20l-2-7H4z"/></svg></div>
      <div><div class="t">Gift · hibah</div><div class="s">Emas Antam · 20 g to Nadia</div></div>
      <span class="r" style="color:var(--muted)"><svg fill="none" height="16" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" viewBox="0 0 24 24" width="16"><path d="M9 5l7 7-7 7"/></svg></span>
    </a>
  </div>

  <div class="cap" style="margin:14px 2px 6px">Sample holdings in this prototype</div>
  <div class="card" style="padding:4px 14px 2px">
    <a class="it" style="padding:12px 0;text-decoration:none;color:inherit" href="03-instrument-antam.html" data-proto="nav" data-href="03-instrument-antam.html">
      <div class="tile mono" style="background:#FBF4DF;color:#8A6A12;font-size:13px">Au</div>
      <div><div class="t">Emas Antam</div><div class="s">85 g · 3 lots</div></div>
      <span class="r" style="color:var(--muted)"><svg fill="none" height="16" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" viewBox="0 0 24 24" width="16"><path d="M9 5l7 7-7 7"/></svg></span>
    </a>
    <a class="it" style="padding:12px 0;text-decoration:none;color:inherit" href="04-asset-car.html" data-proto="nav" data-href="04-asset-car.html">
      <div class="tile" style="background:#EEF0F3;color:#3C4B45"><svg fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" viewBox="0 0 24 24"><path d="M3 13l2-5h14l2 5"/><path d="M5 16a2 2 0 1 0 4 0 2 2 0 1 0-4 0M15 16a2 2 0 1 0 4 0 2 2 0 1 0-4 0"/><path d="M3 13h18v3H3z"/></svg></div>
      <div><div class="t">Innova Zenix 2.0 Q HV</div><div class="s">Serialized asset · DD 1288 KN</div></div>
      <span class="r" style="color:var(--muted)"><svg fill="none" height="16" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" viewBox="0 0 24 24" width="16"><path d="M9 5l7 7-7 7"/></svg></span>
    </a>
  </div>

  <div style="font-size:12px;color:var(--muted);font-weight:600;text-align:center;margin:16px 8px 8px">Fictional sample data · nothing is saved</div>
</div>
{tabbar}
</div>
</body></html>"""
    return body


REDIRECT = """<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Porto App</title>
<link rel="canonical" href="./">
<meta http-equiv="refresh" content="0; url=./">
<script>location.replace("./");</script>
</head>
<body>
<p><a href="./">Open the Porto App prototype</a></p>
</body>
</html>
"""

README = """# Porto App mock prototype

A clickable, in-browser prototype of Porto App, built from the fictional sample-data mockups.

Live site: https://sutejokurniawan-sketch.github.io/porto-app-mock/

This is not the real app. Nothing is saved. All figures are invented.

Rebuild after changing `proto.js` / `proto.css` by running `python3 build-proto.py` (reads from `/workspace/asset-app-mockups/html/` on the build machine).
"""


def main() -> None:
    if not SRC.is_dir():
        raise SystemExit(f"source mockups not found: {SRC}")

    shutil.copy2(SRC / "styles.css", DST / "styles.css")
    if (SRC / "logo.svg").exists():
        shutil.copy2(SRC / "logo.svg", DST / "logo.svg")

    settings_html = None
    for name in SCREENS:
        src = SRC / name
        html = src.read_text()
        out = inject(html)
        (DST / name).write_text(out)
        if name == "12-settings.html":
            settings_html = html
        print("wrote", name)

    # Canonical dashboard at the site root.
    dash = inject((SRC / "01-dashboard.html").read_text())
    (DST / "index.html").write_text(dash)
    (DST / "01-dashboard.html").write_text(REDIRECT)
    print("wrote index.html (dashboard) and 01-dashboard.html (redirect)")

    if settings_html is None:
        settings_html = (SRC / "12-settings.html").read_text()
    (DST / "more.html").write_text(more_page(settings_html))
    print("wrote more.html")

    (DST / "README.md").write_text(README)
    (DST / ".nojekyll").write_text("")
    print("done")


if __name__ == "__main__":
    main()
