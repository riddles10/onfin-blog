from build import head, chip, lead, pts, rows, stats, table, note, match, quote

CAROUSELS = [
# ------------------------------------------------------------------ 30 Oct, light
{
 "id": "pairs", "theme": "light",
 "cover": "cover-best-forex-pairs-for-beginners.jpg",
 "tag": "Trading guides",
 "title": "Best Forex Pairs to Trade for Beginners",
 "lead": "Which pairs make learning cheaper, and which ones to leave alone for now.",
 "short": "Best forex pairs for beginners",
 "search": "Best Forex Pairs to Trade for Beginners",
 "cta": "Each pair's best trading session, how to size stops with ATR, and how to keep a simple trading journal.",
 "slides": [
  {"html": head(None, 'What makes a pair <span class="hl">beginner-friendly?</span>', 90)
     + lead("You open the market watch and see 30+ currency pairs. Three things separate the ones worth learning on:")
     + rows([("Tight, consistent spreads", "Small mistakes cost less"),
             ("Deep liquidity", "Orders fill at or near the price you see"),
             ("A predictable daily range", "Similar conditions to practise on, day after day")])},
  {"html": head("Pair 01", "EUR/USD") + chip("The gold standard")
     + pts(["The most traded pair in the world, about <b>24% of daily forex volume</b>.",
            "Clean reactions to Fed and ECB rate expectations, with textbook support and resistance.",
            "Careful at <b>8:30 AM ET</b>: US data can move it 20 to 40 pips in seconds."]),
   "after": stats([("Typical spread", "0.0 to 0.3 pips"), ("Daily range", "70 to 120 pips")])},
  {"html": head("Pair 02", "USD/JPY") + chip("The technical trader's pair")
     + pts(["The second most liquid pair, with spreads <b>often under 0.5 pips</b>.",
            "Trendlines and round numbers like <b>105 and 110</b> tend to hold.",
            "Know the risk: <b>Bank of Japan intervention</b> can spike it 100 to 200 pips."]),
   "after": stats([("Typical spread", "Under 0.5 pips"), ("Daily range", "About 100 pips")])},
  {"html": head(None, 'Ready for more? <span class="hl">Step up next</span>', 90)
     + table(["Pair", "Spread", "Daily range"],
             [["GBP/USD", "0.5 to 1.2 pips", "100 to 160 pips"],
              ["AUD/USD", "0.5 to 1.0 pips", "60 to 100 pips"],
              ["NZD/USD", "0.8 to 1.5 pips", "60 to 100 pips"]])
     + note("GBP/USD trends hard but whipsaws in the first 30 minutes of London. AUD/USD and NZD/USD follow commodity prices, so the drivers are easy to see.")},
  {"html": head("Leave these for later", "Pairs to avoid as a beginner", 96)
     + match([("Exotics: USD/TRY, USD/ZAR", "20 to 50 pip spreads", "Huge swings, thin liquidity"),
              ("USD/CAD", "Moves with oil", "Charts alone won't explain it"),
              ("EUR/GBP and other crosses", "Choppy", "Small range, wider spreads"),
              ("USD/CHF", "Slow, then sudden", "Safe-haven spikes")], 44)},
  {"html": head("Your first 90 days", "Add pairs slowly", 96)
     + rows([("Month 1: EUR/USD only, on demo", "Learn one pair's rhythm and spreads"),
             ("Month 2: add USD/JPY or AUD/USD", "A pair that behaves differently"),
             ("Month 3+: add GBP/USD", "Only once the first two are consistently profitable")])
     + note("Risk 0.5 to 1% of your account per trade. No exceptions.")},
 ],
},
# ------------------------------------------------------------------ 4 Nov, dark
{
 "id": "demo", "theme": "dark",
 "cover": "cover-forex-demo-account-why-and-how-to-use-before-going-live.jpg",
 "tag": "Trading guides",
 "title": "Forex Demo Account: Why and How to Use It", "title_size": 92,
 "lead": "Practise with virtual money the right way, and know when you're ready for real capital.",
 "short": "How to use a forex demo account",
 "search": "Forex Demo Account: Why and How to Use Before Going Live",
 "cta": "How to open a demo in five minutes, the five demo vs live gaps in detail, and the mistakes that hurt live results.",
 "slides": [
  {"html": head("The basics", "What a demo account is, and isn't")
     + pts(["<b>Real market prices, virtual money</b>, usually $10,000 to $100,000 to start.",
            "The same platform and order types you'll use live, with no real risk.",
            "But fills are idealised, costs are often waived, and <b>emotions barely register</b>."]),
   "after": stats([("Cost", "Free"), ("Expires after", "30 to 90 days idle")])},
  {"html": head("Set up", 'Make it match <span class="hl">your live account</span>')
     + rows([("Starting balance", "What you'll actually deposit, not $100,000"),
             ("Leverage", "The same leverage you'll use live"),
             ("Base currency", "Your bank account's currency")])
     + note("A realistic setup forces realistic position sizing.")},
  {"html": head("Before your first trade", "Set three goals")
     + rows([("Platform fluency", "Every order type and shortcut, no hesitation"),
             ("Strategy validation", "50 to 100 trades on one setup"),
             ("Session awareness", "Practise the hours you'll trade live")])
     + note("Log every trade: entry, exit, R-multiple and how you felt.")},
  {"html": head(None, 'Demo vs live: <span class="hl">what changes</span>', 90)
     + table(["", "Demo", "Live"],
             [["Fills", "Exact price, every time", "Slippage and partial fills"],
              ["Costs", "Often waived", "Spreads, commission, swaps"],
              ["News", "Smooth", "Gaps and wider spreads"],
              ["Emotions", "Barely register", "Real fear and greed"]], "sm")
     + note("A strategy that looks profitable on demo can lose pips on live execution alone.")},
  {"html": head("How long?", "Practise for at least")
     + '<div class="big"><span>3 months</span><small>Enough to see trending and ranging markets, an NFP release and a central bank decision.</small></div>'
     + match([("You're ready when", "3 months positive", "30+ trades a month, and you know your max drawdown by heart"),
              ("Not ready yet if", "Stay on demo", "You skip your journal, revenge-trade or change strategy weekly")], 56)},
  {"html": head("Going live", "Make the switch safely")
     + rows([("Start with micro lots or a cent account", None),
             ("Change nothing on day one", "Same strategy, session and risk per trade"),
             ("Expect month one to lag demo by 20 to 30%", None),
             ("Scale up after 2 profitable months in a row", "By no more than 25% at a time")])},
 ],
},
# ------------------------------------------------------------------ 11 Nov, light
{
 "id": "copy", "theme": "light",
 "cover": "cover-what-is-copy-trading-how-it-works-pros-cons.jpg",
 "tag": "Trading guides",
 "title": "What Is Copy Trading?",
 "lead": "How it works, the pros and the cons, and what mirroring another trader really means for your account.",
 "short": "Copy trading, explained",
 "search": "What Is Copy Trading? How It Works, Pros, and Cons",
 "cta": "PAMM vs MAM vs social trading, the platform features to look for, and the full fee breakdown.",
 "slides": [
  {"html": head("How it works", "The mirror, explained")
     + pts(["A provider opens a trade, and the platform <b>copies it into your account</b> automatically.",
            "Size scales to your equity: they buy 1 lot, you have half their equity, <b>you get 0.5 lots</b>.",
            "When they close the trade, your copy closes too."]),
   "after": stats([("Typical minimum", "$100 to $500"), ("Copy speed", "Milliseconds")])},
  {"html": head("The honest answer", "Is copy trading profitable?")
     + '<div class="big" style="font-size:130px"><span>60 to 80%</span><small>of copy trading followers lose money over 12 months, according to industry data.</small></div>'
     + pts(["Leaderboards only show the <b>survivors</b>. Blown accounts disappear.",
            "Top performers often got there with <b>concentrated, high-leverage bets</b>.",
            "The tool is neutral. The outcome depends on who you copy and how you size it."])},
  {"html": head(None, 'Five risks <span class="hl">beginners miss</span>', 90)
     + rows([("Strategy drift", "The provider quietly changes approach"),
             ("Drawdown mismatch", "Same percentage, very different pain"),
             ("Your fill isn't their fill", "Different spreads, costs and timing"),
             ("News spikes break the copy", "Milliseconds later can mean pips worse"),
             ("Nobody vets the provider", "Due diligence is on you")], 50)},
  {"html": head("Before you copy", "Screen the provider")
     + match([("Track record", "6 to 12+ months"),
              ("Max drawdown", "Under 20 to 30%"),
              ("Risk per trade", "Under 2%"),
              ("Lot sizing", "Consistent"),
              ("Own money in the account", "Yes")], 44)},
  {"html": head(None, 'Win rate <span class="hl">isn\'t everything</span>', 90)
     + table(["Provider", "Win rate", "Risk : reward", "10 trades"],
             [["A", "90%", "1 : 1", "+8R"], ["B", "40%", "3 : 1", "+6R"]])
     + note("Close results, but provider B has far more room for error. Look at average winner vs average loser, not just how often they win.")},
  {"html": head("Costs", "Fees that eat your returns")
     + rows([("Performance fees", "Typically 20 to 30% of profit. Check for a high-water mark"),
             ("Spread markups", "Some platforms widen spreads on copied trades"),
             ("Swaps", "Overnight holds cost interest"),
             ("Exit and withdrawal fees", "Read the platform's terms page")])},
 ],
},
# ------------------------------------------------------------------ 18 Nov, dark
{
 "id": "slippage", "theme": "dark",
 "cover": "cover-what-is-slippage-in-forex-and-how-to-avoid-it.jpg",
 "tag": "Trading guides",
 "title": "What Is Slippage in Forex and How to Avoid It", "title_size": 92,
 "lead": "Why your fill doesn't always match the price you clicked, and how to keep the gap small.",
 "short": "Slippage, explained",
 "search": "What Is Slippage in Forex and How to Avoid It",
 "cta": "The five causes in detail, what to look for in a broker's execution, and more real session examples.",
 "slides": [
  {"html": head("The definition", "What is slippage?")
     + lead("The gap between the price you request and the price you actually get.")
     + '<div class="ex"><div class="box"><div class="k">You click buy</div><div class="v">1.1050</div></div><div class="arrow">→</div><div class="box"><div class="k">You get filled</div><div class="v hl">1.1053</div></div></div>'
     + note("That's 3 pips, or about $30 on a standard lot. It's a market condition, not a broker error, and it happens on every execution model.", 56)},
  {"html": head(None, 'What <span class="hl">causes it</span>', 90)
     + rows([("Volatility", "News like NFP, CPI and rate decisions"),
             ("Thin liquidity", "Session handovers, Friday close, holidays"),
             ("Order size", "Bigger than the volume at the best price"),
             ("Latency", "The distance between you and the server")], 56)},
  {"html": head(None, 'It cuts <span class="hl">both ways</span>', 90)
     + table(["Fill", "Requested", "Filled", "1 lot"],
             [["Worse", "1.1050", "1.1053", "-$30"], ["Better", "1.1050", "1.1048", "+$20"]])
     + note("Traders remember the bad fills and forget the good ones. Over many trades, the two often balance out.")},
  {"html": head("Order types", "Which orders slip?")
     + match([("Market order", "Full exposure", "Always fills, at the next available price"),
              ("Limit order", "Never slips", "But may not fill at all"),
              ("Stop order", "Slips once hit", "Turns into a market order when triggered"),
              ("Stop-limit order", "Capped", "Protects price, may not fill")], 44)},
  {"html": head(None, 'Six ways to <span class="hl">reduce slippage</span>', 90)
     + rows(["Trade the London and New York overlap",
             "Stay out 30 min before and after big news",
             "Use limit orders when price matters",
             "Keep your position size modest",
             "Choose an STP or ECN broker",
             "Use a VPS close to the broker's server"], 50)},
  {"html": head("Real examples", "How much it can cost")
     + match([("EUR/USD at the London open", "Ignore it", "0.2 pips, about $2 per lot"),
              ("GBP/JPY on a Bank of Japan surprise", "Cut your size", "55 pips, about $420 per lot"),
              ("Gold during NFP", "Wait 15 min", "$3.50/oz, about $350 per 100 oz")], 44)
     + note("Plan for the session: adjust order type, size or timing.")},
 ],
},
# ------------------------------------------------------------------ 25 Nov, light
{
 "id": "stocks", "theme": "light",
 "cover": "cover-forex-vs-stocks-which-market-fits-your-goals.jpg",
 "tag": "Trading guides",
 "title": "Forex vs Stocks: Which Market Fits Your Goals?", "title_size": 92,
 "lead": "Leverage, hours, costs and volatility compared, so you can pick the market that suits you.",
 "short": "Forex vs stocks",
 "search": "Forex vs Stocks: Which Market Fits Your Trading Goals?",
 "cta": "Margin call mechanics, the learning curve in each market, and how some traders run both side by side.",
 "slides": [
  {"html": head(None, 'Forex vs stocks <span class="hl">at a glance</span>', 90)
     + table(["", "Forex", "Stocks"],
             [["Hours", "24 hours, 5 days", "Fixed sessions"],
              ["Leverage", "30:1 or more", "Usually 2:1"],
              ["Daily volume", "About $7.5 trillion", "Spread across stocks"],
              ["Main driver", "Macro data, rates", "Company news, earnings"]], "sm")},
  {"html": head("Leverage", "It cuts both ways")
     + lead("What $1,000 controls, and what a 1% move against you costs:")
     + stats([("Forex at 30:1", "$30,000"), ("Stocks at 2:1", "$2,000"),
              ("1% move, forex", "-30% of account"), ("1% move, stocks", "-2% of account")], True)
     + note("Forex brokers close positions automatically at the margin level. Stock margin calls usually give you days.")},
  {"html": head("Schedule", "Who has the time advantage?")
     + pts(["<b>Forex</b> runs from Sunday 17:00 to Friday 17:00 ET. The busiest window is the London and New York overlap.",
            "<b>Stocks</b> trade fixed sessions. The big moves come in the first and last 30 minutes.",
            "Have a 9-to-5? Forex is easier to fit around it."])},
  {"html": head(None, 'Costs on a <span class="hl">$10,000 trade</span>', 90)
     + table(["", "EUR/USD", "AAPL"],
             [["Spread, in and out", "About $0.80", "About $1.10"],
              ["Fees", "None", "About $0.05"],
              ["Held 30 days", "About $12 swap", "None, in a cash account"]], "sm")
     + note("Forex is slightly cheaper to get in and out. How long you hold changes the maths.")},
  {"html": head("Volatility", "How each market moves")
     + pts(["<b>Forex</b> follows macro rhythms. EUR/USD moves 50 to 120 pips a day, with prices running continuously all week.",
            "<b>Stocks</b> move on company news. One earnings miss can drop a stock 10% at the open.",
            "Stock news after the close creates <b>overnight gaps</b>; major forex pairs trade through the week."])},
  {"html": head("Decide", "Which fits your goal?")
     + match([("Active income, short holds", "Forex"),
              ("Passive growth, long holds", "Stocks"),
              ("Starting with under $1,000", "Forex"),
              ("$10,000+ and want diversification", "Stocks"),
              ("Part-time, a few hours a week", "Stocks")], 44)},
 ],
},
]
