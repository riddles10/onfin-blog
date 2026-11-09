# Posting volume

## 4 Nov 2026: queue cut by half

The week of 28 Oct to 3 Nov averaged about 7.6 posts a day on Instagram, 4.9 on Facebook and 5 on each Telegram channel. Views per post on Telegram fell two to three times as volume went up, so the queue from 4 Nov onward was cut from 473 to 236 posts.

| Channel | Before | After |
|---|---|---|
| Instagram | 110 | 57 |
| Facebook | 56 | 28 |
| Telegram KH | 56 | 28 |
| Telegram EN | 68 | 32 |
| Telegram MS | 68 | 32 |
| Telegram RU | 58 | 30 |
| Telegram ES | 57 | 29 |

What went, the same items on every channel:
- Growth Rewards reminders other than "Final week" and "Last 48 hours" (halfway, pick your target, which measure, 3 rules, what counts, 4 days left).
- Genesis creator tips and promos except the core ones (how it works, what your views pay, first video, FAQ), plus every repeat in December.
- Campaign spotlights, and a few education posts: hackers, slippage, forex or stocks, psychological traps, MT4 vs MT5.
- Instagram only: re-posts of news more than two weeks old (Alphabet, Moderna, Nvidia staff), every other story, one duplicate giveaway.

What stayed: news, the market calendar (weekly movers, CPI, jobs, Fed, rate weeks, holidays), the weekly giveaway, Growth Rewards deadlines, the myths series and the main education posts.

`cut-2026-11-04-backup.json` holds every deleted post (content, images, settings, original time). To bring one back, post it again with `POST /public/v1/posts` using those fields.

## Daily caps from 4 Nov

- Each Telegram channel: at most 2 posts a day.
- Facebook: at most 2 a day, plus the weekly giveaway.
- Instagram: at most 4 a day in total. Of those, at most 2 feed posts (carousels or photos) at least 3 hours apart. Clip reels: 2 a day, not 4.
- A new news story takes the slot of that day's evergreen post. Move the evergreen post to the next free day, or drop it.

## 9 Nov 2026: Instagram feed posts on hold

Every Instagram feed post with images (carousel, photo, or carousel with a video slide) has failed since 30 Oct 12:00 UTC. All 11 attempts returned the same Instagram error: code 4, subcode 2207051, "action is blocked: We restrict certain activity to protect our community". Meta's error reference describes 2207051 as "the publishing action is suspected to be spam". Reels and stories still publish.

The block started right after the busiest morning so far: seven Instagram posts between 02:00 and 11:30 UTC on 30 Oct, four of them carousels. Nothing in the failed posts sets them apart from the ones that published before 30 Oct: alt text, caption length, hashtags, links, emoji and image format all match.

- The 24 queued carousels and photos (9 Nov to 27 Dec) were removed from Postiz and saved in `ig-feed-hold-2026-11-09.json`. Reels and stories stay scheduled.
- The 11 failed posts stay in Postiz with state ERROR.
- Once the block is lifted, reschedule the held and failed posts within the daily caps, with feed posts at least 3 hours apart. Test with one post first.

## 9 Nov 2026: Facebook reels backlog

Instagram's automatic cross-post to Facebook stopped after the SpaceX revenue reel (30 Oct). The Facebook copies had been removed on 30 Oct on the assumption that the cross-post worked. `fb_reels_backlog.py` re-posts the 25 missing reels to Facebook, one a day at 13:30 UTC from 10 Nov to 5 Dec (log: `fb_reels_backlog_log.json`). From now on, schedule every reel on Facebook directly as well as on Instagram. Postiz publishes a Facebook video post as a Facebook reel.
