# OnFin social carousel v2 (PostHuman style, evidence-led)

Rules agreed on 30 Oct 2026.

## Cover
- Full-bleed real photo of the subject (public domain, Creative Commons with credit, or official source).
- A centre "attention grabber" for context, e.g. a circle cutout of the company logo with the key move as a badge (-12.6%).
- One short hook headline, sentence case, one lime accent phrase. Optional small tag pill.

## Every other slide: real-world evidence only
- No stock photos and no generic text slides.
- Tell the story with real evidence: screenshots of article headlines and paragraphs, real people's quotes about the event (with the source), screenshots of tweets, official filings or releases, real price charts built from market data.
- If a slide states a number or explains something, the same slide shows the evidence that supports it (a highlighted screenshot, the data chart, or the filing), plus a source pill (outlet and date).
- One short line on top of each evidence card, at most about 8 words.
- Highlight the key phrase or figure inside the screenshot (lime marker) instead of retyping it.

## Branding and close
- Small bolt avatar and @onfinkm in the top-left corner only. No header bar, no slide counter.
- Last slide: a question to drive comments, a follow line, and a small risk line.
- The caption carries detail and full source list; the risk line goes in every caption.

## Building blocks
- social.js: SocialCover (photo + logo circle + badge), EvidenceSlide (screenshot card + source pill), ChartSlide (real price data), SocialSlide (photo + one line, used for the closing question).
- tools/shot.js: mobile screenshot of an article top. tools/snip2.js: clean screenshot of the paragraph containing a phrase, floating bars hidden, key terms highlighted.
- evid_sample.py and evidence-sample/: the Alphabet example built with these rules.
