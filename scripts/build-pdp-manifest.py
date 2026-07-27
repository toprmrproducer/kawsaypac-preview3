#!/usr/bin/env python3
"""Rebuild pdp-manifest.js from assets/img/pdp/<slug>/ contents."""
import json, os, sys
root = os.path.join(os.path.dirname(__file__), '..')
base = os.path.join(root, 'assets', 'img', 'pdp')
manifest = {}
for slug in sorted(os.listdir(base)) if os.path.isdir(base) else []:
    d = os.path.join(base, slug)
    if not os.path.isdir(d):
        continue
    shots = sorted(f for f in os.listdir(d) if f.lower().endswith(('.webp', '.jpg', '.png')))
    if shots:
        manifest[slug] = [f'assets/img/pdp/{slug}/{f}' for f in shots]
out = ('/* Auto-generated map of custom product gallery shots.\n'
       '   Drop generated images into assets/img/pdp/<slug>/ (01-hero.webp, 02-*.webp, ...)\n'
       '   then run: python3 scripts/build-pdp-manifest.py  and commit. */\n'
       f'window.KAWSAYPAC_PDP_GALLERY = {json.dumps(manifest, indent=2)};\n')
open(os.path.join(root, 'pdp-manifest.js'), 'w').write(out)
print(f'pdp-manifest.js written with {len(manifest)} slugs')
