"""Genesis posts for weeks 3 to 10. Spec-driven: one dict per post, four locales each.
Facts only from genesis.onfin.io (27 Oct 2026). Rules: no dashes, no '!', no emoji, no profit claims."""
from common import G, G_LEGAL, G_AGE
from genesis_posts import publish, link, footer, CHIPS, T

LANGS = ("en", "ru", "es", "ms")
LINK_LBL = {
    "campaigns": {"en": "Open campaigns", "ru": "Активные кампании", "es": "Campañas abiertas", "ms": "Kempen dibuka"},
    "get-started": None,
    "": {"en": "Apply", "ru": "Подать заявку", "es": "Aplica", "ms": "Mohon"},
}
CTA = {l: T["end"][l]["cta"] for l in LANGS}
FOOT = {"en": "18+ only. Free to join, no trading needed.", "ru": "Только от 18 лет. Бесплатно, торговать не нужно.",
        "es": "Solo mayores de 18. Gratis, sin necesidad de operar.", "ms": "18 tahun ke atas sahaja. Percuma, tiada dagangan diperlukan."}


def single(W, key, day, spec, page="get-started"):
    """spec[l] = dict(cover=(kicker, headline, sub) | table=(kicker, heading, cols, rows, note) | lib=(template, props), cap=[...])"""
    imgs, story = {}, {}
    for l in LANGS:
        s = spec[l]
        if "cover" in s:
            k, hd, sub = s["cover"]
            chips = s.get("chips", ())
            imgs[l] = [W.gen(G.cover(k, hd, sub, chips, foot=FOOT[l]), f"{key}-{l}.png")]
            story[l] = W.gen(G.cover(k, hd, sub, chips, story=True, foot=FOOT[l], cta=CTA[l]), f"{key}-story-{l}.png")
        elif "table" in s:
            k, hd, cols, rows, note = s["table"]
            imgs[l] = [W.gen(G.table(k, hd, cols, rows, note, G_AGE[l]), f"{key}-{l}.png")]
            story[l] = W.gen(G.table(k, hd, cols, rows, note, G_AGE[l], story=True), f"{key}-story-{l}.png")
        else:
            tpl, props = s["lib"]
            imgs[l] = [W.lib(tpl, dict(meta="Genesis", **props), f"{key}-{l}.png")]
            k, hd, sub = s["story"]
            story[l] = W.gen(G.cover(k, hd, sub, CHIPS, story=True, foot=FOOT[l], cta=CTA[l]), f"{key}-story-{l}.png")
    lab = LINK_LBL.get(page)
    publish(W, key, day, imgs, lambda l, ch: spec[l]["cap"] + link(l, ch, page, lab[l] if lab else None) + footer(l, ch), story)


def carousel(W, key, day, spec):
    """spec[l] = dict(cover=(kicker, headline, sub), slides=[(template, props), ...], cap=[...]); end slide added."""
    imgs, story = {}, {}
    for l in LANGS:
        s = spec[l]
        tot = len(s["slides"]) + 2
        k, hd, sub = s["cover"]
        f = lambda i: f"{key}-{l}-{i:02d}.png"
        im = [W.gen(G.cover(k, hd, sub, CHIPS), f(1))]
        for i, (tpl, props) in enumerate(s["slides"], start=2):
            im.append(W.lib(tpl, dict(meta="Genesis", index=i, total=tot, **props), f(i)))
        im.append(W.gen(G.end(index=tot, total=tot, **T["end"][l]), f(tot)))
        imgs[l] = im
        story[l] = W.gen(G.cover(k, hd, sub, CHIPS, story=True, foot=FOOT[l], cta=CTA[l]), f"{key}-story-{l}.png")
    publish(W, key, day, imgs, lambda l, ch: spec[l]["cap"] + link(l, ch) + footer(l, ch), story)


# ======================================================================= singles
SPOT_COPY = {
 "en": dict(cover=("Campaign spotlight", "Explain *copy trading*\nto someone new.", "Show how to pick a strategy, set how much to allocate and stay in control."),
            cap=["Campaign spotlight: Copy trading, explained", "Make a short video that explains OnFin Copy Trading to people who've never traded: pick a strategy, set how much to allocate, stay in control.",
                 "$3 per 1,000 views, up to $100 a video. Scripts are reviewed before you film, and videos can't promise returns."]),
 "ru": dict(cover=("Кампания недели", "Объясните *копи-трейдинг*\nновичку.", "Покажите, как выбрать стратегию, задать сумму и сохранять контроль."),
            cap=["Кампания недели: копи-трейдинг простыми словами", "Снимите короткое видео, которое объясняет OnFin Copy Trading тем, кто никогда не торговал: выберите стратегию, задайте сумму, сохраняйте контроль.",
                 "$3 за 1 000 просмотров, до $100 за видео. Сценарий проверяется до съёмки, а видео не может обещать доходность."]),
 "es": dict(cover=("Campaña destacada", "Explica el *copy trading*\na alguien nuevo.", "Muestra cómo elegir una estrategia, definir cuánto asignar y mantener el control."),
            cap=["Campaña destacada: Copy trading, explicado", "Haz un video corto que explique OnFin Copy Trading a quien nunca ha operado: elige una estrategia, define cuánto asignar y mantén el control.",
                 "$3 por cada 1,000 vistas, hasta $100 por video. Revisamos el guion antes de grabar y el video no puede prometer rendimientos."]),
 "ms": dict(cover=("Sorotan kempen", "Terangkan *copy trading*\nkepada orang baharu.", "Tunjukkan cara memilih strategi, menetapkan peruntukan dan kekal mengawal."),
            cap=["Sorotan kempen: Copy trading, dijelaskan", "Hasilkan video pendek yang menerangkan OnFin Copy Trading kepada orang yang belum pernah berdagang: pilih strategi, tetapkan peruntukan, kekal mengawal.",
                 "$3 setiap 1,000 tontonan, sehingga $100 setiap video. Skrip disemak sebelum anda merakam dan video tidak boleh menjanjikan pulangan."]),
}
NO_TRADE = {
 "en": dict(cover=("Genesis FAQ", "No trading.\nNo deposit.\nJust *videos*.", "Genesis pays creators for views, not trades."),
            cap=["Do I need to trade to join Genesis?", "No. You don't need an OnFin trading account, and you don't need to trade or deposit.",
                 "Genesis pays creators $3 per 1,000 views for approved videos about OnFin, up to $100 a video."]),
 "ru": dict(cover=("Вопросы о Genesis", "Без торговли.\nБез депозита.\nТолько *видео*.", "Genesis платит креаторам за просмотры, а не за сделки."),
            cap=["Нужно ли торговать, чтобы участвовать в Genesis?", "Нет. Торговый счёт OnFin не нужен, торговать или пополнять счёт тоже не нужно.",
                 "Genesis платит креаторам $3 за 1 000 просмотров одобренных видео об OnFin, до $100 за видео."]),
 "es": dict(cover=("Preguntas sobre Genesis", "Sin operar.\nSin depositar.\nSolo *videos*.", "Genesis paga a creadores por vistas, no por operaciones."),
            cap=["¿Necesito operar para unirme a Genesis?", "No. No necesitas una cuenta de trading en OnFin, ni operar ni depositar.",
                 "Genesis paga a los creadores $3 por cada 1,000 vistas de videos aprobados sobre OnFin, hasta $100 por video."]),
 "ms": dict(cover=("Soalan Genesis", "Tiada dagangan.\nTiada deposit.\nHanya *video*.", "Genesis membayar pencipta untuk tontonan, bukan dagangan."),
            cap=["Perlukah saya berdagang untuk menyertai Genesis?", "Tidak. Anda tidak memerlukan akaun dagangan OnFin, dan tidak perlu berdagang atau membuat deposit.",
                 "Genesis membayar pencipta $3 setiap 1,000 tontonan untuk video yang diluluskan tentang OnFin, sehingga $100 setiap video."]),
}
SCRIPT_FIRST = {
 "en": dict(lib=("CarouselSteps", dict(kicker="Script first", heading="We say yes *before*\nyou film.", current=1, disclaimer=G_LEGAL["en"], steps=[
                {"title": "Script", "body": "Send your idea. We approve it or ask for changes"},
                {"title": "Draft", "body": "Send a Drive, Dropbox or unlisted YouTube link"},
                {"title": "Post", "body": "Post the approved video exactly as it is"},
                {"title": "Views", "body": "We count views, then pay you"}])),
            story=("Script first", "We say yes *before*\nyou film.", "Your script is checked first, so your work doesn't get rejected later."),
            cap=["Script first, then film", "Every Genesis video starts with a script. We check it before you film, so your work doesn't get rejected later.",
                 "Then send your draft as a Drive, Dropbox or unlisted YouTube link. Don't post until it's approved."]),
 "ru": dict(lib=("CarouselSteps", dict(kicker="Сначала сценарий", heading="Мы говорим да\n*до* съёмки.", current=1, disclaimer=G_LEGAL["ru"], steps=[
                {"title": "Сценарий", "body": "Пришлите идею. Мы одобрим или попросим правки"},
                {"title": "Черновик", "body": "Ссылка на Drive, Dropbox или YouTube по ссылке"},
                {"title": "Публикация", "body": "Опубликуйте одобренное видео без изменений"},
                {"title": "Просмотры", "body": "Мы считаем просмотры и платим"}])),
            story=("Сначала сценарий", "Мы говорим да\n*до* съёмки.", "Сценарий проверяется заранее, чтобы работу потом не отклонили."),
            cap=["Сначала сценарий, потом съёмка", "Каждое видео Genesis начинается со сценария. Мы проверяем его до съёмки, чтобы работу потом не отклонили.",
                 "Затем пришлите черновик ссылкой на Drive, Dropbox или YouTube по ссылке. Не публикуйте до одобрения."]),
 "es": dict(lib=("CarouselSteps", dict(kicker="Primero el guion", heading="Te damos el sí\n*antes* de grabar.", current=1, disclaimer=G_LEGAL["es"], steps=[
                {"title": "Guion", "body": "Envía tu idea. La aprobamos o pedimos cambios"},
                {"title": "Borrador", "body": "Envía un enlace de Drive, Dropbox o YouTube oculto"},
                {"title": "Publicación", "body": "Publica el video aprobado tal cual"},
                {"title": "Vistas", "body": "Contamos las vistas y te pagamos"}])),
            story=("Primero el guion", "Te damos el sí\n*antes* de grabar.", "Revisamos tu guion primero, para que tu trabajo no se rechace después."),
            cap=["Primero el guion, luego la grabación", "Todo video de Genesis empieza con un guion. Lo revisamos antes de que grabes, para que tu trabajo no se rechace después.",
                 "Luego envía tu borrador con un enlace de Drive, Dropbox o YouTube oculto. No publiques hasta que esté aprobado."]),
 "ms": dict(lib=("CarouselSteps", dict(kicker="Skrip dahulu", heading="Kami luluskan\n*sebelum* anda rakam.", current=1, disclaimer=G_LEGAL["ms"], steps=[
                {"title": "Skrip", "body": "Hantar idea anda. Kami luluskan atau minta perubahan"},
                {"title": "Draf", "body": "Hantar pautan Drive, Dropbox atau YouTube tidak tersenarai"},
                {"title": "Siar", "body": "Siarkan video yang diluluskan tanpa perubahan"},
                {"title": "Tontonan", "body": "Kami kira tontonan, kemudian bayar anda"}])),
            story=("Skrip dahulu", "Kami luluskan\n*sebelum* anda rakam.", "Skrip disemak dahulu supaya kerja anda tidak ditolak kemudian."),
            cap=["Skrip dahulu, kemudian rakam", "Setiap video Genesis bermula dengan skrip. Kami menyemaknya sebelum anda merakam, supaya kerja anda tidak ditolak kemudian.",
                 "Kemudian hantar draf anda melalui pautan Drive, Dropbox atau YouTube tidak tersenarai. Jangan siarkan sebelum diluluskan."]),
}
PLATFORMS = {
 "en": dict(cover=("Where to post", "Your platform,\n*your* audience.", "TikTok, Instagram Reels, Facebook Reels or YouTube Shorts."), chips=CHIPS,
            cap=["Your platform, your audience", "Genesis videos can go on TikTok, Instagram Reels, Facebook Reels or YouTube Shorts. Each campaign lists the platforms it accepts.",
                 "You'll need a public account, and you prove it's yours by adding a short code to its bio."]),
 "ru": dict(cover=("Где публиковать", "Ваша площадка,\n*ваша* аудитория.", "TikTok, Instagram Reels, Facebook Reels или YouTube Shorts."), chips=CHIPS,
            cap=["Ваша площадка, ваша аудитория", "Видео Genesis можно публиковать в TikTok, Instagram Reels, Facebook Reels или YouTube Shorts. В каждой кампании указаны подходящие площадки.",
                 "Нужен публичный аккаунт. Чтобы подтвердить, что он ваш, добавьте короткий код в био."]),
 "es": dict(cover=("Dónde publicar", "Tu plataforma,\n*tu* audiencia.", "TikTok, Instagram Reels, Facebook Reels o YouTube Shorts."), chips=CHIPS,
            cap=["Tu plataforma, tu audiencia", "Los videos de Genesis pueden ir en TikTok, Instagram Reels, Facebook Reels o YouTube Shorts. Cada campaña indica qué plataformas acepta.",
                 "Necesitas una cuenta pública y demuestras que es tuya añadiendo un código corto a su bio."]),
 "ms": dict(cover=("Di mana menyiar", "Platform anda,\n*audiens* anda.", "TikTok, Instagram Reels, Facebook Reels atau YouTube Shorts."), chips=CHIPS,
            cap=["Platform anda, audiens anda", "Video Genesis boleh disiarkan di TikTok, Instagram Reels, Facebook Reels atau YouTube Shorts. Setiap kempen menyenaraikan platform yang diterima.",
                 "Anda memerlukan akaun awam, dan membuktikan ia milik anda dengan menambah kod pendek pada bionya."]),
}
SPOT_START = {
 "en": dict(cover=("Campaign spotlight", "Introduce *OnFin*\nto your audience.", "Who we are, what you can trade and how to sign up."),
            cap=["Campaign spotlight: Start trading with OnFin", "Make a short video that introduces OnFin to your audience: who we are, what you can trade and how to sign up.",
                 "$3 per 1,000 views, up to $100 a video. Keep it factual: no profit promises and no investment advice."]),
 "ru": dict(cover=("Кампания недели", "Расскажите об *OnFin*\nсвоей аудитории.", "Кто мы, чем можно торговать и как зарегистрироваться."),
            cap=["Кампания недели: начните торговать с OnFin", "Снимите короткое видео, которое знакомит вашу аудиторию с OnFin: кто мы, чем можно торговать и как зарегистрироваться.",
                 "$3 за 1 000 просмотров, до $100 за видео. Только факты: без обещаний прибыли и инвестиционных советов."]),
 "es": dict(cover=("Campaña destacada", "Presenta *OnFin*\na tu audiencia.", "Quiénes somos, qué puedes operar y cómo registrarte."),
            cap=["Campaña destacada: Comienza a operar con OnFin", "Haz un video corto que presente OnFin a tu audiencia: quiénes somos, qué puedes operar y cómo registrarte.",
                 "$3 por cada 1,000 vistas, hasta $100 por video. Solo hechos: sin prometer ganancias ni dar asesoría de inversión."]),
 "ms": dict(cover=("Sorotan kempen", "Perkenalkan *OnFin*\nkepada audiens anda.", "Siapa kami, apa yang boleh didagangkan dan cara mendaftar."),
            cap=["Sorotan kempen: Mula berdagang dengan OnFin", "Hasilkan video pendek yang memperkenalkan OnFin kepada audiens anda: siapa kami, apa yang boleh didagangkan dan cara mendaftar.",
                 "$3 setiap 1,000 tontonan, sehingga $100 setiap video. Kekal fakta: tiada janji keuntungan dan tiada nasihat pelaburan."]),
}
USDT = {
 "en": dict(table=("Getting paid", "How your views\n*turn into USDT*.", ("", ""), [("Paid in", "USDT"), ("Network", "TRC-20"), ("Payouts", "Weekly"), ("Views counted", "14 days")],
                   "Views are counted for the campaign window, usually 14 days from when we approve your link. Add your wallet when you apply, or later."),
            cap=["How your views turn into USDT", "We count a video's views for the campaign window, usually 14 days from when we approve your link.",
                 "Then we pay what it earned in USDT on TRON (TRC-20), in a weekly payout, and show you the transaction."]),
 "ru": dict(table=("Выплаты", "Как просмотры\n*становятся USDT*.", ("", ""), [("Валюта", "USDT"), ("Сеть", "TRC-20"), ("Выплаты", "Еженедельно"), ("Подсчёт", "14 дней")],
                   "Просмотры считаются в период кампании, обычно 14 дней с момента одобрения ссылки. Кошелёк можно добавить при заявке или позже."),
            cap=["Как просмотры становятся USDT", "Мы считаем просмотры видео в период отслеживания кампании, обычно 14 дней с момента одобрения вашей ссылки.",
                 "Затем выплачиваем заработанное в USDT в сети TRON (TRC-20) в еженедельной выплате и показываем транзакцию."]),
 "es": dict(table=("Cómo cobras", "Cómo tus vistas\n*se convierten en USDT*.", ("", ""), [("Pago en", "USDT"), ("Red", "TRC-20"), ("Pagos", "Semanales"), ("Conteo", "14 días")],
                   "Contamos las vistas durante la campaña, normalmente 14 días desde que aprobamos tu enlace. Agrega tu billetera al aplicar o después."),
            cap=["Cómo tus vistas se convierten en USDT", "Contamos las vistas de un video durante la ventana de la campaña, normalmente 14 días desde que aprobamos tu enlace.",
                 "Luego pagamos lo que ganó en USDT en TRON (TRC-20), en un pago semanal, y te mostramos la transacción."]),
 "ms": dict(table=("Dibayar", "Bagaimana tontonan\n*menjadi USDT*.", ("", ""), [("Dibayar dalam", "USDT"), ("Rangkaian", "TRC-20"), ("Bayaran", "Mingguan"), ("Tontonan dikira", "14 hari")],
                   "Tontonan dikira sepanjang tempoh kempen, biasanya 14 hari dari kelulusan pautan anda. Tambah dompet semasa memohon atau kemudian."),
            cap=["Bagaimana tontonan menjadi USDT", "Kami mengira tontonan video sepanjang tempoh penjejakan kempen, biasanya 14 hari dari apabila kami meluluskan pautan anda.",
                 "Kemudian kami membayar apa yang diperoleh dalam USDT di TRON (TRC-20), dalam bayaran mingguan, dan tunjukkan transaksinya."]),
}
RULES = {
 "en": dict(cover=("The rules", "Three ways to\n*lose* a payout.", "Bought views, a skipped review, or deleting a video before its views lock."),
            cap=["Three ways to lose a payout", "A video isn't paid if it skips a review step, misses the tag, hashtags or #ad disclosure, uses bought or fake views, reposts someone else's video, promises profits, or is deleted before its views lock.",
                 "Follow the brief and every step counts."]),
 "ru": dict(cover=("Правила", "Три способа\n*потерять* выплату.", "Накрутка, пропущенная проверка или удаление видео до фиксации просмотров."),
            cap=["Три способа потерять выплату", "Видео не оплачивается, если пропущен шаг проверки, нет тега, хэштегов или пометки #ad, просмотры куплены или накручены, видео чужое, в нём обещают прибыль или его удалили до фиксации просмотров.",
                 "Следуйте брифу, и каждый шаг засчитается."]),
 "es": dict(cover=("Las reglas", "Tres formas de\n*perder* un pago.", "Vistas compradas, una revisión saltada o borrar el video antes de que se fijen sus vistas."),
            cap=["Tres formas de perder un pago", "Un video no se paga si se salta una revisión, le faltan la etiqueta, los hashtags o la línea #ad, usa vistas compradas o falsas, es de otra persona, promete ganancias o se borra antes de que se fijen sus vistas.",
                 "Sigue el brief y cada paso cuenta."]),
 "ms": dict(cover=("Peraturan", "Tiga cara\n*hilang* bayaran.", "Tontonan dibeli, semakan dilangkau, atau video dipadam sebelum tontonan dikunci."),
            cap=["Tiga cara hilang bayaran", "Video tidak dibayar jika melangkau langkah semakan, tiada tag, hashtag atau pendedahan #ad, menggunakan tontonan dibeli atau palsu, menyiarkan semula video orang lain, menjanjikan keuntungan, atau dipadam sebelum tontonan dikunci.",
                 "Ikut ringkasan dan setiap langkah dikira."]),
}
PROVE = {
 "en": dict(cover=("Verify your account", "Prove it's yours\nin *one minute*.", "Add a short code to your bio, press Check, then remove it."),
            cap=["Prove your account in one minute", "Genesis gives you a short code. Add it anywhere in your account's bio, save, then press Check now.",
                 "Once it's verified you can remove the code. We review your application and email you when you're approved."]),
 "ru": dict(cover=("Подтвердите аккаунт", "Докажите, что он ваш,\nза *одну минуту*.", "Добавьте код в био, нажмите Проверить, затем удалите его."),
            cap=["Подтвердите аккаунт за минуту", "Genesis выдаёт короткий код. Добавьте его в любое место био аккаунта, сохраните и нажмите Проверить.",
                 "После проверки код можно удалить. Мы рассмотрим заявку и напишем на почту, когда вас одобрят."]),
 "es": dict(cover=("Verifica tu cuenta", "Demuestra que es tuya\nen *un minuto*.", "Pon un código corto en tu bio, pulsa Comprobar y luego bórralo."),
            cap=["Verifica tu cuenta en un minuto", "Genesis te da un código corto. Ponlo en cualquier parte de la bio de tu cuenta, guarda y pulsa Comprobar.",
                 "Una vez verificada puedes quitar el código. Revisamos tu solicitud y te escribimos cuando te aprobemos."]),
 "ms": dict(cover=("Sahkan akaun anda", "Buktikan ia milik anda\ndalam *satu minit*.", "Tambah kod pendek pada bio, tekan Semak, kemudian padamkannya."),
            cap=["Sahkan akaun anda dalam satu minit", "Genesis memberi anda kod pendek. Tambahkannya di mana-mana dalam bio akaun anda, simpan, kemudian tekan Semak sekarang.",
                 "Setelah disahkan anda boleh membuang kod itu. Kami menyemak permohonan anda dan menghantar e-mel apabila anda diluluskan."]),
}
MATH2 = {
 "en": dict(table=("The math", "More views,\n*more* pay.", ("Views", "You earn"), [("7,500", "$22.50"), ("15,000", "$45"), ("25,000", "$75"), ("Cap per video", "$100")],
                   "At $3 per 1,000 views. Videos earn from 5,000 views. Each brief sets its own rate, minimum and cap."),
            cap=["More views, more pay", "7,500 views: $22.50", "15,000 views: $45", "25,000 views: $75", "Cap per video: $100",
                 "That's at $3 per 1,000 views. Videos start earning from 5,000 views, and each brief sets its own rate, minimum and cap."]),
 "ru": dict(table=("Считаем", "Больше просмотров,\n*больше* оплата.", ("Просмотры", "Вы получаете"), [("7 500", "$22,50"), ("15 000", "$45"), ("25 000", "$75"), ("Лимит за видео", "$100")],
                   "При ставке $3 за 1 000 просмотров. Видео приносит доход от 5 000 просмотров. В каждом брифе свои ставка, минимум и лимит."),
            cap=["Больше просмотров, больше оплата", "7 500 просмотров: $22,50", "15 000 просмотров: $45", "25 000 просмотров: $75", "Лимит за видео: $100",
                 "Расчёт при ставке $3 за 1 000 просмотров. Видео начинает приносить доход от 5 000 просмотров, а в каждом брифе свои ставка, минимум и лимит."]),
 "es": dict(table=("Las cuentas", "Más vistas,\n*más* pago.", ("Vistas", "Ganas"), [("7,500", "$22.50"), ("15,000", "$45"), ("25,000", "$75"), ("Tope por video", "$100")],
                   "A $3 por cada 1,000 vistas. Los videos generan ingresos desde 5,000 vistas. Cada brief fija su tarifa, mínimo y tope."),
            cap=["Más vistas, más pago", "7,500 vistas: $22.50", "15,000 vistas: $45", "25,000 vistas: $75", "Tope por video: $100",
                 "Calculado a $3 por cada 1,000 vistas. Los videos generan ingresos desde 5,000 vistas y cada brief fija su tarifa, mínimo y tope."]),
 "ms": dict(table=("Kiraannya", "Lebih tontonan,\n*lebih* bayaran.", ("Tontonan", "Anda terima"), [("7,500", "$22.50"), ("15,000", "$45"), ("25,000", "$75"), ("Had setiap video", "$100")],
                   "Pada kadar $3 setiap 1,000 tontonan. Video mula dibayar dari 5,000 tontonan. Setiap ringkasan menetapkan kadar, minimum dan hadnya sendiri."),
            cap=["Lebih tontonan, lebih bayaran", "7,500 tontonan: $22.50", "15,000 tontonan: $45", "25,000 tontonan: $75", "Had setiap video: $100",
                 "Dikira pada kadar $3 setiap 1,000 tontonan. Video mula dibayar dari 5,000 tontonan dan setiap ringkasan menetapkan kadar, minimum dan hadnya sendiri."]),
}
FIRST_VIDEO = {
 "en": dict(lib=("CarouselTimeline", dict(kicker="Your first video", heading="From application\nto *payout*.", events=[
                {"date": "01", "title": "Apply and verify", "body": "Link accounts, add the bio code"},
                {"date": "02", "title": "Script approved", "body": "Before you film anything"},
                {"date": "03", "title": "Draft approved", "body": "Before you post"},
                {"date": "04", "title": "Post and send the link", "current": True},
                {"date": "05", "title": "Views counted, paid in USDT", "body": "Usually 14 days, weekly payouts"}])),
            story=("Your first video", "From application\nto *payout*.", "Apply, verify, get your script and draft approved, post, get paid."),
            cap=["Your first video, from application to payout", "Apply and verify your account. Get your script approved, then your draft. Post the video and send us the link.",
                 "We count its views for the campaign window, usually 14 days, then pay what it earned in USDT in the weekly payout."]),
 "ru": dict(lib=("CarouselTimeline", dict(kicker="Ваше первое видео", heading="От заявки\nдо *выплаты*.", events=[
                {"date": "01", "title": "Заявка и проверка", "body": "Аккаунты и код в био"},
                {"date": "02", "title": "Сценарий одобрен", "body": "До начала съёмки"},
                {"date": "03", "title": "Черновик одобрен", "body": "До публикации"},
                {"date": "04", "title": "Публикация и ссылка", "current": True},
                {"date": "05", "title": "Подсчёт и выплата в USDT", "body": "Обычно 14 дней, выплаты еженедельно"}])),
            story=("Ваше первое видео", "От заявки\nдо *выплаты*.", "Заявка, проверка, сценарий, черновик, публикация, выплата."),
            cap=["Ваше первое видео: от заявки до выплаты", "Подайте заявку и подтвердите аккаунт. Согласуйте сценарий, затем черновик. Опубликуйте видео и пришлите ссылку.",
                 "Мы считаем просмотры в период кампании, обычно 14 дней, и выплачиваем заработанное в USDT в еженедельной выплате."]),
 "es": dict(lib=("CarouselTimeline", dict(kicker="Tu primer video", heading="De la solicitud\nal *pago*.", events=[
                {"date": "01", "title": "Aplica y verifica", "body": "Vincula cuentas, pon el código en la bio"},
                {"date": "02", "title": "Guion aprobado", "body": "Antes de grabar nada"},
                {"date": "03", "title": "Borrador aprobado", "body": "Antes de publicar"},
                {"date": "04", "title": "Publica y envía el enlace", "current": True},
                {"date": "05", "title": "Vistas contadas, pago en USDT", "body": "Normalmente 14 días, pagos semanales"}])),
            story=("Tu primer video", "De la solicitud\nal *pago*.", "Aplica, verifica, aprueba guion y borrador, publica y cobra."),
            cap=["Tu primer video, de la solicitud al pago", "Aplica y verifica tu cuenta. Aprueba tu guion y luego tu borrador. Publica el video y envíanos el enlace.",
                 "Contamos sus vistas durante la campaña, normalmente 14 días, y pagamos lo que ganó en USDT en el pago semanal."]),
 "ms": dict(lib=("CarouselTimeline", dict(kicker="Video pertama anda", heading="Dari permohonan\nke *bayaran*.", events=[
                {"date": "01", "title": "Mohon dan sahkan", "body": "Pautkan akaun, tambah kod bio"},
                {"date": "02", "title": "Skrip diluluskan", "body": "Sebelum anda merakam"},
                {"date": "03", "title": "Draf diluluskan", "body": "Sebelum anda menyiar"},
                {"date": "04", "title": "Siar dan hantar pautan", "current": True},
                {"date": "05", "title": "Tontonan dikira, dibayar USDT", "body": "Biasanya 14 hari, bayaran mingguan"}])),
            story=("Video pertama anda", "Dari permohonan\nke *bayaran*.", "Mohon, sahkan, luluskan skrip dan draf, siar, dibayar."),
            cap=["Video pertama anda, dari permohonan ke bayaran", "Mohon dan sahkan akaun anda. Dapatkan kelulusan skrip, kemudian draf. Siarkan video dan hantar pautannya kepada kami.",
                 "Kami mengira tontonannya sepanjang tempoh kempen, biasanya 14 hari, kemudian membayar apa yang diperoleh dalam USDT dalam bayaran mingguan."]),
}
STILL_TIME = {
 "en": dict(cover=("Campaigns are open", "Still time for\nyour *first* video.", "$3 per 1,000 views, up to $100 a video."),
            cap=["Still time for your first video", "Genesis campaigns are open now. Pick a brief, send your script and we'll review it before you film.",
                 "$3 per 1,000 views, up to $100 a video, paid weekly in USDT."]),
 "ru": dict(cover=("Кампании открыты", "Ещё есть время\nдля *первого* видео.", "$3 за 1 000 просмотров, до $100 за видео."),
            cap=["Ещё есть время для первого видео", "Кампании Genesis уже открыты. Выберите бриф, пришлите сценарий, и мы проверим его до съёмки.",
                 "$3 за 1 000 просмотров, до $100 за видео, выплаты еженедельно в USDT."]),
 "es": dict(cover=("Campañas abiertas", "Aún hay tiempo para\ntu *primer* video.", "$3 por cada 1,000 vistas, hasta $100 por video."),
            cap=["Aún hay tiempo para tu primer video", "Las campañas de Genesis están abiertas. Elige un brief, envía tu guion y lo revisamos antes de que grabes.",
                 "$3 por cada 1,000 vistas, hasta $100 por video, con pagos semanales en USDT."]),
 "ms": dict(cover=("Kempen dibuka", "Masih ada masa untuk\nvideo *pertama* anda.", "$3 setiap 1,000 tontonan, sehingga $100 setiap video."),
            cap=["Masih ada masa untuk video pertama anda", "Kempen Genesis kini dibuka. Pilih ringkasan, hantar skrip anda dan kami akan menyemaknya sebelum anda merakam.",
                 "$3 setiap 1,000 tontonan, sehingga $100 setiap video, dibayar setiap minggu dalam USDT."]),
}
HOLIDAYS = {
 "en": dict(cover=("Holiday plan", "Time off?\nFilm your *first* video.", "Send your script now, so it's approved before you film."),
            cap=["Time off over the holidays?", "Send your Genesis script this week, so it's approved before you film. Then send your draft, post the approved video and send us the link.",
                 "Views are counted for the campaign window and paid weekly in USDT."]),
 "ru": dict(cover=("План на праздники", "Есть свободное время?\nСнимите *первое* видео.", "Пришлите сценарий сейчас, чтобы его одобрили до съёмки."),
            cap=["Свободное время на праздниках?", "Пришлите сценарий Genesis на этой неделе, чтобы его одобрили до съёмки. Затем пришлите черновик, опубликуйте одобренное видео и отправьте нам ссылку.",
                 "Просмотры считаются в период кампании, выплаты еженедельно в USDT."]),
 "es": dict(cover=("Plan de fiestas", "¿Días libres?\nGraba tu *primer* video.", "Envía tu guion ahora, para que esté aprobado antes de grabar."),
            cap=["¿Días libres en las fiestas?", "Envía tu guion de Genesis esta semana para que esté aprobado antes de grabar. Luego envía tu borrador, publica el video aprobado y mándanos el enlace.",
                 "Contamos las vistas durante la campaña y pagamos cada semana en USDT."]),
 "ms": dict(cover=("Rancangan cuti", "Bercuti?\nRakam video *pertama* anda.", "Hantar skrip sekarang supaya ia diluluskan sebelum anda merakam."),
            cap=["Bercuti semasa musim perayaan?", "Hantar skrip Genesis anda minggu ini supaya ia diluluskan sebelum anda merakam. Kemudian hantar draf, siarkan video yang diluluskan dan hantar pautannya.",
                 "Tontonan dikira sepanjang tempoh kempen dan dibayar setiap minggu dalam USDT."]),
}
MULTI = {
 "en": dict(cover=("Keep going", "One brief.\n*More than one* video.", "Each video is reviewed and paid on its own."),
            cap=["One brief, more than one video", "You can make more than one Genesis video, unless the campaign sets a limit. Each one goes through its own script, draft and link review.",
                 "Each video earns from 5,000 views, up to $100."]),
 "ru": dict(cover=("Продолжайте", "Один бриф.\n*Несколько* видео.", "Каждое видео проверяется и оплачивается отдельно."),
            cap=["Один бриф, несколько видео", "Можно снять несколько видео Genesis, если кампания не устанавливает лимит. Каждое проходит свою проверку сценария, черновика и ссылки.",
                 "Каждое видео приносит доход от 5 000 просмотров, до $100."]),
 "es": dict(cover=("Sigue creando", "Un brief.\n*Más de un* video.", "Cada video se revisa y se paga por separado."),
            cap=["Un brief, más de un video", "Puedes hacer más de un video de Genesis, salvo que la campaña fije un límite. Cada uno pasa su propia revisión de guion, borrador y enlace.",
                 "Cada video genera ingresos desde 5,000 vistas, hasta $100."]),
 "ms": dict(cover=("Teruskan", "Satu ringkasan.\n*Lebih daripada satu* video.", "Setiap video disemak dan dibayar secara berasingan."),
            cap=["Satu ringkasan, lebih daripada satu video", "Anda boleh membuat lebih daripada satu video Genesis, melainkan kempen menetapkan had. Setiap video melalui semakan skrip, draf dan pautannya sendiri.",
                 "Setiap video dibayar dari 5,000 tontonan, sehingga $100."]),
}
NEW_YEAR = {
 "en": dict(cover=("2027", "New year.\nNew *channel*.", "Get paid for the views your videos get."),
            cap=["New year, new channel", "Planning to post more in 2027? Genesis pays creators $3 per 1,000 views for approved videos about OnFin, up to $100 a video.",
                 "Free to join, no trading needed. Pick a brief and send your first script."]),
 "ru": dict(cover=("2027", "Новый год.\nНовый *канал*.", "Получайте оплату за просмотры ваших видео."),
            cap=["Новый год, новый канал", "Планируете больше публиковать в 2027 году? Genesis платит креаторам $3 за 1 000 просмотров одобренных видео об OnFin, до $100 за видео.",
                 "Участие бесплатное, торговать не нужно. Выберите бриф и пришлите первый сценарий."]),
 "es": dict(cover=("2027", "Año nuevo.\nCanal *nuevo*.", "Cobra por las vistas de tus videos."),
            cap=["Año nuevo, canal nuevo", "¿Piensas publicar más en 2027? Genesis paga a los creadores $3 por cada 1,000 vistas de videos aprobados sobre OnFin, hasta $100 por video.",
                 "Unirse es gratis y no necesitas operar. Elige un brief y envía tu primer guion."]),
 "ms": dict(cover=("2027", "Tahun baharu.\nSaluran *baharu*.", "Dibayar untuk tontonan video anda."),
            cap=["Tahun baharu, saluran baharu", "Merancang untuk menyiar lebih banyak pada 2027? Genesis membayar pencipta $3 setiap 1,000 tontonan untuk video yang diluluskan tentang OnFin, sehingga $100 setiap video.",
                 "Percuma, tiada dagangan diperlukan. Pilih ringkasan dan hantar skrip pertama anda."]),
}
FIRST_2027 = {
 "en": dict(cover=("Start 2027", "Your first video\nof *2027*.", "Pick a brief, send your script, get paid for the views."),
            cap=["Your first video of 2027", "Pick a Genesis brief, send your script, and we'll review it before you film.",
                 "$3 per 1,000 views, up to $100 a video, paid weekly in USDT."]),
 "ru": dict(cover=("Начните 2027", "Ваше первое видео\nв *2027* году.", "Выберите бриф, пришлите сценарий, получайте оплату за просмотры."),
            cap=["Ваше первое видео в 2027 году", "Выберите бриф Genesis, пришлите сценарий, и мы проверим его до съёмки.",
                 "$3 за 1 000 просмотров, до $100 за видео, выплаты еженедельно в USDT."]),
 "es": dict(cover=("Empieza 2027", "Tu primer video\nde *2027*.", "Elige un brief, envía tu guion y cobra por las vistas."),
            cap=["Tu primer video de 2027", "Elige un brief de Genesis, envía tu guion y lo revisamos antes de que grabes.",
                 "$3 por cada 1,000 vistas, hasta $100 por video, con pagos semanales en USDT."]),
 "ms": dict(cover=("Mulakan 2027", "Video pertama anda\npada *2027*.", "Pilih ringkasan, hantar skrip, dibayar untuk tontonan."),
            cap=["Video pertama anda pada 2027", "Pilih ringkasan Genesis, hantar skrip anda, dan kami akan menyemaknya sebelum anda merakam.",
                 "$3 setiap 1,000 tontonan, sehingga $100 setiap video, dibayar setiap minggu dalam USDT."]),
}


# ======================================================================= carousels
def L(kicker, heading, items):
    return ("CarouselList", dict(kicker=kicker, heading=heading, items=[{"title": t, "body": b} for t, b in items]))


def MYTH(kicker, myth, fact, body, ml, fl):
    return ("CarouselMyth", dict(kicker=kicker, myth=myth, fact=fact, body=body, mythLabel=ml, factLabel=fl))


TIPS = {
 "en": dict(cover=("Creator tips", "Five tips for a video\npeople *finish*.", "Short, clear and on brief."), slides=[
     L("Tips 1 to 3", "Win the\n*first seconds*.", [("Hook in two seconds", "Open with the question your video answers."),
                                                         ("One idea per video", "Explain one thing well, not five things fast."),
                                                         ("Show the app", "Screen recordings make features easy to follow.")]),
     L("Tips 4 to 6", "Make it easy to\n*follow*.", [("Captions on", "Many people watch with the sound off."),
                                                    ("Talk to one person", "Explain it like you would to a friend."),
                                                    ("End on the brief", "Your link, the tag and the #ad line.")]),
     MYTH("One thing to skip", "Longer videos earn more.", "You're paid per view, not per minute.", "Keep it as short as the idea needs, and follow the brief.", "Myth", "Fact")],
     cap=["Five tips for a video people finish", "Hook in the first two seconds, explain one idea, show the app on screen, keep captions on and end with the link, tag and #ad line from the brief.",
          "Your script is reviewed before you film, so you'll get feedback early."]),
 "ru": dict(cover=("Советы креаторам", "Пять советов для видео,\nкоторое *досмотрят*.", "Коротко, понятно и по брифу."), slides=[
     L("Советы с 1 по 3", "Первые *секунды*\nрешают.", [("Зацепка за две секунды", "Начните с вопроса, на который отвечает видео."),
                                                    ("Одна идея на видео", "Объясните одно хорошо, а не пять быстро."),
                                                    ("Покажите приложение", "Запись экрана помогает понять функции.")]),
     L("Советы с 4 по 6", "Сделайте видео\n*понятным*.", [("Субтитры", "Многие смотрят видео без звука."),
                                                      ("Говорите с одним человеком", "Объясняйте, как другу."),
                                                      ("Финал по брифу", "Ваша ссылка, тег и пометка #ad.")]),
     MYTH("Чего не делать", "Длинные видео приносят больше.", "Оплата идёт за просмотры, а не за минуты.", "Делайте видео настолько коротким, насколько позволяет идея, и следуйте брифу.", "Миф", "Факт")],
     cap=["Пять советов для видео, которое досмотрят", "Зацепите за первые две секунды, объясните одну идею, покажите приложение на экране, включите субтитры и закончите ссылкой, тегом и пометкой #ad из брифа.",
          "Сценарий проверяется до съёмки, так что обратную связь вы получите заранее."]),
 "es": dict(cover=("Consejos para creadores", "Cinco consejos para un\nvideo que se *termina*.", "Corto, claro y según el brief."), slides=[
     L("Consejos 1 a 3", "Acierta en los\n*primeros segundos*.", [("Gancho en dos segundos", "Empieza con la pregunta que responde tu video."),
                                                                 ("Una idea por video", "Explica una cosa bien, no cinco rápido."),
                                                                 ("Muestra la app", "Grabar la pantalla facilita seguir las funciones.")]),
     L("Consejos 4 a 6", "Que sea fácil\nde *seguir*.", [("Subtítulos siempre", "Mucha gente ve videos sin sonido."),
                                                       ("Habla a una persona", "Explícalo como a un amigo."),
                                                       ("Cierra con el brief", "Tu enlace, la etiqueta y la línea #ad.")]),
     MYTH("Algo que evitar", "Los videos largos ganan más.", "Se paga por vista, no por minuto.", "Hazlo tan corto como la idea lo permita y sigue el brief.", "Mito", "Realidad")],
     cap=["Cinco consejos para un video que se termina", "Engancha en los dos primeros segundos, explica una sola idea, muestra la app en pantalla, usa subtítulos y cierra con el enlace, la etiqueta y la línea #ad del brief.",
          "Revisamos tu guion antes de grabar, así recibes comentarios a tiempo."]),
 "ms": dict(cover=("Tip pencipta", "Lima tip untuk video\nyang *ditonton habis*.", "Ringkas, jelas dan ikut ringkasan."), slides=[
     L("Tip 1 hingga 3", "Betulkan\n*saat pertama*.", [("Cangkuk dalam dua saat", "Mulakan dengan soalan yang dijawab video anda."),
                                                      ("Satu idea setiap video", "Terangkan satu perkara dengan baik, bukan lima dengan cepat."),
                                                      ("Tunjukkan aplikasi", "Rakaman skrin memudahkan ciri difahami.")]),
     L("Tip 4 hingga 6", "Mudahkan untuk\n*diikuti*.", [("Kapsyen dihidupkan", "Ramai menonton tanpa bunyi."),
                                                      ("Bercakap kepada seorang", "Terangkan seperti kepada kawan."),
                                                      ("Akhiri ikut ringkasan", "Pautan anda, tag dan baris #ad.")]),
     MYTH("Satu perkara untuk dielakkan", "Video lebih panjang dibayar lebih.", "Anda dibayar setiap tontonan, bukan setiap minit.", "Pastikan ia sependek yang diperlukan idea, dan ikut ringkasan.", "Mitos", "Fakta")],
     cap=["Lima tip untuk video yang ditonton habis", "Cangkuk dalam dua saat pertama, terangkan satu idea, tunjukkan aplikasi di skrin, hidupkan kapsyen dan akhiri dengan pautan, tag dan baris #ad daripada ringkasan.",
          "Skrip anda disemak sebelum anda merakam, jadi anda mendapat maklum balas awal."]),
}
HOOKS = {
 "en": dict(cover=("Creator tips", "Hooks that work in\nthe *first two seconds*.", "And one hook that breaks the rules."), slides=[
     L("Hooks 1 to 3", "Start with\n*curiosity*.", [("Ask the question", "\"How does copy trading actually work?\""),
                                                  ("Name the confusion", "\"Lot sizes confused me too. Here's the simple version.\""),
                                                  ("Open on the screen", "Start mid-tap in the app, explain as you go.")]),
     L("Hooks 4 to 6", "Make them *stay*.", [("Promise a short answer", "\"Copy trading in 30 seconds.\""),
                                             ("Use a list", "\"Three things to check before you sign up.\""),
                                             ("Speak to your viewer", "\"If you've never traded, start here.\"")]),
     MYTH("Off limits", "A profit screenshot makes a great hook.", "It breaks the rules, and the video won't be paid.", "Genesis videos can't promise or show profits. Lead with a question or a clear explanation instead.", "Myth", "Fact")],
     cap=["Hooks that work in the first two seconds", "Ask the question your video answers, name the confusion, open on the app screen, promise a short answer, use a list, or speak straight to your viewer.",
          "One hook is off limits: profit screenshots or promises. Videos that show or promise profits aren't paid."]),
 "ru": dict(cover=("Советы креаторам", "Зацепки, которые работают\nза *две секунды*.", "И одна зацепка, которая нарушает правила."), slides=[
     L("Зацепки с 1 по 3", "Начните с\n*любопытства*.", [("Задайте вопрос", "«Как на самом деле работает копи-трейдинг?»"),
                                                     ("Назовите сложность", "«Лоты меня тоже путали. Вот простая версия.»"),
                                                     ("Начните с экрана", "Откройте приложение и объясняйте по ходу.")]),
     L("Зацепки с 4 по 6", "Удержите\n*внимание*.", [("Пообещайте краткость", "«Копи-трейдинг за 30 секунд.»"),
                                                   ("Используйте список", "«Три вещи, которые стоит проверить до регистрации.»"),
                                                   ("Обратитесь к зрителю", "«Если вы никогда не торговали, начните отсюда.»")]),
     MYTH("Под запретом", "Скриншот прибыли: отличная зацепка.", "Это нарушает правила, и видео не оплатят.", "Видео Genesis не могут обещать или показывать прибыль. Начните с вопроса или понятного объяснения.", "Миф", "Факт")],
     cap=["Зацепки, которые работают за две секунды", "Задайте вопрос, на который отвечает видео, назовите сложность, начните с экрана приложения, пообещайте короткий ответ, используйте список или обратитесь прямо к зрителю.",
          "Одна зацепка под запретом: скриншоты или обещания прибыли. Такие видео не оплачиваются."]),
 "es": dict(cover=("Consejos para creadores", "Ganchos que funcionan en\nlos *dos primeros segundos*.", "Y un gancho que rompe las reglas."), slides=[
     L("Ganchos 1 a 3", "Empieza con\n*curiosidad*.", [("Haz la pregunta", "\"¿Cómo funciona de verdad el copy trading?\""),
                                                     ("Nombra la duda", "\"Los lotes también me confundían. Aquí va lo simple.\""),
                                                     ("Abre en la pantalla", "Empieza ya en la app y explica sobre la marcha.")]),
     L("Ganchos 4 a 6", "Haz que se *queden*.", [("Promete brevedad", "\"El copy trading en 30 segundos.\""),
                                                 ("Usa una lista", "\"Tres cosas que revisar antes de registrarte.\""),
                                                 ("Habla a tu público", "\"Si nunca has operado, empieza aquí.\"")]),
     MYTH("Prohibido", "Una captura de ganancias es un gran gancho.", "Rompe las reglas y el video no se paga.", "Los videos de Genesis no pueden prometer ni mostrar ganancias. Empieza con una pregunta o una explicación clara.", "Mito", "Realidad")],
     cap=["Ganchos que funcionan en los dos primeros segundos", "Haz la pregunta que responde tu video, nombra la duda, abre en la pantalla de la app, promete una respuesta corta, usa una lista o habla directo a tu público.",
          "Un gancho está prohibido: capturas o promesas de ganancias. Los videos que muestran o prometen ganancias no se pagan."]),
 "ms": dict(cover=("Tip pencipta", "Cangkuk yang berkesan dalam\n*dua saat pertama*.", "Dan satu cangkuk yang melanggar peraturan."), slides=[
     L("Cangkuk 1 hingga 3", "Mulakan dengan\n*rasa ingin tahu*.", [("Tanya soalan", "\"Bagaimana copy trading sebenarnya berfungsi?\""),
                                                                   ("Namakan kekeliruan", "\"Saiz lot pun mengelirukan saya. Ini versi mudahnya.\""),
                                                                   ("Mulakan di skrin", "Buka aplikasi dan terangkan sambil berjalan.")]),
     L("Cangkuk 4 hingga 6", "Buat mereka *kekal*.", [("Janjikan jawapan ringkas", "\"Copy trading dalam 30 saat.\""),
                                                    ("Gunakan senarai", "\"Tiga perkara untuk disemak sebelum mendaftar.\""),
                                                    ("Bercakap kepada penonton", "\"Jika anda belum pernah berdagang, mula di sini.\"")]),
     MYTH("Dilarang", "Tangkapan skrin keuntungan ialah cangkuk yang hebat.", "Ia melanggar peraturan dan video tidak dibayar.", "Video Genesis tidak boleh menjanjikan atau menunjukkan keuntungan. Mulakan dengan soalan atau penerangan yang jelas.", "Mitos", "Fakta")],
     cap=["Cangkuk yang berkesan dalam dua saat pertama", "Tanya soalan yang dijawab video anda, namakan kekeliruan, mulakan di skrin aplikasi, janjikan jawapan ringkas, gunakan senarai atau bercakap terus kepada penonton.",
          "Satu cangkuk dilarang: tangkapan skrin atau janji keuntungan. Video yang menunjukkan atau menjanjikan keuntungan tidak dibayar."]),
}
CHECKLIST = {
 "en": dict(cover=("Checklist", "Before you post,\n*check* these.", "Miss one and the video may not be paid."), slides=[
     L("Before you post", "Three things in\n*every* post.", [("Tag and hashtags", "Exactly as the brief lists them."),
                                                           ("The #ad disclosure", "The caption line from the brief, word for word."),
                                                           ("Your personal link", "In your bio or caption.")]),
     L("After you post", "Three things\n*after* posting.", [("Send us the link", "Share, then Copy link, then paste it in Genesis."),
                                                          ("Keep it public", "Until its views lock."),
                                                          ("Send your stats", "A screenshot when we ask, then it's paid.")])],
     cap=["Before you post, check these", "Before: add the tag, hashtags and #ad disclosure line from the brief, and put your personal link in your bio or caption.",
          "After: send us the post link, keep the video public until its views lock, and send a stats screenshot when asked."]),
 "ru": dict(cover=("Чек-лист", "Перед публикацией\n*проверьте*.", "Пропустите пункт, и видео могут не оплатить."), slides=[
     L("До публикации", "Три вещи в\n*каждом* посте.", [("Тег и хэштеги", "Точно как в брифе."),
                                                       ("Пометка #ad", "Строка из брифа слово в слово."),
                                                       ("Ваша ссылка", "В био или в подписи.")]),
     L("После публикации", "Три вещи\n*после* публикации.", [("Пришлите ссылку", "Поделиться, Копировать ссылку, вставить в Genesis."),
                                                            ("Оставьте видео публичным", "Пока просмотры не зафиксированы."),
                                                            ("Пришлите статистику", "Скриншот по запросу, затем выплата.")])],
     cap=["Перед публикацией проверьте", "До: добавьте тег, хэштеги и строку с пометкой #ad из брифа, а свою ссылку разместите в био или подписи.",
          "После: пришлите ссылку на пост, оставьте видео публичным до фиксации просмотров и пришлите скриншот статистики по запросу."]),
 "es": dict(cover=("Lista de control", "Antes de publicar,\n*revisa* esto.", "Si falta algo, el video podría no pagarse."), slides=[
     L("Antes de publicar", "Tres cosas en\n*cada* publicación.", [("Etiqueta y hashtags", "Tal como los indica el brief."),
                                                                ("La línea #ad", "La línea del brief, palabra por palabra."),
                                                                ("Tu enlace personal", "En tu bio o en la descripción.")]),
     L("Después de publicar", "Tres cosas\n*después* de publicar.", [("Envíanos el enlace", "Compartir, Copiar enlace y pégalo en Genesis."),
                                                                   ("Mantenlo público", "Hasta que se fijen sus vistas."),
                                                                   ("Envía tus estadísticas", "Una captura cuando la pidamos y se paga.")])],
     cap=["Antes de publicar, revisa esto", "Antes: añade la etiqueta, los hashtags y la línea #ad del brief, y pon tu enlace personal en tu bio o en la descripción.",
          "Después: envíanos el enlace, mantén el video público hasta que se fijen sus vistas y envía una captura de estadísticas cuando la pidamos."]),
 "ms": dict(cover=("Senarai semak", "Sebelum menyiar,\n*semak* ini.", "Terlepas satu dan video mungkin tidak dibayar."), slides=[
     L("Sebelum menyiar", "Tiga perkara dalam\n*setiap* siaran.", [("Tag dan hashtag", "Tepat seperti dalam ringkasan."),
                                                                  ("Pendedahan #ad", "Baris kapsyen daripada ringkasan, kata demi kata."),
                                                                  ("Pautan peribadi anda", "Dalam bio atau kapsyen.")]),
     L("Selepas menyiar", "Tiga perkara\n*selepas* menyiar.", [("Hantar pautan", "Kongsi, Salin pautan, tampal dalam Genesis."),
                                                             ("Kekalkan awam", "Sehingga tontonannya dikunci."),
                                                             ("Hantar statistik", "Tangkapan skrin apabila diminta, kemudian dibayar.")])],
     cap=["Sebelum menyiar, semak ini", "Sebelum: tambah tag, hashtag dan baris pendedahan #ad daripada ringkasan, dan letakkan pautan peribadi anda dalam bio atau kapsyen.",
          "Selepas: hantar pautan siaran, kekalkan video awam sehingga tontonan dikunci, dan hantar tangkapan skrin statistik apabila diminta."]),
}
FAQ = {
 "en": dict(cover=("Genesis FAQ", "Your *questions*,\nanswered.", "Six answers before you apply."), slides=[
     L("Questions 1 to 3", "Getting *started*.", [("Who can join?", "Anyone 18+ with a public TikTok, Instagram, Facebook or YouTube account."),
                                                ("Do I need to trade?", "No. You don't need to trade or deposit."),
                                                ("How do you know it's my account?", "You add a short code to its bio.")]),
     L("Questions 4 to 6", "Getting *paid*.", [("How much can I earn?", "Each brief sets a rate per 1,000 views and a cap per video."),
                                              ("When am I paid?", "After the tracking window, usually 14 days, in the weekly USDT payout."),
                                              ("What stops a payout?", "Skipped reviews, missing disclosure, fake views or profit promises.")])],
     cap=["Genesis FAQ", "Anyone 18+ with a public TikTok, Instagram, Facebook or YouTube account can join, and you don't need to trade or deposit.",
          "Each brief sets its rate and cap. Views are counted for the tracking window, usually 14 days, then paid weekly in USDT. Questions: support@onfin.io"]),
 "ru": dict(cover=("Вопросы о Genesis", "Ответы на ваши\n*вопросы*.", "Шесть ответов до подачи заявки."), slides=[
     L("Вопросы с 1 по 3", "Как *начать*.", [("Кто может участвовать?", "Любой от 18 лет с публичным аккаунтом TikTok, Instagram, Facebook или YouTube."),
                                           ("Нужно ли торговать?", "Нет. Торговать или пополнять счёт не нужно."),
                                           ("Как вы поймёте, что аккаунт мой?", "Вы добавляете короткий код в био.")]),
     L("Вопросы с 4 по 6", "Как получить *оплату*.", [("Сколько можно заработать?", "В каждом брифе своя ставка за 1 000 просмотров и лимит за видео."),
                                                   ("Когда выплата?", "После периода подсчёта, обычно 14 дней, в еженедельной выплате USDT."),
                                                   ("Что мешает выплате?", "Пропуск проверки, нет пометки, накрутка или обещания прибыли.")])],
     cap=["Вопросы о Genesis", "Участвовать может любой от 18 лет с публичным аккаунтом TikTok, Instagram, Facebook или YouTube. Торговать или пополнять счёт не нужно.",
          "В каждом брифе своя ставка и лимит. Просмотры считаются в период отслеживания, обычно 14 дней, затем выплата еженедельно в USDT. Вопросы: support@onfin.io"]),
 "es": dict(cover=("Preguntas sobre Genesis", "Tus *preguntas*,\nrespondidas.", "Seis respuestas antes de aplicar."), slides=[
     L("Preguntas 1 a 3", "Para *empezar*.", [("¿Quién puede unirse?", "Mayores de 18 con cuenta pública de TikTok, Instagram, Facebook o YouTube."),
                                               ("¿Necesito operar?", "No. No necesitas operar ni depositar."),
                                               ("¿Cómo saben que la cuenta es mía?", "Pones un código corto en su bio.")]),
     L("Preguntas 4 a 6", "Para *cobrar*.", [("¿Cuánto puedo ganar?", "Cada brief fija una tarifa por 1,000 vistas y un tope por video."),
                                              ("¿Cuándo me pagan?", "Tras la ventana de conteo, normalmente 14 días, en el pago semanal en USDT."),
                                              ("¿Qué impide un pago?", "Saltar revisiones, no poner la línea #ad, vistas falsas o prometer ganancias.")])],
     cap=["Preguntas sobre Genesis", "Puede unirse cualquier mayor de 18 años con una cuenta pública de TikTok, Instagram, Facebook o YouTube, sin operar ni depositar.",
          "Cada brief fija su tarifa y tope. Contamos las vistas durante la ventana de seguimiento, normalmente 14 días, y pagamos cada semana en USDT. Dudas: support@onfin.io"]),
 "ms": dict(cover=("Soalan Genesis", "Soalan anda,\n*dijawab*.", "Enam jawapan sebelum anda memohon."), slides=[
     L("Soalan 1 hingga 3", "Untuk *bermula*.", [("Siapa boleh sertai?", "Sesiapa 18+ dengan akaun TikTok, Instagram, Facebook atau YouTube yang awam."),
                                                 ("Perlukah saya berdagang?", "Tidak. Anda tidak perlu berdagang atau membuat deposit."),
                                                 ("Bagaimana anda tahu akaun itu milik saya?", "Anda menambah kod pendek pada bionya.")]),
     L("Soalan 4 hingga 6", "Untuk *dibayar*.", [("Berapa banyak boleh diperoleh?", "Setiap ringkasan menetapkan kadar setiap 1,000 tontonan dan had setiap video."),
                                                  ("Bila saya dibayar?", "Selepas tempoh penjejakan, biasanya 14 hari, dalam bayaran USDT mingguan."),
                                                  ("Apa yang menghalang bayaran?", "Semakan dilangkau, tiada pendedahan, tontonan palsu atau janji keuntungan.")])],
     cap=["Soalan Genesis", "Sesiapa yang berumur 18 tahun ke atas dengan akaun TikTok, Instagram, Facebook atau YouTube yang awam boleh menyertai, tanpa perlu berdagang atau membuat deposit.",
          "Setiap ringkasan menetapkan kadar dan hadnya. Tontonan dikira sepanjang tempoh penjejakan, biasanya 14 hari, kemudian dibayar setiap minggu dalam USDT. Soalan: support@onfin.io"]),
}

# ======================================================================= public builders
spot_copy = lambda W, d: single(W, "g-spot-copy", d, SPOT_COPY, "campaigns")
no_trade = lambda W, d: single(W, "g-no-trade", d, NO_TRADE)
script_first = lambda W, d: single(W, "g-script", d, SCRIPT_FIRST)
platforms = lambda W, d: single(W, "g-platforms", d, PLATFORMS)
spot_start = lambda W, d: single(W, "g-spot-start", d, SPOT_START, "campaigns")
usdt = lambda W, d: single(W, "g-usdt", d, USDT)
rules = lambda W, d: single(W, "g-rules", d, RULES)
prove = lambda W, d: single(W, "g-prove", d, PROVE)
math2 = lambda W, d: single(W, "g-math2", d, MATH2, "campaigns")
first_video = lambda W, d: single(W, "g-first", d, FIRST_VIDEO)
still_time = lambda W, d: single(W, "g-still", d, STILL_TIME, "campaigns")
holidays = lambda W, d: single(W, "g-holidays", d, HOLIDAYS)
multi = lambda W, d: single(W, "g-multi", d, MULTI, "campaigns")
new_year = lambda W, d: single(W, "g-newyear", d, NEW_YEAR)
first_2027 = lambda W, d: single(W, "g-2027", d, FIRST_2027, "campaigns")
tips = lambda W, d: carousel(W, "g-tips", d, TIPS)
hooks = lambda W, d: carousel(W, "g-hooks", d, HOOKS)
checklist = lambda W, d: carousel(W, "g-check", d, CHECKLIST)
faq = lambda W, d: carousel(W, "g-faq", d, FAQ)
