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
