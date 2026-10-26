"""Captions for the OnFin Market News posts, per channel.
Channels: ig (Instagram EN), en (OnFin analytics), kh (OnFin Cambodia, EN), ms, ru, es."""

CHANNELS = {
    "ig": {"id": "cmvl4rmgd12ctmk0yjjk9x6kd", "lang": "en", "hour": 16},
    "en": {"id": "cmuv1mlcb001dmo0ylwenjxe1", "lang": "en", "hour": 8},
    "kh": {"id": "cmvjfl0ed087glf0yuoz284sa", "lang": "en", "hour": 8},
    "ms": {"id": "cmuv1oz5o002gql0y49vluhy3", "lang": "ms", "hour": 8},
    "ru": {"id": "cmuv1nud2001qmo0y7xgzq68r", "lang": "ru", "hour": 9},
    "es": {"id": "cmvjg3htg08k9lf0yunmvtsqu", "lang": "es", "hour": 14},
}
# Stories that must go out before 13:30 UTC (data released that day)
HOUR_OVERRIDE = {"fed-december": {"ig": 11, "es": 12}, "euro-shorts": {"ig": 11, "es": 12}}

# US data release time after the US clock change (13:30 UTC), per channel
T = {"ig": "13:30 UTC", "en": "13:30 UTC", "kh": "20:30 Cambodia time", "ms": "21:30 waktu Malaysia",
     "ru": "16:30 МСК", "es": "8:30 en Bogotá y Lima"}
T_OLD = {"ig": "12:30 UTC", "en": "12:30 UTC", "kh": "19:30", "ms": "20:30", "ru": "15:30", "es": "7:30"}

CFD = {"en": "CFDs are high-risk; you may lose money.",
       "ms": "CFD berisiko tinggi; anda mungkin kehilangan wang.",
       "ru": "CFD относятся к высокорисковым инструментам; вы можете потерять деньги.",
       "es": "Los CFD son de alto riesgo; puedes perder dinero."}
LEV = {"en": "Trading leveraged products involves significant risk of loss.",
       "ms": "Dagangan produk berleveraj melibatkan risiko kerugian yang ketara.",
       "ru": "Торговля с кредитным плечом связана со значительным риском потерь.",
       "es": "Operar productos apalancados conlleva un riesgo significativo de pérdida."}
TAGS = "#onfin #forex #forextrading #marketnews #trading"


def link(ch, label, slug):
    lang = CHANNELS[ch]["lang"]
    if ch == "ig":
        return f"👉 {label} on blog.onfin.io"
    return f"👉 {label}: https://blog.onfin.io/{lang}/{slug}"


def cap(story, ch):
    lang = CHANNELS[ch]["lang"]
    t, told = T[ch], T_OLD[ch]
    S = {}

    # 1. central banks
    S["central-banks"] = {
     "en": ["5 central banks. 3 days. 🏦", "This week brings a packed run of rate decisions:",
            "• Wed: RBNZ, Bank of Canada, Fed", "• Thu: ECB", "• Fri: Bank of Japan",
            "Markets expect the Fed, ECB and BoJ to hold. The risk is in the tone: any hint about the next move can shift USD, EUR and JPY fast.",
            "⚠️ Expect wider spreads and sharp moves around each announcement. Check your stops and position size.", CFD["en"]],
     "ms": ["5 bank pusat. 3 hari. 🏦", "Minggu ini penuh dengan keputusan kadar faedah:",
            "• Rabu: RBNZ, Bank of Canada, Fed", "• Khamis: ECB", "• Jumaat: Bank of Japan",
            "Pasaran menjangkakan Fed, ECB dan BoJ mengekalkan kadar. Risikonya pada nada kenyataan: sebarang petunjuk tentang langkah seterusnya boleh menggerakkan USD, EUR dan JPY dengan pantas.",
            "⚠️ Jangkakan spread lebih lebar dan pergerakan tajam ketika setiap pengumuman. Semak stop-loss dan saiz posisi anda.", CFD["ms"]],
     "ru": ["5 центробанков за 3 дня 🏦", "На этой неделе плотный график решений по ставкам:",
            "• Среда: РБНЗ, Банк Канады, ФРС", "• Четверг: ЕЦБ", "• Пятница: Банк Японии",
            "Рынок ждёт, что ФРС, ЕЦБ и Банк Японии сохранят ставки. Главный риск в риторике: любой намёк на следующий шаг может быстро сдвинуть USD, EUR и JPY.",
            "⚠️ Во время объявлений возможны расширенные спреды и резкие движения. Проверьте стопы и объём позиций.", CFD["ru"]],
     "es": ["5 bancos centrales. 3 días. 🏦", "Esta semana llega cargada de decisiones de tipos:",
            "• Miércoles: RBNZ, Banco de Canadá, Fed", "• Jueves: BCE", "• Viernes: Banco de Japón",
            "El mercado espera que la Fed, el BCE y el BoJ mantengan los tipos. El riesgo está en el tono: cualquier pista sobre el próximo paso puede mover rápido el USD, el EUR y el JPY.",
            "⚠️ Espera spreads más amplios y movimientos bruscos en cada anuncio. Revisa tus stops y el tamaño de tus posiciones.", CFD["es"]],
    }
    # 2. oil
    S["oil"] = {
     "en": ["Oil hits a 5-month high 🛢️",
            "WTI crude climbed to $103.28 this month, its highest level in five months, as attacks on commercial shipping and Saudi energy infrastructure raised supply fears.",
            "Why traders care:", "• Higher oil can lift inflation expectations, which central banks watch closely",
            "• Oil-linked currencies like the Canadian dollar often react", "• Geopolitical headlines can move prices sharply, in either direction", CFD["en"]],
     "ms": ["Minyak capai paras tertinggi 5 bulan 🛢️",
            "Minyak mentah WTI naik ke $103.28 bulan ini, paras tertinggi dalam lima bulan, apabila serangan ke atas kapal dagang dan infrastruktur tenaga Arab Saudi mencetuskan kebimbangan bekalan.",
            "Kenapa ia penting bagi pedagang:", "• Harga minyak lebih tinggi boleh menaikkan jangkaan inflasi, yang dipantau rapi oleh bank pusat",
            "• Mata wang berkait minyak seperti dolar Kanada sering bertindak balas", "• Berita geopolitik boleh menggerakkan harga dengan tajam, ke mana-mana arah", CFD["ms"]],
     "ru": ["Нефть на 5-месячном максимуме 🛢️",
            "WTI в этом месяце поднялась до $103,28, самого высокого уровня за пять месяцев. Атаки на торговые суда и энергетическую инфраструктуру Саудовской Аравии усилили опасения за поставки.",
            "Почему это важно трейдерам:", "• Дорогая нефть может поднять инфляционные ожидания, за которыми следят центробанки",
            "• Сырьевые валюты, например канадский доллар, часто реагируют на нефть", "• Геополитические новости могут резко двигать цены в любую сторону", CFD["ru"]],
     "es": ["El petróleo marca máximos de 5 meses 🛢️",
            "El WTI subió este mes hasta $103.28, su nivel más alto en cinco meses, después de que los ataques a buques comerciales y a infraestructura energética de Arabia Saudita avivaran el temor por el suministro.",
            "Por qué importa a los traders:", "• Un petróleo más caro puede elevar las expectativas de inflación, que los bancos centrales vigilan de cerca",
            "• Las divisas ligadas al petróleo, como el dólar canadiense, suelen reaccionar", "• Los titulares geopolíticos pueden mover el precio con fuerza, en cualquier dirección", CFD["es"]],
    }
    # 3. euro shorts
    S["euro-shorts"] = {
     "en": ["Hedge funds are betting against the euro 📉",
            "The latest positioning data shows hedge funds holding their biggest net short on the euro since March 2020, with French fiscal worries a key reason.",
            "Today the ECB announces its rate decision, after a week with EUR/USD hovering around 1.12. Markets expect rates to stay on hold, so the focus is on what the ECB signals next.",
            "Crowded trades can unwind fast: a surprise either way can move EUR/USD sharply.", CFD["en"]],
     "ms": ["Dana lindung nilai bertaruh menentang euro 📉",
            "Data kedudukan terkini menunjukkan dana lindung nilai memegang posisi jual bersih terbesar ke atas euro sejak Mac 2020, dengan kebimbangan fiskal Perancis antara sebab utamanya.",
            "Hari ini ECB mengumumkan keputusan kadar faedah, selepas EUR/USD berlegar sekitar 1.12 sepanjang minggu lalu. Pasaran menjangkakan kadar dikekalkan, jadi tumpuan ialah isyarat ECB untuk langkah seterusnya.",
            "Dagangan yang terlalu sesak boleh berbalik dengan pantas: sebarang kejutan boleh menggerakkan EUR/USD dengan tajam.", CFD["ms"]],
     "ru": ["Хедж-фонды ставят против евро 📉",
            "Свежие данные по позиционированию: у хедж-фондов крупнейшая чистая короткая позиция по евро с марта 2020 года. Одна из главных причин: бюджетные проблемы Франции.",
            "Сегодня ЕЦБ объявит решение по ставке; всю прошлую неделю EUR/USD держалась около 1,12. Рынок ждёт сохранения ставок, поэтому главное: сигналы ЕЦБ о дальнейших шагах.",
            "Перегруженные позиции могут быстро разворачиваться: любой сюрприз способен резко сдвинуть EUR/USD.", CFD["ru"]],
     "es": ["Los hedge funds apuestan contra el euro 📉",
            "Los últimos datos de posicionamiento muestran a los hedge funds con su mayor posición neta corta en euros desde marzo de 2020, con la preocupación fiscal en Francia como una de las claves.",
            "Hoy el BCE anuncia su decisión de tipos, tras una semana con el EUR/USD en torno a 1.12. Se espera que mantenga los tipos, así que la atención está en lo que el BCE deje entrever.",
            "Las posiciones muy concentradas pueden deshacerse rápido: cualquier sorpresa puede mover con fuerza el EUR/USD.", CFD["es"]],
    }
    # 4. clocks
    S["clocks"] = {
     "en": ["US clocks change this Sunday ⏰", "Europe moved its clocks back on 25 October. The US follows on Sunday 1 November.",
            "What changes from Monday 2 November:", f"• US data releases move to {t} (from {told})",
            "• The New York session opens and closes one hour later", "• The gap between London and New York goes back to 5 hours (it was 4 hours this week)",
            "Check your alerts and your trading routine.", link(ch, "Session guide", "forex-trading-hours-market-moves")],
     "ms": ["Jam di AS berubah Ahad ini ⏰", "Eropah telah mengundurkan jam pada 25 Oktober. AS menyusul pada Ahad, 1 November.",
            "Apa yang berubah mulai Isnin, 2 November:", f"• Data AS kini keluar pada {t} (sebelum ini {told})",
            "• Sesi New York dibuka dan ditutup sejam lebih lewat", "• Jurang antara London dan New York kembali kepada 5 jam (4 jam minggu ini)",
            "Semak amaran harga dan rutin dagangan anda.", link(ch, "Panduan sesi", "forex-trading-hours-market-moves")],
     "ru": ["В воскресенье США переводят часы ⏰", "Европа перевела часы 25 октября. США сделают это в воскресенье, 1 ноября.",
            "Что меняется с понедельника, 2 ноября:", f"• Данные США выходят в {t} (было {told})",
            "• Нью-Йоркская сессия открывается и закрывается на час позже", "• Разница между Лондоном и Нью-Йорком снова 5 часов (на этой неделе было 4)",
            "Проверьте алерты и свой торговый распорядок.", link(ch, "Гайд по сессиям", "forex-trading-hours-market-moves")],
     "es": ["Este domingo cambia la hora en EE. UU. ⏰", "Europa atrasó la hora el 25 de octubre. EE. UU. lo hace el domingo 1 de noviembre.",
            "Qué cambia desde el lunes 2 de noviembre:", f"• Los datos de EE. UU. salen a las {t} (antes a las {told})",
            "• En UTC, la sesión de Nueva York abre y cierra una hora más tarde", "• La diferencia entre Londres y Nueva York vuelve a 5 horas (esta semana fue de 4)",
            "Revisa tus alertas y tu rutina de trading.", link(ch, "Guía de sesiones", "forex-trading-hours-market-moves")],
    }
    # 5. gold
    S["gold"] = {
     "en": ["Gold is $1,300+ off its record 🪙", "Gold hit a record above $5,300 an ounce in January. In late October it was trading near $4,000, more than $1,300 below that peak.",
            "In the month before the Fed's 28 October decision it slipped about 3%, yet it's still roughly flat on a year ago.",
            "A reminder that even safe-haven assets can swing hard.", LEV["en"]],
     "ms": ["Emas $1,300+ di bawah rekodnya 🪙", "Emas mencatat rekod melebihi $5,300 seauns pada Januari. Pada akhir Oktober ia didagangkan sekitar $4,000, lebih $1,300 di bawah puncak itu.",
            "Dalam sebulan menjelang keputusan Fed pada 28 Oktober, harganya turun kira-kira 3%, namun masih hampir sama berbanding setahun lalu.",
            "Peringatan bahawa aset selamat pun boleh berayun dengan kuat.", LEV["ms"]],
     "ru": ["Золото на $1 300+ ниже рекорда 🪙", "В январе золото обновило рекорд выше $5 300 за унцию. В конце октября оно торговалось около $4 000, более чем на $1 300 ниже пика.",
            "За месяц до решения ФРС 28 октября цена снизилась примерно на 3%, но год к году золото почти не изменилось.",
            "Напоминание: даже защитные активы могут сильно колебаться.", LEV["ru"]],
     "es": ["El oro, $1,300+ por debajo de su récord 🪙", "El oro marcó un récord por encima de $5,300 la onza en enero. A finales de octubre cotizaba cerca de $4,000, más de $1,300 por debajo de ese pico.",
            "En el mes previo a la decisión de la Fed del 28 de octubre bajó cerca de un 3%, aunque sigue prácticamente igual que hace un año.",
            "Un recordatorio de que incluso los activos refugio pueden moverse con fuerza.", LEV["es"]],
    }
    # 6. week ahead 1
    S["week-ahead-1"] = {
     "en": ["This week's market movers 📅", "• Tue 3 Nov: US midterm elections. Results come in overnight, during the Asian session.",
            f"• Fri 6 Nov: US jobs report (NFP), {t}", "Reminder: US clocks changed on Sunday, so US data now lands one hour later than last week.",
            "Plan around these windows: spreads can widen and prices can gap.", CFD["en"]],
     "ms": ["Penggerak pasaran minggu ini 📅", "• Sel 3 Nov: Pilihan raya pertengahan penggal AS. Keputusan tiba semalaman, semasa sesi Asia.",
            f"• Jum 6 Nov: Laporan pekerjaan AS (NFP), {t}", "Peringatan: jam di AS telah berubah pada Ahad, jadi data AS kini keluar sejam lebih lewat berbanding minggu lalu.",
            "Rancang dagangan anda: spread boleh melebar dan harga boleh melompat.", CFD["ms"]],
     "ru": ["Что двигает рынок на этой неделе 📅", "• Вт, 3 ноября: промежуточные выборы в США. Итоги будут поступать ночью, в азиатскую сессию.",
            f"• Пт, 6 ноября: отчёт по занятости в США (NFP), {t}", "Напоминание: в воскресенье США перевели часы, поэтому данные США теперь выходят на час позже, чем на прошлой неделе.",
            "Учитывайте эти окна: спреды могут расширяться, а цены гэпать.", CFD["ru"]],
     "es": ["Lo que moverá el mercado esta semana 📅", "• Mar 3 nov: elecciones de mitad de mandato en EE. UU. Los resultados llegan de madrugada, en la sesión asiática.",
            f"• Vie 6 nov: informe de empleo de EE. UU. (NFP), {t}", "Recuerda: el domingo cambió la hora en EE. UU., así que sus datos salen una hora más tarde que la semana pasada.",
            "Planifica en torno a estas ventanas: los spreads pueden ampliarse y el precio puede saltar.", CFD["es"]],
    }
    # 7. election
    S["election"] = {
     "en": ["US election day 🗳️", "Americans vote in the midterm elections today. Results roll in overnight, during the Asian session.",
            "What traders typically watch:", "• The US dollar's reaction as results come in", "• Volatility in US stock indices",
            "• Thin liquidity and wider spreads overnight", "Election nights can bring sudden moves. Size positions with care and check your stops.", CFD["en"]],
     "ms": ["Hari pilihan raya AS 🗳️", "Rakyat Amerika mengundi dalam pilihan raya pertengahan penggal hari ini. Keputusan tiba semalaman, semasa sesi Asia.",
            "Apa yang biasanya dipantau pedagang:", "• Reaksi dolar AS apabila keputusan diumumkan", "• Volatiliti indeks saham AS",
            "• Kecairan nipis dan spread lebih lebar pada waktu malam", "Malam pilihan raya boleh membawa pergerakan mendadak. Tetapkan saiz posisi dengan berhati-hati dan semak stop-loss anda.", CFD["ms"]],
     "ru": ["День выборов в США 🗳️", "Сегодня в США проходят промежуточные выборы. Итоги будут поступать ночью, в азиатскую сессию.",
            "За чем обычно следят трейдеры:", "• Реакция доллара США по мере подсчёта голосов", "• Волатильность фондовых индексов США",
            "• Низкая ликвидность и широкие спреды ночью", "Ночь выборов может принести резкие движения. Аккуратно выбирайте объём позиций и проверьте стопы.", CFD["ru"]],
     "es": ["Día de elecciones en EE. UU. 🗳️", "Hoy EE. UU. vota en las elecciones de mitad de mandato. Los resultados llegan de madrugada, en la sesión asiática.",
            "Lo que suelen vigilar los traders:", "• La reacción del dólar a medida que llegan los resultados", "• La volatilidad de los índices bursátiles de EE. UU.",
            "• Liquidez escasa y spreads más amplios de madrugada", "Las noches electorales pueden traer movimientos bruscos. Ajusta el tamaño de tus posiciones y revisa tus stops.", CFD["es"]],
    }
    # 8. security
    S["account-security"] = {
     "en": ["Hackers placed trades on traders' accounts 🔐",
            "In Japan, attackers used MetaTrader logins stolen from servers that traders had rented, and placed unauthorized trades on client accounts at several brokers. The hosting provider says up to 26,739 servers may have been exposed.",
            "Protect your own account:", "• Use a unique password for every trading account", "• Turn on two-factor authentication or passkeys wherever they're offered",
            "• If you run a VPS, keep it updated and never share its access", "• Check your trade history regularly and report anything you don't recognise",
            "Questions about your OnFin account? Our support team is here to help."],
     "ms": ["Penggodam buat dagangan dalam akaun pedagang 🔐",
            "Di Jepun, penyerang menggunakan log masuk MetaTrader yang dicuri daripada pelayan sewaan pedagang, lalu membuat dagangan tanpa kebenaran dalam akaun pelanggan di beberapa broker. Penyedia hosting menyatakan sehingga 26,739 pelayan mungkin terdedah.",
            "Lindungi akaun anda:", "• Gunakan kata laluan berbeza untuk setiap akaun dagangan", "• Aktifkan pengesahan dua faktor atau passkey jika ditawarkan",
            "• Jika anda menggunakan VPS, sentiasa kemas kininya dan jangan kongsi aksesnya", "• Semak sejarah dagangan secara berkala dan laporkan apa-apa yang tidak dikenali",
            "Ada soalan tentang akaun OnFin anda? Pasukan sokongan kami sedia membantu."],
     "ru": ["Хакеры открывали сделки на счетах трейдеров 🔐",
            "В Японии злоумышленники использовали логины MetaTrader, украденные с арендованных трейдерами серверов, и открывали несанкционированные сделки на счетах клиентов нескольких брокеров. По словам хостинг-провайдера, под угрозой могли оказаться до 26 739 серверов.",
            "Как защитить свой счёт:", "• Используйте уникальный пароль для каждого торгового счёта", "• Включите двухфакторную аутентификацию или passkey, где это возможно",
            "• Если пользуетесь VPS, регулярно обновляйте его и никому не передавайте доступ", "• Регулярно проверяйте историю сделок и сообщайте обо всём подозрительном",
            "Вопросы по счёту OnFin? Наша служба поддержки всегда на связи."],
     "es": ["Hackers operaron en cuentas de traders 🔐",
            "En Japón, unos atacantes usaron accesos de MetaTrader robados de servidores alquilados por traders y abrieron operaciones no autorizadas en cuentas de clientes de varios brokers. El proveedor de hosting indica que hasta 26,739 servidores podrían haber quedado expuestos.",
            "Protege tu cuenta:", "• Usa una contraseña distinta para cada cuenta de trading", "• Activa la verificación en dos pasos o passkeys donde estén disponibles",
            "• Si usas un VPS, mantenlo actualizado y no compartas su acceso", "• Revisa tu historial de operaciones con frecuencia y reporta cualquier cosa que no reconozcas",
            "¿Dudas sobre tu cuenta OnFin? Nuestro equipo de soporte está para ayudarte."],
    }
    # 9. fed december
    S["fed-december"] = {
     "en": ["Could the Fed hike in December? 🤔",
            "The Fed's next decision is on 9 December. With the AI boom keeping the US economy strong, markets are debating whether rates could stay higher for longer, or even rise.",
            "Two reports this month could shape that:", f"• Today: US jobs report (NFP), {t}", f"• Tue 10 Nov: US CPI inflation, {t}",
            "Strong numbers can support the dollar; weak ones can weigh on it.", CFD["en"]],
     "ms": ["Adakah Fed akan naikkan kadar pada Disember? 🤔",
            "Keputusan Fed seterusnya pada 9 Disember. Dengan ledakan AI mengekalkan kekuatan ekonomi AS, pasaran sedang berdebat sama ada kadar akan kekal tinggi lebih lama, atau mungkin naik.",
            "Dua laporan bulan ini boleh menentukannya:", f"• Hari ini: Laporan pekerjaan AS (NFP), {t}", f"• Sel 10 Nov: Inflasi CPI AS, {t}",
            "Data yang kukuh boleh menyokong dolar; data lemah boleh menekannya.", CFD["ms"]],
     "ru": ["Повысит ли ФРС ставку в декабре? 🤔",
            "Следующее решение ФРС 9 декабря. Бум ИИ поддерживает экономику США, и рынок спорит, останутся ли ставки высокими дольше или даже вырастут.",
            "Два отчёта этого месяца могут всё решить:", f"• Сегодня: отчёт по занятости в США (NFP), {t}", f"• Вт, 10 ноября: инфляция CPI в США, {t}",
            "Сильные данные могут поддержать доллар, слабые могут на него давить.", CFD["ru"]],
     "es": ["¿Subirá la Fed los tipos en diciembre? 🤔",
            "La próxima decisión de la Fed es el 9 de diciembre. Con el auge de la IA sosteniendo la economía de EE. UU., el mercado debate si los tipos seguirán altos más tiempo, o incluso subirán.",
            "Dos datos de este mes pueden decidirlo:", f"• Hoy: informe de empleo de EE. UU. (NFP), {t}", f"• Mar 10 nov: inflación IPC de EE. UU., {t}",
            "Datos fuertes pueden apoyar al dólar; datos débiles pueden pesar sobre él.", CFD["es"]],
    }
    # 10. week ahead 2
    S["week-ahead-2"] = {
     "en": ["This week's market movers 📅", f"• Tue 10 Nov: US CPI inflation, {t}", f"• Fri 13 Nov: US producer prices (PPI), {t}",
            "CPI is the big one: a hotter or cooler number than expected can move USD pairs and gold within seconds.", CFD["en"]],
     "ms": ["Penggerak pasaran minggu ini 📅", f"• Sel 10 Nov: Inflasi CPI AS, {t}", f"• Jum 13 Nov: Harga pengeluar AS (PPI), {t}",
            "CPI yang paling penting: angka lebih tinggi atau lebih rendah daripada jangkaan boleh menggerakkan pasangan USD dan emas dalam beberapa saat.", CFD["ms"]],
     "ru": ["Что двигает рынок на этой неделе 📅", f"• Вт, 10 ноября: инфляция CPI в США, {t}", f"• Пт, 13 ноября: цены производителей в США (PPI), {t}",
            "Главное событие: CPI. Цифра выше или ниже прогноза может за секунды сдвинуть пары с долларом и золото.", CFD["ru"]],
     "es": ["Lo que moverá el mercado esta semana 📅", f"• Mar 10 nov: inflación IPC de EE. UU., {t}", f"• Vie 13 nov: precios al productor de EE. UU. (PPI), {t}",
            "El IPC es el dato clave: una cifra mayor o menor de lo esperado puede mover los pares con USD y el oro en segundos.", CFD["es"]],
    }
    # 11. thanksgiving
    S["thanksgiving"] = {
     "en": ["Thin markets ahead: US Thanksgiving 🦃", "• Thu 26 Nov: US stock markets closed", "• Fri 27 Nov: early close for US stock markets",
            "Forex stays open, but with many US traders away, liquidity thins out. Expect wider spreads, more slippage and the odd sudden spike.",
            "Consider smaller positions and limit orders.", link(ch, "How to avoid slippage", "what-is-slippage-in-forex-and-how-to-avoid-it"), CFD["en"]],
     "ms": ["Pasaran nipis menjelang Thanksgiving AS 🦃", "• Kha 26 Nov: Pasaran saham AS ditutup", "• Jum 27 Nov: Pasaran saham AS tutup awal",
            "Forex kekal dibuka, tetapi dengan ramai pedagang AS bercuti, kecairan menipis. Jangkakan spread lebih lebar, lebih banyak slippage dan lonjakan mendadak sekali-sekala.",
            "Pertimbangkan posisi lebih kecil dan pesanan had (limit order).", link(ch, "Cara elak slippage", "what-is-slippage-in-forex-and-how-to-avoid-it"), CFD["ms"]],
     "ru": ["Тонкий рынок: День благодарения в США 🦃", "• Чт, 26 ноября: биржи США закрыты", "• Пт, 27 ноября: сокращённый день на биржах США",
            "Форекс продолжает работать, но многие американские трейдеры отдыхают, и ликвидность падает. Ждите более широких спредов, больше проскальзываний и внезапных всплесков.",
            "Подумайте о меньшем объёме позиций и лимитных ордерах.", link(ch, "Как избежать проскальзывания", "what-is-slippage-in-forex-and-how-to-avoid-it"), CFD["ru"]],
     "es": ["Mercados finos: Acción de Gracias en EE. UU. 🦃", "• Jue 26 nov: bolsas de EE. UU. cerradas", "• Vie 27 nov: cierre anticipado en las bolsas de EE. UU.",
            "El forex sigue abierto, pero con muchos traders de EE. UU. fuera, la liquidez baja. Espera spreads más amplios, más slippage y algún pico repentino.",
            "Considera posiciones más pequeñas y órdenes limitadas.", link(ch, "Cómo evitar el slippage", "what-is-slippage-in-forex-and-how-to-avoid-it"), CFD["es"]],
    }
    lines = list(S[story][lang])
    if ch == "ig":
        lines.insert(len(lines) - 1 if lines[-1] in (CFD["en"], LEV["en"]) else len(lines), TAGS)
    return lines


def to_html(lines, ch):
    out = []
    for i, l in enumerate(lines):
        l = l.replace("&", "&amp;")
        out.append(f"<p><strong>{l}</strong></p>" if (i == 0 and ch != "ig") else f"<p>{l}</p>")
    return "".join(out)
