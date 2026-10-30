"""Photo-led fact check (v2): IG carousel EN (8 slides) + 2x3 portrait grid infographic in EN, MS, RU, ES.
python3 pres_build.py -> renders into scratchpad/prestrades2/out"""
import os, subprocess
from common import Week, S

P = lambda k: f"file://{S}/portraits/p_{k}.jpg"
PH = "Photo: official White House portrait"
RISK = {"en": "Not investment advice. CFDs are high-risk; you may lose money.",
        "ms": "Bukan nasihat pelaburan. CFD berisiko tinggi; anda mungkin kehilangan wang.",
        "ru": "Не является инвестиционной рекомендацией. CFD относятся к высокорисковым инструментам; вы можете потерять деньги.",
        "es": "No es asesoramiento de inversión. Los CFD son de alto riesgo; puedes perder dinero."}
W = Week("prestrades2")
T = 8
m = dict(meta="Fact check", total=T)
W.lib("PresCover", dict(m, index=1, kicker="Fact check", title="Do US presidents\n*trade stocks*?",
      subtitle="Six viral claims, checked one by one.",
      photos=[{"src": P(k)} for k in ("clinton", "bush", "obama", "trump1", "biden", "trump2")]), "pres-en-01.png")
SL = [
 dict(photo=P("clinton"), name="Bill Clinton", years="1993 to 2001", claim="Zero trades", verdict="Misleading", kind="bad",
      line="His money sat in a blind trust. Trustees could trade; he had no say.", source="Source: US Office of Government Ethics · " + PH),
 dict(photo=P("bush"), name="George W. Bush", years="2001 to 2009", claim="Zero trades", verdict="Misleading", kind="bad", nsize=96,
      line="Same story: a blind trust, run by an independent trustee.", source="Source: US Office of Government Ethics · " + PH),
 dict(photo=P("obama"), name="Barack Obama", years="2009 to 2017", claim="Zero trades", verdict="Mostly true", kind="ok", pos="50% 10%",
      line="No individual stocks. Treasuries and index funds only.", source="Source: Fortune · " + PH),
 dict(photo=P("trump1"), name="Donald Trump", years="2017 to 2021", claim="431 trades", verdict="Unverified", kind="unk",
      line="We found no source for 431. His 2017 filing listed 86 stock trades.", source="Source: ABC News · " + PH),
 dict(photo=P("biden"), name="Joe Biden", years="2021 to 2025", claim="Zero trades", verdict="Mostly true", kind="ok",
      line="No stocks owned directly in his disclosures.", source="Sources: Snopes, OGE filings · " + PH),
 dict(photo=P("trump2"), shift=170, fade=44, name="Donald Trump", years="2025 to now", claim="28,700 trades", verdict="True", kind="yes", big="28,700",
      line="Trades by Trump or his money managers in 17 months. The White House says outside managers run them.",
      source="Source: Bloomberg, Jan 2025 to Jun 2026 · " + PH),
]
for i, s in enumerate(SL, 2):
    W.lib("PresSlide", dict(m, index=i, claimLabel="Viral claim", **s), f"pres-en-{i:02d}.png")
W.lib("PresVs", dict(m, index=8, heading="More trades than\n*all of Congress*.",
      bars=[{"label": "Trump and his money managers", "value": 28700, "text": "28,700", "photo": P("trump2"), "hi": True},
            {"label": "All 535 members of Congress", "value": 22200, "text": "22,200"}],
      source="Jan 2025 to Jun 2026. Source: Bloomberg review of financial disclosures",
      cta="Follow @onfinkm for more fact checks.", risk=RISK["en"]), "pres-en-08.png")

G = {
 "en": dict(meta="Fact check", title="Presidents and stocks,\n*fact checked*.",
            names=["Clinton", "Bush", "Obama", "Trump", "Biden", "Trump"],
            years=["1993 to 2001", "2001 to 2009", "2009 to 2017", "2017 to 2021", "2021 to 2025", "2025 to now"],
            claims=["Claim: zero trades", "Claim: zero trades", "Claim: zero trades", "Claim: 431 trades", "Claim: zero trades", "Claim: 28,700 trades"],
            verd=["Misleading", "Misleading", "Mostly true", "Unverified", "Mostly true", "True"], vs=21,
            foot="Clinton and Bush used blind trusts. 28,700: Bloomberg count of trades by Trump or his money managers, Jan 2025 to Jun 2026. Sources: Bloomberg, ABC News, Fortune, Snopes. Photos: White House."),
 "ms": dict(meta="Semakan fakta", title="Presiden AS dan saham,\n*disemak fakta*.",
            names=["Clinton", "Bush", "Obama", "Trump", "Biden", "Trump"],
            years=["1993 hingga 2001", "2001 hingga 2009", "2009 hingga 2017", "2017 hingga 2021", "2021 hingga 2025", "2025 hingga kini"],
            claims=["Dakwaan: sifar dagangan", "Dakwaan: sifar dagangan", "Dakwaan: sifar dagangan", "Dakwaan: 431 dagangan", "Dakwaan: sifar dagangan", "Dakwaan: 28,700 dagangan"],
            verd=["Mengelirukan", "Mengelirukan", "Hampir benar", "Tidak disahkan", "Hampir benar", "Benar"], vs=19,
            foot="Clinton dan Bush menggunakan amanah buta. 28,700: kiraan Bloomberg bagi dagangan oleh Trump atau pengurus wangnya, Jan 2025 hingga Jun 2026. Sumber: Bloomberg, ABC News, Fortune, Snopes. Foto: Rumah Putih."),
 "ru": dict(meta="Проверка фактов", title="Президенты США и акции:\n*проверка фактов*.",
            names=["Клинтон", "Буш", "Обама", "Трамп", "Байден", "Трамп"],
            years=["с 1993 по 2001", "с 2001 по 2009", "с 2009 по 2017", "с 2017 по 2021", "с 2021 по 2025", "с 2025 года"],
            claims=["Утверждение: 0 сделок", "Утверждение: 0 сделок", "Утверждение: 0 сделок", "Утверждение: 431 сделка", "Утверждение: 0 сделок", "Утверждение: 28 700 сделок"],
            verd=["Вводит в заблуждение", "Вводит в заблуждение", "В основном правда", "Не подтверждено", "В основном правда", "Правда"], vs=14,
            foot="Клинтон и Буш использовали слепые трасты. 28 700: подсчёт Bloomberg сделок Трампа или его управляющих, с января 2025 по июнь 2026. Источники: Bloomberg, ABC News, Fortune, Snopes. Фото: Белый дом."),
 "es": dict(meta="Verificación", title="Presidentes y acciones,\n*verificado*.",
            names=["Clinton", "Bush", "Obama", "Trump", "Biden", "Trump"],
            years=["1993 a 2001", "2001 a 2009", "2009 a 2017", "2017 a 2021", "2021 a 2025", "2025 a hoy"],
            claims=["Afirmación: cero operaciones", "Afirmación: cero operaciones", "Afirmación: cero operaciones", "Afirmación: 431 operaciones", "Afirmación: cero operaciones", "Afirmación: 28,700 operaciones"],
            verd=["Engañoso", "Engañoso", "Mayormente cierto", "Sin verificar", "Mayormente cierto", "Cierto"], vs=17,
            foot="Clinton y Bush usaron fideicomisos ciegos. 28,700: conteo de Bloomberg de operaciones de Trump o sus gestores, enero 2025 a junio 2026. Fuentes: Bloomberg, ABC News, Fortune, Snopes. Fotos: Casa Blanca."),
}
KIND = ["bad", "bad", "ok", "unk", "ok", "yes"]
PHOTOS = ["clinton", "bush", "obama", "trump1", "biden", "trump2"]
for l, g in G.items():
    tiles = [dict(photo=P(PHOTOS[i]), pos=("50% 40%" if PHOTOS[i] == "trump2" else None), name=g["names"][i], years=g["years"][i], claim=g["claims"][i], verdict=g["verd"][i], kind=KIND[i], vsize=g["vs"])
             for i in range(6)]
    W.lib("PresGrid", dict(meta=g["meta"], title=g["title"], tiles=tiles, footnote=g["foot"], risk=RISK[l]), f"pres-grid-{l}.png")
W.save()
r = subprocess.run(["node", "render_page.js", f"{S}/{W.name}/lib_jobs.json"], cwd=f"{S}/igtools",
                   env={**os.environ, "LIB": f"{S}/iglib/library", "PAGE": "render_ft.html"}, capture_output=True, text=True)
print(r.stdout[-200:], r.stderr[-800:])
