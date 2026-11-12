"""Nvidia board reportedly preparing to oust Jensen Huang (WSJ, 11 Nov 2026). Carousel EN (3 slides) + single cover in MS, RU, ES.
python3 h2_build.py"""
import datetime, json, os, subprocess, sys
sys.path.insert(0, "/tmp/claude-0/-home-user-onfin-blog/42b2fa22-784d-52c4-a9a8-6ec4971d0812/scratchpad/wk")
from common import Week, S
from PIL import Image

M = f"{S}/huang2"
AV = f"file://{S}/meme/logo/avatar-bolt.jpg"
PH = f"file://{S}/huang/photo/huang.jpg"
CREDIT = "Photo: Anderseidesvik, CC BY-SA 4.0, Wikimedia Commons"
d = json.load(open(f"{M}/dl/nvda_d.json"))["chart"]["result"][0]
rows = [(datetime.datetime.fromtimestamp(t, datetime.timezone.utc).strftime("%Y-%m-%d"), c) for t, c in zip(d["timestamp"], d["indicators"]["quote"][0]["close"]) if c]
CLOSES = [round(c, 2) for dt, c in rows if "2026-10-06" <= dt <= "2026-11-11"]
assert CLOSES[0] == 239.24 and CLOSES[-1] == 173.73, (CLOSES[0], CLOSES[-1])
PRE = 160.50   # Yahoo Finance pre-market, Thu 12 Nov 2026, 13:00 UTC
BADGE = "%.1f%%" % ((PRE / 173.73 - 1) * 100)   # -7.6%

# evidence: pad the Yahoo live-blog entry so it fits the card at a readable size
im = Image.open(f"{M}/ev/s_both_c.png").convert("RGB")
pad = 190
wide = Image.new("RGB", (im.width + 2 * pad, im.height), "white"); wide.paste(im, (pad, 0)); wide.save(f"{M}/ev/s_both_wide.png")

T = {
 "en": dict(tag="Breaking", head="Report: Nvidia's board is preparing to *oust Jensen Huang*.", sub="The board met on Wednesday night. No decision has been announced."),
 "ms": dict(tag="Terkini", head="Laporan: lembaga Nvidia bersedia untuk *menyingkirkan Jensen Huang*.", sub="Lembaga bermesyuarat pada Rabu malam. Belum ada keputusan diumumkan."),
 "ru": dict(tag="Срочно", head="СМИ: совет директоров Nvidia готовится *сместить Дженсена Хуанга*.", sub="Совет собирался в среду вечером. Решение пока не объявлено."),
 "es": dict(tag="Última hora", head="Reporte: el consejo de Nvidia se prepara para *destituir a Jensen Huang*.", sub="El consejo se reunió el miércoles por la noche. Aún no hay decisión."),
}
RISK = "Not investment advice. CFDs are high-risk; you may lose money."


def render():
    W = Week("huang2")
    for l, t in T.items():
        W.lib("HuangCover", dict(avatar=AV, photo=PH, pos="50% 22%", logo=f"file://{S}/huang/photo/nvlogo.svg", badge=BADGE.replace(".", ",") if l == "ru" else BADGE,
              cx=850, cy=640, cd=200, tag=t["tag"], headline=t["head"], sub=t["sub"], subsize=30, credit=CREDIT, hsize=70 if l == "en" else 62), f"h2-{l}-01.png")
    c = dict(avatar=AV, bg=PH, bgpos="50% 30%")
    W.lib("EvidenceSlide", dict(c, line="WSJ: the board is preparing to *oust him*.", shot=f"file://{M}/ev/s_both_wide.png", cardPad=0, maxh=900, lsize=56,
          source="Yahoo Finance, citing WSJ, NYT and Bloomberg, 12 Nov 2026"), "h2-en-02.png")
    W.lib("ProbeChart", dict(c, line="Nvidia is down about *a third* from its October high.", closes=CLOSES, last=PRE, symbol="NVDA", change="%.1f%%" % ((PRE / 239.24 - 1) * 100),
          sub="Daily close since the 6 Oct high; dashed: Thursday pre-market", highLabel="$239.24", closeLabel="Wed $173.73", lastLabel="about $160.50",
          startLabel="6 Oct", endLabel="Thu 12 Nov", foot="Next: third-quarter results on 17 Nov.",
          source="Yahoo Finance; pre-market at 13:00 UTC, 12 Nov 2026", q="Can Nvidia keep its lead *without its founder?*", risk=RISK), "h2-en-03.png")
    W.save()
    for j in W.lib_jobs:
        if any(ch in json.dumps(j["props"], ensure_ascii=False) for ch in "–—!"):
            print("BAD CHAR", j["out"])
    page = f"{S}/iglib/library/render_huang2.html"
    open(page, "w").write(open(f"{S}/iglib/library/render_antspacex.html").read().replace(f"{S}/antspacex/antspacex.js", f"{M}/huang2.js"))
    r = subprocess.run(["node", "render_page.js", f"{M}/lib_jobs.json"], cwd=f"{S}/igtools", env={**os.environ, "LIB": f"{S}/iglib/library", "PAGE": "render_huang2.html"}, capture_output=True, text=True)
    print(r.stdout[-120:], r.stderr[-600:])
    ims = [Image.open(f"{M}/out/h2-en-0{i}.png").convert("RGB") for i in (1, 2, 3)] + [Image.open(f"{M}/out/h2-{l}-01.png").convert("RGB") for l in ("ms", "ru", "es")]
    w = 360; hh = int(w * 1350 / 1080); sh = Image.new("RGB", (w * 3 + 20, hh * 2 + 10), "white")
    for i, x in enumerate(ims):
        sh.paste(x.resize((w, hh)), ((i % 3) * (w + 10), (i // 3) * (hh + 10)))
    sh.save(f"{M}/sheet.jpg", quality=88)


if __name__ == "__main__":
    render()
