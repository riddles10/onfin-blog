"""Facebook slideshow video from a carousel (reel template: white hook card above, slides centred, music bed).

Usage:  python3 slideshow.py spec.json
spec.json:
  {"out": "out/story-fb.mp4",
   "hook": "Is Google's own AI eating its ad business?",
   "slides": ["evidence/g-en-01.jpg", "evidence/g-en-02.jpg", "evidence/g-en-07.mp4", ...],
   "sec": 3.2,              # seconds per image slide (default: fit the total into about 38 s, 2.6 to 4 s each)
   "cover_sec": 2.6,        # first slide
   "max_video_sec": 12,     # video slides are trimmed to this
   "music": "../../reels/_audio/quick_news_beat.mp3"}
Video slides keep their own audio; the music ducks under them. Needs node + Playwright for the card (reels/_meme/card.js).
"""
import json, os, subprocess, sys, tempfile

HERE = os.path.dirname(os.path.abspath(__file__))
MEME = os.environ.get("MEME_DIR", os.path.join(HERE, "..", "..", "reels", "_meme"))  # card.js + card.html (fonts load from the design handoff)
W, H, BOX_W, BOX_H, XF = 1080, 1920, 1080, 1350, 0.3


def sh(*a):
    subprocess.run(a, check=True)


def dur(p):
    return float(subprocess.check_output(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", p]))


def main():
    spec = json.load(open(sys.argv[1]))
    base = os.path.dirname(os.path.abspath(sys.argv[1]))
    path = lambda p: p if os.path.isabs(p) else os.path.join(base, p)
    slides = [path(s) for s in spec["slides"]]
    vids = [s.lower().endswith(".mp4") for s in slides]
    maxv = spec.get("max_video_sec", 12)
    vlen = {i: min(maxv, dur(s)) for i, s in enumerate(slides) if vids[i]}
    n_img = len(slides) - len(vlen)
    cover = spec.get("cover_sec", 2.6)
    sec = spec.get("sec") or max(2.6, min(4.0, (38 - cover - sum(vlen.values())) / max(1, n_img - 1)))  # long enough to read an evidence card
    lens = [vlen[i] if vids[i] else (cover if i == 0 else sec) for i in range(len(slides))]
    lens[-1] += 1.0  # hold the closing question a beat longer
    wd = tempfile.mkdtemp(prefix="slideshow_")
    card, wm = os.path.join(wd, "card.png"), os.path.join(wd, "wm.png")
    geo = json.loads(subprocess.run(["node", os.path.join(MEME, "card.js"), json.dumps({"hook": spec["hook"], "box_h": BOX_H, "card": card, "wm": wm})],
                                    check=True, capture_output=True, text=True).stdout.strip().splitlines()[-1])
    vy = geo["video_y"]
    # one clip per slide, each padded by the crossfade so the cut points land on the planned lengths
    parts = []
    for i, (s, L) in enumerate(zip(slides, lens)):
        p = os.path.join(wd, "p%02d.mp4" % i)
        vf = "scale=%d:%d:force_original_aspect_ratio=decrease,pad=%d:%d:(ow-iw)/2:(oh-ih)/2:color=white,fps=30,format=yuv420p,setsar=1" % (BOX_W, BOX_H, BOX_W, BOX_H)
        if vids[i]:  # hold the last frame so a clip shorter than its slot still covers the crossfade
            sh("ffmpeg", "-v", "error", "-y", "-i", s, "-t", "%.3f" % (L + XF), "-vf", vf + ",tpad=stop_mode=clone:stop_duration=1", "-an",
               "-c:v", "libx264", "-crf", "16", "-preset", "fast", p)
        else:
            sh("ffmpeg", "-v", "error", "-y", "-loop", "1", "-t", "%.3f" % (L + XF), "-i", s, "-vf", vf, "-c:v", "libx264", "-crf", "16", "-preset", "fast", p)
        parts.append(p)
    # crossfade chain
    inputs, fc, last, t = [], [], "[0:v]", 0.0
    for p in parts:
        inputs += ["-i", p]
    for i in range(1, len(parts)):
        t += lens[i - 1]
        fc.append("%s[%d:v]xfade=transition=fade:duration=%.2f:offset=%.3f[x%d]" % (last, i, XF, t, i))
        last = "[x%d]" % i
    total = sum(lens)
    slides_mp4 = os.path.join(wd, "slides.mp4")
    if len(parts) > 1:
        sh("ffmpeg", "-v", "error", "-y", *inputs, "-filter_complex", ";".join(fc), "-map", last, "-t", "%.3f" % total,
           "-c:v", "libx264", "-crf", "16", "-preset", "fast", slides_mp4)
    else:
        sh("ffmpeg", "-v", "error", "-y", "-i", parts[0], "-t", "%.3f" % total, "-c", "copy", slides_mp4)
    # audio: music bed, ducked under video slides that carry their own sound
    music = path(spec.get("music", os.path.join(HERE, "..", "..", "reels", "_audio", "quick_news_beat.mp3")))
    starts, t = [], 0.0
    for L in lens:
        starts.append(t); t += L
    duck = "+".join("between(t,%.2f,%.2f)" % (starts[i], starts[i] + lens[i]) for i in vlen) or "0"
    a_in, a_fc, mix = ["-stream_loop", "-1", "-i", music], [], ["[m]"]
    a_fc.append("[2:a]atrim=0:%.3f,asetpts=PTS-STARTPTS,volume=0.55,volume=enable='%s':volume=0.25,afade=t=out:st=%.3f:d=1.5[m]" % (total, duck, total - 1.5))
    k = 3
    for i in vlen:
        has_audio = subprocess.run(["ffprobe", "-v", "error", "-select_streams", "a", "-show_entries", "stream=index", "-of", "csv=p=0", slides[i]],
                                   capture_output=True, text=True).stdout.strip()
        if not has_audio:
            continue
        a_in += ["-i", slides[i]]
        a_fc.append("[%d:a]atrim=0:%.3f,asetpts=PTS-STARTPTS,adelay=%d|%d,volume=1.6[v%d]" % (k, lens[i], starts[i] * 1000, starts[i] * 1000, k))
        mix.append("[v%d]" % k); k += 1
    a_fc.append("%samix=inputs=%d:duration=first:normalize=0,loudnorm=I=-15:TP=-1.5:LRA=11,aresample=48000[a]" % ("".join(mix), len(mix)))
    out = path(spec["out"])
    os.makedirs(os.path.dirname(out), exist_ok=True)
    fcv = "[0:v][1:v]overlay=0:%d:shortest=1[v]" % vy
    sh("ffmpeg", "-v", "error", "-y", "-loop", "1", "-i", card, "-i", slides_mp4, *a_in,
       "-filter_complex", fcv + ";" + ";".join(a_fc), "-map", "[v]", "-map", "[a]", "-t", "%.3f" % total,
       "-c:v", "libx264", "-preset", "slow", "-crf", "19", "-pix_fmt", "yuv420p", "-r", "30",
       "-c:a", "aac", "-b:a", "192k", "-movflags", "+faststart", out)
    print(json.dumps({"out": out, "dur": round(total, 2), "video_y": vy, "slides": len(slides), "sec": round(sec, 2)}))


if __name__ == "__main__":
    main()
