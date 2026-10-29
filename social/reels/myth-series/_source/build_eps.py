"""Builds ep<NN>_<lang>.js for episodes 02 to 05 from specs.py and the word timings in t/<NN>_<lang>.txt."""
import json, re, subprocess, sys
import specs as S

norm = lambda w: re.sub(r"[^\w]", "", w.lower())
eps = [int(a) for a in sys.argv[1:]] or list(S.EPS)
for ep in eps:
    for lang in S.EPS[ep]["seg"]:
        toks, marks, vo = S.tokens(ep, lang)
        W = [(l.split()[0], float(l.split()[1]), float(l.split()[2])) for l in open(f"t/{ep:02d}_{lang}.txt", encoding="utf-8")]
        spoken = S.split_spoken(vo.split("]", 1)[1])
        assert len(spoken) == len(W), (ep, lang, len(spoken), len(W))
        for a, (b, _, _) in zip(spoken, W):
            assert norm(a) == norm(b), (ep, lang, a, b)
        words, i = [], 0
        for d, n in toks:
            words.append({"w": d, "s": W[i][1], "e": W[i + n - 1][2]}); i += n
        mt = {k: words[v]["s"] for k, v in marks.items()}
        end = mt["follow"]
        cuts = set(marks.values()); chunks, cur = [], []
        for j, w in enumerate(words[:marks["follow"]]):
            if cur and (j in cuts or len(cur) >= 4 or len(" ".join(x["w"] for x in cur + [w])) > 26):
                chunks.append(cur); cur = []
            cur.append(w)
            if re.search(r"[.:]$", w["w"]):
                chunks.append(cur); cur = []
        if cur: chunks.append(cur)
        caps = []
        for k, ch in enumerate(chunks):
            e = chunks[k + 1][0]["s"] if k + 1 < len(chunks) else ch[-1]["e"] + 0.1
            caps.append({"s": ch[0]["s"] - 0.05, "e": min(e, end) - 0.05, "words": ch})
        dur = float(subprocess.check_output(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", f"vo{ep:02d}_{lang}.mp3"]))
        epd = {"ep": ep, "lang": lang, "txt": S.txt(ep, lang), "marks": mt, "end": end, "dur": round(dur + 1.6, 2), "captions": caps}
        open(f"ep{ep:02d}_{lang}.js", "w", encoding="utf-8").write("window.EP=" + json.dumps(epd, ensure_ascii=False) + ";")
        print(ep, lang, "dur", epd["dur"], "marks", {k: round(v, 1) for k, v in mt.items()})
