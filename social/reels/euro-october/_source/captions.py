import json
W = [(l.split()[0], float(l.split()[1]), float(l.split()[2])) for l in open("words.txt")]
one = lambda s: [(w, 1) for w in s.split()]
C = [
 one("The euro just hit"), one("its lowest level of the year."),
 [("At", 1), ("around", 1), ("1.11,", 4)], one("it's the weakest major currency"),
 one("this October,"), [("down", 1), ("about", 1), ("2%", 2), ("against", 1), ("the", 1), ("dollar.", 1)],
 one("The biggest reason is France."), one("Last week, the gap between"),
 [("French", 1), ("and", 1), ("German", 1), ("10-year", 2), ("bond", 1), ("yields", 1)],
 [("hit", 1), ("about", 1), ("1.75", 4), ("percentage", 1), ("points,", 1)], one("the widest since 2011."),
 one("Higher energy prices"), one("are adding to the pressure."),
 one("And hedge funds have built"), one("their biggest bet against the euro"), one("since March 2020."),
 one("Today, the European Central Bank decides."), one("Economists expect rates on hold"),
 [("at", 1), ("2.5%,", 4)], one("so watch for any hint"), one("of a December hike."),
]
i = 0; out = []
for ch in C:
    words = []
    for txt, n in ch:
        words.append({"w": txt, "s": W[i][1], "e": W[i + n - 1][2]}); i += n
    out.append(words)
assert W[i][0] == "Follow", W[i]
res = []
for k, ch in enumerate(out):
    e = out[k + 1][0]["s"] if k + 1 < len(out) else ch[-1]["e"] + 0.1
    res.append({"s": ch[0]["s"] - 0.05, "e": e - 0.05, "words": ch})
open("captions.js", "w").write("window.CAPTIONS=" + json.dumps(res) + ";")
print(len(res), "chunks; last ends", res[-1]["e"])
