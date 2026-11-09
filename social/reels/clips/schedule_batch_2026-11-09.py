"""Schedule the 9 Nov clip reel batch on Instagram and Facebook via the Postiz public API.

Instagram: one a day at 13:00 UTC from 10 Nov (Myths #02 and #03 fill 13 and 20 Nov).
Facebook: the two timely clips go out the same day as on Instagram; the rest follow the Facebook reels backlog from 6 Dec.
soros-safe-bet goes last: one burned-in phrase needs a listen before it runs.
POSTIZ_API_KEY=... python3 schedule_batch_2026-11-09.py   (log: schedule_batch_2026-11-09_log.json)"""
import json, os, re, subprocess

KEY = os.environ["POSTIZ_API_KEY"]
IG, FB = "cmvl4rmgd12ctmk0yjjk9x6kd", "cmvjg1etr08j7lf0yde4p29lr"
HERE = os.path.dirname(os.path.abspath(__file__))
LOG = os.path.join(HERE, "schedule_batch_2026-11-09_log.json")
log = json.load(open(LOG)) if os.path.exists(LOG) else {}
PLAN = [  # slug, IG date, FB date
    ("warsh-december", "2026-11-10T13:00", "2026-11-10T13:30"),
    ("powell-fog", "2026-11-11T13:00", "2026-12-06T13:30"),
    ("fed-three-questions", "2026-11-12T13:00", "2026-12-07T13:30"),
    ("powell-not-allowed", "2026-11-14T13:00", "2026-12-08T13:30"),
    ("warsh-paycheck", "2026-11-15T13:00", "2026-12-09T13:30"),
    ("warsh-ai-bubble", "2026-11-16T13:00", "2026-11-16T15:30"),
    ("cuban-bubble", "2026-11-17T13:00", "2026-12-10T13:30"),
    ("ackman-ggp", "2026-11-18T13:00", "2026-12-11T13:30"),
    ("warsh-cbdc", "2026-11-19T13:00", "2026-12-12T13:30"),
    ("soros-safe-bet", "2026-11-21T13:00", "2026-12-13T13:30"),
]


def sh(*a):
    return subprocess.run(list(a), capture_output=True, text=True).stdout


def caption(slug, fb):
    s = open(os.path.join(HERE, slug, "captions.md"), encoding="utf-8").read().split("## instagram", 1)[1].split("\n## ", 1)[0].strip()
    lines = [ln.strip() for ln in s.split("\n") if ln.strip()]
    if fb:
        lines = [ln for ln in lines if not re.fullmatch(r"(#\w+\s*)+", ln)]
    return "".join("<p>%s</p>" % ln for ln in lines), lines[0]


def post(integ, date, content, media, st):
    body = {"type": "schedule", "date": date + ":00.000Z", "shortLink": False, "tags": [],
            "posts": [{"integration": {"id": integ}, "value": [{"content": content, "image": [media]}], "settings": st}]}
    r = sh("curl", "-s", "-m", "60", "-X", "POST", "https://api.postiz.com/public/v1/posts", "-H", "Authorization: " + KEY,
           "-H", "Content-Type: application/json", "--data-binary", json.dumps(body))
    pid = json.loads(r)[0]["postId"]
    chk = json.loads(sh("curl", "-s", "-m", "30", "https://api.postiz.com/public/posts/" + pid)); chk = chk[0] if isinstance(chk, list) else chk
    return pid, chk["state"]


for slug, igd, fbd in PLAN:
    e = log.setdefault(slug, {})
    if "media" not in e:
        r = json.loads(sh("curl", "-s", "-m", "300", "-X", "POST", "https://api.postiz.com/public/v1/upload", "-H", "Authorization: " + KEY,
                          "-F", "file=@" + os.path.join(HERE, slug, "onfin-clip-%s.mp4" % slug)))
        e["media"] = {"id": r["id"], "path": r["path"]}
    media = dict(e["media"], thumbnailTimestamp=1500)
    if "ig" not in e:
        c, _ = caption(slug, False)
        e["ig"] = post(IG, igd, c, media, {"__type": "instagram-standalone", "post_type": "post"}) + (igd,)
    if "fb" not in e:
        c, first = caption(slug, True)
        title = first if len(first) <= 90 else first[:first.rfind(" ", 0, 87)] + "..."
        e["fb"] = post(FB, fbd, c, media, {"__type": "facebook", "post_type": "post", "title": title}) + (fbd,)
    json.dump(log, open(LOG, "w"), indent=1, ensure_ascii=False)
    print(slug.ljust(20), "IG", e["ig"][2], e["ig"][1], "| FB", e["fb"][2], e["fb"][1])
