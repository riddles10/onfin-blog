"""python3 payloads.py w2 -> <week>/payloads/batch-N.json (Postiz socialPost arrays, <=20 posts each)
Needs <week>/media.txt lines: '<file.jpg> <https://uploads.postiz.com/...>'."""
import json, os, sys, html
S = "/tmp/claude-0/-home-user-onfin-blog/42b2fa22-784d-52c4-a9a8-6ec4971d0812/scratchpad"
wk = sys.argv[1]
M = dict(l.split() for l in open(f"{S}/{wk}/media.txt") if l.strip())
posts = json.load(open(f"{S}/{wk}/posts.json"))
sp = []
missing = set()
for p in sorted(posts, key=lambda p: p["date"]):
    att = []
    for i in p["images"]:
        k = os.path.basename(i)[:-4] + ".jpg"
        if k not in M: missing.add(k)
        att.append(M.get(k, "MISSING"))
    st = [{"key": "post_type", "value": "story" if p["story"] else "post"}] if p["platform"] in ("instagram", "facebook") else []
    sp.append({"integrationId": p["integrationId"], "isPremium": False, "date": p["date"], "shortLink": False, "type": "schedule",
               "postsAndComments": [{"content": "".join(f"<p>{html.escape(l, quote=False)}</p>" for l in p["lines"]), "attachments": att}],
               "settings": st})
if missing:
    sys.exit(f"missing media: {sorted(missing)}")
os.makedirs(f"{S}/{wk}/payloads", exist_ok=True)
for n in range(0, len(sp), 20):
    json.dump(sp[n:n + 20], open(f"{S}/{wk}/payloads/batch-{n // 20}.json", "w"), ensure_ascii=False)
print(len(sp), "posts in", (len(sp) + 19) // 20, "batches")
