"""Contact sheet: python3 sheet.py OUT.jpg COLS THUMB_W files..."""
import sys
from PIL import Image, ImageDraw
out, cols, tw = sys.argv[1], int(sys.argv[2]), int(sys.argv[3]); fs = sys.argv[4:]
ims = [Image.open(f).convert("RGB") for f in fs]
th = max(int(tw * im.height / im.width) for im in ims)
rows = (len(ims) + cols - 1) // cols
sh = Image.new("RGB", (cols * (tw + 12) + 12, rows * (th + 12) + 12), (200, 200, 200))
for i, im in enumerate(ims):
    im = im.resize((tw, int(tw * im.height / im.width)))
    sh.paste(im, (12 + (i % cols) * (tw + 12), 12 + (i // cols) * (th + 12)))
sh.save(out, quality=90)
