"""Re-post to Facebook the Instagram reels that never reached it (9 Nov 2026).

Instagram's automatic cross-post to Facebook stopped after the SpaceX revenue reel (30 Oct). The Facebook copies had been
removed on 30 Oct on the assumption that the cross-post worked, so these 25 reels are missing from Facebook.
One a day at 13:30 UTC (20:30 Cambodia time) from 10 Nov, same video and caption as on Instagram minus the hashtags.
Myth #01 goes on 12 Nov so it lands before Myth #02 (13 Nov).

POSTIZ_API_KEY=... python3 fb_reels_backlog.py <backlog.json>   (logs to fb_reels_backlog_log.json next to this script)"""
import datetime, json, os, re, subprocess, sys

KEY = os.environ["POSTIZ_API_KEY"]
FB = "cmvjg1etr08j7lf0yde4p29lr"
HERE = os.path.dirname(os.path.abspath(__file__))
LOG = os.path.join(HERE, "fb_reels_backlog_log.json")
log = json.load(open(LOG)) if os.path.exists(LOG) else {}


def sh(*a):
    return subprocess.run(list(a), capture_output=True, text=True).stdout


rows = [r for r in json.load(open(sys.argv[1])) if len(r["image"]) == 1]  # single-video reels only
myth = [r for r in rows if r["text"].startswith("Myth #01")]
rest = [r for r in rows if not r["text"].startswith("Myth #01")]
order = rest[:2] + myth + rest[2:]
day0 = datetime.date(2026, 11, 10)
for i, r in enumerate(order):
    if r["id"] in log:
        continue
    date = "%sT13:30:00.000Z" % (day0 + datetime.timedelta(days=i)).isoformat()
    paras = re.findall(r"<p>(.*?)</p>", r["content"], re.S)
    keep = [p for p in paras if not re.fullmatch(r"\s*(#\w+\s*)+", re.sub(r"<[^>]+>", "", p))]
    content = "".join("<p>%s</p>" % p for p in keep)
    first = re.sub(r"<[^>]+>", "", keep[0]).strip()
    title = first if len(first) <= 90 else first[:first.rfind(" ", 0, 87)] + "..."
    media = [{k: v for k, v in m.items() if k in ("id", "path", "alt", "thumbnail", "thumbnailTimestamp")} for m in r["image"]]
    body = {"type": "schedule", "date": date, "shortLink": False, "tags": [],
            "posts": [{"integration": {"id": FB}, "value": [{"content": content, "image": media}],
                       "settings": {"__type": "facebook", "post_type": "post", "title": title}}]}
    res = sh("curl", "-s", "-m", "60", "-X", "POST", "https://api.postiz.com/public/v1/posts", "-H", "Authorization: " + KEY,
             "-H", "Content-Type: application/json", "--data-binary", json.dumps(body))
    try:
        pid = json.loads(res)[0]["postId"]
    except Exception:
        print("FAILED", r["text"][:50], res[:300]); continue
    chk = json.loads(sh("curl", "-s", "-m", "30", "https://api.postiz.com/public/posts/" + pid)); chk = chk[0] if isinstance(chk, list) else chk
    n = len(json.loads(chk["image"]) if isinstance(chk["image"], str) else chk["image"])
    log[r["id"]] = {"fb_post": pid, "date": date, "state": chk["state"], "n": n, "ig_date": r["date"], "text": r["text"][:60]}
    json.dump(log, open(LOG, "w"), indent=1, ensure_ascii=False)
    print(date[:10], pid, chk["state"], n, r["text"][:50])
