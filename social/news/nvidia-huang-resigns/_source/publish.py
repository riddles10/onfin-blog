"""Publish now: single photo on Instagram, Facebook and Telegram (per language). Log: sched_log.json"""
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
ALT = ["Jensen Huang with the Nvidia logo and a -11.7% badge. Breaking news: Jensen Huang resigns as Nvidia CEO after 33 years. CFO Colette Kress is interim CEO. Source: Nvidia, 12 Nov 2026"]
def media(key):
    if key == "ig": return [dict(upload("tg/h3-tg-en.jpg"), alt=ALT[0])]
    lang = {"fb": "en", "tg-kh": "en", "tg-en": "en", "tg-ms": "ms", "tg-ru": "ru", "tg-es": "es"}[key]
    return [dict(upload("tg/h3-tg-%s.jpg" % lang), alt=ALT[0])]
NOW = (datetime.datetime.now(datetime.timezone.utc) + datetime.timedelta(minutes=1)).strftime("%Y-%m-%dT%H:%M:00.000Z")
POSTS = [("fb", "cmvjg1etr08j7lf0yde4p29lr", "facebook", {"__type": "facebook", "post_type": "post"}),
         ("tg-kh", "cmvjfl0ed087glf0yuoz284sa", "telegram-en", {"__type": "telegram"}),
         ("tg-en", "cmuv1mlcb001dmo0ylwenjxe1", "telegram-en", {"__type": "telegram"}),
         ("tg-ms", "cmuv1oz5o002gql0y49vluhy3", "telegram-ms", {"__type": "telegram"}),
         ("tg-ru", "cmuv1nud2001qmo0y7xgzq68r", "telegram-ru", {"__type": "telegram"}),
         ("tg-es", "cmvjg3htg08k9lf0yunmvtsqu", "telegram-es", {"__type": "telegram"}),
         ("ig", "cmvl4rmgd12ctmk0yjjk9x6kd", "instagram", {"__type": "instagram-standalone", "post_type": "post"})]
for key, integ, section, st in POSTS:
    if key in log: continue
    body = {"type": "now", "date": NOW, "shortLink": False, "tags": [], "posts": [{"integration": {"id": integ}, "value": [{"content": sec(section), "image": media(key)}], "settings": st}]}
    r = sh("curl", "-s", "-m", "60", "-X", "POST", "https://api.postiz.com/public/v1/posts", "-H", "Authorization: " + KEY, "-H", "Content-Type: application/json", "--data-binary", json.dumps(body))
    try: pid = json.loads(r)[0]["postId"]
    except Exception: print("FAILED", key, r[:300]); continue
    log[key] = {"id": pid, "date": NOW}; json.dump(log, open(LOG, "w"), indent=1, ensure_ascii=False)
    print(key, pid, NOW)
