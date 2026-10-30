"""Moderna leaked melanoma data (22 Oct 2026): evidence-led carousel in EN, MS, RU, ES with one video slide.
python3 moderna_build.py [render|video|all]"""
import json, os, subprocess, sys
sys.path.insert(0, "/tmp/claude-0/-home-user-onfin-blog/42b2fa22-784d-52c4-a9a8-6ec4971d0812/scratchpad/wk")
from common import Week, S

M = f"{S}/moderna"
E = lambda f: f"file://{M}/ev/{f}"
AV = f"file://{S}/meme/logo/avatar-bolt.jpg"
BG = f"file://{M}/photos/hq_1920.jpg"
CREDIT = "Photo: Ajay Suresh, CC BY 4.0, Wikimedia Commons"
d = json.load(open(f"{M}/mrna_d.json"))["chart"]["result"][0]
closes = [round(c, 2) for c in d["indicators"]["quote"][0]["close"] if c][:-5]  # 24 Aug to 22 Oct
assert closes[-1] == 202.63 and closes[-2] == 245.81, closes[-3:]

T = {
 "en": dict(tag="Market news", head="Leaked vaccine data sent Moderna *down 17.6%*.", badge="-17.6%",
            l2="The results *leaked on X* two days early.", l3="The vaccine cut the risk by *42%*.",
            l4="In August, a surgeon hoped for *40 to 50%*.", l5="And the stock had *nearly quadrupled*.",
            l6="From $245.81 to *$202.63* in one session.", chg="-17.57%", sub="Daily close, last two months", fr="$245.81", to="$202.63", sl="24 Aug", el="22 Oct", data="Data: Yahoo Finance",
            l7="Its *biggest intraday drop* on record.",
            q="Would you hold a stock *into big trial results?*", follow="Follow @onfinkm for daily market stories.",
            s_bbg="Bloomberg via Yahoo Finance, 22 Oct 2026", s_pr="Merck and Moderna release, 22 Oct 2026", s_abc="ABC News Live, 20 Aug 2026", s_yf="Yahoo Finance, 23 Oct 2026",
            risk="Not investment advice. CFDs are high-risk; you may lose money."),
 "ms": dict(tag="Berita pasaran", head="Data vaksin yang bocor menjatuhkan Moderna *17.6%*.", badge="-17.6%",
            l2="Keputusan *bocor di X* dua hari lebih awal.", l3="Vaksin itu mengurangkan risiko sebanyak *42%*.",
            l4="Pada Ogos, seorang pakar bedah berharap *40 hingga 50%*.", l5="Dan saham itu sudah *hampir empat kali ganda*.",
            l6="Dari $245.81 ke *$202.63* dalam satu sesi.", chg="-17.57%", sub="Harga tutup harian, dua bulan lepas", fr="$245.81", to="$202.63", sl="24 Ogo", el="22 Okt", data="Data: Yahoo Finance",
            l7="*Kejatuhan intrahari terbesar* dalam sejarahnya.",
            q="Adakah anda akan memegang saham *menjelang keputusan ujian besar?*", follow="Ikuti @onfinkm untuk berita pasaran harian.",
            s_bbg="Bloomberg melalui Yahoo Finance, 22 Okt 2026", s_pr="Kenyataan Merck dan Moderna, 22 Okt 2026", s_abc="ABC News Live, 20 Ogo 2026", s_yf="Yahoo Finance, 23 Okt 2026",
            risk="Bukan nasihat pelaburan. CFD berisiko tinggi; anda mungkin kehilangan wang."),
 "ru": dict(tag="Новости рынка", head="Утечка данных о вакцине обрушила Moderna на *17,6%*.", badge="-17,6%",
            l2="Результаты *утекли в X* за два дня до презентации.", l3="Вакцина снизила риск на *42%*.",
            l4="В августе хирург надеялся *на 40-50%*.", l5="А акция до этого выросла *почти вчетверо*.",
            l6="С $245,81 до *$202,63* за одну сессию.", chg="-17,57%", sub="Цена закрытия, последние два месяца", fr="$245,81", to="$202,63", sl="24 авг", el="22 окт", data="Данные: Yahoo Finance",
            l7="*Крупнейшее внутридневное падение* в истории акции.",
            q="Вы бы держали акцию *перед важными данными испытаний?*", follow="Подписывайтесь на @onfinkm: новости рынков каждый день.",
            s_bbg="Bloomberg на Yahoo Finance, 22 окт. 2026", s_pr="Пресс-релиз Merck и Moderna, 22 окт. 2026", s_abc="ABC News Live, 20 авг. 2026", s_yf="Yahoo Finance, 23 окт. 2026",
            risk="Не является инвестиционной рекомендацией. CFD относятся к высокорисковым инструментам; вы можете потерять деньги."),
 "es": dict(tag="Noticias del mercado", head="La filtración de datos de su vacuna hundió a Moderna *17.6%*.", badge="-17.6%",
            l2="Los resultados *se filtraron en X* dos días antes.", l3="La vacuna redujo el riesgo un *42%*.",
            l4="En agosto, un cirujano esperaba *entre 40 y 50%*.", l5="Y la acción casi se había *cuadruplicado*.",
            l6="De $245.81 a *$202.63* en una sesión.", chg="-17.57%", sub="Cierre diario, últimos dos meses", fr="$245.81", to="$202.63", sl="24 ago", el="22 oct", data="Datos: Yahoo Finance",
            l7="Su *mayor caída intradía* registrada.",
            q="¿Mantendrías una acción *antes de grandes resultados clínicos?*", follow="Sigue a @onfinkm para noticias del mercado cada día.",
            s_bbg="Bloomberg vía Yahoo Finance, 22 oct 2026", s_pr="Comunicado de Merck y Moderna, 22 oct 2026", s_abc="ABC News Live, 20 ago 2026", s_yf="Yahoo Finance, 23 oct 2026",
            risk="No es asesoramiento de inversión. Los CFD son de alto riesgo; puedes perder dinero."),
}


def render():
    W = Week("moderna")
    for l, t in T.items():
        c = dict(avatar=AV, bg=BG, bgpos="61% 50%")
        W.lib("SocialCover", dict(avatar=AV, photo=BG, pos="61% 50%", logo=E("../photos/moderna_logo.png"), badge=t["badge"], cy=690, cd=360,
              tag=t["tag"], headline=t["head"], credit=CREDIT, hsize=78 if l in ("ru", "ms", "es") else 86), f"mod-{l}-01.png")
        W.lib("EvidenceSlide", dict(c, line=t["l2"], shot=E("s_leak.png"), source=t["s_bbg"]), f"mod-{l}-02.png")
        W.lib("EvidenceSlide", dict(c, line=t["l3"], shot=E("s_merck.png"), source=t["s_pr"]), f"mod-{l}-03.png")
        for ph in ("magenta", "black"):  # video slide frame: magenta finds the card, black is the overlay
            W.lib("EvidenceSlide", dict(c, line=t["l4"], shot=E(f"ph_{ph}.png"), cardPad=0, source=t["s_abc"]), f"vframe-{l}-{ph}.png")
        W.lib("EvidenceSlide", dict(c, line=t["l5"], shot=E("s_exp.png"), source=t["s_yf"]), f"mod-{l}-05.png")
        W.lib("ChartSlide", dict(c, line=t["l6"], closes=closes, symbol="MRNA", change=t["chg"], sub=t["sub"], fromLabel=t["fr"], toLabel=t["to"],
              startLabel=t["sl"], endLabel=t["el"], source=t["data"]), f"mod-{l}-06.png")
        W.lib("EvidenceSlide", dict(c, line=t["l7"], shot=E("s_record.png"), source=t["s_yf"]), f"mod-{l}-07.png")
        W.lib("SocialSlide", dict(avatar=AV, photo=BG, pos="61% 50%", top=0.5, dark=0.92, line=t["q"], sub=t["follow"], risk=t["risk"], lsize=60 if l != "en" else 64), f"mod-{l}-08.png")
    W.save()
    for j in W.lib_jobs:
        if any(ch in json.dumps(j["props"], ensure_ascii=False) for ch in "–—!"):
            print("BAD CHAR", j["out"])
    r = subprocess.run(["node", "render_page.js", f"{M}/lib_jobs.json"], cwd=f"{S}/igtools",
                       env={**os.environ, "LIB": f"{S}/iglib/library", "PAGE": "render_ft.html"}, capture_output=True, text=True)
    print(r.stdout[-200:], r.stderr[-600:])


if __name__ == "__main__":
    what = sys.argv[1] if len(sys.argv) > 1 else "all"
    if what in ("render", "all"):
        render()
