"""Jensen Huang admits affair; Nvidia board opens probe (8 to 9 Nov 2026): 3-slide evidence carousel (EN) plus the
evidence slide in MS, RU, ES for Telegram.  python3 huang_build.py"""
import json, os, subprocess, sys
sys.path.insert(0, "/tmp/claude-0/-home-user-onfin-blog/42b2fa22-784d-52c4-a9a8-6ec4971d0812/scratchpad/wk")
from common import Week, S
from PIL import Image, ImageDraw, ImageFont

M = f"{S}/huang"
AV = f"file://{S}/meme/logo/avatar-bolt.jpg"
PH = f"file://{M}/photo/huang.jpg"
CREDIT = "Photo: Anderseidesvik, CC BY-SA 4.0, Wikimedia Commons"
FONT = f"{S}/acad/fonts/Montserrat-w700.ttf"
RISK = {"en": "Not investment advice. CFDs are high-risk; you may lose money.",
        "ms": "Bukan nasihat pelaburan. CFD berisiko tinggi; anda mungkin kehilangan wang.",
        "ru": "Не является инвестиционной рекомендацией. CFD относятся к высокорисковым инструментам; вы можете потерять деньги.",
        "es": "No es asesoramiento de inversión. Los CFD son de alto riesgo; puedes perder dinero."}

# Nasdaq daily closes from the 6 Oct 2026 high to Friday 6 Nov 2026 (Yahoo Finance chart API, pulled 9 Nov 08:08 UTC)
d = json.load(open(f"{M}/dl/nvda_d.json"))["chart"]["result"][0]
import datetime
rows = [(datetime.datetime.fromtimestamp(t, datetime.timezone.utc).strftime("%Y-%m-%d"), c) for t, c in zip(d["timestamp"], d["indicators"]["quote"][0]["close"]) if c]
CLOSES = [round(c, 2) for dt, c in rows if "2026-10-06" <= dt <= "2026-11-06"]
assert CLOSES[0] == 239.24 and CLOSES[-1] == 186.64, (CLOSES[0], CLOSES[-1])
LAST = 180.30  # Reuters, 9 Nov: about $180.30 in out-of-hours trading, down about 3.4% from Friday's Nasdaq close

T = {
 "en": dict(l2="An apology to staff, then an *independent probe*.", lab_memo="Huang's memo to staff, as quoted by SF Standard", lab_nv="Nvidia board statement, 8 Nov 2026",
            s2="SF Standard; Nvidia Newsroom, 8 Nov 2026"),
 "ms": dict(l2="Permohonan maaf kepada kakitangan, kemudian *siasatan bebas*.", lab_memo="Memo Huang kepada kakitangan, dipetik oleh SF Standard", lab_nv="Kenyataan lembaga pengarah Nvidia, 8 Nov 2026",
            s2="SF Standard; Bilik Berita Nvidia, 8 Nov 2026"),
 "ru": dict(l2="Извинения перед сотрудниками, затем *независимое расследование*.", lab_memo="Письмо Хуанга сотрудникам, цитата по SF Standard", lab_nv="Заявление совета директоров Nvidia, 8 нояб. 2026",
            s2="SF Standard; пресс-центр Nvidia, 8 нояб. 2026"),
 "es": dict(l2="Una disculpa al personal y luego una *investigación independiente*.", lab_memo="Memorando de Huang al personal, citado por SF Standard", lab_nv="Comunicado del consejo de Nvidia, 8 nov 2026",
            s2="SF Standard; sala de prensa de Nvidia, 8 nov 2026"),
}


def composite(lang):
    """memo paragraph + board paragraph, each under a small source label, on one white card"""
    t = T[lang]
    parts = [(t["lab_memo"], Image.open(f"{M}/ev/s_memo.png").convert("RGB")), (t["lab_nv"], Image.open(f"{M}/ev/s_nv1.png").convert("RGB"))]
    W = 1000
    f = ImageFont.truetype(FONT, 30)
    blocks = []
    for lab, im in parts:
        im = im.resize((W, int(im.height * W / im.width))) if im.width != W else im
        strip = Image.new("RGB", (W, 64), (241, 243, 236))
        dr = ImageDraw.Draw(strip)
        dr.rounded_rectangle((40, 22, 52, 34), 6, fill=(116, 160, 0))
        dr.text((66, 32), lab, font=f, fill=(60, 64, 56), anchor="lm")
        blocks += [strip, im]
    out = Image.new("RGB", (W, sum(b.height for b in blocks) + 18), "white")
    y = 0
    for i, b in enumerate(blocks):
        out.paste(b, (0, y)); y += b.height
        if i == 1:
            y += 18
    p = f"{M}/ev/stack-{lang}.png"; out.save(p); return p


def render():
    W = Week("huang")
    c = dict(avatar=AV, bg=PH, bgpos="50% 30%")
    W.lib("HuangCover", dict(avatar=AV, photo=PH, pos="50% 22%", logo=f"file://{M}/photo/nvlogo.svg", badge="-3.4%", cx=850, cy=700, cd=200,
          tag="Market news", headline="Jensen Huang admits an affair. Nvidia's board *opens a probe*.", credit=CREDIT, hsize=78), "huang-en-01.png")
    for l, t in T.items():
        W.lib("EvidenceSlide", dict(c, line=t["l2"], shot="file://" + composite(l), cardPad=0, maxh=860, lsize=54 if l != "en" else 58, source=t["s2"]), f"huang-{l}-02.png")
    W.lib("ProbeChart", dict(c, line="The stock was already *22% below its high*.", closes=CLOSES, last=LAST, symbol="NVDA", change="-22.0%",
          sub="Daily close since the 6 Oct high; dashed: Monday, out-of-hours", highLabel="$239.24", closeLabel="Fri $186.64", lastLabel="about $180.30",
          startLabel="6 Oct", endLabel="Mon 9 Nov", foot="Next: third-quarter results on 17 Nov.",
          source="Closes: Yahoo Finance. Monday: Reuters, 9 Nov 2026", q="Key-person risk, or *noise before earnings?*", risk=RISK["en"]), "huang-en-03.png")
    W.save()
    for j in W.lib_jobs:
        if any(ch in json.dumps(j["props"], ensure_ascii=False) for ch in "–—!"):
            print("BAD CHAR", j["out"])
    page = f"{S}/iglib/library/render_huang.html"
    if not os.path.exists(page):
        src = open(f"{S}/iglib/library/render_antspacex.html").read()
        open(page, "w").write(src.replace(f"{S}/antspacex/antspacex.js", f"{M}/huang.js"))
    r = subprocess.run(["node", "render_page.js", f"{M}/lib_jobs.json"], cwd=f"{S}/igtools",
                       env={**os.environ, "LIB": f"{S}/iglib/library", "PAGE": "render_huang.html"}, capture_output=True, text=True)
    print(r.stdout[-300:], r.stderr[-800:])


def sheet():
    ims = [Image.open(f"{M}/out/huang-en-{i:02d}.png").convert("RGB") for i in (1, 2, 3)] + [Image.open(f"{M}/out/huang-{l}-02.png").convert("RGB") for l in ("ms", "ru", "es")]
    w = 360; hh = int(w * 1350 / 1080)
    sh = Image.new("RGB", (w * 3 + 20, hh * 2 + 10), "white")
    for i, im in enumerate(ims):
        sh.paste(im.resize((w, hh)), ((i % 3) * (w + 10), (i // 3) * (hh + 10)))
    sh.save(f"{M}/sheet.jpg", quality=88)


if __name__ == "__main__":
    render()
    sheet()
