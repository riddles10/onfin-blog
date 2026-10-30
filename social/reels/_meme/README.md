# Meme-style clip reels (news slots)

White hook card (OnFin bolt avatar from `logo/avatar-bolt.jpg`, @onfinkm, one-line hook), the real clip full width, burned-in word captions near the bottom of the clip (`cap_pos`, default 0.86). No watermark. Original audio, no voiceover.

Publishing rule (30 Oct 2026): schedule reels on Instagram only. Instagram reels are cross-posted to the Facebook page automatically, so a Facebook copy would duplicate them. Carousels and photo posts still go to Facebook directly.

Layout rule (30 Oct 2026): the video box always sits in the dead centre of the 1080x1920 frame, and the hook card sits directly above it. `card.js` positions both.

Localized versions: write translated `word start end` lines to `work/<id>/words_fixed.txt` and set `FONTS_DIR` to a folder holding the full Montserrat (with Cyrillic) for Russian.

1. Put the source video in `raw/`.
2. Write a spec: `{"id": "flash-crash", "src": "raw/flash.mp4", "in": 95, "out": 130, "hook": "...", "crop": 0.5, "box_h": 660}`.
3. Run `/path/to/faster-whisper-venv/bin/python build.py spec.json`. It trims the clip, transcribes it (faster-whisper small, word timestamps), renders the card with Playwright (`card.js`), writes ASS captions in Montserrat ExtraBold and composites with ffmpeg. Output: `out/<id>.mp4`.
4. If the transcript needs fixing, edit `work/<id>/words_fixed.txt` (`word start end` per line) and run again. `"censor": ["word"]` masks words in captions.

`card.html` loads Montserrat from `../iglib/library/tokens/fonts.css` (design handoff, not in this repo). `fonts/` holds static Montserrat instances (SIL Open Font License) for libass.

Every caption credits the original creator, and the risk line goes at the end.
