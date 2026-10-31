"""Google AI summaries follow-up (Q3 2026), evidence-led carousel in EN, MS, RU, ES. python3 googleai_build.py"""
import json, os, subprocess, sys, datetime
sys.path.insert(0, "/tmp/claude-0/-home-user-onfin-blog/42b2fa22-784d-52c4-a9a8-6ec4971d0812/scratchpad/wk")
from common import Week, S

M = os.path.dirname(os.path.abspath(__file__))
E = lambda f: f"file://{M}/{f}"
AV = f"file://{S}/meme/logo/avatar-bolt.jpg"
PH = E("photo/p23.jpg")
CREDIT = "Photo: Lukasz Kobus, European Commission, CC BY 4.0, Wikimedia Commons (cropped)"
d = json.load(open(f"{M}/googl_1y.json"))["chart"]["result"][0]
rows = [(datetime.datetime.fromtimestamp(t, datetime.UTC).date(), c) for t, c in zip(d["timestamp"], d["indicators"]["quote"][0]["close"]) if c]
closes = [round(c, 2) for dt, c in rows if dt >= datetime.date(2026, 3, 30)]
assert closes[0] == 273.5 and closes[-2] == 283.82 and closes[-1] == 279.84, closes[:2] + closes[-2:]

T = {
 "en": dict(tag="Market news", head="Is Google's own AI *eating its ad business?*",
            l2="The story behind the *$500 billion* drop:", l3="JPMorgan asked *the obvious question*:",
            l4="Google's answer: AI Mode *earns less from ads*, for now.", l5="But the biggest drag *was currency moves*.",
            l6="And searches are growing *fastest in five years*.", l7="This is what *AI Mode* looks like:",
            l8="Why would Google *hurt its own ads?*", l9="GOOGL: lowest close *since 30 March*.",
            chg="-30.5% from peak", sub="Daily close, 30 Mar to 30 Oct 2026", fr="$283.82", to="$279.84", sl="30 Mar: $273.50", el="30 Oct",
            q="Do you still click the links *under an AI answer?*", follow="Follow @onfinkm for daily market stories.",
            s_bbc="BBC News, 30 Oct 2026", s_jpm="Doug Anmuth, JPMorgan, Q3 call, 28 Oct", s_ps="Philipp Schindler, Google, Q3 call, 28 Oct",
            s_sp="Sundar Pichai, Google CEO, Q3 call, 28 Oct", s_vid="Video: Google, I/O 2026 demo (illustrative)", s_data="Data: Yahoo Finance",
            risk="Not investment advice. CFDs are high-risk; you may lose money."),
 "ms": dict(tag="Berita pasaran", head="Adakah AI Google sendiri *menjejaskan perniagaan iklannya?*",
            l2="Kisah di sebalik kejatuhan *$500 bilion*:", l3="JPMorgan bertanya *soalan yang jelas*:",
            l4="Jawapan Google: AI Mode *kurang hasil iklan*, buat masa ini.", l5="Tetapi beban terbesar ialah *pergerakan mata wang*.",
            l6="Dan carian berkembang *paling pantas dalam lima tahun*.", l7="Beginilah rupa *AI Mode*:",
            l8="Kenapa Google sanggup *menjejaskan iklannya sendiri?*", l9="GOOGL: harga tutup terendah *sejak 30 Mac*.",
            chg="-30.5% dari puncak", sub="Harga tutup harian, 30 Mac hingga 30 Okt 2026", fr="$283.82", to="$279.84", sl="30 Mac: $273.50", el="30 Okt",
            q="Adakah anda masih klik pautan *di bawah jawapan AI?*", follow="Ikuti @onfinkm untuk berita pasaran harian.",
            s_bbc="BBC News, 30 Okt 2026", s_jpm="Doug Anmuth, JPMorgan, panggilan S3, 28 Okt", s_ps="Philipp Schindler, Google, panggilan S3, 28 Okt",
            s_sp="Sundar Pichai, CEO Google, panggilan S3, 28 Okt", s_vid="Video: Google, demo I/O 2026 (ilustrasi)", s_data="Data: Yahoo Finance",
            risk="Bukan nasihat pelaburan. CFD berisiko tinggi; anda mungkin kehilangan wang."),
 "ru": dict(tag="Новости рынка", head="Собственный ИИ Google *съедает его рекламный бизнес?*",
            l2="Что стоит за падением на *$500 млрд*:", l3="JPMorgan задал *очевидный вопрос*:",
            l4="Ответ Google: AI Mode *пока приносит меньше рекламы*.", l5="Но сильнее всего давили *валютные курсы*.",
            l6="А число запросов растёт *быстрее всего за пять лет*.", l7="Вот как выглядит *AI Mode*:",
            l8="Зачем Google *бить по своей рекламе?*", l9="GOOGL: самое низкое закрытие *с 30 марта*.",
            chg="-30,5% от пика", sub="Цена закрытия, 30 мар. – 30 окт. 2026".replace(" – ", " по "), fr="$283,82", to="$279,84", sl="30 мар.: $273,50", el="30 окт.",
            q="Вы ещё нажимаете на ссылки *под ответом ИИ?*", follow="Подписывайтесь на @onfinkm: новости рынков каждый день.",
            s_bbc="BBC News, 30 окт. 2026", s_jpm="Даг Анмут, JPMorgan, звонок за III кв., 28 окт.", s_ps="Филипп Шиндлер, Google, звонок за III кв., 28 окт.",
            s_sp="Сундар Пичаи, CEO Google, звонок за III кв., 28 окт.", s_vid="Видео: Google, демо I/O 2026 (иллюстрация)", s_data="Данные: Yahoo Finance",
            risk="Не является инвестиционной рекомендацией. CFD относятся к высокорисковым инструментам; вы можете потерять деньги."),
 "es": dict(tag="Noticias del mercado", head="¿La propia IA de Google *se está comiendo su negocio de anuncios?*",
            l2="La historia detrás de la caída de *$500,000 millones*:", l3="JPMorgan hizo *la pregunta obvia*:",
            l4="La respuesta de Google: AI Mode *gana menos con anuncios*, por ahora.", l5="Pero el mayor lastre *fueron las divisas*.",
            l6="Y las búsquedas crecen *al mayor ritmo en cinco años*.", l7="Así se ve *AI Mode*:",
            l8="¿Por qué Google *dañaría sus propios anuncios?*", l9="GOOGL: el cierre más bajo *desde el 30 de marzo*.",
            chg="-30.5% desde el máximo", sub="Cierre diario, 30 mar a 30 oct 2026", fr="$283.82", to="$279.84", sl="30 mar: $273.50", el="30 oct",
            q="¿Todavía haces clic en los enlaces *bajo una respuesta de IA?*", follow="Sigue a @onfinkm para noticias del mercado cada día.",
            s_bbc="BBC News, 30 oct 2026", s_jpm="Doug Anmuth, JPMorgan, llamada del 3T, 28 oct", s_ps="Philipp Schindler, Google, llamada del 3T, 28 oct",
            s_sp="Sundar Pichai, CEO de Google, llamada del 3T, 28 oct", s_vid="Video: Google, demo de I/O 2026 (ilustrativo)", s_data="Datos: Yahoo Finance",
            risk="No es asesoramiento de inversión. Los CFD son de alto riesgo; puedes perder dinero."),
}
HS = {"en": 82, "ms": 74, "ru": 74, "es": 70}
LS = {"en": 58, "ms": 54, "ru": 54, "es": 52}
W = Week("googleai")
W.out = f"{M}/out"
for l, t in T.items():
    c = dict(avatar=AV, bg=PH, bgpos="50% 30%", lsize=LS[l])
    W.lib("GCover", dict(avatar=AV, photo=PH, pos="50% 0%", logo=E("glogo.svg"), badge="AI" if l != "ru" else "ИИ", badgeLeft=True,
          cx=935, cy=790, cd=240, tag=t["tag"], headline=t["head"], credit=CREDIT, hsize=HS[l]), f"gai-{l}-01.png")
    W.lib("EvidenceSlide", dict(c, line=t["l2"], shot=E("ev_bbc.png"), cardPad=10, source=t["s_bbc"]), f"gai-{l}-02.png")
    W.lib("EvidenceSlide", dict(c, line=t["l3"], shot=E("ev/sj_anmuth.png"), cardPad=10, source=t["s_jpm"]), f"gai-{l}-03.png")
    W.lib("EvidenceSlide", dict(c, line=t["l4"], shot=E("ev/sj_aimode.png"), cardPad=10, maxh=900, source=t["s_ps"]), f"gai-{l}-04.png")
    W.lib("EvidenceSlide", dict(c, line=t["l5"], shot=E("ev_fx.png"), cardPad=10, maxh=900, source=t["s_ps"]), f"gai-{l}-05.png")
    W.lib("EvidenceSlide", dict(c, line=t["l6"], shot=E("ev/sj_pichai.png"), cardPad=10, source=t["s_sp"]), f"gai-{l}-06.png")
    for ph in ("magenta", "black"):
        W.lib("EvidenceSlide", dict(c, line=t["l7"], shot=E(f"ph_{ph}.png"), cardPad=0, source=t["s_vid"]), f"vframe-{l}-{ph}.png")
    W.lib("EvidenceSlide", dict(c, line=t["l8"], shot=E("ev/bbc_scott.png"), cardPad=10, source=t["s_bbc"]), f"gai-{l}-08.png")
    W.lib("ChartSlide", dict(c, line=t["l9"], closes=closes, symbol="GOOGL", change=t["chg"], sub=t["sub"], fromLabel=t["fr"], toLabel=t["to"],
          startLabel=t["sl"], endLabel=t["el"], source=t["s_data"]), f"gai-{l}-09.png")
    W.lib("SocialSlide", dict(avatar=AV, photo=PH, pos="50% 20%", top=0.5, dark=0.92, line=t["q"], sub=t["follow"], risk=t["risk"], lsize=60 if l != "en" else 64), f"gai-{l}-10.png")
json.dump(W.lib_jobs, open(f"{M}/lib_jobs.json", "w"), ensure_ascii=False)
for j in W.lib_jobs:
    txt = json.dumps(j["props"], ensure_ascii=False)
    if any(ch in txt for ch in "–—!"):
        print("BAD CHAR", j["out"])
r = subprocess.run(["node", "render_page.js", f"{M}/lib_jobs.json"], cwd=f"{S}/igtools",
                   env={**os.environ, "LIB": f"{S}/iglib/library", "PAGE": "render_googleai.html"}, capture_output=True, text=True)
print(r.stdout[-200:], r.stderr[-600:])
