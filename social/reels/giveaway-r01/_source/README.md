# Weekly giveaway reel template

- `round.js`: the copy for one round (question, dates, steps, prize). Edit this each week.
- `gold.js`: normalised daily closes for the chart line (no prices are shown on screen). Round 1 uses COMEX gold futures (GC=F) closes, 29 Jul to 29 Oct 2026.
- `node render_g.js <frames_dir> - [r=02][&p=fb]` renders 20s at 30fps; `node render_g.js cover <out.png> [r=02]` renders the cover. Round files: `round.js` (round 1), `../../giveaway-r02/_source/round02.js` (copy next to give.html), with the chart series in `R.series`.
- Music: `social/reels/_audio/quick_news_beat.mp3` (Suno "Quick News Beat", the default bed for new reels). `mux_g.sh <frames_dir> <out.mp4>` normalises it to about -16 LUFS (no voiceover on this format).
- `?p=fb` renders the Facebook copy (follow step, handle, disclaimer) from `R.fb`.

`give.html` loads React and the OnFin Instagram design library from `../iglib/library/` (from the design handoff, not in this repo).
