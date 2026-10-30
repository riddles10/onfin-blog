"""Microsoft Voluntary Exit Offer (26 Oct 2026), evidence-led carousel in EN, MS, RU, ES. python3 msft_evid.py"""
import json, os, subprocess, sys
S = "/tmp/claude-0/-home-user-onfin-blog/42b2fa22-784d-52c4-a9a8-6ec4971d0812/scratchpad"
sys.path.insert(0, f"{S}/wk")
from common import Week

E = lambda f: f"file://{S}/msft/ev/{f}"
AV = f"file://{S}/meme/logo/avatar-bolt.jpg"
BG = f"file://{S}/msft/ph/b92.jpg"
CREDIT = "Photo: Coolcaesar, CC BY-SA 4.0, Wikimedia Commons"
T = {
 "en": dict(tag="Tech news", head="Microsoft just offered *60,000 staff* a paid exit.", l2="It's called a *Voluntary Exit Offer*.",
            l3="*60,000 people*, about 27% of the workforce.", l4="Who qualifies: *4 countries*, level 70 and below.",
            l5="Microsoft's own verdict: *new for us*.", l6="It follows *4,800 job cuts* in July.", l7="A Seattle economist's take:",
            q="Would you take *the exit offer?*", follow="Follow @onfinkm for daily market stories.",
            blog="Microsoft blog, 26 Oct 2026", ap="AP via NBC Chicago, 26 Oct 2026", jul="Microsoft blog, 6 Jul 2026", kiro="KIRO 7, 26 Oct 2026",
            risk="Not investment advice. CFDs are high-risk; you may lose money."),
 "ms": dict(tag="Berita teknologi", head="Microsoft tawarkan *60,000 pekerja* peluang keluar berbayar.", l2="Namanya *Voluntary Exit Offer*.",
            l3="*60,000 orang*, kira-kira 27% tenaga kerja.", l4="Siapa layak: *4 negara*, tahap 70 ke bawah.",
            l5="Microsoft sendiri akui ia *perkara baharu*.", l6="Ia menyusul *4,800 pemotongan kerja* pada Julai.", l7="Pandangan ahli ekonomi di Seattle:",
            q="Adakah anda akan *terima tawaran itu?*", follow="Ikuti @onfinkm untuk berita pasaran harian.",
            blog="Blog Microsoft, 26 Okt 2026", ap="AP melalui NBC Chicago, 26 Okt 2026", jul="Blog Microsoft, 6 Jul 2026", kiro="KIRO 7, 26 Okt 2026",
            risk="Bukan nasihat pelaburan. CFD berisiko tinggi; anda mungkin kehilangan wang."),
 "ru": dict(tag="Новости технологий", head="Microsoft предложила *60 000 сотрудников* уйти с выплатой.", l2="Это называется *Voluntary Exit Offer*.",
            l3="*60 000 человек*, около 27% штата.", l4="Кому доступно: *4 страны*, уровень 70 и ниже.",
            l5="Сама Microsoft признаёт: *для нас это новое*.", l6="Это после *4800 сокращений* в июле.", l7="Мнение экономиста из Сиэтла:",
            q="Вы бы *приняли такое предложение?*", follow="Подписывайтесь на @onfinkm: новости рынков каждый день.",
            blog="Блог Microsoft, 26 окт. 2026", ap="AP через NBC Chicago, 26 окт. 2026", jul="Блог Microsoft, 6 июл. 2026", kiro="KIRO 7, 26 окт. 2026",
            risk="Не является инвестиционной рекомендацией. CFD относятся к высокорисковым инструментам; вы можете потерять деньги."),
 "es": dict(tag="Noticias tech", head="Microsoft ofreció a *60,000 empleados* una salida pagada.", l2="Se llama *Voluntary Exit Offer*.",
            l3="*60,000 personas*, cerca del 27% de la plantilla.", l4="Quién califica: *4 países*, nivel 70 o inferior.",
            l5="Microsoft lo admite: *es nuevo para nosotros*.", l6="Llega tras *4,800 despidos* en julio.", l7="La opinión de un economista de Seattle:",
            q="¿Aceptarías *la oferta de salida?*", follow="Sigue a @onfinkm para noticias del mercado cada día.",
            blog="Blog de Microsoft, 26 oct 2026", ap="AP vía NBC Chicago, 26 oct 2026", jul="Blog de Microsoft, 6 jul 2026", kiro="KIRO 7, 26 oct 2026",
            risk="No es asesoramiento de inversión. Los CFD son de alto riesgo; puedes perder dinero."),
}
W = Week("msft/render")
for l, t in T.items():
    c = dict(avatar=AV, bg=BG, bgpos="30% 50%")
    W.lib("SocialCover", dict(avatar=AV, photo=BG, pos="22% 50%", logo=E("msft_logo.svg"), badge="27%", badgeBg="var(--accent)", badgeFg="var(--text-on-accent)",
          cy=520, cd=380, tag=t["tag"], headline=t["head"], credit=CREDIT, hsize=76 if l in ("ru", "ms", "es") else 84), f"msft-{l}-01.png")
    W.lib("EvidenceSlide", dict(c, line=t["l2"], shot=E("ev_blog_head.png"), source=t["blog"]), f"msft-{l}-02.png")
    W.lib("EvidenceSlide", dict(c, line=t["l3"], shot=E("s_ap60.png"), source=t["ap"]), f"msft-{l}-03.png")
    W.lib("EvidenceSlide", dict(c, line=t["l4"], shot=E("s_who.png"), source=t["blog"]), f"msft-{l}-04.png")
    W.lib("EvidenceSlide", dict(c, line=t["l5"], shot=E("s_new.png"), source=t["blog"]), f"msft-{l}-05.png")
    W.lib("EvidenceSlide", dict(c, line=t["l6"], shot=E("s_4800.png"), source=t["jul"]), f"msft-{l}-06.png")
    W.lib("EvidenceSlide", dict(c, line=t["l7"], shot=E("s_kiro2.png"), source=t["kiro"]), f"msft-{l}-07.png")
    W.lib("SocialSlide", dict(avatar=AV, photo=BG, pos="80% 50%", top=0.5, dark=0.92, line=t["q"], sub=t["follow"], risk=t["risk"], lsize=60 if l != "en" else 64), f"msft-{l}-08.png")
W.save()
for j in W.lib_jobs:
    if any(ch in json.dumps(j["props"], ensure_ascii=False) for ch in "–—!"):
        print("BAD CHAR", j["out"])
r = subprocess.run(["node", "render_page.js", f"{S}/{W.name}/lib_jobs.json"], cwd=f"{S}/igtools",
                   env={**os.environ, "LIB": f"{S}/iglib/library", "PAGE": "render_msft.html"}, capture_output=True, text=True)
print(r.stdout[-200:], r.stderr[-600:])
