"""Crypto liquidation flush, Sunday 8 Nov 2026 21:40 to 21:55 UTC: 3-slide carousel (EN) plus the chart cover in MS, RU, ES.
python3 liq_build.py"""
import datetime, json, os, subprocess, sys
sys.path.insert(0, "/tmp/claude-0/-home-user-onfin-blog/42b2fa22-784d-52c4-a9a8-6ec4971d0812/scratchpad/wk")
from common import Week, S
from PIL import Image

M = f"{S}/liq"
AV = f"file://{S}/meme/logo/avatar-bolt.jpg"
f = lambda r: datetime.datetime.fromtimestamp(r[0] / 1000, datetime.timezone.utc).strftime("%H:%M")


def candles(sym):  # Binance 1-minute candles, 21:00 to 21:57 UTC on 8 Nov 2026
    k = json.load(open(f"{M}/dl/{sym}_1m.json"))
    return [[float(r[1]), float(r[2]), float(r[3]), float(r[4])] for r in k if "21:00" <= f(r) <= "21:57"]


SPEC = {"BTC": dict(tick=500, dp=0), "ETH": dict(tick=25, dp=0), "XRP": dict(tick=0.01, dp=2), "SOL": dict(tick=1, dp=0)}
MOVE = {"en": {"BTC": "-2.9%", "ETH": "-7.5%", "XRP": "-4.7%", "SOL": "-4.6%"}}
MOVE["ms"] = MOVE["es"] = MOVE["en"]
MOVE["ru"] = {k: v.replace(".", ",") for k, v in MOVE["en"].items()}
LOW = {"en": {"BTC": "$73,510", "ETH": "$2,060", "XRP": "$1.093", "SOL": "$85.02"}}
LOW["ms"] = LOW["es"] = LOW["en"]
LOW["ru"] = {"BTC": "$73 510", "ETH": "$2060", "XRP": "$1,093", "SOL": "$85,02"}
T = {
 "en": dict(tag="Crypto news", head="More than *$1 billion* of crypto positions liquidated in 24 hours.", low="Low",
            foot="1-minute candles, Binance, 8 Nov 2026, 21:00 to 21:57 UTC (04:00 to 04:57 Cambodia time, 9 Nov). Moves are from the 21:40 high to the 21:55 low."),
 "ms": dict(tag="Berita kripto", head="Lebih *$1 bilion* posisi kripto dilikuidasi dalam 24 jam.", low="Terendah",
            foot="Lilin 1 minit, Binance, 8 Nov 2026, 21:00 hingga 21:57 UTC (05:00 hingga 05:57 waktu Malaysia, 9 Nov). Pergerakan dari paras tertinggi 21:40 ke paras terendah 21:55."),
 "ru": dict(tag="Крипторынок", head="За сутки ликвидировано более *$1 млрд* криптопозиций.", low="Минимум",
            foot="Минутные свечи Binance, 8 нояб. 2026, с 21:00 до 21:57 UTC (с 00:00 до 00:57 мск, 9 нояб.). Движение от максимума в 21:40 до минимума в 21:55."),
 "es": dict(tag="Cripto", head="Más de *$1,000 millones* en posiciones cripto liquidadas en 24 horas.", low="Mínimo",
            foot="Velas de 1 minuto, Binance, 8 nov 2026, de 21:00 a 21:57 UTC (16:00 a 16:57 en Bogotá). Movimiento del máximo de las 21:40 al mínimo de las 21:55."),
}
RISK = "Not investment advice. Crypto and CFDs are high-risk; you may lose money."


def render():
    W = Week("liq")
    for l, t in T.items():
        panels = [dict(sym=s + "/USDT", c=candles(s), move=MOVE[l][s], low=t["low"] + " " + LOW[l][s], loc="ru-RU" if l == "ru" else "en-US", **SPEC[s]) for s in ("BTC", "ETH", "XRP", "SOL")]
        W.lib("LiqCover", dict(avatar=AV, tag=t["tag"], headline=t["head"], panels=panels, foot=t["foot"], hsize=62 if l == "en" else 58), f"liq-{l}-01.png")
    W.lib("EvidenceSlide", dict(avatar=AV, bg=f"file://{M}/out/liq-en-01.png", line="Most of it was traders *betting on a rise*.", shot=f"file://{M}/ev/s_cg.png",
          cardPad=0, source="crypto.news, citing CoinGlass, 9 Nov 2026"), "liq-en-02.png")
    W.lib("LiqTable", dict(avatar=AV, line="A bounce since, but *not a full recovery*.", cols=["", "21:40 UTC", "Low", "Now"],
          rows=[["BTC", "$75,728", "$73,510", "$74,213"], ["ETH", "$2,226", "$2,060", "$2,110"], ["XRP", "$1.146", "$1.093", "$1.096"], ["SOL", "$89.10", "$85.02", "$86.45"]],
          foot="Binance, USDT pairs, 8 Nov 2026. Now: 9 Nov, 08:28 UTC.", q="Would your stop loss have survived *that candle?*",
          follow="Follow @onfinkm for daily market stories.", risk=RISK), "liq-en-03.png")
    W.save()
    for j in W.lib_jobs:
        if any(ch in json.dumps(j["props"], ensure_ascii=False) for ch in "–—!"):
            print("BAD CHAR", j["out"])
    page = f"{S}/iglib/library/render_liq.html"
    if not os.path.exists(page):
        src = open(f"{S}/iglib/library/render_antspacex.html").read()
        open(page, "w").write(src.replace(f"{S}/antspacex/antspacex.js", f"{M}/liq.js"))
    # cover first (slide 2 blurs it as background), then the rest
    jobs = W.lib_jobs
    for batch in ([j for j in jobs if j["name"] == "LiqCover"], [j for j in jobs if j["name"] != "LiqCover"]):
        json.dump(batch, open(f"{M}/jobs_b.json", "w"), ensure_ascii=False)
        r = subprocess.run(["node", "render_page.js", f"{M}/jobs_b.json"], cwd=f"{S}/igtools",
                           env={**os.environ, "LIB": f"{S}/iglib/library", "PAGE": "render_liq.html"}, capture_output=True, text=True)
        print(r.stdout[-200:], r.stderr[-600:])


def sheet():
    ims = [Image.open(f"{M}/out/liq-en-{i:02d}.png").convert("RGB") for i in (1, 2, 3)] + [Image.open(f"{M}/out/liq-{l}-01.png").convert("RGB") for l in ("ms", "ru", "es")]
    w = 360; hh = int(w * 1350 / 1080)
    sh = Image.new("RGB", (w * 3 + 20, hh * 2 + 10), "white")
    for i, im in enumerate(ims):
        sh.paste(im.resize((w, hh)), ((i % 3) * (w + 10), (i // 3) * (hh + 10)))
    sh.save(f"{M}/sheet.jpg", quality=88)


if __name__ == "__main__":
    render()
    sheet()
