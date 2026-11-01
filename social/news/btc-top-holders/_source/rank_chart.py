"""rank_chart.py <fonts dir> <avatar.jpg> <out dir>: one ranking bar chart per language (1080x1350) for the Telegram post."""
import sys, os
from PIL import Image, ImageDraw, ImageFont
FD, AV, OUT = sys.argv[1], sys.argv[2], sys.argv[3]
BG, WHITE, GREY, LIME, BAR = (10, 10, 10), (255, 255, 255), (150, 150, 150), (166, 214, 30), (52, 52, 52)
VAL = [1100000, 848517, 811115, 328372, 190000, 184058, 164000, 131528, 100000, 62874, 61245, 44000, 43514, 43000, 38189]
L = {
 "en": dict(title="The 15 biggest bitcoin holders", sub="BTC held, data at 30 Oct 2026",
            names=["Satoshi Nakamoto*", "Strategy", "BlackRock IBIT", "US government*", "China*", "Fidelity FBTC", "Block.one (2022)", "Grayscale GBTC", "Tether", "Grayscale Mini Trust", "UK government*", "Metaplanet", "Twenty One (2025)", "Strive", "Bitwise BITB"],
            big="~1.1M", foot="* Estimate or on-chain tracking. Source: BitcoinTreasuries.net; Arkham estimate for Satoshi.", sep=","),
 "ms": dict(title="15 pemegang bitcoin terbesar", sub="BTC dipegang, data pada 30 Okt 2026",
            names=["Satoshi Nakamoto*", "Strategy", "BlackRock IBIT", "Kerajaan AS*", "China*", "Fidelity FBTC", "Block.one (2022)", "Grayscale GBTC", "Tether", "Grayscale Mini Trust", "Kerajaan UK*", "Metaplanet", "Twenty One (2025)", "Strive", "Bitwise BITB"],
            big="~1.1 juta", foot="* Anggaran atau jejakan on-chain. Sumber: BitcoinTreasuries.net; anggaran Arkham untuk Satoshi.", sep=","),
 "ru": dict(title="15 крупнейших держателей биткоина", sub="BTC на балансе, данные на 30 окт. 2026",
            names=["Сатоши Накамото*", "Strategy", "BlackRock IBIT", "Власти США*", "Китай*", "Fidelity FBTC", "Block.one (2022)", "Grayscale GBTC", "Tether", "Grayscale Mini Trust", "Власти Великобритании*", "Metaplanet", "Twenty One (2025)", "Strive", "Bitwise BITB"],
            big="~1,1 млн", foot="* Оценка или ончейн-отслеживание. Источник: BitcoinTreasuries.net; оценка Arkham для Сатоши.", sep=" "),
 "es": dict(title="Los 15 mayores tenedores de bitcoin", sub="BTC en cartera, datos al 30 oct 2026",
            names=["Satoshi Nakamoto*", "Strategy", "BlackRock IBIT", "Gobierno de EE. UU.*", "China*", "Fidelity FBTC", "Block.one (2022)", "Grayscale GBTC", "Tether", "Grayscale Mini Trust", "Reino Unido (gob.)*", "Metaplanet", "Twenty One (2025)", "Strive", "Bitwise BITB"],
            big="~1.1 M", foot="* Estimación o rastreo on-chain. Fuente: BitcoinTreasuries.net; estimación de Arkham para Satoshi.", sep=","),
}
f = lambda w, s: ImageFont.truetype(os.path.join(FD, "Montserrat-%s.ttf" % w), s)


def wrap(d, text, font, width):
    lines, cur = [], ""
    for w in text.split():
        t = (cur + " " + w).strip()
        if d.textlength(t, font=font) > width and cur:
            lines.append(cur); cur = w
        else:
            cur = t
    return lines + [cur]


for lang, c in L.items():
    im = Image.new("RGB", (1080, 1350), BG); d = ImageDraw.Draw(im)
    av = Image.open(AV).convert("RGB").resize((56, 56)); m = Image.new("L", (56, 56), 0); ImageDraw.Draw(m).ellipse((0, 0, 55, 55), fill=255)
    im.paste(av, (48, 46), m); d.text((116, 60), "@onfinkm", font=f("SemiBold", 26), fill=WHITE)
    y = 150
    for line in wrap(d, c["title"], f("ExtraBold", 60), 980):
        d.text((50, y), line, font=f("ExtraBold", 60), fill=WHITE); y += 70
    d.text((50, y + 6), c["sub"], font=f("SemiBold", 28), fill=GREY); y += 74
    x0, x1, row = 470, 1030, (1190 - y) / 15
    for i, (n, v) in enumerate(zip(c["names"], VAL)):
        cy = y + i * row + row / 2
        d.text((50, cy), "%d" % (i + 1), font=f("ExtraBold", 26), fill=LIME, anchor="lm")
        d.text((96, cy), n, font=f("SemiBold", 25), fill=WHITE, anchor="lm")
        w = max(6, (x1 - x0 - 150) * v / VAL[0])
        d.rounded_rectangle((x0, cy - 15, x0 + w, cy + 15), radius=6, fill=LIME if i == 0 else BAR)
        lab = c["big"] if i == 0 else "{:,}".format(v).replace(",", c["sep"])
        d.text((x0 + w + 12, cy), lab, font=f("ExtraBold", 24), fill=WHITE, anchor="lm")
    fy = 1222
    for line in wrap(d, c["foot"], f("SemiBold", 21), 980):
        d.text((50, fy), line, font=f("SemiBold", 21), fill=GREY); fy += 30
    im.save(os.path.join(OUT, "btc-tg-%s.jpg" % lang), quality=92)
    print(lang)
