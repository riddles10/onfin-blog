"""Thailand Supreme Court: bitcoin is property (Judgment 4929/2569, 28 Oct 2026), evidence-led carousel in EN, MS, RU, ES."""
import json, os, subprocess, sys
S = "/tmp/claude-0/-home-user-onfin-blog/42b2fa22-784d-52c4-a9a8-6ec4971d0812/scratchpad"
sys.path.insert(0, f"{S}/wk")
from common import Week

E = lambda f: f"file://{S}/thbtc/ev/{f}"
AV = f"file://{S}/meme/logo/avatar-bolt.jpg"
BG = f"file://{S}/thbtc/ph/court.jpg"
CREDIT = "Photo: Chainwit, CC BY-SA 4.0, Wikimedia Commons"
T = {
 "en": dict(tag="Crypto news", head="Thailand's top court: *Bitcoin is property*.", badge="Property",
            l2="Thai headline, 28 Oct: *Bitcoin is property*.", l3="Supreme Court *Judgment No. 4929/2569*.", l4="It began with a *robbery on Koh Samui*.",
            l5="The defence: Bitcoin has *no value*. Rejected.", l6="Property, but still *not legal tender*.",
            q="Should crypto get *the same legal protection* as cash?", follow="Follow @onfinkm for daily market stories.",
            th="Thaiger, 28 Oct 2026", ct="The Crypto Times, 28 Oct 2026", fl="ForkLog, 29 Oct 2026",
            risk="Not investment advice. Crypto and CFDs are high-risk; you may lose money."),
 "ms": dict(tag="Berita kripto", head="Mahkamah tertinggi Thailand: *Bitcoin ialah harta*.", badge="Harta",
            l2="Tajuk berita Thai, 28 Okt: *Bitcoin ialah harta*.", l3="Keputusan Mahkamah Agung *No. 4929/2569*.", l4="Ia bermula dengan *rompakan di Koh Samui*.",
            l5="Pembela: Bitcoin *tiada nilai*. Ditolak.", l6="Harta, tetapi masih *bukan wang sah*.",
            q="Patutkah kripto dapat *perlindungan undang-undang* sama seperti wang tunai?", follow="Ikuti @onfinkm untuk berita pasaran harian.",
            th="Thaiger, 28 Okt 2026", ct="The Crypto Times, 28 Okt 2026", fl="ForkLog, 29 Okt 2026",
            risk="Bukan nasihat pelaburan. Kripto dan CFD berisiko tinggi; anda mungkin kehilangan wang."),
 "ru": dict(tag="Крипто-новости", head="Верховный суд Таиланда признал *биткоин имуществом*.", badge="Имущество",
            l2="Тайские СМИ, 28 октября: *биткоин признан имуществом*.", l3="Решение Верховного суда *№ 4929/2569*.", l4="Всё началось с *ограбления на Самуи*.",
            l5="Защита: у биткоина *нет ценности*. Суд не согласился.", l6="Имущество, но *не законное платёжное средство*.",
            q="Должна ли крипта иметь *такую же защиту*, как наличные?", follow="Подписывайтесь на @onfinkm: новости рынков каждый день.",
            th="Thaiger, 28 окт. 2026", ct="The Crypto Times, 28 окт. 2026", fl="ForkLog, 29 окт. 2026",
            risk="Не является инвестиционной рекомендацией. Криптовалюты и CFD относятся к высокорисковым инструментам; вы можете потерять деньги."),
 "es": dict(tag="Noticias cripto", head="La Corte Suprema de Tailandia: *bitcoin es propiedad*.", badge="Propiedad",
            l2="Titular tailandés, 28 oct: *bitcoin es propiedad*.", l3="Sentencia de la Corte Suprema *n.º 4929/2569*.", l4="Todo empezó con *un robo en Koh Samui*.",
            l5="La defensa: bitcoin *no tiene valor*. Rechazado.", l6="Propiedad, pero *no es moneda de curso legal*.",
            q="¿Debería la cripto tener *la misma protección legal* que el efectivo?", follow="Sigue a @onfinkm para noticias del mercado cada día.",
            th="Thaiger, 28 oct 2026", ct="The Crypto Times, 28 oct 2026", fl="ForkLog, 29 oct 2026",
            risk="No es asesoramiento de inversión. Las criptomonedas y los CFD son de alto riesgo; puedes perder dinero."),
}
W = Week("thbtc/render")
for l, t in T.items():
    c = dict(avatar=AV, bg=BG, bgpos="50% 50%")
    W.lib("SocialCover", dict(avatar=AV, photo=BG, pos="50% 50%", logo=E("../ph/bitcoin.svg"), badge=t["badge"], badgeBg="var(--accent)", badgeFg="var(--text-on-accent)",
          cy=430, cd=330, tag=t["tag"], headline=t["head"], credit=CREDIT, hsize=76 if l in ("ru", "ms", "es") else 84), f"thbtc-{l}-01.png")
    W.lib("EvidenceSlide", dict(c, line=t["l2"], shot=E("ev_thaiger_head.png"), source=t["th"]), f"thbtc-{l}-02.png")
    W.lib("EvidenceSlide", dict(c, line=t["l3"], shot=E("s_judg.png"), source=t["ct"]), f"thbtc-{l}-03.png")
    W.lib("EvidenceSlide", dict(c, line=t["l4"], shot=E("s_case2.png"), source=t["fl"]), f"thbtc-{l}-04.png")
    W.lib("EvidenceSlide", dict(c, line=t["l5"], shot=E("s_defence2.png"), source=t["fl"]), f"thbtc-{l}-05.png")
    W.lib("EvidenceSlide", dict(c, line=t["l6"], shot=E("s_tender.png"), source=t["fl"]), f"thbtc-{l}-06.png")
    W.lib("SocialSlide", dict(avatar=AV, photo=BG, pos="50% 50%", top=0.5, dark=0.92, line=t["q"], sub=t["follow"], risk=t["risk"], lsize=56 if l != "en" else 62), f"thbtc-{l}-07.png")
W.save()
for j in W.lib_jobs:
    if any(ch in json.dumps(j["props"], ensure_ascii=False) for ch in "–—!"):
        print("BAD CHAR", j["out"])
r = subprocess.run(["node", "render_page.js", f"{S}/{W.name}/lib_jobs.json"], cwd=f"{S}/igtools",
                   env={**os.environ, "LIB": f"{S}/iglib/library", "PAGE": "render_msft.html"}, capture_output=True, text=True)
print(r.stdout[-200:], r.stderr[-600:])
