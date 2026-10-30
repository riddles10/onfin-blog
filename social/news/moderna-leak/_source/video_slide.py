"""Builds the ABC News video slide (mod-<lang>-04.mp4 + still mod-<lang>-04.jpg) for each language."""
import json, os, re, subprocess
import numpy as np
from PIL import Image, ImageDraw

M = os.path.dirname(os.path.abspath(__file__))
SRC = f"{M}/vid/abc_farma.mp4"
SEG = [(54.62, 64.55), (80.36, 89.80)]
FONTS = "/tmp/claude-0/-home-user-onfin-blog/42b2fa22-784d-52c4-a9a8-6ec4971d0812/scratchpad/meme/fonts_full"
W, H, R = 1080, 1350, 26


def sh(*a):
    subprocess.run(a, check=True)


def build_clip():
    parts = []
    for i, (a, b) in enumerate(SEG):
        p = f"{M}/vid/part{i}.mp4"; d = b - a
        sh("ffmpeg", "-v", "error", "-y", "-ss", str(a), "-to", str(b), "-i", SRC, "-vf", "fps=30,setsar=1",
           "-af", f"afade=t=in:d=0.04,afade=t=out:st={d-0.05:.3f}:d=0.05", "-c:v", "libx264", "-crf", "15", "-preset", "fast",
           "-c:a", "aac", "-b:a", "256k", "-ar", "48000", p)
        parts.append(p)
    open(f"{M}/vid/parts.txt", "w").write("".join(f"file '{p}'\n" for p in parts))
    sh("ffmpeg", "-v", "error", "-y", "-f", "concat", "-safe", "0", "-i", f"{M}/vid/parts.txt", "-c", "copy", f"{M}/vid/clip.mp4")
    return float(subprocess.check_output(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", f"{M}/vid/clip.mp4"]))


def en_words():
    ab = json.load(open(f"{M}/vid/ab_words.json"))
    dA = SEG[0][1] - SEG[0][0]
    out = [[w, s - SEG[0][0], e - SEG[0][0]] for w, s, e in ab["a.wav"] if s >= SEG[0][0] - 0.05 and e <= SEG[0][1] + 0.05]
    for w, s, e in ab["b.wav"]:
        if s < SEG[1][0]:
            continue  # drops the leading "but"
        if w == "%" and out:
            out[-1] = [out[-1][0] + "%", out[-1][1], e - SEG[1][0] + dA]; continue
        if out and out[-1][0].endswith("."):
            w = w[:1].upper() + w[1:]
        out.append([w, s - SEG[1][0] + dA, e - SEG[1][0] + dA])
    for i in range(len(out) - 2):  # keep "40 to 50%" on one caption
        if out[i][0] == "40" and out[i + 1][0] == "to" and out[i + 2][0] == "50%":
            out[i:i + 3] = [["40\u00a0to\u00a050%", out[i][1], out[i + 2][2]]]
            break
    return out


# translated phrases; each maps to an English phrase window [first word idx, last word idx]
PHRASES = {
 "ms": ["Ia benar-benar rawatan kanser yang diperibadikan sepenuhnya,", "kami mencipta vaksin berdasarkan tumor seseorang,", "yang khusus untuk tumor mereka sahaja.",
        "Harapannya, ia boleh mengurangkan risiko melanoma kembali", "atau merebak ke bahagian lain badan", "sehingga 40\u00a0hingga\u00a050% bagi pesakit melanoma."],
 "ru": ["Это по-настоящему персонализированное лечение рака:", "мы создаём вакцину на основе опухоли конкретного человека,", "подходящую только для его опухоли.",
        "Есть надежда, что она снизит риск возвращения меланомы", "или её распространения по организму", "на 40-50% у пациентов с меланомой."],
 "es": ["Es realmente atención oncológica personalizada al máximo:", "creamos una vacuna a partir del propio tumor de cada persona,", "específica solo para su tumor.",
        "La esperanza es que reduzca el riesgo de que el melanoma vuelva", "o se extienda a otras partes del cuerpo", "hasta en un 40\u00a0a\u00a050% en pacientes con melanoma."],
}
EN_SPLIT = ["care,", "tumor", "tumors.", "back", "body", "patients."]  # last English word of each phrase


def windows(words):
    win, start, k = [], 0, 0
    for i, w in enumerate(words):
        if k < len(EN_SPLIT) and w[0] == EN_SPLIT[k] and (k != 1 or i > 0):
            win.append((words[start][1], w[2])); start = i + 1; k += 1
    assert len(win) == 6, win
    return win


def loc_words(words, lang):
    out = []
    for (a, b), text in zip(windows(words), PHRASES[lang]):
        toks = text.split(" "); lens = [len(t) + 1 for t in toks]; tot = sum(lens); t = a
        for tok, l in zip(toks, lens):
            d = (b - a) * l / tot; out.append([tok, t, t + d]); t += d
    return out


def chunks(words, max_words=3, max_chars=22):
    out, cur = [], []
    for w in words:
        if cur and (len(cur) >= max_words or len(" ".join(x[0] for x in cur + [w])) > max_chars):
            out.append(cur); cur = []
        cur.append(w)
        if re.search(r"[.,?:;]$", w[0]):
            out.append(cur); cur = []
    if cur:
        out.append(cur)
    return out


def ass(words, path, y, dur):
    t = lambda s: "%d:%02d:%05.2f" % (int(s // 3600), int(s % 3600 // 60), max(0, s) % 60)
    L = ["[Script Info]", "ScriptType: v4.00+", f"PlayResX: {W}", f"PlayResY: {H}", "WrapStyle: 2", "", "[V4+ Styles]",
         "Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding",
         "Style: Cap,Montserrat ExtraBold,62,&H00FFFFFF,&H00FFFFFF,&H00000000,&H64000000,0,0,0,0,100,100,-1,0,1,3,3,5,60,60,0,1",
         "", "[Events]", "Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text"]
    ch = chunks(words)
    for i, c in enumerate(ch):
        s = c[0][1] - 0.04
        e = ch[i + 1][0][1] - 0.04 if i + 1 < len(ch) else min(dur, c[-1][2] + 0.4)
        L.append(f"Dialogue: 0,{t(s)},{t(max(e, s + 0.25))},Cap,,0,0,0,,{{\\an5\\pos(540,{y})}}" + " ".join(w[0] for w in c))
    open(path, "w", encoding="utf-8").write("\n".join(L) + "\n")


def card_box(lang):
    a = np.asarray(Image.open(f"{M}/out/vframe-{lang}-magenta.png").convert("RGB")).astype(int)
    m = (a[:, :, 0] > 245) & (a[:, :, 1] < 12) & (a[:, :, 2] > 245)
    ys, xs = np.where(m)
    return xs.min(), ys.min(), xs.max() + 1, ys.max() + 1


def overlay_png(lang, box):
    base = Image.open(f"{M}/out/vframe-{lang}-black.png").convert("RGBA")
    x0, y0, x1, y1 = box; s = 4
    mask = Image.new("L", (W * s, H * s), 255)
    ImageDraw.Draw(mask).rounded_rectangle([x0 * s, y0 * s, x1 * s - 1, y1 * s - 1], radius=R * s, fill=0)
    base.putalpha(mask.resize((W, H), Image.LANCZOS))
    p = f"{M}/vid/overlay-{lang}.png"; base.save(p); return p


def main():
    dur = build_clip()
    en = en_words()
    print("EN:", " ".join(w[0] for w in en))
    for lang in ["en", "ms", "ru", "es"]:
        box = card_box(lang); x0, y0, x1, y1 = box; bw, bh = x1 - x0, y1 - y0
        words = en if lang == "en" else loc_words(en, lang)
        cap = f"{M}/vid/cap-{lang}.ass"; ass(words, cap, int(y0 + bh * 0.60), dur)
        ov = overlay_png(lang, box)
        out = f"{M}/out/mod-{lang}-04.mp4"
        fc = (f"[1:v]scale={bw}:{bh},setsar=1[v];[0:v][v]overlay={x0}:{y0}[b];[b][2:v]overlay=0:0[c];"
              f"[c]subtitles={cap}:fontsdir={FONTS},format=yuv420p[out];[1:a]loudnorm=I=-14:TP=-1.5:LRA=11,aresample=48000[au]")
        sh("ffmpeg", "-v", "error", "-y", "-loop", "1", "-i", f"{M}/out/vframe-{lang}-black.png", "-i", f"{M}/vid/clip.mp4", "-loop", "1", "-i", ov,
           "-filter_complex", fc, "-map", "[out]", "-map", "[au]", "-t", f"{dur:.3f}", "-r", "30", "-c:v", "libx264", "-preset", "slow", "-crf", "18",
           "-c:a", "aac", "-b:a", "192k", "-movflags", "+faststart", out)
        k = next(i for i, w in enumerate(en) if w[0].startswith("40"))
        sh("ffmpeg", "-v", "error", "-y", "-ss", f"{en[k][1] + 0.5:.2f}", "-i", out, "-frames:v", "1", "-q:v", "2", f"{M}/out/mod-{lang}-04.jpg")
        print(lang, box, out)


if __name__ == "__main__":
    main()
