"""stack.py <manifest.json> <key> <out.png> : stack S-1 line segments into a phone-readable card image."""
import json, sys
from PIL import Image
man = json.load(open(sys.argv[1])); segs = [Image.open(f).convert("RGB") for f in man[sys.argv[2]]]


def trim(im, edge=8):
    """drop thin highlight slivers from the neighbouring lines at the top and bottom edges"""
    px = im.load(); W, H = im.size
    dark = lambda y: any(sum(px[x, y]) < 300 for x in range(0, W, 2))
    top = 0
    while top < edge and not dark(top): top += 1
    bot = H
    while H - bot < edge and not dark(bot - 1): bot -= 1
    out = Image.new("RGB", (W, H), "white"); out.paste(im.crop((0, top, W, bot)), (0, top)); return out


segs = [trim(s) for s in segs]
pad, gap = 36, 7
w = max(s.width for s in segs) + 2 * pad
h = sum(s.height + gap for s in segs) + 2 * pad - gap
out = Image.new("RGB", (w, h), "white"); y = pad
for s in segs:
    out.paste(s, (pad, y)); y += s.height + gap
out.save(sys.argv[3]); print(sys.argv[3], out.size)
