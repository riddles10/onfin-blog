"""Monday 9 Nov 2026 recap: '$2 trillion added, everything green except Nvidia', fact-checked. 3 slides EN, cover in MS, RU, ES.
python3 heat_build.py"""
import json, os, subprocess, sys
sys.path.insert(0, "/tmp/claude-0/-home-user-onfin-blog/42b2fa22-784d-52c4-a9a8-6ec4971d0812/scratchpad/wk")
from common import Week, S
from PIL import Image

M = f"{S}/heat"
AV = f"file://{S}/meme/logo/avatar-bolt.jpg"
NV = f"file://{S}/huang/photo/nvlogo.svg"
mv = json.load(open(f"{M}/moves.json"))   # Yahoo Finance daily closes: (Fri 6 Nov, Mon 9 Nov, % change)
ORDER = ["AAPL", "MSFT", "GOOGL", "AMZN", "META", "AVGO", "TSLA", "BRK-B", "LLY", "JPM", "WMT", "ORCL", "V", "MA", "XOM",
         "NFLX", "COST", "PLTR", "AMD", "JNJ", "HD", "BAC", "ABBV", "PG", "UNH"]
tiles = [[t.replace("BRK-B", "BRK.B"), round(mv[t][2], 2)] for t in ORDER]
nv = round(mv["NVDA"][2], 2)
assert abs(nv + 4.27) < 0.01, nv
down = [t for t, v in tiles if v < 0]
MVAL = 76.18  # US market value at Friday's close, $tn (Siblis Research 30 Sep, scaled by the Wilshire 5000; OnFin estimate)
GAIN = MVAL * 0.0235
T = {
 "en": dict(tag="Fact check", head="*$2 trillion* added, and everything green except Nvidia?", vl="Close:",
            v="about $1.8 trillion at the close, and %d of these 25 giants still fell" % len(down), note="Monday close, $178.67",
            foot="Monday 9 Nov 2026 vs Friday's close, 25 of the largest US stocks (Yahoo Finance). Value gained: OnFin estimate, 2.35% of about $76 trillion."),
 "ms": dict(tag="Semak fakta", head="*$2 trilion* bertambah, dan semua hijau kecuali Nvidia?", vl="Hampir:",
            v="kira-kira $1.8 trilion pada harga tutup, dan %d daripada 25 gergasi ini tetap jatuh" % len(down), note="Tutup Isnin, $178.67",
            foot="Isnin 9 Nov 2026 berbanding harga tutup Jumaat, 25 saham AS terbesar (Yahoo Finance). Nilai bertambah: anggaran OnFin, 2.35% daripada kira-kira $76 trilion."),
 "ru": dict(tag="Проверка фактов", head="Плюс *$2 трлн*, и всё зелёное, кроме Nvidia?", vl="Почти:",
            v="около $1,8 трлн на закрытии, и %d из этих 25 гигантов всё же упали" % len(down), note="Закрытие пн, $178,67",
            foot="Понедельник, 9 нояб. 2026, к закрытию пятницы, 25 крупнейших акций США (Yahoo Finance). Прирост стоимости: оценка OnFin, 2,35% от примерно $76 трлн."),
 "es": dict(tag="Verificación", head="¿*$2 billones* más y todo en verde salvo Nvidia?", vl="Casi:",
            v="unos $1.8 billones al cierre, y %d de estos 25 gigantes igual cayeron" % len(down), note="Cierre del lunes, $178.67",
            foot="Lunes 9 nov 2026 frente al cierre del viernes, 25 de las mayores acciones de EE. UU. (Yahoo Finance). Valor sumado: estimación de OnFin, 2.35% de unos $76 billones."),
}
RISK = "Not investment advice. CFDs are high-risk; you may lose money."


def render():
    W = Week("heat")
    for l, t in T.items():
        W.lib("HeatCover", dict(avatar=AV, tag=t["tag"], headline=t["head"], verdictLabel=t["vl"], verdict=t["v"], tiles=tiles, bigLogo=NV, bigSym="NVDA",
              bigMove=("%.2f%%" % nv).replace(".", "," if l == "ru" else "."), bigNote=t["note"], dec="," if l == "ru" else ".", foot=t["foot"],
              hsize=56 if l == "en" else 50, gridTop=500 if l == "en" else 520), f"heat-{l}-01.png")
    W.lib("MathSlide", dict(avatar=AV, line="The numbers: *$1.8 trillion*, and Nvidia down 4.27%.", lsize=54, rows=[
        ["S&P 500, Monday close", "7,549.94 (+2.35%)"],
        ["Nasdaq Composite", "25,253.14 (+2.74%)"],
        ["Dow Jones", "52,389.75 (+2.15%)"],
        ["US market value gained at the close (estimate)", "about $%.1f trillion" % GAIN, True],
        ["Nvidia, Monday close", "$178.67 (-4.27%)"],
        ["Fell among these 25 giants", ", ".join(down)]],
        foot="Value gained: 2.35% of about $76 trillion, the US market's value at Friday's close (Siblis Research, scaled by the Wilshire 5000; OnFin estimate). In the afternoon the gain touched about $2 trillion before fading into the close.",
        source="Prices: Yahoo Finance, 9 Nov 2026", risk=RISK), "heat-en-02.png")
    W.lib("EvidenceSlide", dict(avatar=AV, bg=f"file://{M}/out/heat-en-01.png", line="Nvidia's slide wiped out about *$192 billion*.", shot=f"file://{M}/ev/s_cnn.png",
          cardPad=0, source="CNN, 9 Nov 2026"), "heat-en-03.png")
    W.save()
    for j in W.lib_jobs:
        if any(ch in json.dumps(j["props"], ensure_ascii=False) for ch in "–—!"):
            print("BAD CHAR", j["out"])
    page = f"{S}/iglib/library/render_heat.html"
    src = open(f"{S}/iglib/library/render_antspacex.html").read()
    open(page, "w").write(src.replace(f'<script src="file://{S}/antspacex/antspacex.js"></script>',
                                      f'<script src="file://{S}/spx/spx.js"></script>\n<script src="file://{M}/heat.js"></script>'))
    for batch in ([j for j in W.lib_jobs if j["name"] == "HeatCover"], [j for j in W.lib_jobs if j["name"] != "HeatCover"]):
        json.dump(batch, open(f"{M}/jobs_b.json", "w"), ensure_ascii=False)
        r = subprocess.run(["node", "render_page.js", f"{M}/jobs_b.json"], cwd=f"{S}/igtools", env={**os.environ, "LIB": f"{S}/iglib/library", "PAGE": "render_heat.html"}, capture_output=True, text=True)
        print(r.stdout[-120:], r.stderr[-600:])
    ims = [Image.open(f"{M}/out/heat-en-0{i}.png").convert("RGB") for i in (1, 2, 3)] + [Image.open(f"{M}/out/heat-{l}-01.png").convert("RGB") for l in ("ms", "ru", "es")]
    w = 360; hh = int(w * 1350 / 1080); sh = Image.new("RGB", (w * 3 + 20, hh * 2 + 10), "white")
    for i, im in enumerate(ims):
        sh.paste(im.resize((w, hh)), ((i % 3) * (w + 10), (i // 3) * (hh + 10)))
    sh.save(f"{M}/sheet.jpg", quality=88)
    print("down:", down, "gain", round(GAIN, 2))


if __name__ == "__main__":
    render()
