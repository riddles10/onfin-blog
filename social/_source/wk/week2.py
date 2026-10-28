"""Week 2 (3 to 9 Nov 2026). Genesis x3, central bank Thursday, NFP story, Sunday carousel (Guide 002)."""
from common import Week, S, NOTADV, RISK, FULL_RISK
import genesis_posts as GP

W = Week("w2")
M = f"file://{S}/w1/media"

# ------------------------------------------------------------------ Genesis: launch Tue, how it works Thu, math Sat
GP.launch(W, "2026-11-03")
GP.how_it_works(W, "2026-11-05")
GP.math(W, "2026-11-07")

# ------------------------------------------------------------------ Central bank Thursday (5 Nov): BNM 07:00, BoE 12:00, Banxico 19:00 UTC
def ev(t1, t2, t3, names, b3=None):
    e = [{"date": t1, "title": names[0]}, {"date": t2, "title": names[1], "current": True}, {"date": t3, "title": names[2]}]
    if b3:
        e[2]["body"] = b3
    return e
N = {"en": ["Bank Negara Malaysia (OPR)", "Bank of England", "Banxico (Mexico)"],
     "ms": ["Bank Negara Malaysia (OPR)", "Bank of England", "Banxico (Mexico)"],
     "ru": ["Банк Негара Малайзия", "Банк Англии", "Банк Мексики"]}
CB = {
 "en": dict(kicker="Today, times in UTC", heading="Three central banks,\n*one* Thursday.", meta="5 Nov 2026", events=ev("07:00", "12:00", "19:00", N["en"])),
 "kh": dict(kicker="Today, Cambodia time", heading="Three central banks,\n*one* Thursday.", meta="5 Nov 2026", events=ev("14:00", "19:00", "02:00", N["en"], "Friday")),
 "ms": dict(kicker="Hari ini, waktu Malaysia", heading="Tiga bank pusat,\n*satu* hari.", meta="5 Nov 2026", events=ev("15:00", "20:00", "03:00", N["ms"], "Jumaat")),
 "ru": dict(kicker="Сегодня, время МСК", heading="Три центробанка\nза *один* день.", meta="5 ноя 2026", events=ev("10:00", "15:00", "22:00", N["ru"])),
}
cb_img = {k: W.lib("CarouselTimeline", v, f"cb-thursday-{k}.png") for k, v in CB.items()}
cb_img["es"] = W.lib("CarouselStat", dict(kicker="Banco central", value="14:00", label="Bogotá y Lima, jueves 5 nov: decisión de Banxico", meta="Hoy",
                     context="El Banco de Inglaterra decide antes, a las 7:00. Los pares con MXN y GBP pueden moverse con fuerza en torno a cada anuncio."), "cb-thursday-es.png")
CB_CAP = {
 "en": ["Three central banks, one Thursday", "07:00 UTC: Bank Negara Malaysia rate decision, its last of 2026", "12:00 UTC: Bank of England decision and Monetary Policy Report",
        "19:00 UTC: Banxico decision", "Expect wider spreads and sharper moves in MYR, GBP and MXN pairs around each announcement.", NOTADV["en"], RISK["en"]],
 "kh": ["Three central banks, one Thursday", "14:00 Cambodia time: Bank Negara Malaysia rate decision, its last of 2026", "19:00: Bank of England decision and Monetary Policy Report",
        "02:00 Friday: Banxico decision", "Expect wider spreads and sharper moves in MYR, GBP and MXN pairs around each announcement.", NOTADV["en"], RISK["en"]],
 "ms": ["Tiga bank pusat, satu hari", "15:00 waktu Malaysia: keputusan OPR Bank Negara Malaysia, yang terakhir bagi 2026", "20:00: keputusan Bank of England dan Laporan Dasar Monetari",
        "03:00 Jumaat: keputusan Banxico", "Jangkakan spread lebih lebar dan pergerakan lebih tajam pada pasangan MYR, GBP dan MXN sekitar setiap pengumuman.", NOTADV["ms"], RISK["ms"]],
 "ru": ["Три центробанка за один день", "10:00 МСК: решение Банка Негара Малайзия, последнее в 2026 году", "15:00 МСК: решение Банка Англии и доклад о денежно-кредитной политике",
        "22:00 МСК: решение Банка Мексики", "Возможны расширенные спреды и резкие движения в парах с MYR, GBP и MXN вокруг каждого объявления.", NOTADV["ru"], RISK["ru"]],
 "es": ["Banxico decide hoy", "14:00 (Bogotá y Lima): decisión de tipos de Banxico", "Antes, a las 7:00, decide el Banco de Inglaterra y publica su Informe de Política Monetaria.",
        "Espera spreads más amplios y movimientos más bruscos en los pares con MXN y GBP en torno a cada anuncio.", NOTADV["es"], RISK["es"]],
}
for ch, lk, hh in [("en", "en", 4), ("kh", "kh", 4), ("fb", "kh", 4), ("ms", "ms", 4), ("ru", "ru", 6), ("es", "es", 11)]:
    W.post("cb-thursday", ch, f"2026-11-05T{hh:02d}:00:00Z", CB_CAP[lk], [cb_img[lk]])

# ------------------------------------------------------------------ NFP story (Fri 6 Nov, release 13:30 UTC)
nfp = W.lib("StoryCountdown", dict(kicker="US data", title="Jobs report\n*today*", meta="6 Nov 2026",
            detail="US nonfarm payrolls for October at 13:30 UTC. Expect fast moves in USD pairs, gold and US indices.",
            values=[0, 5, 30, 0], showSticker=False), "story-nfp.png")
W.post("story-nfp", "ig", "2026-11-06T08:00:00Z", [], [nfp], story=True)

# ------------------------------------------------------------------ Sunday carousel: Stop loss vs take profit (Guide 002)
TOT = 8
SL = {
 "en": dict(
  cover=dict(kicker="Trading guide", title="Stop loss vs take profit,\nset *properly*.", subtitle="Where to cut losses, and where to bank gains.", meta="Guide 002"),
  text=dict(kicker="Placement", heading="Structure beats\n*pip count*.",
            body="A 20-pip stop inside normal noise gets hit by random wicks. A 50-pip stop below a clean swing low survives the same move.\n\nAsk where the market proves your idea wrong, not how many pips feels comfortable."),
  list=dict(kicker="Where stops belong", heading="Three ways to place\na *smarter* stop.", items=[
      {"title": "Beyond the swing", "body": "Below a swing low for longs, above a swing high for shorts, with a 3 to 5 pip buffer."},
      {"title": "Volatility-adjusted", "body": "1.5x to 2x the ATR from entry. Volatile pairs get wider stops."},
      {"title": "On the server", "body": "A hard stop runs without you. A mental stop gives in to hope."}]),
  compare=dict(kicker="The fix", heading="Fixed pips vs\n*structure-based* stops",
               left={"label": "Same pips every time", "items": ["Ignores market structure", "Sits inside normal noise", "Hit before the move happens"]},
               right={"label": "Structure-based", "items": ["Placed where the idea fails", "Buffer for wicks", "Lot size adjusts, risk stays fixed"]}),
  steps=dict(kicker="Taking profit", heading="Three ways to\n*bank* a winner.", steps=[
      {"title": "Fixed target", "body": "Best in ranges. You know your R before entry"},
      {"title": "Trailing stop", "body": "Best in trends. Follows price, locks in gains"},
      {"title": "Partial exit", "body": "Close half at 1:1, move the stop to breakeven"}]),
  rates=dict(kicker="Risk reward", heading="The win rate you need\nto *break even*.", columns=["Risk : reward", "Break-even win rate"],
             rows=[["1:1", "50%"], ["1:1.5", "40%"], ["1:2", "33%"], ["1:3", "25%"], ["1:5", "17%"]],
             footnote="Break-even win rate = 1 ÷ (1 + reward/risk), before spreads and commissions. Source: OnFin Editorial calculations."),
  myth=dict(kicker="Common mistake", myth="Widening the stop gives the trade room to work.", fact="It turns a defined risk into an open-ended one.",
            body="If you weren't willing to risk 80 pips at entry, don't accept it after the fact. Set the stop and leave it.", mythLabel="Myth", factLabel="Fact"),
  end=dict(kicker="Instagram", heading="Follow us on\n*Instagram*.", body="A new trading guide every Sunday, plus market news during the week.", actions=["Save", "Share", "Follow @onfinkm"]),
 ),
 "ru": dict(
  cover=dict(kicker="Гайд по трейдингу", title="Стоп-лосс и тейк-профит:\n*как ставить*.", subtitle="Где фиксировать убыток, а где забирать прибыль.", meta="Гайд 002"),
  text=dict(kicker="Размещение", heading="Структура важнее\n*числа пипсов*.",
            body="Стоп в 20 пипсов внутри обычного шума выбивают случайные тени. Стоп в 50 пипсов за чётким минимумом переживает то же движение.\n\nСпрашивайте, где рынок опровергает вашу идею, а не сколько пипсов кажется удобным."),
  list=dict(kicker="Где ставить стоп", heading="Три способа поставить\n*умный* стоп.", items=[
      {"title": "За экстремумом", "body": "Ниже минимума для покупок, выше максимума для продаж, с запасом 3 до 5 пипсов."},
      {"title": "По волатильности", "body": "1,5 до 2 ATR от входа. Волатильным парам нужен стоп шире."},
      {"title": "На сервере", "body": "Жёсткий стоп сработает без вас. Мысленный стоп уступает надежде."}]),
  compare=dict(kicker="Решение", heading="Фиксированные пипсы\nили *по структуре*",
               left={"label": "Всегда одни пипсы", "items": ["Игнорирует структуру рынка", "Стоит внутри шума", "Срабатывает до движения"]},
               right={"label": "По структуре", "items": ["Там, где идея ломается", "Запас на тени", "Меняется лот, риск тот же"]}),
  steps=dict(kicker="Фиксация прибыли", heading="Три способа\n*забрать* прибыль.", steps=[
      {"title": "Фиксированная цель", "body": "Лучше во флэте. R известен до входа"},
      {"title": "Трейлинг-стоп", "body": "Лучше в тренде. Идёт за ценой и фиксирует прибыль"},
      {"title": "Частичный выход", "body": "Закройте половину на 1:1, стоп в безубыток"}]),
  rates=dict(kicker="Риск и прибыль", heading="Какой винрейт нужен,\nчтобы *выйти в ноль*.", columns=["Риск : прибыль", "Винрейт для безубытка"],
             rows=[["1:1", "50%"], ["1:1,5", "40%"], ["1:2", "33%"], ["1:3", "25%"], ["1:5", "17%"]],
             footnote="Винрейт для безубытка = 1 ÷ (1 + прибыль/риск), без учёта спредов и комиссий. Источник: расчёты OnFin Editorial."),
  myth=dict(kicker="Частая ошибка", myth="Если отодвинуть стоп, сделке будет где развернуться.", fact="Так ограниченный риск становится неограниченным.",
            body="Если вы не готовы были рисковать 80 пипсами при входе, не соглашайтесь на это потом. Поставьте стоп и не трогайте его.", mythLabel="Миф", factLabel="Факт"),
  end=dict(kicker="Instagram", heading="Подписывайтесь\nв *Instagram*.", body="Новый гайд каждое воскресенье и новости рынков в течение недели.", actions=["Сохранить", "Поделиться", "Подписаться"]),
 ),
 "es": dict(
  cover=dict(kicker="Guía de trading", title="Stop loss y take profit,\n*bien puestos*.", subtitle="Dónde cortar pérdidas y dónde asegurar ganancias.", meta="Guía 002"),
  text=dict(kicker="Ubicación", heading="La estructura pesa más\nque los *pips*.",
            body="Un stop de 20 pips dentro del ruido normal salta con cualquier mecha. Uno de 50 pips bajo un mínimo claro aguanta el mismo movimiento.\n\nPregúntate dónde el mercado demuestra que tu idea falla, no cuántos pips te resultan cómodos."),
  list=dict(kicker="Dónde va el stop", heading="Tres formas de poner\nun stop *más inteligente*.", items=[
      {"title": "Más allá del swing", "body": "Bajo un mínimo en compras, sobre un máximo en ventas, con 3 a 5 pips de margen."},
      {"title": "Según la volatilidad", "body": "1.5 a 2 veces el ATR desde la entrada. Pares volátiles, stops más amplios."},
      {"title": "En el servidor", "body": "Un stop real se ejecuta sin ti. Un stop mental cede a la esperanza."}]),
  compare=dict(kicker="La solución", heading="Pips fijos vs stops\n*según la estructura*",
               left={"label": "Siempre los mismos pips", "items": ["Ignora la estructura", "Queda dentro del ruido", "Salta antes del movimiento"]},
               right={"label": "Según la estructura", "items": ["Donde la idea falla", "Margen para las mechas", "Cambia el lote, no el riesgo"]}),
  steps=dict(kicker="Tomar ganancias", heading="Tres formas de\n*asegurar* una ganancia.", steps=[
      {"title": "Objetivo fijo", "body": "Mejor en rangos. Conoces tu R antes de entrar"},
      {"title": "Trailing stop", "body": "Mejor en tendencias. Sigue al precio y asegura ganancias"},
      {"title": "Salida parcial", "body": "Cierra la mitad en 1:1 y lleva el stop a breakeven"}]),
  rates=dict(kicker="Riesgo beneficio", heading="El porcentaje de aciertos\npara *no perder*.", columns=["Riesgo : beneficio", "Aciertos para breakeven"],
             rows=[["1:1", "50%"], ["1:1.5", "40%"], ["1:2", "33%"], ["1:3", "25%"], ["1:5", "17%"]],
             footnote="Aciertos para breakeven = 1 ÷ (1 + beneficio/riesgo), sin contar spreads ni comisiones. Fuente: cálculos de OnFin Editorial."),
  myth=dict(kicker="Error común", myth="Ampliar el stop le da espacio a la operación.", fact="Convierte un riesgo definido en uno abierto.",
            body="Si no estabas dispuesto a arriesgar 80 pips al entrar, no lo aceptes después. Pon el stop y déjalo.", mythLabel="Mito", factLabel="Realidad"),
  end=dict(kicker="Instagram", heading="Síguenos en\n*Instagram*.", body="Una guía nueva cada domingo y noticias del mercado durante la semana.", actions=["Guardar", "Compartir", "Seguir @onfinkm"]),
 ),
 "ms": dict(
  cover=dict(kicker="Panduan dagangan", title="Stop loss vs take profit,\n*dengan betul*.", subtitle="Di mana memotong kerugian, di mana mengunci keuntungan.", meta="Panduan 002"),
  text=dict(kicker="Penempatan", heading="Struktur lebih penting\ndaripada *bilangan pip*.",
            body="Stop 20 pip di dalam hingar biasa akan terkena oleh sumbu rawak. Stop 50 pip di bawah swing low yang jelas bertahan dalam pergerakan yang sama.\n\nTanya di mana pasaran membuktikan idea anda salah, bukan berapa pip yang terasa selesa."),
  list=dict(kicker="Di mana stop diletakkan", heading="Tiga cara meletakkan\nstop yang *lebih bijak*.", items=[
      {"title": "Melepasi swing", "body": "Di bawah swing low untuk beli, di atas swing high untuk jual, dengan penampan 3 hingga 5 pip."},
      {"title": "Ikut volatiliti", "body": "1.5x hingga 2x ATR dari harga masuk. Pasangan volatil perlu stop lebih luas."},
      {"title": "Di pelayan", "body": "Hard stop berjalan tanpa anda. Stop dalam fikiran tunduk kepada harapan."}]),
  compare=dict(kicker="Penyelesaian", heading="Pip tetap vs stop\n*berasaskan struktur*",
               left={"label": "Pip sama setiap kali", "items": ["Abaikan struktur pasaran", "Di dalam hingar biasa", "Terkena sebelum pergerakan"]},
               right={"label": "Berasaskan struktur", "items": ["Di mana idea gagal", "Penampan untuk sumbu", "Lot berubah, risiko tetap"]}),
  steps=dict(kicker="Ambil untung", heading="Tiga cara\n*mengunci* keuntungan.", steps=[
      {"title": "Sasaran tetap", "body": "Terbaik dalam julat. Anda tahu R sebelum masuk"},
      {"title": "Trailing stop", "body": "Terbaik dalam trend. Ikut harga, kunci keuntungan"},
      {"title": "Keluar separa", "body": "Tutup separuh pada 1:1, alih stop ke breakeven"}]),
  rates=dict(kicker="Risiko ganjaran", heading="Kadar menang yang perlu\nuntuk *pulang modal*.", columns=["Risiko : ganjaran", "Kadar menang pulang modal"],
             rows=[["1:1", "50%"], ["1:1.5", "40%"], ["1:2", "33%"], ["1:3", "25%"], ["1:5", "17%"]],
             footnote="Kadar menang pulang modal = 1 ÷ (1 + ganjaran/risiko), sebelum spread dan komisen. Sumber: pengiraan OnFin Editorial."),
  myth=dict(kicker="Kesilapan biasa", myth="Meluaskan stop memberi ruang kepada dagangan.", fact="Ia menukar risiko yang jelas kepada risiko terbuka.",
            body="Jika anda tidak sanggup mengambil risiko 80 pip semasa masuk, jangan terimanya kemudian. Letak stop dan biarkan.", mythLabel="Mitos", factLabel="Fakta"),
  end=dict(kicker="Instagram", heading="Ikuti kami di\n*Instagram*.", body="Panduan dagangan baharu setiap Ahad, serta berita pasaran sepanjang minggu.", actions=["Simpan", "Kongsi", "Ikuti @onfinkm"]),
 ),
}


def sl_set(l, d, end_job):
    meta = d["cover"]["meta"]
    f = lambda i: f"sl-{l}-{i:02d}.png"
    return [W.lib("CarouselCover", dict(media=f"{M}/sltp-cover.jpg", index=1, total=TOT, **d["cover"]), f(1)),
            W.lib("CarouselText", dict(meta=meta, index=2, total=TOT, **d["text"]), f(2)),
            W.lib("CarouselList", dict(meta=meta, index=3, total=TOT, **d["list"]), f(3)),
            W.lib("CarouselCompare", dict(meta=meta, index=4, total=TOT, **d["compare"]), f(4)),
            W.lib("CarouselSteps", dict(meta=meta, current=3, disclaimer=FULL_RISK[l], index=5, total=TOT, **d["steps"]), f(5)),
            W.lib("CarouselRates", dict(meta=meta, disclaimer=FULL_RISK[l], index=6, total=TOT, **d["rates"]), f(6)),
            W.lib("CarouselMyth", dict(meta=meta, index=7, total=TOT, **d["myth"]), f(7)),
            end_job(meta, f(8))]


sl = {l: sl_set(l, d, lambda meta, out, d=d: W.lib("CarouselEnd", dict(meta=meta, index=8, total=TOT, **d["end"]), out)) for l, d in SL.items()}
sl_fb = sl["en"][:7] + [W.lib("CarouselTelegram", dict(locale="en", channel="onfinkm", kicker="Telegram", meta="Guide 002",
                        heading="More guides,\n*straight* to Telegram.", items=["Daily analysis on FX, gold and indices", "Calendar alerts before NFP, CPI and FOMC", "Platform news first"],
                        index=8, total=TOT), "sl-en-08-telegram.png")]
BLOG = "https://blog.onfin.io/{}/stop-loss-vs-take-profit-how-to-set-them-correctly"
SL_CAP = {
 "en": ["Stop loss vs take profit, set properly", "Most traders know they should use both. Far fewer know where to put them.",
        "Swipe for structure-based stops, three ways to take profit and the break-even math behind risk reward."],
 "ru": ["Стоп-лосс и тейк-профит: как ставить", "Большинство трейдеров знают, что нужны оба ордера. Гораздо меньше знают, где их ставить.",
        "Внутри: стопы по структуре рынка, три способа забрать прибыль и математика безубытка."],
 "es": ["Stop loss y take profit, bien puestos", "Casi todos los traders saben que deben usar ambos. Muchos menos saben dónde ponerlos.",
        "Desliza para ver stops según la estructura, tres formas de tomar ganancias y las cuentas del riesgo beneficio."],
 "ms": ["Stop loss vs take profit, dengan betul", "Kebanyakan pedagang tahu mereka perlu guna kedua-duanya. Jauh lebih sedikit yang tahu di mana meletakkannya.",
        "Lihat stop berasaskan struktur, tiga cara ambil untung dan matematik pulang modal di sebalik risiko ganjaran."],
}
GUIDE = {"en": "Full guide", "ru": "Полный гайд", "es": "Guía completa", "ms": "Panduan penuh"}
FOLLOW = {"en": "Follow us on Instagram: instagram.com/onfinkm", "ru": "Подписывайтесь в Instagram: instagram.com/onfinkm",
          "es": "Síguenos en Instagram: instagram.com/onfinkm", "ms": "Ikuti kami di Instagram: instagram.com/onfinkm"}
W.post("carousel-sltp", "ig", "2026-11-08T12:00:00Z",
       SL_CAP["en"] + ["Follow @onfinkm for a new guide every Sunday.", "Full guide on blog.onfin.io",
                       "#forextrading #stoploss #takeprofit #riskmanagement #tradingeducation #onfin", FULL_RISK["en"]], sl["en"])
W.post("carousel-sltp", "fb", "2026-11-08T08:00:00Z",
       SL_CAP["en"] + [f"{GUIDE['en']}: {BLOG.format('en')}", "Join our Telegram channel: https://t.me/onfinkm", FULL_RISK["en"]], sl_fb)
for ch, l, hh in [("en", "en", 8), ("kh", "en", 8), ("ms", "ms", 8), ("ru", "ru", 9), ("es", "es", 14)]:
    W.post("carousel-sltp", ch, f"2026-11-08T{hh:02d}:00:00Z", SL_CAP[l] + [f"{GUIDE[l]}: {BLOG.format(l)}", FOLLOW[l], FULL_RISK[l]], sl[l])
alert = W.lib("StoryAlert", dict(kicker="New guide", title="Stop loss vs take profit,\nset *properly*.", media=f"file://{W.out}/sl-en-01.png",
              cta="See the post", meta="Guide 002"), "story-alert-sltp.png")
W.post("story-alert-sltp", "ig", "2026-11-08T12:30:00Z", [], [alert], story=True)

if __name__ == "__main__":
    W.save()
