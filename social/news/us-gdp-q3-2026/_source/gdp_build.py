"""US GDP Q3 2026 advance estimate (29 Oct 2026), evidence-led carousel in EN, MS, RU, ES. python3 gdp_build.py"""
import json, os, subprocess, sys
sys.path.insert(0, "/tmp/claude-0/-home-user-onfin-blog/42b2fa22-784d-52c4-a9a8-6ec4971d0812/scratchpad/wk")
from common import Week, S

G = lambda f: f"file://{S}/gdp/{f}"
AV = f"file://{S}/meme/logo/avatar-bolt.jpg"
BG = G("cover.jpg")
CREDIT = "Photo: Architect of the Capitol, public domain, Wikimedia Commons"
T = {
 "en": dict(ql=["Q2 25","Q3 25","Q4 25","Q1 26","Q2 26","Q3 26"], bt="US real GDP growth", bs="Quarterly change, annual rate", bd="Data: BEA, 29 Oct 2026", tag="Economy", head="The US economy just *sped up* to 3.4%.", badge="+3.4%",
            l2="Official: *3.4%* growth in Q3.", l3="The fastest pace *in a year*.", l4="*Better* than economists expected.",
            l5="Who did the work: *shoppers and investment*.", l6="The AI build-out: *equipment +37.4%*.",
            q="Does faster growth *change your view on rates?*", follow="Follow @onfinkm for daily market stories.",
            bea="BEA, 29 Oct 2026", yf="Yahoo Finance, 29 Oct 2026", ap="AP, 29 Oct 2026",
            risk="Not investment advice. CFDs are high-risk; you may lose money."),
 "ms": dict(ql=["S2 25","S3 25","S4 25","S1 26","S2 26","S3 26"], bt="Pertumbuhan KDNK benar AS", bs="Perubahan suku tahunan, kadar tahunan", bd="Data: BEA, 29 Okt 2026", tag="Ekonomi", head="Ekonomi AS baru *memecut* ke 3.4%.", badge="+3.4%",
            l2="Rasmi: pertumbuhan *3.4%* pada S3.", l3="Kadar terpantas *dalam setahun*.", l4="*Lebih baik* daripada jangkaan ahli ekonomi.",
            l5="Siapa pendorongnya: *pengguna dan pelaburan*.", l6="Pembinaan AI: *peralatan +37.4%*.",
            q="Adakah pertumbuhan pantas *mengubah pandangan anda tentang kadar?*", follow="Ikuti @onfinkm untuk berita pasaran harian.",
            bea="BEA, 29 Okt 2026", yf="Yahoo Finance, 29 Okt 2026", ap="AP, 29 Okt 2026",
            risk="Bukan nasihat pelaburan. CFD berisiko tinggi; anda mungkin kehilangan wang."),
 "ru": dict(ql=["II 25","III 25","IV 25","I 26","II 26","III 26"], bt="Рост реального ВВП США", bs="Квартальное изменение, в годовом выражении", bd="Данные: BEA, 29 окт. 2026", tag="Экономика", head="Экономика США *ускорилась* до 3,4%.", badge="+3,4%",
            l2="Официально: рост *3,4%* в III квартале.", l3="Самый быстрый темп *за год*.", l4="*Лучше*, чем ждали экономисты.",
            l5="Кто тянул рост: *потребители и инвестиции*.", l6="Стройка под ИИ: *оборудование +37,4%*.",
            q="Меняет ли быстрый рост *ваш взгляд на ставки?*", follow="Подписывайтесь на @onfinkm: новости рынков каждый день.",
            bea="BEA, 29 окт. 2026", yf="Yahoo Finance, 29 окт. 2026", ap="AP, 29 окт. 2026",
            risk="Не является инвестиционной рекомендацией. CFD относятся к высокорисковым инструментам; вы можете потерять деньги."),
 "es": dict(ql=["2T 25","3T 25","4T 25","1T 26","2T 26","3T 26"], bt="Crecimiento del PIB real de EE.\u00a0UU.", bs="Cambio trimestral, tasa anual", bd="Datos: BEA, 29 oct 2026", tag="Economía", head="La economía de EE.\u00a0UU. *se aceleró* al 3.4%.", badge="+3.4%",
            l2="Oficial: crecimiento de *3.4%* en el 3T.", l3="El ritmo más rápido *en un año*.", l4="*Mejor* de lo que esperaban los economistas.",
            l5="Quién lo impulsó: *consumo e inversión*.", l6="La apuesta por la IA: *equipos +37.4%*.",
            q="¿El crecimiento más rápido *cambia tu visión sobre las tasas?*", follow="Sigue a @onfinkm para noticias del mercado cada día.",
            bea="BEA, 29 oct 2026", yf="Yahoo Finance, 29 oct 2026", ap="AP, 29 oct 2026",
            risk="No es asesoramiento de inversión. Los CFD son de alto riesgo; puedes perder dinero."),
}
W = Week("gdp")
for l, t in T.items():
    c = dict(avatar=AV, bg=BG, bgpos="60% 40%")
    W.lib("CoverX", dict(avatar=AV, photo=BG, logo=G("flag.svg"), logoFill=True, logoPos="0% 0%", badge=t["badge"], cx="50%", cy=500, cd=340,
          ring="var(--accent)", badgeBg="var(--accent)", badgeColor="#0b0b0b", tag=t["tag"], headline=t["head"], credit=CREDIT,
          hsize=80 if l in ("ru", "ms", "es") else 86), f"gdp-{l}-01.png")
    W.lib("EvidenceSlide", dict(c, line=t["l2"], shot=G("s_bea.png"), source=t["bea"]), f"gdp-{l}-02.png")
    vals = [4.0, 3.9, 0.2, 2.5, 2.2, 3.4]
    fmt = [("%.1f%%" % v).replace(".", ",") if l == "ru" else "%.1f%%" % v for v in vals]
    W.lib("BarSlide", dict(c, line=t["l3"], values=vals, fmt=fmt, labels=t["ql"], title=t["bt"], sub=t["bs"], source=t["bd"]), f"gdp-{l}-03.png")
    W.lib("EvidenceSlide", dict(c, line=t["l4"], shot=G("s_yf_beat.png"), source=t["yf"]), f"gdp-{l}-04.png")
    W.lib("EvidenceSlide", dict(c, line=t["l5"], shot=G("s_ap_cons.png"), source=t["ap"]), f"gdp-{l}-05.png")
    W.lib("EvidenceSlide", dict(c, line=t["l6"], shot=G("s_ap_ai.png"), source=t["ap"]), f"gdp-{l}-06.png")
    W.lib("SocialSlide", dict(avatar=AV, photo=BG, pos="60% 50%", top=0.5, dark=0.92, line=t["q"], sub=t["follow"], risk=t["risk"], lsize=60 if l != "en" else 64), f"gdp-{l}-07.png")
W.save()
for j in W.lib_jobs:
    txt = json.dumps(j["props"], ensure_ascii=False)
    if any(ch in txt for ch in "–—!"):
        print("BAD CHAR", j["out"])
r = subprocess.run(["node", "render_page.js", f"{S}/{W.name}/lib_jobs.json"], cwd=f"{S}/igtools",
                   env={**os.environ, "LIB": f"{S}/iglib/library", "PAGE": "render_gdpnv.html"}, capture_output=True, text=True)
print(r.stdout[-200:], r.stderr[-600:])
