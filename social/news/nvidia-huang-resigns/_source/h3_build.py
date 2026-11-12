"""BREAKING: Jensen Huang resigns as Nvidia CEO (Nvidia release, 12 Nov 2026). Single photo in EN, MS, RU, ES.
python3 h3_build.py   (refreshes the NVDA price for the badge)"""
import datetime, json, os, subprocess, sys, urllib.request
sys.path.insert(0, "/tmp/claude-0/-home-user-onfin-blog/42b2fa22-784d-52c4-a9a8-6ec4971d0812/scratchpad/wk")
from common import Week, S
from PIL import Image

M = f"{S}/huang3"
AV = f"file://{S}/meme/logo/avatar-bolt.jpg"
PH = f"file://{S}/huang/photo/huang.jpg"
CREDIT = "Photo: Anderseidesvik, CC BY-SA 4.0, Wikimedia Commons"
PREV = 173.73
req = urllib.request.Request("https://query1.finance.yahoo.com/v8/finance/chart/NVDA?range=1d&interval=1m&includePrePost=true", headers={"User-Agent": "Mozilla/5.0"})
d = json.loads(urllib.request.urlopen(req, timeout=30).read())["chart"]["result"][0]
last = [(datetime.datetime.fromtimestamp(t, datetime.timezone.utc).strftime("%H:%M"), c) for t, c in zip(d["timestamp"], d["indicators"]["quote"][0]["close"]) if c][-1]
chg = (last[1] / PREV - 1) * 100
json.dump({"time_utc": last[0], "price": round(last[1], 2), "chg": round(chg, 2)}, open(f"{M}/price.json", "w"))
print("NVDA", last, "%.2f%%" % chg)
pct = lambda dec=".": ("%.1f%%" % chg).replace(".", dec)
T = {
 "en": dict(tag="Breaking news", head="Jensen Huang resigns as Nvidia CEO *after 33 years*.",
            sub="Effective immediately. CFO Colette Kress is interim CEO. Source: Nvidia, 12 Nov 2026."),
 "ms": dict(tag="Berita terkini", head="Jensen Huang meletak jawatan sebagai CEO Nvidia *selepas 33 tahun*.",
            sub="Berkuat kuasa serta-merta. CFO Colette Kress menjadi CEO interim. Sumber: Nvidia, 12 Nov 2026."),
 "ru": dict(tag="Срочная новость", head="Дженсен Хуанг уходит с поста CEO Nvidia *спустя 33 года*.",
            sub="С немедленным вступлением в силу. Временный CEO: финансовый директор Колетт Кресс. Источник: Nvidia, 12 нояб. 2026."),
 "es": dict(tag="Última hora", head="Jensen Huang renuncia como CEO de Nvidia *tras 33 años*.",
            sub="Con efecto inmediato. La CFO Colette Kress es la CEO interina. Fuente: Nvidia, 12 nov 2026."),
}


def render():
    W = Week("huang3")
    for l, t in T.items():
        W.lib("HuangCover", dict(avatar=AV, photo=PH, pos="50% 22%", logo=f"file://{S}/huang/photo/nvlogo.svg", badge=pct("," if l == "ru" else "."),
              cx=850, cy=600, cd=200, tag=t["tag"], tagBig=True, headline=t["head"], sub=t["sub"], subsize=29, credit=CREDIT, hsize=74 if l == "en" else 62), f"h3-{l}.png")
    W.save()
    for j in W.lib_jobs:
        if any(ch in json.dumps(j["props"], ensure_ascii=False) for ch in "–—!"):
            print("BAD CHAR", j["out"])
    page = f"{S}/iglib/library/render_huang3.html"
    open(page, "w").write(open(f"{S}/iglib/library/render_antspacex.html").read().replace(f"{S}/antspacex/antspacex.js", f"{M}/huang3.js"))
    r = subprocess.run(["node", "render_page.js", f"{M}/lib_jobs.json"], cwd=f"{S}/igtools", env={**os.environ, "LIB": f"{S}/iglib/library", "PAGE": "render_huang3.html"}, capture_output=True, text=True)
    print(r.stdout[-120:], r.stderr[-600:])
    ims = [Image.open(f"{M}/out/h3-{l}.png").convert("RGB") for l in ("en", "ms", "ru", "es")]
    w = 400; hh = int(w * 1350 / 1080); sh = Image.new("RGB", (w * 4 + 30, hh), "white")
    for i, x in enumerate(ims):
        sh.paste(x.resize((w, hh)), (i * (w + 10), 0))
    sh.save(f"{M}/sheet.jpg", quality=88)


if __name__ == "__main__":
    render()
