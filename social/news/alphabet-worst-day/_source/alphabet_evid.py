"""Alphabet worst day (29 Oct 2026), evidence-led carousel in EN, MS, RU, ES. python3 alphabet_evid.py"""
import json, os, subprocess
from common import Week, S

E = lambda f: f"file://{S}/evid/{f}"
AV = f"file://{S}/meme/logo/avatar-bolt.jpg"
BG = f"file://{S}/social2/photos/googleplex.jpg"
d = json.load(open(f"{S}/evid/googl_d.json"))["chart"]["result"][0]
closes = [round(c, 2) for c in d["indicators"]["quote"][0]["close"] if c]
CREDIT = "Photo: Asoundd, CC BY-SA 4.0, Wikimedia Commons"
T = {
 "en": dict(tag="Market news", head="Google's parent just had its *worst day* since 2004.", l2="*$500 billion* wiped out in one day.",
            l3="From $324.89 to *$283.82* in one session.", chg="-12.64%", sub="Daily close, last month", fr="$324.89", to="$283.82", sl="30 Sep", el="29 Oct", data="Data: Yahoo Finance",
            l4="Profit came in *far below* forecasts.", l5="Wall Street's verdict on *Google search*:", l6="The bright spot: *Cloud grew 103%*.",
            q="Would you hold a stock *through earnings?*", follow="Follow @onfinkm for daily market stories.", nbc="NBC News, 29 Oct 2026", yf="Yahoo Finance, 29 Oct 2026",
            risk="Not investment advice. CFDs are high-risk; you may lose money."),
 "ms": dict(tag="Berita pasaran", head="Syarikat induk Google alami *hari terburuk* sejak 2004.", l2="*$500 bilion* lenyap dalam sehari.",
            l3="Dari $324.89 ke *$283.82* dalam satu sesi.", chg="-12.64%", sub="Harga tutup harian, sebulan lepas", fr="$324.89", to="$283.82", sl="30 Sep", el="29 Okt", data="Data: Yahoo Finance",
            l4="Keuntungan *jauh di bawah* jangkaan.", l5="Pandangan Wall Street tentang *carian Google*:", l6="Titik cerah: *Cloud naik 103%*.",
            q="Adakah anda akan memegang saham *melalui laporan pendapatan?*", follow="Ikuti @onfinkm untuk berita pasaran harian.", nbc="NBC News, 29 Okt 2026", yf="Yahoo Finance, 29 Okt 2026",
            risk="Bukan nasihat pelaburan. CFD berisiko tinggi; anda mungkin kehilangan wang."),
 "ru": dict(tag="Новости рынка", head="У материнской компании Google *худший день* с 2004 года.", l2="*$500 млрд* испарились за один день.",
            l3="С $324,89 до *$283,82* за одну сессию.", chg="-12,64%", sub="Цена закрытия, последний месяц", fr="$324,89", to="$283,82", sl="30 сен", el="29 окт", data="Данные: Yahoo Finance",
            l4="Прибыль оказалась *намного ниже* прогнозов.", l5="Вердикт Уолл-стрит по *поиску Google*:", l6="Светлое пятно: *Cloud вырос на 103%*.",
            q="Вы бы держали акцию *во время отчётности?*", follow="Подписывайтесь на @onfinkm: новости рынков каждый день.", nbc="NBC News, 29 окт. 2026", yf="Yahoo Finance, 29 окт. 2026",
            risk="Не является инвестиционной рекомендацией. CFD относятся к высокорисковым инструментам; вы можете потерять деньги."),
 "es": dict(tag="Noticias del mercado", head="La matriz de Google tuvo su *peor día* desde 2004.", l2="*$500,000 millones* esfumados en un día.",
            l3="De $324.89 a *$283.82* en una sesión.", chg="-12.64%", sub="Cierre diario, último mes", fr="$324.89", to="$283.82", sl="30 sep", el="29 oct", data="Datos: Yahoo Finance",
            l4="Las ganancias quedaron *muy por debajo* de lo previsto.", l5="El veredicto de Wall Street sobre *la búsqueda de Google*:", l6="El punto positivo: *Cloud creció 103%*.",
            q="¿Mantendrías una acción *durante los resultados?*", follow="Sigue a @onfinkm para noticias del mercado cada día.", nbc="NBC News, 29 oct 2026", yf="Yahoo Finance, 29 oct 2026",
            risk="No es asesoramiento de inversión. Los CFD son de alto riesgo; puedes perder dinero."),
}
W = Week("alphabet_evid")
for l, t in T.items():
    c = dict(avatar=AV, bg=BG, bgpos="40% 50%")
    W.lib("SocialCover", dict(avatar=AV, photo=BG, pos="40% 50%", logo=E("glogo.svg"), badge=t["chg"][:-1] if False else ("-12,6%" if l == "ru" else "-12.6%"), cy=600, cd=400,
          tag=t["tag"], headline=t["head"], credit=CREDIT, hsize=80 if l in ("ru", "ms") else 86), f"alpha-{l}-01.png")
    W.lib("EvidenceSlide", dict(c, line=t["l2"], shot=E("ev_nbc_head.png"), cardPad=0, source=t["nbc"]), f"alpha-{l}-02.png")
    W.lib("ChartSlide", dict(c, line=t["l3"], closes=closes, symbol="GOOGL", change=t["chg"], sub=t["sub"], fromLabel=t["fr"], toLabel=t["to"],
          startLabel=t["sl"], endLabel=t["el"], source=t["data"]), f"alpha-{l}-03.png")
    W.lib("EvidenceSlide", dict(c, line=t["l4"], shot=E("s_eps.png"), source=t["yf"]), f"alpha-{l}-04.png")
    W.lib("EvidenceSlide", dict(c, line=t["l5"], shot=E("s_jpm.png"), source=t["nbc"]), f"alpha-{l}-05.png")
    W.lib("EvidenceSlide", dict(c, line=t["l6"], shot=E("s_cloud.png"), source=t["yf"]), f"alpha-{l}-06.png")
    W.lib("SocialSlide", dict(avatar=AV, photo=BG, pos="40% 50%", top=0.5, dark=0.92, line=t["q"], sub=t["follow"], risk=t["risk"], lsize=60 if l != "en" else 64), f"alpha-{l}-07.png")
W.save()
for j in W.lib_jobs:
    txt = json.dumps(j["props"], ensure_ascii=False)
    if any(ch in txt for ch in "–—!"):
        print("BAD CHAR", j["out"])
r = subprocess.run(["node", "render_page.js", f"{S}/{W.name}/lib_jobs.json"], cwd=f"{S}/igtools",
                   env={**os.environ, "LIB": f"{S}/iglib/library", "PAGE": "render_ft.html"}, capture_output=True, text=True)
print(r.stdout[-200:], r.stderr[-600:])
