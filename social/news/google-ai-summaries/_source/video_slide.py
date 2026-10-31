"""Builds the AI Mode video slide (gai-<lang>-07.mp4 + still gai-<lang>-07.jpg): Google's official I/O 2026 Search demo, captioned per language, music bed."""
import os, subprocess
import numpy as np
from PIL import Image, ImageDraw

M = os.path.dirname(os.path.abspath(__file__))
SRC = f"{M}/dl/seamless-ai-search.mp4"  # storage.googleapis.com/gweb-uniblog-publish-prod/original_videos/seamless-ai-search.mp4 (blog.google, 19 May 2026)
MUSIC = "/tmp/claude-0/-home-user-onfin-blog/42b2fa22-784d-52c4-a9a8-6ec4971d0812/scratchpad/audio/quick_news_beat.mp3"
FONTS = "/tmp/claude-0/-home-user-onfin-blog/42b2fa22-784d-52c4-a9a8-6ec4971d0812/scratchpad/meme/fonts_full"
A, B = 0.5, 29.5
W, H, R = 1080, 1350, 26
CUES = [(0.0, 5.5), (5.5, 12.0), (12.0, 17.5), (17.5, 23.5), (23.5, 29.0)]
TXT = {
 "en": ["You ask Google a question.", "An AI Overview answers on top.", "Ask a follow-up,", "and it turns into AI Mode.", "Source links sit to the side."],
 "ms": ["Anda bertanya kepada Google.", "Ringkasan AI menjawab di atas.", "Tanya soalan susulan,", "dan ia bertukar kepada AI Mode.", "Pautan sumber di tepi."],
 "ru": ["Вы задаёте Google вопрос.", "Сверху отвечает обзор от ИИ.", "Задаёте уточняющий вопрос,", "и попадаете в AI Mode.", "Ссылки на источники сбоку."],
 "es": ["Le haces una pregunta a Google.", "Un resumen de IA responde arriba.", "Haces otra pregunta,", "y pasas a AI Mode.", "Los enlaces quedan a un lado."],
}


def sh(*a):
    subprocess.run(a, check=True)


def box(lang):
    a = np.asarray(Image.open(f"{M}/out/vframe-{lang}-magenta.png").convert("RGB")).astype(int)
    m = (a[:, :, 0] > 245) & (a[:, :, 1] < 12) & (a[:, :, 2] > 245)
    ys, xs = np.where(m)
    return xs.min(), ys.min(), xs.max() + 1, ys.max() + 1


def overlay(lang, b):
    base = Image.open(f"{M}/out/vframe-{lang}-black.png").convert("RGBA")
    x0, y0, x1, y1 = b; s = 4
    mask = Image.new("L", (W * s, H * s), 255)
    ImageDraw.Draw(mask).rounded_rectangle([x0 * s, y0 * s, x1 * s - 1, y1 * s - 1], radius=R * s, fill=0)
    base.putalpha(mask.resize((W, H), Image.LANCZOS))
    p = f"{M}/vid/overlay-{lang}.png"; base.save(p); return p


def ass(lang, path, y):
    t = lambda s: "%d:%02d:%05.2f" % (int(s // 3600), int(s % 3600 // 60), s % 60)
    L = ["[Script Info]", "ScriptType: v4.00+", f"PlayResX: {W}", f"PlayResY: {H}", "WrapStyle: 0", "", "[V4+ Styles]",
         "Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding",
         "Style: Cap,Montserrat ExtraBold,46,&H00FFFFFF,&H00FFFFFF,&H28000000,&H28000000,0,0,0,0,100,100,-0.5,0,3,14,0,5,110,110,0,1",
         "", "[Events]", "Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text"]
    for (s, e), txt in zip(CUES, TXT[lang]):
        L.append(f"Dialogue: 0,{t(s)},{t(e)},Cap,,0,0,0,,{{\\an5\\pos(540,{y})}}{txt}")
    open(path, "w", encoding="utf-8").write("\n".join(L) + "\n")


def main():
    clip = f"{M}/vid/clip.mp4"; d = B - A
    sh("ffmpeg", "-v", "error", "-y", "-ss", str(A), "-to", str(B), "-i", SRC, "-i", MUSIC, "-filter_complex",
       f"[1:a]atrim=0:{d},asetpts=PTS-STARTPTS,loudnorm=I=-18:TP=-2:LRA=11,afade=t=in:d=0.3,afade=t=out:st={d-1.5}:d=1.5,aresample=48000[a]",
       "-map", "0:v", "-map", "[a]", "-vf", "fps=30,setsar=1", "-c:v", "libx264", "-crf", "16", "-preset", "fast", "-c:a", "aac", "-b:a", "192k", "-shortest", clip)
    for lang in TXT:
        b = box(lang); x0, y0, x1, y1 = b; bw, bh = x1 - x0, y1 - y0
        cap = f"{M}/vid/cap-{lang}.ass"; ass(lang, cap, int(y0 + bh * 0.84))
        ov = overlay(lang, b)
        out = f"{M}/out/gai-{lang}-07.mp4"
        fc = (f"[1:v]crop=iw*0.74:ih*0.74:iw*0.13:ih*0.04,scale={bw}:{bh}:force_original_aspect_ratio=increase,crop={bw}:{bh},setsar=1[v];[0:v][v]overlay={x0}:{y0}[b];[b][2:v]overlay=0:0[c];"
              f"[c]subtitles={cap}:fontsdir={FONTS},format=yuv420p[out]")
        sh("ffmpeg", "-v", "error", "-y", "-loop", "1", "-i", f"{M}/out/vframe-{lang}-black.png", "-i", clip, "-loop", "1", "-i", ov,
           "-filter_complex", fc, "-map", "[out]", "-map", "1:a", "-t", f"{d:.3f}", "-r", "30", "-c:v", "libx264", "-preset", "slow", "-crf", "18",
           "-c:a", "aac", "-b:a", "192k", "-movflags", "+faststart", out)
        sh("ffmpeg", "-v", "error", "-y", "-ss", "8.5", "-i", out, "-frames:v", "1", "-q:v", "2", f"{M}/out/gai-{lang}-07.jpg")
        print(lang, b, out)


if __name__ == "__main__":
    main()
