# Meme-style clip reels (news slots)

White hook card (OnFin bolt avatar from `logo/avatar-bolt.jpg`, @onfinkm, one-line hook), the real clip full width, burned-in word captions near the bottom of the clip (`cap_pos`, default 0.86). No watermark. Original audio, no voiceover.

1. Put the source video in `raw/`.
2. Write a spec: `{"id": "flash-crash", "src": "raw/flash.mp4", "in": 95, "out": 130, "hook": "...", "crop": 0.5, "box_h": 660}`.
3. Run `/path/to/faster-whisper-venv/bin/python build.py spec.json`. It trims the clip, transcribes it (faster-whisper small, word timestamps), renders the card with Playwright (`card.js`), writes ASS captions in Montserrat ExtraBold and composites with ffmpeg. Output: `out/<id>.mp4`.
4. If the transcript needs fixing, edit `work/<id>/words_fixed.txt` (`word start end` per line) and run again. `"censor": ["word"]` masks words in captions.

`card.html` loads Montserrat from `../iglib/library/tokens/fonts.css` (design handoff, not in this repo). `fonts/` holds static Montserrat instances (SIL Open Font License) for libass.

Every caption credits the original creator, and the risk line goes at the end.
