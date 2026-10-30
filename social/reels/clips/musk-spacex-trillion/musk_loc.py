import json, os, subprocess
HERE = os.path.dirname(os.path.abspath(__file__))
SRC = json.load(open(os.path.join(HERE, "musk-spacex-trillion.json")))
# phrase windows from the English word timings
P = [(0.02, 1.90), (1.90, 9.58), (9.58, 11.40), (11.40, 15.30), (15.56, 17.60)]
L = {
 "ms": ("Elon Musk tentang hasil SpaceX menjelang akhir 2027:",
        ["Maksud saya, secara ringkas,", "apa yang ini maksudkan untuk hasil berulang tahunan SpaceX",
         "menjelang akhir 2027", "adalah antara 500 bilion hingga satu trilion.",
         "Ya, saya tak mahu Bret kena serangan jantung lagi."]),
 "ru": ("Илон Маск о выручке SpaceX к концу 2027 года:",
        ["То есть, если коротко,", "это значит, что годовая регулярная выручка SpaceX",
         "к концу 2027 года", "составит от 500 миллиардов до триллиона.",
         "Ладно, не хочу больше доводить Брета до инфаркта."]),
 "es": ("Elon Musk sobre cuánto podría facturar SpaceX a finales de 2027:",
        ["O sea, en resumen,", "lo que esto implica para los ingresos recurrentes anuales de SpaceX",
         "para finales de 2027", "es algo entre 500,000 millones y un billón.",
         "Sí, ya no quiero darle un infarto a Bret."]),
}
for lang, (hook, lines) in L.items():
    if os.environ.get("ONLY") and lang != os.environ["ONLY"]: continue
    sid = "musk-spacex-trillion-" + lang
    wd = os.path.join(HERE, "work", sid); os.makedirs(wd, exist_ok=True)
    out = []
    for (a, b), text in zip(P, lines):
        toks = text.split(); n = len(toks)
        # spread words by character length across the phrase window
        lens = [len(t) + 1 for t in toks]; tot = sum(lens); t = a
        for tok, l in zip(toks, lens):
            d = (b - a) * l / tot
            out.append("%s %.3f %.3f" % (tok, t, t + d)); t += d
    open(os.path.join(wd, "words_fixed.txt"), "w", encoding="utf-8").write("\n".join(out) + "\n")
    spec = dict(SRC, id=sid, hook=hook, fix={})
    p = os.path.join(HERE, sid + ".json"); json.dump(spec, open(p, "w"), ensure_ascii=False)
    print(subprocess.run(["/tmp/claude-0/fw/bin/python", os.path.join(HERE, "build.py"), p], capture_output=True, text=True, stdin=subprocess.DEVNULL).stdout.strip().splitlines()[-1])
