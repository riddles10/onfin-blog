# Weekly giveaway reel template

- `round.js`: the copy for one round (question, dates, steps, prize). Edit this each week.
- `gold.js`: normalised daily closes for the chart line (no prices are shown on screen). Round 1 uses COMEX gold futures (GC=F) closes, 29 Jul to 29 Oct 2026.
- `node render_g.js <frames_dir>` renders 20s at 30fps; `node render_g.js cover <out.png>` renders the cover.
- Music: the Suno "Newsroom Ambience" bed, loudness normalised to about -16 LUFS (no voiceover on this format).

`give.html` loads React and the OnFin Instagram design library from `../iglib/library/` (from the design handoff, not in this repo).
