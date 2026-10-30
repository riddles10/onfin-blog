"""Nvidia buys into Meta (26 Oct 2026), evidence-led carousel in EN, MS, RU, ES. python3 nvmeta_build.py  (renders stills and video frames)"""
import json, os, subprocess, sys
S = "/tmp/claude-0/-home-user-onfin-blog/42b2fa22-784d-52c4-a9a8-6ec4971d0812/scratchpad"
sys.path.insert(0, f"{S}/wk")
from common import Week
N = f"{S}/nvmeta"
E = lambda f: f"file://{N}/ev/{f}"
AV = f"file://{S}/meme/logo/avatar-bolt.jpg"
PH = f"file://{N}/photos/stanford.jpg"
d = json.load(open(f"{N}/meta_1mo.json"))["chart"]["result"][0]
closes = [round(c, 2) for c in d["indicators"]["quote"][0]["close"] if c]
T = json.load(open(f"{N}/copy.json", encoding="utf-8"))
W = Week("nvmeta/render")
for l, t in T.items():
    c = dict(avatar=AV, bg=PH, bgpos="40% 40%")
    W.lib("NvCover", dict(avatar=AV, photo=PH, pos="40% 40%", logo1=f"file://{N}/photos/Nvidia_logo.svg", logo2=f"file://{N}/photos/Meta_Platforms_Inc._logo_(cropped).svg",
          badge=t["badge"], cx=800, cy=400, cd=270, off=100, tag=t["tag"], headline=t["head"], credit=t["credit"], hsize=t.get("hsize", 86)), f"nvm-{l}-01.png")
    W.lib("VideoFrame", dict(c, line=t["v1"], source=t["vid"]), f"frame-{l}-02.png")
    W.lib("EvidenceSlide", dict(c, line=t["l3"], shot=E("ev_nvpr.png"), cardPad=0, maxh=960, source=t["nv"]), f"nvm-{l}-03.png")
    W.lib("EvidenceSlide", dict(c, line=t["l4"], shot=E("ev_metapx.png"), cardPad=0, maxh=960, source=t["meta"]), f"nvm-{l}-04.png")
    W.lib("EvidenceSlide", dict(c, line=t["l5"], shot=E("ev_metanb.png"), cardPad=0, maxh=960, source=t["meta"]), f"nvm-{l}-05.png")
    W.lib("VideoFrame", dict(c, line=t["v2"], source=t["vid"]), f"frame-{l}-06.png")
    W.lib("EvidenceSlide", dict(c, line=t["l7"], shot=E("s_nvhw.png"), cardPad=0, source=t["nv"]), f"nvm-{l}-07.png")
    W.lib("EvidenceSlide", dict(c, line=t["l8"], shot=E("ev_amd.png"), cardPad=0, maxh=960, source=t["amd"]), f"nvm-{l}-08.png")
    W.lib("RefChart", dict(c, line=t["l9"], closes=closes, refv=625, refLabel=t["ref"], symbol="META", change=t["chg"], sub=t["sub"], fromLabel=t["fr"], toLabel=t["to"],
          startLabel=t["sl"], endLabel=t["el"], source=t["data"]), f"nvm-{l}-09.png")
    W.lib("SocialSlide", dict(avatar=AV, photo=PH, pos="40% 40%", top=0.5, dark=0.92, line=t["q"], sub=t["follow"], risk=t["risk"], lsize=60 if l != "en" else 64), f"nvm-{l}-10.png")
W.save()
for j in W.lib_jobs:
    txt = json.dumps(j["props"], ensure_ascii=False)
    if any(ch in txt for ch in "–—!"):
        print("BAD CHAR", j["out"])
r = subprocess.run(["node", "render_page.js", f"{S}/{W.name}/lib_jobs.json"], cwd=f"{S}/igtools",
                   env={**os.environ, "LIB": f"{S}/iglib/library", "PAGE": "render_nvmeta.html"}, capture_output=True, text=True)
print(r.stdout[-300:], r.stderr[-800:])
