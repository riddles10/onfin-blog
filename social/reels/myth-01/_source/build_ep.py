"""Builds ep01_<lang>.js (scene data + synced captions) from spec01.py and the voiceover word timings in t/<lang>.txt.
python3 build_ep.py"""
import json, re, subprocess
import spec01 as S

norm = lambda w: re.sub(r"[^\w]", "", w.lower())

for lang in S.SEG:
    toks, marks, vo = S.tokens(lang)
    W = [(l.split()[0], float(l.split()[1]), float(l.split()[2])) for l in open(f"t/{lang}.txt", encoding="utf-8")]
    spoken = vo.split("]", 1)[1].split()
    assert len(spoken) == len(W), (lang, len(spoken), len(W))
    for a, (b, _, _) in zip(spoken, W):
        assert norm(a) == norm(b), (lang, a, b)
    # display tokens with times
    words, i = [], 0
    for d, n in toks:
        words.append({"w": d, "s": W[i][1], "e": W[i + n - 1][2]}); i += n
    mt = {k: words[v]["s"] for k, v in marks.items()}
    end = mt["follow"]
    # caption chunks: up to 4 words / 26 chars, break after sentence punctuation, never across scene markers
    cuts = set(marks.values())
    chunks, cur = [], []
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
    dur = float(subprocess.check_output(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", f"vo_{lang}.mp3"]))
    T = {k: v for k, v in S.TXT[lang].items() if isinstance(v, str)}
    money = S.TXT[lang]["money"]
    T.update({"m1000": money(1000), "m500": money(500), "m750": money(750)})
    ep = {"lang": lang, "txt": T, "marks": mt, "end": end, "dur": round(dur + 1.6, 2), "captions": caps}
    open(f"ep01_{lang}.js", "w", encoding="utf-8").write("window.EP=" + json.dumps(ep, ensure_ascii=False) + ";")
    print(lang, "dur", ep["dur"], "end", end, len(caps), "caption chunks;", " | ".join(" ".join(x["w"] for x in c["words"]) for c in caps[:6]))
