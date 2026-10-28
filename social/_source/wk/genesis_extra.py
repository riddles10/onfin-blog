"""Two extra Genesis posts, 28 to 29 Oct 2026 (existing schedule untouched).
g-live: goes out now on all channels. g-open: 29 Oct, one hour after each channel's 2nd post of the day.
python3 genesis_extra.py <now_iso>"""
import sys
from common import Week
import genesis_more as GM
from genesis_posts import CHIPS

NOW = sys.argv[1] if len(sys.argv) > 1 else "2026-10-28T18:30:00Z"
W = Week("g-extra")

LIVE = {
 "en": dict(cover=("Now live", "Genesis is *live*.", "Get paid for the views your videos get. $3 per 1,000 views, up to $100 a video."), chips=CHIPS,
            cap=["Genesis is live", "OnFin's creator programme is open: make short videos about OnFin for TikTok, Instagram, Facebook or YouTube and get paid $3 for every 1,000 views, up to $100 a video.",
                 "Free to join and no trading needed. Pick a campaign, send your script and we'll review it before you film."]),
 "ru": dict(cover=("Уже работает", "Genesis *запущен*.", "Получайте оплату за просмотры видео. $3 за 1 000 просмотров, до $100 за видео."), chips=CHIPS,
            cap=["Genesis запущен", "Программа OnFin для креаторов открыта: снимайте короткие видео об OnFin для TikTok, Instagram, Facebook или YouTube и получайте $3 за каждые 1 000 просмотров, до $100 за видео.",
                 "Участие бесплатное, торговать не нужно. Выберите кампанию, пришлите сценарий, и мы проверим его до съёмки."]),
 "es": dict(cover=("Ya disponible", "Genesis ya *está aquí*.", "Cobra por las vistas de tus videos. $3 por cada 1,000 vistas, hasta $100 por video."), chips=CHIPS,
            cap=["Genesis ya está aquí", "El programa de creadores de OnFin está abierto: haz videos cortos sobre OnFin para TikTok, Instagram, Facebook o YouTube y gana $3 por cada 1,000 vistas, hasta $100 por video.",
                 "Unirse es gratis y no necesitas operar. Elige una campaña, envía tu guion y lo revisamos antes de que grabes."]),
 "ms": dict(cover=("Kini dibuka", "Genesis kini *dibuka*.", "Dibayar untuk tontonan video anda. $3 setiap 1,000 tontonan, sehingga $100 setiap video."), chips=CHIPS,
            cap=["Genesis kini dibuka", "Program pencipta OnFin kini dibuka: hasilkan video pendek tentang OnFin untuk TikTok, Instagram, Facebook atau YouTube dan dapatkan $3 bagi setiap 1,000 tontonan, sehingga $100 setiap video.",
                 "Percuma dan tiada dagangan diperlukan. Pilih kempen, hantar skrip anda dan kami akan menyemaknya sebelum anda merakam."]),
}
OPEN = {
 "en": dict(cover=("Open campaigns", "Two briefs,\n*open now*.", "Copy trading, explained. Start trading with OnFin."), chips=CHIPS,
            cap=["Two Genesis campaigns are open now",
                 "Copy trading, explained: show people who've never traded how to pick a strategy, set how much to allocate and stay in control.",
                 "Start trading with OnFin: introduce OnFin to your audience, who we are, what you can trade and how to sign up.",
                 "Both pay $3 per 1,000 views, up to $100 a video. No profit promises and no investment advice in any video."]),
 "ru": dict(cover=("Открытые кампании", "Два брифа\n*уже открыты*.", "Копи-трейдинг простыми словами. Начните торговать с OnFin."), chips=CHIPS,
            cap=["Две кампании Genesis уже открыты",
                 "Копи-трейдинг простыми словами: покажите тем, кто никогда не торговал, как выбрать стратегию, задать сумму и сохранять контроль.",
                 "Начните торговать с OnFin: расскажите аудитории, кто мы, чем можно торговать и как зарегистрироваться.",
                 "Обе платят $3 за 1 000 просмотров, до $100 за видео. Никаких обещаний прибыли и инвестиционных советов."]),
 "es": dict(cover=("Campañas abiertas", "Dos briefs,\n*abiertos ya*.", "Copy trading, explicado. Comienza a operar con OnFin."), chips=CHIPS,
            cap=["Dos campañas de Genesis ya están abiertas",
                 "Copy trading, explicado: muestra a quien nunca ha operado cómo elegir una estrategia, definir cuánto asignar y mantener el control.",
                 "Comienza a operar con OnFin: presenta OnFin a tu audiencia, quiénes somos, qué puedes operar y cómo registrarte.",
                 "Ambas pagan $3 por cada 1,000 vistas, hasta $100 por video. Sin prometer ganancias ni dar asesoría de inversión."]),
 "ms": dict(cover=("Kempen dibuka", "Dua ringkasan,\n*dibuka sekarang*.", "Copy trading, dijelaskan. Mula berdagang dengan OnFin."), chips=CHIPS,
            cap=["Dua kempen Genesis kini dibuka",
                 "Copy trading, dijelaskan: tunjukkan kepada orang yang belum pernah berdagang cara memilih strategi, menetapkan peruntukan dan kekal mengawal.",
                 "Mula berdagang dengan OnFin: perkenalkan OnFin kepada audiens anda, siapa kami, apa yang boleh didagangkan dan cara mendaftar.",
                 "Kedua-duanya membayar $3 setiap 1,000 tontonan, sehingga $100 setiap video. Tiada janji keuntungan dan tiada nasihat pelaburan."]),
}
GM.single(W, "g-live", "2026-10-28", LIVE)
GM.single(W, "g-open", "2026-10-29", OPEN, "campaigns")

# timing: g-live now (story 15 min later); g-open 1h after each channel's 2nd post on 29 Oct
OPEN_AT = {"ig": "12:00", "fb": "09:00", "en": "07:00", "kh": "09:00", "ms": "07:00", "ru": "10:00", "es": "13:00"}
for p in W.posts:
    if p["key"] == "g-live":
        p["date"] = NOW
    elif p["key"] == "g-live-story":
        h, m = int(NOW[11:13]), int(NOW[14:16]) + 15
        p["date"] = f"{NOW[:11]}{h + m // 60:02d}:{m % 60:02d}:00Z"
    elif p["key"] == "g-open":
        p["date"] = f"2026-10-29T{OPEN_AT[p['ch']]}:00Z"
    elif p["key"] == "g-open-story":
        p["date"] = "2026-10-29T12:30:00Z"

if __name__ == "__main__":
    W.save()
    for p in sorted(W.posts, key=lambda p: p["date"]):
        print(p["date"], p["key"], p["ch"])
