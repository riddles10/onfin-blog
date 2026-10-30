"""Alphabet worst day since 2004 IPO (29 Oct 2026): IG carousel EN (5) + single card EN, MS, RU, ES. python3 goog_build.py"""
import os, subprocess
from common import Week, S

PH = f"file://{S}/goog/googleplex.jpg"
CR = "Photo: Asoundd, CC BY-SA 4.0, Wikimedia Commons"
W = Week("goog")
m = dict(meta="Market news", total=5)
RISK = {"en": "Not investment advice. CFDs are high-risk; you may lose money.",
        "ms": "Bukan nasihat pelaburan. CFD berisiko tinggi; anda mungkin kehilangan wang.",
        "ru": "Не является инвестиционной рекомендацией. CFD относятся к высокорисковым инструментам; вы можете потерять деньги.",
        "es": "No es asesoramiento de inversión. Los CFD son de alto riesgo; puedes perder dinero."}
W.lib("HackCover", dict(m, index=1, photo=PH, credit=CR, top=440, bsize=230, kicker="Market news", asof="29 Oct", big="-12.6%", bigLabel="Alphabet shares, 29 Oct",
      title="Google's parent just had its *worst day ever*.", subtitle="Its steepest drop since the 2004 IPO."), "goog-en-01.png")
W.lib("HackStat", dict(m, index=2, kicker="The damage", rows=[
      {"value": "$500B", "color": "var(--down)", "label": "wiped off Alphabet's value in one day", "note": "Second only to Nvidia's $589B, Jan 2025. Source: NBC News"},
      {"value": "$2.12", "label": "earnings per share vs $3.01 expected", "note": "Q3 2026. Source: Yahoo Finance"}]), "goog-en-02.png")
W.lib("HackList", dict(m, index=3, kicker="What spooked investors", heading="Three numbers\n*behind the drop*.", dot="var(--down)", pad=32,
      items=["Ads: $82.0B vs $83.5B expected", "Free cash flow: -$9.1B in Q3", "AI spending: $200B+ this year"],
      note="Sources: Yahoo Finance, NBC News"), "goog-en-03.png")
W.lib("HackStat", dict(m, index=4, kicker="The bright spot", rows=[
      {"value": "+103%", "color": "var(--accent)", "label": "Google Cloud revenue growth", "note": "Source: Yahoo Finance"},
      {"value": "$30.7B", "label": "Cloud revenue, above the $29.1B estimate", "note": "Q3 2026. Source: Yahoo Finance"}]), "goog-en-04.png")
W.lib("HackList", dict(m, index=5, kicker="The lesson", heading="Earnings can move\n*even giants*.", pad=32,
      items=["Know when earnings are due", "Gaps can skip past your stop", "Size positions for surprises"], risk=RISK["en"]), "goog-en-05.png")

C = {
 "en": dict(meta="Market news", kicker="Market news", asof="29 Oct", title="Alphabet's worst day\n*since its 2004 IPO*.", big="-12.6%", bigLabel="Alphabet shares, 29 Oct",
            tiles=[{"value": "$500B", "color": "var(--down)", "label": "market value wiped out in one day"}, {"value": "$2.12", "label": "EPS vs $3.01 expected"},
                   {"value": "-$9.1B", "color": "var(--down)", "label": "free cash flow in Q3"}, {"value": "+103%", "color": "var(--accent)", "label": "Google Cloud growth"}],
            tip="Earnings can gap even the biggest stocks. Know the dates before you hold through one.",
            footnote="Second-largest one-day loss in US history, after Nvidia's $589B (Jan 2025). Sources: NBC News, Yahoo Finance. " + CR + "."),
 "ms": dict(meta="Berita pasaran", kicker="Pasaran", asof="29 Okt", title="Hari terburuk Alphabet\n*sejak IPO 2004*.", big="-12.6%", bigLabel="saham Alphabet, 29 Okt",
            tiles=[{"value": "$500 bilion", "color": "var(--down)", "label": "nilai pasaran lenyap dalam sehari"}, {"value": "$2.12", "label": "EPS berbanding jangkaan $3.01"},
                   {"value": "-$9.1 bilion", "color": "var(--down)", "label": "aliran tunai bebas dalam S3"}, {"value": "+103%", "color": "var(--accent)", "label": "pertumbuhan Google Cloud"}],
            tip="Laporan pendapatan boleh menjatuhkan saham gergasi sekalipun. Ketahui tarikhnya sebelum memegang posisi melaluinya.",
            footnote="Kerugian sehari kedua terbesar dalam sejarah AS, selepas Nvidia $589 bilion (Jan 2025). Sumber: NBC News, Yahoo Finance. Foto: Asoundd, CC BY-SA 4.0, Wikimedia Commons."),
 "ru": dict(meta="Новости рынка", kicker="Рынки", asof="29 окт", title="Худший день Alphabet\n*с IPO 2004 года*.", big="-12,6%", bsize=140, bigLabel="акции Alphabet, 29 окт",
            tiles=[{"value": "$500 млрд", "color": "var(--down)", "label": "капитализации потеряно за один день"}, {"value": "$2,12", "label": "прибыль на акцию при прогнозе $3,01"},
                   {"value": "-$9,1 млрд", "color": "var(--down)", "label": "свободный денежный поток в III кв."}, {"value": "+103%", "color": "var(--accent)", "label": "рост Google Cloud"}],
            tip="Отчётность может обрушить даже гигантов. Узнавайте даты отчётов заранее.",
            footnote="Второе по величине падение капитализации за день в истории США, после Nvidia ($589 млрд, янв. 2025). Источники: NBC News, Yahoo Finance. Фото: Asoundd, CC BY-SA 4.0, Wikimedia Commons."),
 "es": dict(meta="Noticias del mercado", kicker="Mercados", asof="29 oct", title="El peor día de Alphabet\n*desde su IPO de 2004*.", big="-12.6%", bsize=140, bigLabel="acciones de Alphabet, 29 oct",
            tiles=[{"value": "$500,000 M", "color": "var(--down)", "label": "de valor de mercado perdidos en un día"}, {"value": "$2.12", "label": "BPA frente a $3.01 esperado"},
                   {"value": "-$9,100 M", "color": "var(--down)", "label": "flujo de caja libre en el 3T"}, {"value": "+103%", "color": "var(--accent)", "label": "crecimiento de Google Cloud"}],
            tip="Los resultados pueden hundir incluso a los gigantes. Conoce las fechas antes de mantener una posición.",
            footnote="Segunda mayor pérdida de valor en un día en EE. UU., tras Nvidia ($589,000 M, ene. 2025). Fuentes: NBC News, Yahoo Finance. Foto: Asoundd, CC BY-SA 4.0, Wikimedia Commons."),
}
for l, c in C.items():
    W.lib("HackCard", dict(c, photo=PH, top=260, band=420, risk=RISK[l]), f"goog-card-{l}.png")
W.save()
r = subprocess.run(["node", "render_page.js", f"{S}/{W.name}/lib_jobs.json"], cwd=f"{S}/igtools",
                   env={**os.environ, "LIB": f"{S}/iglib/library", "PAGE": "render_ft.html"}, capture_output=True, text=True)
print(r.stdout[-200:], r.stderr[-800:])
