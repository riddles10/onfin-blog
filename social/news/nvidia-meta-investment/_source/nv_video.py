"""Composite the two video slides (per language) into their rendered frames. python3 nv_video.py"""
import json, os, re, subprocess
import numpy as np
from PIL import Image
N = os.path.dirname(os.path.abspath(__file__))
OUT = f"{N}/render/out"; SRC = f"{N}/dl/yv.mp4"
FONTS = os.path.join(N, "..", "meme", "fonts_full")
SEG = {"02": (0.0, 12.0), "06": (183.55, 191.65)}
STILL = {"02": 9.0, "06": 6.7}
words = json.load(open(f"{N}/dl/yv_words.json"))
WIN = {"02": [(0.0, 5.24), (5.94, 11.78)], "06": [(183.72, 185.82), (186.30, 188.32), (188.66, 191.50)]}
LOC = {
 "ms": {"02": ["Syarikat yang menjual cip AI kepada Meta kini membeli sebahagian Meta sendiri.",
               "Nvidia berkata pada hari Selasa ia akan melabur $3 bilion dalam tawaran saham Meta Platforms."],
        "06": ["Inilah kitaran yang perlu difahami pelabur.", "Wang Nvidia masuk ke Meta.", "Meta pula berbelanja lebih untuk infrastruktur Nvidia."]},
 "ru": {"02": ["Компания, которая продаёт Meta чипы для ИИ, теперь покупает часть самой Meta.",
               "Nvidia заявила во вторник, что вложит $3 млрд в размещение акций Meta Platforms."],
        "06": ["Вот цикл, который инвесторам нужно понять.", "Деньги Nvidia идут в Meta.", "А Meta тратит больше на инфраструктуру Nvidia."]},
 "es": {"02": ["La empresa que le vende a Meta sus chips de IA ahora compra una parte de la propia Meta.",
               "Nvidia dijo el martes que invertirá $3,000 millones en una oferta de acciones de Meta Platforms."],
        "06": ["Ese es el ciclo que los inversores deben entender.", "El dinero de Nvidia entra en Meta.", "Meta, a su vez, gasta más en infraestructura de Nvidia."]},
}

def chunks(ws, max_words=3, max_chars=22):
    out, cur = [], []
    for w in ws:
        if cur and (len(cur) >= max_words or len(" ".join(x[0] for x in cur + [w])) > max_chars):
            out.append(cur); cur = []
        cur.append(w)
        if re.search(r"[.,?:;]$", w[0]):
            out.append(cur); cur = []
    if cur: out.append(cur)
    return out

def t_ass(t):
    t = max(0, t); return "%d:%02d:%05.2f" % (t // 3600, t % 3600 // 60, t % 60)

def seg_words(lang, sid):
    t0, t1 = SEG[sid]
    if lang == "en":
        return [[w, a - t0, b - t0] for w, a, b in words if t0 - 0.05 <= a < t1 - 0.05]
    out = []
    for (a, b), text in zip(WIN[sid], LOC[lang][sid]):
        toks = text.split(); lens = [len(x) + 1 for x in toks]; tot = sum(lens); t = a
        for tok, l in zip(toks, lens):
            dd = (b - a) * l / tot; out.append([tok, t - t0, t - t0 + dd]); t += dd
    return out

def box_of(png):
    a = np.asarray(Image.open(png).convert("RGB")).astype(int)
    m = (a[:, :, 0] > 200) & (a[:, :, 1] < 80) & (a[:, :, 2] > 200)
    ys, xs = np.where(m)
    return xs.min(), ys.min(), xs.max() + 1, ys.max() + 1

def overlay_png(png, dst):
    a = np.asarray(Image.open(png).convert("RGB")).astype(int)
    mag = (np.minimum(a[:, :, 0], a[:, :, 2]) - a[:, :, 1]) / 255.0
    alpha = np.where(mag > 0.2, 0, 255).astype(np.uint8)
    rgba = np.dstack([a.astype(np.uint8), alpha])
    Image.fromarray(rgba, "RGBA").save(dst)

for lang in ["en", "ms", "ru", "es"]:
    for sid in ["02", "06"]:
        frame = f"{OUT}/frame-{lang}-{sid}.png"
        x0, y0, x1, y1 = box_of(frame)
        bw, bh = x1 - x0, y1 - y0
        ov = f"{N}/render/ov-{lang}-{sid}.png"; overlay_png(frame, ov)
        t0, t1 = SEG[sid]; dur = t1 - t0
        ws = seg_words(lang, sid); ch = chunks(ws)
        cap_y = y0 + int(bh * 0.84)
        L = ["[Script Info]", "ScriptType: v4.00+", "PlayResX: 1080", "PlayResY: 1350", "WrapStyle: 2", "", "[V4+ Styles]",
             "Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding",
             "Style: Cap,Montserrat ExtraBold,52,&H00FFFFFF,&H00FFFFFF,&H00000000,&H64000000,0,0,0,0,100,100,-1,0,1,3,3,5,60,60,0,1",
             "", "[Events]", "Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text"]
        for i, c in enumerate(ch):
            s = c[0][1] - 0.04
            e = ch[i + 1][0][1] - 0.04 if i + 1 < len(ch) else min(dur, c[-1][2] + 0.4)
            L.append("Dialogue: 0,%s,%s,Cap,,0,0,0,,{\\an5\\pos(540,%d)}%s" % (t_ass(s), t_ass(max(e, s + 0.25)), cap_y, " ".join(w[0] for w in c)))
        ass = f"{N}/render/cap-{lang}-{sid}.ass"; open(ass, "w", encoding="utf-8").write("\n".join(L) + "\n")
        vw, vh = bw + 4, bh + 4
        base = ("[0:v]fps=30,scale=%d:%d:force_original_aspect_ratio=increase,crop=%d:%d,setsar=1,pad=1080:1350:%d:%d:black[v];"
                "[v][1:v]overlay=0:0[b]") % (vw, vh, vw, vh, x0 - 2, y0 - 2)
        out = f"{OUT}/nvm-{lang}-{sid}.mp4"
        subprocess.run(["ffmpeg", "-v", "error", "-y", "-ss", str(t0), "-to", str(t1), "-i", SRC, "-loop", "1", "-i", ov,
                        "-filter_complex", base + ";[b]subtitles=%s:fontsdir=%s[o];[0:a]loudnorm=I=-14:TP=-1.5:LRA=11,afade=t=in:d=0.08,afade=t=out:st=%.2f:d=0.25,aresample=48000[a]" % (ass, FONTS, dur - 0.25),
                        "-map", "[o]", "-map", "[a]", "-t", "%.3f" % dur, "-c:v", "libx264", "-preset", "slow", "-crf", "19", "-pix_fmt", "yuv420p", "-r", "30",
                        "-c:a", "aac", "-b:a", "192k", "-ar", "48000", "-movflags", "+faststart", out], check=True)
        # FB gets a still of the same slide (no captions)
        still = f"{OUT}/nvm-{lang}-{sid}-still.png"
        subprocess.run(["ffmpeg", "-v", "error", "-y", "-ss", str(t0 + STILL[sid]), "-i", SRC, "-i", ov, "-filter_complex", base, "-map", "[b]", "-frames:v", "1", still], check=True)
        print(lang, sid, (x0, y0, bw, bh), len(ch), "chunks")
