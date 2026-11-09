"""Schedule the Jensen Huang / Nvidia board probe posts via the Postiz public API (all channels, 9 Nov 2026).
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


ALT = ["Jensen Huang, with the Nvidia logo and a -3.4% badge: Jensen Huang admits an affair, Nvidia's board opens a probe",
       "Huang's memo to staff: I was unfaithful to my wife; Nvidia board statement: investigation into reports he was the target of a foreign intelligence effort",
       "Chart of Nvidia daily closes from the 6 Oct high of $239.24 to $186.64 on Friday, and about $180.30 out of hours on Monday"]


def media(key):
    if key == "ig":
        return [dict(upload("evidence/huang-en-%02d.jpg" % i), alt=a) for i, a in zip((1, 2, 3), ALT)]
    if key == "fb":
        return [dict(upload("fb/huang-fb-en.mp4"), alt="Slideshow: Jensen Huang admits an affair and Nvidia's board opens a probe, with the memo, the board statement and the price chart", thumbnailTimestamp=1000)]
    lang = {"tg-kh": "en", "tg-en": "en", "tg-ms": "ms", "tg-ru": "ru", "tg-es": "es"}[key]
    return [upload("tg/huang-tg-%s.jpg" % lang)]


POSTS = [  # key, integration, date (UTC), caption section, settings
    ("fb", "cmvjg1etr08j7lf0yde4p29lr", "2026-11-09T12:00:00.000Z", "facebook", {"__type": "facebook", "post_type": "post", "title": "Nvidia's CEO admits an affair. The board opens a probe."}),
    ("tg-kh", "cmvjfl0ed087glf0yuoz284sa", "2026-11-09T12:00:00.000Z", "telegram-en", {"__type": "telegram"}),
    ("tg-en", "cmuv1mlcb001dmo0ylwenjxe1", "2026-11-09T12:00:00.000Z", "telegram-en", {"__type": "telegram"}),
    ("tg-ms", "cmuv1oz5o002gql0y49vluhy3", "2026-11-09T12:30:00.000Z", "telegram-ms", {"__type": "telegram"}),
    ("tg-ru", "cmuv1nud2001qmo0y7xgzq68r", "2026-11-09T12:30:00.000Z", "telegram-ru", {"__type": "telegram"}),
    ("tg-es", "cmvjg3htg08k9lf0yunmvtsqu", "2026-11-09T13:00:00.000Z", "telegram-es", {"__type": "telegram"}),
    ("ig", "cmvl4rmgd12ctmk0yjjk9x6kd", "2026-11-09T12:30:00.000Z", "instagram", {"__type": "instagram-standalone", "post_type": "post"}),
]
only = sys.argv[1:] or [p[0] for p in POSTS]
for key, integ, date, section, st in POSTS:
    if key not in only or key in log:
        continue
    body = {"type": "schedule", "date": date, "shortLink": False, "tags": [],
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
