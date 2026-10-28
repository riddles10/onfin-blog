import json
W = [(l.split()[0], float(l.split()[1]), float(l.split()[2])) for l in open("words.txt")]
one = lambda s: [(w, 1) for w in s.split()]
C = [
 one("The Fed held rates today."), one("But two officials wanted a hike."),
 one("The target range stays at"), [("3.75%", 4), ("to", 1), ("4%.", 2)],
 one("That's after September's hike,"), one("the first in more than three years."),
 one("Look at the path."), [("Rates", 1), ("peaked", 1), ("at", 1), ("5.5%", 5), ("in", 1), ("2023,", 1)],
 one("were cut through 2025,"), one("and turned higher again in September."),
 [("Today's", 1), ("vote", 1), ("was", 1), ("10", 1), ("to", 1), ("2.", 1)],
 one("Governor Lisa Cook and"), one("Cleveland Fed President Beth Hammack"), one("wanted another quarter point."),
 one("Chair Kevin Warsh was blunt."), one("Inflation is too high."),
 one("It's been above the Fed's goal"), [("for", 1), ("close", 1), ("to", 1), ("6", 1), ("years,", 1)],
 one("and energy prices are rising again."), one("He also announced a change."),
 one("From 2027, one meeting a year"), one("will focus only on strategy,"), one("with no rate vote."),
 one("Next for the dollar:"), [("jobs", 1), ("data", 1), ("on", 1), ("November", 1), ("6,", 1)],
 [("inflation", 1), ("on", 1), ("November", 1), ("10,", 1)], one("and the Fed's next decision"),
 [("on", 1), ("December", 1), ("9.", 1)],
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
