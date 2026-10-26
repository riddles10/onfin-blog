"""OnFin Market News posts: image cards + per-channel captions.
Usage: python3 news.py  -> writes news-<id>-<fmt>-<lang>.html  (fmt: ig | tg)"""
import json

LANGS = ["en", "ms", "ru", "es"]
TAG = {"en": "Market news", "ms": "Berita pasaran", "ru": "Новости рынка", "es": "Noticias del mercado"}
MON = {"en": {10: "OCT", 11: "NOV"}, "ms": {10: "OKT", 11: "NOV"}, "ru": {10: "ОКТ", 11: "НОЯ"}, "es": {10: "OCT", 11: "NOV"}}
DOW = {"en": ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
       "ms": ["Isn", "Sel", "Rab", "Kha", "Jum", "Sab", "Ahd"],
       "ru": ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"],
       "es": ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"]}
CFD = {"en": "CFDs are high-risk; you may lose money.",
       "ms": "CFD berisiko tinggi; anda mungkin kehilangan wang.",
       "ru": "CFD относятся к высокорисковым инструментам; вы можете потерять деньги.",
       "es": "Los CFD son de alto riesgo; puedes perder dinero."}
LEV = {"en": "Trading leveraged products involves significant risk of loss.",
       "ms": "Dagangan produk berleveraj melibatkan risiko kerugian yang ketara.",
       "ru": "Торговля с кредитным плечом связана со значительным риском потерь.",
       "es": "Operar productos apalancados conlleva un riesgo significativo de pérdida."}


def date_label(lang, m, d, dow):
    return f"{DOW[lang][dow]} {d} {MON[lang][m]}"


# ---------------------------------------------------------------- visuals
def v_flags(lang):
    days = {"en": ("Wed", "Thu", "Fri"), "ms": ("Rab", "Kha", "Jum"), "ru": ("Ср", "Чт", "Пт"), "es": ("Mié", "Jue", "Vie")}[lang]
    items = [("new-zealand", "RBNZ", days[0]), ("canada", "BoC", days[0]), ("united-states", "Fed", days[0]),
             ("european-union", "ECB" if lang != "ru" else "ЕЦБ", days[1]), ("japan", "BoJ", days[2])]
    if lang == "ru":
        items[2] = ("united-states", "ФРС", days[0])
    if lang == "es":
        items[3] = ("european-union", "BCE", days[1])
    cells = "".join(f'<div class="fl"><img src="na/flag-{f}.svg"><b>{n}</b><span>{d}</span></div>' for f, n, d in items)
    return f'<div class="v-flags">{cells}</div>'


def v_oil(lang):
    lab = {"en": "WTI · 5-month high", "ms": "WTI · Tertinggi 5 bulan", "ru": "WTI · максимум за 5 месяцев", "es": "WTI · máximo de 5 meses"}[lang]
    num = "$103,28" if lang == "ru" else "$103.28"
    return f'<div class="v-oil"><img src="na/ic-oil-barrel.svg"><div><p class="big">{num}</p><p class="lab">{lab}</p></div></div>'


def v_lock(lang):
    return '<div class="v-lock"><div class="ring"><img src="na/ic-lock-closed.svg"></div><span class="mt">MT4 · MT5</span></div>'


def v_gold(lang):
    lab = {"en": "below January's record", "ms": "di bawah rekod Januari", "ru": "ниже январского рекорда", "es": "por debajo del récord de enero"}[lang]
    num = "$1 300+" if lang == "ru" else "$1,300+"
    return f'<div class="v-gold"><img src="ill-gold-bars-sm.png"><div class="badge"><p class="big down">↓ {num}</p><p class="lab">{lab}</p></div></div>'


def v_euro(lang):
    lab = {"en": "Biggest net short since 2020", "ms": "Jual bersih terbesar sejak 2020",
           "ru": "Крупнейший шорт с 2020 года", "es": "Mayor corto neto desde 2020"}[lang]
    return f'<div class="v-euro"><img src="na/flag-european-union.svg"><div><p class="big down">EUR ↓</p><p class="lab">{lab}</p></div></div>'


def v_clock(lang):
    lab = {"en": "US clocks go back", "ms": "Jam AS diundur", "ru": "США переводят часы", "es": "EE. UU. atrasa la hora"}[lang]
    return f'<div class="v-oil"><img src="na/ic-clock.svg"><div><p class="big">1 {MON[lang][11]}</p><p class="lab">{lab}</p></div></div>'


def v_vote(lang):
    lab = {"en": "US midterm elections", "ms": "Pilihan raya pertengahan penggal AS", "ru": "Промежуточные выборы в США", "es": "Elecciones de mitad de mandato"}[lang]
    return f'<div class="v-euro"><img src="na/flag-united-states.svg"><div><p class="big">3 {MON[lang][11]}</p><p class="lab">{lab}</p></div></div>'


def v_tiles(lang, tiles):
    cells = "".join(f'<div class="tile"><span class="d">{date_label(lang, 11, d, w)}</span><b>{t}</b></div>' for d, w, t in tiles)
    return f'<div class="v-tiles"><img class="cal" src="na/ic-calendar.svg">{cells}</div>'


def v_week1(lang):
    t = {"en": ("US elections", "US jobs report"), "ms": ("Pilihan raya AS", "Laporan pekerjaan AS"),
         "ru": ("Выборы в США", "Отчёт NFP"), "es": ("Elecciones en EE. UU.", "Empleo de EE. UU.")}[lang]
    return v_tiles(lang, [(3, 1, t[0]), (6, 4, t[1])])


def v_week2(lang):
    t = {"en": ("US CPI inflation", "US producer prices"), "ms": ("Inflasi CPI AS", "Harga pengeluar AS"),
         "ru": ("Инфляция CPI в США", "Цены производителей"), "es": ("Inflación IPC de EE. UU.", "Precios al productor")}[lang]
    return v_tiles(lang, [(10, 1, t[0]), (13, 4, t[1])])


def v_hike(lang):
    lab = {"en": "Fed · 9 DEC", "ms": "Fed · 9 DIS", "ru": "ФРС · 9 ДЕК", "es": "Fed · 9 DIC"}[lang]
    return f'<div class="v-hike"><p class="huge">↑ ?</p><p class="lab">{lab}</p></div>'


def v_thanks(lang):
    lab = {"en": "US markets closed", "ms": "Pasaran AS ditutup", "ru": "Биржи США закрыты", "es": "Bolsas de EE. UU. cerradas"}[lang]
    return f'<div class="v-euro"><img src="na/flag-united-states.svg"><div><p class="big">26 {MON[lang][11]}</p><p class="lab">{lab}</p></div></div>'


# ---------------------------------------------------------------- stories
# date: (month, day, dow index), headline/sub per language
STORIES = [
 {"id": "central-banks", "when": (10, 27, 1), "visual": v_flags,
  "head": {"en": "5 central banks.<br>3 days.", "ms": "5 bank pusat.<br>3 hari.", "ru": "5 центробанков<br>за 3 дня", "es": "5 bancos centrales.<br>3 días."},
  "sub": {"en": "Fed, ECB and BoJ all decide this week", "ms": "Fed, ECB dan BoJ buat keputusan minggu ini",
          "ru": "ФРС, ЕЦБ и Банк Японии решают на этой неделе", "es": "Fed, BCE y BoJ deciden esta semana"}},
 {"id": "oil", "when": (10, 28, 2), "visual": v_oil,
  "head": {"en": "Oil hits a<br>5-month high", "ms": "Minyak capai paras<br>tertinggi 5 bulan", "ru": "Нефть на<br>5-месячном максимуме", "es": "El petróleo, en máximos<br>de 5 meses"},
  "sub": {"en": "Attacks on shipping stoke supply fears", "ms": "Serangan ke atas kapal cetus kebimbangan bekalan",
          "ru": "Атаки на суда усилили страх за поставки", "es": "Los ataques a buques avivan el miedo al suministro"}},
 {"id": "euro-shorts", "when": (10, 29, 3), "visual": v_euro,
  "head": {"en": "Hedge funds are betting<br>against the euro", "ms": "Dana lindung nilai<br>bertaruh menentang euro", "ru": "Хедж-фонды ставят<br>против евро", "es": "Los hedge funds apuestan<br>contra el euro"},
  "sub": {"en": "ECB decides today", "ms": "ECB buat keputusan hari ini", "ru": "ЕЦБ принимает решение сегодня", "es": "El BCE decide hoy"}},
 {"id": "clocks", "when": (10, 30, 4), "visual": v_clock,
  "head": {"en": "Your trading hours<br>move this Sunday", "ms": "Waktu dagangan anda<br>berubah Ahad ini", "ru": "Время торгов сдвигается<br>в это воскресенье", "es": "Tus horarios de trading<br>cambian este domingo"},
  "sub": {"en": "US data lands one hour later from 2 Nov", "ms": "Data AS keluar sejam lewat mulai 2 Nov",
          "ru": "Данные США выходят на час позже со 2 ноября", "es": "Los datos de EE. UU. salen una hora después desde el 2 nov"}},
 {"id": "gold", "when": (10, 31, 5), "visual": v_gold,
  "head": {"en": "Gold is $1,300+<br>off its record", "ms": "Emas $1,300+<br>di bawah rekodnya", "ru": "Золото на $1 300+<br>ниже рекорда", "es": "El oro, $1,300+<br>por debajo de su récord"},
  "sub": {"en": "From a January peak to near $4,000", "ms": "Dari puncak Januari ke sekitar $4,000",
          "ru": "От январского пика к уровню около $4 000", "es": "Del pico de enero a cerca de $4,000"}},
 {"id": "week-ahead-1", "when": (11, 2, 0), "visual": v_week1,
  "head": {"en": "This week's<br>market movers", "ms": "Penggerak pasaran<br>minggu ini", "ru": "Что двигает рынок<br>на этой неделе", "es": "Lo que moverá el mercado<br>esta semana"},
  "sub": {"en": "US elections and the jobs report", "ms": "Pilihan raya AS dan laporan pekerjaan",
          "ru": "Выборы в США и отчёт по занятости", "es": "Elecciones en EE. UU. y el dato de empleo"}},
 {"id": "election", "when": (11, 3, 1), "visual": v_vote,
  "head": {"en": "Election night:<br>what moves markets", "ms": "Malam pilihan raya:<br>apa yang gerakkan pasaran", "ru": "Ночь выборов:<br>что двигает рынки", "es": "Noche electoral:<br>qué mueve los mercados"},
  "sub": {"en": "Results arrive in the Asian session", "ms": "Keputusan tiba semasa sesi Asia",
          "ru": "Итоги придут в азиатскую сессию", "es": "Los resultados llegan en la sesión asiática"}},
 {"id": "account-security", "when": (11, 5, 3), "visual": v_lock,
  "head": {"en": "Hackers placed trades<br>on traders' accounts", "ms": "Penggodam buat dagangan<br>dalam akaun pedagang", "ru": "Хакеры открывали сделки<br>на счетах трейдеров", "es": "Hackers operaron en<br>cuentas de traders"},
  "sub": {"en": "How to lock down your login", "ms": "Cara lindungi log masuk anda", "ru": "Как защитить свой вход", "es": "Cómo proteger tu acceso"}},
 {"id": "fed-december", "when": (11, 6, 4), "visual": v_hike,
  "head": {"en": "Could the Fed hike<br>in December?", "ms": "Adakah Fed akan naikkan<br>kadar pada Disember?", "ru": "Повысит ли ФРС<br>ставку в декабре?", "es": "¿Subirá la Fed los tipos<br>en diciembre?"},
  "sub": {"en": "Two reports this month could decide it", "ms": "Dua laporan bulan ini boleh menentukannya",
          "ru": "Два отчёта этого месяца могут всё решить", "es": "Dos datos de este mes pueden decidirlo"}},
 {"id": "week-ahead-2", "when": (11, 9, 0), "visual": v_week2,
  "head": {"en": "This week's<br>market movers", "ms": "Penggerak pasaran<br>minggu ini", "ru": "Что двигает рынок<br>на этой неделе", "es": "Lo que moverá el mercado<br>esta semana"},
  "sub": {"en": "US inflation takes centre stage", "ms": "Inflasi AS jadi tumpuan", "ru": "В центре внимания инфляция в США", "es": "La inflación de EE. UU., en el foco"}},
 {"id": "thanksgiving", "when": (11, 24, 1), "visual": v_thanks,
  "head": {"en": "Thin markets ahead:<br>US Thanksgiving", "ms": "Pasaran nipis menjelang<br>Thanksgiving AS", "ru": "Тонкий рынок:<br>День благодарения", "es": "Mercados finos:<br>Acción de Gracias"},
  "sub": {"en": "Expect wider spreads and more slippage", "ms": "Jangkakan spread lebih lebar dan lebih slippage",
          "ru": "Ждите шире спреды и больше проскальзываний", "es": "Espera spreads más amplios y más slippage"}},
]

CSS = """
@font-face{font-family:M;src:url(m400.ttf);font-weight:400}
@font-face{font-family:M;src:url(m500.ttf);font-weight:500}
@font-face{font-family:M;src:url(m600.ttf);font-weight:600}
@font-face{font-family:M;src:url(m700.ttf);font-weight:700}
*{box-sizing:border-box;margin:0;padding:0}
body{background:#333;font-family:M,Arial,sans-serif;color:#fff}
:root{--lime:#9fce10;--lime2:#B4E913;--coral:#fa876b}
.card{position:relative;overflow:hidden;background:#000}
.card .bg{position:absolute;inset:0;background:url(na/bg-candles.jpg) center/cover;opacity:.32}
.card .shade{position:absolute;inset:0;background:linear-gradient(180deg,rgba(0,0,0,.55) 0%,rgba(0,0,0,.15) 35%,rgba(0,0,0,.7) 62%,#000 100%)}
.card .glow{position:absolute;width:900px;height:900px;border-radius:50%;background:radial-gradient(circle,rgba(159,206,16,.32) 0%,rgba(159,206,16,.08) 45%,rgba(159,206,16,0) 70%)}
.top{position:absolute;display:flex;justify-content:space-between;align-items:center}
.top img{height:46px}
.badge-news{display:flex;align-items:center;gap:16px}
.badge-news .tag{padding:12px 24px;border-radius:100px;background:var(--lime);color:#000;font-weight:700;font-size:21px;letter-spacing:.14em;text-transform:uppercase}
.badge-news .date{font-size:24px;font-weight:600;color:#ddd;letter-spacing:.04em}
.live{width:12px;height:12px;border-radius:50%;background:#000;display:inline-block;margin-right:10px;vertical-align:1px}
h1{font-weight:700;letter-spacing:-.02em;line-height:1.02}
.sub{font-weight:500;color:#ccc;line-height:1.3}
.sub::before{content:"";display:inline-block;width:14px;height:14px;border-radius:50%;background:var(--lime);margin-right:16px;vertical-align:2px}
.foot{position:absolute;display:flex;justify-content:space-between;color:#999;font-weight:500}
.vis{position:absolute;display:flex;align-items:center;justify-content:center}

/* visuals (designed at portrait scale) */
.v-flags{display:flex;gap:26px}
.fl{display:flex;flex-direction:column;align-items:center;gap:14px}
.fl img{width:148px;height:148px;border-radius:50%;box-shadow:0 0 0 6px rgba(159,206,16,.35),0 20px 40px rgba(0,0,0,.5)}
.fl b{font-size:34px;font-weight:700}
.fl span{font-size:24px;font-weight:600;color:var(--lime);text-transform:uppercase;letter-spacing:.1em}
.v-oil,.v-euro{display:flex;align-items:center;gap:44px}
.v-oil img{width:250px;height:250px;filter:drop-shadow(0 0 40px rgba(159,206,16,.45))}
.v-euro img{width:250px;height:250px;border-radius:50%;box-shadow:0 0 0 8px rgba(159,206,16,.35),0 24px 50px rgba(0,0,0,.5)}
.big{font-size:150px;font-weight:700;letter-spacing:-.03em;line-height:.95;color:var(--lime)}
.big.down{color:var(--coral)}
.lab{font-size:30px;font-weight:600;color:#ddd;margin-top:16px;letter-spacing:.02em}
.v-lock{display:flex;flex-direction:column;align-items:center;gap:26px}
.v-lock .ring{width:380px;height:380px;border-radius:50%;display:grid;place-items:center;background:radial-gradient(circle,rgba(159,206,16,.22),rgba(159,206,16,.04) 65%);box-shadow:0 0 0 3px rgba(159,206,16,.5),0 0 80px rgba(159,206,16,.35)}
.v-lock .ring img{width:230px;height:230px}
.v-lock .mt{font-size:30px;font-weight:700;letter-spacing:.2em;color:var(--lime)}
.v-gold{display:flex;flex-direction:column;align-items:center;text-align:center}
.v-gold img{width:400px;filter:drop-shadow(0 30px 60px rgba(0,0,0,.6))}
.v-gold .badge{margin-top:10px}
.v-tiles{display:flex;align-items:center;gap:26px}
.v-tiles .cal{width:150px;height:150px;filter:drop-shadow(0 0 30px rgba(159,206,16,.4))}
.tile{width:330px;padding:30px 30px 34px;border-radius:30px;background:rgba(0,0,0,.7);border:2px solid rgba(159,206,16,.55)}
.tile .d{display:block;font-size:30px;font-weight:700;color:var(--lime);letter-spacing:.06em;text-transform:uppercase}
.tile b{display:block;font-size:36px;font-weight:600;margin-top:14px;line-height:1.2}
.v-hike{text-align:center}
.v-hike .huge{font-size:340px;font-weight:700;letter-spacing:-.04em;line-height:.9;color:var(--lime);text-shadow:0 0 80px rgba(159,206,16,.45)}

/* portrait 1080x1350 */
.ig{width:1080px;height:1350px}
.ig .top{left:72px;right:72px;top:72px}
.ig .vis{left:40px;right:40px;top:170px;height:640px}
.ig .vis > *{zoom:1.12}
.big{white-space:nowrap}
.ig .txt{position:absolute;left:72px;right:72px;bottom:150px}
.ig h1{font-size:82px}
.ig .sub{font-size:36px;margin-top:30px}
.ig .foot{left:72px;right:72px;bottom:66px;font-size:24px}
.ig .glow{right:-420px;top:-380px}

/* landscape 1280x720 */
.tg{width:1280px;height:720px}
.tg .top{left:64px;right:64px;top:52px}
.tg .top img{height:40px}
.tg .vis{right:30px;top:120px;width:560px;height:470px}
.tg .vis > *{zoom:.62}
.tg .txt{position:absolute;left:64px;width:610px;bottom:96px}
.tg h1{font-size:58px}
.tg .sub{font-size:28px;margin-top:22px}
.tg .foot{left:64px;right:64px;bottom:40px;font-size:20px}
.tg .glow{right:-420px;top:-420px}
.tg .shade{background:linear-gradient(90deg,rgba(0,0,0,.92) 0%,rgba(0,0,0,.7) 52%,rgba(0,0,0,.35) 100%)}
.tg .badge-news .tag{font-size:18px;padding:10px 20px}
.tg .badge-news .date{font-size:20px}
"""


def card(story, fmt, lang):
    m, d, w = story["when"]
    foot_r = {"en": "Not investment advice", "ms": "Bukan nasihat pelaburan", "ru": "Не инвестиционная рекомендация", "es": "No es asesoramiento de inversión"}[lang]
    return (f'<section class="card {fmt}" id="c"><div class="bg"></div><div class="shade"></div><div class="glow"></div>'
            f'<div class="top"><img src="logo.svg"><div class="badge-news"><span class="date">{date_label(lang, m, d, w)}</span>'
            f'<span class="tag"><i class="live"></i>{TAG[lang]}</span></div></div>'
            f'<div class="vis">{story["visual"](lang)}</div>'
            f'<div class="txt"><h1>{story["head"][lang] if fmt == "ig" else story["head"][lang].replace("<br>", " ")}</h1><p class="sub">{story["sub"][lang]}</p></div>'
            f'<div class="foot"><span>onfin.io</span><span>{foot_r}</span></div></section>')


if __name__ == "__main__":
    out = []
    for s in STORIES:
        for fmt, langs in (("ig", ["en"]), ("tg", LANGS)):
            for lang in langs:
                html = f'<!doctype html><html><head><meta charset="utf-8"><style>{CSS}</style></head><body>{card(s, fmt, lang)}</body></html>'
                fn = f"news-{s['id']}-{fmt}-{lang}.html"
                open(fn, "w", encoding="utf-8").write(html)
                out.append(fn)
    print(len(out))
