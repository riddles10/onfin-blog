"""Generic 8-slide Sunday guide carousel (OnFin IG library), all four locales.

A carousel module (wk/car_<key>.py) defines:
  KEY   = "sltp"                       # short id, used in file names
  SLUG  = "stop-loss-vs-take-profit-how-to-set-them-correctly"   # blog slug (exists in en/ru/es/ms)
  COVER = "sltp-cover.jpg"             # file in scratchpad/w1/media
  GUIDE = 2                            # guide number shown in meta
  SLIDES = {lang: dict(cover=..., s2=(template, props), ..., s7=(template, props), end=...)}  for en, ru, es, ms
           cover: props for CarouselCover (kicker, title, subtitle)   (meta/index/total/media added here)
           s2..s7: (template_name, props) for slides 2..7, any of CarouselText, CarouselList, CarouselCompare,
                   CarouselSteps, CarouselRates, CarouselMyth, CarouselStat, CarouselTimeline
                   (meta/index/total added here; pass disclaimer=True on Steps/Rates/Stat to add the full risk warning)
           end:   props for CarouselEnd (kicker, heading, body, actions)  = the "follow us on Instagram" CTA
  CAP   = {lang: [title line, line, line]}   # caption body; links, CTA and risk lines are appended here
  TAGS  = "#forextrading ... #onfin"         # Instagram hashtags
"""
from common import S, FULL_RISK

M = f"file://{S}/w1/media"
META = {"en": "Guide {:03d}", "ru": "Гайд {:03d}", "es": "Guía {:03d}", "ms": "Panduan {:03d}"}
GUIDE_LBL = {"en": "Full guide", "ru": "Полный гайд", "es": "Guía completa", "ms": "Panduan penuh"}
FOLLOW = {"en": "Follow us on Instagram: instagram.com/onfinkm", "ru": "Подписывайтесь в Instagram: instagram.com/onfinkm",
          "es": "Síguenos en Instagram: instagram.com/onfinkm", "ms": "Ikuti kami di Instagram: instagram.com/onfinkm"}
TG_TIME = {"en": 8, "kh": 8, "ms": 8, "ru": 9, "es": 14, "fb": 8}
TOT = 8


def slides(W, mod, l, end_kind):
    d = mod.SLIDES[l]
    meta = META[l].format(mod.GUIDE)
    f = lambda i, sfx="": f"{mod.KEY}-{l}-{i:02d}{sfx}.png"
    out = [W.lib("CarouselCover", dict(media=f"{M}/{mod.COVER}", meta=meta, index=1, total=TOT, **d["cover"]), f(1))]
    for i in range(2, 8):
        tpl, props = d[f"s{i}"]
        props = dict(props)
        if props.get("disclaimer") is True:
            props["disclaimer"] = FULL_RISK[l]
        out.append(W.lib(tpl, dict(meta=meta, index=i, total=TOT, **props), f(i)))
    if end_kind == "telegram":  # English only (Facebook / Instagram)
        out.append(W.lib("CarouselTelegram", dict(locale="en", channel="onfinkm", kicker="Telegram", meta=meta,
                   heading="More guides,\n*straight* to Telegram.",
                   items=["Daily analysis on FX, gold and indices", "Calendar alerts before NFP, CPI and FOMC", "Platform news first"],
                   index=8, total=TOT), f(8, "-telegram")))
    else:
        out.append(W.lib("CarouselEnd", dict(meta=meta, index=8, total=TOT, **d["end"]), f(8)))
    return out


def build(W, mod, day, ig_cta):
    """ig_cta: 'telegram' or 'instagram' (Facebook gets the other one). Telegram channels always get the Instagram CTA."""
    fb_cta = "instagram" if ig_cta == "telegram" else "telegram"
    blog = lambda l: f"https://blog.onfin.io/{l}/{mod.SLUG}"
    sets = {l: slides(W, mod, l, "instagram") for l in ("en", "ru", "es", "ms")}
    en_tg = sets["en"][:7] + [slides(W, mod, "en", "telegram")[7]] if "telegram" in (ig_cta, fb_cta) else None
    ig_imgs = en_tg if ig_cta == "telegram" else sets["en"]
    fb_imgs = en_tg if fb_cta == "telegram" else sets["en"]
    cta_line = {"telegram": "Join our Telegram channel: https://t.me/onfinkm", "instagram": FOLLOW["en"]}
    W.post(f"carousel-{mod.KEY}", "ig", f"{day}T12:00:00Z",
           mod.CAP["en"] + (["Join our Telegram channel for more guides: t.me/onfinkm"] if ig_cta == "telegram" else ["Follow @onfinkm for a new guide every Sunday."])
           + ["Full guide on blog.onfin.io", mod.TAGS, FULL_RISK["en"]], ig_imgs)
    W.post(f"carousel-{mod.KEY}", "fb", f"{day}T08:00:00Z", mod.CAP["en"] + [f"{GUIDE_LBL['en']}: {blog('en')}", cta_line[fb_cta], FULL_RISK["en"]], fb_imgs)
    for ch, l in [("en", "en"), ("kh", "en"), ("ms", "ms"), ("ru", "ru"), ("es", "es")]:
        W.post(f"carousel-{mod.KEY}", ch, f"{day}T{TG_TIME[ch]:02d}:00:00Z", mod.CAP[l] + [f"{GUIDE_LBL[l]}: {blog(l)}", FOLLOW[l], FULL_RISK[l]], sets[l])
    alert = W.lib("StoryAlert", dict(kicker="New guide", title=mod.SLIDES["en"]["cover"]["title"], media=f"file://{W.out}/{mod.KEY}-en-01.png",
                  cta="See the post", meta=META["en"].format(mod.GUIDE)), f"story-alert-{mod.KEY}.png")
    W.post(f"story-alert-{mod.KEY}", "ig", f"{day}T12:30:00Z", [], [alert], story=True)
