"""OnFin Flash, 28 Oct 2026: China AI stock selloff. Facts: Reuters (27/28 Oct), Bloomberg data via Geo News (26 Oct).
python3 flash_china.py <publish_iso>"""
import sys
from common import Week, S, NOTADV, RISK

WHEN = sys.argv[1] if len(sys.argv) > 1 else "2026-10-28T08:00:00Z"
W = Week("flash-china")
MEDIA = f"file://{S}/w1/media/china-selloff.jpg"
T = 6
D = {
 "en": dict(
  news=dict(tag="Breaking", headline="China's AI stocks\n*lose $480 billion*",
            summary="Shanghai's STAR 50 tech index is down about 40% from its July high, and the slide deepened on Tuesday."),
  rates=dict(kicker="Tuesday's close", heading="A *bad day*\nfor China tech.", columns=["Index", "Tuesday"],
             rows=[["CSI Semiconductor", "-5.8%"], ["STAR 50", "-4.8%"], ["ChiNext", "-3.4%"], ["Hang Seng Tech", "-1.5%"], ["Shanghai Composite", "-1.3%"]],
             footnote="Close on 27 Oct 2026. The Shanghai Composite ended at 3,648.30, its lowest close since August 2025. Source: Reuters."),
  why=dict(kicker="Why", heading="What's driving\nthe *selloff*.", items=[
      {"title": "Stretched valuations", "body": "The STAR 50 trades near 100x trailing earnings, vs about 30x for the Nasdaq 100 (Reuters)."},
      {"title": "Data-centre ban risk", "body": "Worry that the US and others could ban Chinese equipment from data centres."},
      {"title": "Tax bills and rotation", "body": "Traders also cite tax bills and money rotating out of tech."}]),
  resp=dict(kicker="The response", heading="Beijing is\n*stepping in*.", items=[
      {"title": "State-backed buying", "body": "128.7 billion yuan went into nine ETFs traded by state funds last week (Bloomberg data)."},
      {"title": "Liquidity backstop", "body": "On Monday the central bank set up a swap facility for non-bank lenders facing redemptions."},
      {"title": "Still a bear market", "body": "The CSI 300 is about 20% below its June peak."}]),
  watch=dict(kicker="What to watch", heading="Today's Fed decision\nis *next*.",
             body="The Federal Reserve decides at 18:00 UTC today, and Alphabet, Microsoft and Amazon report this week.\n\nWatch for spillover into Asian indices and risk-sensitive currencies."),
  end=dict(kicker="Instagram", heading="Follow us on\n*Instagram*.", body="Breaking market news, guides and the economic calendar.", actions=["Save", "Share", "Follow @onfin.io"]),
  cap=["China's AI stocks have lost about $480 billion",
       "Shanghai's STAR 50 tech index has fallen about 40% from its July high. On Tuesday it dropped another 4.8% to its lowest since March, and the Shanghai Composite fell 1.3% to its lowest close since August 2025.",
       "Traders point to stretched valuations, the risk of bans on Chinese data-centre equipment and tax bills. State-backed funds put 128.7 billion yuan into ETFs last week.",
       "{fed}", "Sources: Reuters, Bloomberg"]),
 "ru": dict(
  news=dict(tag="Срочно", headline="Китайские AI-акции\n*потеряли $480 млрд*",
            summary="Технологический индекс STAR 50 в Шанхае упал примерно на 40% от июльского максимума, а во вторник снижение усилилось."),
  rates=dict(kicker="Закрытие вторника", heading="*Тяжёлый день*\nдля техсектора Китая.", columns=["Индекс", "Вторник"],
             rows=[["CSI Semiconductor", "-5,8%"], ["STAR 50", "-4,8%"], ["ChiNext", "-3,4%"], ["Hang Seng Tech", "-1,5%"], ["Shanghai Composite", "-1,3%"]],
             footnote="Закрытие 27 октября 2026 года. Shanghai Composite закрылся на уровне 3 648,30, минимум с августа 2025 года. Источник: Reuters."),
  why=dict(kicker="Причины", heading="Что стоит\nза *распродажей*.", items=[
      {"title": "Завышенные оценки", "body": "P/E индекса STAR 50 около 100 против примерно 30 у Nasdaq 100 (Reuters)."},
      {"title": "Риск запретов", "body": "Опасения, что США и другие страны запретят китайское оборудование в дата-центрах."},
      {"title": "Налоги и ротация", "body": "Трейдеры также называют налоговые платежи и уход денег из техсектора."}]),
  resp=dict(kicker="Реакция", heading="Пекин\n*вмешивается*.", items=[
      {"title": "Покупки госфондов", "body": "128,7 млрд юаней поступили в девять ETF госфондов за прошлую неделю (данные Bloomberg)."},
      {"title": "Поддержка ликвидности", "body": "В понедельник ЦБ запустил своп-линию для небанковских организаций."},
      {"title": "Медвежий рынок", "body": "CSI 300 примерно на 20% ниже июньского пика."}]),
  watch=dict(kicker="За чем следить", heading="Следом\n*решение ФРС*.",
             body="ФРС объявит решение сегодня в 21:00 МСК, а Alphabet, Microsoft и Amazon отчитываются на этой неделе.\n\nВозможен перенос волатильности на азиатские индексы и рисковые валюты."),
  end=dict(kicker="Instagram", heading="Подписывайтесь\nв *Instagram*.", body="Срочные новости рынков, гайды и экономический календарь.", actions=["Сохранить", "Поделиться", "Подписаться"]),
  cap=["Китайские AI-акции потеряли около $480 млрд",
       "Технологический индекс STAR 50 в Шанхае упал примерно на 40% от июльского максимума. Во вторник он потерял ещё 4,8% и опустился к минимуму с марта, а Shanghai Composite снизился на 1,3% до минимума закрытия с августа 2025 года.",
       "Трейдеры называют завышенные оценки, риск запретов на китайское оборудование для дата-центров и налоговые платежи. Госфонды вложили в ETF 128,7 млрд юаней за прошлую неделю.",
       "{fed}", "Источники: Reuters, Bloomberg"]),
 "es": dict(
  news=dict(tag="Última hora", headline="Las acciones de IA de China\n*pierden $480,000 millones*",
            summary="El índice tecnológico STAR 50 de Shanghái cae cerca de un 40% desde su máximo de julio, y la caída se agravó el martes."),
  rates=dict(kicker="Cierre del martes", heading="Un *mal día*\npara la tecnología china.", columns=["Índice", "Martes"],
             rows=[["CSI Semiconductor", "-5.8%"], ["STAR 50", "-4.8%"], ["ChiNext", "-3.4%"], ["Hang Seng Tech", "-1.5%"], ["Shanghai Composite", "-1.3%"]],
             footnote="Cierre del 27 oct 2026. El Shanghai Composite terminó en 3,648.30, su cierre más bajo desde agosto de 2025. Fuente: Reuters."),
  why=dict(kicker="Por qué", heading="Qué impulsa\nla *venta masiva*.", items=[
      {"title": "Valoraciones altas", "body": "El STAR 50 cotiza cerca de 100 veces beneficios, frente a 30 del Nasdaq 100 (Reuters)."},
      {"title": "Riesgo de vetos", "body": "Temor a que EE. UU. y otros veten equipos chinos en centros de datos."},
      {"title": "Impuestos y rotación", "body": "Los traders también citan pagos de impuestos y salida de dinero de la tecnología."}]),
  resp=dict(kicker="La respuesta", heading="Pekín\n*interviene*.", items=[
      {"title": "Compras estatales", "body": "128,700 millones de yuanes entraron en nueve ETF de fondos estatales la semana pasada (Bloomberg)."},
      {"title": "Respaldo de liquidez", "body": "El lunes el banco central creó un swap para entidades no bancarias con retiros masivos."},
      {"title": "Sigue en mercado bajista", "body": "El CSI 300 está cerca de un 20% por debajo de su pico de junio."}]),
  watch=dict(kicker="Qué vigilar", heading="Ahora llega\nla *Fed*.",
             body="La Reserva Federal decide hoy a las 13:00 en Bogotá y Lima, y Alphabet, Microsoft y Amazon publican resultados esta semana.\n\nAtento al contagio en índices asiáticos y divisas de riesgo."),
  end=dict(kicker="Instagram", heading="Síguenos en\n*Instagram*.", body="Noticias de última hora, guías y el calendario económico.", actions=["Guardar", "Compartir", "Seguir @onfin.io"]),
  cap=["Las acciones de IA de China pierden cerca de $480,000 millones",
       "El índice tecnológico STAR 50 de Shanghái cae alrededor de un 40% desde su máximo de julio. El martes bajó otro 4.8% hasta su nivel más bajo desde marzo, y el Shanghai Composite cayó un 1.3% a su cierre más bajo desde agosto de 2025.",
       "Los traders señalan valoraciones elevadas, el riesgo de vetos a equipos chinos en centros de datos y pagos de impuestos. Los fondos estatales metieron 128,700 millones de yuanes en ETF la semana pasada.",
       "{fed}", "Fuentes: Reuters, Bloomberg"]),
 "ms": dict(
  news=dict(tag="Terkini", headline="Saham AI China\n*hilang $480 bilion*",
            summary="Indeks teknologi STAR 50 Shanghai jatuh kira-kira 40% dari paras tertinggi Julai, dan kejatuhan makin dalam pada Selasa."),
  rates=dict(kicker="Penutupan Selasa", heading="*Hari buruk*\nbagi teknologi China.", columns=["Indeks", "Selasa"],
             rows=[["CSI Semiconductor", "-5.8%"], ["STAR 50", "-4.8%"], ["ChiNext", "-3.4%"], ["Hang Seng Tech", "-1.5%"], ["Shanghai Composite", "-1.3%"]],
             footnote="Penutupan 27 Okt 2026. Shanghai Composite ditutup pada 3,648.30, terendah sejak Ogos 2025. Sumber: Reuters."),
  why=dict(kicker="Punca", heading="Apa yang mendorong\n*jualan besar*.", items=[
      {"title": "Penilaian tinggi", "body": "STAR 50 didagangkan sekitar 100x pendapatan, berbanding 30x bagi Nasdaq 100 (Reuters)."},
      {"title": "Risiko larangan", "body": "Bimbang AS dan negara lain mengharamkan peralatan China di pusat data."},
      {"title": "Cukai dan putaran", "body": "Pedagang turut menyebut bil cukai dan wang yang keluar dari teknologi."}]),
  resp=dict(kicker="Tindak balas", heading="Beijing\n*campur tangan*.", items=[
      {"title": "Belian dana kerajaan", "body": "128.7 bilion yuan masuk ke sembilan ETF dana kerajaan minggu lalu (data Bloomberg)."},
      {"title": "Sokongan kecairan", "body": "Pada Isnin bank pusat mewujudkan kemudahan swap untuk institusi bukan bank."},
      {"title": "Masih pasaran menurun", "body": "CSI 300 kira-kira 20% di bawah paras tertinggi Jun."}]),
  watch=dict(kicker="Apa perlu dipantau", heading="Seterusnya,\n*keputusan Fed*.",
             body="Fed membuat keputusan jam 02:00 waktu Malaysia (Khamis), dan Alphabet, Microsoft serta Amazon melaporkan pendapatan minggu ini.\n\nPantau kesan limpahan pada indeks Asia dan mata wang berisiko."),
  end=dict(kicker="Instagram", heading="Ikuti kami di\n*Instagram*.", body="Berita pasaran terkini, panduan dan kalendar ekonomi.", actions=["Simpan", "Kongsi", "Ikuti @onfin.io"]),
  cap=["Saham AI China hilang kira-kira $480 bilion",
       "Indeks teknologi STAR 50 Shanghai jatuh kira-kira 40% dari paras tertinggi Julai. Pada Selasa ia susut lagi 4.8% ke paras terendah sejak Mac, dan Shanghai Composite jatuh 1.3% ke penutupan terendah sejak Ogos 2025.",
       "Pedagang menyebut penilaian yang terlalu tinggi, risiko larangan ke atas peralatan pusat data China dan bil cukai. Dana kerajaan menyuntik 128.7 bilion yuan ke dalam ETF minggu lalu.",
       "{fed}", "Sumber: Reuters, Bloomberg"]),
}
FED = {
 "en": "Watch for spillover into Asian indices and risk-sensitive currencies around today's Fed decision at 18:00 UTC.",
 "kh": "Watch for spillover into Asian indices and risk-sensitive currencies around the Fed decision at 01:00 Cambodia time (Thursday).",
 "ms": "Pantau kesan limpahan pada indeks Asia dan mata wang berisiko sekitar keputusan Fed jam 02:00 waktu Malaysia (Khamis).",
 "ru": "Следите за переносом волатильности на азиатские индексы и рисковые валюты вокруг решения ФРС сегодня в 21:00 МСК.",
 "es": "Atento al contagio en índices asiáticos y divisas de riesgo en torno a la decisión de la Fed de hoy a las 13:00 en Bogotá y Lima.",
}

imgs = {}
for l, d in D.items():
    f = lambda i: f"china-{l}-{i:02d}.png"
    imgs[l] = [
        W.lib("CarouselNews", dict(live=True, source="Reuters", date="28 Oct 2026", media=MEDIA, meta="Flash", **d["news"]), f(1)),
        W.lib("CarouselRates", dict(meta="Flash", index=2, total=T, **d["rates"]), f(2)),
        W.lib("CarouselList", dict(meta="Flash", index=3, total=T, **d["why"]), f(3)),
        W.lib("CarouselList", dict(meta="Flash", index=4, total=T, **d["resp"]), f(4)),
        W.lib("CarouselText", dict(meta="Flash", index=5, total=T, **d["watch"]), f(5)),
        W.lib("CarouselEnd", dict(meta="Flash", index=6, total=T, **d["end"]), f(6)),
    ]
fb_end = W.lib("CarouselTelegram", dict(locale="en", channel="onfinkm", kicker="Telegram", meta="Flash", heading="Breaking news,\n*straight* to Telegram.",
               items=["Market moves as they happen", "Calendar alerts before NFP, CPI and FOMC", "Platform news first"], index=6, total=T), "china-en-06-telegram.png")
story = W.lib("StoryNews", dict(tag="Breaking", live=True, headline=D["en"]["news"]["headline"],
              summary=D["en"]["news"]["summary"] + " Source: Reuters.", time="28 Oct 2026", media=MEDIA), "china-story.png")

for ch, l, fed in [("en", "en", "en"), ("kh", "en", "kh"), ("fb", "en", "kh"), ("ms", "ms", "ms"), ("ru", "ru", "ru"), ("es", "es", "es"), ("ig", "en", "en")]:
    cap = [c.replace("{fed}", FED[fed]) for c in D[l]["cap"]]
    extra = ["#china #stockmarket #markets #ai #breakingnews #onfin"] if ch == "ig" else []
    im = imgs[l] if ch != "fb" else imgs["en"][:5] + [fb_end]
    W.post("flash-china", ch, WHEN, cap + [NOTADV[l]] + extra + [RISK[l]], im)
W.post("flash-china-story", "ig", WHEN, [], [story], story=True)

if __name__ == "__main__":
    W.save()
