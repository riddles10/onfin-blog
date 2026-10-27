"""Week 1 (28 Oct to 3 Nov 2026): render jobs + per-channel captions + posting plan.
Templates: OnFin Instagram design library (new). Rules: no emoji, no exclamation marks,
no en/em dashes, sources in body text (templates hard-code an em dash in `source`)."""
import json, os

S = "/tmp/claude-0/-home-user-onfin-blog/42b2fa22-784d-52c4-a9a8-6ec4971d0812/scratchpad"
OUT = f"{S}/w1/out"
M = f"file://{S}/w1/media"

CH = {  # channel key -> (postiz integration id, platform, language)
    "ig": ("cmvl4rmgd12ctmk0yjjk9x6kd", "instagram", "en"),
    "fb": ("cmvjg1etr08j7lf0yde4p29lr", "facebook", "en"),
    "en": ("cmuv1mlcb001dmo0ylwenjxe1", "telegram", "en"),
    "kh": ("cmvjfl0ed087glf0yuoz284sa", "telegram", "en"),
    "ms": ("cmuv1oz5o002gql0y49vluhy3", "telegram", "ms"),
    "ru": ("cmuv1nud2001qmo0y7xgzq68r", "telegram", "ru"),
    "es": ("cmvjg3htg08k9lf0yunmvtsqu", "telegram", "es"),
}
RISK = {"en": "CFDs are high-risk; you may lose money.", "ms": "CFD berisiko tinggi; anda mungkin kehilangan wang.",
        "ru": "CFD относятся к высокорисковым инструментам; вы можете потерять деньги.", "es": "Los CFD son de alto riesgo; puedes perder dinero."}
NOTADV = {"en": "Not investment advice. For information only.", "ms": "Bukan nasihat pelaburan. Untuk maklumat sahaja.",
          "ru": "Не является инвестиционной рекомендацией. Только для информации.", "es": "No es asesoramiento de inversión. Solo con fines informativos."}
FULL_RISK = ("Risk warning: trading forex and CFDs on margin carries a high level of risk and may not be suitable for all investors. "
             "You may lose more than your initial investment.")

jobs, posts = [], []


def job(name, props, out):
    jobs.append({"out": f"{OUT}/{out}", "name": name, "props": props})
    return f"{OUT}/{out}"


def post(key, ch, date, lines, images, story=False):
    posts.append({"key": key, "ch": ch, "integrationId": CH[ch][0], "platform": CH[ch][1], "date": date,
                  "story": story, "lines": lines, "images": images})


# ------------------------------------------------------------ 1. Flash: Bitcoin below $80K
BTC = {
 "en": dict(tag="Breaking", headline="Bitcoin *slips* below $80,000",
            summary="It fell as low as about $79,280 on Monday as investors pulled $772 million from US spot Bitcoin ETFs in two days."),
 "ms": dict(tag="Terkini", headline="Bitcoin *jatuh* bawah $80,000",
            summary="Ia jatuh serendah kira-kira $79,280 pada Isnin apabila pelabur menarik keluar $772 juta daripada ETF Bitcoin spot AS dalam dua hari."),
 "ru": dict(tag="Срочно", headline="Bitcoin *ушёл* ниже $80 000",
            summary="В понедельник цена опускалась примерно до $79 280: за два дня из спотовых Bitcoin ETF в США вывели $772 млн."),
 "es": dict(tag="Última hora", headline="Bitcoin *cae* por debajo de $80,000",
            summary="El lunes llegó a tocar cerca de $79,280, mientras los inversores retiraban $772 millones de los ETF de Bitcoin al contado en EE. UU. en dos días."),
}
btc_img = {}
for l, c in BTC.items():
    btc_img[l] = job("CarouselNews", dict(live=True, source="Bloomberg", date="26 Oct 2026", media=f"{M}/candles.jpg", meta="Flash", **c), f"flash-btc-{l}.png")
btc_story = job("StoryNews", dict(tag="Breaking", live=True, headline=BTC["en"]["headline"], summary=BTC["en"]["summary"] + " Source: Bloomberg.",
                                  time="26 Oct 2026", media=f"{M}/candles.jpg"), "flash-btc-story.png")
BTC_CAP = {
 "en": ["Bitcoin slips below $80,000",
        "Bitcoin fell as low as about $79,280 on Monday, failing to follow stocks higher.",
        "Investors pulled $772.4 million from US spot Bitcoin ETFs on Thursday and Friday, after more than $1 billion of inflows earlier in the week.",
        "Crypto can move fast around big macro events, and the Fed decides on Wednesday.", "Source: Bloomberg"],
 "ms": ["Bitcoin jatuh bawah $80,000",
        "Bitcoin jatuh serendah kira-kira $79,280 pada Isnin, tidak mengikut kenaikan pasaran saham.",
        "Pelabur menarik keluar $772.4 juta daripada ETF Bitcoin spot AS pada Khamis dan Jumaat, selepas aliran masuk melebihi $1 bilion awal minggu itu.",
        "Kripto boleh bergerak pantas ketika peristiwa makro besar, dan Fed membuat keputusan pada Rabu.", "Sumber: Bloomberg"],
 "ru": ["Bitcoin ушёл ниже $80 000",
        "В понедельник Bitcoin опускался примерно до $79 280 и не поддержал рост фондового рынка.",
        "В четверг и пятницу из спотовых Bitcoin ETF в США вывели $772,4 млн, хотя в начале недели приток превысил $1 млрд.",
        "Крипта может резко двигаться вокруг крупных макрособытий, а ФРС принимает решение в среду.", "Источник: Bloomberg"],
 "es": ["Bitcoin cae por debajo de $80,000",
        "El lunes, Bitcoin llegó a tocar cerca de $79,280 y no acompañó la subida de las bolsas.",
        "Los inversores retiraron $772.4 millones de los ETF de Bitcoin al contado en EE. UU. el jueves y el viernes, tras entradas de más de $1,000 millones a principios de semana.",
        "Las cripto pueden moverse rápido en torno a grandes eventos macro, y la Fed decide el miércoles.", "Fuente: Bloomberg"],
}
D_BTC = "2026-10-27T13:00:00Z"
for ch in ["en", "kh", "ms", "ru", "es", "fb"]:
    l = CH[ch][2]
    post("flash-btc", ch, D_BTC, BTC_CAP[l] + [RISK[l]], [btc_img[l]])
post("flash-btc", "ig", D_BTC, [], [btc_story], story=True)

# ------------------------------------------------------------ 2. Flash: AI trade week
AI = {
 "en": dict(tag="Markets", headline="The AI trade's *biggest* week",
            summary="Anthropic filed for an IPO as Alphabet, Microsoft and Amazon report earnings. Chip stocks rose more than 3% on Monday."),
 "ms": dict(tag="Pasaran", headline="Minggu *terbesar* dagangan AI",
            summary="Anthropic memfailkan IPO ketika Alphabet, Microsoft dan Amazon melaporkan pendapatan. Saham cip naik lebih 3% pada Isnin."),
 "ru": dict(tag="Рынки", headline="*Главная* неделя для AI-сектора",
            summary="Anthropic подала заявку на IPO, а Alphabet, Microsoft и Amazon отчитываются. В понедельник акции чипмейкеров выросли более чем на 3%."),
 "es": dict(tag="Mercados", headline="La semana *clave* de la IA",
            summary="Anthropic presentó su salida a bolsa mientras Alphabet, Microsoft y Amazon publican resultados. Los chips subieron más de un 3% el lunes."),
}
ai_img = {}
for l, c in AI.items():
    ai_img[l] = job("CarouselNews", dict(live=True, source="Reuters", date="26 Oct 2026", media=f"{M}/desk.jpg", meta="Flash", **c), f"flash-ai-{l}.png")
ai_story = job("StoryNews", dict(tag="Markets", live=True, headline=AI["en"]["headline"], summary=AI["en"]["summary"] + " Source: Reuters.",
                                 time="26 Oct 2026", media=f"{M}/desk.jpg"), "flash-ai-story.png")
AI_CAP = {
 "en": ["The AI trade's biggest week",
        "Anthropic filed for an IPO, reporting more than $16 billion in first-half revenue alongside substantial losses. The Nasdaq rose about 0.9% on Monday and the Philadelphia Semiconductor Index more than 3%.",
        "This week roughly a third of S&P 500 companies report, including Alphabet, Microsoft and Amazon. Investors want to know whether AI spending is paying off.",
        "Expect bigger moves in US indices around each release.", "Source: Reuters"],
 "ms": ["Minggu terbesar dagangan AI",
        "Anthropic memfailkan IPO, melaporkan hasil melebihi $16 bilion bagi separuh pertama tahun bersama kerugian yang besar. Nasdaq naik kira-kira 0.9% pada Isnin dan Indeks Semikonduktor Philadelphia lebih 3%.",
        "Minggu ini kira-kira satu pertiga syarikat S&P 500 melaporkan pendapatan, termasuk Alphabet, Microsoft dan Amazon. Pelabur mahu tahu sama ada perbelanjaan AI membuahkan hasil.",
        "Jangkakan pergerakan lebih besar pada indeks AS ketika setiap laporan.", "Sumber: Reuters"],
 "ru": ["Главная неделя для AI-сектора",
        "Anthropic подала заявку на IPO: выручка за первое полугодие превысила $16 млрд при значительных убытках. В понедельник Nasdaq вырос примерно на 0,9%, а индекс полупроводников Philadelphia более чем на 3%.",
        "На этой неделе отчитывается около трети компаний S&P 500, включая Alphabet, Microsoft и Amazon. Инвесторы хотят понять, окупаются ли расходы на AI.",
        "Вокруг каждого отчёта возможны более сильные движения индексов США.", "Источник: Reuters"],
 "es": ["La semana clave de la IA",
        "Anthropic presentó su salida a bolsa, con ingresos de más de $16,000 millones en el primer semestre y pérdidas importantes. El Nasdaq subió cerca de un 0.9% el lunes y el índice de semiconductores de Filadelfia más de un 3%.",
        "Esta semana publica resultados cerca de un tercio de las empresas del S&P 500, entre ellas Alphabet, Microsoft y Amazon. El mercado quiere saber si el gasto en IA da frutos.",
        "Espera movimientos más fuertes en los índices de EE. UU. en cada publicación.", "Fuente: Reuters"],
}
D_AI = "2026-10-28T06:00:00Z"
for ch in ["en", "kh", "ms", "ru", "es", "fb"]:
    l = CH[ch][2]
    post("flash-ai", ch, D_AI, AI_CAP[l] + [RISK[l]], [ai_img[l]])
post("flash-ai", "ig", D_AI, [], [ai_story], story=True)

# ------------------------------------------------------------ 3. IG Story: Fed countdown (posted 12:00 UTC, decision 18:00 UTC)
fed_story = job("StoryCountdown", dict(kicker="FOMC", title="Fed decision\n*today*", meta="28 Oct 2026",
                detail="Rate decision at 18:00 UTC, press conference at 18:30 UTC. Markets expect a hold.",
                values=[0, 6, 0, 0], showSticker=False), "story-fed-countdown.png")
post("story-fed", "ig", "2026-10-28T12:00:00Z", [], [fed_story], story=True)

# ------------------------------------------------------------ 4. IG Story: Thursday is stacked
thu_story = job("StoryNews", dict(tag="Today", live=False, headline="Thursday is *stacked*",
                summary="12:30 UTC: US Q3 GDP and September PCE inflation. 13:15 UTC: ECB rate decision. 13:45 UTC: ECB press conference.",
                time="29 Oct 2026", media=f"{M}/desk.jpg"), "story-thursday.png")
post("story-thursday", "ig", "2026-10-29T07:00:00Z", [], [thu_story], story=True)

# ------------------------------------------------------------ 5. IG Story: Telegram invite (link sticker added manually)
tg_story = job("StoryTelegram", dict(locale="en", channel="onfinkm", kicker="Telegram",
                heading="Our analysis,\nnow on *Telegram*.",
                items=["Daily analysis on FX, gold and indices", "Calendar alerts before NFP, CPI and FOMC", "Platform news first"]),
               "story-telegram-invite.png")
post("story-telegram", "ig", "2026-10-31T12:00:00Z", [], [tg_story], story=True)

# ------------------------------------------------------------ 6. Carousel: Position sizing (CTA: Telegram /onfinkm)
T = 8
ps = []
ps.append(job("CarouselCover", dict(kicker="Trading guide", title="Position sizing,\nwithout the *guesswork*.",
              subtitle="The math most beginners skip.", meta="Guide 001", media=f"{M}/ps-cover.jpg", index=1, total=T), "ps-01.png"))
ps.append(job("CarouselText", dict(kicker="Why it matters", heading="Win rate won't\n*save* you.", meta="Guide 001",
              body="A trader wins 60% of 50 trades and still blows the account. Three losers ran 80 pips each, four times the size of the 20-pip winners.\n\nOnce a trade is open, you control one thing: how much you risk.",
              index=2, total=T), "ps-02.png"))
ps.append(job("CarouselList", dict(kicker="The inputs", heading="Every formula needs\n*three* numbers.", meta="Guide 001",
              items=[{"title": "Account balance", "body": "Your equity before the trade."},
                     {"title": "Risk per trade", "body": "Most professionals use 0.5 to 2%."},
                     {"title": "Stop distance", "body": "Pips from your entry to your stop."}],
              index=3, total=T), "ps-03.png"))
ps.append(job("CarouselSteps", dict(kicker="Worked example", heading="Size a EUR/USD trade\nin *four* steps.", meta="Guide 001",
              steps=[{"title": "Set the dollar risk", "body": "$5,000 account × 1% = $50"},
                     {"title": "Measure the stop", "body": "20 pips from entry"},
                     {"title": "Find the pip value", "body": "$1 per pip on a mini lot"},
                     {"title": "Divide", "body": "$50 ÷ (20 × $1) = 2.5 mini lots"}],
              current=4, disclaimer=True, index=4, total=T), "ps-04.png"))
ps.append(job("CarouselCompare", dict(kicker="The fix", heading="Fixed lots vs\n*risk-based* sizing", meta="Guide 001",
              left={"label": "Fixed 0.10 lots", "items": ["10-pip stop risks about $10", "50-pip stop risks $50", "Risk changes every trade"]},
              right={"label": "Risk-based", "items": ["Decide the dollar risk first", "Wider stop, smaller lot", "Risk stays the same"]},
              index=5, total=T), "ps-05.png"))
ps.append(job("CarouselRates", dict(kicker="Drawdown", heading="Losing streaks\n*compound*.", meta="Guide 001",
              columns=["Risk per trade", "5 losses", "10 losses", "20 losses"],
              rows=[["0.5%", "-2.5%", "-4.9%", "-9.5%"], ["1%", "-4.9%", "-9.6%", "-18.2%"],
                    ["2%", "-9.6%", "-18.3%", "-33.2%"], ["5%", "-22.6%", "-40.1%", "-64.2%"]],
              footnote="Account drawdown after consecutive losses. Source: OnFin Editorial calculations.",
              disclaimer=True, index=6, total=T), "ps-06.png"))
ps.append(job("CarouselMyth", dict(kicker="Hidden trap", myth="Two pairs means two separate trades.",
              fact="EUR/USD and GBP/USD usually move together.", meta="Guide 001",
              body="Above 0.80 correlation, 2% on each is closer to a 3.5% bet on one view. Split your normal size across correlated positions.",
              index=7, total=T), "ps-07.png"))
ps.append(job("CarouselTelegram", dict(locale="en", channel="onfinkm", kicker="Telegram", meta="Guide 001",
              heading="More guides,\n*straight* to Telegram.",
              items=["Daily analysis on FX, gold and indices", "Calendar alerts before NFP, CPI and FOMC", "Platform news first"],
              index=8, total=T), "ps-08.png"))
PS_CAP = ["Position sizing, without the guesswork",
          "Most traders obsess over the entry, then guess the lot size. That guess decides whether a losing streak is a setback or the end of the account.",
          "Swipe for the formula, a worked EUR/USD example and the drawdown table every trader should know.",
          "Join our Telegram channel for more guides: t.me/onfinkm",
          "Full guide on blog.onfin.io",
          "#forextrading #riskmanagement #positionsizing #tradingeducation #onfin",
          FULL_RISK]
post("carousel-position-sizing", "ig", "2026-11-01T12:00:00Z", PS_CAP, ps)
alert = job("StoryAlert", dict(kicker="New guide", title="Position sizing,\nwithout the *guesswork*.", media=f"file://{OUT}/ps-01.png",
            cta="See the post", meta="Guide 001"), "story-alert-ps.png")
post("story-alert-ps", "ig", "2026-11-01T12:30:00Z", [], [alert], story=True)

# ------------------------------------------------------------ 7. RBA preview (Asia channels + FB)
RBA = {
 "en": dict(value="03:30", label="UTC, Tuesday 3 November: RBA decision",
            context="The Reserve Bank of Australia announces its rate decision with its quarterly Statement on Monetary Policy. AUD pairs can move sharply on the outcome."),
 "kh": dict(value="10:30", label="Cambodia time, Tuesday 3 November: RBA decision",
            context="The Reserve Bank of Australia announces its rate decision with its quarterly Statement on Monetary Policy. AUD pairs can move sharply on the outcome."),
 "ms": dict(value="11:30", label="Waktu Malaysia, Selasa 3 November: keputusan RBA",
            context="Reserve Bank of Australia mengumumkan keputusan kadar faedah bersama Penyata Dasar Monetari suku tahunan. Pasangan AUD boleh bergerak tajam."),
}
rba_img = {k: job("CarouselStat", dict(kicker="Central bank" if k != "ms" else "Bank pusat", meta="Tomorrow" if k != "ms" else "Esok", **v), f"rba-{k}.png") for k, v in RBA.items()}
RBA_CAP = {
 "en": ["RBA decides tomorrow", "The Reserve Bank of Australia announces its rate decision on Tuesday 3 November at 03:30 UTC, together with its quarterly Statement on Monetary Policy.",
        "Watch AUD/USD and AUD/JPY: the statement's tone on inflation and growth can move the Australian dollar as much as the decision itself.", NOTADV["en"], RISK["en"]],
 "kh": ["RBA decides tomorrow", "The Reserve Bank of Australia announces its rate decision on Tuesday 3 November at 10:30 Cambodia time, together with its quarterly Statement on Monetary Policy.",
        "Watch AUD/USD and AUD/JPY: the statement's tone on inflation and growth can move the Australian dollar as much as the decision itself.", NOTADV["en"], RISK["en"]],
 "ms": ["RBA buat keputusan esok", "Reserve Bank of Australia mengumumkan keputusan kadar faedah pada Selasa, 3 November jam 11:30 waktu Malaysia, bersama Penyata Dasar Monetari suku tahunan.",
        "Pantau AUD/USD dan AUD/JPY: nada kenyataan tentang inflasi dan pertumbuhan boleh menggerakkan dolar Australia sama kuat dengan keputusan itu sendiri.", NOTADV["ms"], RISK["ms"]],
}
D_RBA = "2026-11-02T10:00:00Z"
post("rba-preview", "en", D_RBA, RBA_CAP["en"], [rba_img["en"]])
post("rba-preview", "kh", D_RBA, RBA_CAP["kh"], [rba_img["kh"]])
post("rba-preview", "fb", D_RBA, RBA_CAP["kh"], [rba_img["kh"]])
post("rba-preview", "ms", D_RBA, RBA_CAP["ms"], [rba_img["ms"]])

if __name__ == "__main__":
    os.makedirs(OUT, exist_ok=True)
    json.dump(jobs, open(f"{S}/w1/jobs.json", "w"), ensure_ascii=False)
    json.dump(posts, open(f"{S}/w1/posts.json", "w"), ensure_ascii=False, indent=1)
    bad = [p["key"] + ":" + p["ch"] for p in posts for line in p["lines"] if any(c in line for c in "–—!")]
    emo = [p["key"] + ":" + p["ch"] for p in posts for line in p["lines"] if any(ord(c) > 0x2600 and ord(c) < 0x1FAFF and c not in "×÷" for c in line)]
    print(len(jobs), "renders,", len(posts), "posts; dash/! issues:", bad, "emoji:", emo)
