"""OnFin Academy launch videos: lesson clip reels and the 30 s trailer, in English (en) and Khmer (km).

  python3 acad_build.py reels [id ...]     -> out/reels/academy-<id>-<lang>.mp4
  python3 acad_build.py trailer            -> out/trailer/academy-trailer-<9x16|16x9>-<lang>.mp4
  python3 acad_build.py check FILE...      -> contact sheet, duration, loudness

Source: the clean lesson masters in the academy-media bucket (src/<slug>-<chapter>-<vertical|horizontal>.mp4),
word timings from words.json, the trailer voiceover (vo/trailer_vo.mp3, Adam Hughes, ElevenLabs v4 via Magnific).
Captions are burned in with libass (ass filter, shaping=complex, which Khmer needs). Cards are rendered with Chromium.
"""
import json, os, re, subprocess, sys
from PIL import Image, ImageDraw, ImageFont

A = os.path.dirname(os.path.abspath(__file__))
SRC, WORK, OUT, FD, FONTS = (os.path.join(A, d) for d in ("src", "work", "out", "fontdl", "fonts"))
D = json.load(open(os.path.join(A, "reels.json"), encoding="utf-8"))
LIME, BG = "#9fce10", "#0b0b0b"
BOX_H, BOX_Y0 = 1100, 330          # crop of the vertical master that holds the lesson graphics
RAQM = ImageFont.Layout.RAQM


def sh(*a):
    subprocess.run([str(x) for x in a], check=True)


def dur(p):
    return float(subprocess.check_output(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", p]))


# ---------- HTML rendering ----------
FONT_CSS = """
@font-face{font-family:'Montserrat';src:url('file://%(fd)s/Montserrat.ttf');font-weight:100 900;}
@font-face{font-family:'Kantumruy Pro';src:url('file://%(fd)s/KantumruyPro-w600.ttf');font-weight:600;}
@font-face{font-family:'Kantumruy Pro';src:url('file://%(fd)s/KantumruyPro-w700.ttf');font-weight:700;}
html,body{margin:0;padding:0}
body{font-family:'Montserrat','Kantumruy Pro',sans-serif;-webkit-font-smoothing:antialiased}
.km{letter-spacing:0 !important;text-transform:none !important}
""" % {"fd": FD}
PATHS = [l.split("\t", 1) for l in open(os.path.join(A, "brand", "paths.txt")).read().splitlines()]


BRAND = os.environ.get("ACADEMY_BRAND", os.path.join(A, "..", "..", "brand"))  # the shared lockup and avatar


def lockup_svg(h):
    """The campaign's shared OnFin Academy lockup (brand/onfin-academy-lockup-dark.svg, viewBox 4935x512)."""
    return '<img src="file://%s/onfin-academy-lockup-dark.svg" style="height:%dpx;display:block">' % (BRAND, h)


def logomark_svg(w):
    body = "".join(p for k, p in PATHS if k in ("cap", "on"))
    return '<svg width="%d" viewBox="120 207 1110 510" xmlns="http://www.w3.org/2000/svg" style="display:block">%s</svg>' % (w, body)


def render(jobs):
    """jobs: [(name, html, w, h, transparent)] -> {name: layout}; PNGs land next to the html in WORK/html/."""
    hd = os.path.join(WORK, "html"); os.makedirs(hd, exist_ok=True)
    spec = []
    for name, html, w, h, tr in jobs:
        hp = os.path.join(hd, name + ".html")
        open(hp, "w", encoding="utf-8").write("<!doctype html><html><head><meta charset='utf-8'><style>%s</style></head>%s</html>" % (FONT_CSS, html))
        spec.append({"html": hp, "out": os.path.join(hd, name + ".png"), "w": w, "h": h, "transparent": tr})
    jf = os.path.join(hd, "_jobs.json"); json.dump(spec, open(jf, "w"))
    res = json.loads(subprocess.run(["node", os.path.join(A, "shot.js"), jf], check=True, capture_output=True, text=True).stdout.strip().splitlines()[-1])
    return {os.path.basename(r["out"])[:-4]: r["layout"] for r in res}


def png(name):
    return os.path.join(WORK, "html", name + ".png")


GRID = ("<div style='position:absolute;inset:0;background-image:linear-gradient(rgba(255,255,255,.06) 1.5px,transparent 1.5px),"
        "linear-gradient(90deg,rgba(255,255,255,.06) 1.5px,transparent 1.5px);background-size:90px 90px;"
        "-webkit-mask-image:radial-gradient(ellipse at 50%% 45%%,#000 0%%,transparent 70%%)'></div>"
        "<div style='position:absolute;right:-%dpx;top:-%dpx;width:%dpx;height:%dpx;border:1.5px solid rgba(255,255,255,.12);border-radius:999px'></div>")


def card_html(hook, lang):
    km = lang == "km"
    hook_css = ("font-size:50px;font-weight:600;line-height:1.55" if km else "font-size:58px;font-weight:500;line-height:1.22;letter-spacing:-0.01em")
    return """<body style="width:1080px;height:1920px;background:#fff">
<div id="card" style="position:absolute;left:60px;right:60px">
 <div style="display:flex;align-items:center;gap:26px">
  <img src="file://%s/onfin-academy-avatar-1080.png" style="width:116px;height:116px;border-radius:50%%;display:block">
  <div><div style="font-size:46px;font-weight:700;color:#0f1419;line-height:1.1">OnFin Academy</div>
       <div style="font-size:36px;font-weight:500;color:#536471;line-height:1.25;margin-top:4px">academy.onfin.io</div></div>
 </div>
 <p class="%s" style="margin:30px 0 0;color:#0f1419;%s">%s</p>
</div>
<script>window.layout=()=>{const box_h=%d;const c=document.getElementById('card');const ch=c.getBoundingClientRect().height;
const gap=44,vy=Math.round((1920-box_h)/2);const top=Math.max(60,vy-gap-Math.round(ch));c.style.top=top+'px';
return {video_y:Math.max(vy,top+Math.round(ch)+gap),card_h:Math.round(ch),top:top}}</script></body>""" % (
        BRAND, lang, hook_css, hook, BOX_H)


def risk_html(lang, vy):
    km = lang == "km"
    return """<body style="width:1080px;height:1920px;background:transparent">
<div class="%s" style="position:absolute;left:70px;right:70px;top:%dpx;transform:translateY(-100%%);text-align:center;color:rgba(255,255,255,.58);font-size:%dpx;font-weight:500;line-height:%s">%s</div></body>""" % (
        lang, vy + BOX_H - 22, 24 if km else 25, 1.5 if km else 1.3, D["risk"][lang])


def endcard_html(lang, w, h, l1, l2, scale=1.0):
    km = lang == "km"
    s = scale
    big = "font-size:%dpx;font-weight:%d;line-height:%s;%s" % (round((54 if km else 64) * s), 700 if not km else 700, "1.5" if km else "1.15", "" if km else "letter-spacing:-0.02em")
    pill = "display:inline-block;margin-top:%dpx;background:%s;color:#000;border-radius:100px;padding:%dpx %dpx;font-size:%dpx;font-weight:600;line-height:1.35" % (
        round(44 * s), LIME, round(20 * s), round(40 * s), round((34 if km else 38) * s))
    return """<body style="width:%dpx;height:%dpx;background:%s;overflow:hidden;position:relative">%s
<div style="position:absolute;left:0;right:0;top:50%%;transform:translateY(-58%%);text-align:center;color:#fff">
 <div style="display:inline-block">%s</div>
 <div class="%s" style="margin-top:%dpx;%s">%s</div>
 <div class="%s" style="%s">%s</div>
 %s
</div>
<div class="%s" style="position:absolute;left:%dpx;right:%dpx;bottom:%dpx;text-align:center;color:rgba(255,255,255,.6);font-size:%dpx;font-weight:500;line-height:%s">%s</div>
</body>""" % (w, h, BG, GRID % (round(w * .28), round(w * .22), round(w * .78), round(w * .5)),
              lockup_svg(round(84 * s)), lang, round(64 * s), big, l1, lang, pill, l2,
              ("<div class='km' style='margin-top:%dpx;color:#ccc;font-size:%dpx;font-weight:600;line-height:1.5'>មេរៀនជាភាសាអង់គ្លេស</div>" % (round(26 * s), round(30 * s))) if km else "",
              lang, round(90 * s), round(90 * s), round((470 if h > w else 70) * (1 if h > w else 1)), round(26 * s), "1.5" if km else "1.35", D["risk"][lang])


# ---------- captions ----------
ASS_HEAD = """[Script Info]
ScriptType: v4.00+
PlayResX: %d
PlayResY: %d
WrapStyle: 2
ScaledBorderAndShadow: yes

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
%s

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
"""


def style(name, font, size, colour="&H00FFFFFF", outline=3, shadow=2):
    return "Style: %s,%s,%d,%s,&H00FFFFFF,&H00000000,&H78000000,-1,0,0,0,100,100,0,0,1,%d,%d,5,40,40,0,1" % (name, font, size, colour, outline, shadow)


def ass_t(t):
    t = max(0.0, t); return "%d:%02d:%05.2f" % (t // 3600, t % 3600 // 60, t % 60)


def en_chunks(words, max_words=3, max_chars=20):
    out, cur = [], []
    for w in words:
        if cur and (len(cur) >= max_words or len(" ".join(x[0] for x in cur + [w])) > max_chars):
            out.append(cur); cur = []
        cur.append(w)
        if re.search(r"[.,?!:;]$", w[0]):
            out.append(cur); cur = []
    if cur:
        out.append(cur)
    return out


KEEP = ["margin call", "Margin call", "stop loss", "Stop loss", "take profit", "Take profit", "used margin", "Free margin", "New York",
        "1 lot", "112 pips", "35 pips", "1 pip", "academy.onfin.io"]


def nb(text):
    """Keep two-word Latin terms on one line: libass and km_lines only break at plain spaces."""
    for k in KEEP:
        text = text.replace(k, k.replace(" ", "\u00a0"))
    return text


def km_lines(text, size, maxw):
    text = nb(text)
    f = ImageFont.truetype(os.path.join(FD, "KantumruyPro-w700.ttf"), size, layout_engine=RAQM)
    lines, cur = [], ""
    for ph in text.split(" "):
        cand = (cur + " " + ph).strip()
        if cur and f.getlength(cand) > maxw:
            lines.append(cur); cur = ph
        else:
            cur = cand
    lines.append(cur)
    too_wide = [l for l in lines if f.getlength(l) > maxw]
    if too_wide:
        raise SystemExit("Khmer phrase too wide, add a space: %r" % too_wide)
    return lines


def km_events(text, t0, t1, size, maxw, max_lines=2):
    """One Khmer sentence over [t0, t1]: wrap at the spaces between phrases, show max_lines at a time, time split by length."""
    lines = km_lines(text, size, maxw)
    shows = [lines[i:i + max_lines] for i in range(0, len(lines), max_lines)]
    n = [sum(len(l) for l in s) for s in shows]; tot = sum(n); out = []; t = t0
    for s, k in zip(shows, n):
        e = t + (t1 - t0) * k / tot
        out.append((t, e, "\\N".join(s))); t = e
    return out


def sentences(words):
    out, cur = [], []
    for w in words:
        cur.append(w)
        if re.search(r'[.?!]["”]?$', w[0]):
            out.append(cur); cur = []
    if cur:
        out.append(cur)
    return out


# ---------- reels ----------
def crop_v():
    return "crop=1080:%d:0:%d,fps=30,format=yuv420p,setsar=1" % (BOX_H, BOX_Y0)


def build_clip(r, wd):
    src = os.path.join(SRC, r["src"] + "-vertical.mp4")
    parts, words, off = [], [], 0.0
    wj = json.load(open(os.path.join(A, "words", r["src"] + ".json")))["words"]
    for i, (t0, t1) in enumerate(r["segments"]):
        p = os.path.join(wd, "part%d.mp4" % i); d = t1 - t0
        af = "afade=t=in:d=0.03,afade=t=out:st=%.3f:d=0.05" % (d - 0.05)
        fh = r.get("freeze_head") if i == 0 else None
        if fh:  # hold a later frame over the blank opening of the chapter
            still = os.path.join(wd, "still.png")
            sh("ffmpeg", "-v", "error", "-y", "-ss", fh[1], "-i", src, "-frames:v", 1, "-vf", "crop=1080:%d:0:%d" % (BOX_H, BOX_Y0), still)
            d1 = fh[0] - t0
            sh("ffmpeg", "-v", "error", "-y", "-loop", 1, "-t", "%.3f" % d1, "-i", still, "-ss", fh[0], "-to", t1, "-i", src,
               "-ss", t0, "-to", t1, "-i", src, "-filter_complex",
               "[0:v]fps=30,format=yuv420p,setsar=1[a];[1:v]%s[b];[a][b]concat=n=2:v=1:a=0[v];[2:a]%s[au]" % (crop_v(), af),
               "-map", "[v]", "-map", "[au]", "-c:v", "libx264", "-crf", 14, "-preset", "fast", "-c:a", "aac", "-b:a", "256k", "-ar", 48000, p)
        else:
            sh("ffmpeg", "-v", "error", "-y", "-ss", t0, "-to", t1, "-i", src, "-vf", crop_v(), "-af", af,
               "-c:v", "libx264", "-crf", 14, "-preset", "fast", "-c:a", "aac", "-b:a", "256k", "-ar", 48000, p)
        for w in wj:
            if w["s"] >= t0 - 0.05 and w["e"] <= t1 + 0.08:
                words.append([w["t"], w["s"] - t0 + off, w["e"] - t0 + off])
        off += dur(p); parts.append(p)
    clip = os.path.join(wd, "clip.mp4")
    if len(parts) == 1:
        os.replace(parts[0], clip)
    else:
        lst = os.path.join(wd, "parts.txt"); open(lst, "w").write("".join("file '%s'\n" % p for p in parts))
        sh("ffmpeg", "-v", "error", "-y", "-f", "concat", "-safe", 0, "-i", lst, "-c", "copy", clip)
    return clip, words


def reel_ass(r, lang, words, vy, cdur, path):
    cap_y = vy + int(BOX_H * 0.86)
    ev = []
    if lang == "en":
        head = ASS_HEAD % (1080, 1920, style("Cap", "Montserrat", 66, outline=3, shadow=3))
        ch = en_chunks(words)
        for i, c in enumerate(ch):
            s = c[0][1] - 0.04
            e = ch[i + 1][0][1] - 0.04 if i + 1 < len(ch) else min(cdur, c[-1][2] + 0.4)
            ev.append((s, max(e, s + 0.25), " ".join(w[0] for w in c), cap_y))
    else:
        head = ASS_HEAD % (1080, 1920, style("Cap", "Kantumruy Pro", 54, outline=3, shadow=3))
        ss = sentences(words)
        if len(ss) != len(r["km"]):
            raise SystemExit("%s: %d English sentences but %d Khmer" % (r["id"], len(ss), len(r["km"])))
        for i, (s, k) in enumerate(zip(ss, r["km"])):
            t0 = s[0][1] - 0.05
            t1 = ss[i + 1][0][1] - 0.05 if i + 1 < len(ss) else min(cdur, s[-1][2] + 0.4)
            for a, b, txt in km_events(k, t0, t1, 54, 930):
                ev.append((a, b, txt, cap_y))
    body = "".join("Dialogue: 0,%s,%s,Cap,,0,0,0,,{\\an5\\pos(540,%d)}%s\n" % (ass_t(a), ass_t(b), y, t) for a, b, t, y in ev)
    open(path, "w", encoding="utf-8").write(head + body)


LOGO_SND = None


def logo_sound(wd):
    p = os.path.join(WORK, "logo_sound.wav")
    if not os.path.exists(p):  # the 1.6 s logo intro (whoosh into two chimes) from the start of lesson 4, chapter 1
        sh("ffmpeg", "-v", "error", "-y", "-ss", 0, "-t", 1.6, "-i", os.path.join(SRC, "pips-1-vertical.mp4"), "-vn", "-af", "afade=t=out:st=1.35:d=0.25", "-ar", 48000, "-ac", 2, p)
    return p


def build_reel(r, lang, end_png, XF=0.35, END=2.6):
    wd = os.path.join(WORK, "reel-%s-%s" % (r["id"], lang)); os.makedirs(wd, exist_ok=True)
    clip, words = build_clip(r, wd)
    cdur = dur(clip)
    lay = render([("card-%s-%s" % (r["id"], lang), card_html(r["hook"][lang], lang), 1080, 1920, False)])
    vy = lay["card-%s-%s" % (r["id"], lang)]["video_y"]
    render([("risk-%s-%d" % (lang, vy), risk_html(lang, vy), 1080, 1920, True)])
    ass = os.path.join(wd, "captions.ass"); reel_ass(r, lang, words, vy, cdur, ass)
    total = cdur + END - XF
    out = os.path.join(OUT, "reels", "academy-%s-%s.mp4" % (r["id"], lang)); os.makedirs(os.path.dirname(out), exist_ok=True)
    fc = ("[0:v][1:v]overlay=0:%d[a];[a][2:v]overlay=0:0,ass=%s:fontsdir=%s:shaping=complex,fps=30,format=yuv420p,setsar=1[main];"
          "[3:v]fps=30,format=yuv420p,setsar=1[end];[main][end]xfade=transition=fade:duration=%.2f:offset=%.3f[v];"
          "[1:a]aresample=48000,aformat=channel_layouts=stereo[ca];[4:a]adelay=%d|%d,apad[ls];"
          "[ca]apad[cap];[cap][ls]amix=inputs=2:duration=longest:normalize=0,atrim=0:%.3f,loudnorm=I=-15:TP=-1.5:LRA=11,aresample=48000[au]") % (
        vy, ass, FONTS, XF, cdur - XF, int((cdur - XF + 0.1) * 1000), int((cdur - XF + 0.1) * 1000), total)
    sh("ffmpeg", "-v", "error", "-y", "-loop", 1, "-t", "%.3f" % cdur, "-i", png("card-%s-%s" % (r["id"], lang)), "-i", clip,
       "-loop", 1, "-t", "%.3f" % cdur, "-i", png("risk-%s-%d" % (lang, vy)), "-loop", 1, "-t", "%.3f" % END, "-i", end_png,
       "-i", logo_sound(wd), "-filter_complex", fc, "-map", "[v]", "-map", "[au]", "-t", "%.3f" % total,
       "-c:v", "libx264", "-preset", "slow", "-crf", 18, "-pix_fmt", "yuv420p", "-r", 30, "-c:a", "aac", "-b:a", "192k", "-movflags", "+faststart", out)
    return out


def reels(ids):
    ends = {}
    for lang in ("en", "km"):
        l1, l2 = D["endcard"][lang]
        render([("reel-end-%s" % lang, endcard_html(lang, 1080, 1920, l1, l2), 1080, 1920, False)])
        ends[lang] = png("reel-end-%s" % lang)
    outs = []
    for r in D["reels"]:
        if ids and r["id"] not in ids:
            continue
        for lang in os.environ.get("LANGS", "en km").split():
            o = build_reel(r, lang, ends[lang], END=r.get("end", 2.6)); outs.append(o); print(o, round(dur(o), 2))
    return outs


# ---------- trailer ----------
T = json.load(open(os.path.join(A, "trailer.json"), encoding="utf-8")) if os.path.exists(os.path.join(A, "trailer.json")) else None


def chip_html(fmt, lang, label):
    km = lang == "km"
    W, H = (1080, 1920) if fmt == "9x16" else (1920, 1080)
    lk_x, lk_y, lk_h = (88, 150, 46) if fmt == "9x16" else (88, 64, 40)
    chip_top = 1240 if fmt == "9x16" else 128
    chip = ("display:inline-block;border:1.5px solid rgba(159,206,16,.55);background:rgba(159,206,16,.13);color:%s;border-radius:100px;"
            "padding:%s;font-weight:600;%s") % (LIME, "10px 28px 12px" if km else "13px 28px", "font-size:28px;line-height:1.5" if km else "font-size:24px;letter-spacing:.18em;text-transform:uppercase;line-height:1.2")
    pos = "left:88px;top:%dpx" % chip_top if fmt == "9x16" else "right:280px;top:54px"  # 16:9: top row, left of the lesson's lime pill
    chip_div = "" if not label else "<div class='%s' style='position:absolute;%s;%s'>%s</div>" % (lang, pos, chip, label)
    return "<body style='width:%dpx;height:%dpx;background:transparent'><div style='position:absolute;left:%dpx;top:%dpx'>%s</div>%s</body>" % (
        W, H, lk_x, lk_y, lockup_svg(lk_h), chip_div)


def trailer_risk_html(fmt, lang):
    km = lang == "km"
    W, H = (1080, 1920) if fmt == "9x16" else (1920, 1080)
    y = 1468 if fmt == "9x16" else 1052
    return ("<body style='width:%dpx;height:%dpx;background:transparent'><div class='%s' style='position:absolute;left:80px;right:80px;top:%dpx;"
            "transform:translateY(-100%%);text-align:center;color:rgba(255,255,255,.55);font-size:%dpx;font-weight:500;line-height:%s'>%s</div></body>") % (
        W, H, lang, y, 22 if km else 23, 1.45 if km else 1.3, D["risk"][lang])


def trailer(fmt, lang):
    W, H = (1080, 1920) if fmt == "9x16" else (1920, 1080)
    orient = "vertical" if fmt == "9x16" else "horizontal"
    wd = os.path.join(WORK, "trailer-%s-%s" % (fmt, lang)); os.makedirs(wd, exist_ok=True)
    XF = 0.25
    shots = T["shots"]
    jobs = [("tchip-%s-%s-%d" % (fmt, lang, i), chip_html(fmt, lang, s["chip"][lang]), W, H, True) for i, s in enumerate(shots)]
    jobs.append(("trisk-%s-%s" % (fmt, lang), trailer_risk_html(fmt, lang), W, H, True))
    l1, l2 = T["end"][lang]
    jobs.append(("tend-%s-%s" % (fmt, lang), endcard_html(lang, W, H, l1, l2, scale=1.0 if fmt == "9x16" else 0.95), W, H, False))
    render(jobs)
    # shot parts with their chip overlay
    parts = []
    for i, s in enumerate(shots):
        p = os.path.join(wd, "s%02d.mp4" % i)
        L = s["t1"] - s["t0"] + XF
        sh("ffmpeg", "-v", "error", "-y", "-ss", s["src_t"], "-t", "%.3f" % L, "-i", os.path.join(SRC, "%s-%s.mp4" % (s["src"], orient)),
           "-loop", 1, "-t", "%.3f" % L, "-i", png("tchip-%s-%s-%d" % (fmt, lang, i)),
           "-filter_complex", "[0:v]scale=%d:%d,fps=30,format=yuv420p,setsar=1[b];[b][1:v]overlay=0:0,format=yuv420p[v]" % (W, H),
           "-map", "[v]", "-an", "-c:v", "libx264", "-crf", 14, "-preset", "fast", p)
        parts.append(p)
    end_t0 = shots[-1]["t1"]; total = T["total"]
    pe = os.path.join(wd, "end.mp4")
    sh("ffmpeg", "-v", "error", "-y", "-loop", 1, "-t", "%.3f" % (total - end_t0 + XF), "-i", png("tend-%s-%s" % (fmt, lang)),
       "-vf", "fps=30,format=yuv420p,setsar=1", "-c:v", "libx264", "-crf", 14, "-preset", "fast", pe)
    parts.append(pe)
    ins, fc, last = [], [], "[0:v]"
    for p in parts:
        ins += ["-i", p]
    for i in range(1, len(parts)):
        off = shots[i]["t0"] if i < len(shots) else end_t0
        fc.append("%s[%d:v]xfade=transition=fade:duration=%.2f:offset=%.3f[x%d]" % (last, i, XF, off - XF / 2, i)); last = "[x%d]" % i
    # risk line during the shots (the end card carries its own), then subtitles
    n = len(parts)
    fc.append("%s[%d:v]overlay=0:0:enable='lt(t,%.2f)'[r]" % (last, n, end_t0 - XF / 2))
    ass = os.path.join(wd, "subs.ass"); trailer_ass(fmt, lang, ass)
    fc.append("[r]ass=%s:fontsdir=%s:shaping=complex,format=yuv420p[v]" % (ass, FONTS))
    # audio: voiceover pieces, a quiet music bed, the logo sound on the end card
    vo = os.path.join(A, "trailer_vo.mp3")
    a_in = ["-i", vo, "-stream_loop", "-1", "-i", os.environ.get("ACADEMY_MUSIC", os.path.join(A, "..", "..", "..", "..", "reels", "_audio", "quick_news_beat.mp3")), "-i", logo_sound(wd)]
    k0 = n + 1
    nvo = len(T["vo"])
    afc = ["[%d:a]aresample=48000,aformat=channel_layouts=stereo,asplit=%d%s" % (k0, nvo, "".join("[vs%d]" % j for j in range(nvo)))]
    for j, piece in enumerate(T["vo"]):
        ms = int(piece["at"] * 1000)
        afc.append("[vs%d]atrim=%.3f:%.3f,asetpts=PTS-STARTPTS,afade=t=in:d=0.02,afade=t=out:st=%.3f:d=0.05,adelay=%d|%d[vo%d]" % (
            j, piece["s0"], piece["s1"], piece["s1"] - piece["s0"] - 0.05, ms, ms, j))
    music_end = total
    afc.append("[%d:a]atrim=0:%.3f,asetpts=PTS-STARTPTS,aformat=channel_layouts=stereo,volume='if(lt(t,%.2f),0.16,0.34)':eval=frame,afade=t=in:d=0.6,afade=t=out:st=%.3f:d=1.4[mus]" % (
        k0 + 1, music_end, end_t0, total - 1.4))
    afc.append("[%d:a]adelay=%d|%d,aformat=channel_layouts=stereo[ls]" % (k0 + 2, int(end_t0 * 1000), int(end_t0 * 1000)))
    afc.append("%s[mus][ls]amix=inputs=%d:duration=longest:normalize=0,atrim=0:%.3f,loudnorm=I=-15:TP=-1.5:LRA=11,aresample=48000[au]" % (
        "".join("[vo%d]" % j for j in range(nvo)), nvo + 2, total))
    ins += ["-loop", "1", "-t", "%.3f" % total, "-i", png("trisk-%s-%s" % (fmt, lang))]
    out = os.path.join(OUT, "trailer", "academy-trailer-%s-%s.mp4" % (fmt, lang)); os.makedirs(os.path.dirname(out), exist_ok=True)
    sh("ffmpeg", "-v", "error", "-y", *ins, *a_in, "-filter_complex", ";".join(fc + afc), "-map", "[v]", "-map", "[au]", "-t", "%.3f" % total,
       "-c:v", "libx264", "-preset", "slow", "-crf", 18, "-pix_fmt", "yuv420p", "-r", 30, "-c:a", "aac", "-b:a", "192k", "-movflags", "+faststart", out)
    return out


def trailer_ass(fmt, lang, path):
    W, H = (1080, 1920) if fmt == "9x16" else (1920, 1080)
    km = lang == "km"
    y = 1365 if fmt == "9x16" else 930
    sz = (52 if km else 62) if fmt == "9x16" else (44 if km else 52)
    big = (60 if km else 76) if fmt == "9x16" else (50 if km else 62)
    font = "Kantumruy Pro" if km else "Montserrat"
    head = ASS_HEAD % (W, H, style("Sub", font, sz) + "\n" + style("Offer", font, big, colour="&H0010CE9F"))
    lines = []
    for c in T["subs"]:
        txt = c[lang]
        if km:
            maxw = 940 if fmt == "9x16" else 1500
            txt = "\\N".join(km_lines(txt, big if c.get("offer") else sz, maxw))
        lines.append("Dialogue: 0,%s,%s,%s,,0,0,0,,{\\an5\\pos(%d,%d)}%s\n" % (ass_t(c["t0"]), ass_t(c["t1"]), "Offer" if c.get("offer") else "Sub", W // 2, y, txt))
    open(path, "w", encoding="utf-8").write(head + "".join(lines))


# ---------- checks ----------
def check(f):
    d = dur(f)
    st = os.path.join(OUT, "_sheets"); os.makedirs(st, exist_ok=True)
    w, h = [int(x) for x in subprocess.check_output(["ffprobe", "-v", "error", "-select_streams", "v", "-show_entries", "stream=width,height", "-of", "csv=p=0", f]).decode().strip().split(",")]
    n = 10; tw = 216 if h > w else 384; th = int(tw * h / w)
    sheet = Image.new("RGB", (n * (tw + 6), th + 24), "white"); dr = ImageDraw.Draw(sheet)
    for i in range(n):
        t = d * (i + 0.5) / n
        p = os.path.join(st, "_f.png")
        sh("ffmpeg", "-v", "error", "-y", "-ss", "%.2f" % t, "-i", f, "-frames:v", 1, "-vf", "scale=%d:%d" % (tw, th), p)
        sheet.paste(Image.open(p), (i * (tw + 6), 0)); dr.text((i * (tw + 6) + 4, th + 4), "%.1fs" % t, fill=(0, 0, 0))
    sp = os.path.join(st, os.path.basename(f)[:-4] + ".jpg"); sheet.save(sp, quality=88)
    log = subprocess.run(["ffmpeg", "-v", "info", "-i", f, "-af", "ebur128=peak=true", "-f", "null", "-"], capture_output=True, text=True).stderr
    I = re.findall(r"I:\s+(-?[\d.]+) LUFS", log); P = re.findall(r"Peak:\s+(-?[\d.]+) dBFS", log)
    return {"file": os.path.basename(f), "dur": round(d, 2), "size": "%dx%d" % (w, h), "lufs": I[-1] if I else None, "peak": P[-1] if P else None, "sheet": sp}


if __name__ == "__main__":
    cmd = sys.argv[1]
    if cmd == "reels":
        for o in reels(sys.argv[2:]):
            print(json.dumps(check(o)))
    elif cmd == "trailer":
        for fmt in (sys.argv[2:3] or ["9x16", "16x9"]):
            for lang in (sys.argv[3:4] or ["en", "km"]):
                print(json.dumps(check(trailer(fmt, lang))))
    elif cmd == "check":
        for f in sys.argv[2:]:
            print(json.dumps(check(f)))
