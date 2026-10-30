import json, os, subprocess
HERE = os.path.dirname(os.path.abspath(__file__))
MEME = os.path.join(HERE, "..", "meme")
MUSIC = os.path.join(HERE, "..", "audio", "quick_news_beat.mp3")
P = [(0.6, 3.0), (3.2, 8.8), (9.6, 12.5), (12.5, 15.5), (18.0, 21.2), (21.4, 25.5)]
L = {
 "en": ("Elon Musk says Tesla's new Roadster can fly. Here is what it actually did:",
        ["No one is inside.", "Suction holds it to the ramp.", "It drops off and flips,", "then lands on air jets.",
         "Up the ramp, upside down,", "and off with a flip."]),
 "ms": ("Elon Musk kata Roadster baharu Tesla boleh terbang. Ini yang sebenarnya berlaku:",
        ["Tiada sesiapa di dalam.", "Sedutan memegangnya pada landasan.", "Ia jatuh dan berpusing,", "lalu mendarat dengan jet udara.",
         "Naik landasan, terbalik,", "dan turun sambil berpusing."]),
 "ru": ("Маск говорит, что новый Roadster от Tesla умеет летать. Вот что он сделал:",
        ["Внутри никого нет.", "Присоски держат его на рампе.", "Он срывается и переворачивается,", "и садится на воздушных струях.",
         "Вверх по рампе, вверх колёсами,", "и вниз с переворотом."]),
 "es": ("Elon Musk dice que el nuevo Roadster de Tesla puede volar. Esto es lo que hizo en realidad:",
        ["No hay nadie dentro.", "La succión lo sujeta a la rampa.", "Se suelta y gira,", "y aterriza con chorros de aire.",
         "Sube la rampa boca abajo,", "y sale con una voltereta."]),
}
for lang, (hook, lines) in L.items():
    if os.environ.get("ONLY") and lang != os.environ["ONLY"]: continue
    sid = "tesla-roadster-flying" + ("" if lang == "en" else "-" + lang)
    wd = os.path.join(MEME, "work", sid); os.makedirs(wd, exist_ok=True)
    out = []
    for (a, b), text in zip(P, lines):
        toks = text.split(); lens = [len(t) + 1 for t in toks]; tot = sum(lens); t = a
        for tok, l in zip(toks, lens):
            d = (b - a) * l / tot; out.append("%s %.3f %.3f" % (tok, t, t + d)); t += d
    open(os.path.join(wd, "words_fixed.txt"), "w", encoding="utf-8").write("\n".join(out) + "\n")
    spec = {"id": sid, "src": os.path.join(HERE, "cut.mp4"), "in": 0, "out": 27.0, "hook": hook, "crop": 0.5, "box_h": 608}
    p = os.path.join(MEME, sid + ".json"); json.dump(spec, open(p, "w"), ensure_ascii=False)
    r = subprocess.run(["/tmp/claude-0/fw/bin/python", os.path.join(MEME, "build.py"), p], capture_output=True, text=True, stdin=subprocess.DEVNULL)
    print(r.stdout.strip().splitlines()[-1] if r.stdout.strip() else r.stderr[-800:])
    # the clip has no speech: replace the loudnormed ambience with the default music bed under the raw ambience
    src = os.path.join(MEME, "out", sid + ".mp4"); fin = os.path.join(HERE, sid + ".mp4")
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", src, "-i", os.path.join(HERE, "cut.mp4"), "-i", MUSIC, "-filter_complex",
                    "[2:a]atrim=0:27,asetpts=PTS-STARTPTS,loudnorm=I=-16:TP=-1.5:LRA=11,afade=t=out:st=25.5:d=1.5[m];"
                    "[1:a]volume=2.0[o];[m][o]amix=inputs=2:duration=first:normalize=0,aresample=48000[a]",
                    "-map", "0:v", "-map", "[a]", "-c:v", "copy", "-c:a", "aac", "-b:a", "192k", "-movflags", "+faststart", fin], check=True)
