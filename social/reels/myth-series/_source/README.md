# Myth vs Fact reel template (episodes 02 onward)

- `specs.py`: script, on-screen text and covers per episode and language (EN, MS, RU, ES).
- `t/<NN>_<lang>.txt`: word timings for each voiceover (`word start end`).
- `build_eps.py <ep>`: builds `ep<NN>_<lang>.js` (scene data plus synced captions) from the spec and timings.
- `render2.js <NN> <lang> <frames_dir>`: renders 1080x1920 frames at 30fps with Playwright. Pass `t1,t2` instead of a dir range for stills.
- `mux2.sh <NN> <lang>`: voiceover at -14 LUFS plus the Suno bed (`music.mp3`) at 20% volume, H.264 CRF 18, AAC 192k.
- `captions_eps.py`: writes the per-channel captions to `social/reels/myth-0N/captions.md`.

`myth2.html` loads React and the OnFin Instagram design library from `../iglib/library/` (from the design handoff, not in this repo). Copy `audio/*.mp3` next to the scripts before muxing.
