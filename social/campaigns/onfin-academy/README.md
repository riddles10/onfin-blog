# OnFin Academy launch campaign (Cambodia, English and Khmer)

These are the materials for the organic launch and a later paid Meta campaign. The budget isn't set yet. Nothing is scheduled in Postiz and nothing exists in Meta Ads.

Every Khmer string is my own translation and is waiting on review by a native speaker. All copy, in both languages, also needs a compliance check before it runs.

## What's here

| Folder | Contents |
|---|---|
| `brand/` | **Logo files:** the OnFin Academy lockup, SVG and PNG on dark and light, plus a stacked version.<br>**Account images:** the profile picture (1080), the Facebook cover (1640x624, EN and KM) and Instagram highlight covers. |
| `carousel/en`, `carousel/km` | Lesson-list carousel, 7 slides at 1080x1350.<br>Slide 1 is the cover, slides 2 to 5 cover lessons 1 to 12, three per slide.<br>Slide 6 explains how it works (watch, quiz, unlock), and slide 7 is the call to action. |
| `statics/en`, `statics/km` | 6 static ads, each in feed (1080x1350) and story/reel (1080x1920) sizes.<br>The 1920 versions keep the top 250px and bottom 420px clear. |
| `copy/ads.md` | The Meta ad copy deck (EN and KM): 2 primary texts, 2 headlines, a description and a CTA for each of 14 creatives.<br>Also the campaign structure, targeting, UTM scheme, A/B test angles, and what has to happen before ads can run. |
| `accounts/README.md` | **Account setup:** @onfinacademy bios, renaming the Facebook page to OnFin Academy, and the pinned welcome posts (EN and KM, with "we never DM you first").<br>**Launch support:** the plan for Collab posts with @onfinkm and OnFin Cambodia, and Telegram launch posts for KH, EN, MS, RU and ES. |
| `organic.md` | The first-week posting plan, within the posting caps, plus the carousel captions. |
| `reels/`, `trailer/` | 6 lesson clip reels, 23 to 30 seconds, in EN and KM, with their captions in `reels/captions.md`.<br>The 30-second trailer in 9:16 and 16:9, EN and KM. It also fits the hero slot on the Academy landing page. |
| `_source/` | The build scripts: `lockup.py`, `build.py`, `render.js`, `sheet.py` and `ads_copy.py`, plus the lesson frame picks and crops.<br>`_source/video/` builds the reels and the trailer. |

## Static ad hooks

1. What is a pip?
2. Why your broker shows two prices
3. Leverage cuts both ways
4. Learn forex in 3-minute lessons
5. Free. 12 lessons. Quizzes included.
6. From zero to your first demo trade

## Design notes

- **Imagery:** real frames from the lessons in the academy-media bucket, never stock photos. The phone mock-ups put a vertical lesson frame inside a simple version of the app's chapter bar, captions and tabs.
- **Lockup:**
  - The OnFin wordmark from the design library, followed by "Academy" in Montserrat SemiBold at the wordmark's cap height. The text is converted to outlines, so the SVGs don't need the font.
  - "Academy" uses the logo's own lime (#B4EA10), so it matches the capsule. On white, "Academy" is black, because lime fails contrast on white.
- **Fonts:** Montserrat for Latin text, Kantumruy Pro for Khmer (both SIL OFL). I zoomed in to check the Khmer shaping (subscript consonants and vowel signs) on the headlines, body text and risk line.
- **Khmer creatives** say "Lessons in English", because the course is English only for now. Remove it once the Khmer lessons exist.

## You need to

1. Create the Instagram account @onfinacademy and rename the "OnFin Learning" Facebook page to OnFin Academy (`accounts/README.md`).
2. Have a native speaker review all the Khmer, and have compliance review both languages.
3. Get academy.onfin.io live, with the Meta pixel, a sign-up conversion event and the cookie banner. This is the open tracking question in the Academy development session.
4. Check Meta's financial-services ad rules for Cambodia before setting a budget (`copy/ads.md`).

## Rebuild

1. Run `python3 _source/lockup.py <logo dir> <Montserrat.ttf> <out>/brand`.
2. Grab the lesson frames with `_source/grabfull.sh`, using `picks.txt` and `chapters.txt`.
3. Run `python3 _source/build.py <work dir> <this folder>`, then `node _source/render.js <work dir>/jobs.json`.
4. Regenerate the copy deck with `python3 _source/ads_copy.py > copy/ads.md`.
