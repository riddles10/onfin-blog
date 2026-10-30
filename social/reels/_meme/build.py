"""Meme-style clip reel (hook card on white with the OnFin bolt avatar, real clip, burned-in captions).

Run with the faster-whisper venv:  /tmp/claude-0/fw/bin/python build.py spec.json
spec.json:
  {"id": "fed-dissent", "src": "raw/fed.mp4", "in": 12.0, "out": 41.5,
   "hook": "When the Fed chair gets asked about rate cuts:",
   "crop": 0.5,            # horizontal centre of the crop when the clip is wider than the box (0 left, 1 right)
   "box_h": 660,           # height of the video box (full width 1080)
   "zoom": [0.3, 0.2, 0.4], # optional pre-crop of the source: left, top, width as fractions (height follows the box aspect)
   "censor": ["word"]}     # optional words to mask in captions
Writes out/<id>.mp4 plus work/<id>/ (trimmed clip, words.json, captions.ass, card.png).
If work/<id>/words_fixed.txt exists ("word start end" per line), it replaces the transcript.
"""
import json, os, re, subprocess, sys

HERE = os.path.dirname(os.path.abspath(__file__))
W, H = 1080, 1920


def sh(*a):
    subprocess.run(a, check=True)


def transcribe(wav, out_json):
    from faster_whisper import WhisperModel
    model = WhisperModel("small", device="cpu", compute_type="int8")
    import numpy as np  # decode with ffmpeg: PyAV in this venv rejects faster-whisper's metadata_errors argument
    pcm = subprocess.run(["ffmpeg", "-v", "error", "-i", wav, "-f", "f32le", "-ac", "1", "-ar", "16000", "-"], check=True, capture_output=True).stdout
    segs, _ = model.transcribe(np.frombuffer(pcm, np.float32), language="en", word_timestamps=True, vad_filter=True)
    words = [[w.word.strip(), round(w.start, 3), round(w.end, 3)] for s in segs for w in s.words if w.word.strip()]
    json.dump(words, open(out_json, "w"), ensure_ascii=False)
    return words


def chunks(words, max_words=3, max_chars=20):
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


def ass_time(t):
    t = max(0, t); h = int(t // 3600); m = int(t % 3600 // 60); s = t % 60
    return "%d:%02d:%05.2f" % (h, m, s)


def write_ass(words, path, cap_y, dur, censor):
    def clean(w):
        for c in censor:
            if re.sub(r"[^\w]", "", w.lower()) == c.lower():
                return w[0] + "*" * (len(re.sub(r"[^\w]", "", w)) - 1) + re.sub(r"[\w]", "", w)
        return w
    lines = ["[Script Info]", "ScriptType: v4.00+", "PlayResX: %d" % W, "PlayResY: %d" % H, "WrapStyle: 2", "",
             "[V4+ Styles]",
             "Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding",
             "Style: Cap,Montserrat ExtraBold,68,&H00FFFFFF,&H00FFFFFF,&H00000000,&H64000000,0,0,0,0,100,100,-1,0,1,3,4,5,60,60,0,1",
             "", "[Events]", "Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text"]
    ch = chunks(words)
    for i, c in enumerate(ch):
        s = c[0][1] - 0.04
        e = ch[i + 1][0][1] - 0.04 if i + 1 < len(ch) else min(dur, c[-1][2] + 0.4)
        e = max(e, s + 0.25)
        text = " ".join(clean(w[0]) for w in c)
        lines.append("Dialogue: 0,%s,%s,Cap,,0,0,0,,{\\an5\\pos(540,%d)}%s" % (ass_time(s), ass_time(e), cap_y, text))
    open(path, "w", encoding="utf-8").write("\n".join(lines) + "\n")


def render_card(hook, box_h, out_png, wm_png):
    """Renders the white card (avatar, name, handle, hook) and returns the y of the video box."""
    js = os.path.join(HERE, "card.js")
    res = subprocess.run(["node", js, json.dumps({"hook": hook, "box_h": box_h, "card": out_png, "wm": wm_png})],
                         check=True, capture_output=True, text=True)
    return json.loads(res.stdout.strip().splitlines()[-1])


def main():
    spec = json.load(open(sys.argv[1]))
    sid = spec["id"]; box_h = spec.get("box_h", 660)
    wd = os.path.join(HERE, "work", sid); os.makedirs(wd, exist_ok=True); os.makedirs(os.path.join(HERE, "out"), exist_ok=True)
    src = spec["src"] if os.path.isabs(spec["src"]) else os.path.join(HERE, spec["src"])
    clip, wav = os.path.join(wd, "clip.mp4"), os.path.join(wd, "clip16k.wav")
    # one window ("in"/"out") or several jump-cut windows ("segments": [[in, out], ...]) joined in order
    segs = spec.get("segments") or [[spec["in"], spec["out"]]]
    parts = []
    for i, (t0, t1) in enumerate(segs):
        part = os.path.join(wd, "part%d.mp4" % i)
        d = float(t1) - float(t0)  # short audio fades so jump cuts don't click
        sh("ffmpeg", "-v", "error", "-y", "-ss", str(t0), "-to", str(t1), "-i", src, "-vf", "fps=30",
           "-af", "afade=t=in:d=0.04,afade=t=out:st=%.3f:d=0.04" % (d - 0.04), "-c:v", "libx264", "-crf", "16",
           "-preset", "fast", "-c:a", "aac", "-b:a", "256k", "-ar", "48000", part)
        parts.append(part)
    if len(parts) == 1:
        os.replace(parts[0], clip)
    else:
        lst = os.path.join(wd, "parts.txt")
        open(lst, "w").write("".join("file '%s'\n" % p for p in parts))
        sh("ffmpeg", "-v", "error", "-y", "-f", "concat", "-safe", "0", "-i", lst, "-c", "copy", clip)
    sh("ffmpeg", "-v", "error", "-y", "-i", clip, "-ac", "1", "-ar", "16000", wav)
    dur = float(subprocess.check_output(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", clip]))
    fixed = os.path.join(wd, "words_fixed.txt")
    if os.path.exists(fixed):
        words = [[l.split()[0], float(l.split()[1]), float(l.split()[2])] for l in open(fixed, encoding="utf-8") if l.strip()]
    else:
        words = transcribe(wav, os.path.join(wd, "words.json"))
    # drop fillers from captions and apply spelling fixes from the spec, e.g. "fix": {"Kernan": "Kernen"}
    fixes = spec.get("fix", {})
    words = [[" ".join(fixes.get(t, t) for t in w[0].split()), w[1], w[2]] for w in words
             if not re.fullmatch(r"(um|uh|uhm|erm)[,.]?", w[0].lower())]
    for k, v in fixes.items():
        words = [[w[0].replace(k, v), w[1], w[2]] for w in words]
    merged = []  # whisper splits hyphenated words ("low", "-cost"): join them back
    for w in words:
        if merged and w[0].startswith("-"):
            merged[-1] = [merged[-1][0] + w[0], merged[-1][1], w[2]]
        else:
            merged.append(w)
    words = merged
    card, wm = os.path.join(wd, "card.png"), os.path.join(wd, "wm.png")
    geo = render_card(spec["hook"], box_h, card, wm)
    vy = geo["video_y"]; cap_y = vy + int(box_h * spec.get("cap_pos", 0.86))  # caption centre, as a fraction of the video box
    ass = os.path.join(wd, "captions.ass")
    write_ass(words, ass, cap_y, dur, spec.get("censor", []))
    cx = float(spec.get("crop", 0.5))
    out = os.path.join(HERE, "out", sid + ".mp4")
    zoom = ""
    if spec.get("zoom"):  # punch in on a wide shot before filling the box
        zx, zy, zw = spec["zoom"]
        zoom = "crop=iw*%.4f:iw*%.4f:iw*%.4f:ih*%.4f," % (zw, zw * box_h / W, zx, zy)
    fc = ("[1:v]fps=30,%sscale=%d:%d:force_original_aspect_ratio=increase,crop=%d:%d:(iw-%d)*%.3f:(ih-%d)/2,setsar=1[v];"
          "[0:v][v]overlay=0:%d:shortest=1[b];"
          "[b]subtitles=%s:fontsdir=%s[out];[1:a]loudnorm=I=-14:TP=-1.5:LRA=11,aresample=48000[au]") % (
        zoom, W, box_h, W, box_h, W, cx, box_h, vy, ass, os.environ.get("FONTS_DIR", os.path.join(HERE, "fonts")))
    sh("ffmpeg", "-v", "error", "-y", "-loop", "1", "-i", card, "-i", clip, "-filter_complex", fc,
       "-map", "[out]", "-map", "[au]", "-t", "%.3f" % dur, "-c:v", "libx264", "-preset", "slow", "-crf", "18", "-pix_fmt", "yuv420p",
       "-r", "30", "-c:a", "aac", "-b:a", "192k", "-movflags", "+faststart", out)
    print(json.dumps({"out": out, "dur": round(dur, 2), "video_y": vy, "words": len(words)}))


if __name__ == "__main__":
    main()
