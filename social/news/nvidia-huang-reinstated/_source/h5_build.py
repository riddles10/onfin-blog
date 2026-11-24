"""Jensen Huang reinstated as Nvidia CEO (23 Nov 2026): 5-slide evidence carousel (EN) + cover in MS, RU, ES."""
import datetime, json, os, subprocess, sys
sys.path.insert(0, "/tmp/claude-0/-home-user-onfin-blog/42b2fa22-784d-52c4-a9a8-6ec4971d0812/scratchpad/wk")
from common import Week, S
from PIL import Image
M = f"{S}/huang5"
AV = f"file://{S}/meme/logo/avatar-bolt.jpg"
PH = f"file://{S}/huang/photo/huang.jpg"
NV = f"file://{S}/huang/photo/nvlogo.svg"
CREDIT = "Photo: Anderseidesvik, CC BY-SA 4.0, Wikimedia Commons"
d = json.load(open(f"{M}/dl/nvda_d.json"))["chart"]["result"][0]
rows = [(datetime.datetime.fromtimestamp(t, datetime.timezone.utc).strftime("%Y-%m-%d"), round(c, 2)) for t, c in zip(d["timestamp"], d["indicators"]["quote"][0]["close"]) if c]
CL = [c for dt, c in rows if "2026-11-06" <= dt <= "2026-11-20"]
LAST = dict(rows)["2026-11-23"]
assert CL[0] == 186.64 and CL[-1] == 125.53 and LAST == 165.05
PCT = (LAST / CL[-1] - 1) * 100   # +31.5
T = {
 "en": dict(tag="Breaking news", head="Jensen Huang is back as Nvidia CEO, *12 days after resigning*.", sub="The board voted unanimously. Source: Nvidia, 23 Nov 2026."),
 "ms": dict(tag="Berita terkini", head="Jensen Huang kembali sebagai CEO Nvidia, *12 hari selepas meletak jawatan*.", sub="Lembaga mengundi sebulat suara. Sumber: Nvidia, 23 Nov 2026."),
 "ru": dict(tag="Срочная новость", head="Дженсен Хуанг вернулся на пост CEO Nvidia *через 12 дней после отставки*.", sub="Совет директоров проголосовал единогласно. Источник: Nvidia, 23 нояб. 2026."),
 "es": dict(tag="Última hora", head="Jensen Huang vuelve como CEO de Nvidia, *12 días después de renunciar*.", sub="El consejo votó por unanimidad. Fuente: Nvidia, 23 nov 2026."),
}
RISK = "Not investment advice. CFDs are high-risk; you may lose money."
W = Week("huang5")
for l, t in T.items():
    W.lib("HuangCover", dict(avatar=AV, photo=PH, pos="50% 22%", logo=NV, badge=("+%.1f%%" % PCT).replace(".", "," if l == "ru" else "."), cx=850, cy=600, cd=200, up=True,
          tag=t["tag"], tagBig=True, headline=t["head"], sub=t["sub"], subsize=29, credit=CREDIT, hsize=72 if l == "en" else 60), f"h5-{l}-01.png")
c = dict(avatar=AV, bg=PH, bgpos="50% 30%")
W.lib("EvidenceSlide", dict(c, line="The board voted *unanimously* to bring him back.", shot=f"file://{M}/ev/s_nv.png", cardPad=0, maxh=900, lsize=56, source="Nvidia press release, 23 Nov 2026"), "h5-en-02.png")
W.lib("EvidenceSlide", dict(c, line="Six days earlier, the board said *the opposite*.", shot=f"file://{M}/ev/s_npr2.png", cardPad=0, lsize=56, source="NPR, 23 Nov 2026"), "h5-en-03.png")
W.lib("EvidenceSlide", dict(c, line="Trump says he *convinced the board*.", shot=f"file://{M}/ev/s_npr.png", cardPad=0, lsize=56, source="NPR, citing Trump on CNBC, 23 Nov 2026"), "h5-en-04.png")
W.lib("ProbeChart", dict(c, line="The stock jumped *31.5%* on the news.", closes=CL, last=LAST, symbol="NVDA", change="+%.1f%%" % PCT, changeColor="var(--accent)", legColor="#7ee04a",
      sub="Daily close from 6 Nov; dashed: Monday 23 Nov, reinstatement day", highLabel="$186.64", closeLabel="Fri $125.53", lastLabel="Mon $165.05",
      startLabel="6 Nov", endLabel="23 Nov", foot="He resigned on 12 Nov. The board's own investigation is still running.",
      source="Closing prices: Yahoo Finance", q="Was the board right to *reverse course?*", risk=RISK), "h5-en-05.png")
W.save()
for j in W.lib_jobs:
    if any(ch in json.dumps(j["props"], ensure_ascii=False) for ch in "–—!"): print("BAD CHAR", j["out"])
page = f"{S}/iglib/library/render_huang5.html"
open(page, "w").write(open(f"{S}/iglib/library/render_antspacex.html").read().replace(f"{S}/antspacex/antspacex.js", f"{M}/huang5.js"))
r = subprocess.run(["node", "render_page.js", f"{M}/lib_jobs.json"], cwd=f"{S}/igtools", env={**os.environ, "LIB": f"{S}/iglib/library", "PAGE": "render_huang5.html"}, capture_output=True, text=True)
print(r.stdout[-120:], r.stderr[-500:])
ims = [Image.open(f"{M}/out/h5-en-0{i}.png").convert("RGB") for i in range(1, 6)] + [Image.open(f"{M}/out/h5-{l}-01.png").convert("RGB") for l in ("ms", "ru", "es")]
w = 330; hh = int(w * 1350 / 1080); sh = Image.new("RGB", (w * 4 + 30, hh * 2 + 10), "white")
for i, x in enumerate(ims): sh.paste(x.resize((w, hh)), ((i % 4) * (w + 10), (i // 4) * (hh + 10)))
sh.save(f"{M}/sheet.jpg", quality=88)
