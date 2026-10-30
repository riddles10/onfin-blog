"""Binance hack (29 Oct 2026) news: IG carousel EN (5 slides) + single card in EN, MS, RU, ES. python3 hack_build.py"""
import os, subprocess
from common import Week, S

W = Week("hack")
T = 5
m = dict(meta="Market news", total=T)
RISK = {"en": "Not investment advice. Crypto and CFDs are high-risk; you may lose money.",
        "ms": "Bukan nasihat pelaburan. Kripto dan CFD berisiko tinggi; anda mungkin kehilangan wang.",
        "ru": "Не является инвестиционной рекомендацией. Криптовалюты и CFD относятся к высокорисковым инструментам; вы можете потерять деньги.",
        "es": "No es asesoramiento de inversión. Las criptomonedas y los CFD son de alto riesgo; puedes perder dinero."}
W.lib("HackCover", dict(m, index=1, kicker="Breaking", asof="30 Oct", big="$5.9B", bigLabel="Estimated stolen, per Chainalysis",
      title="Binance hit by the *biggest crypto hack* on record.", subtitle="What we know so far."), "hack-en-01.png")
W.lib("HackStat", dict(m, index=2, kicker="The numbers", rows=[
      {"value": "$5.9B", "color": "var(--down)", "label": "estimated stolen at the time of the attack", "note": "Source: Chainalysis. Final loss not yet confirmed"},
      {"value": "$3B", "color": "var(--accent)", "label": "frozen so far by Binance, Tether, Circle and others", "note": "Source: Binance, 30 Oct"}]), "hack-en-02.png")
W.lib("HackList", dict(m, index=3, kicker="What Binance says", heading="Where things *stand*.",
      pad=32, items=["Deposits, withdrawals paused", "Pledges to cover all losses", "Warns users about scam links", "Binance.US says it is unaffected"],
      note="Sources: Binance, Binance.US, CoinDesk, Cointelegraph. 30 Oct"), "hack-en-03.png")
W.lib("HackMovers", dict(m, index=4, kicker="Market reaction", heading="Crypto *fell* on the news.",
      rows=[{"sym": "BNB", "price": "about $693", "chg": "-8%"}, {"sym": "ETH", "price": "about $2,211", "chg": "-5.7%"}, {"sym": "BTC", "price": "about $76,937", "chg": "-4.9%"}],
      note="24-hour change at 01:19 UTC, 30 Oct. Source: Cointelegraph"), "hack-en-04.png")
W.lib("HackList", dict(m, index=5, kicker="Stay safe", heading="Scammers move fast\n*after a hack*.", dot="var(--down)",
      pad=32, items=["Ignore refund or recovery links", "Use official apps and sites only", "Never share your seed phrase or 2FA codes", "Turn on 2FA and withdrawal whitelists"],
      risk=RISK["en"]), "hack-en-05.png")

C = {
 "en": dict(meta="Market news", kicker="Breaking", asof="30 Oct, 02:00 UTC", title="Binance hit by the biggest\ncrypto hack *on record*.",
            big="$5.9B", bigLabel="estimated stolen, per Chainalysis",
            tiles=[{"value": "Paused", "label": "Deposits and withdrawals"}, {"value": "$3B", "color": "var(--accent)", "label": "frozen so far, per Binance"},
                   {"value": "Covered", "color": "var(--accent)", "label": "Binance says it will cover all losses"}, {"value": "-8%", "color": "var(--down)", "label": "BNB in 24 hours (BTC -4.9%)"}],
            tip="Scammers follow hacks. Ignore refund links and never share your seed phrase.",
            footnote="Binance.US says it is not affected. Final loss not yet confirmed. Sources: Chainalysis, Binance, CoinDesk, Cointelegraph."),
 "ms": dict(meta="Berita pasaran", kicker="Terkini", asof="30 Okt, 02:00 UTC", title="Binance: godam kripto\n*terbesar dalam sejarah*.",
            big="$5.9 bilion", bsize=112, bigLabel="anggaran dicuri, menurut Chainalysis",
            tiles=[{"value": "Digantung", "label": "Deposit dan pengeluaran"}, {"value": "$3 bilion", "color": "var(--accent)", "label": "dibekukan setakat ini, menurut Binance"},
                   {"value": "Ditanggung", "color": "var(--accent)", "label": "Binance berkata akan menanggung semua kerugian"}, {"value": "-8%", "color": "var(--down)", "label": "BNB dalam 24 jam (BTC -4.9%)"}],
            tip="Penipu muncul selepas godaman. Abaikan pautan bayaran balik dan jangan kongsi frasa benih anda.",
            footnote="Binance.US berkata ia tidak terjejas. Kerugian akhir belum disahkan. Sumber: Chainalysis, Binance, CoinDesk, Cointelegraph."),
 "ru": dict(meta="Новости рынка", kicker="Срочно", asof="30 окт, 02:00 UTC", title="Binance: крупнейший\n*криптовзлом в истории*.", tsize=62,
            big="$5,9 млрд", bsize=118, bigLabel="оценка похищенного, по данным Chainalysis",
            tiles=[{"value": "Пауза", "label": "Депозиты и выводы приостановлены"}, {"value": "$3 млрд", "color": "var(--accent)", "label": "заморожено, по данным Binance"},
                   {"value": "Компенсация", "color": "var(--accent)", "label": "Binance обещает покрыть все убытки"}, {"value": "-8%", "color": "var(--down)", "label": "BNB за 24 часа (BTC -4,9%)"}],
            tip="После взломов активизируются мошенники. Игнорируйте ссылки на «возврат средств» и не сообщайте никому сид-фразу.",
            footnote="Binance.US сообщает, что не затронута. Итоговый ущерб пока не подтверждён. Источники: Chainalysis, Binance, CoinDesk, Cointelegraph."),
 "es": dict(meta="Noticias del mercado", kicker="Última hora", asof="30 oct, 02:00 UTC", title="Binance: el mayor hackeo\n*cripto de la historia*.",
            big="$5,900 M", bsize=118, bigLabel="millones de dólares robados, estimado de Chainalysis",
            tiles=[{"value": "Pausados", "label": "Depósitos y retiros"}, {"value": "$3,000 M", "color": "var(--accent)", "label": "congelados hasta ahora, según Binance"},
                   {"value": "Cubiertas", "color": "var(--accent)", "label": "Binance dice que cubrirá todas las pérdidas"}, {"value": "-8%", "color": "var(--down)", "label": "BNB en 24 horas (BTC -4.9%)"}],
            tip="Tras un hackeo llegan las estafas. Ignora enlaces de reembolso y nunca compartas tu frase semilla.",
            footnote="Binance.US dice que no está afectada. La pérdida final aún no está confirmada. Fuentes: Chainalysis, Binance, CoinDesk, Cointelegraph."),
}
for l, c in C.items():
    W.lib("HackCard", dict(c, risk=RISK[l]), f"hack-card-{l}.png")
W.save()
r = subprocess.run(["node", "render_page.js", f"{S}/{W.name}/lib_jobs.json"], cwd=f"{S}/igtools",
                   env={**os.environ, "LIB": f"{S}/iglib/library", "PAGE": "render_ft.html"}, capture_output=True, text=True)
print(r.stdout[-200:], r.stderr[-800:])
