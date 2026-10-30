"""Nvidia staff wealth fact check (30 Oct 2026), evidence-led carousel in EN, MS, RU, ES. python3 nvda_build.py"""
import json, os, subprocess, sys, datetime
sys.path.insert(0, "/tmp/claude-0/-home-user-onfin-blog/42b2fa22-784d-52c4-a9a8-6ec4971d0812/scratchpad/wk")
from common import Week, S

N = lambda f: f"file://{S}/nvda/{f}"
AV = f"file://{S}/meme/logo/avatar-bolt.jpg"
BG = N("cover.jpg")
CREDIT = "Photo: Office of the President (Taiwan), CC BY 2.0, Wikimedia Commons"
d = json.load(open(f"{S}/nvda/nvda.json"))["chart"]["result"][0]
rows = [(datetime.datetime.fromtimestamp(t, datetime.UTC).strftime("%Y-%m-%d"), c) for t, c in zip(d["timestamp"], d["indicators"]["quote"][0]["close"]) if c]
closes = [round(c, 2) for day, c in rows if "2026-09-01" <= day <= "2026-10-29"]
assert max(closes) == 239.24 and closes[-1] == 213.66, (max(closes), closes[-1])
T = {
 "en": dict(tag="Fact check", head="Are half of Nvidia's staff really *worth $25M?*", l2="The claim went viral in *August 2025*.",
            l3="Its source: a June 2025 poll of *3,000 staff*.", l4="Jensen Huang's *own words*:", l5="That wealth is mostly stock: *-10.7%* since 6 Oct.",
            chg="-10.7%", sub="Daily close, since 1 Sep", pk="Record $239.24", la="$213.66", sl="1 Sep", el="29 Oct", data="Data: Yahoo Finance",
            src="Benzinga via Yahoo Finance, 5 Aug 2025", q="Would you keep most of your wealth in *one stock?*", follow="Follow @onfinkm for daily market stories.",
            risk="Not investment advice. CFDs are high-risk; you may lose money."),
 "ms": dict(tag="Semakan fakta", head="Benarkah separuh staf Nvidia *bernilai $25 juta?*", l2="Dakwaan ini tular pada *Ogos 2025*.",
            l3="Sumbernya: tinjauan Jun 2025 terhadap *3,000 staf*.", l4="Kata-kata *Jensen Huang sendiri*:", l5="Kekayaan itu kebanyakannya saham: *-10.7%* sejak 6 Okt.",
            chg="-10.7%", sub="Harga tutup harian, sejak 1 Sep", pk="Rekod $239.24", la="$213.66", sl="1 Sep", el="29 Okt", data="Data: Yahoo Finance",
            src="Benzinga melalui Yahoo Finance, 5 Ogos 2025", q="Adakah anda akan menyimpan kebanyakan kekayaan dalam *satu saham?*", follow="Ikuti @onfinkm untuk berita pasaran harian.",
            risk="Bukan nasihat pelaburan. CFD berisiko tinggi; anda mungkin kehilangan wang."),
 "ru": dict(tag="Проверка фактов", head="Правда ли, что половина сотрудников Nvidia *стоит $25 млн?*", l2="Это утверждение разошлось в *августе 2025 года*.",
            l3="Источник: опрос *3000 сотрудников* в июне 2025 года.", l4="Слова *самого Дженсена Хуанга*:", l5="Это богатство в основном в акциях: *-10,7%* с 6 октября.",
            chg="-10,7%", sub="Цена закрытия, с 1 сентября", pk="Рекорд $239,24", la="$213,66", sl="1 сен", el="29 окт", data="Данные: Yahoo Finance",
            src="Benzinga через Yahoo Finance, 5 авг. 2025", q="Вы бы держали большую часть капитала *в одной акции?*", follow="Подписывайтесь на @onfinkm: новости рынков каждый день.",
            risk="Не является инвестиционной рекомендацией. CFD относятся к высокорисковым инструментам; вы можете потерять деньги."),
 "es": dict(tag="Verificación", head="¿De verdad la mitad del personal de Nvidia *vale $25 millones?*", l2="La afirmación se hizo viral en *agosto de 2025*.",
            l3="Su fuente: una encuesta de junio de 2025 a *3,000 empleados*.", l4="Las *palabras de Jensen Huang*:", l5="Esa riqueza es sobre todo acciones: *-10.7%* desde el 6 oct.",
            chg="-10.7%", sub="Cierre diario, desde el 1 sep", pk="Récord $239.24", la="$213.66", sl="1 sep", el="29 oct", data="Datos: Yahoo Finance",
            src="Benzinga vía Yahoo Finance, 5 ago 2025", q="¿Guardarías la mayor parte de tu patrimonio en *una sola acción?*", follow="Sigue a @onfinkm para noticias del mercado cada día.",
            risk="No es asesoramiento de inversión. Los CFD son de alto riesgo; puedes perder dinero."),
}
W = Week("nvda")
for l, t in T.items():
    c = dict(avatar=AV, bg=BG, bgpos="30% 30%")
    W.lib("CoverX", dict(avatar=AV, photo=BG, pos="30% 0%", logo=N("nvlogo_white.svg"), circleBg="#76b900", badge="$25M?", badgeBg="#fff", badgeColor="#111", badgeRight=-40,
          cx=820, cy=430, cd=300, ring="rgba(255,255,255,0.9)", tag=t["tag"], headline=t["head"], credit=CREDIT,
          hsize=72 if l in ("ru", "es") else (78 if l == "ms" else 84)), f"nvda-{l}-01.png")
    W.lib("EvidenceSlide", dict(c, line=t["l2"], shot=N("s_claim.png"), source=t["src"]), f"nvda-{l}-02.png")
    W.lib("EvidenceSlide", dict(c, line=t["l3"], shot=N("s_survey.png"), source=t["src"]), f"nvda-{l}-03.png")
    W.lib("EvidenceSlide", dict(c, line=t["l4"], shot=N("s_huang.png"), source=t["src"]), f"nvda-{l}-04.png")
    W.lib("PeakChartSlide", dict(c, line=t["l5"], closes=closes, symbol="NVDA", change=t["chg"], sub=t["sub"], peakLabel=t["pk"], lastLabel=t["la"],
          startLabel=t["sl"], endLabel=t["el"], source=t["data"], lsize=56 if l != "en" else 60), f"nvda-{l}-05.png")
    W.lib("SocialSlide", dict(avatar=AV, photo=BG, pos="30% 0%", top=0.5, dark=0.94, line=t["q"], sub=t["follow"], risk=t["risk"], lsize=60 if l != "en" else 64), f"nvda-{l}-06.png")
W.save()
for j in W.lib_jobs:
    txt = json.dumps(j["props"], ensure_ascii=False)
    if any(ch in txt for ch in "–—!"):
        print("BAD CHAR", j["out"])
r = subprocess.run(["node", "render_page.js", f"{S}/{W.name}/lib_jobs.json"], cwd=f"{S}/igtools",
                   env={**os.environ, "LIB": f"{S}/iglib/library", "PAGE": "render_gdpnv.html"}, capture_output=True, text=True)
print(r.stdout[-200:], r.stderr[-600:])
