"""Market cards for weeks 3+: week-ahead timelines, single-event cards, countdown stories, holiday hours.
All times come from wk/calendar.md (verified). Local times are computed per channel."""
from datetime import datetime, timedelta
from common import NOTADV, RISK, FULL_RISK

# channel -> (lang, utc offset hours, tz label for captions, tz label for cards)
TZ = {
    "en": ("en", 0, "UTC", "Times in UTC"), "ig": ("en", 0, "UTC", "Times in UTC"),
    "kh": ("en", 7, "Cambodia time", "Cambodia time"), "fb": ("en", 7, "Cambodia time", "Cambodia time"),
    "ms": ("ms", 8, "waktu Malaysia", "Waktu Malaysia"), "ru": ("ru", 3, "МСК", "Время МСК"), "es": ("es", -5, "Bogotá y Lima", "Hora de Bogotá y Lima"),
}
DOW = {"en": ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"], "ms": ["Isn", "Sel", "Rab", "Kha", "Jum", "Sab", "Ahd"],
       "ru": ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"], "es": ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"]}
MON = {"en": ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
       "ms": ["Jan", "Feb", "Mac", "Apr", "Mei", "Jun", "Jul", "Ogo", "Sep", "Okt", "Nov", "Dis"],
       "ru": ["янв", "фев", "мар", "апр", "мая", "июн", "июл", "авг", "сен", "окт", "ноя", "дек"],
       "es": ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"]}
TODAY = {"en": "Today", "ms": "Hari ini", "ru": "Сегодня", "es": "Hoy"}
WEEK = {"en": "This week", "ms": "Minggu ini", "ru": "На этой неделе", "es": "Esta semana"}


def local(utc_iso, ch):
    off = TZ[ch][1]
    return datetime.fromisoformat(utc_iso.replace("Z", "")) + timedelta(hours=off)


def hhmm(dt, lang):
    s = dt.strftime("%H:%M")
    return s.lstrip("0") if lang == "es" and s[0] == "0" and s[1] != ":" else s


DOW_FULL_MS = ["Isnin", "Selasa", "Rabu", "Khamis", "Jumaat", "Sabtu", "Ahad"]


def daylabel(dt, lang):
    d = DOW_FULL_MS[dt.weekday()] if lang == "ms" else DOW[lang][dt.weekday()]
    return f"{d} {dt.day} {MON[lang][dt.month - 1]}"


def week_ahead(W, key, post_day, heading, events, intro, hours=None, kicker=None):
    """events: [(utc_iso or date 'YYYY-MM-DD', {lang: title}), ...]  3 to 5 items. Date-only items have no time.
    heading/intro: {lang: str}. Posts to all channels incl. Instagram feed."""
    hours = hours or {"en": 6, "kh": 6, "fb": 6, "ms": 6, "ru": 6, "es": 12, "ig": 16}
    imgs = {}
    for ch in ("en", "kh", "ms", "ru", "es"):
        l, off, tzc, tzcard = TZ[ch]
        ev, cap = [], []
        for i, (t, names) in enumerate(events):
            if "T" in t:
                dt = local(t, ch)
                ev.append({"date": DOW[l][dt.weekday()], "title": f"{hhmm(dt, l)} {names[l]}", "body": daylabel(dt, l)})
                cap.append(f"{daylabel(dt, l)}, {hhmm(dt, l)} {tzc}: {names[l]}")
            else:
                dt = datetime.fromisoformat(t)
                ev.append({"date": DOW[l][dt.weekday()], "title": names[l], "body": daylabel(dt, l)})
                cap.append(f"{daylabel(dt, l)}: {names[l]}")
        ev[0]["current"] = True
        imgs[ch] = (W.lib("CarouselTimeline", dict(kicker=f"{(kicker or WEEK)[l]}, {tzcard.lower() if l != 'ru' else tzcard}", heading=heading[l],
                                                   events=ev, meta=daylabel(datetime.fromisoformat(post_day), l)), f"{key}-{ch}.png"), cap)
    imgs["fb"], imgs["ig"] = imgs["kh"], imgs["en"]
    for ch in ("en", "kh", "fb", "ms", "ru", "es", "ig"):
        l = TZ[ch][0]
        img, cap = imgs[ch]
        tail = [NOTADV[l], RISK[l]] if ch != "ig" else [NOTADV[l], "#forex #economiccalendar #trading #onfin", RISK[l]]
        W.post(key, ch, f"{post_day}T{hours[ch]:02d}:00:00Z", [heading[l].replace("*", "").replace("\n", " ")] + cap + [intro[l]] + tail, [img])


def event_card(W, key, post_iso, event_iso, kicker, label, context, caption, channels=("en", "kh", "fb", "ms", "ru", "es"), post_hours=None):
    """CarouselStat with the local event time. label/caption take {t} (local time) and {tz} (zone) and {day} (local day label)."""
    for ch in channels:
        l, off, tzc, tzcard = TZ[ch]
        dt = local(event_iso, ch)
        fmt = dict(t=hhmm(dt, l), tz=tzc, day=daylabel(dt, l))
        img = W.lib("CarouselStat", dict(kicker=kicker[l], value=hhmm(dt, l), label=label[l].format(**fmt), context=context[l], meta=TODAY[l]),
                    f"{key}-{ch if ch != 'fb' else 'kh'}.png")
        when = post_iso if not post_hours else f"{post_iso[:10]}T{post_hours.get(ch, 6):02d}:00:00Z"
        W.post(key, ch, when, [c.format(**fmt) for c in caption[l]] + [NOTADV[l], RISK[l]], [img])


def countdown(W, key, post_iso, event_iso, kicker, title, detail):
    a = datetime.fromisoformat(post_iso.replace("Z", "")); b = datetime.fromisoformat(event_iso.replace("Z", ""))
    s = int((b - a).total_seconds()); d, s = divmod(s, 86400); h, s = divmod(s, 3600); m = s // 60
    img = W.lib("StoryCountdown", dict(kicker=kicker, title=title, meta=daylabel(b, "en"), detail=detail, values=[d, h, m, 0], showSticker=False), f"story-{key}.png")
    W.post(f"story-{key}", "ig", post_iso, [], [img], story=True)


def holiday_hours(W, key, post_day):
    rows = {
     "en": [["24 Dec", "LSE 12:30, NYSE 18:00"], ["25 Dec", "US, UK, EU closed"], ["28 Dec", "LSE closed"], ["31 Dec", "LSE closes 12:30"], ["1 Jan", "Closed"]],
     "ru": [["24 дек", "LSE 12:30, NYSE 18:00"], ["25 дек", "США, UK, ЕС закрыты"], ["28 дек", "LSE закрыта"], ["31 дек", "LSE до 12:30"], ["1 янв", "Всё закрыто"]],
     "es": [["24 dic", "LSE 12:30, NYSE 18:00"], ["25 dic", "EE. UU., UK, UE cerrados"], ["28 dic", "LSE cerrada"], ["31 dic", "LSE cierra 12:30"], ["1 ene", "Cerrado"]],
     "ms": [["24 Dis", "LSE 12:30, NYSE 18:00"], ["25 Dis", "AS, UK, EU ditutup"], ["28 Dis", "LSE ditutup"], ["31 Dis", "LSE tutup 12:30"], ["1 Jan", "Ditutup"]],
    }
    head = {"en": ("Holiday hours", "Trading through\nthe *holidays*.", ["Date", "Exchanges, UTC"],
                   "Source: LSE, NYSE and SIFMA. Forex trades on, with thin liquidity."),
            "ru": ("Праздничный график", "Торговля\nв *праздники*.", ["Дата", "Биржи, UTC"],
                   "Источник: LSE, NYSE и SIFMA. Форекс торгуется при низкой ликвидности."),
            "es": ("Horario festivo", "Operar durante\nlas *fiestas*.", ["Fecha", "Bolsas, UTC"],
                   "Fuente: LSE, NYSE y SIFMA. El forex sigue, con baja liquidez."),
            "ms": ("Waktu cuti", "Berdagang sepanjang\n*musim cuti*.", ["Tarikh", "Bursa, UTC"],
                   "Sumber: LSE, NYSE dan SIFMA. Forex diteruskan, kecairan rendah.")}
    cap = {"en": ["Trading through the holidays", "24 Dec: London closes 12:30 UTC, New York 18:00 UTC", "25 Dec: US, UK and EU markets closed", "28 Dec: London closed",
                  "31 Dec: London closes 12:30 UTC", "1 Jan: markets closed",
                  "Forex keeps trading, but thin liquidity can mean wider spreads and gaps. Index and commodity CFDs follow the hours of the market they track, so check instrument hours in MT4 or MT5 before you trade."],
           "ru": ["Торговля в праздники", "24 декабря: Лондон закрывается в 12:30 UTC, Нью-Йорк в 18:00 UTC", "25 декабря: рынки США, Великобритании и ЕС закрыты", "28 декабря: Лондон закрыт",
                  "31 декабря: Лондон закрывается в 12:30 UTC", "1 января: рынки закрыты",
                  "Форекс торгуется, но низкая ликвидность может расширять спреды и вызывать гэпы. CFD на индексы и сырьё следуют часам своих рынков, поэтому проверяйте время торговли инструментов в MT4 или MT5."],
           "es": ["Operar durante las fiestas", "24 dic: Londres cierra a las 12:30 UTC, Nueva York a las 18:00 UTC", "25 dic: mercados de EE. UU., Reino Unido y UE cerrados", "28 dic: Londres cerrado",
                  "31 dic: Londres cierra a las 12:30 UTC", "1 ene: mercados cerrados",
                  "El forex sigue operando, pero la baja liquidez puede ampliar spreads y causar gaps. Los CFD de índices y materias primas siguen el horario de su mercado: revisa los horarios en MT4 o MT5 antes de operar."],
           "ms": ["Berdagang sepanjang musim cuti", "24 Dis: London tutup 12:30 UTC, New York 18:00 UTC", "25 Dis: pasaran AS, UK dan EU ditutup", "28 Dis: London ditutup",
                  "31 Dis: London tutup 12:30 UTC", "1 Jan: pasaran ditutup",
                  "Forex terus didagangkan, tetapi kecairan rendah boleh meluaskan spread dan menyebabkan jurang harga. CFD indeks dan komoditi mengikut waktu pasaran asalnya, jadi semak waktu instrumen dalam MT4 atau MT5 sebelum berdagang."]}
    imgs = {}
    for l in ("en", "ru", "es", "ms"):
        k, hd, cols, foot = head[l]
        imgs[l] = W.lib("CarouselRates", dict(kicker=k, heading=hd, columns=cols, rows=rows[l], footnote=foot, meta=daylabel(datetime.fromisoformat(post_day), l)), f"{key}-{l}.png")
    for ch, hh in [("en", 6), ("kh", 6), ("fb", 6), ("ms", 6), ("ru", 6), ("es", 12), ("ig", 16)]:
        l = TZ[ch][0]
        W.post(key, ch, f"{post_day}T{hh:02d}:00:00Z", cap[l] + ([NOTADV[l], "#forex #holidayhours #trading #onfin"] if ch == "ig" else [NOTADV[l]]) + [RISK[l]], [imgs[l]])


def reading_list(W, key, post_day):
    G = [("position-sizing-forex-math-beginners-skip", {"en": "Position sizing", "ru": "Размер позиции", "es": "Tamaño de posición", "ms": "Saiz posisi"}),
         ("stop-loss-vs-take-profit-how-to-set-them-correctly", {"en": "Stop loss vs take profit", "ru": "Стоп-лосс и тейк-профит", "es": "Stop loss y take profit", "ms": "Stop loss vs take profit"}),
         ("margin-in-forex-trading-a-guide-for-beginners", {"en": "Margin and margin calls", "ru": "Маржа и маржин-колл", "es": "Margen y margin call", "ms": "Margin dan margin call"})]
    body = {"en": ["Size every trade from your risk, not a hunch.", "Place stops where the idea fails.", "Know what triggers a margin call."],
            "ru": ["Считайте объём от риска, а не наугад.", "Ставьте стоп там, где идея ломается.", "Знайте, что вызывает маржин-колл."],
            "es": ["Calcula cada operación según tu riesgo.", "Pon el stop donde la idea falla.", "Conoce qué activa un margin call."],
            "ms": ["Saizkan setiap dagangan ikut risiko, bukan gerak hati.", "Letakkan stop di mana idea gagal.", "Ketahui apa yang mencetuskan margin call."]}
    head = {"en": ("Reading list", "Three guides to\n*start 2027* with."), "ru": ("Что почитать", "Три гайда\nдля *старта 2027*."),
            "es": ("Para leer", "Tres guías para\n*empezar 2027*."), "ms": ("Senarai bacaan", "Tiga panduan untuk\n*memulakan 2027*.")}
    intro = {"en": "Our three most practical risk guides of the year, worth a reread before you trade in 2027.",
             "ru": "Три самых практичных гайда года о риске: стоит перечитать перед торговлей в 2027 году.",
             "es": "Nuestras tres guías de riesgo más prácticas del año, para releer antes de operar en 2027.",
             "ms": "Tiga panduan risiko paling praktikal kami tahun ini, wajar dibaca semula sebelum berdagang pada 2027."}
    imgs = {}
    for l in ("en", "ru", "es", "ms"):
        k, hd = head[l]
        imgs[l] = W.lib("CarouselList", dict(kicker=k, heading=hd, items=[{"title": n[l], "body": b} for (s, n), b in zip(G, body[l])], meta="2026"), f"{key}-{l}.png")
    for ch, hh in [("en", 8), ("kh", 8), ("fb", 8), ("ms", 8), ("ru", 9), ("es", 14), ("ig", 12)]:
        l = TZ[ch][0]
        links = ["blog.onfin.io"] if ch == "ig" else [f"{n[l]}: https://blog.onfin.io/{l}/{s}" for s, n in G]
        W.post(key, ch, f"{post_day}T{hh:02d}:00:00Z", [head[l][1].replace("*", "").replace("\n", " "), intro[l]] + links +
               (["#forex #riskmanagement #tradingeducation #onfin"] if ch == "ig" else []) + [FULL_RISK[l]], [imgs[l]])
