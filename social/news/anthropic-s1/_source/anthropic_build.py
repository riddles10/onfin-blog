"""Anthropic S-1 (filed 26 Oct 2026): evidence-led carousel in EN, MS, RU, ES with one video slide.
python3 anthropic_build.py [render|video|all]"""
import json, os, subprocess, sys
sys.path.insert(0, "/tmp/claude-0/-home-user-onfin-blog/42b2fa22-784d-52c4-a9a8-6ec4971d0812/scratchpad/wk")
from common import Week, S

M = f"{S}/anthropic"
E = lambda f: f"file://{M}/{f}"
AV = f"file://{S}/meme/logo/avatar-bolt.jpg"
PH = f"file://{M}/photo/Dario_Amodei_at_TechCrunch_Disrupt_2023_02.jpg"
CREDIT = "Photo: TechCrunch, CC BY 2.0, Wikimedia Commons"

T = {
 "en": dict(tag="IPO watch", head="The company behind Claude just filed to *go public*.",
            l2="Filed on 26 Oct. Ticker: *ANT* on Nasdaq.", l3="*$16.3 billion* of revenue in six months.",
            l4="An *$80.7 billion* loss, mostly accounting.", l5="Customers paying $100k+: *20 to 11,900*.",
            l6="The filing itself warns of *risks to humanity*.", l7="Wall Street noticed: *\"humanity\" is everywhere*.",
            l8="Not everyone is sold. *Michael Burry* in June:", l9="Founders and a trust *keep control*.",
            q="Would you buy *ANT* on day one?", follow="Follow @onfinkm for daily market stories.",
            s_ann="Anthropic, 26 Oct 2026", s_yf="Yahoo Finance, 26 Oct 2026", s_s1="Anthropic S-1, SEC, 26 Oct 2026",
            s_vid="Yahoo Finance, Brian Sozzi, 26 Oct 2026", s_bi="Business Insider via Yahoo Finance, 1 Jun 2026",
            risk="Not investment advice. CFDs are high-risk; you may lose money."),
 "ms": dict(tag="Pantauan IPO", head="Syarikat di sebalik Claude memfailkan untuk *disenaraikan*.",
            l2="Difailkan 26 Okt. Simbol: *ANT* di Nasdaq.", l3="Hasil *$16.3 bilion* dalam enam bulan.",
            l4="Kerugian *$80.7 bilion*, kebanyakannya perakaunan.", l5="Pelanggan $100k+: *20 kepada 11,900*.",
            l6="Pemfailan itu sendiri memberi amaran tentang *risiko kepada kemanusiaan*.", l7="Wall Street perasan: *\"humanity\" ada di mana-mana*.",
            l8="Tidak semua yakin. *Michael Burry* pada Jun:", l9="Pengasas dan sebuah amanah *kekal mengawal*.",
            q="Adakah anda akan membeli *ANT* pada hari pertama?", follow="Ikuti @onfinkm untuk berita pasaran harian.",
            s_ann="Anthropic, 26 Okt 2026", s_yf="Yahoo Finance, 26 Okt 2026", s_s1="S-1 Anthropic, SEC, 26 Okt 2026",
            s_vid="Yahoo Finance, Brian Sozzi, 26 Okt 2026", s_bi="Business Insider melalui Yahoo Finance, 1 Jun 2026",
            risk="Bukan nasihat pelaburan. CFD berisiko tinggi; anda mungkin kehilangan wang."),
 "ru": dict(tag="IPO", head="Создатель Claude подал заявку на *выход на биржу*.",
            l2="Подано 26 октября. Тикер: *ANT* на Nasdaq.", l3="*$16,3 млрд* выручки за полгода.",
            l4="Убыток *$80,7 млрд*, в основном бухгалтерский.", l5="Клиенты с оплатой от $100 тыс.: *с 20 до 11 900*.",
            l6="Сам проспект предупреждает о *рисках для человечества*.", l7="Уолл-стрит заметила: *«humanity» повсюду*.",
            l8="Не все в восторге. *Майкл Бьюрри* в июне:", l9="Контроль *остаётся у основателей* и траста.",
            q="Вы бы купили *ANT* в первый день торгов?", follow="Подписывайтесь на @onfinkm: новости рынков каждый день.",
            s_ann="Anthropic, 26 окт. 2026", s_yf="Yahoo Finance, 26 окт. 2026", s_s1="S-1 Anthropic, SEC, 26 окт. 2026",
            s_vid="Yahoo Finance, Брайан Соцци, 26 окт. 2026", s_bi="Business Insider на Yahoo Finance, 1 июня 2026",
            risk="Не является инвестиционной рекомендацией. CFD относятся к высокорисковым инструментам; вы можете потерять деньги."),
 "es": dict(tag="Radar IPO", head="La empresa detrás de Claude pidió *salir a bolsa*.",
            l2="Presentado el 26 de oct. Símbolo: *ANT* en Nasdaq.", l3="*$16,300 millones* de ingresos en seis meses.",
            l4="Una pérdida de *$80,700 millones*, sobre todo contable.", l5="Clientes que pagan $100,000 o más: *de 20 a 11,900*.",
            l6="El propio documento advierte de *riesgos para la humanidad*.", l7="Wall Street lo notó: *\"humanity\" está por todas partes*.",
            l8="No todos están convencidos. *Michael Burry* en junio:", l9="Los fundadores y un fideicomiso *mantienen el control*.",
            q="¿Comprarías *ANT* el primer día?", follow="Sigue a @onfinkm para noticias del mercado cada día.",
            s_ann="Anthropic, 26 oct 2026", s_yf="Yahoo Finance, 26 oct 2026", s_s1="S-1 de Anthropic, SEC, 26 oct 2026",
            s_vid="Yahoo Finance, Brian Sozzi, 26 oct 2026", s_bi="Business Insider vía Yahoo Finance, 1 jun 2026",
            risk="No es asesoramiento de inversión. Los CFD son de alto riesgo; puedes perder dinero."),
}


def render():
    W = Week("anthropic")
    for l, t in T.items():
        c = dict(avatar=AV, bg=PH, bgpos="50% 30%")
        ls = 56 if l in ("ru", "ms", "es") else 60
        W.lib("SocialCover", dict(avatar=AV, photo=PH, pos="50% 22%", logo=E("alogo.svg"), badge="S-1", cy=820, cd=300,
              tag=t["tag"], headline=t["head"], credit=CREDIT, hsize=74 if l in ("ru", "ms", "es") else 82), f"ant-{l}-01.png")
        W.lib("EvidenceSlide", dict(c, line=t["l2"], shot=E("ev_ann.png"), maxh=820, lsize=ls, source=t["s_ann"]), f"ant-{l}-02.png")
        W.lib("EvidenceSlide", dict(c, line=t["l3"], shot=E("y_rev.png"), lsize=ls, source=t["s_yf"]), f"ant-{l}-03.png")
        W.lib("EvidenceSlide", dict(c, line=t["l4"], shot=E("y_loss.png"), lsize=ls, source=t["s_yf"]), f"ant-{l}-04.png")
        W.lib("EvidenceSlide", dict(c, line=t["l5"], shot=E("r_cust.png"), cardPad=0, lsize=ls, source=t["s_s1"]), f"ant-{l}-05.png")
        W.lib("EvidenceSlide", dict(c, line=t["l6"], shot=E("r_risk.png"), cardPad=0, lsize=ls, source=t["s_s1"]), f"ant-{l}-06.png")
        for ph in ("magenta", "black"):  # video slide frame: magenta finds the card, black is the overlay
            W.lib("EvidenceSlide", dict(c, line=t["l7"], shot=E(f"ph_{ph}.png"), cardPad=0, lsize=ls, source=t["s_vid"]), f"vframe-{l}-{ph}.png")
        W.lib("EvidenceSlide", dict(c, line=t["l8"], shot=E("ev_burry.png"), lsize=ls, source=t["s_bi"]), f"ant-{l}-08.png")
        W.lib("EvidenceSlide", dict(c, line=t["l9"], shot=E("r_gov.png"), cardPad=0, lsize=ls, source=t["s_s1"]), f"ant-{l}-09.png")
        W.lib("SocialSlide", dict(avatar=AV, photo=PH, pos="50% 22%", top=0.5, dark=0.92, line=t["q"], sub=t["follow"], risk=t["risk"], lsize=60 if l != "en" else 64), f"ant-{l}-10.png")
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
    if what in ("video", "all"):
        import video_slide
        video_slide.main()
