"""fixwords.py <id> "old=>new" ...: writes work/<id>/words_fixed.txt from words.json, replacing exact tokens (new may be empty to drop a word)."""
import json, os, sys
HERE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
cid = sys.argv[1]; wd = os.path.join(HERE, "work", cid)
rep = dict(a.split("=>", 1) for a in sys.argv[2:])
src = os.path.join(wd, "words_fixed.txt")
words = ([l.split() for l in open(src) if l.strip()] if os.path.exists(src) else
         [[w[0].replace(" ", "_"), w[1], w[2]] for w in json.load(open(os.path.join(wd, "words.json")))])
out, used = [], set()
for w in words:
    t = w[0]
    if t in rep:
        used.add(t); t = rep[t]
    if t:
        out.append("%s %s %s" % (t.replace(" ", " ") if False else t, w[1], w[2]))
open(src, "w").write("\n".join(out) + "\n")
print("replaced:", sorted(used), "missing:", sorted(set(rep) - used))
