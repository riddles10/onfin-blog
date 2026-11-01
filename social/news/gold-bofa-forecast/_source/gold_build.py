"""Gold: Bank of America's near-term call (Oct 2026), evidence-led carousel in EN, MS, RU, ES. python3 gold_build.py"""
import json, os, subprocess, sys, datetime
S = "/tmp/claude-0/-home-user-onfin-blog/42b2fa22-784d-52c4-a9a8-6ec4971d0812/scratchpad"
sys.path.insert(0, f"{S}/wk")
from common import Week

M = os.path.dirname(os.path.abspath(__file__))
E = lambda f: f"file://{M}/{f}"
AV = f"file://{S}/meme/logo/avatar-bolt.jpg"
PH = E("photo/gold.jpg")
CREDIT = "Photo: Stevebidmead via Pixabay, CC0, Wikimedia Commons"
d = json.load(open(f"{M}/gc.json"))["chart"]["result"][0]
rows = [(datetime.datetime.fromtimestamp(t, datetime.UTC).date(), c) for t, c in zip(d["timestamp"], d["indicators"]["quote"][0]["close"]) if c]
win = [(dt, round(c, 1)) for dt, c in rows if dt >= datetime.date(2025, 11, 1)]
closes = [c for _, c in win]
assert max(closes) == 5318.4 and closes[-1] == 3898.9 and win[-1][0] == datetime.date(2026, 10, 30), (max(closes), win[-1])
START = win[0][0]  # first session in the window

T = {
 "en": dict(tag="Gold", head="Bank of America says gold *can't hold $4,000*, for now.",
            l2="Bank of America's latest *gold note*:", l3="BofA: gold *unable to hold above $4,000* for three months.",
            l4="Its Q4 forecast: *$4,000*, with dips toward *$3,750*.", l5="Gold has already *closed below $4,000*.",
            l6="BofA's biggest risk for gold: *an oil spike*.", l7="Big buyers have *slowed down*.",
            l8="Longer term, BofA still sees *$4,813* in 2027.", l9="Goldman is more upbeat: *$5,400* by end-2027.",
            sym="GOLD FUTURES", chg="-26.7% from record", sub="Daily close, 3 Nov 2025 to 30 Oct 2026",
            pk="Record $5,318", last="$3,899", sl="3 Nov 2025", el="30 Oct",
            q="Is gold still *your safe haven?*", follow="Follow @onfinkm for daily market stories.",
            s_k="Kitco News, 12 Oct 2026", s_il="investingLive, 1 Oct 2026", s_gs="investingLive, 23 Sep 2026",
            s_data="Data: Yahoo Finance (COMEX gold futures)", risk="Not investment advice. CFDs are high-risk; you may lose money."),
 "ms": dict(tag="Emas", head="Bank of America kata emas *tak mampu kekal atas $4,000*, buat masa ini.",
            l2="Nota *emas* terbaharu Bank of America:", l3="BofA: emas *tak mampu kekal atas $4,000* untuk tiga bulan.",
            l4="Ramalan S4: *$4,000*, dengan risiko jatuh ke *$3,750*.", l5="Emas sudah *ditutup di bawah $4,000*.",
            l6="Risiko terbesar emas menurut BofA: *lonjakan harga minyak*.", l7="Pembeli besar *memperlahankan belian*.",
            l8="Jangka panjang, BofA masih jangka *$4,813* pada 2027.", l9="Goldman lebih optimis: *$5,400* menjelang akhir 2027.",
            sym="EMAS", chg="-26.7% dari rekod", sub="Harga tutup harian, 3 Nov 2025 hingga 30 Okt 2026",
            pk="Rekod $5,318", last="$3,899", sl="3 Nov 2025", el="30 Okt",
            q="Adakah emas masih *tempat selamat anda?*", follow="Ikuti @onfinkm untuk berita pasaran harian.",
            s_k="Kitco News, 12 Okt 2026", s_il="investingLive, 1 Okt 2026", s_gs="investingLive, 23 Sep 2026",
            s_data="Data: Yahoo Finance (niaga hadapan emas COMEX)", risk="Bukan nasihat pelaburan. CFD berisiko tinggi; anda mungkin kehilangan wang."),
 "ru": dict(tag="Золото", head="Bank of America: золото пока *не удержится выше $4 000*.",
            l2="Свежий обзор Bank of America *по золоту*:", l3="BofA: золото *не удержится выше $4 000* ближайшие три месяца.",
            l4="Прогноз на IV квартал: *$4 000*, с риском падения к *$3 750*.", l5="Золото уже *закрылось ниже $4 000*.",
            l6="Главный риск для золота, по мнению BofA: *скачок цен на нефть*.", l7="Крупные покупатели *замедлили покупки*.",
            l8="В долгосрочной перспективе BofA всё ещё ждёт *$4 813* в 2027 году.", l9="Goldman настроен оптимистичнее: *$5 400* к концу 2027 года.",
            sym="ЗОЛОТО", chg="-26,7% от рекорда", sub="Цена закрытия, с 3 ноя. 2025 по 30 окт. 2026",
            pk="Рекорд $5 318", last="$3 899", sl="3 ноя. 2025", el="30 окт.",
            q="Золото всё ещё *ваша тихая гавань?*", follow="Подписывайтесь на @onfinkm: новости рынков каждый день.",
            s_k="Kitco News, 12 окт. 2026", s_il="investingLive, 1 окт. 2026", s_gs="investingLive, 23 сент. 2026",
            s_data="Данные: Yahoo Finance (фьючерсы на золото COMEX)", risk="Не является инвестиционной рекомендацией. CFD относятся к высокорисковым инструментам; вы можете потерять деньги."),
 "es": dict(tag="Oro", head="Bank of America dice que el oro *no podrá sostener $4,000*, por ahora.",
            l2="La última nota de Bank of America *sobre el oro*:", l3="BofA: el oro *no podrá sostenerse sobre $4,000* durante tres meses.",
            l4="Su previsión para el 4T: *$4,000*, con caídas hacia *$3,750*.", l5="El oro ya *cerró por debajo de $4,000*.",
            l6="El mayor riesgo para el oro según BofA: *un alza del petróleo*.", l7="Los grandes compradores *frenaron sus compras*.",
            l8="A más largo plazo, BofA aún ve *$4,813* en 2027.", l9="Goldman es más optimista: *$5,400* para fines de 2027.",
            sym="ORO", chg="-26.7% desde el récord", sub="Cierre diario, 3 nov 2025 a 30 oct 2026",
            pk="Récord $5,318", last="$3,899", sl="3 nov 2025", el="30 oct",
            q="¿El oro sigue siendo *tu refugio?*", follow="Sigue a @onfinkm para noticias del mercado cada día.",
            s_k="Kitco News, 12 oct 2026", s_il="investingLive, 1 oct 2026", s_gs="investingLive, 23 sep 2026",
            s_data="Datos: Yahoo Finance (futuros de oro COMEX)", risk="No es asesoramiento de inversión. Los CFD son de alto riesgo; puedes perder dinero."),
}
HS = {"en": 80, "ms": 70, "ru": 70, "es": 70}
LS = {"en": 58, "ms": 54, "ru": 52, "es": 54}
W = Week("goldbofa")
W.out = f"{M}/out"
only = sys.argv[1:] or list(T)
for l, t in T.items():
    if l not in only:
        continue
    c = dict(avatar=AV, bg=PH, bgpos="50% 50%", lsize=LS[l])
    W.lib("GCover", dict(avatar=AV, photo=PH, pos="50% 40%", logo=E("au.svg"), badge="-27%" if l != "ru" else "-27%", badgeLeft=True,
          cx=830, cy=330, cd=250, tag=t["tag"], headline=t["head"], credit=CREDIT, hsize=HS[l]), f"gold-{l}-01.png")
    W.lib("EvidenceSlide", dict(c, line=t["l2"], shot=E("ev/k_head.png"), cardPad=0, source=t["s_k"]), f"gold-{l}-02.png")
    W.lib("EvidenceSlide", dict(c, line=t["l3"], shot=E("ev/k_3m.png"), cardPad=10, source=t["s_k"]), f"gold-{l}-03.png")
    W.lib("EvidenceSlide", dict(c, line=t["l4"], shot=E("ev/il_3750.png"), cardPad=10, source=t["s_il"]), f"gold-{l}-04.png")
    W.lib("PeakChartSlide", dict(c, line=t["l5"], closes=closes, symbol=t["sym"], change=t["chg"], sub=t["sub"], peakLabel=t["pk"], lastLabel=t["last"],
          startLabel=t["sl"], endLabel=t["el"], source=t["s_data"]), f"gold-{l}-05.png")
    W.lib("EvidenceSlide", dict(c, line=t["l6"], shot=E("ev/il_oil.png"), cardPad=10, source=t["s_il"]), f"gold-{l}-06.png")
    W.lib("EvidenceSlide", dict(c, line=t["l7"], shot=E("ev/k_cb.png"), cardPad=10, source=t["s_k"]), f"gold-{l}-07.png")
    W.lib("EvidenceSlide", dict(c, line=t["l8"], shot=E("ev/k_4q.png"), cardPad=10, source=t["s_k"]), f"gold-{l}-08.png")
    W.lib("EvidenceSlide", dict(c, line=t["l9"], shot=E("ev/gs_5400.png"), cardPad=10, source=t["s_gs"]), f"gold-{l}-09.png")
    W.lib("SocialSlide", dict(avatar=AV, photo=PH, pos="50% 50%", top=0.5, dark=0.92, line=t["q"], sub=t["follow"], risk=t["risk"], lsize=64 if l == "en" else 60), f"gold-{l}-10.png")
json.dump(W.lib_jobs, open(f"{M}/lib_jobs.json", "w"), ensure_ascii=False)
for j in W.lib_jobs:
    txt = json.dumps(j["props"], ensure_ascii=False)
    if any(ch in txt for ch in "–—!"):
        print("BAD CHAR", j["out"])
r = subprocess.run(["node", "render_page.js", f"{M}/lib_jobs.json"], cwd=f"{S}/igtools",
                   env={**os.environ, "LIB": f"{S}/iglib/library", "PAGE": "render_goldbofa.html"}, capture_output=True, text=True)
print(r.stdout[-200:], r.stderr[-600:], "start", START)
