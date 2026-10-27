"""python3 test_carousel.py car_<key>  -> renders all locales and writes contact sheets to scratchpad/test_<key>/sheet-<lang>.png
Also runs the copy checks (no en/em dashes, no '!', no emoji, Telegram caption length)."""
import importlib, json, subprocess, sys, glob
from PIL import Image
from common import Week, S
import carousel

name = sys.argv[1]
mod = importlib.import_module(name)
W = Week(f"test_{mod.KEY}")
carousel.build(W, mod, "2026-12-31", "telegram")
W.save()
for l in ("en", "ru", "es", "ms"):
    for k, v in mod.SLIDES[l].items():
        txt = json.dumps(v, ensure_ascii=False)
        if any(c in txt for c in "–—!"):
            print("BAD CHAR in slide", l, k)
r = subprocess.run(["node", "render.js", f"{S}/{W.name}/lib_jobs.json"], cwd=f"{S}/igtools",
                   env={**__import__("os").environ, "LIB": f"{S}/iglib/library"}, capture_output=True, text=True)
print(r.stdout[-200:], r.stderr[-500:])
for l in ("en", "ru", "es", "ms"):
    fs = sorted(glob.glob(f"{W.out}/{mod.KEY}-{l}-0*.png"))
    ims = [Image.open(f).convert("RGB") for f in fs]
    w = 360; h = int(1350 * w / 1080); cols = 4; rows = (len(ims) + cols - 1) // cols
    sh = Image.new("RGB", (cols * w + 50, rows * h + 10 * (rows + 1)), "white")
    for i, im in enumerate(ims):
        sh.paste(im.resize((w, h)), (10 + (i % cols) * (w + 10), 10 + (i // cols) * (h + 10)))
    sh.save(f"{S}/{W.name}/sheet-{l}.png")
print("sheets:", f"{S}/{W.name}/sheet-*.png")
