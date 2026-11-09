"""Fact check: '$1 trillion added to the US stock market at open' (Mon 9 Nov 2026). 3 slides EN, cover in MS, RU, ES for Telegram.
python3 spx_build.py   (refreshes S&P 500 prices first)"""
import datetime, json, os, subprocess, sys, urllib.request
sys.path.insert(0, "/tmp/claude-0/-home-user-onfin-blog/42b2fa22-784d-52c4-a9a8-6ec4971d0812/scratchpad/wk")
from common import Week, S
from PIL import Image

M = f"{S}/spx"
AV = f"file://{S}/meme/logo/avatar-bolt.jpg"
PC = 7376.86                                  # S&P 500 close, Fri 6 Nov 2026 (Yahoo Finance)
SIBLIS, W_SEP30, W_FRI = 78737.9155, 76039.046875, 73564.7578125   # US market value $bn 30 Sep 2026 (Siblis); Wilshire 5000 closes 30 Sep and 6 Nov
MV = SIBLIS * W_FRI / W_SEP30 / 1000          # US market value at Friday's close, $tn (OnFin estimate)
f = lambda t: datetime.datetime.fromtimestamp(t, datetime.timezone.utc).strftime("%H:%M")

req = urllib.request.Request("https://query1.finance.yahoo.com/v8/finance/chart/%5EGSPC?range=1d&interval=1m", headers={"User-Agent": "Mozilla/5.0"})
d = json.loads(urllib.request.urlopen(req, timeout=30).read())["chart"]["result"][0]
bars = [(f(t), c) for t, c in zip(d["timestamp"], d["indicators"]["quote"][0]["close"]) if c]
need = 1.0 / MV                                # % move worth $1 trillion
hit = next(b for b in bars if b[1] / PC - 1 >= need)
mins = int(hit[0][3:]) - 30 + (int(hit[0][:2]) - 14) * 60
last = bars[-1]
closed = last[0] >= "20:59"
mv_hit, mv_last = (hit[1] / PC - 1), (last[1] / PC - 1)
INFO = dict(mv=round(MV, 2), hit=hit, mins=mins, last=last, closed=closed, tn_hit=round(MV * mv_hit, 2), tn_last=round(MV * mv_last, 2))
json.dump(INFO, open(f"{M}/numbers.json", "w"), indent=1)
print(INFO)

C = json.load(open(f"{M}/candles.json"))
fri = [[r[0][6:], r[1], r[2], r[3], r[4]] for r in C["fri"]]
mon = [[r[0][6:], r[1], r[2], r[3], r[4]] for r in C["mon"]]
mark5 = "%s:%02d" % (hit[0][:2], int(hit[0][3:]) // 5 * 5)
pct = lambda x, dec=".": ("%+.2f%%" % (x * 100)).replace(".", dec)
T = {
 "en": dict(tag="Fact check", head="Did US stocks add *$1 trillion* at the open?", vl="Roughly right:", v="about $1 trillion in the first %d minutes" % mins,
            prev="Fri close 7,376.86", mark="$1 trillion by %s UTC" % hit[0], left="Fri 6 Nov, 19:00 UTC", right="Mon 9 Nov, from 14:30",
            foot="S&P 500, 5-minute candles (Yahoo Finance). US market value about $%.0f trillion at Friday's close: Siblis Research, scaled by the Wilshire 5000 (OnFin estimate)." % MV),
 "ms": dict(tag="Semak fakta", head="Adakah saham AS bertambah *$1 trilion* semasa dibuka?", vl="Hampir tepat:", v="kira-kira $1 trilion dalam %d minit pertama" % mins,
            prev="Tutup Jumaat 7,376.86", mark="$1 trilion pada %s UTC" % hit[0], left="Jum 6 Nov, 19:00 UTC", right="Isn 9 Nov, dari 14:30",
            foot="S&P 500, lilin 5 minit (Yahoo Finance). Nilai pasaran AS kira-kira $%.0f trilion pada harga tutup Jumaat: Siblis Research, dilaraskan dengan Wilshire 5000 (anggaran OnFin)." % MV),
 "ru": dict(tag="Проверка фактов", head="Рынок акций США прибавил *$1 трлн* на открытии?", vl="В целом верно:", v="около $1 трлн за первые %d минут" % mins,
            prev="Закрытие пт 7 376,86", mark="$1 трлн к %s UTC" % hit[0], left="Пт 6 нояб., 19:00 UTC", right="Пн 9 нояб., с 14:30",
            foot="S&P 500, 5-минутные свечи (Yahoo Finance). Капитализация рынка США около $%.0f трлн на закрытие пятницы: Siblis Research, пересчёт по Wilshire 5000 (оценка OnFin)." % MV),
 "es": dict(tag="Verificación", head="¿Las acciones de EE. UU. sumaron *$1 billón* en la apertura?", vl="Casi cierto:", v="cerca de $1 billón en los primeros %d minutos" % mins,
            prev="Cierre del viernes 7,376.86", mark="$1 billón a las %s UTC" % hit[0], left="Vie 6 nov, 19:00 UTC", right="Lun 9 nov, desde 14:30",
            foot="S&P 500, velas de 5 minutos (Yahoo Finance). Valor del mercado de EE. UU. de unos $%.0f billones al cierre del viernes: Siblis Research, ajustado con el Wilshire 5000 (estimación de OnFin)." % MV),
}
RISK = "Not investment advice. CFDs are high-risk; you may lose money."


def render():
    W = Week("spx")
    for l, t in T.items():
        W.lib("FactCover", dict(avatar=AV, tag=t["tag"], headline=t["head"], verdictLabel=t["vl"], verdict=t["v"], fri=fri, mon=mon, prevClose=PC, prevLabel=t["prev"],
              markTime=mark5, markLabel=t["mark"], leftLabel=t["left"], rightLabel=t["right"], foot=t["foot"], hsize=56 if l == "en" else 50,
              chartTop=430 if l == "en" else 450), f"spx-{l}-01.png")
    when = "At the close" if closed else "By %s UTC" % last[0]
    W.lib("MathSlide", dict(avatar=AV, line="The math: *$1 trillion* in about %d minutes." % mins, rows=[
        ["S&P 500, Friday close", "7,376.86"],
        ["%s UTC, %d minutes after the open" % (hit[0], mins), "%s (%s)" % (format(round(hit[1], 2), ",.2f"), pct(mv_hit))],
        ["US stock market value at Friday's close (estimate)", "about $%.0f trillion" % MV],
        ["%s of $%.0f trillion" % (pct(mv_hit)[1:], MV), "about $%.2f trillion" % (MV * mv_hit), True],
        ["%s (%s)" % (when, pct(mv_last)), "about $%.1f trillion" % (MV * mv_last), True]],
        foot="Value: Siblis Research, $78.7 trillion on 30 Sep 2026, scaled to 6 Nov by the Wilshire 5000. The S&P 500 move stands in for the whole market. OnFin estimate.",
        source="S&P 500 prices: Yahoo Finance, 9 Nov 2026", risk=RISK), "spx-en-02.png")
    W.lib("EvidenceSlide", dict(avatar=AV, bg=f"file://{M}/out/spx-en-01.png", line="What moved it: *oil fell 5%* on Iran peace hopes.", shot=f"file://{M}/ev/s_oil.png",
          cardPad=0, source="JournalArta, 9 Nov 2026"), "spx-en-03.png")
    W.save()
    for j in W.lib_jobs:
        if any(ch in json.dumps(j["props"], ensure_ascii=False) for ch in "–—!"):
            print("BAD CHAR", j["out"])
    page = f"{S}/iglib/library/render_spx.html"
    if not os.path.exists(page):
        open(page, "w").write(open(f"{S}/iglib/library/render_antspacex.html").read().replace(f"{S}/antspacex/antspacex.js", f"{M}/spx.js"))
    for batch in ([j for j in W.lib_jobs if j["name"] == "FactCover"], [j for j in W.lib_jobs if j["name"] != "FactCover"]):
        json.dump(batch, open(f"{M}/jobs_b.json", "w"), ensure_ascii=False)
        r = subprocess.run(["node", "render_page.js", f"{M}/jobs_b.json"], cwd=f"{S}/igtools", env={**os.environ, "LIB": f"{S}/iglib/library", "PAGE": "render_spx.html"}, capture_output=True, text=True)
        print(r.stdout[-150:], r.stderr[-600:])
    ims = [Image.open(f"{M}/out/spx-en-0{i}.png").convert("RGB") for i in (1, 2, 3)] + [Image.open(f"{M}/out/spx-{l}-01.png").convert("RGB") for l in ("ms", "ru", "es")]
    w = 360; hh = int(w * 1350 / 1080); sh = Image.new("RGB", (w * 3 + 20, hh * 2 + 10), "white")
    for i, im in enumerate(ims):
        sh.paste(im.resize((w, hh)), ((i % 3) * (w + 10), (i // 3) * (hh + 10)))
    sh.save(f"{M}/sheet.jpg", quality=88)


if __name__ == "__main__":
    render()
