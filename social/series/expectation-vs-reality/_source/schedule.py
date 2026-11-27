"""Schedule the expectation vs reality series: one post every Saturday at 12:00 UTC from 28 Nov 2026.
Facebook and Telegram: single photo (@onfinkm version). Instagram: @onfinacademy (feed is blocked on @onfinkm). Log: sched_log.json"""
import datetime, json, os, subprocess
KEY = os.environ["POSTIZ_API_KEY"]
HERE = os.path.dirname(os.path.abspath(__file__)); R = os.path.dirname(HERE)
CAP = json.load(open(os.path.join(R, "captions.json"), encoding="utf-8"))
LOG = os.path.join(HERE, "sched_log.json"); log = json.load(open(LOG)) if os.path.exists(LOG) else {}
up = log.setdefault("_uploads", {})
RISK = {"en": "Not investment advice. CFDs are high-risk; you may lose money.", "ms": "Bukan nasihat pelaburan. CFD berisiko tinggi; anda mungkin kehilangan wang.",
        "ru": "Не является инвестиционной рекомендацией. CFD относятся к высокорисковым инструментам; вы можете потерять деньги.", "es": "No es asesoramiento de inversión. Los CFD son de alto riesgo; puedes perder dinero."}
def sh(*a): return subprocess.run(list(a), capture_output=True, text=True).stdout
def upload(rel):
    if rel not in up:
        r = json.loads(sh("curl", "-s", "-m", "300", "-X", "POST", "https://api.postiz.com/public/v1/upload", "-H", "Authorization: " + KEY, "-F", "file=@" + os.path.join(R, rel)))
        up[rel] = {"id": r["id"], "path": r["path"]}; json.dump(log, open(LOG, "w"), indent=1, ensure_ascii=False)
    return dict(up[rel])
def html(text, lang, tags=False):
    paras = [p for p in text.split("\n") if p.strip()] + [RISK[lang]] + (["#onfin #trading #forex #tradingpsychology"] if tags else [])
    return "".join("<p>%s</p>" % p for p in paras)
CH = [("fb", "cmvjg1etr08j7lf0yde4p29lr", "en", {"__type": "facebook", "post_type": "post"}),
      ("ig-academy", "cmw9a192j03d0nv0761qpllao", "en", {"__type": "instagram", "post_type": "post"}),
      ("tg-kh", "cmvjfl0ed087glf0yuoz284sa", "en", {"__type": "telegram"}),
      ("tg-en", "cmuv1mlcb001dmo0ylwenjxe1", "en", {"__type": "telegram"}),
      ("tg-ms", "cmuv1oz5o002gql0y49vluhy3", "ms", {"__type": "telegram"}),
      ("tg-ru", "cmuv1nud2001qmo0y7xgzq68r", "ru", {"__type": "telegram"}),
      ("tg-es", "cmvjg3htg08k9lf0yunmvtsqu", "es", {"__type": "telegram"})]
ORDER = ["curve", "time", "wins", "news"]
day0 = datetime.date(2026, 11, 28)
for i, slug in enumerate(ORDER):
    date = "%sT12:00:00.000Z" % (day0 + datetime.timedelta(weeks=i)).isoformat()
    for key, integ, lang, st in CH:
        k = "%s:%s" % (slug, key)
        if k in log: continue
        img = ("ig-academy/" if key == "ig-academy" else "") + "evr-%02d-%s.jpg" % (i + 1, slug)
        m = dict(upload(img), alt="Expectation vs reality: " + CAP[slug]["en"].split("\n")[0].split(": ", 1)[1].rstrip("."))
        body = {"type": "schedule", "date": date, "shortLink": False, "tags": [],
                "posts": [{"integration": {"id": integ}, "value": [{"content": html(CAP[slug][lang], lang, key.startswith("ig")), "image": [m]}], "settings": st}]}
        r = sh("curl", "-s", "-m", "60", "-X", "POST", "https://api.postiz.com/public/v1/posts", "-H", "Authorization: " + KEY, "-H", "Content-Type: application/json", "--data-binary", json.dumps(body))
        try: pid = json.loads(r)[0]["postId"]
        except Exception: print("FAILED", k, r[:300]); continue
        log[k] = {"id": pid, "date": date}; json.dump(log, open(LOG, "w"), indent=1, ensure_ascii=False)
        print(k, pid, date)
