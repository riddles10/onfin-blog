"""Meta ad copy for the OnFin Academy launch (EN + KM). Run: python3 ads_copy.py > ../copy/ads.md
Checks: headlines 40 characters or fewer, no en/em dashes, no exclamation marks."""
import re, sys

RISK_EN = "High risk: most retail CFD accounts lose money. Education, not investment advice."
RISK_KM = "ហានិភ័យខ្ពស់៖ គណនី CFD របស់វិនិយោគិនរាយភាគច្រើនខាតប្រាក់។ ជាការអប់រំ មិនមែនជាដំបូន្មានវិនិយោគទេ។"
LANG_KM = "មេរៀនជាភាសាអង់គ្លេសសម្រាប់ពេលនេះ។"  # "Lessons are in English for now." Drop once Khmer lessons exist.

# id, creative file(s), CTA, EN {p1,p2,h1,h2,d}, KM {...}
ADS = [
 ("trailer", "reels/ (30-second trailer, 9:16 and 16:9)", "Sign up",
  dict(p1="OnFin Academy is a free forex course made for your phone. 12 short video lessons, a quiz after each one, and your progress saved as you go. Start with currency pairs, finish with a full trade on demo.",
       p2="New to forex? Start here. Free lessons of about 3 minutes, from pips and lots to leverage and risk.",
       h1="Learn forex, one short lesson at a time", h2="Free forex course for beginners", d="Sign up free at academy.onfin.io"),
  dict(p1="OnFin Academy គឺជាវគ្គសិក្សា Forex ឥតគិតថ្លៃ ដែលបង្កើតឡើងសម្រាប់ទូរសព្ទរបស់អ្នក។ មេរៀនវីដេអូខ្លីៗ 12 មានសំណួរបន្ទាប់ពីមេរៀននីមួយៗ ហើយវឌ្ឍនភាពរបស់អ្នកត្រូវបានរក្សាទុក។ ចាប់ផ្តើមពីគូរូបិយប័ណ្ណ បញ្ចប់ដោយការជួញដូរពេញលេញលើគណនីសាកល្បង។",
       p2="ទើបតែចាប់ផ្តើម Forex? ចាប់ផ្តើមនៅទីនេះ។ មេរៀនឥតគិតថ្លៃ ប្រហែល 3 នាទី ចាប់ពី Pip និង Lot ដល់ Leverage និងហានិភ័យ។",
       h1="រៀន Forex ម្តងមួយមេរៀនខ្លីៗ", h2="វគ្គ Forex ឥតគិតថ្លៃ", d="ចុះឈ្មោះឥតគិតថ្លៃនៅ academy.onfin.io")),
 ("reel-pips", "reels/ (pips, lesson 4 chapter 1)", "Sign up",
  dict(p1="Traders don't say the price rose by 0.0001. They say one pip. Lesson 4 of OnFin Academy explains it in about a minute. 12 free video lessons, made for your phone.",
       p2="What is a pip, and why does every trader count them? Learn it in a short video lesson, then check yourself with a quick quiz. Free at academy.onfin.io.",
       h1="What is a pip?", h2="Free forex lessons, about 3 minutes", d="12 free lessons. Sign up to start."),
  dict(p1="អ្នកជួញដូរមិននិយាយថា តម្លៃឡើង 0.0001 ទេ។ ពួកគេនិយាយថា មួយ Pip។ មេរៀនទី 4 នៃ OnFin Academy ពន្យល់រឿងនេះក្នុងរយៈពេលប្រហែលមួយនាទី។ មេរៀនវីដេអូឥតគិតថ្លៃ 12 សម្រាប់ទូរសព្ទរបស់អ្នក។",
       p2="Pip គឺជាអ្វី ហើយហេតុអ្វីអ្នកជួញដូរគ្រប់រូបរាប់វា? រៀនតាមវីដេអូខ្លី បន្ទាប់មកសាកល្បងខ្លួនឯងជាមួយសំណួរខ្លីៗ។ ឥតគិតថ្លៃនៅ academy.onfin.io។",
       h1="Pip គឺជាអ្វី?", h2="មេរៀន Forex ឥតគិតថ្លៃ ប្រហែល 3 នាទី", d="មេរៀនឥតគិតថ្លៃ 12។ ចុះឈ្មោះដើម្បីចាប់ផ្តើម។")),
 ("reel-spread", "reels/ (bid, ask and the spread, lesson 3 chapter 2)", "Learn more",
  dict(p1="Every trade starts slightly behind. The gap between the buy and sell price is the spread, and it's a cost you pay on every trade. Lesson 3 shows how it works.",
       p2="Why does your platform show two prices? A short, free lesson on bid, ask and the spread, with a quiz at the end.",
       h1="The spread is a cost. Here's why.", h2="Bid, ask and the spread, in minutes", d="Free video lessons for beginners."),
  dict(p1="ការជួញដូរនីមួយៗចាប់ផ្តើមដោយខាតបន្តិច។ គម្លាតរវាងតម្លៃទិញ និងតម្លៃលក់ ហៅថា Spread ហើយវាជាថ្លៃដែលអ្នកបង់លើការជួញដូរនីមួយៗ។ មេរៀនទី 3 បង្ហាញពីរបៀបដែលវាដំណើរការ។",
       p2="ហេតុអ្វីកម្មវិធីជួញដូរបង្ហាញតម្លៃពីរ? មេរៀនខ្លីឥតគិតថ្លៃអំពី Bid, Ask និង Spread មានសំណួរនៅចុងបញ្ចប់។",
       h1="Spread ជាថ្លៃ។ នេះជាមូលហេតុ។", h2="Bid, Ask និង Spread ក្នុងប៉ុន្មាននាទី", d="មេរៀនវីដេអូឥតគិតថ្លៃសម្រាប់អ្នកចាប់ផ្តើម។")),
 ("reel-leverage", "reels/ (leverage, lesson 7 chapter 2)", "Learn more",
  dict(p1="Leverage lets you control a bigger position with less money. It also makes losses bigger, by the same amount. Lesson 7 walks through a worked example in numbers.",
       p2="Before you use leverage, see what a 1% move can do to an account. Short, free lesson. No experience needed.",
       h1="Leverage cuts both ways", h2="See what a 1% move can do", d="Free lesson on leverage and risk."),
  dict(p1="Leverage អនុញ្ញាតឱ្យអ្នកគ្រប់គ្រង Position ធំជាងមុន ដោយប្រើប្រាក់តិច។ វាក៏ធ្វើឱ្យការខាតធំជាងមុនក្នុងកម្រិតដូចគ្នាដែរ។ មេរៀនទី 7 បង្ហាញឧទាហរណ៍ជាលេខ។",
       p2="មុនពេលប្រើ Leverage មើលថាចលនាតម្លៃ 1% អាចធ្វើអ្វីខ្លះចំពោះគណនី។ មេរៀនខ្លី ឥតគិតថ្លៃ។ មិនត្រូវការបទពិសោធន៍។",
       h1="Leverage ពង្រីកទាំងចំណេញ និងខាត", h2="មើលថាចលនា 1% អាចធ្វើអ្វីបាន", d="មេរៀនឥតគិតថ្លៃអំពី Leverage និងហានិភ័យ។")),
 ("reel-stop-out", "reels/ (margin call and stop-out, lesson 9 chapter 2)", "Learn more",
  dict(p1="A margin call is a warning. A stop-out is when the broker starts closing your positions for you, biggest loser first. Lesson 9 explains both, so neither one surprises you.",
       p2="What happens when free margin runs out? A short, free lesson on margin level, margin calls and stop-out.",
       h1="What is a stop-out?", h2="Margin calls, explained in minutes", d="Free lessons on margin and risk."),
  dict(p1="Margin call គឺជាការព្រមាន។ Stop-out គឺពេលឈ្មួញកណ្តាលចាប់ផ្តើមបិទ Position របស់អ្នកជំនួសអ្នក ដោយចាប់ពីមួយដែលខាតច្រើនជាងគេ។ មេរៀនទី 9 ពន្យល់ទាំងពីរ ដើម្បីកុំឱ្យអ្នកភ្ញាក់ផ្អើល។",
       p2="អ្វីកើតឡើងនៅពេល Free margin អស់? មេរៀនខ្លីឥតគិតថ្លៃអំពី Margin level, Margin call និង Stop-out។",
       h1="Stop-out គឺជាអ្វី?", h2="Margin call ពន្យល់ក្នុងប៉ុន្មាននាទី", d="មេរៀនឥតគិតថ្លៃអំពី Margin និងហានិភ័យ។")),
 ("reel-sessions", "reels/ (trading sessions, lesson 10 chapter 3)", "Learn more",
  dict(p1="Forex runs 24 hours a day, 5 days a week, but not every hour is the same. When London and New York overlap, the market is at its busiest. Lesson 10 shows when, and what it costs.",
       p2="Which hours move the most, and when do spreads widen? Learn the four sessions in a short, free lesson.",
       h1="When is forex busiest?", h2="The four sessions, in one lesson", d="Free forex lessons for beginners."),
  dict(p1="ទីផ្សារ Forex បើក 24 ម៉ោងក្នុងមួយថ្ងៃ 5 ថ្ងៃក្នុងមួយសប្តាហ៍ ប៉ុន្តែមិនមែនគ្រប់ម៉ោងដូចគ្នាទេ។ ពេល London និង New York ជាន់គ្នា ទីផ្សាររវល់បំផុត។ មេរៀនទី 10 បង្ហាញថាពេលណា និងថ្លៃប៉ុន្មាន។",
       p2="ម៉ោងណាដែលតម្លៃផ្លាស់ទីច្រើនបំផុត ហើយពេលណា Spread រីកធំ? រៀនពី Session ទាំងបួន ក្នុងមេរៀនខ្លីឥតគិតថ្លៃ។",
       h1="ពេលណា Forex រវល់បំផុត?", h2="Session ទាំងបួន ក្នុងមេរៀនតែមួយ", d="មេរៀន Forex ឥតគិតថ្លៃសម្រាប់អ្នកចាប់ផ្តើម។")),
 ("reel-stop-loss", "reels/ (stop loss and take profit, lesson 11 chapter 3)", "Sign up",
  dict(p1="A stop loss closes a trade at a level you choose, so you decide the most you're prepared to lose before you enter. Lesson 11 shows how to set it, and where it has limits.",
       p2="Stop loss and take profit, set before you trade. A short, free lesson with a worked example on a demo account.",
       h1="Set your exit before you enter", h2="Stop loss and take profit, explained", d="Free lessons. Practise on demo."),
  dict(p1="Stop loss បិទការជួញដូរនៅកម្រិតដែលអ្នកជ្រើសរើស ដូច្នេះអ្នកសម្រេចចិត្តថាអាចខាតបានច្រើនបំផុតប៉ុន្មាន មុនពេលចូល។ មេរៀនទី 11 បង្ហាញរបៀបកំណត់វា និងដែនកំណត់របស់វា។",
       p2="Stop loss និង Take profit កំណត់មុនពេលជួញដូរ។ មេរៀនខ្លីឥតគិតថ្លៃ ជាមួយឧទាហរណ៍លើគណនីសាកល្បង។",
       h1="កំណត់ចំណុចចេញ មុនពេលចូល", h2="Stop loss និង Take profit ពន្យល់ច្បាស់", d="មេរៀនឥតគិតថ្លៃ។ ហាត់លើគណនីសាកល្បង។")),
 ("carousel", "carousel/en/academy-en-01..07.jpg, carousel/km/academy-km-01..07.jpg", "Learn more",
  dict(p1="Here's everything in OnFin Academy's free forex basics course, lesson by lesson. Swipe through, then pick where you'd start.",
       p2="12 lessons. About 3 minutes each. A quiz after every one. From currency pairs to your first demo trade, free.",
       h1="12 free forex lessons", h2="From zero to your first demo trade", d="Watch, quiz, unlock the next one."),
  dict(p1="នេះជាមេរៀនទាំងអស់ក្នុងវគ្គ Forex មូលដ្ឋានឥតគិតថ្លៃរបស់ OnFin Academy ម្តងមួយមេរៀន។ អូសមើល រួចជ្រើសរើសមេរៀនដែលអ្នកចង់ចាប់ផ្តើម។",
       p2="មេរៀន 12។ ប្រហែល 3 នាទីក្នុងមួយមេរៀន។ មានសំណួរបន្ទាប់ពីមេរៀននីមួយៗ។ ចាប់ពីគូរូបិយប័ណ្ណ ដល់ការជួញដូរលើគណនីសាកល្បងលើកដំបូង ឥតគិតថ្លៃ។",
       h1="មេរៀន Forex ឥតគិតថ្លៃ 12", h2="ពីសូន្យ ដល់ការជួញដូរសាកល្បងដំបូង", d="មើល ឆ្លើយ ដោះសោមេរៀនបន្ទាប់។")),
 ("static-pip", "statics/*/academy-static-pip-{feed,story}-*.jpg", "Sign up",
  dict(p1="What is a pip? It's how traders count price moves, and it's lesson 4 of 12 in OnFin Academy's free forex course.",
       p2="Learn the basics of forex in short video lessons, with a quiz after each one. Free account, no experience needed.",
       h1="What is a pip?", h2="Free forex course for beginners", d="12 lessons, about 3 minutes each."),
  dict(p1="Pip គឺជាអ្វី? វាជារបៀបដែលអ្នកជួញដូររាប់ចលនាតម្លៃ ហើយវាជាមេរៀនទី 4 ក្នុងចំណោម 12 នៃវគ្គ Forex ឥតគិតថ្លៃរបស់ OnFin Academy។",
       p2="រៀនមូលដ្ឋាន Forex តាមមេរៀនវីដេអូខ្លីៗ មានសំណួរបន្ទាប់ពីមេរៀននីមួយៗ។ គណនីឥតគិតថ្លៃ មិនត្រូវការបទពិសោធន៍។",
       h1="Pip គឺជាអ្វី?", h2="វគ្គ Forex ឥតគិតថ្លៃ", d="មេរៀន 12 ប្រហែល 3 នាទីក្នុងមួយមេរៀន។")),
 ("static-two-prices", "statics/*/academy-static-two-prices-{feed,story}-*.jpg", "Learn more",
  dict(p1="Every quote has two prices: you buy at the ask and sell at the bid. The gap is the spread, a cost on every trade. Learn it free in lesson 3.",
       p2="Short, free forex lessons for beginners, made for your phone.",
       h1="Why are there two prices?", h2="Bid, ask and the spread, free", d="Free lesson. Quiz included."),
  dict(p1="តម្លៃនីមួយៗមានពីរ៖ អ្នកទិញនៅតម្លៃ Ask ហើយលក់នៅតម្លៃ Bid។ គម្លាតនោះគឺ Spread ជាថ្លៃលើការជួញដូរនីមួយៗ។ រៀនវាដោយឥតគិតថ្លៃក្នុងមេរៀនទី 3។",
       p2="មេរៀន Forex ខ្លីៗឥតគិតថ្លៃសម្រាប់អ្នកចាប់ផ្តើម សម្រាប់ទូរសព្ទរបស់អ្នក។",
       h1="ហេតុអ្វីមានតម្លៃពីរ?", h2="Bid, Ask និង Spread ឥតគិតថ្លៃ", d="មេរៀនឥតគិតថ្លៃ។ មានសំណួរ។")),
 ("static-leverage", "statics/*/academy-static-leverage-{feed,story}-*.jpg", "Learn more",
  dict(p1="Leverage makes positions bigger, and losses bigger too. Lesson 7 shows what a 1% move can do to an account, in plain numbers.",
       p2="Understand leverage and margin before you trade. Free video lessons, about 3 minutes each.",
       h1="Leverage cuts both ways", h2="Learn the risks first, free", d="Free lessons on leverage and margin."),
  dict(p1="Leverage ធ្វើឱ្យ Position ធំជាងមុន ហើយការខាតក៏ធំជាងមុនដែរ។ មេរៀនទី 7 បង្ហាញថាចលនាតម្លៃ 1% អាចធ្វើអ្វីខ្លះចំពោះគណនី ជាលេខងាយយល់។",
       p2="យល់ពី Leverage និង Margin មុនពេលជួញដូរ។ មេរៀនវីដេអូឥតគិតថ្លៃ ប្រហែល 3 នាទីក្នុងមួយមេរៀន។",
       h1="Leverage ពង្រីកទាំងចំណេញ និងខាត", h2="រៀនពីហានិភ័យជាមុនសិន", d="មេរៀនឥតគិតថ្លៃអំពី Leverage និង Margin។")),
 ("static-3-minutes", "statics/*/academy-static-3-minutes-{feed,story}-*.jpg", "Sign up",
  dict(p1="Learn forex the way you watch videos: short vertical lessons of about 3 minutes, a quick quiz, then the next one unlocks.",
       p2="OnFin Academy: 12 free forex lessons for beginners, made for your phone.",
       h1="Learn forex in 3-minute lessons", h2="Free, short and made for your phone", d="Sign up free to start lesson 1."),
  dict(p1="រៀន Forex ដូចមើលវីដេអូ៖ មេរៀនបញ្ឈរខ្លីៗ ប្រហែល 3 នាទី សំណួរខ្លី រួចមេរៀនបន្ទាប់ត្រូវបានដោះសោ។",
       p2="OnFin Academy៖ មេរៀន Forex ឥតគិតថ្លៃ 12 សម្រាប់អ្នកចាប់ផ្តើម បង្កើតសម្រាប់ទូរសព្ទរបស់អ្នក។",
       h1="រៀន Forex តាមមេរៀន 3 នាទី", h2="ឥតគិតថ្លៃ ខ្លី និងសម្រាប់ទូរសព្ទ", d="ចុះឈ្មោះឥតគិតថ្លៃ ដើម្បីចាប់ផ្តើមមេរៀនទី 1។")),
 ("static-free-12", "statics/*/academy-static-free-12-{feed,story}-*.jpg", "Sign up",
  dict(p1="Free. 12 lessons. Quizzes included. OnFin Academy takes you from currency pairs to your first demo trade, one short lesson at a time.",
       p2="No cost and no experience needed. Create a free account and start lesson 1 today.",
       h1="12 free forex lessons", h2="Quizzes included", d="Free account at academy.onfin.io"),
  dict(p1="ឥតគិតថ្លៃ។ មេរៀន 12។ មានសំណួរតេស្ត។ OnFin Academy នាំអ្នកពីគូរូបិយប័ណ្ណ ដល់ការជួញដូរលើគណនីសាកល្បងលើកដំបូង ម្តងមួយមេរៀនខ្លី។",
       p2="មិនគិតថ្លៃ ហើយមិនត្រូវការបទពិសោធន៍។ បង្កើតគណនីឥតគិតថ្លៃ ហើយចាប់ផ្តើមមេរៀនទី 1 ថ្ងៃនេះ។",
       h1="មេរៀន Forex ឥតគិតថ្លៃ 12", h2="មានសំណួរតេស្ត", d="គណនីឥតគិតថ្លៃនៅ academy.onfin.io")),
 ("static-demo-trade", "statics/*/academy-static-demo-trade-{feed,story}-*.jpg", "Sign up",
  dict(p1="From zero to your first demo trade. Learn the basics in 12 short lessons, then practise on a free demo account, with no real money at risk.",
       p2="Plan a trade, size it, place it on demo and review it. Lesson 12 walks through every step.",
       h1="From zero to your first demo trade", h2="Practise first, on a free demo", d="Free lessons. Free demo account."),
  dict(p1="ពីសូន្យ ដល់ការជួញដូរលើគណនីសាកល្បងលើកដំបូង។ រៀនមូលដ្ឋានតាមមេរៀនខ្លីៗ 12 បន្ទាប់មកហាត់លើគណនីសាកល្បងឥតគិតថ្លៃ ដោយមិនប្រថុយប្រាក់ពិត។",
       p2="រៀបផែនការជួញដូរ កំណត់ទំហំ ដាក់លើគណនីសាកល្បង ហើយពិនិត្យឡើងវិញ។ មេរៀនទី 12 បង្ហាញគ្រប់ជំហាន។",
       h1="ពីសូន្យ ដល់ការជួញដូរសាកល្បងដំបូង", h2="ហាត់មុន លើគណនីសាកល្បង", d="មេរៀនឥតគិតថ្លៃ។ គណនីសាកល្បងឥតគិតថ្លៃ។")),
]

HEAD = """# OnFin Academy: Meta ad copy deck (EN + KM)

Draft for the Cambodia launch. Nothing has been created in Meta Ads; the budget comes later.

The Khmer copy is our own translation. A native Khmer speaker must review it before anything runs, and compliance must approve both languages.

## Before any ad runs

1. **The site must be live.** academy.onfin.io isn't deployed yet. Never send paid traffic to the dev site.
2. **Tracking must be in place.**
   - The Meta pixel on academy.onfin.io, with a sign-up conversion event (CompleteRegistration, fired after the email code is confirmed) and a cookie banner. This is the open "Tracking" question in the OnFin Academy development session.
   - Confirm the academy itself writes the `onfin_attr` cookie (utm_*, fbclid) for visitors who land on academy.onfin.io directly. The current code expects onfin.io to write it.
3. **Meta's financial-services rules: check them for Cambodia.**
   - Forex and CFD education that leads to a broker's demo account will likely be reviewed as financial services. Check the current Meta Advertising Standards on financial and investment products, including whether Meta requires advertiser verification or prior authorisation for Cambodia.
   - Check local rules from the Securities and Exchange Regulator of Cambodia (SERC) with compliance.
   - Target 18+ only.
4. **Compliance.** The lessons are still drafts waiting on compliance review, and every primary text below ends with the risk line.

## Rules used in this deck

- **Footers.** Every EN primary text ends with a blank line and: `{risk_en}`
- Every KM primary text ends with a blank line and:
  - `{lang_km}` (Lessons are in English for now.) Drop it once Khmer lessons exist.
  - `{risk_km}`
- **Copy style.** Sentence case, no profit promises, "about 3 minutes" (never "four minutes"). Lesson terms (Pip, Lot, Spread, Leverage, Margin, Stop loss) stay in English inside Khmer, as the brand library asks.
- **Headlines.** 40 characters or fewer. The script that builds this file checks it: `_source/ads_copy.py`.
- **CTA button.** Meta shows the button in the viewer's language.

## Suggested structure for later

- **Campaign:** OnFin Academy launch, Cambodia.
- **Objective.** Leads or Sales with a website conversion on the sign-up event, once the pixel and event are live. Before that, a small Traffic test optimised for landing page views can check the creative, but it can't show sign-ups.
- **Ad sets:**
  1. **Cambodia broad, 18+, English creatives.** Advantage+ placements (Reels, Stories, Feed).
  2. **Cambodia broad, 18+, Khmer creatives.** Same placements, so we can compare EN and KM in the same market.
  3. **Warm audience (later).** People who engaged with OnFin Cambodia on Facebook, @onfinkm, @onfinacademy or the Telegram channel in the last 60 days, plus people who watched 50% of an Academy reel. Use the carousel and the demo-trade static here.
  - Keep interests broad. If you want a manual test, try forex, trading, investing and personal finance.
- **Creatives per ad set:**
  - The trailer.
  - 3 to 4 reels.
  - The carousel (Feed only).
  - 2 to 3 statics (each in feed 4:5 and story 9:16).
  - Two primary texts each, using Meta's text variations or dynamic creative.
- **UTM:** `?utm_source=meta&utm_medium=paid_social&utm_campaign=academy_launch_kh&utm_content=<id>&utm_term=<en|km>`, with `<id>` from this deck (e.g. `static-pip`).
- **A/B test angles:**
  1. Curiosity question ("What is a pip?", "What is a stop-out?") against format ("3-minute lessons").
  2. Risk-first ("Leverage cuts both ways") against outcome ("From zero to your first demo trade").
  3. English against Khmer copy, with the same creative.
  4. Trailer against a single-topic reel.
  5. "Sign up" against "Learn more" on the same ad.
- **Budget:** to be set by the user.

"""


def check(s, where):
    assert "–" not in s and "—" not in s, ("dash", where, s)
    assert "!" not in s, ("exclamation", where, s)
    assert not re.search(r"four minutes", s, re.I), where


def main():
    out = [HEAD.format(risk_en=RISK_EN, risk_km=RISK_KM, lang_km=LANG_KM)]
    for aid, files, cta, en, km in ADS:
        for k, v in list(en.items()) + list(km.items()):
            check(v, aid + ":" + k)
        for L, d in (("EN", en), ("KM", km)):
            for h in ("h1", "h2"):
                assert len(d[h]) <= 40, (aid, L, h, len(d[h]), d[h])
        out.append("## `%s`\n\nCreative: `%s`  \nCTA button: %s\n" % (aid, files, cta))
        for L, d in (("EN", en), ("KM", km)):
            out.append("**%s**\n" % L)
            out.append("- Primary text 1: %s" % d["p1"])
            out.append("- Primary text 2: %s" % d["p2"])
            out.append("- Headline 1 (%d): %s" % (len(d["h1"]), d["h1"]))
            out.append("- Headline 2 (%d): %s" % (len(d["h2"]), d["h2"]))
            out.append("- Description: %s\n" % d["d"])
    sys.stdout.write("\n".join(out) + "\n")


if __name__ == "__main__":
    main()
