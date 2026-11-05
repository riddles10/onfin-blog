# OnFin Academy: Meta ad copy deck (EN + KM)

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

- **Footers.** Every EN primary text ends with a blank line and: `High risk: most retail CFD accounts lose money. Education, not investment advice.`
- Every KM primary text ends with a blank line and:
  - `មេរៀនជាភាសាអង់គ្លេសសម្រាប់ពេលនេះ។` (Lessons are in English for now.) Drop it once Khmer lessons exist.
  - `ហានិភ័យខ្ពស់៖ គណនី CFD របស់វិនិយោគិនរាយភាគច្រើនខាតប្រាក់។ ជាការអប់រំ មិនមែនជាដំបូន្មានវិនិយោគទេ។`
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


## `trailer`

Creative: `reels/ (30-second trailer, 9:16 and 16:9)`  
CTA button: Sign up

**EN**

- Primary text 1: OnFin Academy is a free forex course made for your phone. 12 short video lessons, a quiz after each one, and your progress saved as you go. Start with currency pairs, finish with a full trade on demo.
- Primary text 2: New to forex? Start here. Free lessons of about 3 minutes, from pips and lots to leverage and risk.
- Headline 1 (39): Learn forex, one short lesson at a time
- Headline 2 (31): Free forex course for beginners
- Description: Sign up free at academy.onfin.io

**KM**

- Primary text 1: OnFin Academy គឺជាវគ្គសិក្សា Forex ឥតគិតថ្លៃ ដែលបង្កើតឡើងសម្រាប់ទូរសព្ទរបស់អ្នក។ មេរៀនវីដេអូខ្លីៗ 12 មានសំណួរបន្ទាប់ពីមេរៀននីមួយៗ ហើយវឌ្ឍនភាពរបស់អ្នកត្រូវបានរក្សាទុក។ ចាប់ផ្តើមពីគូរូបិយប័ណ្ណ បញ្ចប់ដោយការជួញដូរពេញលេញលើគណនីសាកល្បង។
- Primary text 2: ទើបតែចាប់ផ្តើម Forex? ចាប់ផ្តើមនៅទីនេះ។ មេរៀនឥតគិតថ្លៃ ប្រហែល 3 នាទី ចាប់ពី Pip និង Lot ដល់ Leverage និងហានិភ័យ។
- Headline 1 (27): រៀន Forex ម្តងមួយមេរៀនខ្លីៗ
- Headline 2 (20): វគ្គ Forex ឥតគិតថ្លៃ
- Description: ចុះឈ្មោះឥតគិតថ្លៃនៅ academy.onfin.io

## `reel-pips`

Creative: `reels/ (pips, lesson 4 chapter 1)`  
CTA button: Sign up

**EN**

- Primary text 1: Traders don't say the price rose by 0.0001. They say one pip. Lesson 4 of OnFin Academy explains it in about a minute. 12 free video lessons, made for your phone.
- Primary text 2: What is a pip, and why does every trader count them? Learn it in a short video lesson, then check yourself with a quick quiz. Free at academy.onfin.io.
- Headline 1 (14): What is a pip?
- Headline 2 (35): Free forex lessons, about 3 minutes
- Description: 12 free lessons. Sign up to start.

**KM**

- Primary text 1: អ្នកជួញដូរមិននិយាយថា តម្លៃឡើង 0.0001 ទេ។ ពួកគេនិយាយថា មួយ Pip។ មេរៀនទី 4 នៃ OnFin Academy ពន្យល់រឿងនេះក្នុងរយៈពេលប្រហែលមួយនាទី។ មេរៀនវីដេអូឥតគិតថ្លៃ 12 សម្រាប់ទូរសព្ទរបស់អ្នក។
- Primary text 2: Pip គឺជាអ្វី ហើយហេតុអ្វីអ្នកជួញដូរគ្រប់រូបរាប់វា? រៀនតាមវីដេអូខ្លី បន្ទាប់មកសាកល្បងខ្លួនឯងជាមួយសំណួរខ្លីៗ។ ឥតគិតថ្លៃនៅ academy.onfin.io។
- Headline 1 (13): Pip គឺជាអ្វី?
- Headline 2 (35): មេរៀន Forex ឥតគិតថ្លៃ ប្រហែល 3 នាទី
- Description: មេរៀនឥតគិតថ្លៃ 12។ ចុះឈ្មោះដើម្បីចាប់ផ្តើម។

## `reel-spread`

Creative: `reels/ (bid, ask and the spread, lesson 3 chapter 2)`  
CTA button: Learn more

**EN**

- Primary text 1: Every trade starts slightly behind. The gap between the buy and sell price is the spread, and it's a cost you pay on every trade. Lesson 3 shows how it works.
- Primary text 2: Why does your platform show two prices? A short, free lesson on bid, ask and the spread, with a quiz at the end.
- Headline 1 (33): The spread is a cost. Here's why.
- Headline 2 (35): Bid, ask and the spread, in minutes
- Description: Free video lessons for beginners.

**KM**

- Primary text 1: ការជួញដូរនីមួយៗចាប់ផ្តើមដោយខាតបន្តិច។ គម្លាតរវាងតម្លៃទិញ និងតម្លៃលក់ ហៅថា Spread ហើយវាជាថ្លៃដែលអ្នកបង់លើការជួញដូរនីមួយៗ។ មេរៀនទី 3 បង្ហាញពីរបៀបដែលវាដំណើរការ។
- Primary text 2: ហេតុអ្វីកម្មវិធីជួញដូរបង្ហាញតម្លៃពីរ? មេរៀនខ្លីឥតគិតថ្លៃអំពី Bid, Ask និង Spread មានសំណួរនៅចុងបញ្ចប់។
- Headline 1 (28): Spread ជាថ្លៃ។ នេះជាមូលហេតុ។
- Headline 2 (37): Bid, Ask និង Spread ក្នុងប៉ុន្មាននាទី
- Description: មេរៀនវីដេអូឥតគិតថ្លៃសម្រាប់អ្នកចាប់ផ្តើម។

## `reel-leverage`

Creative: `reels/ (leverage, lesson 7 chapter 2)`  
CTA button: Learn more

**EN**

- Primary text 1: Leverage lets you control a bigger position with less money. It also makes losses bigger, by the same amount. Lesson 7 walks through a worked example in numbers.
- Primary text 2: Before you use leverage, see what a 1% move can do to an account. Short, free lesson. No experience needed.
- Headline 1 (23): Leverage cuts both ways
- Headline 2 (25): See what a 1% move can do
- Description: Free lesson on leverage and risk.

**KM**

- Primary text 1: Leverage អនុញ្ញាតឱ្យអ្នកគ្រប់គ្រង Position ធំជាងមុន ដោយប្រើប្រាក់តិច។ វាក៏ធ្វើឱ្យការខាតធំជាងមុនក្នុងកម្រិតដូចគ្នាដែរ។ មេរៀនទី 7 បង្ហាញឧទាហរណ៍ជាលេខ។
- Primary text 2: មុនពេលប្រើ Leverage មើលថាចលនាតម្លៃ 1% អាចធ្វើអ្វីខ្លះចំពោះគណនី។ មេរៀនខ្លី ឥតគិតថ្លៃ។ មិនត្រូវការបទពិសោធន៍។
- Headline 1 (31): Leverage ពង្រីកទាំងចំណេញ និងខាត
- Headline 2 (27): មើលថាចលនា 1% អាចធ្វើអ្វីបាន
- Description: មេរៀនឥតគិតថ្លៃអំពី Leverage និងហានិភ័យ។

## `reel-stop-out`

Creative: `reels/ (margin call and stop-out, lesson 9 chapter 2)`  
CTA button: Learn more

**EN**

- Primary text 1: A margin call is a warning. A stop-out is when the broker starts closing your positions for you, biggest loser first. Lesson 9 explains both, so neither one surprises you.
- Primary text 2: What happens when free margin runs out? A short, free lesson on margin level, margin calls and stop-out.
- Headline 1 (19): What is a stop-out?
- Headline 2 (34): Margin calls, explained in minutes
- Description: Free lessons on margin and risk.

**KM**

- Primary text 1: Margin call គឺជាការព្រមាន។ Stop-out គឺពេលឈ្មួញកណ្តាលចាប់ផ្តើមបិទ Position របស់អ្នកជំនួសអ្នក ដោយចាប់ពីមួយដែលខាតច្រើនជាងគេ។ មេរៀនទី 9 ពន្យល់ទាំងពីរ ដើម្បីកុំឱ្យអ្នកភ្ញាក់ផ្អើល។
- Primary text 2: អ្វីកើតឡើងនៅពេល Free margin អស់? មេរៀនខ្លីឥតគិតថ្លៃអំពី Margin level, Margin call និង Stop-out។
- Headline 1 (18): Stop-out គឺជាអ្វី?
- Headline 2 (35): Margin call ពន្យល់ក្នុងប៉ុន្មាននាទី
- Description: មេរៀនឥតគិតថ្លៃអំពី Margin និងហានិភ័យ។

## `reel-sessions`

Creative: `reels/ (trading sessions, lesson 10 chapter 3)`  
CTA button: Learn more

**EN**

- Primary text 1: Forex runs 24 hours a day, 5 days a week, but not every hour is the same. When London and New York overlap, the market is at its busiest. Lesson 10 shows when, and what it costs.
- Primary text 2: Which hours move the most, and when do spreads widen? Learn the four sessions in a short, free lesson.
- Headline 1 (22): When is forex busiest?
- Headline 2 (32): The four sessions, in one lesson
- Description: Free forex lessons for beginners.

**KM**

- Primary text 1: ទីផ្សារ Forex បើក 24 ម៉ោងក្នុងមួយថ្ងៃ 5 ថ្ងៃក្នុងមួយសប្តាហ៍ ប៉ុន្តែមិនមែនគ្រប់ម៉ោងដូចគ្នាទេ។ ពេល London និង New York ជាន់គ្នា ទីផ្សាររវល់បំផុត។ មេរៀនទី 10 បង្ហាញថាពេលណា និងថ្លៃប៉ុន្មាន។
- Primary text 2: ម៉ោងណាដែលតម្លៃផ្លាស់ទីច្រើនបំផុត ហើយពេលណា Spread រីកធំ? រៀនពី Session ទាំងបួន ក្នុងមេរៀនខ្លីឥតគិតថ្លៃ។
- Headline 1 (22): ពេលណា Forex រវល់បំផុត?
- Headline 2 (31): Session ទាំងបួន ក្នុងមេរៀនតែមួយ
- Description: មេរៀន Forex ឥតគិតថ្លៃសម្រាប់អ្នកចាប់ផ្តើម។

## `reel-stop-loss`

Creative: `reels/ (stop loss and take profit, lesson 11 chapter 3)`  
CTA button: Sign up

**EN**

- Primary text 1: A stop loss closes a trade at a level you choose, so you decide the most you're prepared to lose before you enter. Lesson 11 shows how to set it, and where it has limits.
- Primary text 2: Stop loss and take profit, set before you trade. A short, free lesson with a worked example on a demo account.
- Headline 1 (30): Set your exit before you enter
- Headline 2 (36): Stop loss and take profit, explained
- Description: Free lessons. Practise on demo.

**KM**

- Primary text 1: Stop loss បិទការជួញដូរនៅកម្រិតដែលអ្នកជ្រើសរើស ដូច្នេះអ្នកសម្រេចចិត្តថាអាចខាតបានច្រើនបំផុតប៉ុន្មាន មុនពេលចូល។ មេរៀនទី 11 បង្ហាញរបៀបកំណត់វា និងដែនកំណត់របស់វា។
- Primary text 2: Stop loss និង Take profit កំណត់មុនពេលជួញដូរ។ មេរៀនខ្លីឥតគិតថ្លៃ ជាមួយឧទាហរណ៍លើគណនីសាកល្បង។
- Headline 1 (23): កំណត់ចំណុចចេញ មុនពេលចូល
- Headline 2 (38): Stop loss និង Take profit ពន្យល់ច្បាស់
- Description: មេរៀនឥតគិតថ្លៃ។ ហាត់លើគណនីសាកល្បង។

## `carousel`

Creative: `carousel/en/academy-en-01..07.jpg, carousel/km/academy-km-01..07.jpg`  
CTA button: Learn more

**EN**

- Primary text 1: Here's everything in OnFin Academy's free forex basics course, lesson by lesson. Swipe through, then pick where you'd start.
- Primary text 2: 12 lessons. About 3 minutes each. A quiz after every one. From currency pairs to your first demo trade, free.
- Headline 1 (21): 12 free forex lessons
- Headline 2 (34): From zero to your first demo trade
- Description: Watch, quiz, unlock the next one.

**KM**

- Primary text 1: នេះជាមេរៀនទាំងអស់ក្នុងវគ្គ Forex មូលដ្ឋានឥតគិតថ្លៃរបស់ OnFin Academy ម្តងមួយមេរៀន។ អូសមើល រួចជ្រើសរើសមេរៀនដែលអ្នកចង់ចាប់ផ្តើម។
- Primary text 2: មេរៀន 12។ ប្រហែល 3 នាទីក្នុងមួយមេរៀន។ មានសំណួរបន្ទាប់ពីមេរៀននីមួយៗ។ ចាប់ពីគូរូបិយប័ណ្ណ ដល់ការជួញដូរលើគណនីសាកល្បងលើកដំបូង ឥតគិតថ្លៃ។
- Headline 1 (24): មេរៀន Forex ឥតគិតថ្លៃ 12
- Headline 2 (32): ពីសូន្យ ដល់ការជួញដូរសាកល្បងដំបូង
- Description: មើល ឆ្លើយ ដោះសោមេរៀនបន្ទាប់។

## `static-pip`

Creative: `statics/*/academy-static-pip-{feed,story}-*.jpg`  
CTA button: Sign up

**EN**

- Primary text 1: What is a pip? It's how traders count price moves, and it's lesson 4 of 12 in OnFin Academy's free forex course.
- Primary text 2: Learn the basics of forex in short video lessons, with a quiz after each one. Free account, no experience needed.
- Headline 1 (14): What is a pip?
- Headline 2 (31): Free forex course for beginners
- Description: 12 lessons, about 3 minutes each.

**KM**

- Primary text 1: Pip គឺជាអ្វី? វាជារបៀបដែលអ្នកជួញដូររាប់ចលនាតម្លៃ ហើយវាជាមេរៀនទី 4 ក្នុងចំណោម 12 នៃវគ្គ Forex ឥតគិតថ្លៃរបស់ OnFin Academy។
- Primary text 2: រៀនមូលដ្ឋាន Forex តាមមេរៀនវីដេអូខ្លីៗ មានសំណួរបន្ទាប់ពីមេរៀននីមួយៗ។ គណនីឥតគិតថ្លៃ មិនត្រូវការបទពិសោធន៍។
- Headline 1 (13): Pip គឺជាអ្វី?
- Headline 2 (20): វគ្គ Forex ឥតគិតថ្លៃ
- Description: មេរៀន 12 ប្រហែល 3 នាទីក្នុងមួយមេរៀន។

## `static-two-prices`

Creative: `statics/*/academy-static-two-prices-{feed,story}-*.jpg`  
CTA button: Learn more

**EN**

- Primary text 1: Every quote has two prices: you buy at the ask and sell at the bid. The gap is the spread, a cost on every trade. Learn it free in lesson 3.
- Primary text 2: Short, free forex lessons for beginners, made for your phone.
- Headline 1 (25): Why are there two prices?
- Headline 2 (29): Bid, ask and the spread, free
- Description: Free lesson. Quiz included.

**KM**

- Primary text 1: តម្លៃនីមួយៗមានពីរ៖ អ្នកទិញនៅតម្លៃ Ask ហើយលក់នៅតម្លៃ Bid។ គម្លាតនោះគឺ Spread ជាថ្លៃលើការជួញដូរនីមួយៗ។ រៀនវាដោយឥតគិតថ្លៃក្នុងមេរៀនទី 3។
- Primary text 2: មេរៀន Forex ខ្លីៗឥតគិតថ្លៃសម្រាប់អ្នកចាប់ផ្តើម សម្រាប់ទូរសព្ទរបស់អ្នក។
- Headline 1 (20): ហេតុអ្វីមានតម្លៃពីរ?
- Headline 2 (29): Bid, Ask និង Spread ឥតគិតថ្លៃ
- Description: មេរៀនឥតគិតថ្លៃ។ មានសំណួរ។

## `static-leverage`

Creative: `statics/*/academy-static-leverage-{feed,story}-*.jpg`  
CTA button: Learn more

**EN**

- Primary text 1: Leverage makes positions bigger, and losses bigger too. Lesson 7 shows what a 1% move can do to an account, in plain numbers.
- Primary text 2: Understand leverage and margin before you trade. Free video lessons, about 3 minutes each.
- Headline 1 (23): Leverage cuts both ways
- Headline 2 (27): Learn the risks first, free
- Description: Free lessons on leverage and margin.

**KM**

- Primary text 1: Leverage ធ្វើឱ្យ Position ធំជាងមុន ហើយការខាតក៏ធំជាងមុនដែរ។ មេរៀនទី 7 បង្ហាញថាចលនាតម្លៃ 1% អាចធ្វើអ្វីខ្លះចំពោះគណនី ជាលេខងាយយល់។
- Primary text 2: យល់ពី Leverage និង Margin មុនពេលជួញដូរ។ មេរៀនវីដេអូឥតគិតថ្លៃ ប្រហែល 3 នាទីក្នុងមួយមេរៀន។
- Headline 1 (31): Leverage ពង្រីកទាំងចំណេញ និងខាត
- Headline 2 (20): រៀនពីហានិភ័យជាមុនសិន
- Description: មេរៀនឥតគិតថ្លៃអំពី Leverage និង Margin។

## `static-3-minutes`

Creative: `statics/*/academy-static-3-minutes-{feed,story}-*.jpg`  
CTA button: Sign up

**EN**

- Primary text 1: Learn forex the way you watch videos: short vertical lessons of about 3 minutes, a quick quiz, then the next one unlocks.
- Primary text 2: OnFin Academy: 12 free forex lessons for beginners, made for your phone.
- Headline 1 (31): Learn forex in 3-minute lessons
- Headline 2 (35): Free, short and made for your phone
- Description: Sign up free to start lesson 1.

**KM**

- Primary text 1: រៀន Forex ដូចមើលវីដេអូ៖ មេរៀនបញ្ឈរខ្លីៗ ប្រហែល 3 នាទី សំណួរខ្លី រួចមេរៀនបន្ទាប់ត្រូវបានដោះសោ។
- Primary text 2: OnFin Academy៖ មេរៀន Forex ឥតគិតថ្លៃ 12 សម្រាប់អ្នកចាប់ផ្តើម បង្កើតសម្រាប់ទូរសព្ទរបស់អ្នក។
- Headline 1 (25): រៀន Forex តាមមេរៀន 3 នាទី
- Headline 2 (32): ឥតគិតថ្លៃ ខ្លី និងសម្រាប់ទូរសព្ទ
- Description: ចុះឈ្មោះឥតគិតថ្លៃ ដើម្បីចាប់ផ្តើមមេរៀនទី 1។

## `static-free-12`

Creative: `statics/*/academy-static-free-12-{feed,story}-*.jpg`  
CTA button: Sign up

**EN**

- Primary text 1: Free. 12 lessons. Quizzes included. OnFin Academy takes you from currency pairs to your first demo trade, one short lesson at a time.
- Primary text 2: No cost and no experience needed. Create a free account and start lesson 1 today.
- Headline 1 (21): 12 free forex lessons
- Headline 2 (16): Quizzes included
- Description: Free account at academy.onfin.io

**KM**

- Primary text 1: ឥតគិតថ្លៃ។ មេរៀន 12។ មានសំណួរតេស្ត។ OnFin Academy នាំអ្នកពីគូរូបិយប័ណ្ណ ដល់ការជួញដូរលើគណនីសាកល្បងលើកដំបូង ម្តងមួយមេរៀនខ្លី។
- Primary text 2: មិនគិតថ្លៃ ហើយមិនត្រូវការបទពិសោធន៍។ បង្កើតគណនីឥតគិតថ្លៃ ហើយចាប់ផ្តើមមេរៀនទី 1 ថ្ងៃនេះ។
- Headline 1 (24): មេរៀន Forex ឥតគិតថ្លៃ 12
- Headline 2 (13): មានសំណួរតេស្ត
- Description: គណនីឥតគិតថ្លៃនៅ academy.onfin.io

## `static-demo-trade`

Creative: `statics/*/academy-static-demo-trade-{feed,story}-*.jpg`  
CTA button: Sign up

**EN**

- Primary text 1: From zero to your first demo trade. Learn the basics in 12 short lessons, then practise on a free demo account, with no real money at risk.
- Primary text 2: Plan a trade, size it, place it on demo and review it. Lesson 12 walks through every step.
- Headline 1 (34): From zero to your first demo trade
- Headline 2 (30): Practise first, on a free demo
- Description: Free lessons. Free demo account.

**KM**

- Primary text 1: ពីសូន្យ ដល់ការជួញដូរលើគណនីសាកល្បងលើកដំបូង។ រៀនមូលដ្ឋានតាមមេរៀនខ្លីៗ 12 បន្ទាប់មកហាត់លើគណនីសាកល្បងឥតគិតថ្លៃ ដោយមិនប្រថុយប្រាក់ពិត។
- Primary text 2: រៀបផែនការជួញដូរ កំណត់ទំហំ ដាក់លើគណនីសាកល្បង ហើយពិនិត្យឡើងវិញ។ មេរៀនទី 12 បង្ហាញគ្រប់ជំហាន។
- Headline 1 (32): ពីសូន្យ ដល់ការជួញដូរសាកល្បងដំបូង
- Headline 2 (21): ហាត់មុន លើគណនីសាកល្បង
- Description: មេរៀនឥតគិតថ្លៃ។ គណនីសាកល្បងឥតគិតថ្លៃ។

