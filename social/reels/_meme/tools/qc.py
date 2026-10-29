"""qc.py <id> [...]: prints caption text with times, saves a 3-frame strip to probe/qc_<id>.jpg"""
import json, re, subprocess, sys, os
from PIL import Image
HERE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
for cid in sys.argv[1:]:
    out = os.path.join(HERE, "out", cid + ".mp4")
    dur = float(subprocess.check_output(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", out]))
    caps = [l.split(",", 9) for l in open(os.path.join(HERE, "work", cid, "captions.ass")) if l.startswith("Dialogue")]
    print("== %s %.1fs" % (cid, dur))
    print(" | ".join("%s %s" % (c[1][2:7], re.sub(r"\{[^}]*\}", "", c[9]).strip()) for c in caps))
    ims = []
    for t in (1.0, dur * 0.5, dur - 1.0):
        f = "/tmp/qc_%s.png" % int(t * 10)
        subprocess.run(["ffmpeg", "-v", "error", "-y", "-ss", str(t), "-i", out, "-frames:v", "1", "-vf", "scale=360:640", f], check=True)
        ims.append(Image.open(f).convert("RGB"))
    s = Image.new("RGB", (360 * 3 + 20, 640), "black")
    for i, im in enumerate(ims):
        s.paste(im, (i * 370, 0))
    s.save(os.path.join(HERE, "probe", "qc_%s.jpg" % cid), quality=85)
