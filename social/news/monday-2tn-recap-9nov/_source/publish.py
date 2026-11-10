"""Publish the Monday 9 Nov recap fact check now via the Postiz public API (all channels, 9 Nov 2026).
POSTIZ_API_KEY=... python3 schedule.py [keys...]   -> logs to sched_log.json next to this script"""
import json, os, subprocess, sys

KEY = os.environ["POSTIZ_API_KEY"]
HERE = os.path.dirname(os.path.abspath(__file__))
R = os.path.dirname(HERE)
CAP = open(os.path.join(R, "captions.md"), encoding="utf-8").read()
LOG = os.path.join(HERE, "sched_log.json")
log = json.load(open(LOG)) if os.path.exists(LOG) else {}
up = log.setdefault("_uploads", {})


def sh(*a):
    return subprocess.run(list(a), capture_output=True, text=True).stdout


def sec(name):
    s = CAP.split("## " + name, 1)[1].split("\n## ", 1)[0].strip()
    return "".join("<p>%s</p>" % ln.strip() for ln in s.split("\n") if ln.strip())


def upload(rel):
    if rel not in up:
        r = json.loads(sh("curl", "-s", "-m", "300", "-X", "POST", "https://api.postiz.com/public/v1/upload", "-H", "Authorization: " + KEY, "-F", "file=@" + os.path.join(R, rel)))
        up[rel] = {"id": r["id"], "path": r["path"]}
        json.dump(log, open(LOG, "w"), indent=1, ensure_ascii=False)
    return dict(up[rel])


ALT = []  # unused: Instagram gets the Facebook video as a reel while its feed posts are on hold


def media(key):
    if key == "ig":
        return [dict(upload("fb/heat-fb-en.mp4"), alt="Fact check: $2 trillion added on Monday, and everything green except Nvidia?", thumbnailTimestamp=1000)]
    if key == "fb":
        return [dict(upload("fb/heat-fb-en.mp4"), alt="Slideshow fact check: heatmap of the biggest US stocks on Monday, the numbers and Nvidia's fall", thumbnailTimestamp=1000)]
    lang = {"tg-kh": "en", "tg-en": "en", "tg-ms": "ms", "tg-ru": "ru", "tg-es": "es"}[key]
    return [upload("tg/heat-tg-%s.jpg" % lang)]


import datetime
NOW = (datetime.datetime.now(datetime.timezone.utc) + datetime.timedelta(minutes=1)).strftime("%Y-%m-%dT%H:%M:00.000Z")
POSTS = [  # key, integration, date (UTC), caption section, settings
    ("fb", "cmvjg1etr08j7lf0yde4p29lr", NOW, "facebook", {"__type": "facebook", "post_type": "post", "title": "Fact check: $2 trillion added on Monday, everything green except Nvidia?"}),
    ("tg-kh", "cmvjfl0ed087glf0yuoz284sa", NOW, "telegram-en", {"__type": "telegram"}),
    ("tg-en", "cmuv1mlcb001dmo0ylwenjxe1", NOW, "telegram-en", {"__type": "telegram"}),
    ("tg-ms", "cmuv1oz5o002gql0y49vluhy3", NOW, "telegram-ms", {"__type": "telegram"}),
    ("tg-ru", "cmuv1nud2001qmo0y7xgzq68r", NOW, "telegram-ru", {"__type": "telegram"}),
    ("tg-es", "cmvjg3htg08k9lf0yunmvtsqu", NOW, "telegram-es", {"__type": "telegram"}),
    ("ig", "cmvl4rmgd12ctmk0yjjk9x6kd", NOW, "instagram", {"__type": "instagram-standalone", "post_type": "post"}),
]
only = sys.argv[1:] or [p[0] for p in POSTS]
for key, integ, date, section, st in POSTS:
    if key not in only or key in log:
        continue
    body = {"type": "now", "date": date, "shortLink": False, "tags": [],
            "posts": [{"integration": {"id": integ}, "value": [{"content": sec(section), "image": media(key)}], "settings": st}]}
    r = sh("curl", "-s", "-m", "60", "-X", "POST", "https://api.postiz.com/public/v1/posts", "-H", "Authorization: " + KEY, "-H", "Content-Type: application/json", "--data-binary", json.dumps(body))
    try:
        pid = json.loads(r)[0]["postId"]
    except Exception:
        print("FAILED", key, r[:300]); continue
    chk = json.loads(sh("curl", "-s", "-m", "30", "https://api.postiz.com/public/posts/" + pid)); chk = chk[0] if isinstance(chk, list) else chk
    n = len(json.loads(chk["image"]) if isinstance(chk["image"], str) else chk["image"])
    log[key] = {"id": pid, "date": date, "state": chk["state"], "n": n}
    json.dump(log, open(LOG, "w"), indent=1, ensure_ascii=False)
    print(key, pid, date, chk["state"], n, "att")
