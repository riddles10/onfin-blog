"""words.py <src> <t0> <t1> [<t0> <t1> ...]: word timestamps (absolute seconds) for windows of a source, to pick clean cut points."""
import subprocess, sys
import numpy as np
from faster_whisper import WhisperModel
m = WhisperModel("small", device="cpu", compute_type="int8")
src, a = sys.argv[1], sys.argv[2:]
for t0, t1 in zip(a[::2], a[1::2]):
    t0, t1 = float(t0), float(t1)
    pcm = subprocess.run(["ffmpeg", "-v", "error", "-ss", str(t0), "-to", str(t1), "-i", src, "-f", "f32le", "-ac", "1", "-ar", "16000", "-"], check=True, capture_output=True).stdout
    segs, _ = m.transcribe(np.frombuffer(pcm, np.float32), language="en", word_timestamps=True, vad_filter=False)
    print("== %s %.1f-%.1f" % (src.split("/")[-1], t0, t1))
    line = []
    for s in segs:
        for w in s.words:
            line.append("%s[%.2f-%.2f]" % (w.word.strip(), t0 + w.start, t0 + w.end))
            if len(line) == 8:
                print(" ".join(line)); line = []
    if line: print(" ".join(line))
