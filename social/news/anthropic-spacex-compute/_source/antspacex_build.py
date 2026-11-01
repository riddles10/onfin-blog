"""Anthropic x SpaceX compute deal (S-1, 26 Oct 2026): evidence-led carousel in EN, MS, RU, ES.
python3 antspacex_build.py"""
import json, os, subprocess, sys
sys.path.insert(0, "/tmp/claude-0/-home-user-onfin-blog/42b2fa22-784d-52c4-a9a8-6ec4971d0812/scratchpad/wk")
from common import Week, S

M = f"{S}/antspacex"
E = lambda f: f"file://{M}/ev/{f}"
AV = f"file://{S}/meme/logo/avatar-bolt.jpg"
PH = f"file://{M}/photo/starship.jpg"
CREDIT = "Photo: Shujianyang, CC BY-SA 4.0, Wikimedia Commons"

T = {
 "en": dict(tag="S-1 detail", head="Anthropic will pay SpaceX *$3.1 billion a month*.", badge="$3.1B/mo",
            l2="It's in the S-1: up to *$120.5 billion* into 2029.", l3="But after early 2027, either side can *walk away*.",
            l4="How SpaceX compares with its *other compute deals*:", t4="Anthropic's compute commitments", s4="Amounts in the S-1, US$",
            rows4=[("SpaceXAI", "to 2029", "up to $120.5B"), ("Google", "to 2033", "$114.5B"), ("Amazon", "to 2036", "$110.0B"), ("Microsoft", "to 2033", "$44.9B")],
            f4="Google, Amazon and Microsoft are minimums owed regardless of usage. SpaceXAI is a ceiling, cancellable after early 2027.",
            l5="At full rate, six months of SpaceX compute is *$18.6B*.", t5="Six months, side by side", s5="US$ billions",
            rows5=[("Anthropic revenue", "H1 2026", "$16.3B"), ("SpaceXAI at full rate", "6 x $3.1B", "$18.6B")],
            f5="Revenue is growing fast: the FT reported $16.8B for Q3 alone.",
            l6="SpaceX's 10-Q: one customer was *34.5%* of Q3 revenue.", l7="Bloomberg reports that customer is *Anthropic*.",
            l8="SpaceX is also lining up *$40 billion* of Nvidia chips.", l9="Bridgewater on this kind of *concentration*:",
            q="Smart bet, or too much riding on *one customer*?", follow="Follow @onfinkm for daily market stories.",
            s_s1="Anthropic S-1, SEC, 26 Oct 2026", s_calc="Anthropic S-1; OnFin calculation; FT via The Star", s_10q="SpaceX 10-Q, SEC, 22 Oct 2026 (excerpt)",
            s_sem="Semafor, citing Bloomberg, 30 Oct 2026", s_ap="Apollo, 26 Oct 2026", s_bw="Semafor, 30 Oct 2026",
            risk="Not investment advice. CFDs are high-risk; you may lose money."),
 "ms": dict(tag="Butiran S-1", head="Anthropic akan membayar SpaceX *$3.1 bilion sebulan*.", badge="$3.1B/bulan",
            l2="Dalam S-1: sehingga *$120.5 bilion* hingga 2029.", l3="Tetapi selepas awal 2027, kedua-dua pihak boleh *menarik diri*.",
            l4="SpaceX berbanding *perjanjian pengkomputeran lain*:", t4="Komitmen pengkomputeran Anthropic", s4="Jumlah dalam S-1, US$",
            rows4=[("SpaceXAI", "hingga 2029", "sehingga $120.5B"), ("Google", "hingga 2033", "$114.5B"), ("Amazon", "hingga 2036", "$110.0B"), ("Microsoft", "hingga 2033", "$44.9B")],
            f4="Google, Amazon dan Microsoft ialah jumlah minimum yang perlu dibayar walau apa pun penggunaan. SpaceXAI ialah had maksimum, boleh dibatalkan selepas awal 2027.",
            l5="Pada kadar penuh, enam bulan pengkomputeran SpaceX bernilai *$18.6B*.", t5="Enam bulan, sebelah-menyebelah", s5="US$ bilion",
            rows5=[("Hasil Anthropic", "Jan hingga Jun 2026", "$16.3B"), ("SpaceXAI pada kadar penuh", "6 x $3.1B", "$18.6B")],
            f5="Hasil berkembang pesat: FT melaporkan $16.8B bagi S3 sahaja.",
            l6="10-Q SpaceX: seorang pelanggan menyumbang *34.5%* hasil S3.", l7="Bloomberg melaporkan pelanggan itu ialah *Anthropic*.",
            l8="SpaceX juga menyediakan *$40 bilion* untuk cip Nvidia.", l9="Bridgewater tentang *penumpuan* sebegini:",
            q="Pertaruhan bijak, atau terlalu bergantung pada *satu pelanggan*?", follow="Ikuti @onfinkm untuk berita pasaran harian.",
            s_s1="S-1 Anthropic, SEC, 26 Okt 2026", s_calc="S-1 Anthropic; kiraan OnFin; FT melalui The Star", s_10q="10-Q SpaceX, SEC, 22 Okt 2026 (petikan)",
            s_sem="Semafor, memetik Bloomberg, 30 Okt 2026", s_ap="Apollo, 26 Okt 2026", s_bw="Semafor, 30 Okt 2026",
            risk="Bukan nasihat pelaburan. CFD berisiko tinggi; anda mungkin kehilangan wang."),
 "ru": dict(tag="Детали S-1", head="Anthropic будет платить SpaceX *$3,1 млрд в месяц*.", badge="$3,1 млрд/мес",
            l2="Это есть в S-1: до *$120,5 млрд* до 2029 года.", l3="Но после начала 2027 года любая сторона может *выйти из сделки*.",
            l4="SpaceX на фоне *других контрактов на вычисления*:", t4="Обязательства Anthropic по вычислениям", s4="Суммы из S-1, долл. США",
            rows4=[("SpaceXAI", "до 2029", "до $120,5 млрд"), ("Google", "до 2033", "$114,5 млрд"), ("Amazon", "до 2036", "$110,0 млрд"), ("Microsoft", "до 2033", "$44,9 млрд")],
            f4="Google, Amazon и Microsoft: минимальные суммы, которые нужно заплатить при любом использовании. SpaceXAI: верхний предел, контракт можно расторгнуть после начала 2027 года.",
            l5="При полной загрузке полгода вычислений у SpaceX стоят *$18,6 млрд*.", t5="Полгода: сравнение", s5="Млрд долл. США",
            rows5=[("Выручка Anthropic", "I полугодие 2026", "$16,3 млрд"), ("SpaceXAI при полной загрузке", "6 x $3,1 млрд", "$18,6 млрд")],
            f5="Выручка быстро растёт: по данным FT, только за III квартал $16,8 млрд.",
            l6="Отчёт SpaceX 10-Q: один клиент дал *34,5%* выручки за III квартал.", l7="По данным Bloomberg, этот клиент и есть *Anthropic*.",
            l8="SpaceX также привлекает *$40 млрд* на чипы Nvidia.", l9="Bridgewater о такой *концентрации*:",
            q="Разумная ставка или слишком большая зависимость от *одного клиента*?", follow="Подписывайтесь на @onfinkm: новости рынков каждый день.",
            s_s1="S-1 Anthropic, SEC, 26 окт. 2026", s_calc="S-1 Anthropic; расчёт OnFin; FT через The Star", s_10q="SpaceX 10-Q, SEC, 22 окт. 2026 (выдержка)",
            s_sem="Semafor со ссылкой на Bloomberg, 30 окт. 2026", s_ap="Apollo, 26 окт. 2026", s_bw="Semafor, 30 окт. 2026",
            risk="Не является инвестиционной рекомендацией. CFD относятся к высокорисковым инструментам; вы можете потерять деньги."),
 "es": dict(tag="Detalle del S-1", head="Anthropic pagará a SpaceX *$3,100 millones al mes*.", badge="$3,100 M/mes",
            l2="Está en el S-1: hasta *$120,500 millones* hasta 2029.", l3="Pero desde inicios de 2027, cualquiera de las partes puede *retirarse*.",
            l4="SpaceX frente a sus *otros contratos de cómputo*:", t4="Compromisos de cómputo de Anthropic", s4="Montos del S-1, en US$",
            rows4=[("SpaceXAI", "hasta 2029", "hasta $120,500 M"), ("Google", "hasta 2033", "$114,500 M"), ("Amazon", "hasta 2036", "$110,000 M"), ("Microsoft", "hasta 2033", "$44,900 M")],
            f4="Google, Amazon y Microsoft son mínimos que se pagan aunque no se usen. SpaceXAI es un tope, cancelable desde inicios de 2027.",
            l5="A plena capacidad, seis meses de cómputo de SpaceX cuestan *$18,600 millones*.", t5="Seis meses, lado a lado", s5="Miles de millones de US$",
            rows5=[("Ingresos de Anthropic", "1S 2026", "$16,300 M"), ("SpaceXAI a plena capacidad", "6 x $3,100 M", "$18,600 M")],
            f5="Los ingresos crecen rápido: el FT informó $16,800 millones solo en el 3T.",
            l6="10-Q de SpaceX: un cliente aportó el *34.5%* de los ingresos del 3T.", l7="Según Bloomberg, ese cliente es *Anthropic*.",
            l8="SpaceX también financia *$40,000 millones* en chips de Nvidia.", l9="Bridgewater sobre este tipo de *concentración*:",
            q="¿Apuesta inteligente o demasiada dependencia de *un solo cliente*?", follow="Sigue a @onfinkm para noticias del mercado cada día.",
            s_s1="S-1 de Anthropic, SEC, 26 oct 2026", s_calc="S-1 de Anthropic; cálculo de OnFin; FT vía The Star", s_10q="10-Q de SpaceX, SEC, 22 oct 2026 (extracto)",
            s_sem="Semafor, citando a Bloomberg, 30 oct 2026", s_ap="Apollo, 26 oct 2026", s_bw="Semafor, 30 oct 2026",
            risk="No es asesoramiento de inversión. Los CFD son de alto riesgo; puedes perder dinero."),
}
VALS4 = [120.5, 114.5, 110.0, 44.9]
VALS5 = [16.3, 18.6]


def render():
    W = Week("antspacex")
    for l, t in T.items():
        c = dict(avatar=AV, bg=PH, bgpos="50% 40%")
        ls = 54 if l in ("ru", "ms", "es") else 58
        W.lib("DuoCover", dict(avatar=AV, photo=PH, pos="50% 30%", logoA=f"file://{M}/photo/alogo.svg", logoB=f"file://{M}/photo/spacex_word.svg",
              badge=t["badge"], cy=560, cd=240, tag=t["tag"], headline=t["head"], credit=CREDIT, hsize=72 if l in ("ru", "ms", "es") else 80), f"asx-{l}-01.png")
        W.lib("EvidenceSlide", dict(c, line=t["l2"], shot=E("r_deal.png"), cardPad=0, lsize=ls, source=t["s_s1"]), f"asx-{l}-02.png")
        W.lib("EvidenceSlide", dict(c, line=t["l3"], shot=E("r_cancel.png"), cardPad=0, lsize=ls, source=t["s_s1"]), f"asx-{l}-03.png")
        W.lib("HBarSlide", dict(c, line=t["l4"], title=t["t4"], sub=t["s4"], foot=t["f4"], lsize=ls - 4, source=t["s_s1"],
              rows=[dict(label=a, note=b, text=x, value=v, hi=(i == 0)) for i, ((a, b, x), v) in enumerate(zip(t["rows4"], VALS4))]), f"asx-{l}-04.png")
        W.lib("HBarSlide", dict(c, line=t["l5"], title=t["t5"], sub=t["s5"], foot=t["f5"], lsize=ls - 4, source=t["s_calc"],
              rows=[dict(label=a, note=b, text=x, value=v, hi=(i == 1)) for i, ((a, b, x), v) in enumerate(zip(t["rows5"], VALS5))]), f"asx-{l}-05.png")
        W.lib("EvidenceSlide", dict(c, line=t["l6"], shot=E("tenq.png"), cardPad=0, lsize=ls, source=t["s_10q"]), f"asx-{l}-06.png")
        W.lib("EvidenceSlide", dict(c, line=t["l7"], shot=E("semafor.png"), cardPad=0, lsize=ls, source=t["s_sem"]), f"asx-{l}-07.png")
        W.lib("EvidenceSlide", dict(c, line=t["l8"], shot=E("apollo.png"), cardPad=0, maxh=900, lsize=ls, source=t["s_ap"]), f"asx-{l}-08.png")
        W.lib("EvidenceSlide", dict(c, line=t["l9"], shot=E("s_bw.png"), cardPad=0, lsize=ls, source=t["s_bw"]), f"asx-{l}-09.png")
        W.lib("SocialSlide", dict(avatar=AV, photo=PH, pos="50% 30%", top=0.5, dark=0.92, line=t["q"], sub=t["follow"], risk=t["risk"], lsize=58 if l != "en" else 64), f"asx-{l}-10.png")
    W.save()
    for j in W.lib_jobs:
        if any(ch in json.dumps(j["props"], ensure_ascii=False) for ch in "–—!"):
            print("BAD CHAR", j["out"])
    r = subprocess.run(["node", "render_page.js", f"{M}/lib_jobs.json"], cwd=f"{S}/igtools",
                       env={**os.environ, "LIB": f"{S}/iglib/library", "PAGE": "render_antspacex.html"}, capture_output=True, text=True)
    print(r.stdout[-300:], r.stderr[-800:])


def sheets():
    from PIL import Image
    for l in T:
        ims = [Image.open(f"{M}/out/asx-{l}-{i:02d}.png").convert("RGB") for i in range(1, 11)]
        w = 216; hh = int(w * 1350 / 1080)
        sh = Image.new("RGB", (w * 5 + 40, hh * 2 + 10), "white")
        for i, im in enumerate(ims):
            sh.paste(im.resize((w, hh)), ((i % 5) * (w + 10), (i // 5) * (hh + 10)))
        sh.save(f"{M}/sheet-{l}.jpg", quality=86)


if __name__ == "__main__":
    render()
    sheets()
