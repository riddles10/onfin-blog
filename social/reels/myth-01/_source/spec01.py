"""Myth #01: lose 50%, gain 50%, back to even? Script, on-screen copy and caption mapping per language.
Segments: plain string = words shown as spoken; (display, spoken) = digits on screen, words in the voiceover;
{"m": name} = scene marker at the next word."""
M = lambda n: {"m": n}

VOICE = {"en": 446, "ms": 402, "ru": 131, "es": 1418}  # Logan Scott, Azman Hakim, Mikhail Orlov, Ruben Salcedo
TAG = {"en": "[confident, clear voice]", "ms": "[confident, clear voice]", "ru": "[confident, clear voice]", "es": "[confident, clear voice]"}

SEG = {
 "en": ["Myth: if you lose", ("50%,", "fifty percent,"), "a", ("50%", "fifty percent"), "gain gets you back to even.",
        M("fact"), "Fact: it doesn't.",
        M("start"), "Say you start with", ("$1,000.", "one thousand dollars."),
        M("lose"), "Lose", ("50%,", "fifty percent,"), "and you have", ("$500.", "five hundred."),
        M("gain50"), "Gain", ("50%", "fifty percent"), "on that, and you only get back to", ("$750.", "seven hundred and fifty."),
        M("need100"), "To get back to", ("$1,000,", "one thousand,"), "you need a", ("100%", "one hundred percent"), "gain.",
        M("bigger"), "And the bigger the loss, the steeper the climb.",
        M("lose75"), "Lose", ("75%,", "seventy five percent,"), "and you need", ("300%", "three hundred percent"), "to break even.",
        M("protect"), "Protect your capital first.",
        M("follow"), "Follow OnFin for more."],
 "ms": ["Mitos: jika anda rugi", ("50%,", "lima puluh peratus,"), "untung", ("50%", "lima puluh peratus"), "akan membawa anda kembali ke modal asal.",
        M("fact"), "Fakta: tidak.",
        M("start"), "Katakan anda bermula dengan", ("$1,000.", "seribu dolar."),
        M("lose"), "Rugi", ("50%,", "lima puluh peratus,"), "tinggal", ("$500.", "lima ratus."),
        M("gain50"), "Untung", ("50%", "lima puluh peratus"), "daripada itu, anda hanya kembali ke", ("$750.", "tujuh ratus lima puluh."),
        M("need100"), "Untuk kembali ke", ("$1,000,", "seribu,"), "anda perlukan keuntungan", ("100%.", "seratus peratus."),
        M("bigger"), "Semakin besar kerugian, semakin sukar untuk pulih.",
        M("lose75"), "Rugi", ("75%,", "tujuh puluh lima peratus,"), "dan anda perlukan", ("300%", "tiga ratus peratus"), "untuk kembali ke modal asal.",
        M("protect"), "Lindungi modal anda dahulu.",
        M("follow"), "Ikuti OnFin untuk lagi."],
 "ru": ["Миф: если вы потеряли", ("50%,", "пятьдесят процентов,"), "то прибыль в", ("50%", "пятьдесят процентов"), "вернёт вас к исходной сумме.",
        M("fact"), "Факт: не вернёт.",
        M("start"), "Допустим, у вас", ("$1 000.", "тысяча долларов."),
        M("lose"), "Минус", ("50%,", "пятьдесят процентов,"), "и остаётся", ("$500.", "пятьсот."),
        M("gain50"), "Плюс", ("50%", "пятьдесят процентов"), "от них, и у вас только", ("$750.", "семьсот пятьдесят."),
        M("need100"), "Чтобы вернуться к", ("$1 000,", "тысяче,"), "нужно заработать", ("100%.", "сто процентов."),
        M("bigger"), "И чем больше убыток, тем сложнее отыграться.",
        M("lose75"), "Потеряли", ("75%,", "семьдесят пять процентов,"), "и для возврата к исходной сумме нужно уже", ("300%.", "триста процентов."),
        M("protect"), "Сначала защитите капитал.",
        M("follow"), "Подписывайтесь на OnFin."],
 "es": ["Mito: si pierdes el", ("50%,", "cincuenta por ciento,"), "una ganancia del", ("50%", "cincuenta por ciento"), "te devuelve al punto de partida.",
        M("fact"), "Realidad: no es así.",
        M("start"), "Supón que empiezas con", ("$1,000.", "mil dólares."),
        M("lose"), "Pierdes el", ("50%", "cincuenta por ciento"), "y te quedan", ("$500.", "quinientos."),
        M("gain50"), "Ganas el", ("50%", "cincuenta por ciento"), "sobre eso y solo llegas a", ("$750.", "setecientos cincuenta."),
        M("need100"), "Para volver a", ("$1,000,", "mil,"), "necesitas una ganancia del", ("100%.", "cien por ciento."),
        M("bigger"), "Y cuanto mayor la pérdida, más difícil la recuperación.",
        M("lose75"), "Si pierdes el", ("75%,", "setenta y cinco por ciento,"), "necesitas un", ("300%", "trescientos por ciento"), "para volver al punto de partida.",
        M("protect"), "Primero protege tu capital.",
        M("follow"), "Sigue a OnFin para más."],
}

TXT = {
 "en": dict(kicker="Myth #01", myth="Myth", fact="Fact", myth_text="Lose 50%, then gain 50%, and you're back to even.",
            fact_text="You need *+100%* to recover.", start="Start", lose="Lose 50%", gain50="Gain 50%", gain100="Gain 100%",
            short="Still $250 short", hypo="Hypothetical example", loss="Loss", need="Gain needed to recover",
            takeaway="Protect your\n*capital* first.", follow="Follow for more", handle="@onfinkm", money=lambda v: "${:,}".format(v),
            disclaimer="Hypothetical example. Not investment advice. CFDs are high-risk; you may lose money."),
 "ms": dict(kicker="Mitos #01", myth="Mitos", fact="Fakta", myth_text="Rugi 50%, kemudian untung 50%, dan anda kembali ke modal asal.",
            fact_text="Anda perlu *+100%* untuk pulih.", start="Mula", lose="Rugi 50%", gain50="Untung 50%", gain100="Untung 100%",
            short="Masih kurang $250", hypo="Contoh hipotetikal", loss="Kerugian", need="Keuntungan diperlukan untuk pulih",
            takeaway="Lindungi\n*modal* anda\ndahulu.", follow="Ikuti untuk lagi", handle="onfin.io", money=lambda v: "${:,}".format(v),
            disclaimer="Contoh hipotetikal. Bukan nasihat pelaburan. CFD berisiko tinggi; anda mungkin kehilangan wang."),
 "ru": dict(kicker="Миф №1", myth="Миф", fact="Факт", myth_text="Потеряли 50%, потом заработали 50%, и вы вернулись к исходной сумме.",
            fact_text="Чтобы отыграться, нужно *+100%*.", start="Старт", lose="Минус 50%", gain50="Плюс 50%", gain100="Плюс 100%",
            short="Не хватает $250", hypo="Гипотетический пример", loss="Убыток", need="Нужно, чтобы отыграться",
            takeaway="Сначала\nзащитите\n*капитал*.", follow="Подписывайтесь", handle="onfin.io", money=lambda v: "${:,}".format(v).replace(",", " "),
            disclaimer="Гипотетический пример. Не является инвестиционной рекомендацией. CFD относятся к высокорисковым инструментам; вы можете потерять деньги."),
 "es": dict(kicker="Mito #01", myth="Mito", fact="Realidad", myth_text="Pierdes 50%, luego ganas 50% y vuelves al punto de partida.",
            fact_text="Necesitas *+100%* para recuperarte.", start="Inicio", lose="Pierdes 50%", gain50="Ganas 50%", gain100="Ganas 100%",
            short="Aún faltan $250", hypo="Ejemplo hipotético", loss="Pérdida", need="Ganancia necesaria para recuperarte",
            takeaway="Primero\nprotege tu\n*capital*.", follow="Síguenos para más", handle="onfin.io", money=lambda v: "${:,}".format(v),
            disclaimer="Ejemplo hipotético. No es asesoramiento de inversión. Los CFD son de alto riesgo; puedes perder dinero."),
}


def tokens(lang):
    """[(display, n_spoken_words)], markers {name: token index}, voiceover text."""
    out, marks, spoken = [], {}, []
    for s in SEG[lang]:
        if isinstance(s, dict):
            marks[s["m"]] = len(out); continue
        if isinstance(s, tuple):
            d, sp = s; n = len(sp.split()); out.append((d, n)); spoken.append(sp)
        else:
            for w in s.split(): out.append((w, 1))
            spoken.append(s)
    return out, marks, TAG[lang] + " " + " ".join(spoken)


if __name__ == "__main__":
    import sys
    for lang in SEG:
        toks, marks, vo = tokens(lang)
        print(lang, len(vo.split()), "spoken words;", vo[:90], "...")
