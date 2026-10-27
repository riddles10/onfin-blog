"""Genesis posts. Each builder renders all locales, then posts to every OnFin channel.
Facts follow genesis.onfin.io (27 Oct 2026): $3 per 1,000 views, from 5,000 views, up to $100 a video,
views counted usually 14 days, paid weekly in USDT (TRC-20), 18+, free, no trading needed, script + draft review."""
from common import G, LANG, G_LEGAL, G_AGE, G_TAGS, g_url

LANGS = ["en", "ru", "es", "ms"]
# posting times (UTC hour) per channel for Genesis slots
G_TIME = {"ig": 12, "fb": 11, "en": 11, "kh": 11, "ms": 11, "ru": 10, "es": 15}
G_STORY_MIN = 30  # IG story goes 30 min after the feed post

CHIPS = ["TikTok", "Instagram", "Facebook", "YouTube"]
T = {  # shared slide strings
 "end": {
  "en": dict(heading="Pick a brief.\nMake the video.\nGet paid for the *views*.", body="Apply once. We review every script before you film.",
             cta="Apply at genesis.onfin.io", foot="18+ only. Free to join. Videos must carry the #ad disclosure from the brief."),
  "ru": dict(heading="Выберите бриф.\nСнимите видео.\nПолучайте оплату за *просмотры*.", body="Заявка один раз. Мы проверяем каждый сценарий до съёмки.",
             cta="Заявка на genesis.onfin.io", foot="Только от 18 лет. Участие бесплатное. Видео должно содержать пометку #ad из брифа."),
  "es": dict(heading="Elige un brief.\nHaz el video.\nCobra por las *vistas*.", body="Aplica una vez. Revisamos cada guion antes de grabar.",
             cta="Aplica en genesis.onfin.io", foot="Solo mayores de 18. Unirse es gratis. Los videos deben llevar la etiqueta #ad del brief."),
  "ms": dict(heading="Pilih ringkasan.\nBuat video.\nDibayar untuk *tontonan*.", body="Mohon sekali. Kami semak setiap skrip sebelum anda merakam.",
             cta="Mohon di genesis.onfin.io", foot="18 tahun ke atas sahaja. Percuma. Video mesti menyertakan pendedahan #ad daripada ringkasan."),
 },
}


def date(day, hour, minute=0):
    return f"{day}T{hour:02d}:{minute:02d}:00Z"


def km_line(ch):
    return ["Khmer guide: https://genesis.onfin.io/km/get-started"] if ch in ("kh", "fb") else []


def publish(W, key, day, imgs_by_lang, caps, story_by_lang=None):
    """caps(lang, ch) -> list of caption lines. imgs_by_lang[lang] -> list of images."""
    for ch, l in LANG.items():
        W.post(key, ch, date(day, G_TIME[ch]), caps(l, ch), imgs_by_lang[l])
    if story_by_lang:
        W.post(key + "-story", "ig", date(day, G_TIME["ig"], G_STORY_MIN), [], [story_by_lang["en"]], story=True)


def footer(l, ch):
    return [G_AGE[l]] + ([G_TAGS] if ch == "ig" else []) + [G_LEGAL[l]]


def link(l, ch, page="get-started", label=None):
    lab = label or {"en": "Full guide", "ru": "Полный гайд", "es": "Guía completa", "ms": "Panduan penuh"}[l]
    if ch == "ig":
        return [f"{lab}: genesis.onfin.io"]
    return [f"{lab}: {g_url(l, page)}"] + km_line(ch)


# ---------------------------------------------------------------- G1 launch
def launch(W, day):
    C = {
     "en": ("Creator programme", "Get paid for the *views*\nyour videos get.", "$3 per 1,000 views. Up to $100 per video.", "18+ only. Free to join, no trading needed.", "Apply at genesis.onfin.io"),
     "ru": ("Программа для креаторов", "Получайте оплату\nза *просмотры* видео.", "$3 за 1 000 просмотров. До $100 за видео.", "Только от 18 лет. Бесплатно, торговать не нужно.", "Заявка на genesis.onfin.io"),
     "es": ("Programa de creadores", "Cobra por las *vistas*\nde tus videos.", "$3 por cada 1,000 vistas. Hasta $100 por video.", "Solo mayores de 18. Gratis, sin necesidad de operar.", "Aplica en genesis.onfin.io"),
     "ms": ("Program pencipta", "Dibayar untuk *tontonan*\nvideo anda.", "$3 setiap 1,000 tontonan. Sehingga $100 setiap video.", "18 tahun ke atas sahaja. Percuma, tiada dagangan diperlukan.", "Mohon di genesis.onfin.io"),
    }
    img, story = {}, {}
    for l, (k, hd, sub, foot, cta) in C.items():
        img[l] = [W.gen(G.cover(k, hd, sub, CHIPS, foot=foot), f"g-launch-{l}.png")]
        story[l] = W.gen(G.cover(k, hd, sub, CHIPS, story=True, foot=foot, cta=cta), f"g-launch-story-{l}.png")
    B = {
     "en": ["Genesis is live: get paid for the views your videos get",
            "Genesis is OnFin's creator programme. Make short videos about OnFin for TikTok, Instagram Reels, Facebook Reels or YouTube Shorts and earn $3 for every 1,000 views, up to $100 per video.",
            "Free to join. You don't need to trade or deposit.",
            "1. Pick a campaign and read the brief", "2. Apply and link your accounts", "3. Get your script, then your draft, approved",
            "4. Post the video and send us the link", "5. Views are counted for the campaign window (usually 14 days), then paid weekly in USDT"],
     "ru": ["Genesis запущен: получайте оплату за просмотры ваших видео",
            "Genesis: программа OnFin для креаторов. Снимайте короткие видео об OnFin для TikTok, Instagram Reels, Facebook Reels или YouTube Shorts и получайте $3 за каждые 1 000 просмотров, до $100 за видео.",
            "Участие бесплатное. Торговать или пополнять счёт не нужно.",
            "1. Выберите кампанию и прочитайте бриф", "2. Подайте заявку и привяжите аккаунты", "3. Согласуйте сценарий, затем черновик",
            "4. Опубликуйте видео и пришлите ссылку", "5. Мы считаем просмотры в период кампании (обычно 14 дней) и платим еженедельно в USDT"],
     "es": ["Genesis ya está aquí: cobra por las vistas de tus videos",
            "Genesis es el programa de creadores de OnFin. Haz videos cortos sobre OnFin para TikTok, Instagram Reels, Facebook Reels o YouTube Shorts y gana $3 por cada 1,000 vistas, hasta $100 por video.",
            "Unirse es gratis. No necesitas operar ni depositar.",
            "1. Elige una campaña y lee el brief", "2. Aplica y vincula tus cuentas", "3. Aprueba tu guion y luego tu borrador",
            "4. Publica el video y envíanos el enlace", "5. Contamos las vistas durante la campaña (normalmente 14 días) y pagamos cada semana en USDT"],
     "ms": ["Genesis kini dilancarkan: dibayar untuk tontonan video anda",
            "Genesis ialah program pencipta OnFin. Hasilkan video pendek tentang OnFin untuk TikTok, Instagram Reels, Facebook Reels atau YouTube Shorts dan dapatkan $3 bagi setiap 1,000 tontonan, sehingga $100 setiap video.",
            "Percuma untuk menyertai. Anda tidak perlu berdagang atau membuat deposit.",
            "1. Pilih kempen dan baca ringkasan", "2. Mohon dan pautkan akaun anda", "3. Dapatkan kelulusan skrip, kemudian draf",
            "4. Siarkan video dan hantar pautannya", "5. Tontonan dikira sepanjang tempoh kempen (biasanya 14 hari), kemudian dibayar setiap minggu dalam USDT"],
    }
    publish(W, "g-launch", day, img, lambda l, ch: B[l] + link(l, ch) + footer(l, ch), story)


# ---------------------------------------------------------------- G2 how it works (carousel)
def how_it_works(W, day):
    TOT = 6
    D = {
     "en": dict(
      cover=("How it works", "From brief to *payout*\nin five steps.", "Free to join. No trading or deposit needed."),
      steps=dict(kicker="Genesis", heading="Five steps to your\n*first payout*.", steps=[
          {"title": "Apply once", "body": "Link your accounts, add a USDT (TRC-20) wallet"},
          {"title": "Prove your account", "body": "Put a short code in your bio"},
          {"title": "Script, then draft", "body": "We check both before you post"},
          {"title": "Post and send the link", "body": "With the tag, hashtags and #ad line"},
          {"title": "Get paid", "body": "Views counted, then paid weekly in USDT"}]),
      stat=dict(kicker="What a video pays", value="$3", label="per 1,000 views, up to *$100* per video",
                context="Videos earn from 5,000 views. Example from a live brief: 19,300 views earned $57.90. Each brief sets its own rate, minimum and cap."),
      who=dict(kicker="Who can join", heading="Built for *creators*,\nnot traders.", items=[
          {"title": "18 or over", "body": "With a public TikTok, Instagram, Facebook or YouTube account."},
          {"title": "Free to join", "body": "You don't need to trade or deposit."},
          {"title": "More than one video", "body": "Each video is reviewed and paid on its own."}]),
      rules=dict(kicker="The rules", heading="Three things to\n*never* do.", items=[
          {"title": "No profit promises", "body": "Never promise profits or give investment advice."},
          {"title": "No fake views", "body": "No bought views, no reposting someone else's video."},
          {"title": "Keep it live", "body": "Don't delete a video before its views lock."}]),
     ),
     "ru": dict(
      cover=("Как это работает", "От брифа до *выплаты*\nза пять шагов.", "Бесплатно. Торговать и пополнять счёт не нужно."),
      steps=dict(kicker="Genesis", heading="Пять шагов до\n*первой выплаты*.", steps=[
          {"title": "Заявка один раз", "body": "Привяжите аккаунты и кошелёк USDT (TRC-20)"},
          {"title": "Подтвердите аккаунт", "body": "Добавьте короткий код в био"},
          {"title": "Сценарий, затем черновик", "body": "Мы проверяем оба до публикации"},
          {"title": "Публикация и ссылка", "body": "С тегом, хэштегами и пометкой #ad"},
          {"title": "Выплата", "body": "Считаем просмотры и платим еженедельно в USDT"}]),
      stat=dict(kicker="Сколько платит видео", value="$3", label="за 1 000 просмотров, до *$100* за видео",
                context="Видео начинает приносить доход от 5 000 просмотров. Пример из активного брифа: 19 300 просмотров принесли $57,90. В каждом брифе свои ставка, минимум и лимит."),
      who=dict(kicker="Кто может участвовать", heading="Для *креаторов*,\nа не трейдеров.", items=[
          {"title": "От 18 лет", "body": "С публичным аккаунтом TikTok, Instagram, Facebook или YouTube."},
          {"title": "Бесплатно", "body": "Торговать или пополнять счёт не нужно."},
          {"title": "Несколько видео", "body": "Каждое видео проверяется и оплачивается отдельно."}]),
      rules=dict(kicker="Правила", heading="Три вещи, которые\n*нельзя* делать.", items=[
          {"title": "Никаких обещаний прибыли", "body": "Не обещайте доход и не давайте инвестиционных советов."},
          {"title": "Никаких накруток", "body": "Без купленных просмотров и чужих видео."},
          {"title": "Не удаляйте видео", "body": "Пока просмотры не зафиксированы."}]),
     ),
     "es": dict(
      cover=("Cómo funciona", "Del brief al *pago*\nen cinco pasos.", "Gratis. No necesitas operar ni depositar."),
      steps=dict(kicker="Genesis", heading="Cinco pasos hasta tu\n*primer pago*.", steps=[
          {"title": "Aplica una vez", "body": "Vincula tus cuentas y una billetera USDT (TRC-20)"},
          {"title": "Verifica tu cuenta", "body": "Pon un código corto en tu bio"},
          {"title": "Guion y borrador", "body": "Revisamos ambos antes de publicar"},
          {"title": "Publica y envía el enlace", "body": "Con la etiqueta, hashtags y la línea #ad"},
          {"title": "Cobra", "body": "Contamos las vistas y pagamos cada semana en USDT"}]),
      stat=dict(kicker="Lo que paga un video", value="$3", label="por cada 1,000 vistas, hasta *$100* por video",
                context="Los videos generan ingresos desde 5,000 vistas. Ejemplo de un brief activo: 19,300 vistas generaron $57.90. Cada brief fija su tarifa, mínimo y tope."),
      who=dict(kicker="Quién puede unirse", heading="Hecho para *creadores*,\nno para traders.", items=[
          {"title": "Mayores de 18", "body": "Con una cuenta pública de TikTok, Instagram, Facebook o YouTube."},
          {"title": "Gratis", "body": "No necesitas operar ni depositar."},
          {"title": "Más de un video", "body": "Cada video se revisa y se paga por separado."}]),
      rules=dict(kicker="Las reglas", heading="Tres cosas que\n*nunca* debes hacer.", items=[
          {"title": "Nada de prometer ganancias", "body": "Nunca prometas ganancias ni des asesoría de inversión."},
          {"title": "Nada de vistas falsas", "body": "Sin vistas compradas ni videos de otras personas."},
          {"title": "Mantén el video", "body": "No lo borres antes de que se fijen sus vistas."}]),
     ),
     "ms": dict(
      cover=("Cara ia berfungsi", "Dari ringkasan ke *bayaran*\ndalam lima langkah.", "Percuma. Tiada dagangan atau deposit diperlukan."),
      steps=dict(kicker="Genesis", heading="Lima langkah ke\n*bayaran pertama*.", steps=[
          {"title": "Mohon sekali", "body": "Pautkan akaun dan dompet USDT (TRC-20)"},
          {"title": "Sahkan akaun anda", "body": "Letakkan kod pendek dalam bio"},
          {"title": "Skrip, kemudian draf", "body": "Kami semak kedua-duanya sebelum disiarkan"},
          {"title": "Siarkan dan hantar pautan", "body": "Dengan tag, hashtag dan baris #ad"},
          {"title": "Dibayar", "body": "Tontonan dikira, dibayar setiap minggu dalam USDT"}]),
      stat=dict(kicker="Bayaran setiap video", value="$3", label="setiap 1,000 tontonan, sehingga *$100* setiap video",
                context="Video mula dibayar dari 5,000 tontonan. Contoh daripada ringkasan aktif: 19,300 tontonan memperoleh $57.90. Setiap ringkasan menetapkan kadar, minimum dan hadnya sendiri."),
      who=dict(kicker="Siapa boleh sertai", heading="Untuk *pencipta*,\nbukan pedagang.", items=[
          {"title": "18 tahun ke atas", "body": "Dengan akaun TikTok, Instagram, Facebook atau YouTube yang awam."},
          {"title": "Percuma", "body": "Anda tidak perlu berdagang atau membuat deposit."},
          {"title": "Lebih daripada satu video", "body": "Setiap video disemak dan dibayar secara berasingan."}]),
      rules=dict(kicker="Peraturan", heading="Tiga perkara yang\n*jangan* dilakukan.", items=[
          {"title": "Tiada janji untung", "body": "Jangan janjikan keuntungan atau beri nasihat pelaburan."},
          {"title": "Tiada tontonan palsu", "body": "Tiada tontonan dibeli, tiada video orang lain."},
          {"title": "Kekalkan video", "body": "Jangan padam sebelum tontonan dikunci."}]),
     ),
    }
    imgs, story = {}, {}
    for l, d in D.items():
        f = lambda i: f"g-how-{l}-{i:02d}.png"
        k, hd, sub = d["cover"]
        im = [W.gen(G.cover(k, hd, sub, CHIPS), f(1))]
        im.append(W.lib("CarouselSteps", dict(meta="Genesis", current=5, index=2, total=TOT, disclaimer=G_LEGAL[l], **d["steps"]), f(2)))
        im.append(W.lib("CarouselStat", dict(meta="Genesis", index=3, total=TOT, **d["stat"]), f(3)))
        im.append(W.lib("CarouselList", dict(meta="Genesis", index=4, total=TOT, **d["who"]), f(4)))
        im.append(W.lib("CarouselList", dict(meta="Genesis", index=5, total=TOT, **d["rules"]), f(5)))
        im.append(W.gen(G.end(index=6, total=TOT, **T["end"][l]), f(6)))
        imgs[l] = im
        story[l] = W.gen(G.cover(k, hd, sub, CHIPS, story=True, cta=T["end"][l]["cta"], foot=T["end"][l]["foot"]), f"g-how-story-{l}.png")
    B = {
     "en": ["How Genesis works, in five steps",
            "Apply once, prove your account, get your script and draft approved, post the video, then get paid for its views.",
            "Videos earn $3 per 1,000 views, from 5,000 views and up to $100 each. Each brief sets its own rate, minimum and cap.",
            "Three things to never do: promise profits or give investment advice, buy views or repost someone else's video, or delete a video before its views lock."],
     "ru": ["Как работает Genesis: пять шагов",
            "Подайте заявку, подтвердите аккаунт, согласуйте сценарий и черновик, опубликуйте видео и получите оплату за просмотры.",
            "Видео приносит $3 за 1 000 просмотров, от 5 000 просмотров и до $100. В каждом брифе свои ставка, минимум и лимит.",
            "Три вещи, которые нельзя делать: обещать прибыль или давать инвестиционные советы, покупать просмотры или публиковать чужие видео, удалять видео до фиксации просмотров."],
     "es": ["Cómo funciona Genesis, en cinco pasos",
            "Aplica una vez, verifica tu cuenta, aprueba tu guion y tu borrador, publica el video y cobra por sus vistas.",
            "Los videos ganan $3 por cada 1,000 vistas, desde 5,000 vistas y hasta $100 cada uno. Cada brief fija su tarifa, mínimo y tope.",
            "Tres cosas que nunca debes hacer: prometer ganancias o dar asesoría de inversión, comprar vistas o subir videos de otros, o borrar un video antes de que se fijen sus vistas."],
     "ms": ["Cara Genesis berfungsi, dalam lima langkah",
            "Mohon sekali, sahkan akaun anda, dapatkan kelulusan skrip dan draf, siarkan video, kemudian dibayar untuk tontonannya.",
            "Video memperoleh $3 setiap 1,000 tontonan, dari 5,000 tontonan dan sehingga $100 setiap satu. Setiap ringkasan menetapkan kadar, minimum dan hadnya sendiri.",
            "Tiga perkara yang jangan dilakukan: menjanjikan keuntungan atau memberi nasihat pelaburan, membeli tontonan atau menyiarkan semula video orang lain, atau memadam video sebelum tontonannya dikunci."],
    }
    publish(W, "g-how", day, imgs, lambda l, ch: B[l] + link(l, ch) + footer(l, ch), story)


# ---------------------------------------------------------------- G3 the math (single)
def math(W, day):
    D = {
     "en": ("The math", "What your views *pay*.", ("Views", "You earn"), [("5,000", "$15"), ("10,000", "$30"), ("20,000", "$60"), ("Cap per video", "$100")],
            "At $3 per 1,000 views. Videos earn from 5,000 views. Each brief sets its own rate, minimum and cap."),
     "ru": ("Считаем", "Сколько платят\nваши *просмотры*.", ("Просмотры", "Вы получаете"), [("5 000", "$15"), ("10 000", "$30"), ("20 000", "$60"), ("Лимит за видео", "$100")],
            "При ставке $3 за 1 000 просмотров. Видео приносит доход от 5 000 просмотров. В каждом брифе свои ставка, минимум и лимит."),
     "es": ("Las cuentas", "Lo que pagan\ntus *vistas*.", ("Vistas", "Ganas"), [("5,000", "$15"), ("10,000", "$30"), ("20,000", "$60"), ("Tope por video", "$100")],
            "A $3 por cada 1,000 vistas. Los videos generan ingresos desde 5,000 vistas. Cada brief fija su tarifa, mínimo y tope."),
     "ms": ("Kiraannya", "Berapa *tontonan*\nanda dibayar.", ("Tontonan", "Anda terima"), [("5,000", "$15"), ("10,000", "$30"), ("20,000", "$60"), ("Had setiap video", "$100")],
            "Pada kadar $3 setiap 1,000 tontonan. Video mula dibayar dari 5,000 tontonan. Setiap ringkasan menetapkan kadar, minimum dan hadnya sendiri."),
    }
    imgs, story = {}, {}
    for l, (k, hd, cols, rows, note) in D.items():
        imgs[l] = [W.gen(G.table(k, hd, cols, rows, note, G_AGE[l]), f"g-math-{l}.png")]
        story[l] = W.gen(G.table(k, hd, cols, rows, note, G_AGE[l], story=True), f"g-math-story-{l}.png")
    B = {
     "en": ["What your views pay", "5,000 views: $15", "10,000 views: $30", "20,000 views: $60", "Cap per video: $100",
            "That's at $3 per 1,000 views. Videos start earning from 5,000 views, and each brief sets its own rate, minimum and cap. Views are counted for the campaign window, then paid weekly in USDT."],
     "ru": ["Сколько платят ваши просмотры", "5 000 просмотров: $15", "10 000 просмотров: $30", "20 000 просмотров: $60", "Лимит за видео: $100",
            "Расчёт при ставке $3 за 1 000 просмотров. Видео начинает приносить доход от 5 000 просмотров, а в каждом брифе свои ставка, минимум и лимит. Просмотры считаются в период кампании, выплаты еженедельно в USDT."],
     "es": ["Lo que pagan tus vistas", "5,000 vistas: $15", "10,000 vistas: $30", "20,000 vistas: $60", "Tope por video: $100",
            "Calculado a $3 por cada 1,000 vistas. Los videos generan ingresos desde 5,000 vistas y cada brief fija su tarifa, mínimo y tope. Contamos las vistas durante la campaña y pagamos cada semana en USDT."],
     "ms": ["Berapa tontonan anda dibayar", "5,000 tontonan: $15", "10,000 tontonan: $30", "20,000 tontonan: $60", "Had setiap video: $100",
            "Dikira pada kadar $3 setiap 1,000 tontonan. Video mula dibayar dari 5,000 tontonan dan setiap ringkasan menetapkan kadar, minimum dan hadnya sendiri. Tontonan dikira sepanjang kempen, kemudian dibayar setiap minggu dalam USDT."],
    }
    lab = {"en": "Open campaigns", "ru": "Активные кампании", "es": "Campañas abiertas", "ms": "Kempen dibuka"}
    publish(W, "g-math", day, imgs, lambda l, ch: B[l] + link(l, ch, "campaigns", lab[l]) + footer(l, ch), story)
