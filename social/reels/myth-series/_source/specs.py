"""Myth vs Fact episodes 02 to 05: voiceover segments and on-screen copy per language.
Segments: plain string = shown as spoken; (display, spoken) = digits on screen, words in the voiceover; {"m": name} = scene marker.
Every episode has the markers fact, proof, take and follow; the rest drive its proof scene."""
import re

M = lambda n: {"m": n}
VOICE = {"en": 446, "ms": 402, "ru": 131, "es": 1418}
TAG = "[confident, clear voice]"
HYPO = {"en": "Hypothetical example", "ms": "Contoh hipotetikal", "ru": "Гипотетический пример", "es": "Ejemplo hipotético"}
FOLLOW = {"en": "Follow for more", "ms": "Ikuti untuk lagi", "ru": "Подписывайтесь", "es": "Síguenos para más"}
HANDLE = {"en": "@onfinkm", "ms": "onfin.io", "ru": "onfin.io", "es": "onfin.io"}
LABEL = {"en": ("Myth", "Fact"), "ms": ("Mitos", "Fakta"), "ru": ("Миф", "Факт"), "es": ("Mito", "Realidad")}
DISC = {
 "en": "Not investment advice. CFDs are high-risk; you may lose money.",
 "ms": "Bukan nasihat pelaburan. CFD berisiko tinggi; anda mungkin kehilangan wang.",
 "ru": "Не является инвестиционной рекомендацией. CFD относятся к высокорисковым инструментам; вы можете потерять деньги.",
 "es": "No es asesoramiento de inversión. Los CFD son de alto riesgo; puedes perder dinero.",
}
ILLUS = {"en": "Illustrative example.", "ms": "Contoh ilustrasi.", "ru": "Иллюстративный пример.", "es": "Ejemplo ilustrativo."}
KICK = {"en": "Myth #0{}", "ms": "Mitos #0{}", "ru": "Миф №{}", "es": "Mito #0{}"}
px = lambda lang, v: (("{:.4f}".format(v)).replace(".", ",") if lang == "ru" else "{:.4f}".format(v))

EPS = {}

# 02: a stop loss guarantees your exit price
EPS[2] = dict(
 seg={
  "en": ["Myth: a stop loss guarantees your exit price.", M("fact"), "Fact: it doesn't.",
         M("proof"), "When price hits your stop,", M("becomes"), "it becomes a market order,", M("next"), "filled at the next available price.",
         M("most"), "Most of the time, that's close to your stop.",
         M("gap"), "But when markets gap, after big news or over the weekend, the next price can be far away.",
         M("say"), "Say you set your stop", ("50 pips", "fifty pips"), "away.",
         M("opens"), "Over the weekend, big news hits, and the market reopens", ("80 pips", "eighty pips"), "lower.",
         M("fills"), "Your stop fills there,", ("30 pips", "thirty pips"), "worse than planned.",
         M("take"), "So size every trade as if your stop can slip.", M("follow"), "Follow OnFin for more."],
  "ms": ["Mitos: stop loss menjamin harga keluar anda.", M("fact"), "Fakta: tidak.",
         M("proof"), "Apabila harga mencapai stop anda,", M("becomes"), "ia menjadi pesanan pasaran,", M("next"), "dilaksanakan pada harga tersedia seterusnya.",
         M("most"), "Selalunya, harga itu dekat dengan stop anda.",
         M("gap"), "Tetapi apabila pasaran melompat, selepas berita besar atau pada hujung minggu, harga seterusnya boleh jauh.",
         M("say"), "Katakan stop anda", ("50 pip", "lima puluh pip"), "dari harga.",
         M("opens"), "Pada hujung minggu, berita besar keluar, dan pasaran dibuka semula", ("80 pip", "lapan puluh pip"), "lebih rendah.",
         M("fills"), "Stop anda dilaksanakan di situ,", ("30 pip", "tiga puluh pip"), "lebih teruk daripada yang dirancang.",
         M("take"), "Jadi tetapkan saiz setiap dagangan seakan stop anda boleh tergelincir.", M("follow"), "Ikuti OnFin untuk lagi."],
  "ru": ["Миф: стоп-лосс гарантирует цену выхода.", M("fact"), "Факт: нет.",
         M("proof"), "Когда цена доходит до стопа,", M("becomes"), "он превращается в рыночный ордер", M("next"), "и исполняется по следующей доступной цене.",
         M("most"), "Обычно она рядом с вашим стопом.",
         M("gap"), "Но когда рынок открывается с гэпом, после важных новостей или выходных, следующая цена может быть далеко.",
         M("say"), "Допустим, ваш стоп в", ("50 пунктах", "пятидесяти пунктах"), "от цены.",
         M("opens"), "За выходные выходят важные новости, и рынок открывается на", ("80 пунктов", "восемьдесят пунктов"), "ниже.",
         M("fills"), "Стоп исполняется там, на", ("30 пунктов", "тридцать пунктов"), "хуже, чем планировалось.",
         M("take"), "Поэтому выбирайте объём каждой сделки так, как будто стоп может проскользнуть.", M("follow"), "Подписывайтесь на OnFin."],
  "es": ["Mito: un stop loss garantiza tu precio de salida.", M("fact"), "Realidad: no.",
         M("proof"), "Cuando el precio toca tu stop,", M("becomes"), "se convierte en una orden de mercado", M("next"), "y se ejecuta al siguiente precio disponible.",
         M("most"), "Casi siempre, ese precio está cerca de tu stop.",
         M("gap"), "Pero cuando el mercado abre con un gap, tras una gran noticia o el fin de semana, el siguiente precio puede estar lejos.",
         M("say"), "Supón que pones tu stop a", ("50 pips", "cincuenta pips"), "de distancia.",
         M("opens"), "El fin de semana llega una gran noticia, y el mercado reabre", ("80 pips", "ochenta pips"), "más abajo.",
         M("fills"), "Tu stop se ejecuta ahí,", ("30 pips", "treinta pips"), "peor de lo previsto.",
         M("take"), "Así que ajusta el tamaño de cada operación como si tu stop pudiera deslizarse.", M("follow"), "Sigue a OnFin para más."],
 },
 txt={
  "en": dict(myth_text="A stop loss guarantees your exit price.", fact_text="When it triggers, a stop becomes a *market order*.",
             flow=["Price hits your stop", "It becomes a market order", "Filled at the next available price"], usually="Usually filled near your stop",
             entry="Entry", stop="Your stop", gap="Weekend gap", reopen="Reopens", slip="Slippage: 30 pips", fri="Fri", mon="Mon",
             takeaway="Size every trade\nas if your\n*stop can slip*."),
  "ms": dict(myth_text="Stop loss menjamin harga keluar anda.", fact_text="Apabila dicetuskan, stop menjadi *pesanan pasaran*.",
             flow=["Harga mencapai stop anda", "Ia menjadi pesanan pasaran", "Dilaksanakan pada harga tersedia seterusnya"], usually="Biasanya dekat dengan stop anda",
             entry="Kemasukan", stop="Stop anda", gap="Jurang hujung minggu", reopen="Dibuka semula", slip="Slippage: 30 pip", fri="Jum", mon="Isn",
             takeaway="Tetapkan saiz\ndagangan seakan\n*stop boleh\ntergelincir*."),
  "ru": dict(myth_text="Стоп-лосс гарантирует цену выхода.", fact_text="При срабатывании стоп становится *рыночным ордером*.",
             flow=["Цена дошла до стопа", "Он становится рыночным ордером", "Исполнение по следующей доступной цене"], usually="Обычно рядом со стопом",
             entry="Вход", stop="Ваш стоп", gap="Гэп за выходные", reopen="Открытие", slip="Проскальзывание: 30 пунктов", fri="Пт", mon="Пн",
             takeaway="Выбирайте объём\nтак, будто\n*стоп может\nпроскользнуть*."),
  "es": dict(myth_text="Un stop loss garantiza tu precio de salida.", fact_text="Al activarse, el stop se convierte en una *orden de mercado*.",
             flow=["El precio toca tu stop", "Se convierte en orden de mercado", "Se ejecuta al siguiente precio disponible"], usually="Normalmente cerca de tu stop",
             entry="Entrada", stop="Tu stop", gap="Gap del fin de semana", reopen="Reapertura", slip="Deslizamiento: 30 pips", fri="Vie", mon="Lun",
             takeaway="Opera como si\ntu *stop pudiera\ndeslizarse*."),
 },
 cover={"en": "A stop loss\nguarantees\nyour *exit*?", "ms": "Stop loss\nmenjamin\nharga *keluar*?", "ru": "Стоп-лосс\nгарантирует\n*выход*?", "es": "¿El stop loss\ngarantiza tu\n*salida*?"},
)

# 03: adding to a losing trade lowers your risk
EPS[3] = dict(
 seg={
  "en": ["Myth: adding to a losing trade lowers your risk.", M("fact"), "Fact: it lowers your average price, but it raises your risk.",
         M("proof"), "Say you buy one lot of", ("EUR/USD.", "euro dollar."),
         M("drop"), "It drops", ("50 pips,", "fifty pips,"), "so you buy a second lot.",
         M("avg"), "Your average price improves by", ("25 pips.", "twenty five pips."),
         M("but"), "But you now hold two lots, so every pip costs", ("$20", "twenty dollars"), "instead of", ("$10.", "ten."),
         M("fall"), "If price falls another", ("50 pips,", "fifty pips,"), "you're down", ("$1,500", "fifteen hundred dollars"), "instead of", ("$1,000.", "one thousand."),
         M("take"), "Decide your exit before you enter.", M("follow"), "Follow OnFin for more."],
  "ms": ["Mitos: menambah posisi pada dagangan yang rugi mengurangkan risiko anda.", M("fact"), "Fakta: ia merendahkan harga purata anda, tetapi menaikkan risiko anda.",
         M("proof"), "Katakan anda beli satu lot", ("EUR/USD.", "euro dolar."),
         M("drop"), "Harga jatuh", ("50 pip,", "lima puluh pip,"), "jadi anda beli lot kedua.",
         M("avg"), "Harga purata anda bertambah baik sebanyak", ("25 pip.", "dua puluh lima pip."),
         M("but"), "Tetapi kini anda memegang dua lot, jadi setiap pip bernilai", ("$20", "dua puluh dolar"), "dan bukan", ("$10.", "sepuluh."),
         M("fall"), "Jika harga jatuh lagi", ("50 pip,", "lima puluh pip,"), "anda rugi", ("$1,500", "seribu lima ratus dolar"), "dan bukan", ("$1,000.", "seribu."),
         M("take"), "Tentukan titik keluar sebelum anda masuk.", M("follow"), "Ikuti OnFin untuk lagi."],
  "ru": ["Миф: если докупать убыточную позицию, риск снижается.", M("fact"), "Факт: снижается средняя цена, но риск растёт.",
         M("proof"), "Допустим, вы купили один лот", ("EUR/USD.", "евро доллар."),
         M("drop"), "Цена упала на", ("50 пунктов,", "пятьдесят пунктов,"), "и вы докупили второй лот.",
         M("avg"), "Средняя цена улучшилась на", ("25 пунктов.", "двадцать пять пунктов."),
         M("but"), "Но теперь у вас два лота, и каждый пункт стоит", ("$20", "двадцать долларов"), "вместо", ("$10.", "десяти."),
         M("fall"), "Если цена упадёт ещё на", ("50 пунктов,", "пятьдесят пунктов,"), "убыток составит", ("$1 500", "полторы тысячи долларов"), "вместо", ("$1 000.", "тысячи."),
         M("take"), "Решайте, где выйти, до того как войти.", M("follow"), "Подписывайтесь на OnFin."],
  "es": ["Mito: sumar a una operación perdedora reduce tu riesgo.", M("fact"), "Realidad: baja tu precio promedio, pero sube tu riesgo.",
         M("proof"), "Supón que compras un lote de", ("EUR/USD.", "euro dólar."),
         M("drop"), "Cae", ("50 pips,", "cincuenta pips,"), "y compras un segundo lote.",
         M("avg"), "Tu precio promedio mejora", ("25 pips.", "veinticinco pips."),
         M("but"), "Pero ahora tienes dos lotes, así que cada pip vale", ("$20", "veinte dólares"), "en vez de", ("$10.", "diez."),
         M("fall"), "Si el precio cae otros", ("50 pips,", "cincuenta pips,"), "pierdes", ("$1,500", "mil quinientos dólares"), "en vez de", ("$1,000.", "mil."),
         M("take"), "Decide tu salida antes de entrar.", M("follow"), "Sigue a OnFin para más."],
 },
 txt={
  "en": dict(myth_text="Adding to a losing trade lowers your risk.", fact_text="It lowers your average price. It *raises* your risk.",
             lot1="Lot 1 bought", lot2="Lot 2 bought", avg="Average price", perpip="Per pip", hold1="Kept 1 lot", added="Added a lot",
             down="Price falls another 50 pips", m10="$10", m20="$20", l1000="-$1,000", l1500="-$1,500", takeaway="Decide your\n*exit* before\nyou enter."),
  "ms": dict(myth_text="Menambah posisi pada dagangan rugi mengurangkan risiko anda.", fact_text="Harga purata turun. Risiko anda *naik*.",
             lot1="Lot 1 dibeli", lot2="Lot 2 dibeli", avg="Harga purata", perpip="Setiap pip", hold1="Kekal 1 lot", added="Tambah 1 lot",
             down="Harga jatuh lagi 50 pip", m10="$10", m20="$20", l1000="-$1,000", l1500="-$1,500", takeaway="Tentukan titik\n*keluar* sebelum\nanda masuk."),
  "ru": dict(myth_text="Докупать убыточную позицию значит снижать риск.", fact_text="Средняя цена ниже. Риск *выше*.",
             lot1="Куплен лот 1", lot2="Куплен лот 2", avg="Средняя цена", perpip="Один пункт", hold1="Один лот", added="Докупили лот",
             down="Цена падает ещё на 50 пунктов", m10="$10", m20="$20", l1000="-$1 000", l1500="-$1 500", takeaway="Решайте,\nгде *выйти*,\nдо входа."),
  "es": dict(myth_text="Sumar a una operación perdedora reduce tu riesgo.", fact_text="Baja tu precio promedio. *Sube* tu riesgo.",
             lot1="Lote 1 comprado", lot2="Lote 2 comprado", avg="Precio promedio", perpip="Por pip", hold1="Con 1 lote", added="Sumando 1 lote",
             down="El precio cae otros 50 pips", m10="$10", m20="$20", l1000="-$1,000", l1500="-$1,500", takeaway="Decide tu\n*salida* antes\nde entrar."),
 },
 cover={"en": "Adding to a\nloser lowers\nyour *risk*?", "ms": "Tambah posisi\nrugi kurangkan\n*risiko*?", "ru": "Докупать\nубыток значит\nснижать *риск*?", "es": "¿Sumar a una\nperdedora baja\ntu *riesgo*?"},
)

# 04: a high win rate means a winning strategy
EPS[4] = dict(
 seg={
  "en": ["Myth: a high win rate means a winning strategy.", M("fact"), "Fact: it depends on how much you win, compared with how much you lose.",
         M("proof"), "Trader A risks", ("$150", "one hundred fifty dollars"), "to make", ("$50.", "fifty."),
         M("aneed"), "They need to win", ("75%", "seventy five percent"), "of trades just to break even.",
         M("b"), "Trader B risks", ("$100", "one hundred dollars"), "to make", ("$200.", "two hundred."),
         M("bneed"), "They break even winning only", ("33%.", "thirty three percent."),
         M("take"), "Look at your win rate and your reward to risk together.", M("follow"), "Follow OnFin for more."],
  "ms": ["Mitos: kadar menang yang tinggi bermakna strategi yang menang.", M("fact"), "Fakta: ia bergantung pada berapa banyak anda menang, berbanding berapa banyak anda rugi.",
         M("proof"), "Pedagang A merisikokan", ("$150", "seratus lima puluh dolar"), "untuk dapat", ("$50.", "lima puluh."),
         M("aneed"), "Dia perlu menang", ("75%", "tujuh puluh lima peratus"), "dagangan hanya untuk pulang modal.",
         M("b"), "Pedagang B merisikokan", ("$100", "seratus dolar"), "untuk dapat", ("$200.", "dua ratus."),
         M("bneed"), "Dia pulang modal dengan menang hanya", ("33%.", "tiga puluh tiga peratus."),
         M("take"), "Lihat kadar menang dan nisbah ganjaran kepada risiko bersama.", M("follow"), "Ikuti OnFin untuk lagi."],
  "ru": ["Миф: высокий процент прибыльных сделок означает прибыльную стратегию.", M("fact"), "Факт: всё зависит от того, сколько вы зарабатываете и сколько теряете.",
         M("proof"), "Трейдер А рискует", ("$150,", "ста пятьюдесятью долларами,"), "чтобы заработать", ("$50.", "пятьдесят."),
         M("aneed"), "Ему нужно выигрывать", ("75%", "семьдесят пять процентов"), "сделок, просто чтобы выйти в ноль.",
         M("b"), "Трейдер Б рискует", ("$100,", "ста долларами,"), "чтобы заработать", ("$200.", "двести."),
         M("bneed"), "Он выходит в ноль, выигрывая всего", ("33%.", "тридцать три процента."),
         M("take"), "Смотрите на процент выигрышей и соотношение прибыли к риску вместе.", M("follow"), "Подписывайтесь на OnFin."],
  "es": ["Mito: una alta tasa de acierto significa una estrategia ganadora.", M("fact"), "Realidad: depende de cuánto ganas, comparado con cuánto pierdes.",
         M("proof"), "El trader A arriesga", ("$150", "ciento cincuenta dólares"), "para ganar", ("$50.", "cincuenta."),
         M("aneed"), "Necesita acertar el", ("75%", "setenta y cinco por ciento"), "de sus operaciones solo para quedar a mano.",
         M("b"), "El trader B arriesga", ("$100", "cien dólares"), "para ganar", ("$200.", "doscientos."),
         M("bneed"), "Queda a mano acertando solo el", ("33%.", "treinta y tres por ciento."),
         M("take"), "Mira tu tasa de acierto y tu relación riesgo beneficio juntas.", M("follow"), "Sigue a OnFin para más."],
 },
 txt={
  "en": dict(myth_text="A high win rate means a winning strategy.", fact_text="It depends on how much you *win* versus how much you *lose*.",
             ta="Trader A", tb="Trader B", risk="Risk", reward="Reward", need="Win rate needed to break even", note="Hypothetical, before trading costs",
             takeaway="Win rate and\n*reward to risk*\ngo together."),
  "ms": dict(myth_text="Kadar menang yang tinggi bermakna strategi yang menang.", fact_text="Ia bergantung pada berapa anda *menang* berbanding berapa anda *rugi*.",
             ta="Pedagang A", tb="Pedagang B", risk="Risiko", reward="Ganjaran", need="Kadar menang untuk pulang modal", note="Hipotetikal, sebelum kos dagangan",
             takeaway="Kadar menang\ndan *ganjaran\nkepada risiko*\nberjalan bersama."),
  "ru": dict(myth_text="Высокий процент выигрышей значит прибыльная стратегия.", fact_text="Всё зависит от того, сколько вы *зарабатываете* и сколько *теряете*.",
             ta="Трейдер А", tb="Трейдер Б", risk="Риск", reward="Прибыль", need="Выигрышей нужно, чтобы выйти в ноль", note="Гипотетический пример, без издержек",
             takeaway="Смотрите на\nпроцент выигрышей\nи *прибыль к риску*\nвместе."),
  "es": dict(myth_text="Una alta tasa de acierto significa una estrategia ganadora.", fact_text="Depende de cuánto *ganas* comparado con cuánto *pierdes*.",
             ta="Trader A", tb="Trader B", risk="Riesgo", reward="Beneficio", need="Tasa de acierto para quedar a mano", note="Hipotético, antes de costos de trading",
             takeaway="Tasa de acierto\ny *riesgo beneficio*\nvan juntas."),
 },
 cover={"en": "High win rate,\nwinning\n*strategy*?", "ms": "Kadar menang\ntinggi, strategi\n*menang*?", "ru": "Много\nвыигрышей,\nзначит *прибыль*?", "es": "¿Mucho acierto,\nestrategia\n*ganadora*?"},
)

# 05: a licence number on the website means the broker is regulated
EPS[5] = dict(
 seg={
  "en": ["Myth: a licence number on a broker's website means it's regulated.", M("fact"), "Fact: only the regulator's own register can confirm it.",
         M("proof"), "Scam sites copy real licence numbers from real firms.", M("check"), "So check it yourself.",
         M("s1"), "Go to the regulator's official website, typed in yourself, not from a link.", M("s2"), "Search its register.",
         M("s3"), "The company name, licence number and website should all match.",
         M("take"), "If anything is different, walk away.", M("follow"), "Follow OnFin for more."],
  "ms": ["Mitos: nombor lesen di laman web broker bermakna ia dikawal selia.", M("fact"), "Fakta: hanya daftar pengawal selia sendiri yang boleh mengesahkannya.",
         M("proof"), "Laman penipuan menyalin nombor lesen sebenar daripada syarikat sebenar.", M("check"), "Jadi semak sendiri.",
         M("s1"), "Pergi ke laman web rasmi pengawal selia, taip sendiri, bukan melalui pautan.", M("s2"), "Cari dalam daftarnya.",
         M("s3"), "Nama syarikat, nombor lesen dan laman web mesti sepadan.",
         M("take"), "Jika ada yang berbeza, jangan teruskan.", M("follow"), "Ikuti OnFin untuk lagi."],
  "ru": ["Миф: номер лицензии на сайте брокера означает, что он регулируется.", M("fact"), "Факт: подтвердить это может только реестр самого регулятора.",
         M("proof"), "Мошеннические сайты копируют настоящие номера лицензий настоящих компаний.", M("check"), "Поэтому проверяйте сами.",
         M("s1"), "Откройте официальный сайт регулятора, введя адрес вручную, а не по ссылке.", M("s2"), "Найдите компанию в его реестре.",
         M("s3"), "Название компании, номер лицензии и сайт должны совпадать.",
         M("take"), "Если что-то отличается, уходите.", M("follow"), "Подписывайтесь на OnFin."],
  "es": ["Mito: un número de licencia en la web de un bróker significa que está regulado.", M("fact"), "Realidad: solo el registro del propio regulador puede confirmarlo.",
         M("proof"), "Los sitios fraudulentos copian números de licencia reales de empresas reales.", M("check"), "Así que verifícalo tú mismo.",
         M("s1"), "Entra al sitio oficial del regulador, escribiendo tú la dirección, no desde un enlace.", M("s2"), "Busca en su registro.",
         M("s3"), "El nombre de la empresa, el número de licencia y el sitio web deben coincidir.",
         M("take"), "Si algo no coincide, aléjate.", M("follow"), "Sigue a OnFin para más."],
 },
 txt={
  "en": dict(myth_text="A licence number on the website means the broker is regulated.", fact_text="Only the regulator's own *register* can confirm it.",
             real="Real firm", clone="Clone site", lic="Licence no. 12345", same="Same number. Different company.",
             steps=["Open the regulator's site yourself", "Search its register", "Name, licence and website must match"], takeaway="If anything\nis different,\n*walk away*."),
  "ms": dict(myth_text="Nombor lesen di laman web bermakna broker itu dikawal selia.", fact_text="Hanya *daftar* pengawal selia sendiri yang boleh mengesahkannya.",
             real="Syarikat sebenar", clone="Laman klon", lic="No. lesen 12345", same="Nombor sama. Syarikat berbeza.",
             steps=["Buka laman pengawal selia sendiri", "Cari dalam daftarnya", "Nama, lesen dan laman web mesti sepadan"], takeaway="Jika ada yang\nberbeza, *jangan\nteruskan*."),
  "ru": dict(myth_text="Номер лицензии на сайте значит, что брокер регулируется.", fact_text="Подтвердить это может только *реестр* самого регулятора.",
             real="Настоящая компания", clone="Сайт-клон", lic="Лицензия № 12345", same="Номер тот же. Компания другая.",
             steps=["Откройте сайт регулятора сами", "Найдите компанию в реестре", "Название, лицензия и сайт должны совпадать"], takeaway="Если что-то\nотличается,\n*уходите*."),
  "es": dict(myth_text="Un número de licencia en la web significa que el bróker está regulado.", fact_text="Solo el *registro* del propio regulador puede confirmarlo.",
             real="Empresa real", clone="Sitio clon", lic="Licencia n.º 12345", same="Mismo número. Otra empresa.",
             steps=["Abre tú mismo el sitio del regulador", "Busca en su registro", "Nombre, licencia y web deben coincidir"], takeaway="Si algo no\ncoincide,\n*aléjate*."),
 },
 cover={"en": "A licence\nnumber means\n*regulated*?", "ms": "Nombor lesen\nbermakna\n*dikawal selia*?", "ru": "Номер\nлицензии значит\n*регулируется*?", "es": "¿Número de\nlicencia significa\n*regulado*?"},
)


def split_spoken(s):
    """Words as the aligner returns them: whitespace, and after hyphens ("ten-year" -> "ten-", "year")."""
    return [p for w in s.split() for p in re.split(r"(?<=-)", w) if p]


def tokens(ep, lang):
    out, marks, spoken = [], {}, []
    for s in EPS[ep]["seg"][lang]:
        if isinstance(s, dict):
            marks[s["m"]] = len(out); continue
        if isinstance(s, tuple):
            d, sp = s; out.append((d, len(split_spoken(sp)))); spoken.append(sp)
        else:
            for w in s.split(): out.append((w, len(split_spoken(w))))
            spoken.append(s)
    return out, marks, TAG + " " + " ".join(spoken)


def txt(ep, lang):
    T = dict(EPS[ep]["txt"][lang])
    T.update(kicker=KICK[lang].format(ep), myth=LABEL[lang][0], fact=LABEL[lang][1], hypo=HYPO[lang], follow=FOLLOW[lang], handle=HANDLE[lang],
             disclaimer=(ILLUS[lang] if ep == 5 else HYPO[lang] + ".") + " " + DISC[lang])
    if ep == 2:
        T.update(p_entry=px(lang, 1.1000), p_stop=px(lang, 1.0950), p_open=px(lang, 1.0920))
    if ep == 3:
        T.update(p1=px(lang, 1.1000), p2=px(lang, 1.0950), pavg=px(lang, 1.0975))
    return T


if __name__ == "__main__":
    for ep in EPS:
        for lang in EPS[ep]["seg"]:
            toks, marks, vo = tokens(ep, lang)
            bad = re.findall("[–—!]", vo + str(EPS[ep]["txt"][lang]) + EPS[ep]["cover"][lang])
            need = {"fact", "proof", "take", "follow"} - set(marks)
            print(ep, lang, len(split_spoken(vo)) - 3, "words", "bad" if bad or need else "ok", bad, need)
            open(f"vo{ep:02d}_{lang}.txt", "w", encoding="utf-8").write(vo)
