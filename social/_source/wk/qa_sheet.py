"""python3 qa_sheet.py <week> <glob> <out.png> [cols]  -> contact sheet of matching images in <week>/out"""
import glob, sys
from PIL import Image
S = "/tmp/claude-0/-home-user-onfin-blog/42b2fa22-784d-52c4-a9a8-6ec4971d0812/scratchpad"
wk, pat, out = sys.argv[1:4]; cols = int(sys.argv[4]) if len(sys.argv) > 4 else 6
fs = []
for p in pat.split(","):
    fs += sorted(glob.glob(f"{S}/{wk}/out/{p}"))
ims = [Image.open(f).convert("RGB") for f in fs]
w = 300; h = max(int(i.height * w / i.width) for i in ims); rows = (len(ims) + cols - 1) // cols
sh = Image.new("RGB", (cols * (w + 10) + 10, rows * (h + 10) + 10), "white")
for k, i in enumerate(ims):
    sh.paste(i.resize((w, int(i.height * w / i.width))), (10 + (k % cols) * (w + 10), 10 + (k // cols) * (h + 10)))
sh.save(f"{S}/qa/{out}"); print(len(ims), "->", out)
