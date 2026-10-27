# Brief: write OnFin Sunday guide carousels (Instagram/Telegram/Facebook), EN + RU + ES + MS

SCRATCH = /tmp/claude-0/-home-user-onfin-blog/42b2fa22-784d-52c4-a9a8-6ec4971d0812/scratchpad

You turn one OnFin blog article into an 8-slide carousel module, wk/car_<KEY>.py, in four languages.
The reference module, already approved and scheduled, is SCRATCH/wk/car_sltp.py. Read it first and copy its structure,
tone and slide-text lengths exactly. The builder that consumes your module is SCRATCH/wk/carousel.py (read its docstring).
Slide templates come from the OnFin Instagram design library. Their props are documented in
SCRATCH/iglib/library/components/carousel/*.d.ts and *.prompt.md (read the ones you use).

## Steps per article
1. Fetch the article (it exists in en/ru/es/ms): `curl -sL https://blog.onfin.io/en/<SLUG> -o SCRATCH/arts2/<KEY>.html && python3 -I SCRATCH/extract.py SCRATCH/arts2/<KEY>.html > SCRATCH/arts2/<KEY>.txt`.
   Read the English text in full. The first line printed is "OG: <url>": download that image to SCRATCH/w1/media/<KEY>-cover.jpg (COVER = "<KEY>-cover.jpg").
   Also fetch the RU/ES/MS versions and skim them for each language's terminology, so your translations match the blog's own terms.
2. Write SCRATCH/wk/car_<KEY>.py with KEY, SLUG, COVER, GUIDE, TAGS, CAP and SLIDES (en, ru, es, ms), structured like car_sltp.py:
   - cover: kicker ("Trading guide" / "Гайд по трейдингу" / "Guía de trading" / "Panduan dagangan"), a title with one *emphasised* phrase and a \n line break, and a one-line subtitle.
   - s2..s7: six content slides. Mix templates: at least four different ones from CarouselText, CarouselList (3 items),
     CarouselCompare (3 items a side), CarouselSteps (3 to 4 steps, current=last, disclaimer=True), CarouselRates (a real table
     from the article or simple arithmetic you can show, disclaimer=True, footnote naming the source), CarouselMyth (mythLabel/factLabel
     localized as in the reference), CarouselStat (value, label, context). Every heading has one *emphasised* phrase.
   - end: the CarouselEnd "Follow us on Instagram" CTA, worded exactly as in car_sltp.py for each language.
   - CAP: 3 lines per language (title, a hook sentence, a "swipe for ..." sentence). The builder appends links, CTA and risk lines.
   - TAGS: 5 to 6 relevant hashtags ending with #onfin.
3. Test: `cd SCRATCH/wk && python3 test_carousel.py car_<KEY>`. Then LOOK at SCRATCH/test_<KEY>/sheet-en.png, sheet-ru.png, sheet-es.png and sheet-ms.png
   with the Read tool. Fix any text that overflows, collides, wraps badly (e.g. a single orphan word) or leaves a slide mostly empty.
   Re-run until all four sheets are clean. Russian and Spanish run longer, so shorten them rather than letting them overflow.

## Hard copy rules (non-negotiable)
- No en dashes or em dashes anywhere (use commas, colons, "to", or rewrite). No exclamation marks. No emoji.
- Sentence case. Plain, calm, educational tone like the reference.
- Every figure or statistic must come from the article (or be arithmetic shown on the slide), with the source on the slide or in its footnote.
  If the article cites a study or regulator figure, name it. Don't invent numbers.
- Never promise or imply profits, easy money, guaranteed results or "no risk". No investment advice ("buy X").
- Don't make claims about OnFin's products, leverage, regulation, bonuses or pricing unless the article states them, and even then prefer not to.
  For gold: don't mention OnFin leverage levels at all.
- Russian: decimal comma (0,5), thousands with a space (5 000). Negative percentages use an ASCII hyphen-minus "-".
  Spanish (LATAM) and Malay: decimal point.
- Keep each list item's body to one short sentence (about 12 words max EN), like the reference.

## Deliverable
Report back with only: the module paths you wrote, confirmation that all four sheets were visually checked, and any article claims you left out because they lacked a source.
