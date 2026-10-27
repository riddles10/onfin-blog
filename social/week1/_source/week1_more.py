"""Week 1, every locale on every channel: extends week1.py (imported) with
Fed + Thursday cards for all channels, the position sizing carousel in MS/RU/ES for Telegram,
an English Facebook version, and RBA for RU/ES + an Instagram Story."""
import json, os
import week1 as W
from week1 import job, post, RISK, NOTADV, FULL_RISK, M, S

# RBA posts are rebuilt below together with the RU/ES versions
W.posts[:] = [p for p in W.posts if p["key"] != "rba-preview"]

TG_TIME = {"en": 8, "kh": 8, "ms": 8, "ru": 9, "es": 14, "fb": 8}

# ------------------------------------------------------------------ Fed decision today (Wed 28 Oct)
FED = {
 "en": dict(value="18:00", label="UTC, Wednesday 28 October: Fed decision", meta="Today",
            context="Markets expect the Fed to hold rates. The press conference starts 30 minutes later."),
 "kh": dict(value="01:00", label="Cambodia time, Thursday 29 October: Fed decision", meta="Overnight",
            context="Markets expect the Fed to hold rates. The press conference starts 30 minutes later."),
 "ms": dict(value="02:00", label="Waktu Malaysia, Khamis 29 Oktober: keputusan Fed", meta="Malam ini",
            context="Pasaran menjangkakan Fed mengekalkan kadar. Sidang media bermula 30 minit kemudian."),
 "ru": dict(value="21:00", label="МСК, среда 28 октября: решение ФРС", meta="Сегодня",
            context="Рынок ждёт, что ФРС сохранит ставку. Пресс-конференция начнётся через 30 минут."),
 "es": dict(value="13:00", label="Bogotá y Lima, miércoles 28 oct: decisión de la Fed", meta="Hoy",
            context="El mercado espera que la Fed mantenga los tipos. La conferencia de prensa empieza 30 minutos después."),
}
fed_img = {k: job("CarouselStat", dict(kicker="FOMC", **v), f"fed-{k}.png") for k, v in FED.items()}
FED_CAP = {
 "en": ["Fed decision today", "The Federal Reserve announces its rate decision at 18:00 UTC, with Jerome Powell's press conference at 18:30 UTC.",
        "Markets expect a hold, so the focus is on what the Fed signals for December. Expect wider spreads and fast moves in USD pairs and gold around the release.", NOTADV["en"], RISK["en"]],
 "kh": ["Fed decision tonight", "The Federal Reserve announces its rate decision at 01:00 Cambodia time (Thursday), with the press conference at 01:30.",
        "Markets expect a hold, so the focus is on what the Fed signals for December. Expect wider spreads and fast moves in USD pairs and gold around the release.", NOTADV["en"], RISK["en"]],
 "ms": ["Keputusan Fed malam ini", "Federal Reserve mengumumkan keputusan kadar faedah jam 02:00 waktu Malaysia (Khamis), diikuti sidang media jam 02:30.",
        "Pasaran menjangkakan kadar dikekalkan, jadi tumpuan ialah isyarat Fed untuk Disember. Jangkakan spread lebih lebar dan pergerakan pantas pada pasangan USD dan emas.", NOTADV["ms"], RISK["ms"]],
 "ru": ["Решение ФРС сегодня", "ФРС объявит решение по ставке в 21:00 МСК, пресс-конференция начнётся в 21:30 МСК.",
        "Рынок ждёт сохранения ставки, поэтому главное: сигналы ФРС на декабрь. Возможны расширенные спреды и резкие движения в парах с USD и золоте.", NOTADV["ru"], RISK["ru"]],
 "es": ["Decisión de la Fed hoy", "La Reserva Federal anuncia su decisión de tipos a las 13:00 en Bogotá y Lima, con la conferencia de prensa a las 13:30.",
        "El mercado espera que mantenga los tipos, así que la atención está en lo que la Fed deje ver para diciembre. Espera spreads más amplios y movimientos rápidos en pares con USD y en el oro.", NOTADV["es"], RISK["es"]],
}
for ch, lk in [("en", "en"), ("kh", "kh"), ("fb", "kh"), ("ms", "ms"), ("ru", "ru"), ("es", "es")]:
    post("fed-today", ch, "2026-10-28T12:00:00Z", FED_CAP[lk], [fed_img[lk]])

# ------------------------------------------------------------------ Thursday is stacked (Thu 29 Oct 06:00 UTC)
def ev(lang, t1, t2, t3):
    L = {"en": ["US Q3 GDP and September PCE inflation", "ECB rate decision", "ECB press conference"],
         "ms": ["KDNK AS suku ketiga dan inflasi PCE September", "Keputusan kadar ECB", "Sidang media ECB"],
         "ru": ["ВВП США за III квартал и инфляция PCE за сентябрь", "Решение ЕЦБ по ставке", "Пресс-конференция ЕЦБ"],
         "es": ["PIB de EE. UU. del 3T e inflación PCE de septiembre", "Decisión de tipos del BCE", "Conferencia de prensa del BCE"]}[lang]
    return [{"date": t1, "title": L[0]}, {"date": t2, "title": L[1], "current": True}, {"date": t3, "title": L[2]}]
THU = {
 "en": dict(kicker="Today, times in UTC", heading="Thursday is *stacked*.", meta="29 Oct 2026", events=ev("en", "12:30", "13:15", "13:45")),
 "kh": dict(kicker="Today, Cambodia time", heading="Thursday is *stacked*.", meta="29 Oct 2026", events=ev("en", "19:30", "20:15", "20:45")),
 "ms": dict(kicker="Hari ini, waktu Malaysia", heading="Khamis yang *padat*.", meta="29 Okt 2026", events=ev("ms", "20:30", "21:15", "21:45")),
 "ru": dict(kicker="Сегодня, время МСК", heading="Насыщенный *четверг*.", meta="29 окт 2026", events=ev("ru", "15:30", "16:15", "16:45")),
 "es": dict(kicker="Hoy, hora de Bogotá y Lima", heading="Un jueves *cargado*.", meta="29 oct 2026", events=ev("es", "7:30", "8:15", "8:45")),
}
thu_img = {k: job("CarouselTimeline", v, f"thursday-{k}.png") for k, v in THU.items()}
THU_CAP = {
 "en": ["Thursday is stacked", "12:30 UTC: US Q3 GDP and September PCE inflation", "13:15 UTC: ECB rate decision", "13:45 UTC: ECB press conference",
        "Three market movers in 75 minutes, a day after the Fed. Expect EUR/USD and gold to be busy.", NOTADV["en"], RISK["en"]],
 "kh": ["Thursday is stacked", "19:30 Cambodia time: US Q3 GDP and September PCE inflation", "20:15: ECB rate decision", "20:45: ECB press conference",
        "Three market movers in 75 minutes, a day after the Fed. Expect EUR/USD and gold to be busy.", NOTADV["en"], RISK["en"]],
 "ms": ["Khamis yang padat", "20:30 waktu Malaysia: KDNK AS suku ketiga dan inflasi PCE September", "21:15: Keputusan kadar ECB", "21:45: Sidang media ECB",
        "Tiga penggerak pasaran dalam 75 minit, sehari selepas Fed. Jangkakan EUR/USD dan emas aktif.", NOTADV["ms"], RISK["ms"]],
 "ru": ["Насыщенный четверг", "15:30 МСК: ВВП США за III квартал и инфляция PCE за сентябрь", "16:15 МСК: решение ЕЦБ по ставке", "16:45 МСК: пресс-конференция ЕЦБ",
        "Три важных события за 75 минут, на следующий день после ФРС. EUR/USD и золото могут быть активны.", NOTADV["ru"], RISK["ru"]],
 "es": ["Un jueves cargado", "7:30 (Bogotá y Lima): PIB de EE. UU. del 3T e inflación PCE de septiembre", "8:15: decisión de tipos del BCE", "8:45: conferencia de prensa del BCE",
        "Tres eventos clave en 75 minutos, un día después de la Fed. Espera movimiento en el EUR/USD y el oro.", NOTADV["es"], RISK["es"]],
}
for ch, lk in [("en", "en"), ("kh", "kh"), ("fb", "kh"), ("ms", "ms"), ("ru", "ru"), ("es", "es")]:
    post("thursday-stacked", ch, "2026-10-29T06:00:00Z", THU_CAP[lk], [thu_img[lk]])

# ------------------------------------------------------------------ Position sizing carousel, translated
T = 8
PS = {
 "ms": dict(
  cover=dict(kicker="Panduan dagangan", title="Saiz posisi,\ntanpa *meneka*.", subtitle="Matematik yang selalu dilangkau pemula.", meta="Panduan 001"),
  why=dict(kicker="Kenapa penting", heading="Kadar menang tidak\nakan *menyelamatkan* anda.",
           body="Seorang pedagang menang 60% daripada 50 dagangan tetapi tetap kehilangan akaunnya. Tiga dagangan rugi bergerak 80 pip setiap satu, empat kali saiz dagangan untung 20 pip.\n\nSebaik dagangan dibuka, anda hanya mengawal satu perkara: berapa banyak yang anda risikokan."),
  inputs=dict(kicker="Input", heading="Setiap formula perlukan\n*tiga* nombor.",
              items=[{"title": "Baki akaun", "body": "Ekuiti anda sebelum dagangan."}, {"title": "Risiko setiap dagangan", "body": "Kebanyakan profesional guna 0.5 hingga 2%."},
                     {"title": "Jarak stop", "body": "Pip dari harga masuk ke stop anda."}]),
  steps=dict(kicker="Contoh", heading="Saiz dagangan EUR/USD\ndalam *empat* langkah.",
             steps=[{"title": "Tetapkan risiko", "body": "Akaun $5,000 × 1% = $50"}, {"title": "Ukur stop", "body": "20 pip dari harga masuk"},
                    {"title": "Cari nilai pip", "body": "$1 setiap pip pada lot mini"}, {"title": "Bahagi", "body": "$50 ÷ (20 × $1) = 2.5 lot mini"}],
             disclaimer="Amaran risiko: dagangan forex dan CFD atas margin membawa risiko tinggi dan mungkin tidak sesuai untuk semua pelabur. Anda mungkin kehilangan lebih daripada pelaburan awal anda."),
  compare=dict(kicker="Penyelesaian", heading="Lot tetap vs saiz\n*berasaskan risiko*",
               left={"label": "Lot tetap 0.10", "items": ["Stop 10 pip berisiko kira-kira $10", "Stop 50 pip berisiko $50", "Risiko berubah setiap dagangan"]},
               right={"label": "Berasaskan risiko", "items": ["Tetapkan risiko dolar dahulu", "Stop lebih jauh, lot lebih kecil", "Risiko kekal sama"]}),
  rates=dict(kicker="Drawdown", heading="Kerugian berturut-turut\n*berganda*.", columns=["Risiko setiap dagangan", "5 rugi", "10 rugi", "20 rugi"],
             rows=[["0.5%", "-2.5%", "-4.9%", "-9.5%"], ["1%", "-4.9%", "-9.6%", "-18.2%"], ["2%", "-9.6%", "-18.3%", "-33.2%"], ["5%", "-22.6%", "-40.1%", "-64.2%"]],
             footnote="Drawdown akaun selepas kerugian berturut-turut. Sumber: pengiraan OnFin Editorial.",
             disclaimer="Amaran risiko: dagangan forex dan CFD atas margin membawa risiko tinggi dan mungkin tidak sesuai untuk semua pelabur. Anda mungkin kehilangan lebih daripada pelaburan awal anda."),
  myth=dict(kicker="Perangkap tersembunyi", myth="Dua pasangan bermakna dua dagangan berasingan.", fact="EUR/USD dan GBP/USD biasanya bergerak bersama.",
            body="Pada korelasi melebihi 0.80, 2% pada setiap satu lebih hampir kepada pertaruhan 3.5% pada satu pandangan. Bahagikan saiz biasa anda antara posisi berkorelasi.",
            mythLabel="Mitos", factLabel="Fakta"),
  end=dict(kicker="Instagram", heading="Ikuti kami di\n*Instagram*.", body="Panduan, berita pasaran dan kemas kini platform setiap minggu.", actions=["Simpan", "Kongsi", "Ikuti @onfin.io"]),
 ),
 "ru": dict(
  cover=dict(kicker="Гайд по трейдингу", title="Размер позиции\n*без догадок*.", subtitle="Математика, которую пропускают новички.", meta="Гайд 001"),
  why=dict(kicker="Почему это важно", heading="Винрейт вас\nне *спасёт*.",
           body="Трейдер выигрывает 60% из 50 сделок и всё равно сливает счёт. Три убыточные сделки прошли по 80 пипсов, в четыре раза больше прибыльных по 20 пипсов.\n\nКогда сделка открыта, вы управляете только одним: сколько рискуете."),
  inputs=dict(kicker="Исходные данные", heading="Любой формуле нужны\n*три* числа.",
              items=[{"title": "Баланс счёта", "body": "Ваш капитал до сделки."}, {"title": "Риск на сделку", "body": "Большинство профессионалов рискуют от 0,5 до 2%."},
                     {"title": "Расстояние до стопа", "body": "Пипсы от входа до стоп-лосса."}]),
  steps=dict(kicker="Пример", heading="Размер сделки по EUR/USD\nза *четыре* шага.",
             steps=[{"title": "Задайте риск в долларах", "body": "Счёт $5 000 × 1% = $50"}, {"title": "Измерьте стоп", "body": "20 пипсов от входа"},
                    {"title": "Найдите стоимость пипса", "body": "$1 за пипс на мини-лоте"}, {"title": "Разделите", "body": "$50 ÷ (20 × $1) = 2,5 мини-лота"}],
             disclaimer="Предупреждение о рисках: торговля форекс и CFD с использованием маржи сопряжена с высоким риском и подходит не всем инвесторам. Вы можете потерять больше первоначальных вложений."),
  compare=dict(kicker="Решение", heading="Фиксированный лот или\n*расчёт от риска*",
               left={"label": "Фиксированные 0,10 лота", "items": ["Стоп 10 пипсов: риск около $10", "Стоп 50 пипсов: риск $50", "Риск меняется в каждой сделке"]},
               right={"label": "От риска", "items": ["Сначала задайте риск в долларах", "Шире стоп, меньше лот", "Риск остаётся тем же"]}),
  rates=dict(kicker="Просадка", heading="Серии убытков\n*накапливаются*.", columns=["Риск на сделку", "5 убытков", "10 убытков", "20 убытков"],
             rows=[["0,5%", "-2,5%", "-4,9%", "-9,5%"], ["1%", "-4,9%", "-9,6%", "-18,2%"], ["2%", "-9,6%", "-18,3%", "-33,2%"], ["5%", "-22,6%", "-40,1%", "-64,2%"]],
             footnote="Просадка счёта после серии убытков. Источник: расчёты OnFin Editorial.",
             disclaimer="Предупреждение о рисках: торговля форекс и CFD с использованием маржи сопряжена с высоким риском и подходит не всем инвесторам. Вы можете потерять больше первоначальных вложений."),
  myth=dict(kicker="Скрытая ловушка", myth="Две пары значит две независимые сделки.", fact="EUR/USD и GBP/USD обычно движутся вместе.",
            body="При корреляции выше 0,80 по 2% на каждую пару ближе к ставке в 3,5% на одну идею. Делите обычный объём между коррелированными позициями.",
            mythLabel="Миф", factLabel="Факт"),
  end=dict(kicker="Instagram", heading="Подписывайтесь\nв *Instagram*.", body="Гайды, новости рынков и обновления платформы каждую неделю.", actions=["Сохранить", "Поделиться", "Подписаться"]),
 ),
 "es": dict(
  cover=dict(kicker="Guía de trading", title="Tamaño de posición,\nsin *adivinar*.", subtitle="Las matemáticas que muchos principiantes se saltan.", meta="Guía 001"),
  why=dict(kicker="Por qué importa", heading="El porcentaje de aciertos\nno te *salvará*.",
           body="Un trader gana el 60% de 50 operaciones y aun así quema la cuenta. Tres pérdidas recorrieron 80 pips cada una, cuatro veces el tamaño de las ganancias de 20 pips.\n\nCon la operación abierta solo controlas una cosa: cuánto arriesgas."),
  inputs=dict(kicker="Los datos", heading="Toda fórmula necesita\n*tres* números.",
              items=[{"title": "Saldo de la cuenta", "body": "Tu capital antes de operar."}, {"title": "Riesgo por operación", "body": "La mayoría de profesionales usa entre 0.5 y 2%."},
                     {"title": "Distancia del stop", "body": "Pips desde la entrada hasta tu stop."}]),
  steps=dict(kicker="Ejemplo", heading="Calcula una operación en\nEUR/USD en *cuatro* pasos.",
             steps=[{"title": "Define el riesgo", "body": "Cuenta de $5,000 × 1% = $50"}, {"title": "Mide el stop", "body": "20 pips desde la entrada"},
                    {"title": "Busca el valor del pip", "body": "$1 por pip en un minilote"}, {"title": "Divide", "body": "$50 ÷ (20 × $1) = 2.5 minilotes"}],
             disclaimer="Advertencia de riesgo: operar forex y CFD con margen conlleva un alto nivel de riesgo y puede no ser adecuado para todos los inversores. Puedes perder más que tu inversión inicial."),
  compare=dict(kicker="La solución", heading="Lotes fijos vs tamaño\n*según el riesgo*",
               left={"label": "0.10 lotes fijos", "items": ["Un stop de 10 pips arriesga unos $10", "Un stop de 50 pips arriesga $50", "El riesgo cambia en cada operación"]},
               right={"label": "Según el riesgo", "items": ["Define primero el riesgo en dólares", "Stop más amplio, lote más pequeño", "El riesgo se mantiene"]}),
  rates=dict(kicker="Drawdown", heading="Las rachas perdedoras\nse *acumulan*.", columns=["Riesgo por operación", "5 pérdidas", "10 pérdidas", "20 pérdidas"],
             rows=[["0.5%", "-2.5%", "-4.9%", "-9.5%"], ["1%", "-4.9%", "-9.6%", "-18.2%"], ["2%", "-9.6%", "-18.3%", "-33.2%"], ["5%", "-22.6%", "-40.1%", "-64.2%"]],
             footnote="Drawdown de la cuenta tras pérdidas consecutivas. Fuente: cálculos de OnFin Editorial.",
             disclaimer="Advertencia de riesgo: operar forex y CFD con margen conlleva un alto nivel de riesgo y puede no ser adecuado para todos los inversores. Puedes perder más que tu inversión inicial."),
  myth=dict(kicker="Trampa oculta", myth="Dos pares son dos operaciones distintas.", fact="EUR/USD y GBP/USD suelen moverse juntos.",
            body="Con una correlación superior a 0.80, un 2% en cada uno se parece más a una apuesta del 3.5% a una sola idea. Reparte tu tamaño habitual entre posiciones correlacionadas.",
            mythLabel="Mito", factLabel="Realidad"),
  end=dict(kicker="Instagram", heading="Síguenos en\n*Instagram*.", body="Guías, noticias del mercado y novedades de la plataforma cada semana.", actions=["Guardar", "Compartir", "Seguir @onfin.io"]),
 ),
}
EN_END = dict(kicker="Instagram", heading="Follow us on\n*Instagram*.", body="Guides, market news and platform updates every week.", actions=["Save", "Share", "Follow @onfin.io"])

def ps_set(lang, d, cta):
    meta = d["cover"]["meta"]
    fn = lambda i: f"ps-{lang}-{i:02d}.png"
    imgs = [job("CarouselCover", dict(media=f"{M}/ps-cover.jpg", index=1, total=T, **d["cover"]), fn(1)),
            job("CarouselText", dict(meta=meta, index=2, total=T, **d["why"]), fn(2)),
            job("CarouselList", dict(meta=meta, index=3, total=T, **d["inputs"]), fn(3)),
            job("CarouselSteps", dict(meta=meta, current=4, index=4, total=T, **d["steps"]), fn(4)),
            job("CarouselCompare", dict(meta=meta, index=5, total=T, **d["compare"]), fn(5)),
            job("CarouselRates", dict(meta=meta, index=6, total=T, **d["rates"]), fn(6)),
            job("CarouselMyth", dict(meta=meta, index=7, total=T, **d["myth"]), fn(7))]
    imgs.append(job(cta[0], dict(meta=meta, index=8, total=T, **cta[1]), fn(8)))
    return imgs

ps_tg = {l: ps_set(l, PS[l], ("CarouselEnd", PS[l]["end"])) for l in ("ms", "ru", "es")}
EN_IMGS = [f"{W.OUT}/ps-0{i}.png" for i in range(1, 8)]
en_end = job("CarouselEnd", dict(meta="Guide 001", index=8, total=T, **EN_END), "ps-en-08-instagram.png")
ps_tg["en"] = EN_IMGS + [en_end]          # Telegram EN/KH: Instagram-follow CTA
ps_fb = [f"{W.OUT}/ps-0{i}.png" for i in range(1, 9)]  # Facebook: Telegram /onfinkm CTA

PS_CAP = {
 "en": ["Position sizing, without the guesswork",
        "Most traders obsess over the entry, then guess the lot size. That guess decides whether a losing streak is a setback or the end of the account.",
        "Swipe for the formula, a worked EUR/USD example and the drawdown table every trader should know.",
        "Full guide: https://blog.onfin.io/en/position-sizing-forex-math-beginners-skip", "Follow us on Instagram: instagram.com/onfin.io", FULL_RISK],
 "fb": ["Position sizing, without the guesswork",
        "Most traders obsess over the entry, then guess the lot size. That guess decides whether a losing streak is a setback or the end of the account.",
        "Swipe for the formula, a worked EUR/USD example and the drawdown table every trader should know.",
        "Full guide: https://blog.onfin.io/en/position-sizing-forex-math-beginners-skip", "Join our Telegram channel: https://t.me/onfinkm", FULL_RISK],
 "ms": ["Saiz posisi, tanpa meneka",
        "Kebanyakan pedagang terlalu fokus pada harga masuk, kemudian meneka saiz lot. Tekaan itu menentukan sama ada siri kerugian hanya halangan kecil atau penamat akaun.",
        "Lihat formula, contoh EUR/USD dan jadual drawdown yang perlu diketahui setiap pedagang.",
        "Panduan penuh: https://blog.onfin.io/ms/position-sizing-forex-math-beginners-skip", "Ikuti kami di Instagram: instagram.com/onfin.io",
        "Amaran risiko: dagangan forex dan CFD atas margin membawa risiko tinggi dan mungkin tidak sesuai untuk semua pelabur. Anda mungkin kehilangan lebih daripada pelaburan awal anda."],
 "ru": ["Размер позиции без догадок",
        "Большинство трейдеров тщательно выбирают точку входа, а объём лота берут наугад. Именно это решает, станет ли серия убытков неприятностью или концом счёта.",
        "Внутри: формула, пример по EUR/USD и таблица просадок, которую стоит знать каждому трейдеру.",
        "Полный гайд: https://blog.onfin.io/ru/position-sizing-forex-math-beginners-skip", "Подписывайтесь в Instagram: instagram.com/onfin.io",
        "Предупреждение о рисках: торговля форекс и CFD с использованием маржи сопряжена с высоким риском и подходит не всем инвесторам. Вы можете потерять больше первоначальных вложений."],
 "es": ["Tamaño de posición, sin adivinar",
        "Muchos traders se obsesionan con la entrada y luego adivinan el tamaño del lote. Esa decisión define si una racha perdedora es un tropiezo o el final de la cuenta.",
        "Desliza para ver la fórmula, un ejemplo con EUR/USD y la tabla de drawdown que todo trader debería conocer.",
        "Guía completa: https://blog.onfin.io/es/position-sizing-forex-math-beginners-skip", "Síguenos en Instagram: instagram.com/onfin.io",
        "Advertencia de riesgo: operar forex y CFD con margen conlleva un alto nivel de riesgo y puede no ser adecuado para todos los inversores. Puedes perder más que tu inversión inicial."],
}
for ch, lk, imgs in [("en", "en", ps_tg["en"]), ("kh", "en", ps_tg["en"]), ("ms", "ms", ps_tg["ms"]), ("ru", "ru", ps_tg["ru"]), ("es", "es", ps_tg["es"]), ("fb", "fb", ps_fb)]:
    post("carousel-position-sizing", ch, f"2026-11-01T{TG_TIME[ch]:02d}:00:00Z", PS_CAP[lk], imgs)

# ------------------------------------------------------------------ RBA for every channel
RBA2 = {
 "ru": dict(value="06:30", label="МСК, вторник 3 ноября: решение RBA", kicker="Центробанк", meta="Завтра",
            context="Резервный банк Австралии объявит решение по ставке вместе с квартальным докладом о денежно-кредитной политике. Пары с AUD могут резко двигаться."),
 "es": dict(value="22:30", label="Bogotá y Lima, lunes 2 nov: decisión del RBA", kicker="Banco central", meta="Esta noche",
            context="El Banco de la Reserva de Australia anuncia su decisión de tipos junto a su informe trimestral de política monetaria. Los pares con AUD pueden moverse con fuerza."),
}
rba2 = {k: job("CarouselStat", v, f"rba-{k}.png") for k, v in RBA2.items()}
RBA_CAP2 = {
 "ru": ["RBA принимает решение завтра", "Резервный банк Австралии объявит решение по ставке во вторник, 3 ноября, в 06:30 МСК вместе с квартальным докладом о денежно-кредитной политике.",
        "Следите за AUD/USD и AUD/JPY: тон доклада по инфляции и росту может двигать австралийский доллар не меньше самого решения.", NOTADV["ru"], RISK["ru"]],
 "es": ["El RBA decide esta noche", "El Banco de la Reserva de Australia anuncia su decisión de tipos el lunes 2 de noviembre a las 22:30 en Bogotá y Lima, junto a su informe trimestral de política monetaria.",
        "Vigila AUD/USD y AUD/JPY: el tono sobre inflación y crecimiento puede mover el dólar australiano tanto como la propia decisión.", NOTADV["es"], RISK["es"]],
}
D_RBA = "2026-11-02T10:00:00Z"
for ch, img, cap in [("en", W.rba_img["en"], W.RBA_CAP["en"]), ("kh", W.rba_img["kh"], W.RBA_CAP["kh"]), ("fb", W.rba_img["kh"], W.RBA_CAP["kh"]),
                     ("ms", W.rba_img["ms"], W.RBA_CAP["ms"]), ("ru", rba2["ru"], RBA_CAP2["ru"]), ("es", rba2["es"], RBA_CAP2["es"])]:
    post("rba-preview", ch, D_RBA, cap, [img])
rba_story = job("StoryCountdown", dict(kicker="Central bank", title="RBA decides\n*tomorrow*", meta="2 Nov 2026",
                detail="Decision at 03:30 UTC Tuesday, with the quarterly Statement on Monetary Policy.", values=[0, 17, 30, 0], showSticker=False),
                "story-rba.png")
post("rba-preview", "ig", D_RBA, [], [rba_story], story=True)

if __name__ == "__main__":
    os.makedirs(W.OUT, exist_ok=True)
    json.dump(W.jobs, open(f"{S}/w1/jobs.json", "w"), ensure_ascii=False)
    json.dump(W.posts, open(f"{S}/w1/posts.json", "w"), ensure_ascii=False, indent=1)
    bad = [p["key"] + ":" + p["ch"] for p in W.posts for line in p["lines"] if any(c in line for c in "–—!")]
    import collections
    print(len(W.jobs), "renders,", len(W.posts), "posts; issues:", bad)
    print(collections.Counter(p["key"] for p in W.posts))
