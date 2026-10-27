"""Weeks 3 to 10 (10 Nov 2026 to 3 Jan 2027).  python3 weeks.py [w3 w4 ...]  (default: all)
Genesis 3x/week (Tue/Thu/Sat unless noted), Sunday guide carousels (IG CTA alternates), market cards from wk/calendar.md."""
import importlib, sys
from common import Week
import genesis_posts as GP, genesis_more as GM, market as MK, carousel as CA

E = lambda en, ru, es, ms: {"en": en, "ru": ru, "es": es, "ms": ms}


def car(W, key, day, ig_cta):
    try:
        mod = importlib.import_module(f"car_{key}")
    except ModuleNotFoundError:
        print(f"  !! car_{key}.py not ready, skipped"); return
    CA.build(W, mod, day, ig_cta)


# ---------------------------------------------------------------------------------------------- shared captions
CPI_KICK = E("US data", "Данные США", "Datos de EE. UU.", "Data AS")


def w3():
    W = Week("w3")
    GM.spot_copy(W, "2026-11-10"); GM.tips(W, "2026-11-12"); GM.no_trade(W, "2026-11-14")
    MK.event_card(W, "cpi-nov", "2026-11-10T06:00:00Z", "2026-11-10T13:30:00Z", CPI_KICK,
        E("{tz}, {day}: US CPI for October", "{tz}, {day}: инфляция CPI в США за октябрь", "{tz}, {day}: IPC de EE. UU. de octubre", "{tz}, {day}: CPI AS bagi Oktober"),
        E("US inflation data can move the dollar, gold and US indices sharply around the release.", "Данные по инфляции в США могут резко двигать доллар, золото и индексы США.",
          "Los datos de inflación de EE. UU. pueden mover con fuerza el dólar, el oro y los índices.", "Data inflasi AS boleh menggerakkan dolar, emas dan indeks AS dengan tajam."),
        E(["US CPI today", "October consumer price data from the US Bureau of Labor Statistics is out at {t} {tz}.",
           "It's the last CPI print before the Fed's December decision, so expect wider spreads and fast moves in USD pairs, gold and US indices."],
          ["CPI США сегодня", "Данные по потребительским ценам за октябрь от Бюро статистики труда США выйдут в {t} {tz}.",
           "Это последний CPI перед декабрьским решением ФРС. Возможны расширенные спреды и резкие движения в парах с USD, золоте и индексах США."],
          ["IPC de EE. UU. hoy", "Los precios al consumidor de octubre de la Oficina de Estadísticas Laborales de EE. UU. se publican a las {t} ({tz}).",
           "Es el último IPC antes de la decisión de la Fed de diciembre: espera spreads más amplios y movimientos rápidos en pares con USD, oro e índices de EE. UU."],
          ["CPI AS hari ini", "Data harga pengguna Oktober daripada Biro Statistik Buruh AS keluar jam {t} {tz}.",
           "Ia data CPI terakhir sebelum keputusan Fed Disember, jadi jangkakan spread lebih lebar dan pergerakan pantas pada pasangan USD, emas dan indeks AS."]),
        post_hours={"en": 6, "kh": 6, "fb": 6, "ms": 6, "ru": 6, "es": 11})
    MK.countdown(W, "cpi-nov", "2026-11-10T08:00:00Z", "2026-11-10T13:30:00Z", "US data", "Inflation data\n*today*",
                 "US CPI for October at 13:30 UTC, the last print before the Fed's December decision.")
    car(W, "lots", "2026-11-15", "telegram")
    return W


def w4():
    W = Week("w4")
    GM.script_first(W, "2026-11-17"); GM.platforms(W, "2026-11-19"); GM.spot_start(W, "2026-11-21")
    car(W, "margin", "2026-11-22", "instagram")
    return W


def w5():
    W = Week("w5")
    GM.usdt(W, "2026-11-24"); GM.hooks(W, "2026-11-26"); GM.rules(W, "2026-11-28")
    MK.event_card(W, "gdp-pce", "2026-11-25T06:00:00Z", "2026-11-25T13:30:00Z", CPI_KICK,
        E("{tz}, {day}: US GDP and PCE", "{tz}, {day}: ВВП и PCE США", "{tz}, {day}: PIB y PCE de EE. UU.", "{tz}, {day}: KDNK dan PCE AS"),
        E("Q3 GDP second estimate and October PCE inflation land together, the day before Thanksgiving.", "Вторая оценка ВВП за III квартал и инфляция PCE за октябрь выходят вместе, накануне Дня благодарения.",
          "La segunda estimación del PIB del 3T y la inflación PCE de octubre llegan juntas, un día antes de Acción de Gracias.", "Anggaran kedua KDNK S3 dan inflasi PCE Oktober keluar serentak, sehari sebelum Thanksgiving."),
        E(["US GDP and PCE today", "The Q3 GDP second estimate and October PCE inflation are out together at {t} {tz}.",
           "With US markets closed on Thursday for Thanksgiving and shorter hours on Friday, liquidity thins quickly after the release."],
          ["ВВП и PCE США сегодня", "Вторая оценка ВВП за III квартал и инфляция PCE за октябрь выйдут вместе в {t} {tz}.",
           "В четверг рынки США закрыты на День благодарения, а в пятницу работают по сокращённому графику, поэтому после публикации ликвидность быстро снижается."],
          ["PIB y PCE de EE. UU. hoy", "La segunda estimación del PIB del 3T y la inflación PCE de octubre se publican juntas a las {t} ({tz}).",
           "Con los mercados de EE. UU. cerrados el jueves por Acción de Gracias y horario reducido el viernes, la liquidez baja rápido tras el dato."],
          ["KDNK dan PCE AS hari ini", "Anggaran kedua KDNK S3 dan inflasi PCE Oktober keluar serentak jam {t} {tz}.",
           "Pasaran AS ditutup pada Khamis kerana Thanksgiving dan dibuka lebih singkat pada Jumaat, jadi kecairan menipis dengan cepat selepas data keluar."]),
        channels=("en", "kh", "fb", "ms", "ru", "es"), post_hours={"en": 6, "kh": 6, "fb": 6, "ms": 6, "ru": 6, "es": 11})
    car(W, "profitable", "2026-11-29", "telegram")
    return W


def w6():
    W = Week("w6")
    GM.prove(W, "2026-12-01"); GM.checklist(W, "2026-12-03"); GM.math2(W, "2026-12-05")
    MK.event_card(W, "nfp-dec", "2026-12-04T06:00:00Z", "2026-12-04T13:30:00Z", CPI_KICK,
        E("{tz}, {day}: US jobs report", "{tz}, {day}: отчёт по рынку труда США", "{tz}, {day}: informe de empleo de EE. UU.", "{tz}, {day}: laporan pekerjaan AS"),
        E("November nonfarm payrolls, the last jobs report before the Fed's 9 December decision.", "Данные по занятости за ноябрь: последний отчёт перед решением ФРС 9 декабря.",
          "Las nóminas no agrícolas de noviembre, el último informe antes de la decisión de la Fed del 9 de diciembre.", "Gaji bukan ladang November, laporan pekerjaan terakhir sebelum keputusan Fed 9 Disember."),
        E(["US jobs report today", "November nonfarm payrolls from the US Bureau of Labor Statistics are out at {t} {tz}.",
           "It's the last jobs report before the Fed decides on 9 December. Expect fast moves in USD pairs, gold and US indices."],
          ["Отчёт по рынку труда США сегодня", "Данные Non-Farm Payrolls за ноябрь от Бюро статистики труда США выйдут в {t} {tz}.",
           "Это последний отчёт перед решением ФРС 9 декабря. Возможны резкие движения в парах с USD, золоте и индексах США."],
          ["Informe de empleo de EE. UU. hoy", "Las nóminas no agrícolas de noviembre de la Oficina de Estadísticas Laborales se publican a las {t} ({tz}).",
           "Es el último informe antes de que la Fed decida el 9 de diciembre. Espera movimientos rápidos en pares con USD, oro e índices de EE. UU."],
          ["Laporan pekerjaan AS hari ini", "Data gaji bukan ladang November daripada Biro Statistik Buruh AS keluar jam {t} {tz}.",
           "Ia laporan terakhir sebelum Fed membuat keputusan pada 9 Disember. Jangkakan pergerakan pantas pada pasangan USD, emas dan indeks AS."]),
        post_hours={"en": 6, "kh": 6, "fb": 6, "ms": 6, "ru": 6, "es": 11})
    MK.countdown(W, "nfp-dec", "2026-12-04T08:00:00Z", "2026-12-04T13:30:00Z", "US data", "Jobs report\n*today*",
                 "US nonfarm payrolls for November at 13:30 UTC, the last before the Fed's 9 December decision.")
    car(W, "mt4mt5", "2026-12-06", "instagram")
    return W


def w7():
    W = Week("w7")
    GM.first_video(W, "2026-12-08"); GM.faq(W, "2026-12-10"); GM.still_time(W, "2026-12-12")
    MK.week_ahead(W, "week-ahead-dec7", "2026-12-07", E("Rate decisions\n*all week*.", "Неделя\n*решений по ставкам*.", "Una semana de\n*decisiones de tipos*.", "Minggu\n*keputusan kadar*."), [
        ("2026-12-08T03:30:00Z", E("RBA decision", "Решение RBA", "Decisión del RBA", "Keputusan RBA")),
        ("2026-12-09T14:45:00Z", E("Bank of Canada", "Банк Канады", "Banco de Canadá", "Bank of Canada")),
        ("2026-12-09T19:00:00Z", E("Fed decision", "Решение ФРС", "Decisión de la Fed", "Keputusan Fed")),
        ("2026-12-10T08:30:00Z", E("SNB decision", "Решение SNB", "Decisión del SNB", "Keputusan SNB")),
        ("2026-12-10T13:30:00Z", E("US CPI", "CPI США", "IPC de EE. UU.", "CPI AS"))],
        E("US government funding also runs out at the end of 11 December, so watch for shutdown headlines.", "Также 11 декабря заканчивается финансирование правительства США: следите за новостями о возможном шатдауне.",
          "Además, la financiación del gobierno de EE. UU. vence al final del 11 de diciembre: atento a noticias de un posible cierre.", "Pembiayaan kerajaan AS juga tamat pada penghujung 11 Disember, jadi perhatikan berita penutupan kerajaan."))
    MK.event_card(W, "fed-dec", "2026-12-09T12:00:00Z", "2026-12-09T19:00:00Z", E("FOMC", "FOMC", "FOMC", "FOMC"),
        E("{tz}, {day}: Fed decision", "{tz}, {day}: решение ФРС", "{tz}, {day}: decisión de la Fed", "{tz}, {day}: keputusan Fed"),
        E("The decision comes with new economic projections. The press conference starts 30 minutes later.", "Решение выйдет вместе с новыми экономическими прогнозами. Пресс-конференция начнётся через 30 минут.",
          "La decisión llega con nuevas proyecciones económicas. La conferencia de prensa empieza 30 minutos después.", "Keputusan disertakan unjuran ekonomi baharu. Sidang media bermula 30 minit kemudian."),
        E(["Fed decision today", "The Federal Reserve announces its last rate decision of 2026 at {t} {tz}, with new economic projections and a press conference 30 minutes later.",
           "Expect wider spreads and fast moves in USD pairs, gold and US indices around the release."],
          ["Решение ФРС сегодня", "ФРС объявит последнее в 2026 году решение по ставке в {t} {tz} вместе с новыми экономическими прогнозами. Пресс-конференция через 30 минут.",
           "Возможны расширенные спреды и резкие движения в парах с USD, золоте и индексах США."],
          ["Decisión de la Fed hoy", "La Reserva Federal anuncia su última decisión de tipos de 2026 a las {t} ({tz}), con nuevas proyecciones económicas y conferencia de prensa 30 minutos después.",
           "Espera spreads más amplios y movimientos rápidos en pares con USD, oro e índices de EE. UU."],
          ["Keputusan Fed hari ini", "Federal Reserve mengumumkan keputusan kadar terakhir bagi 2026 jam {t} {tz}, bersama unjuran ekonomi baharu dan sidang media 30 minit kemudian.",
           "Jangkakan spread lebih lebar dan pergerakan pantas pada pasangan USD, emas dan indeks AS."]))
    MK.countdown(W, "fed-dec", "2026-12-09T12:00:00Z", "2026-12-09T19:00:00Z", "FOMC", "Fed decision\n*today*",
                 "Rate decision and projections at 19:00 UTC, press conference at 19:30 UTC.")
    car(W, "psych", "2026-12-13", "telegram")
    return W


def w8():
    W = Week("w8")
    GM.holidays(W, "2026-12-15"); GP.how_it_works(W, "2026-12-17"); GP.math(W, "2026-12-19")
    MK.week_ahead(W, "week-ahead-dec14", "2026-12-14", E("The last big week\nof *2026*.", "Последняя насыщенная\nнеделя *2026*.", "La última gran\nsemana de *2026*.", "Minggu besar terakhir\n*2026*."), [
        ("2026-12-15T13:30:00Z", E("US PPI", "PPI США", "IPP de EE. UU.", "PPI AS")),
        ("2026-12-17T12:00:00Z", E("Bank of England", "Банк Англии", "Banco de Inglaterra", "Bank of England")),
        ("2026-12-17T13:15:00Z", E("ECB decision", "Решение ЕЦБ", "Decisión del BCE", "Keputusan ECB")),
        ("2026-12-17T19:00:00Z", E("Banxico", "Банк Мексики", "Banxico", "Banxico")),
        ("2026-12-18T10:30:00Z", E("Bank of Russia", "Банк России", "Banco de Rusia", "Bank of Russia"))],
        E("The Bank of Japan also decides on 18 December, with no fixed release time.", "18 декабря также решает Банк Японии, без фиксированного времени публикации.",
          "El Banco de Japón también decide el 18 de diciembre, sin hora fija de publicación.", "Bank of Japan juga membuat keputusan pada 18 Disember, tanpa waktu tetap."))
    MK.event_card(W, "cbr-dec", "2026-12-18T06:00:00Z", "2026-12-18T10:30:00Z", E("", "Центробанк", "", ""),
        E("", "{tz}, {day}: решение Банка России", "", ""),
        E("", "Последнее решение по ключевой ставке в 2026 году. Пресс-конференция в 15:00 МСК.", "", ""),
        E([], ["Банк России сегодня", "Банк России объявит последнее в 2026 году решение по ключевой ставке в {t} {tz}, пресс-конференция в 15:00 МСК.",
               "Утром также решает Банк Японии, без фиксированного времени. Возможны резкие движения в парах с RUB и JPY."], [], []),
        channels=("ru",))
    car(W, "broker", "2026-12-20", "instagram")
    return W


def w9():
    W = Week("w9")
    GM.multi(W, "2026-12-22"); GM.faq(W, "2026-12-23"); GM.tips(W, "2026-12-26")
    MK.holiday_hours(W, "holiday-hours", "2026-12-21")
    car(W, "gold", "2026-12-27", "telegram")
    return W


def w10():
    W = Week("w10")
    GM.new_year(W, "2026-12-29"); GM.checklist(W, "2026-12-31"); GM.first_2027(W, "2027-01-02")
    MK.reading_list(W, "reading-list", "2026-12-30")
    return W


# Instagram feed clashes with already-queued posts at 12:00 UTC: move the Genesis post to 15:00 (story 15:30)
SHIFT = {("w3", "2026-11-14"), ("w4", "2026-11-19")}


def shift(W):
    for p in W.posts:
        if p["ch"] == "ig" and p["key"].startswith("g-") and (W.name, p["date"][:10]) in SHIFT:
            p["date"] = p["date"].replace("T12:00", "T15:00").replace("T12:30", "T15:30")
    return W


ALL = dict(w3=w3, w4=w4, w5=w5, w6=w6, w7=w7, w8=w8, w9=w9, w10=w10)
if __name__ == "__main__":
    for k in (sys.argv[1:] or ALL):
        shift(ALL[k]()).save()
