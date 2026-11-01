# Repost policy for Facebook and Telegram (1 Nov 2026)

Instagram carousels don't look native on Facebook or Telegram: Facebook crops a photo grid and hides slides behind "+2", and Telegram crops an album into tiles with unreadable text. So a carousel is only posted as-is on Instagram.

## Facebook: slideshow video
- The carousel becomes a 20 to 40 s video in the reel template: white hook card on top, slides centred, Quick_News_Beat under it. Video slides keep their own sound and the music ducks.
- Build: `MEME_DIR=<folder with card.js and card.html> python3 slideshow.py spec.json` (see the docstring). Facebook posts in English, so use the EN slides.
- Caption rewritten for Facebook: short storytelling paragraphs with sources, no hashtags, a question at the end, then the risk line.

## Telegram: text first plus one evidence image
- One image only: the strongest piece of evidence (the key screenshot, chart or table slide), never an album.
- Text rewritten for Telegram: a bold headline, 3 to 5 scannable bullets with figures and sources, sources as clickable links, then the risk line. One message per language channel.

## Instagram
- Unchanged: the evidence-led carousel (social-v2 README). Reels go to Instagram only; Facebook gets them through the automatic cross-post.
