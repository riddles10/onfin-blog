"""Post captions for Myth vs Fact #02 to #05. Writes social/reels/myth-0N/captions.md. Instagram adds TAGS; Facebook and Telegram do not."""
import os, re
TAGS = "#onfin #forex #forextrading #tradingeducation #riskmanagement"
ASK = {"en": "Which trading myth should we bust next?", "ms": "Mitos dagangan apa yang patut kami jawab seterusnya?",
       "ru": "Какой миф о трейдинге разобрать следующим?", "es": "¿Qué mito del trading desmentimos la próxima vez?"}
HYP = {"en": "Hypothetical example. ", "ms": "Contoh hipotetikal. ", "ru": "Гипотетический пример. ", "es": "Ejemplo hipotético. "}
DISC = {"en": "Not investment advice. CFDs are high-risk; you may lose money.", "ms": "Bukan nasihat pelaburan. CFD berisiko tinggi; anda mungkin kehilangan wang.",
        "ru": "Не является инвестиционной рекомендацией. CFD относятся к высокорисковым инструментам; вы можете потерять деньги.",
        "es": "No es asesoramiento de inversión. Los CFD son de alto riesgo; puedes perder dinero."}

C = {
2: {
 "en": ["Myth #02: a stop loss guarantees your exit price.",
        "Fact: when price hits your stop, it becomes a market order, filled at the next available price. Most of the time that's close to your stop. But when markets gap, after big news or over the weekend, the next price can be far away.",
        "Hypothetical example: your stop is 50 pips away. Over the weekend, big news hits and the market reopens 80 pips lower. Your stop fills at the open, 30 pips worse than planned. That's slippage.",
        "On OnFin, slippage is symmetric: fills can come in better or worse than requested.",
        "Size every trade as if your stop can slip. " + ASK["en"]],
 "ms": ["Mitos #02: stop loss menjamin harga keluar anda.",
        "Fakta: apabila harga mencapai stop anda, ia menjadi pesanan pasaran dan dilaksanakan pada harga tersedia seterusnya. Selalunya harga itu dekat dengan stop anda. Tetapi apabila pasaran melompat, selepas berita besar atau pada hujung minggu, harga seterusnya boleh jauh.",
        "Contoh hipotetikal: stop anda 50 pip dari harga. Pada hujung minggu, berita besar keluar dan pasaran dibuka semula 80 pip lebih rendah. Stop anda dilaksanakan pada harga pembukaan, 30 pip lebih teruk daripada yang dirancang. Itulah slippage.",
        "Di OnFin, slippage adalah simetri: harga pelaksanaan boleh lebih baik atau lebih teruk daripada yang diminta.",
        "Tetapkan saiz setiap dagangan seakan stop anda boleh tergelincir. " + ASK["ms"]],
 "ru": ["Миф №2: стоп-лосс гарантирует цену выхода.",
        "Факт: когда цена доходит до стопа, он превращается в рыночный ордер и исполняется по следующей доступной цене. Обычно она рядом со стопом. Но когда рынок открывается с гэпом, после важных новостей или выходных, следующая цена может быть далеко.",
        "Гипотетический пример: стоп в 50 пунктах от цены. За выходные выходят важные новости, и рынок открывается на 80 пунктов ниже. Стоп исполняется по цене открытия, на 30 пунктов хуже, чем планировалось. Это и есть проскальзывание.",
        "В OnFin проскальзывание симметричное: исполнение может быть как лучше, так и хуже запрошенной цены.",
        "Выбирайте объём каждой сделки так, будто стоп может проскользнуть. " + ASK["ru"]],
 "es": ["Mito #02: un stop loss garantiza tu precio de salida.",
        "Realidad: cuando el precio toca tu stop, se convierte en una orden de mercado y se ejecuta al siguiente precio disponible. Casi siempre ese precio está cerca de tu stop. Pero cuando el mercado abre con un gap, tras una gran noticia o el fin de semana, el siguiente precio puede estar lejos.",
        "Ejemplo hipotético: tu stop está a 50 pips. El fin de semana llega una gran noticia y el mercado reabre 80 pips más abajo. Tu stop se ejecuta en la apertura, 30 pips peor de lo previsto. Eso es el deslizamiento.",
        "En OnFin el deslizamiento es simétrico: la ejecución puede ser mejor o peor que el precio solicitado.",
        "Ajusta el tamaño de cada operación como si tu stop pudiera deslizarse. " + ASK["es"]],
},
3: {
 "en": ["Myth #03: adding to a losing trade lowers your risk.",
        "Fact: it lowers your average price, but it raises your risk.",
        "Hypothetical example on EUR/USD: you buy 1 lot at 1.1000. It drops 50 pips, so you buy a second lot at 1.0950. Your average price is now 1.0975, 25 pips better.",
        "But you now hold 2 lots, so every pip costs $20 instead of $10. If price falls another 50 pips, you're down $1,500 instead of $1,000.",
        "Decide your exit before you enter. " + ASK["en"]],
 "ms": ["Mitos #03: menambah posisi pada dagangan yang rugi mengurangkan risiko anda.",
        "Fakta: ia merendahkan harga purata anda, tetapi menaikkan risiko anda.",
        "Contoh hipotetikal pada EUR/USD: anda beli 1 lot pada 1.1000. Harga jatuh 50 pip, jadi anda beli lot kedua pada 1.0950. Harga purata anda kini 1.0975, lebih baik 25 pip.",
        "Tetapi kini anda memegang 2 lot, jadi setiap pip bernilai $20 dan bukan $10. Jika harga jatuh lagi 50 pip, anda rugi $1,500 dan bukan $1,000.",
        "Tentukan titik keluar sebelum anda masuk. " + ASK["ms"]],
 "ru": ["Миф №3: если докупать убыточную позицию, риск снижается.",
        "Факт: снижается средняя цена, но риск растёт.",
        "Гипотетический пример на EUR/USD: вы купили 1 лот по 1,1000. Цена упала на 50 пунктов, и вы докупили второй лот по 1,0950. Средняя цена теперь 1,0975, на 25 пунктов лучше.",
        "Но теперь у вас 2 лота, и каждый пункт стоит $20 вместо $10. Если цена упадёт ещё на 50 пунктов, убыток составит $1 500 вместо $1 000.",
        "Решайте, где выйти, до того как войти. " + ASK["ru"]],
 "es": ["Mito #03: sumar a una operación perdedora reduce tu riesgo.",
        "Realidad: baja tu precio promedio, pero sube tu riesgo.",
        "Ejemplo hipotético en EUR/USD: compras 1 lote a 1.1000. Cae 50 pips y compras un segundo lote a 1.0950. Tu precio promedio ahora es 1.0975, 25 pips mejor.",
        "Pero ahora tienes 2 lotes, así que cada pip vale $20 en vez de $10. Si el precio cae otros 50 pips, pierdes $1,500 en vez de $1,000.",
        "Decide tu salida antes de entrar. " + ASK["es"]],
},
4: {
 "en": ["Myth #04: a high win rate means a winning strategy.",
        "Fact: it depends on how much you win compared with how much you lose.",
        "Hypothetical example, before trading costs: Trader A risks $150 to make $50, so they need to win 75% of trades just to break even. Trader B risks $100 to make $200, so they break even winning only 33%.",
        "Break even win rate = risk ÷ (risk + reward).",
        "Look at your win rate and your reward to risk together. " + ASK["en"]],
 "ms": ["Mitos #04: kadar menang yang tinggi bermakna strategi yang menang.",
        "Fakta: ia bergantung pada berapa banyak anda menang berbanding berapa banyak anda rugi.",
        "Contoh hipotetikal, sebelum kos dagangan: Pedagang A merisikokan $150 untuk dapat $50, jadi dia perlu menang 75% dagangan hanya untuk pulang modal. Pedagang B merisikokan $100 untuk dapat $200, jadi dia pulang modal dengan menang hanya 33%.",
        "Kadar menang untuk pulang modal = risiko ÷ (risiko + ganjaran).",
        "Lihat kadar menang dan nisbah ganjaran kepada risiko bersama. " + ASK["ms"]],
 "ru": ["Миф №4: высокий процент прибыльных сделок означает прибыльную стратегию.",
        "Факт: всё зависит от того, сколько вы зарабатываете и сколько теряете.",
        "Гипотетический пример без учёта торговых издержек: трейдер А рискует $150, чтобы заработать $50, и ему нужно выигрывать 75% сделок, просто чтобы выйти в ноль. Трейдер Б рискует $100, чтобы заработать $200, и выходит в ноль при 33% выигрышей.",
        "Процент выигрышей для выхода в ноль = риск ÷ (риск + прибыль).",
        "Смотрите на процент выигрышей и соотношение прибыли к риску вместе. " + ASK["ru"]],
 "es": ["Mito #04: una alta tasa de acierto significa una estrategia ganadora.",
        "Realidad: depende de cuánto ganas comparado con cuánto pierdes.",
        "Ejemplo hipotético, antes de costos de trading: el trader A arriesga $150 para ganar $50, así que necesita acertar el 75% de sus operaciones solo para quedar a mano. El trader B arriesga $100 para ganar $200 y queda a mano acertando solo el 33%.",
        "Tasa de acierto para quedar a mano = riesgo ÷ (riesgo + beneficio).",
        "Mira tu tasa de acierto y tu relación riesgo beneficio juntas. " + ASK["es"]],
},
5: {
 "en": ["Myth #05: a licence number on a broker's website means it's regulated.",
        "Fact: only the regulator's own register can confirm it. Scam sites copy real licence numbers from real firms.",
        "How to check: 1. Go to the regulator's official website, typed in yourself, not from a link. 2. Search its register. 3. The company name, licence number and website should all match. If anything is different, walk away.",
        "OnFin Ltd is licensed by the Mwali International Services Authority (MISA), licence number BFX2024038.",
        ASK["en"]],
 "ms": ["Mitos #05: nombor lesen di laman web broker bermakna ia dikawal selia.",
        "Fakta: hanya daftar pengawal selia sendiri yang boleh mengesahkannya. Laman penipuan menyalin nombor lesen sebenar daripada syarikat sebenar.",
        "Cara menyemak: 1. Pergi ke laman web rasmi pengawal selia, taip sendiri, bukan melalui pautan. 2. Cari dalam daftarnya. 3. Nama syarikat, nombor lesen dan laman web mesti sepadan. Jika ada yang berbeza, jangan teruskan.",
        "OnFin Ltd dilesenkan oleh Mwali International Services Authority (MISA), nombor lesen BFX2024038.",
        ASK["ms"]],
 "ru": ["Миф №5: номер лицензии на сайте брокера означает, что он регулируется.",
        "Факт: подтвердить это может только реестр самого регулятора. Мошеннические сайты копируют настоящие номера лицензий настоящих компаний.",
        "Как проверить: 1. Откройте официальный сайт регулятора, введя адрес вручную, а не по ссылке. 2. Найдите компанию в его реестре. 3. Название компании, номер лицензии и сайт должны совпадать. Если что-то отличается, уходите.",
        "OnFin Ltd имеет лицензию Mwali International Services Authority (MISA), номер лицензии BFX2024038.",
        ASK["ru"]],
 "es": ["Mito #05: un número de licencia en la web de un bróker significa que está regulado.",
        "Realidad: solo el registro del propio regulador puede confirmarlo. Los sitios fraudulentos copian números de licencia reales de empresas reales.",
        "Cómo verificarlo: 1. Entra al sitio oficial del regulador escribiendo tú la dirección, no desde un enlace. 2. Busca en su registro. 3. El nombre de la empresa, el número de licencia y el sitio web deben coincidir. Si algo no coincide, aléjate.",
        "OnFin Ltd tiene licencia de la Mwali International Services Authority (MISA), número de licencia BFX2024038.",
        ASK["es"]],
},
}
TITLE = {2: "a stop loss guarantees your exit price?", 3: "adding to a losing trade lowers your risk?", 4: "a high win rate means a winning strategy?",
         5: "a licence number on the website means the broker is regulated?"}
FILES = {"en": "Instagram, Facebook, Telegram EN and KH", "ms": "Analitik OnFin", "ru": "OnFin аналитика", "es": "OnFin LATAM"}

for ep, langs in C.items():
    d = f"/home/user/onfin-blog/social/reels/myth-{ep:02d}"; os.makedirs(d, exist_ok=True)
    out = [f"# Myth vs Fact #{ep:02d}: {TITLE[ep]}", "",
           "Videos: " + ", ".join(f"onfin-myth{ep:02d}-{l}.mp4 ({FILES[l]})" for l in langs) + ".", ""]
    for lang, paras in langs.items():
        disc = ("" if ep == 5 else HYP[lang]) + DISC[lang]
        body = paras + ([TAGS] if lang == "en" else []) + [disc]
        out += [f"## {lang.upper()}" + (" (Instagram adds the hashtag line; Facebook and Telegram without it)" if lang == "en" else ""), ""]
        for p in body: out += [p, ""]
        tg = "\n\n".join(p for p in body if p != TAGS)
        bad = re.findall("[–—!]", tg)
        print(ep, lang, len(tg), "chars", "BAD" if bad or len(tg) > 1000 else "ok", bad)
    open(f"{d}/captions.md", "w", encoding="utf-8").write("\n".join(out))
