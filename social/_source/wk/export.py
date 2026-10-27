"""python3 export.py w2 -> JPGs into repo social/<week>/, prints count. Run before commit."""
import json, os, sys
from PIL import Image
S = "/tmp/claude-0/-home-user-onfin-blog/42b2fa22-784d-52c4-a9a8-6ec4971d0812/scratchpad"
wk = sys.argv[1]
posts = json.load(open(f"{S}/{wk}/posts.json"))
imgs = sorted({i for p in posts for i in p["images"]})
dst = f"/home/user/onfin-blog/social/{wk}"
os.makedirs(dst, exist_ok=True)
for i in imgs:
    Image.open(i).convert("RGB").save(f"{dst}/{os.path.basename(i)[:-4]}.jpg", quality=92)
print(len(imgs), "images ->", dst)
