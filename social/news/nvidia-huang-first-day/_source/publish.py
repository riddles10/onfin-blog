"""Publish now: the clip reel on Instagram, Facebook and all Telegram channels
(the Instagram feed is blocked, so no feed attempt). Log: sched_log.json"""
import datetime, json, os, subprocess
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
ALT = "Jensen Huang addresses Nvidia staff on his return to headquarters, 23 Nov 2026"
IG = "cmvl4rmgd12ctmk0yjjk9x6kd"
NOW = (datetime.datetime.now(datetime.timezone.utc) + datetime.timedelta(minutes=1)).strftime("%Y-%m-%dT%H:%M:00.000Z")
POSTS = [("fb", "cmvjg1etr08j7lf0yde4p29lr", "facebook", "reel/huang-first-day.mp4", {"__type": "facebook", "post_type": "post", "title": "Jensen Huang's first words back at Nvidia HQ"}),
         ("ig-reel", IG, "instagram", "reel/huang-first-day.mp4", {"__type": "instagram-standalone", "post_type": "post"}),
         ("tg-kh", "cmvjfl0ed087glf0yuoz284sa", "telegram-en", "reel/huang-first-day.mp4", {"__type": "telegram"}),
         ("tg-en", "cmuv1mlcb001dmo0ylwenjxe1", "telegram-en", "reel/huang-first-day.mp4", {"__type": "telegram"}),
         ("tg-ms", "cmuv1oz5o002gql0y49vluhy3", "telegram-ms", "reel/huang-first-day.mp4", {"__type": "telegram"}),
         ("tg-ru", "cmuv1nud2001qmo0y7xgzq68r", "telegram-ru", "reel/huang-first-day.mp4", {"__type": "telegram"}),
         ("tg-es", "cmvjg3htg08k9lf0yunmvtsqu", "telegram-es", "reel/huang-first-day.mp4", {"__type": "telegram"})]
for key, integ, section, rel, st in POSTS:
    if key in log: continue
    m = dict(upload(rel), alt=ALT)
    if rel.endswith(".mp4"): m["thumbnailTimestamp"] = 1000
    body = {"type": "now", "date": NOW, "shortLink": False, "tags": [], "posts": [{"integration": {"id": integ}, "value": [{"content": sec(section) if section else "", "image": [m]}], "settings": st}]}
    r = sh("curl", "-s", "-m", "60", "-X", "POST", "https://api.postiz.com/public/v1/posts", "-H", "Authorization: " + KEY, "-H", "Content-Type: application/json", "--data-binary", json.dumps(body))
    try: pid = json.loads(r)[0]["postId"]
    except Exception: print("FAILED", key, r[:300]); continue
    log[key] = {"id": pid, "date": NOW}; json.dump(log, open(LOG, "w"), indent=1, ensure_ascii=False)
    print(key, pid, NOW)
