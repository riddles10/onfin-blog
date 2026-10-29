"""Fact check: stock trades by US presidents in office (viral watcher.guru post).
IG carousel (EN, 8 slides) + single infographic (EN, MS, RU, ES) for Facebook and Telegram.
python3 prestrades.py  -> writes lib_jobs.json under scratchpad/prestrades and renders them."""
import json, os, subprocess, sys
from common import Week, S, FULL_RISK

M = f"file://{S}/w1/media"
META = "Fact check"
TOT = 8
SHORT_RISK = {"en": "Not investment advice. CFDs are high-risk; you may lose money.",
              "ms": "Bukan nasihat pelaburan. CFD berisiko tinggi; anda mungkin kehilangan wang.",
              "ru": "Не является инвестиционной рекомендацией. CFD относятся к высокорисковым инструментам; вы можете потерять деньги.",
              "es": "No es asesoramiento de inversión. Los CFD son de alto riesgo; puedes perder dinero."}

NAMES = {"en": ["Bill Clinton", "George W. Bush", "Barack Obama", "Donald Trump", "Joe Biden", "Donald Trump"],
         "ms": ["Bill Clinton", "George W. Bush", "Barack Obama", "Donald Trump", "Joe Biden", "Donald Trump"],
         "ru": ["Билл Клинтон", "Джордж Буш", "Барак Обама", "Дональд Трамп", "Джо Байден", "Дональд Трамп"],
         "es": ["Bill Clinton", "George W. Bush", "Barack Obama", "Donald Trump", "Joe Biden", "Donald Trump"]}
YEARS = {"en": ["1993 to 2001", "2001 to 2009", "2009 to 2017", "2017 to 2021", "2021 to 2025", "2025 to now"],
         "ms": ["1993 hingga 2001", "2001 hingga 2009", "2009 hingga 2017", "2017 hingga 2021", "2021 hingga 2025", "2025 hingga kini"],
         "ru": ["с 1993 по 2001", "с 2001 по 2009", "с 2009 по 2017", "с 2017 по 2021", "с 2021 по 2025", "с 2025 года"],
         "es": ["1993 a 2001", "2001 a 2009", "2009 a 2017", "2017 a 2021", "2021 a 2025", "2025 a hoy"]}
CLAIMS = {"en": ["Zero trades", "431 trades", "28,700 trades"], "ms": ["Sifar dagangan", "431 dagangan", "28,700 dagangan"],
          "ru": ["Ноль сделок", "431 сделка", "28 700 сделок"], "es": ["Cero operaciones", "431 operaciones", "28,700 operaciones"]}
VERD = {"en": ["Misleading", "Mostly true", "Unverified", "True"], "ms": ["Mengelirukan", "Hampir benar", "Tidak disahkan", "Benar"],
        "ru": ["Вводит в заблуждение", "В основном правда", "Не подтверждено", "Правда"], "es": ["Engañoso", "Mayormente cierto", "Sin verificar", "Cierto"]}
HEAD = {"en": ("Fact check", "Presidents and stock trades,\n*fact checked*.", ["President", "Viral claim", "Verdict"]),
        "ms": ("Semakan fakta", "Presiden dan dagangan saham,\n*disemak fakta*.", ["Presiden", "Dakwaan tular", "Keputusan"]),
        "ru": ("Проверка фактов", "Президенты и акции:\n*проверка фактов*.", ["Президент", "Утверждение", "Вердикт"]),
        "es": ("Verificación", "Presidentes y acciones,\n*verificado*.", ["Presidente", "Afirmación viral", "Veredicto"])}
FOOT = {"en": "Clinton and Bush used blind trusts run by independent trustees. Obama and Biden held no individual stocks. 28,700 is Bloomberg's count of trades by Trump or his money managers, Jan 2025 to Jun 2026. Sources: Bloomberg, ABC News, Fortune, Snopes.",
        "ms": "Clinton dan Bush menggunakan amanah buta yang diurus pemegang amanah bebas. Obama dan Biden tidak memegang saham individu. 28,700 ialah kiraan Bloomberg bagi dagangan oleh Trump atau pengurus wangnya, Jan 2025 hingga Jun 2026. Sumber: Bloomberg, ABC News, Fortune, Snopes.",
        "ru": "Клинтон и Буш использовали слепые трасты с независимыми управляющими. У Обамы и Байдена не было отдельных акций. 28 700: подсчёт Bloomberg сделок Трампа или его управляющих, с января 2025 по июнь 2026. Источники: Bloomberg, ABC News, Fortune, Snopes.",
        "es": "Clinton y Bush usaron fideicomisos ciegos gestionados por fiduciarios independientes. Obama y Biden no tenían acciones individuales. 28,700 es el conteo de Bloomberg de operaciones de Trump o sus gestores, de enero 2025 a junio 2026. Fuentes: Bloomberg, ABC News, Fortune, Snopes."}
KIND = ["bad", "bad", "ok", "unk", "ok", "yes"]
CI = [0, 0, 0, 1, 0, 2]
VI = [0, 0, 1, 2, 1, 3]


def table(l):
    k, hd, cols = HEAD[l]
    rows = [dict(name=NAMES[l][i], years=YEARS[l][i], claim=CLAIMS[l][CI[i]], verdict=VERD[l][VI[i]], kind=KIND[i]) for i in range(6)]
    return dict(kicker=k, heading=hd, columns=cols, rows=rows, footnote=FOOT[l])


EN = [
 ("CarouselCover", dict(kicker="Fact check", title="Do US presidents\n*trade stocks* in office?",
                        subtitle="A viral post says only one does. We checked every claim.", media=f"{M}/pres-trades-cover.jpg")),
 ("CarouselMyth", dict(kicker="Clinton and Bush", myth="Clinton and George W. Bush made zero trades in office.",
                       fact="Misleading. Their assets sat in blind trusts.",
                       body="Independent trustees managed the money. They could buy and sell, but the presidents had no say, and the trades were not disclosed one by one.",
                       mythLabel="Claim", factLabel="Fact check")),
 ("CarouselMyth", dict(kicker="Obama and Biden", myth="Obama and Biden made zero trades in office.",
                       fact="Mostly true. They held no individual stocks.",
                       body="Obama sold his stocks and held Treasuries and index funds (Fortune). Biden's disclosures show no stocks owned directly (Snopes, OGE filings).",
                       mythLabel="Claim", factLabel="Fact check")),
 ("CarouselMyth", dict(kicker="Trump, first term", myth="Trump made 431 trades from 2017 to 2021.",
                       fact="Unverified. We could not find a source for 431.",
                       body="ABC News reports his 2017 disclosure listed 86 stock transactions. None of the reporting we found adds up to 431.",
                       mythLabel="Claim", factLabel="Fact check")),
 ("CarouselStat", dict(kicker="Trump, second term", value="28,700", label="trades by Trump or his money managers in 17 months",
                       context="All members of Congress together reported about 22,200 in the same period. The White House says outside managers run the accounts through automated portfolios. Source: Bloomberg review of financial disclosures, Jan 2025 to Jun 2026.")),
 ("FactTable", table("en")),
 ("CarouselList", dict(kicker="Reading the filings", heading="What these filings\n*can't* tell you.",
                       items=[{"title": "Weeks late", "body": "Trades can be reported up to 45 days after they happen."},
                              {"title": "Ranges, not amounts", "body": "Values come in broad bands, such as $1,001 to $15,000."},
                              {"title": "Who decided", "body": "A filing does not say who chose the trade."}])),
 ("CarouselEnd", dict(kicker="Instagram", heading="Follow us on\n*Instagram*.",
                      body="Fact checks, trading guides and market news every week.", actions=["Save", "Share", "Follow @onfinkm"])),
]

W = Week("prestrades")
for i, (tpl, props) in enumerate(EN, 1):
    W.lib(tpl, dict(meta=META, index=i, total=TOT, **props), f"prestrades-en-{i:02d}.png")
for l in ("en", "ms", "ru", "es"):
    W.lib("FactTable", dict(table(l), meta=HEAD[l][0], risk=SHORT_RISK[l], hsize=54, pw={"ru": 345}.get(l, 300)), f"prestrades-info-{l}.png")
W.save()
for j in W.lib_jobs:
    txt = json.dumps(j["props"], ensure_ascii=False)
    if any(c in txt for c in "–—!"):
        print("BAD CHAR", j["out"])
r = subprocess.run(["node", "render_page.js", f"{S}/{W.name}/lib_jobs.json"], cwd=f"{S}/igtools",
                   env={**os.environ, "LIB": f"{S}/iglib/library", "PAGE": "render_ft.html"}, capture_output=True, text=True)
print(r.stdout[-300:], r.stderr[-800:])
