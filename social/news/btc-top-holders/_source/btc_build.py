"""Top 15 bitcoin holders (data 30 Oct 2026), 17-slide carousel in EN, MS, RU, ES. python3 btc_build.py [lang ...]"""
import json, os, subprocess, sys
sys.path.insert(0, "/tmp/claude-0/-home-user-onfin-blog/42b2fa22-784d-52c4-a9a8-6ec4971d0812/scratchpad/wk")
from common import Week, S

B = f"{S}/btcholders"
F = lambda p: f"file://{B}/{p}"
AV = f"file://{S}/meme/logo/avatar-bolt.jpg"
PRICE = 78400  # USD per BTC, BitcoinTreasuries.net on 30 Oct 2026 (IBIT: $63,602M / 811,115 BTC)
LANGS = ["en", "ms", "ru", "es"]

TYPES = {
    "etf": ("Spot bitcoin ETF", "ETF bitcoin spot", "Спотовый биткоин-ETF", "ETF de bitcoin al contado"),
    "company": ("Public company", "Syarikat awam", "Публичная компания", "Empresa cotizada"),
    "company_old": ("Public company, last reported Jul 2025", "Syarikat awam, laporan terakhir Jul 2025", "Публичная компания, данные на июль 2025", "Empresa cotizada, último dato jul 2025"),
    "private": ("Private company", "Syarikat swasta", "Частная компания", "Empresa privada"),
    "private_old": ("Private company, last reported 2022", "Syarikat swasta, laporan terakhir 2022", "Частная компания, данные на 2022 год", "Empresa privada, último dato 2022"),
    "gov": ("Government", "Kerajaan", "Государство", "Gobierno"),
    "gov_track": ("Government, on-chain tracking", "Kerajaan, jejakan on-chain", "Государство, данные блокчейна", "Gobierno, rastreo on-chain"),
    "gov_est": ("Government, estimate", "Kerajaan, anggaran", "Государство, оценка", "Gobierno, estimación"),
    "est": ("Bitcoin's creator, estimate", "Pencipta bitcoin, anggaran", "Создатель биткоина, оценка", "Creador de bitcoin, estimación"),
}
BT_SRC = ("Source: BitcoinTreasuries.net", "Sumber: BitcoinTreasuries.net", "Источник: BitcoinTreasuries.net", "Fuente: BitcoinTreasuries.net")
# rank, key, names (en, ms, ru, es), type, btc, image, mode, extra props, credit
H = [
    (15, "bitb", ("Bitwise Bitcoin ETF (BITB)",) * 4, "etf", 38189, "img/bitb_og.png", "photo", dict(pos="14% 50%"), "Image: Bitwise"),
    (14, "strive", ("Strive",) * 4, "company", 43000, "img/logo_strive.png", "photo", dict(pos="50% 50%"), "Logo: Strive"),
    (13, "twentyone", ("Twenty One Capital",) * 4, "company_old", 43514, "img/logo_twentyone.png", "logo", dict(logoPct=72), "Logo: Twenty One Capital"),
    (12, "metaplanet", ("Metaplanet",) * 4, "company", 44000, "img/logo_metaplanet.png", "photo", dict(pos="50% 50%"), "Logo: Metaplanet"),
    (11, "uk", ("UK government", "Kerajaan UK", "Правительство Великобритании", "Gobierno del Reino Unido"), "gov", 61245, "img/flag_uk.svg", "photo", dict(pos="50% 50%"), "Flag: public domain"),
    (10, "gmini", ("Grayscale Bitcoin Mini Trust",) * 4, "etf", 62874, "img/grayscale_rgba.png", "logo", dict(logoPct=82), "Logo: Grayscale, public domain, Wikimedia Commons"),
    (9, "tether", ("Tether",) * 4, "private", 100000, "img/ardoino.jpg", "photo", dict(pos="50% 22%"), "Pictured: Paolo Ardoino. Photo: Gage Skidmore, CC BY-SA 3.0, Wikimedia Commons"),
    (8, "gbtc", ("Grayscale Bitcoin Trust (GBTC)",) * 4, "etf", 131528, "img/grayscale_rgba.png", "logo", dict(logoPct=82), "Logo: Grayscale, public domain, Wikimedia Commons"),
    (7, "blockone", ("Block.one",) * 4, "private_old", 164000, "img/bitcoin.svg", "logo", dict(logoPct=70), "Bitcoin logo: public domain"),
    (6, "fbtc", ("Fidelity Wise Origin Bitcoin Fund (FBTC)",) * 4, "etf", 184058, "img/ajohnson.jpg", "photo", dict(pos="50% 25%", nsize=46), "Pictured: Abigail Johnson. Photo: Village Global, CC BY 2.0, Wikimedia Commons"),
    (5, "china", ("China", "China", "Китай", "China"), "gov_est", 190000, "img/flag_cn.svg", "photo", dict(pos="30% 50%"), "Flag: public domain"),
    (4, "us", ("US government", "Kerajaan AS", "Правительство США", "Gobierno de EE. UU."), "gov_track", 328372, "img/flag_us.svg", "photo", dict(pos="20% 50%"), "Flag: public domain"),
    (3, "ibit", ("BlackRock iShares Bitcoin Trust (IBIT)",) * 4, "etf", 811115, "img/fink.jpg", "photo", dict(pos="50% 25%", nsize=48), "Pictured: Larry Fink. Photo: Wilson Center, CC BY-SA 3.0, Wikimedia Commons"),
    (2, "strategy", ("Strategy",) * 4, "company", 848517, "img/saylor.png", "photo", dict(pos="50% 30%"), "Pictured: Michael Saylor. Photo: ReasonTV, CC BY 3.0, Wikimedia Commons"),
    (1, "satoshi", ("Satoshi Nakamoto",) * 4, "est", 1096361, "img/satoshi_bust.jpg", "photo", dict(pos="50% 22%"), "Pictured: Satoshi Nakamoto bust, Budapest. Photo: Fekist, CC BY-SA 4.0, Wikimedia Commons"),
]


def btc_fmt(n, l):
    s = f"{n:,}"
    return (s.replace(",", " ") if l == "ru" else s) + " BTC"


def usd_fmt(n, l):
    b = n * PRICE / 1e9
    if l == "en": return f"about ${b:.1f} billion"
    if l == "ms": return f"kira-kira ${b:.1f} bilion"
    if l == "ru": return f"около ${b:.1f} млрд".replace(".", ",")
    return f"unos ${round(b * 10) * 100:,} millones"


PRICE_LINE = {"en": "at $78,400 per BTC, 30 Oct 2026", "ms": "pada $78,400 setiap BTC, 30 Okt 2026",
              "ru": "при цене $78 400 за BTC, 30 окт. 2026", "es": "a $78,400 por BTC, 30 oct 2026"}
SAT = {"en": ("about 1.1 million BTC", "about $86 billion", "The Crypto Basic, citing Arkham, May 2026"),
       "ms": ("kira-kira 1.1 juta BTC", "kira-kira $86 bilion", "The Crypto Basic, memetik Arkham, Mei 2026"),
       "ru": ("около 1,1 млн BTC", "около $86 млрд", "The Crypto Basic со ссылкой на Arkham, май 2026"),
       "es": ("cerca de 1.1 millones de BTC", "unos $86,000 millones", "The Crypto Basic, según Arkham, mayo 2026")}
COVER = {
    "en": dict(tag="Crypto", head="Who owns the *most bitcoin* in the world?", badge="Top 15",
               sub="The 15 biggest known holders: companies, funds, governments and Satoshi's estimated coins. Data at 30 Oct 2026."),
    "ms": dict(tag="Kripto", head="Siapa pemilik *bitcoin terbanyak* di dunia?", badge="15 teratas",
               sub="15 pemegang terbesar yang diketahui: syarikat, dana, kerajaan dan anggaran syiling Satoshi. Data pada 30 Okt 2026."),
    "ru": dict(tag="Крипто", head="У кого *больше всего биткоинов* в мире?", badge="Топ-15",
               sub="15 крупнейших известных держателей: компании, фонды, государства и оценка монет Сатоши. Данные на 30 окт. 2026."),
    "es": dict(tag="Cripto", head="¿Quién tiene *más bitcoin* en el mundo?", badge="Top 15",
               sub="Los 15 mayores tenedores conocidos: empresas, fondos, gobiernos y las monedas estimadas de Satoshi. Datos al 30 oct 2026."),
}
LAST = {
    "en": ("Which holder *surprised you* most?", "Follow @onfinkm for daily market stories.", "Not investment advice. Crypto and CFDs are high-risk; you may lose money."),
    "ms": ("Pemegang mana yang *paling mengejutkan* anda?", "Ikuti @onfinkm untuk berita pasaran harian.", "Bukan nasihat pelaburan. Kripto dan CFD berisiko tinggi; anda mungkin kehilangan wang."),
    "ru": ("Какой держатель *удивил вас* больше всего?", "Подписывайтесь на @onfinkm: новости рынков каждый день.",
           "Не является инвестиционной рекомендацией. Криптовалюты и CFD относятся к высокорисковым инструментам; вы можете потерять деньги."),
    "es": ("¿Qué tenedor *te sorprendió* más?", "Sigue a @onfinkm para noticias del mercado cada día.",
           "No es asesoramiento de inversión. Las criptomonedas y los CFD son de alto riesgo; puedes perder dinero."),
}

langs = sys.argv[1:] or LANGS
W = Week("btcholders/render")
for l in langs:
    li = LANGS.index(l); c = COVER[l]
    W.lib("BtcCover", dict(avatar=AV, photo=F("img/saylor_keynote.jpg"), pos="50% 50%", logo=F("img/bitcoin.svg"), badge=c["badge"], cx="27%", cy=330, cd=260,
          tag=c["tag"], headline=c["head"], sub=c["sub"], credit="Photo: MicroStrategy, CC BY 2.0, Wikimedia Commons", hsize=78 if l in ("ru", "ms") else 84), f"btc-{l}-01.png")
    for i, (rank, key, names, typ, n, img, mode, extra, credit) in enumerate(H):
        p = dict(avatar=AV, rank=str(rank), name=names[li], type=TYPES[typ][li], img=F(img), mode=mode, shot=F(f"ev2/{key}.png"), credit=credit,
                 btc=btc_fmt(n, l), usd=usd_fmt(n, l), price=PRICE_LINE[l], source=BT_SRC[li], evw=760, **extra)
        if key in ("us", "china", "uk"):
            p.update(evw=860)
        if key == "satoshi":
            p.update(btc=SAT[l][0], usd=SAT[l][1], source=SAT[l][2], evw=600, maxh=440, bsize={"en": 76, "ms": 62, "ru": 70, "es": 54}[l])
        if l == "ru" and key in ("uk",):
            p.setdefault("nsize", 46)
        W.lib("HolderSlide", p, f"btc-{l}-{i + 2:02d}.png")
    q, follow, risk = LAST[l]
    W.lib("SocialSlide", dict(avatar=AV, photo=F("img/satoshi_statue.jpg"), pos="50% 40%", top=0.5, dark=0.94, line=q, sub=follow, risk=risk,
          lsize=60 if l != "en" else 64, credit="Photo: StellarDancingDuck, CC BY-SA 4.0, Wikimedia Commons"), f"btc-{l}-17.png")
W.save()
for j in W.lib_jobs:
    txt = json.dumps(j["props"], ensure_ascii=False)
    if any(ch in txt for ch in "–—!"):
        print("BAD CHAR", j["out"])
r = subprocess.run(["node", "render_page.js", f"{S}/{W.name}/lib_jobs.json"], cwd=f"{S}/igtools",
                   env={**os.environ, "LIB": f"{S}/iglib/library", "PAGE": "render_btc.html"}, capture_output=True, text=True)
print(r.stdout[-200:], r.stderr[-600:])
