"""Pull a social media report dataset for all OnFin channels.

Usage:  POSTIZ_API_KEY=... python3 collect.py START END OUT.json
        (START/END as YYYY-MM-DD, END inclusive)

Sources
- Postiz public API: every post scheduled through Postiz (state, publish time, error, link),
  channel analytics for Instagram and Facebook, per-post analytics for Instagram and Facebook posts.
- Public Telegram channel pages (t.me/s/<username>): subscriber count and views per message.
  The Cambodia channel is private, so it has no public page and no view counts.
"""
import html, json, os, re, sys, time, urllib.request
from datetime import datetime, timedelta, timezone

API = "https://api.postiz.com/public/v1"
KEY = os.environ["POSTIZ_API_KEY"]
CHANNELS = {
    "cmvl4rmgd12ctmk0yjjk9x6kd": {"name": "Instagram @onfinkm", "kind": "instagram"},
    "cmvjg1etr08j7lf0yde4p29lr": {"name": "Facebook OnFin Cambodia", "kind": "facebook"},
    "cmvjfl0ed087glf0yuoz284sa": {"name": "Telegram Cambodia", "kind": "telegram", "tg": None},
    "cmuv1mlcb001dmo0ylwenjxe1": {"name": "Telegram English", "kind": "telegram", "tg": "OnFin_analytics_EN"},
    "cmuv1oz5o002gql0y49vluhy3": {"name": "Telegram Malay", "kind": "telegram", "tg": "ECN_analytics_ml"},
    "cmuv1nud2001qmo0y7xgzq68r": {"name": "Telegram Russian", "kind": "telegram", "tg": "OnFin_analytics"},
    "cmvjg3htg08k9lf0yunmvtsqu": {"name": "Telegram Spanish", "kind": "telegram", "tg": "onfinlatam"},
}


def get(url, auth=True, tries=4):
    for i in range(tries):
        try:
            req = urllib.request.Request(url, headers={"Authorization": KEY} if auth else {"User-Agent": "Mozilla/5.0"})
            with urllib.request.urlopen(req, timeout=60) as r:
                return r.read().decode("utf-8", "ignore")
        except Exception as e:  # rate limit or network: back off
            if i == tries - 1:
                raise
            time.sleep(2 ** (i + 1))


def strip(h):
    h = re.sub(r"<br\s*/?>|</p>", "\n", h or "")
    return html.unescape(re.sub(r"<[^>]+>", "", h)).strip()


def fmt_of(p):
    imgs = p.get("image") or []
    if isinstance(imgs, str):
        imgs = json.loads(imgs or "[]")
    st = (p.get("settings") or {})
    if isinstance(st, str):
        st = json.loads(st or "{}")
    if st.get("post_type") == "story":
        return "story"
    vid = any(str(i.get("path", "")).lower().endswith((".mp4", ".mov")) for i in imgs)
    if vid:
        return "video"
    return "carousel" if len(imgs) > 1 else ("image" if imgs else "text")


def tg_scrape(user, start):
    """Messages on a public channel back to `start`, newest first, plus the subscriber count."""
    msgs, before, subs = {}, None, None
    for _ in range(40):
        h = get("https://t.me/s/%s%s" % (user, "?before=%d" % before if before else ""), auth=False)
        if subs is None:
            m = re.search(r'<span class="counter_value">([^<]+)</span>\s*<span class="counter_type">subscribers', h)
            subs = m.group(1) if m else None
        blocks = re.split(r'(?=<div class="tgme_widget_message_wrap)', h)[1:]
        ids = []
        for b in blocks:
            m = re.search(r'data-post="[^/]+/(\d+)"', b)
            if not m:
                continue
            mid = int(m.group(1)); ids.append(mid)
            t = re.search(r'<time datetime="([^"]+)"', b)
            v = re.search(r'tgme_widget_message_views">([^<]+)<', b)
            txt = re.search(r'tgme_widget_message_text[^>]*>(.*?)</div>', b, re.S)
            msgs[mid] = {"id": mid, "date": t.group(1) if t else None, "views": views_num(v.group(1)) if v else None,
                         "text": strip(txt.group(1))[:160] if txt else "",
                         "media": "video" if "tgme_widget_message_video" in b else ("photo" if "tgme_widget_message_photo" in b else "text")}
        if not ids:
            break
        oldest = min(ids)
        dates = [msgs[i]["date"] for i in ids if msgs[i]["date"]]
        if (dates and min(dates)[:10] < start) or oldest <= 1:
            break
        before = oldest
        time.sleep(1.0)
    return subs, sorted((m for m in msgs.values() if m["date"] and m["date"][:10] >= start), key=lambda m: m["id"])


def views_num(s):
    s = s.strip().upper()
    mult = 1000 if s.endswith("K") else (1_000_000 if s.endswith("M") else 1)
    return int(round(float(s.rstrip("KM")) * mult))


def main():
    start, end, out = sys.argv[1], sys.argv[2], sys.argv[3]
    end_x = (datetime.fromisoformat(end) + timedelta(days=1)).strftime("%Y-%m-%d")
    days = (datetime.fromisoformat(end_x) - datetime.fromisoformat(start)).days
    data = {"start": start, "end": end, "pulled_at": datetime.now(timezone.utc).isoformat(timespec="minutes"), "channels": {}}

    posts = json.loads(get("%s/posts?startDate=%sT00:00:00Z&endDate=%sT00:00:00Z" % (API, start, end_x)))
    posts = posts.get("posts", posts)
    for cid, meta in CHANNELS.items():
        ch = dict(meta, posts=[], analytics=None)
        mine = sorted((p for p in posts if p["integration"]["id"] == cid and p["state"] in ("PUBLISHED", "ERROR")), key=lambda p: p["publishDate"])
        for p in mine:
            row = {"id": p["id"], "date": p["publishDate"], "state": p["state"], "url": p.get("releaseURL"),
                   "error": (p.get("error") or "")[:200] or None, "format": None, "text": strip(p.get("content"))[:160]}
            full = json.loads(get("https://api.postiz.com/public/posts/%s" % p["id"], auth=False))
            full = full[0] if isinstance(full, list) else full
            row["format"] = fmt_of(full)
            if meta["kind"] in ("instagram", "facebook") and p["state"] == "PUBLISHED":
                try:
                    a = json.loads(get("%s/analytics/post/%s" % (API, p["id"])))
                    row["stats"] = {m["label"]: sum(float(x["total"]) for x in m["data"]) for m in a} if isinstance(a, list) else None
                except Exception as e:
                    row["stats"] = None
                time.sleep(0.3)
            ch["posts"].append(row)
        if meta["kind"] in ("instagram", "facebook"):
            ch["analytics"] = json.loads(get("%s/analytics/%s?date=%d" % (API, cid, days + 1)))
        if meta.get("tg"):
            ch["subscribers"], ch["messages"] = tg_scrape(meta["tg"], start)
            ch["messages"] = [m for m in ch["messages"] if m["date"][:10] <= end]
        data["channels"][cid] = ch
        print(meta["name"], len(ch["posts"]), "postiz posts", len(ch.get("messages") or []), "tg messages", file=sys.stderr)
    json.dump(data, open(out, "w"), ensure_ascii=False, indent=1)


if __name__ == "__main__":
    main()
