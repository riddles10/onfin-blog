"""Schedule the US Thanksgiving 2026 trading schedule on Facebook, Telegram and Instagram stories, and retire the 24 Nov
"Thin markets ahead" posts it replaces (backed up to replaced_24nov_backup.json).
POSTIZ_API_KEY=... python3 schedule.py   (log: sched_log.json)"""
import json, os, subprocess
KEY = os.environ["POSTIZ_API_KEY"]
HERE = os.path.dirname(os.path.abspath(__file__)); R = os.path.dirname(HERE)
CAP = open(os.path.join(R, "captions.md"), encoding="utf-8").read()
LOG = os.path.join(HERE, "sched_log.json"); log = json.load(open(LOG)) if os.path.exists(LOG) else {}
up = log.setdefault("_uploads", {})
def sh(*a): return subprocess.run(list(a), capture_output=True, text=True).stdout
def sec(name):
    s = CAP.split("## " + name, 1)[1].split("\n## ", 1)[0].strip()
    return "".join("<p>%s</p>" % ln.strip() for ln in s.split("\n") if ln.strip())
def upload(rel):
    if rel not in up:
        r = json.loads(sh("curl", "-s", "-m", "300", "-X", "POST", "https://api.postiz.com/public/v1/upload", "-H", "Authorization: " + KEY, "-F", "file=@" + os.path.join(R, rel)))
        up[rel] = {"id": r["id"], "path": r["path"]}; json.dump(log, open(LOG, "w"), indent=1, ensure_ascii=False)
    return dict(up[rel])
ALT = "OnFin trading schedule for US Thanksgiving: adjusted closing times on 26 and 27 November 2026, server time EET"
POSTS = [
    ("fb", "cmvjg1etr08j7lf0yde4p29lr", "2026-11-23T08:00:00.000Z", "facebook", "cards/tg-en-post.jpg", {"__type": "facebook", "post_type": "post"}),
    ("tg-kh", "cmvjfl0ed087glf0yuoz284sa", "2026-11-23T08:00:00.000Z", "telegram-en", "cards/tg-en-post.jpg", {"__type": "telegram"}),
    ("tg-en", "cmuv1mlcb001dmo0ylwenjxe1", "2026-11-23T08:00:00.000Z", "telegram-en", "cards/tg-en-post.jpg", {"__type": "telegram"}),
    ("tg-ms", "cmuv1oz5o002gql0y49vluhy3", "2026-11-23T08:00:00.000Z", "telegram-ms", "cards/tg-ms-post.jpg", {"__type": "telegram"}),
    ("tg-ru", "cmuv1nud2001qmo0y7xgzq68r", "2026-11-23T09:00:00.000Z", "telegram-ru", "cards/tg-ru-post.jpg", {"__type": "telegram"}),
    ("tg-es", "cmvjg3htg08k9lf0yunmvtsqu", "2026-11-23T14:00:00.000Z", "telegram-es", "cards/tg-es-post.jpg", {"__type": "telegram"}),
    ("ig-story-23", "cmvl4rmgd12ctmk0yjjk9x6kd", "2026-11-23T12:30:00.000Z", None, "cards/tg-en-story.jpg", {"__type": "instagram-standalone", "post_type": "story"}),
    ("ig-story-25", "cmvl4rmgd12ctmk0yjjk9x6kd", "2026-11-25T12:30:00.000Z", None, "cards/tg-en-story.jpg", {"__type": "instagram-standalone", "post_type": "story"}),
]
for key, integ, date, section, img, st in POSTS:
    if key in log: continue
    m = dict(upload(img), alt=ALT)
    body = {"type": "schedule", "date": date, "shortLink": False, "tags": [], "posts": [{"integration": {"id": integ}, "value": [{"content": sec(section) if section else "", "image": [m]}], "settings": st}]}
    r = sh("curl", "-s", "-m", "60", "-X", "POST", "https://api.postiz.com/public/v1/posts", "-H", "Authorization: " + KEY, "-H", "Content-Type: application/json", "--data-binary", json.dumps(body))
    try: pid = json.loads(r)[0]["postId"]
    except Exception: print("FAILED", key, r[:300]); continue
    chk = json.loads(sh("curl", "-s", "-m", "30", "https://api.postiz.com/public/posts/" + pid)); chk = chk[0] if isinstance(chk, list) else chk
    log[key] = {"id": pid, "date": date, "state": chk["state"]}; json.dump(log, open(LOG, "w"), indent=1, ensure_ascii=False)
    print(key, pid, date, chk["state"])
# retire the 24 Nov "Thin markets ahead" posts (Facebook and Telegram), keeping a full backup
OLD = ["cmvpdt4qv1fftn31c2erk5llf", "cmvpd9yr71f56n31cn7qyn0o4", "cmvpd9z151f58n31c8th4xu69", "cmvpd9yvn1f57n31cxtvr77bs", "cmvpd9z5w1f59n31cm7hm2myq", "cmvpd9zbt1f5cn31c2zfqkwjf"]
bk = os.path.join(HERE, "replaced_24nov_backup.json")
if not os.path.exists(bk):
    json.dump([json.loads(sh("curl", "-s", "-m", "30", "https://api.postiz.com/public/posts/" + i)) for i in OLD], open(bk, "w"), ensure_ascii=False, indent=1)
for i in OLD:
    if log.get("deleted_" + i): continue
    d = sh("curl", "-s", "-m", "30", "-X", "DELETE", "-H", "Authorization: " + KEY, "https://api.postiz.com/public/v1/posts/" + i)
    log["deleted_" + i] = i in d; json.dump(log, open(LOG, "w"), indent=1, ensure_ascii=False)
    print("retired 24 Nov post", i, "ok" if i in d else "NOT DELETED " + d[:100])
