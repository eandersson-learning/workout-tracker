"""Extract the stick-figure SVGs from the 30-day routine HTML into src/data/figures.json.

Usage: python3 -I scripts/extract-figures.py <routine.html>
"""
import html
import json
import re
import sys
from pathlib import Path

src = Path(sys.argv[1]).read_text()
out = {}
for card in re.findall(r'<div class="card">(.*?)<p class="cue">', src, flags=re.S):
    name = html.unescape(re.search(r'<h4>(.*?)</h4>', card).group(1))
    name = re.sub(r'\s*\((forearm block|grip finisher)\)', '', name).strip()
    slug = re.sub(r'[^a-z0-9]+', '-', name.lower()).strip('-')
    if slug in out:
        continue
    figs = []
    for svg, cap in re.findall(r'<figure>(<svg.*?</svg>)<figcaption>(.*?)</figcaption></figure>', card, flags=re.S):
        svg = re.sub(r'\s+', ' ', svg)
        figs.append({'caption': html.unescape(re.sub(r'<[^>]+>', '', cap)), 'svg': svg})
    out[slug] = figs

dest = Path(__file__).resolve().parent.parent / 'src' / 'data' / 'figures.json'
dest.write_text(json.dumps(out, indent=1, ensure_ascii=False) + '\n')
print(f'{len(out)} exercises -> {dest}')
for k, v in out.items():
    print(k, len(v))
