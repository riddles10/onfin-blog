"""Create the Anthropic x SpaceX posts via the Postiz public API (FB + TG on 5 Nov, IG on 8 Nov), log to sched_log.json."""
import json, os, subprocess
KEY = os.environ["POSTIZ_API_KEY"]
CAP = open("/home/user/onfin-blog/social/news/anthropic-spacex-compute/captions.md", encoding="utf-8").read()
def sec(name):
    s = CAP.split("## " + name, 1)[1].split("\n## ", 1)[0].strip()
    return "".join("<p>%s</p>" % ln.strip() for ln in s.split("\n") if ln.strip())
def sh(*a):
    return subprocess.run(list(a), capture_output=True, text=True).stdout
VID = {"id": "c5d19acd-4cc7-49e1-be79-7afcb8c17aef", "path": "https://uploads.postiz.com/Ca3gr5U50s.mp4", "alt": "Anthropic will pay SpaceX about $3.1 billion a month for compute: slideshow of the S-1, SpaceX 10-Q and Apollo evidence", "thumbnailTimestamp": 1200}
TG = {"en": {"id": "5388b12c-7408-40d1-9a82-2eaffdc1e5c2", "path": "https://uploads.postiz.com/GGROqjKr45.jpg"},
      "ms": {"id": "eec864c1-dcd6-4db6-a86c-d7fa9672c6f2", "path": "https://uploads.postiz.com/UbvX1aH2yn.jpg"},
      "ru": {"id": "8af9bc4a-a695-4774-a428-187b242fc22e", "path": "https://uploads.postiz.com/pSecQUPjiJ.jpg"},
      "es": {"id": "2065c17d-9450-4deb-ad01-41d7b508c492", "path": "https://uploads.postiz.com/s6eAeO3JoU.jpg"}}
IGI = [("f82ab4bf-e853-407c-bf1c-a38dac6a3226", "R0GCKkSyD1"), ("9ea4d832-4985-4c47-a0f5-bdb715857a3b", "zeinEarCvS"), ("f1c99535-6e6e-40a9-95db-68b2df82fac1", "2DcnwA34HL"),
       ("d26c0d2b-5e27-4200-a08c-aad07a725f00", "3CPdnyeoJD"), ("080d042b-d251-484e-b968-8b01909bfaea", "Af5CDqPKV6"), ("76665d19-a3ef-41f3-acb5-bee309a2d8c2", "ZP53Ks8QjB"),
       ("96d8cc30-83bd-4421-908d-8d7be71767c7", "mADEHsRKul"), ("cbfc9a62-f5ec-4688-b7e7-eee9a102b64b", "LkS7cPn2qD"), ("226723f0-9946-4b4e-8252-3736d8724102", "xfzszVFVVD"),
       ("4a3cadde-a36b-428b-a416-217862cc44bd", "qhHMXmlHYL")]
ALT = ["Starship lifting off, with Anthropic and SpaceX logos and a $3.1B a month badge", "Anthropic S-1 excerpt: up to $120.5 billion with SpaceXAI, about $3.1 billion a month from December 2026",
       "Anthropic S-1 excerpt: either party may cancel on 90 days' notice after early 2027", "Bar chart of Anthropic's compute commitments: SpaceXAI, Google, Amazon, Microsoft",
       "Bar chart: H1 2026 revenue $16.3B vs six months of SpaceX compute at full rate $18.6B", "SpaceX 10-Q excerpt: Customer B was 34.5% of Q3 2026 revenue",
       "Semafor: Anthropic is now SpaceX's biggest customer", "Apollo release: SpaceX secures $40 billion GPU financing", "Bridgewater quote on concentration, via Semafor",
       "Question slide: smart bet, or too much riding on one customer?"]
IMG = [{"id": i, "path": "https://uploads.postiz.com/%s.jpg" % p, "alt": a} for (i, p), a in zip(IGI, ALT)]
POSTS = [
    ("fb", "cmvjg1etr08j7lf0yde4p29lr", "2026-11-05T09:30:00.000Z", sec("facebook"), [VID], {"__type": "facebook", "post_type": "post", "title": "Anthropic will pay SpaceX $3.1 billion a month"}),
    ("tg-kh", "cmvjfl0ed087glf0yuoz284sa", "2026-11-05T09:30:00.000Z", sec("telegram-en"), [TG["en"]], {"__type": "telegram"}),
    ("tg-en", "cmuv1mlcb001dmo0ylwenjxe1", "2026-11-05T12:00:00.000Z", sec("telegram-en"), [TG["en"]], {"__type": "telegram"}),
    ("tg-ms", "cmuv1oz5o002gql0y49vluhy3", "2026-11-05T12:30:00.000Z", sec("telegram-ms"), [TG["ms"]], {"__type": "telegram"}),
    ("tg-ru", "cmuv1nud2001qmo0y7xgzq68r", "2026-11-05T13:30:00.000Z", sec("telegram-ru"), [TG["ru"]], {"__type": "telegram"}),
    ("tg-es", "cmvjg3htg08k9lf0yunmvtsqu", "2026-11-05T16:30:00.000Z", sec("telegram-es"), [TG["es"]], {"__type": "telegram"}),
    ("ig", "cmvl4rmgd12ctmk0yjjk9x6kd", "2026-11-08T12:00:00.000Z", sec("instagram"), IMG, {"__type": "instagram-standalone", "post_type": "post"}),
]
import sys
only = sys.argv[1:] or [p[0] for p in POSTS]
log = json.load(open("sched_log.json")) if os.path.exists("sched_log.json") else {}
for key, integ, date, content, media, st in POSTS:
    if key not in only or key in log:
        continue
    body = {"type": "schedule", "date": date, "shortLink": False, "tags": [], "posts": [{"integration": {"id": integ}, "value": [{"content": content, "image": media}], "settings": st}]}
    r = sh("curl", "-s", "-m", "60", "-X", "POST", "https://api.postiz.com/public/v1/posts", "-H", "Authorization: " + KEY, "-H", "Content-Type: application/json", "--data-binary", json.dumps(body))
    try:
        res = json.loads(r); pid = res[0]["postId"]
    except Exception:
        print("FAILED", key, r[:300]); continue
    chk = json.loads(sh("curl", "-s", "-m", "30", "https://api.postiz.com/public/posts/" + pid)); chk = chk[0] if isinstance(chk, list) else chk
    n = len(json.loads(chk["image"]) if isinstance(chk["image"], str) else chk["image"])
    log[key] = {"id": pid, "date": date, "state": chk["state"], "n": n}
    json.dump(log, open("sched_log.json", "w"), indent=1)
    print(key, pid, date, chk["state"], n, "att")
