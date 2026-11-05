"""OnFin Academy launch designs: brand images, lesson-list carousel, static ads (EN + KH).
Usage: python3 build.py WORK_DIR OUT_DIR   then  node render.js WORK_DIR/jobs.json
WORK_DIR holds fonts/, frames/full/ (lesson frames), crops.json and out/brand/*.svg (from lockup.py)."""
import json, os, re, sys, html as H

W_, OUT = [os.path.abspath(a) for a in sys.argv[1:3]]
F = lambda p: "file://" + os.path.join(W_, p)
CROPS = json.load(open(os.path.join(W_, "crops.json")))
CROPS["02-1-88"] = (70, 120, 1850, 1000)  # keep the frame's marker capsule out
os.makedirs(os.path.join(W_, "pages"), exist_ok=True)
JOBS = []

RISK = {"en": "High risk: most retail CFD accounts lose money. Education, not investment advice.",
        "km": "ហានិភ័យខ្ពស់៖ គណនី CFD របស់វិនិយោគិនរាយភាគច្រើនខាតប្រាក់។ ជាការអប់រំ មិនមែនជាដំបូន្មានវិនិយោគទេ។"}
URL = "academy.onfin.io"
HANDLE = "@onfinacademy"

CSS = """
@font-face{font-family:Montserrat;src:url(%(mont)s);font-weight:100 900}
@font-face{font-family:'Kantumruy Pro';src:url(%(kant)s);font-weight:100 700}
*{box-sizing:border-box}
body{margin:0;background:#0b0b0b}
.c{position:relative;overflow:hidden;background:#0b0b0b;color:#fff;font-family:Montserrat,'Kantumruy Pro',sans-serif}
.km{font-family:Montserrat,'Kantumruy Pro',sans-serif}
.grid{position:absolute;inset:0;background-image:linear-gradient(rgba(255,255,255,.055) 1.5px,transparent 1.5px),linear-gradient(90deg,rgba(255,255,255,.055) 1.5px,transparent 1.5px);
 background-size:90px 90px;-webkit-mask-image:radial-gradient(ellipse 80%% 60%% at 75%% 18%%,#000 0%%,transparent 78%%)}
.cap{position:absolute;border:1.5px solid rgba(255,255,255,.13);border-radius:999px}
.dot{position:absolute;width:86px;height:28px;border-radius:999px;background:#9fce10}
.lime{color:#9fce10}
.coral{color:#fa876b}
.handle{position:absolute;left:60px;top:52px;display:flex;align-items:center;gap:16px;z-index:5}
.handle img{width:60px;height:60px;border-radius:50%%;border:1.5px solid rgba(255,255,255,.18)}
.handle span{font-weight:700;font-size:27px;letter-spacing:.005em}
.meta{position:absolute;right:64px;top:70px;font-weight:600;font-size:20px;letter-spacing:.18em;text-transform:uppercase;color:#999;z-index:5}
.kick{display:inline-block;padding:11px 22px;border-radius:999px;background:#9fce10;color:#000;font-weight:700;font-size:22px;letter-spacing:.14em;text-transform:uppercase}
.km .kick,.km .meta{letter-spacing:0;text-transform:none}
.kick.o{background:transparent;color:#9fce10;border:1.5px solid rgba(159,206,16,.7)}
h1,h2,p{margin:0}
.en h1{font-weight:700;letter-spacing:-.035em;line-height:1.02}
.km h1{font-weight:700;letter-spacing:0;line-height:1.38}
.en h2{font-weight:700;letter-spacing:-.03em;line-height:1.06}
.km h2{font-weight:700;letter-spacing:0;line-height:1.4}
.sub{color:#ccc;font-weight:500}
.en .sub{line-height:1.3}
.km .sub{line-height:1.6}
.risk{color:#8f8f8f;font-weight:500}
.km .risk{line-height:1.6}
.en .risk{line-height:1.35}
.well{position:relative;border-radius:12px;overflow:hidden;border:1.5px solid rgba(255,255,255,.16);background:#0b0b0b;box-shadow:0 26px 60px rgba(0,0,0,.55)}
.well img{display:block;width:100%%;height:100%%;object-fit:cover}
.btn{display:inline-flex;align-items:center;gap:14px;padding:22px 40px;border-radius:999px;background:#9fce10;color:#000;font-weight:700}
.url{display:inline-flex;align-items:center;padding:20px 32px;border-radius:999px;border:1.5px solid rgba(255,255,255,.3);color:#fff;font-weight:600}
.pill{display:inline-flex;align-items:center;justify-content:center;border-radius:999px;font-weight:700}
.phone{position:absolute;border-radius:60px;background:#151515;border:1.5px solid rgba(255,255,255,.18);padding:13px;box-shadow:0 40px 90px rgba(0,0,0,.7)}
.screen{position:relative;width:100%%;height:100%%;border-radius:48px;overflow:hidden;background:#0b0b0b}
.screen img{position:absolute;left:0;top:0;width:100%%}
.bars{position:absolute;left:22px;right:22px;top:26px;display:flex;gap:8px}
.bars i{flex:1;height:6px;border-radius:9px;background:rgba(255,255,255,.22)}
.bars i.on{background:#9fce10}
.slbl{position:absolute;left:24px;top:46px;font-weight:600;font-size:15px;letter-spacing:.16em;color:#cfcfcf}
.capt{position:absolute;left:24px;right:24px;text-align:center;font-weight:800;color:#fff;line-height:1.25}
.capt b{background:#9fce10;color:#000;padding:2px 9px;border-radius:8px}
.tabs{position:absolute;left:0;right:0;bottom:0;height:78px;border-top:1.5px solid rgba(255,255,255,.1);display:flex;justify-content:space-around;align-items:center;font-weight:600;font-size:15px;color:#888;background:#0e0e0e}
.tabs span.on{color:#9fce10}
""" % {"mont": F("fonts/Montserrat.ttf"), "kant": F("fonts/KantumruyPro.ttf")}


def rich(t):
    t = H.escape(t)
    t = re.sub(r"(\S+-\S+)", r'<span style="white-space:nowrap">\1</span>', t)
    return re.sub(r"\*([^*]+)\*", r'<span class="lime" style="white-space:nowrap">\1</span>', t)


def frame_img(key, orient="horizontal"):
    """crop a lesson frame into a jpg next to the pages, return its file URL"""
    from PIL import Image
    src = os.path.join(W_, "frames/full/%s-%s.jpg" % (key, orient))
    dst = os.path.join(W_, "pages/crop-%s-%s.jpg" % (key, orient))
    if not os.path.exists(dst):
        im = Image.open(src)
        if orient == "horizontal":
            im = im.crop(tuple(CROPS[key]))
        im.convert("RGB").save(dst, quality=94)
    return "file://" + dst


def page(name, body, w, h, lang, out):
    doc = '<!doctype html><html><head><meta charset="utf-8"><style>%s</style></head><body><div class="c %s" style="width:%dpx;height:%dpx">%s</div></body></html>' % (CSS, lang, w, h, body)
    p = os.path.join(W_, "pages", name + ".html")
    open(p, "w").write(doc)
    JOBS.append({"html": p, "out": out, "w": w, "h": h})


def deco(w, h, dot=False):
    s = '<div class="grid"></div><div class="cap" style="width:%dpx;height:%dpx;right:-%dpx;top:-%dpx"></div>' % (w * 0.95, w * 0.55, w * 0.3, w * 0.3)
    if dot:
        s += '<div class="dot" style="right:%dpx;top:%dpx"></div>' % (w * 0.22, w * 0.205)
    return s


def handle():
    return '<div class="handle"><img src="%s"><span>%s</span></div>' % ("file://" + os.path.join(OUT, "brand/onfin-academy-avatar-1080.png"), HANDLE)


def phone(x, y, w, key, caption, label, rot=0, active=0):
    h = int(w * 19.5 / 9)
    bars = "".join('<i class="%s"></i>' % ("on" if i <= active else "") for i in range(3))
    return ('<div class="phone" style="left:%dpx;top:%dpx;width:%dpx;height:%dpx;transform:rotate(%sdeg)"><div class="screen">'
            '<img src="%s"><div class="bars">%s</div><div class="slbl">%s</div>'
            '<div class="capt" style="bottom:%dpx;font-size:%dpx">%s</div>'
            '<div class="tabs"><span class="on">Learn</span><span>Saved</span><span>Profile</span></div></div></div>') % (
        x, y, w, h, rot, frame_img(key, "vertical"), bars, label, int(h * 0.2), int(w * 0.068), caption)


def card(x, y, w, key, rot=0, z=1):
    return '<div class="well" style="position:absolute;left:%dpx;top:%dpx;width:%dpx;height:%dpx;transform:rotate(%sdeg);z-index:%d"><img src="%s"></div>' % (
        x, y, w, int(w * 9 / 16), rot, z, frame_img(key))


# ---------------------------------------------------------------- copy
LESSONS = [  # key frame, EN title, EN line, KM title, KM line
    ("01-1-40", "Currency pairs", "Why every price has two currencies.", "គូរូបិយប័ណ្ណ", "ហេតុអ្វីតម្លៃនីមួយៗមានរូបិយប័ណ្ណពីរ។"),
    ("02-1-88", "How the forex market works", "A market without a building, and who trades it.", "របៀបដែលទីផ្សារ Forex ដំណើរការ", "ទីផ្សារដែលគ្មានអគារ និងអ្នកណាខ្លះជួញដូរនៅទីនោះ។"),
    ("03-1-40", "Bid, ask and the spread", "Two prices on every quote, and what the gap costs you.", "Bid, Ask និង Spread", "តម្លៃពីរលើគូនីមួយៗ និងថ្លៃ Spread ដែលអ្នកបង់។"),
    ("04-1-40", "Pips", "How price moves are counted.", "Pip", "របៀបរាប់ចលនាតម្លៃ។"),
    ("05-3-40", "Lots and position size", "What 1 lot actually buys, and why to start small.", "Lot និងទំហំ Position", "ទំហំ 1 lot ពិតជាប៉ុន្មាន និងហេតុអ្វីគួរចាប់ផ្តើមពីតូច។"),
    ("06-2-65", "Pip value", "Turning pips into money, for any pair.", "តម្លៃ Pip", "បម្លែង Pip ទៅជាប្រាក់ សម្រាប់គូណាក៏បាន។"),
    ("07-2-65", "Leverage", "Controlling more with less, and why losses grow too.", "Leverage", "គ្រប់គ្រងទំហំធំដោយប្រើប្រាក់តិច និងហេតុអ្វីការខាតក៏ធំដែរ។"),
    ("08-2-65", "Margin and swaps", "Used margin, free margin and overnight fees.", "Margin និង Swap", "Used margin, Free margin និងថ្លៃរក្សាទុកពេលយប់។"),
    ("09-1-88", "Margin level, margin call and stop-out", "What happens when free margin runs out.", "Margin level, Margin call និង Stop-out", "អ្វីកើតឡើងនៅពេល Free margin អស់។"),
    ("10-3-40", "Trading sessions", "Sydney, Tokyo, London, New York, and when spreads widen.", "ម៉ោងជួញដូរ (Sessions)", "Sydney, Tokyo, London, New York និងពេលដែល Spread រីកធំ។"),
    ("11-1-40", "Orders, stop loss and take profit", "Market and pending orders, and how to set your exits.", "Order, Stop loss និង Take profit", "Market order និង Pending order ព្រមទាំងរបៀបកំណត់ចំណុចចេញ។"),
    ("12-1-65", "A trade, step by step", "Plan it, size it, place it on demo, review it.", "ការជួញដូរមួយ ជាជំហានៗ", "រៀបផែនការ កំណត់ទំហំ ដាក់លើគណនីសាកល្បង ហើយពិនិត្យឡើងវិញ។"),
]
GROUPS = [
    ("Lessons 1 to 3", "Start with how the *market* works.", "មេរៀនទី 1 ដល់ 3", "ចាប់ផ្តើមពីរបៀបដែល*ទីផ្សារ*ដំណើរការ។"),
    ("Lessons 4 to 6", "Then the *numbers* behind every trade.", "មេរៀនទី 4 ដល់ 6", "បន្ទាប់មក *លេខ* នៅពីក្រោយការជួញដូរនីមួយៗ។"),
    ("Lessons 7 to 9", "Then the *risks*, in plain numbers.", "មេរៀនទី 7 ដល់ 9", "បន្ទាប់មក *ហានិភ័យ* ជាលេខងាយយល់។"),
    ("Lessons 10 to 12", "Then put it *together*, on demo.", "មេរៀនទី 10 ដល់ 12", "បន្ទាប់មក ដាក់វា*បញ្ចូលគ្នា* លើគណនីសាកល្បង។"),
]
T = {
    "en": dict(meta="Forex basics", kick="Free forex course", cover="Learn forex in *3-minute* lessons.",
               cover_sub="12 free video lessons, from currency pairs to your first demo trade.", swipe="Swipe →",
               how_h="Watch. Quiz. *Unlock.*",
               steps=[("Watch a lesson", "Three short chapters, about 3 minutes in all."),
                      ("Take the quiz", "Two questions check what you just learned."),
                      ("Unlock the next one", "Your streak and progress are saved to your free account.")],
               cta_q="Which lesson would you *start* with?", cta_btn="Sign up free", cta_follow="Follow @onfinacademy for short lesson clips.",
               lang_note=None, start="Start free"),
    "km": dict(meta="Forex basics", kick="វគ្គ Forex ឥតគិតថ្លៃ", cover="រៀន Forex តាមមេរៀន*ប្រហែល 3 នាទី*",
               cover_sub="មេរៀនវីដេអូឥតគិតថ្លៃ 12 ចាប់ពីគូរូបិយប័ណ្ណ ដល់ការជួញដូរលើគណនីសាកល្បងលើកដំបូង។", swipe="អូសមើល →",
               how_h="មើល។ ឆ្លើយ។ *ដោះសោ។*",
               steps=[("មើលមេរៀន", "ជំពូកខ្លីៗ 3 សរុបប្រហែល 3 នាទី។"),
                      ("ឆ្លើយសំណួរ", "សំណួរ 2 ពិនិត្យអ្វីដែលអ្នកទើបរៀន។"),
                      ("ដោះសោមេរៀនបន្ទាប់", "Streak និងវឌ្ឍនភាពរបស់អ្នក ត្រូវបានរក្សាទុកក្នុងគណនីឥតគិតថ្លៃ។")],
               cta_q="តើអ្នកនឹង*ចាប់ផ្តើម*ពីមេរៀនណា?", cta_btn="ចុះឈ្មោះឥតគិតថ្លៃ", cta_follow="តាមដាន @onfinacademy សម្រាប់វីដេអូមេរៀនខ្លីៗ។",
               lang_note="មេរៀនជាភាសាអង់គ្លេស", start="ចាប់ផ្តើមឥតគិតថ្លៃ"),
}


# ---------------------------------------------------------------- brand
def brand():
    st = F("out/brand/onfin-academy-stacked-dark.svg")
    page("avatar", '<div class="grid" style="-webkit-mask-image:radial-gradient(circle at 50%% 50%%,#000 0%%,transparent 70%%)"></div>'
         '<img src="%s" style="position:absolute;left:250px;top:%dpx;width:580px">' % (st, 540 - int(580 * 1065 / 2133 / 2)),
         1080, 1080, "en", os.path.join(OUT, "brand/onfin-academy-avatar-1080.png"))
    for lang, tag, sub in (("en", "Free forex course. 12 short lessons, made for your phone.", URL),
                           ("km", "វគ្គ Forex ឥតគិតថ្លៃ។ មេរៀនខ្លីៗ 12 សម្រាប់ទូរសព្ទរបស់អ្នក។", URL)):
        cards = (card(-60, 90, 420, "04-1-40", -7) + card(-30, 390, 420, "07-2-65", 5) +
                 card(1280, 70, 420, "03-1-40", 6) + card(1250, 380, 420, "10-3-40", -5))
        body = deco(1640, 624, dot=False) + cards + (
            '<div style="position:absolute;left:0;right:0;top:0;bottom:0;background:linear-gradient(90deg,rgba(11,11,11,.2) 0%%,rgba(11,11,11,.96) 24%%,rgba(11,11,11,.96) 76%%,rgba(11,11,11,.2) 100%%);z-index:2"></div>'
            '<div style="position:absolute;left:300px;right:300px;top:150px;text-align:center;z-index:3">'
            '<img src="%s" style="width:720px">'
            '<p class="sub" style="font-size:%dpx;margin-top:38px">%s</p>'
            '<p style="margin-top:26px"><span class="url" style="font-size:24px;padding:14px 28px;border-color:rgba(159,206,16,.7);color:#9fce10">%s</span></p></div>') % (
            F("out/brand/onfin-academy-lockup-dark.svg"), 30 if lang == "en" else 27, H.escape(tag), sub)
        page("fbcover-" + lang, body, 1640, 624, lang, os.path.join(OUT, "brand/onfin-academy-fb-cover-%s.png" % lang))
    for i, (en, km) in enumerate([("Lessons", "មេរៀន"), ("Quiz", "សំណួរ"), ("Glossary", "វាក្យសព្ទ"), ("Demo", "គណនីសាកល្បង"), ("FAQ", "សំណួរញឹកញាប់")]):
        body = ('<div style="position:absolute;left:290px;top:710px;width:500px;height:500px;border-radius:50%%;border:2px solid rgba(159,206,16,.75);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:18px">'
                '<span style="font-weight:700;font-size:76px;letter-spacing:-.02em">%s</span><span style="font-weight:600;font-size:40px;color:#9fce10">%s</span></div>') % (en, km)
        page("hl-%d" % i, '<div class="grid"></div>' + body, 1080, 1920, "km", os.path.join(OUT, "brand/highlight-cover-%02d-%s.png" % (i + 1, en.lower())))


# ---------------------------------------------------------------- carousel
def carousel(lang):
    t = T[lang]; o = os.path.join(OUT, "carousel", lang); W, Hh = 1080, 1350
    en = lang == "en"
    # 1 cover
    body = deco(W, Hh, dot=True) + handle() + '<div class="meta">%s</div>' % t["meta"]
    body += card(60, 230, 370, "04-1-40", -8, 1) + card(650, 400, 370, "07-2-65", 7, 1)
    body += phone(375, 130, 330, "03-1-40", "you could sell at <b>1.1197</b>", "LESSON 3 · CHAPTER 1", 0, 0).replace('class="phone"', 'class="phone" ', 1).replace("transform:rotate(0deg)", "transform:rotate(0deg);z-index:3")
    body += ('<div style="position:absolute;left:0;right:0;bottom:0;height:560px;background:linear-gradient(180deg,rgba(11,11,11,0),rgba(11,11,11,.97) 38%%);z-index:4"></div>'
             '<div style="position:absolute;left:80px;right:80px;bottom:92px;z-index:5;display:flex;flex-direction:column;gap:%dpx">'
             '<span class="kick" style="align-self:flex-start">%s</span><h1 style="font-size:%dpx">%s</h1><p class="sub" style="font-size:%dpx">%s</p></div>'
             '<div style="position:absolute;right:64px;bottom:48px;z-index:5;font-weight:600;font-size:22px;letter-spacing:.16em;color:#9fce10;text-transform:uppercase">%s</div>') % (
        26 if en else 22, t["kick"], 92 if en else 72, rich(t["cover"]), 31 if en else 28, H.escape(t["cover_sub"]), t["swipe"])
    page("car-%s-01" % lang, body, W, Hh, lang, os.path.join(o, "academy-%s-01.jpg" % lang))
    # 2-5 lesson groups
    for g in range(4):
        gl, gh, kl, kh = GROUPS[g]
        rows = ""
        for j in range(3):
            n = g * 3 + j; key, et, el, kt, kl2 = LESSONS[n]
            title, line = (et, el) if en else (kt, kl2)
            rows += ('<div style="display:flex;gap:36px;align-items:center">'
                     '<div class="well" style="width:420px;height:236px;flex:none"><img src="%s"></div>'
                     '<div style="display:flex;flex-direction:column;gap:%dpx">'
                     '<span class="pill" style="align-self:flex-start;border:1.5px solid rgba(159,206,16,.8);color:#9fce10;font-size:21px;padding:6px 16px;letter-spacing:.1em">%02d</span>'
                     '<h2 style="font-size:%dpx">%s</h2><p class="sub" style="font-size:%dpx">%s</p></div></div>') % (
                frame_img(key), 12 if en else 8, n + 1, 36 if en else 31, H.escape(title), 25 if en else 23, H.escape(line))
        body = deco(W, Hh) + handle() + '<div class="meta">%s</div>' % t["meta"]
        body += ('<div style="position:absolute;left:80px;right:70px;top:170px;display:flex;flex-direction:column;gap:22px">'
                 '<span class="kick o" style="align-self:flex-start">%s</span><h1 style="font-size:%dpx">%s</h1></div>'
                 '<div style="position:absolute;left:80px;right:60px;top:%dpx;display:flex;flex-direction:column;gap:40px">%s</div>') % (
            gl if en else kl, 62 if en else 50, rich(gh if en else kh), 430 if en else 450, rows)
        page("car-%s-%02d" % (lang, g + 2), body, W, Hh, lang, os.path.join(o, "academy-%s-%02d.jpg" % (lang, g + 2)))
    # 6 how it works
    steps = ""
    for i, (a, b) in enumerate(t["steps"]):
        steps += ('<div style="display:flex;gap:34px;align-items:flex-start;position:relative">'
                  '<span class="pill" style="flex:none;width:92px;height:92px;font-size:34px;%s">%02d</span>'
                  '<div style="padding-top:8px;display:flex;flex-direction:column;gap:12px"><h2 style="font-size:%dpx">%s</h2><p class="sub" style="font-size:%dpx">%s</p></div></div>') % (
            "background:#9fce10;color:#000" if i == 0 else "border:1.5px solid rgba(255,255,255,.35);color:#fff;background:#0b0b0b", i + 1, 46 if en else 40, H.escape(a), 29 if en else 26, H.escape(b))
    body = deco(W, Hh) + handle() + '<div class="meta">%s</div>' % t["meta"]
    body += ('<div style="position:absolute;left:125px;top:520px;width:1.5px;height:470px;background:rgba(255,255,255,.16)"></div>'
             '<div style="position:absolute;left:80px;right:80px;top:200px;display:flex;flex-direction:column;gap:22px">'
             '<span class="kick o" style="align-self:flex-start">%s</span><h1 style="font-size:%dpx">%s</h1></div>'
             '<div style="position:absolute;left:80px;right:80px;top:500px;display:flex;flex-direction:column;gap:84px">%s</div>') % (
        "How it works" if en else "របៀបដែលវាដំណើរការ", 96 if en else 80, rich(t["how_h"]), steps)
    page("car-%s-06" % lang, body, W, Hh, lang, os.path.join(o, "academy-%s-06.jpg" % lang))
    # 7 CTA
    STRIP = "".join(card(80 + i * 236, 990 if en else 1010, 212, k, 0, 1).replace("box-shadow", "opacity:.9;box-shadow") for i, k in enumerate(["01-1-40", "04-1-40", "07-2-65", "11-1-40"]))
    body = deco(W, Hh) + handle()
    body += ('<div style="position:absolute;left:80px;right:80px;top:250px;display:flex;flex-direction:column;align-items:center;text-align:center;gap:%dpx">'
             '<img src="%s" style="width:760px;margin-bottom:40px">'
             '<h1 style="font-size:%dpx">%s</h1>'
             '<div style="display:flex;gap:22px;margin-top:24px"><span class="btn" style="font-size:%dpx">%s</span><span class="url" style="font-size:30px">%s</span></div>'
             '%s<p class="sub" style="font-size:%dpx;margin-top:26px">%s</p></div>' + STRIP +
             '<p class="risk" style="position:absolute;left:80px;right:80px;bottom:70px;text-align:center;font-size:%dpx">%s</p>') % (
        30 if en else 24, F("out/brand/onfin-academy-lockup-dark.svg"), 76 if en else 62, rich(t["cta_q"]), 32 if en else 28, t["cta_btn"], URL,
        ('<p class="sub" style="font-size:24px;color:#999">%s</p>' % t["lang_note"]) if t["lang_note"] else "",
        28 if en else 25, H.escape(t["cta_follow"]), 21 if en else 20, H.escape(RISK[lang]))
    page("car-%s-07" % lang, body, W, Hh, lang, os.path.join(o, "academy-%s-07.jpg" % lang))


# ---------------------------------------------------------------- statics
STATICS = [  # id, visual, EN hook, EN sub, KM hook, KM sub
    ("pip", ("card", "04-1-40"), "What is a *pip*?", "Lesson 4 of 12. Free.", "Pip គឺជា*អ្វី*?", "មេរៀនទី 4 ក្នុងចំណោម 12។ ឥតគិតថ្លៃ។"),
    ("two-prices", ("card", "03-1-40"), "Why your broker shows *two prices*", "Lesson 3: bid, ask and the spread.", "ហេតុអ្វីឈ្មួញកណ្តាល បង្ហាញ*តម្លៃពីរ*?", "មេរៀនទី 3៖ Bid, Ask និង Spread។"),
    ("leverage", ("card", "07-2-65"), "Leverage cuts *both ways*.", "Lesson 7 shows how losses grow too.", "Leverage ពង្រីកទាំង*ចំណេញ និងការខាត*។", "មេរៀនទី 7 បង្ហាញពីរបៀបដែលការខាតក៏កើនឡើងដែរ។"),
    ("3-minutes", ("phone", "01-1-40", "one euro cost <b>about</b>", "LESSON 1 · CHAPTER 1"), "Learn forex in *3-minute* lessons.", "12 short video lessons, made for your phone.",
     "រៀន Forex តាមមេរៀន*ប្រហែល 3 នាទី*", "មេរៀនវីដេអូខ្លីៗ 12 សម្រាប់ទូរសព្ទរបស់អ្នក។"),
    ("free-12", ("grid",), "Free. 12 lessons. *Quizzes included.*", "From currency pairs to your first demo trade.",
     "ឥតគិតថ្លៃ។ មេរៀន 12។ *មានសំណួរតេស្ត។*", "ពីគូរូបិយប័ណ្ណ ដល់ការជួញដូរលើគណនីសាកល្បងលើកដំបូង។"),
    ("demo-trade", ("card", "11-1-40"), "From zero to your first *demo trade*.", "12 lessons, then practise on a free demo account.",
     "ពីសូន្យ ដល់ការជួញដូរលើ*គណនីសាកល្បង*លើកដំបូង", "មេរៀន 12 បន្ទាប់មកហាត់លើគណនីសាកល្បងឥតគិតថ្លៃ។"),
]


def static(lang, s, fmt):
    sid, vis, eh, es, kh, ks = s
    en = lang == "en"; t = T[lang]
    W, Hh = (1080, 1350) if fmt == "feed" else (1080, 1920)
    top = 70 if fmt == "feed" else 280            # Meta story/reel safe zone: top 250, bottom 340 to 420
    bottom_limit = Hh - (60 if fmt == "feed" else 430)
    hook, sub = (eh, es) if en else (kh, ks)
    hsize = (82 if fmt == "feed" else 92) if en else (64 if fmt == "feed" else 72)
    body = deco(W, Hh)
    body += '<img src="%s" style="position:absolute;left:80px;top:%dpx;width:330px;z-index:5">' % (F("out/brand/onfin-academy-lockup-dark.svg"), top + 20)
    body += '<span style="position:absolute;right:80px;top:%dpx;font-weight:600;font-size:%dpx;letter-spacing:%s;color:#9fce10;text-transform:uppercase">%s</span>' % (top + 24 if en else top + 18, 20 if en else 24, ".18em" if en else "0", "Free course" if en else "ឥតគិតថ្លៃ")
    htop = top + 130
    body += '<h1 style="position:absolute;left:80px;right:80px;top:%dpx;font-size:%dpx;z-index:5">%s</h1>' % (htop, hsize, rich(hook))
    vis_top = htop + (250 if en else 270) + (40 if fmt == "story" else 0)
    vis_h = (bottom_limit - 250) - vis_top
    if vis[0] == "card":
        w = 920; h = int(w * 9 / 16)
        y = vis_top + max(0, (vis_h - h) // 2)
        body += '<div class="well" style="position:absolute;left:80px;top:%dpx;width:%dpx;height:%dpx"><img src="%s"></div>' % (y, w, h, frame_img(vis[1]))
    elif vis[0] == "phone":
        pw = min(int(vis_h * 9 / 19.5), 400); y = vis_top
        body += card(40, y + 120, 330, "04-1-40", -8, 1) + card(710, y + 260, 330, "06-2-65", 7, 1)
        body += phone((W - pw) // 2, y, pw, vis[1], vis[2], vis[3]).replace("transform:rotate(0deg)", "transform:rotate(0deg);z-index:3")
    else:  # 12-lesson grid
        cw, gap = 215, 20; ch = int(cw * 9 / 16); rows = 3
        gh = rows * ch + (rows - 1) * gap
        y0 = vis_top + max(0, (vis_h - gh) // 2)
        for n, l in enumerate(LESSONS):
            x = 80 + (n % 4) * (cw + gap); y = y0 + (n // 4) * (ch + gap)
            body += ('<div class="well" style="position:absolute;left:%dpx;top:%dpx;width:%dpx;height:%dpx;box-shadow:none"><img src="%s">'
                     '<span class="pill" style="position:absolute;left:10px;top:10px;background:#9fce10;color:#000;font-size:17px;padding:4px 11px">%02d</span></div>') % (
                x, y, cw, ch, frame_img(l[0]), n + 1)
    body += ('<div style="position:absolute;left:80px;right:80px;top:%dpx;display:flex;flex-direction:column;gap:%dpx;z-index:5">'
             '<p class="sub" style="font-size:%dpx">%s</p>'
             '<div style="display:flex;gap:18px;align-items:center"><span class="btn" style="font-size:%dpx;padding:20px 36px">%s</span><span class="url" style="font-size:26px;padding:18px 28px">%s</span></div>'
             '<p class="risk" style="font-size:%dpx">%s</p></div>') % (
        bottom_limit - 236, 22 if en else 16, 31 if en else 27, H.escape(sub), 28 if en else 25, t["start"], URL, 19 if en else 18, H.escape(RISK[lang]))
    out = os.path.join(OUT, "statics", lang, "academy-static-%s-%s-%s.jpg" % (sid, fmt, lang))
    page("st-%s-%s-%s" % (sid, fmt, lang), body, W, Hh, lang, out)


if __name__ == "__main__":
    brand()
    for lang in ("en", "km"):
        carousel(lang)
        for s in STATICS:
            for fmt in ("feed", "story"):
                static(lang, s, fmt)
    json.dump(JOBS, open(os.path.join(W_, "jobs.json"), "w"), indent=0)
    print(len(JOBS), "jobs")
