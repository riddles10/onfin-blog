# OnFin clip library

96 YouTube videos for the meme-style news reels. Every link was checked against YouTube on 29 Oct 2026. Copyright risk: Low = official or public-domain footage, Medium = podcasts and documentaries (credit the creator, keep clips short), High = news agencies, TV networks and re-uploads (most likely to be claimed).

Total running time: about 95 hours. That's roughly 50 to 90 GB at 720p, too much to send through chat, so the lighter route below is better.

**Lighter route (recommended):**
1. Download only the captions (a few MB in total) and send me the files:
   `yt-dlp --skip-download --write-auto-subs --write-subs --sub-langs "en.*" --sub-format vtt -o "%(id)s" -a clip-urls.txt`
2. I read the transcripts, pick the moments and send back a ready-made command that downloads only those 20 to 60 second sections, e.g.
   `yt-dlp -f "bv*[height<=720]+ba/b[height<=720]" --download-sections "*1:24:10-1:26:10" -o "%(id)s-%(section_start)s.%(ext)s" URL`

**Full route:** download everything with the command below and send the files a few at a time. Keep the video ID in each file name so I can match it to this list. Suggested download (720p, file named by video ID): `yt-dlp -f "bv*[height<=720]+ba/b[height<=720]" -o "%(id)s.%(ext)s" -a clip-urls.txt`

## First batch (picked)

1. [S&P 500 futures flash crash w/ chilling commentary from the CME](https://www.youtube.com/watch?v=v6Pa6i-EKmk)  
   Mantiqo · 6 min · High risk. Live squawk as the 2010 flash crash hits: '60 even bid'.
2. [FOMC Press Conference, October 28, 2026](https://www.youtube.com/watch?v=hs8YWtNQQ40)  
   Federal Reserve · 34 min · Low risk. Warsh on the two dissents; Warsh disagreeing with Ackman on AI and rates. Moment: approx 16:30-21:00 and 22:00-26:00.
3. [Bill Ackman: Investing, Financial Battles, Harvard, DEI, X & Free Speech | Lex Fridman Podcast #413](https://www.youtube.com/watch?v=PgGKhsWhUu8&t=5050)  
   Lex Fridman · 213 min · Medium risk. Losing $4B on Valeant; Icahn squeeze and why he stopped shorting. Moment: 1:24:10-1:26:10 and 1:50:55-1:52:10.
4. [Mark Cuban: Shark Tank, DEI & Wokeism Debate, Elon Musk, Politics & Drugs | Lex Fridman Podcast #422](https://www.youtube.com/watch?v=0cn3VBjfN8g&t=2265)  
   Lex Fridman · 133 min · Medium risk. 'I feel real stupid sitting on my jet': not riding the dot-com bubble. Moment: 37:45-38:50.
5. [Ray Dalio: Principles, the Economic Machine, AI & the Arc of Life | Lex Fridman Podcast #54](https://www.youtube.com/watch?v=M95m2EFb7IQ&t=1290)  
   Lex Fridman · 90 min · Medium risk. Broke in 1982, borrowed $4,000 from his dad. Moment: 21:30-23:30.

## News and official

6. [FOMC Press Conference, October 29, 2025](https://www.youtube.com/watch?v=gZsAKn1UtH4)  
   Federal Reserve · 54.9 min · Low risk. Powell: a December cut is 'not a foregone conclusion, far from it' (near end of opening statement); rate-cut bets collapsed.
7. [Statement by Federal Reserve Chair Jerome H. Powell](https://www.youtube.com/watch?v=KckGHaBLSn4)  
   Federal Reserve · 1.9 min · Low risk. Powell's 2-minute video revealing DOJ grand-jury subpoenas over the Fed renovation testimony; calls the grounds 'pretexts' for pressure over rates.
8. [FOMC Press Conference, April 29, 2026](https://www.youtube.com/watch?v=UR2yFg--1jY)  
   Federal Reserve · 53.8 min · Low risk. Powell's last press conference as chair; congratulates Warsh, says he'll stay on the Board and 'will leave when I think is appropriate'.
9. [FOMC Press Conference, June 17, 2026](https://www.youtube.com/watch?v=fR7oZvlk_eY)  
   Federal Reserve · 42.6 min · Low risk. Warsh's debut as chair: shorter statement, no forward guidance, dot plot shifts to hikes; jokes projections use 'a pencil with a very large eraser'.
10. [FOMC Press Conference, June 17, 2026: Chairman Warsh quote #shorts](https://www.youtube.com/watch?v=bQDYOy5bbhg)  
   Federal Reserve · 0.6 min · Low risk. Fed's own pre-cut 37-second Warsh soundbite from his first press conference; ready-made reel length.
11. [FOMC Press Conference, September 16, 2026](https://www.youtube.com/watch?v=ELU3u2Ny7r0)  
   Federal Reserve · 28.7 min · Low risk. Warsh explains the Fed's first rate hike since 2023 (12-0 vote, to 3.75-4.00%).
12. [Jackson Hole Symposium Federal Reserve Chair Jerome Powell's remarks 2025](https://www.youtube.com/watch?v=Ae-ByiDOS10)  
   Federal Reserve Bank of Kansas City · 23.5 min · Low risk. Powell's last Jackson Hole as chair: 'shifting balance of risks may warrant adjusting our policy stance'; stocks jumped on the cut signal.
13. [2026 Jackson Hole Economic Policy Symposium, Remarks by Federal Reserve Chairman Kevin Warsh](https://www.youtube.com/watch?v=0UIKsanJb84)  
   Federal Reserve Bank of Kansas City · 32.4 min · Low risk. Warsh: 'call it a trail map... just don't call it forward guidance'; hawkish speech pushed up September hike odds.
14. [Fed Functions: Conducting Monetary Policy](https://www.youtube.com/watch?v=xHQJBNO0yQc)  
   Federal Reserve · 3.8 min · Low risk. Official explainer on how the FOMC sets the policy rate; good 'how rates actually get set' educational cut.
15. [Banking Committee Hearing on the Semiannual Monetary Policy Report to Congress - February 11, 2025](https://www.youtube.com/watch?v=v3LsaWT3HFA)  
   U.S. Senate Banking Committee GOP · 150.9 min · Low risk. Powell's first testimony of Trump's second term: 'we do not need to be in a hurry' to cut; questioned on tariffs and Fed independence.
16. [Banking Committee Hearing, "Nomination of Kevin Warsh to be Chair of the Federal Reserve"](https://www.youtube.com/watch?v=lp8iT04clIM)  
   U.S. Senate Banking Committee GOP · 169.7 min · Low risk. Warsh confirmation hearing: rejects being Trump's 'sock puppet', pledges independence, grilled on $100M+ undisclosed holdings.
17. [RM Warren Questions Kevin Warsh at Federal Reserve Chair Nominee Hearing](https://www.youtube.com/watch?v=JNLsJx-8Coo)  
   Senate Banking Housing and Urban Affairs Committee · 5.7 min · Low risk. Warren asks Warsh if Trump lost the 2020 election; he dodges and she says he lacks the courage to be independent. Ready-cut 6-minute exchange.
18. [Chairman Scott Leads Committee Hearing on "The Semiannual Monetary Policy Report to the Congress"](https://www.youtube.com/watch?v=OLGg0sUwgaY)  
   U.S. Senate Banking Committee GOP · 129.1 min · Low risk. Warsh's first Senate semiannual testimony as chair, questioned on oil-driven inflation and hike pressure versus Trump.
19. [Banking Committee Markup, Consideration of H.R.3633, the "Digital Asset Market Clarity Act of 2025"](https://www.youtube.com/watch?v=VyO6K2Yqvn8)  
   U.S. Senate Banking Committee GOP · 148.8 min · Low risk. Senate committee advances the crypto market-structure (CLARITY) bill 15-9 after 100+ amendments; Warren vs. Scott clashes.
20. [President Trump Participates in the Make America Wealthy Again Event](https://www.youtube.com/watch?v=yiTFPN6SZsU)  
   The White House · 62.9 min · Low risk. 'Liberation Day': Trump holds up the reciprocal-tariff board that triggered the April 2025 market crash.
21. [President Trump Visits the Federal Reserve](https://www.youtube.com/watch?v=fO9_N_2yY8M)  
   The White House · 13.1 min · Low risk. Hard-hat standoff: Trump claims a $3.1B renovation, Powell shakes his head and says he 'added in a third building'.
22. [President Trump Participates in a Swearing-In Ceremony for the Chairman of the Federal Reserve](https://www.youtube.com/watch?v=QVU9AJNANoU)  
   The White House · 32.4 min · Low risk. Warsh sworn in at the White House (first since Greenspan in 1987) and vows a 'reform-oriented' Fed; gold fell about 10% the day he was nominated.
23. [President Trump Participates in a Signing Ceremony for S.1582 GENIUS Act](https://www.youtube.com/watch?v=1izvMU1WfBU)  
   The White House · 39.5 min · Low risk. Trump signs the first US federal crypto law (stablecoins), with industry leaders on stage.
24. [President Trump Delivers Remarks at the White House Digital Assets Summit](https://www.youtube.com/watch?v=omP3GPxaVog)  
   The White House · 21.3 min · Low risk. Trump at the first White House crypto summit, the day after ordering a Strategic Bitcoin Reserve.
25. [Secretary of the Treasury Scott Bessent Briefs Members of the Media, May 28, 2026](https://www.youtube.com/watch?v=swQUiRO9aZM)  
   The White House · 31.8 min · Low risk. Treasury Secretary fills in as press secretary: calls the economy 'challenging' amid an oil/Hormuz inflation shock; dodges the $250 Trump-bill question.
26. [ECB Governing Council Press Conference - 17 April 2025](https://www.youtube.com/watch?v=5YWkRPdC79M)  
   European Central Bank · 50.5 min · Low risk. Lagarde cuts rates two weeks after Liberation Day, warns of 'exceptional uncertainty' from US tariffs.
27. [ECB Governing Council Press Conference - 11 June 2026](https://www.youtube.com/watch?v=yc_zOgQOfVw)  
   European Central Bank · 50.1 min · Low risk. ECB hikes for the first time since 2023 (deposit rate 2.25%), the first major central bank to tighten after the Iran-war energy shock.
28. [Monetary Policy Report Press Conference, 30 April 2026](https://www.youtube.com/watch?v=VXYrFSBxhHU)  
   Bank of England · 60.3 min · Low risk. Bailey calls the 6-3 hold an 'active hold'; says the Middle East energy shock is 'very uncertain'.
29. [What is inflation?](https://www.youtube.com/watch?v=abdq4p2HaJo)  
   Bank of England · 1.6 min · Low risk. Bank of England's own 90-second inflation explainer; easy educational reel.
30. [総裁定例記者会見（2026年9月18日）](https://www.youtube.com/watch?v=aiDtSnc8XiI)  
   BOJchannel【日本銀行動画チャンネル】 · 75.0 min · Low risk. Ueda explains the hike to 1.25%, a 31-year high, yet the yen weakened to 157 anyway. Japanese audio, needs translated captions.
31. [Treasury Secretary Scott Bessent's America 250 Address: Economic Statecraft, Tariffs, and the Dollar](https://www.youtube.com/watch?v=9Oz6IyDsSv8)  
   The Economic Club of New York · 57.1 min · High risk. Bessent lays out tariffs, dollar policy and avoiding 'any foreign choke point'.
32. [Bank Of Japan Raises Interest Rate To 31-Year High Of 1.25% | DWS News | AF1F](https://www.youtube.com/watch?v=L5ueoPcp2v4)  
   DWS News · 72.3 min · High risk. English feed of the same Ueda press conference (use if the official Japanese audio won't work).

## Podcasts and interviews

33. [Jim Simons (full length interview) - Numberphile](https://www.youtube.com/watch?v=QNznD9hMEh0)  
   Numberphile2 · 61 min · Low risk. Maths professor who became the most successful quant trader ever; humble, funny origin story of Renaissance (2015 interview).
34. [Stan Druckenmiller | Podcast | In Good Company | Norges Bank Investment Management](https://www.youtube.com/watch?v=-5Weeox0Xus)  
   Norges Bank Investment Management · 52 min · Medium risk. Druckenmiller on the Soros pound short, bet sizing and his regrets; legend-level credibility. Moment: 29:16 pound trade + sizing; 38:57 regrets (Podwise chapters for the YouTube upload).
35. [Legendary Trader Paul Tudor Jones on AI Risk, Bubbles and Buffett](https://www.youtube.com/watch?v=S31J5ACsOqU)  
   Invest Like The Best · 71 min · Medium risk. PTJ on why trading is like boxing, trading vs investing, lessons from mentor Eli Tullis and the 1987 crash. Moment: 15:24 trading v investing; 28:51 Eli Tullis; 30:39 trading is like boxing; 50:51 after the 1987 crash (podcast chapters; YouTube may be offset a few min).
36. [Ray Dalio: I Predicted The 2008 CRASH, I Know What Comes Next!](https://www.youtube.com/watch?v=Bu0xNDLNORU)  
   The Diary Of A CEO · 90 min · Medium risk. Dalio on calling 2008, why bubbles burst and why cash is trash; big-name macro hook.
37. [Ep. 355: Ed Seykota Interview with Michael Covel on Trend Following Radio](https://www.youtube.com/watch?v=9ZpPGKPhZmM)  
   Trend Following · 55 min · Medium risk. Market Wizard Ed Seykota on trend following and the psychology of losing; audio-only, use with captions over a still.
38. [How a 50-Year Veteran Thinks About Risk Management · Peter Brandt](https://www.youtube.com/watch?v=bIi6YzPt9bE)  
   Chat With Traders · 101 min · Medium risk. Brandt: enter every trade expecting it to be a loser; cut losses short; position sizing.
39. [Linda Raschke - She MASTERED Trading | Top 20 World Trader & Market Wizard](https://www.youtube.com/watch?v=RSAEh1qKjxo)  
   Words of Rizdom · 84 min · Medium risk. Market Wizard Linda Raschke on decades of discipline, losing streaks and what beginners get wrong.
40. [The Godfather Of Trading: My Final Warning To The Next Generation!](https://www.youtube.com/watch?v=Qp6S0Onz_iw)  
   Titans Of Tomorrow · 69 min · Medium risk. Larry Williams tells how he turned $10k into $1.1M in one year at the World Cup trading contest, and nearly gave it back. Moment: 25:54 World Cup story (from the channel's own clip link).
41. [Al Brooks: The Godfather of Price Action | Unparalleled Wisdom & Mastery | SPECULATORS PODCAST EP 38](https://www.youtube.com/watch?v=JQc3_CvwW-Q)  
   Korbs · 82 min · Medium risk. Ex-surgeon Al Brooks on why most day traders lose and what it really takes; blunt takes.
42. [The 3 Timeless Rules Shared by 100 Years of Market Wizards · Jack Schwager & George Coyle](https://www.youtube.com/watch?v=LT8DKDQTzuU)  
   Chat With Traders · 71 min · Medium risk. Market Wizards author Jack Schwager on the 3 rules every great trader shares; stories of famous traders.
43. [Wall Street Legend Jim Rogers: The Market Is a Cruel Teacher](https://www.youtube.com/watch?v=olRb2yJA3to)  
   Personable - Hosted by Harvey Bracken-Smith · 71 min · Medium risk. Soros's Quantum Fund co-founder on losing money, humility and why the market is a cruel teacher.
44. [Kenneth Griffin - CEO of Citadel | Podcast | In Good Company | Norges Bank Investment Management](https://www.youtube.com/watch?v=iQt9pgksZ3Y)  
   Norges Bank Investment Management · 42 min · Medium risk. Ken Griffin on building Citadel from right out of university and staying resilient in volatile markets.
45. [Michael Burry Speaks | Michael Lewis](https://www.youtube.com/watch?v=nsE13fvjz18)  
   Michael Lewis · 36 min · Medium risk. The Big Short's Michael Burry in his own voice on calling 2008 and being the market's Cassandra (skip the NVDA/PLTR short segment); not the movie.
46. [Charlie Munger (Audio)](https://www.youtube.com/watch?v=w6qRb171cog)  
   Acquired · 67 min · Medium risk. Munger's only long-form podcast: short-term trading is just gambling; 'big mistake' stories; savage one-liners. Audio-only. Moment: ~5:30-7:00 trading = gambling; ~10:30 'big mistake' (approx, from audio transcript).
47. [Trading $600M, 5+ Decades In The Markets, All With A Simple 3-Step System - Tom Basso](https://www.youtube.com/watch?v=w-xrZ0Cg7b0)  
   Titans Of Tomorrow · 91 min · Medium risk. 'Mr. Serenity' Tom Basso on staying calm through losses, position sizing and keeping it simple.
48. [I Lost £862 Million and Collapsed a Bank | Nick Leeson x Peter McCormack Show](https://www.youtube.com/watch?v=Wmieucgn_tc)  
   The Peter McCormack Show · 96 min · Medium risk. Rogue trader Nick Leeson on hiding losses, doubling down and breaking Barings Bank; ultimate risk-management cautionary tale.
49. [He Survived Every Stock Market Crash… Now He Trades $1 Billion/Day | Peter Tuchman](https://www.youtube.com/watch?v=uyAH-lc6IU8)  
   School of Hard Knocks Podcast · 68 min · Medium risk. The 'Einstein of Wall Street' (most-photographed NYSE trader, meme face) on surviving every crash since the 80s.
50. [Andy Krieger: Making $300 Million ONE Trade (George Soros Copied Him)](https://www.youtube.com/watch?v=UVXU7cL3XZs)  
   Words of Rizdom · 88 min · Medium risk. Forex legend Andy Krieger on his famous 1987 New Zealand dollar short; perfect FX story for the audience.
51. [Mark Cuban: The Brutal Truth About The Next Market Crash!](https://www.youtube.com/watch?v=6VTSAs4Rsck)  
   The Diary Of A CEO · 92 min · Medium risk. Cuban: the next market crash is where the real money is made; blunt billionaire takes (released 3 days ago).
52. [Michael Saylor: Bitcoin, Inflation, and the Future of Money | Lex Fridman Podcast #276](https://www.youtube.com/watch?v=mC43pZkpTec)  
   Lex Fridman · 237 min · Medium risk. Saylor on living with brutal volatility and conviction (crypto-focused; avoid price-target bits). Moment: 2:54:04 Volatility; 3:43:26 Advice for young people (lexfridman.com outline).
53. [Chamath Palihapitiya: Money, Success, Startups, Energy, Poker & Happiness | Lex Fridman Podcast #338](https://www.youtube.com/watch?v=kFQUDCgMjRc)  
   Lex Fridman · 177 min · Medium risk. All-In's Chamath on poker, making mistakes and money vs happiness. Moment: 28:29 Poker; 31:57 Mistakes; 21:39 Money and happiness (lexfridman.com outline).
54. [E19: Robinhood's GameStop decision: Why did it happen and how can it be prevented in the future?](https://www.youtube.com/watch?v=rWEPSKkkdKQ)  
   All-In Podcast · 86 min · Medium risk. The All-In besties react live to the GameStop squeeze and retail buying being halted; meme-stock moment (critical of the broker, not an endorsement).
55. [Kevin O'Leary: Every Time You Get Paid, Do This! It 10xs Your Income Without Having To Work Harder!](https://www.youtube.com/watch?v=mpAZehPviLQ)  
   The Diary Of A CEO · 113 min · Medium risk. Mr. Wonderful's blunt money rules; 'this habit is keeping you poor'.
56. [The Savings Expert: “Do Not Buy A House!” Do THIS Instead! - Morgan Housel](https://www.youtube.com/watch?v=vOvLFT4v4LQ)  
   The Diary Of A CEO · 117 min · Medium risk. Psychology of Money author on greed, luck, risk and why smart people go broke.
57. [Richard Craib: WallStreetBets, Numerai, and the Future of Stock Trading | Lex Fridman Podcast #159](https://www.youtube.com/watch?v=ziQSpuST6Es)  
   Lex Fridman · 110 min · Medium risk. WallStreetBets and the GameStop saga explained; 'is stock trading gambling or investing?'. Moment: 8:12 WSB & GameStop; 1:13:37 gambling or investing? (lexfridman.com outline).
58. [Graham Stephan Reveals His Worst Investments](https://www.youtube.com/watch?v=V8cJnXwmzvI)  
   Shane Seo · 68 min · Medium risk. Graham Stephan admits his worst investments and money mistakes.
59. [“I Lost $100 Million!” Jake Paul Breaks Silence on Getting Sued, Fighting Canelo, & Going Broke](https://www.youtube.com/watch?v=w4RZk71t9ps)  
   The Iced Coffee Hour · 116 min · Medium risk. Celebrity money: Jake Paul tells Graham Stephan he lost $100M; going broke vs going big.
60. [Ramen noodles to a lucrative Forex trading career – Blake Morrow, @PipCzar](https://www.youtube.com/watch?v=IZvgHwMgAcU)  
   Chat With Traders · 81 min · Medium risk. Broke-to-pro forex comeback story: from ramen noodles to a full-time FX career.
61. [Umar Ashraf: Making $18 Million Day Trading | WOR Podcast EP.70](https://www.youtube.com/watch?v=_aZZkI13m6M)  
   Words of Rizdom · 91 min · Medium risk. Day trader on early losses, discipline and scaling to $18M; relatable for young retail traders.
62. [Tom Hougaard: The Top 1% Traders Do This, And You Don’t](https://www.youtube.com/watch?v=Q7nKecU-7sE)  
   David Capablanca · 61 min · Medium risk. Index/FX day trader Tom Hougaard on why 'normal' thinking loses money and how pros treat losing trades.
63. [The Man Who Cracked Trading Psychology - Jared Tendler](https://www.youtube.com/watch?v=UY1Nx35JnEM)  
   Titans Of Tomorrow · 88 min · Medium risk. Mental-game coach on tilt, revenge trading and FOMO; very clippable psychology.
64. [Annie Duke | In Good Company | Podcast | Norges Bank Investment Management](https://www.youtube.com/watch?v=zgQmaScqFiY)  
   Norges Bank Investment Management · 40 min · Medium risk. Poker champion on decision-making, 'resulting' and knowing when to quit a losing position.
65. [Mark Cuban | This Past Weekend w/ Theo Von #533](https://www.youtube.com/watch?v=fiK6IWhDbWU)  
   Theo Von · 121 min · Medium risk. Celebrity crossover: Cuban and Theo Von on how big money changes people; funny and blunt.
66. [Dave Ramsey | This Past Weekend w/ Theo Von #498](https://www.youtube.com/watch?v=xYnUP1kJqD4)  
   Theo Von · 112 min · Medium risk. Dave Ramsey vs Theo Von on debt, broke habits and get-rich-quick thinking; comedy plus money.
67. [Joe Rogan Experience #2509 - Caleb Hammer](https://www.youtube.com/watch?v=wt2sI8OdmWs)  
   PowerfulJRE · 135 min · Medium risk. Financial Audit host tells Rogan why people stay broke; big-audience money takes.
68. [Mark Douglas - MIND OVER MARKET (Full length Interview)](https://www.youtube.com/watch?v=GhKJ9P3agRc)  
   Stelios Stylianou · 54 min · High risk. Trading in the Zone author on accepting risk and thinking in probabilities; classic psychology quotes. Re-upload, no official channel exists.

## Market history and viral moments

69. [The end of the minimum exchange rate (SNB news conference of 15 January 2015)](https://www.youtube.com/watch?v=9uVmwvCYEkE)  
   Schweizerische Nationalbank – Banque nationale suisse – Swiss National Bank · 3.9 min · Low risk. The SNB's own film of the news conference that scrapped the 1.20 EUR/CHF floor; the franc jumped about 30% in minutes and wiped out traders and brokers.
70. [SIMEX Stories from Within](https://www.youtube.com/watch?v=SzJt3CcjdEw)  
   SGX Group · 2.8 min · Low risk. SGX's own short film on Singapore's open-outcry futures floor (SIMEX, founded 1984), with ex-floor traders' memories.
71. [Waxman to Greenspan: Were You Wrong?](https://www.youtube.com/watch?v=txw4GvEFGWs)  
   Nancy Pelosi · 5.1 min · Low risk. Waxman presses 'Were you wrong?' and Greenspan admits he found a 'flaw' in his free-market ideology: blunt, uncomfortable, quotable.
72. [ECB Governing Council Press Conference - 12 March 2020](https://www.youtube.com/watch?v=ojOu7JP-1g0)  
   European Central Bank · 60.2 min · Low risk. Lagarde: 'We are not here to close spreads.' Italian bonds and stocks crash on one sentence (in the Q&A part).
73. [Game Stopped? Who Wins and Loses When Short Sellers, Social Media, and Retail... (EventID=111207)](https://www.youtube.com/watch?v=RfEuNHVPc_k)  
   U.S. House Committee on Financial Services · 334.5 min · Low risk. Official full hearing: Roaring Kitty's 'I like the stock' plus Robinhood, Citadel, Melvin and Reddit CEOs grilled.
74. [Global Investment Conference - Mario Draghi, President of the European Central Bank](https://www.youtube.com/watch?v=hMBI50FXDps)  
   UK Trade & Investment (UKTI) · 11.3 min · Low risk. 'Whatever it takes to preserve the euro. And believe me, it will be enough.' Three words that ended the euro crisis.
75. [1987 Stock Market Crash (stock footage / archival footage)](https://www.youtube.com/watch?v=jlGVHOd2hdo)  
   FilmArchivesNYC · 8.9 min · Medium risk. Raw archive footage of the NYSE floor, tickers and crowds on Black Monday, when the Dow fell 22.6% in one day.
76. [The first modern financial crisis in the globalized world](https://www.youtube.com/watch?v=O2pD_y61jx4)  
   DW Documentary · 42.5 min · Medium risk. Full documentary on the 1997 Asian crisis (baht, ringgit, rupiah, won): Southeast Asia's own crash story, 2.1M views.
77. [Foreign Capital Flees Russian Depression (1998)](https://www.youtube.com/watch?v=ssSulVFVBw0)  
   Journeyman Pictures · 16.2 min · Medium risk. Moscow in 1998 as foreign money runs and the ruble collapses into default: the shock that sank LTCM.
78. [FLOORED The Complete Documentary Film](https://www.youtube.com/watch?v=--H8SY334Zw)  
   flooredmovie · 77.8 min · Medium risk. Full doc uploaded by the filmmakers: Chicago pit traders screaming, swearing and blowing up as screens replace them (1.2M views).
79. [Central Europeans crushed by Swiss franc loans](https://www.youtube.com/watch?v=X4S9UyXA4CY)  
   AP Archive · 4.2 min · High risk. Retail side of the SNB shock: Romanian borrowers with Swiss-franc mortgages see repayments explode overnight; currency risk in real life.
80. [Black Wednesday - Chancellor Norman Lamont's speech to press 16th Sept 1992 - UK withdraws from ERM](https://www.youtube.com/watch?v=EpyhIihfeXo)  
   Pleb Politics · 1.2 min · High risk. Lamont walks out at night to announce the UK is leaving the ERM: the moment Soros 'broke the Bank of England'. Moment: 00:00-01:12.
81. [George Soros Details How He Broke The Bank Of England | 1994](https://www.youtube.com/watch?v=LJlXwF7ap7I)  
   Investor Archive · 12.3 min · High risk. Soros explains the $1bn pound short, interviewed by his own trader Stan Druckenmiller (Adam Smith's Money World, PBS).
82. [HONG KONG: MALAYSIA ANNOUNCES PLANS TO LIMIT CURRENCY DEALING](https://www.youtube.com/watch?v=wJ5utyyDtDA)  
   AP Archive · 1.1 min · High risk. Mahathir at the IMF/World Bank meetings in Hong Kong warns Malaysia will limit currency dealing: his open war on forex speculators and Soros.
83. [Malaysia - Central bank fixes exchange rate](https://www.youtube.com/watch?v=tiLRXBPWVKY)  
   AP Archive · 2.6 min · High risk. Bank Negara pegs the ringgit at 3.80 to the US dollar as capital controls start: the day Malaysia shut out the speculators.
84. [INDONESIA: JAKARTA: INTERNATIONAL MONETARY FUND RESCUE PACKAGE](https://www.youtube.com/watch?v=4Pxv4_I7Pio)  
   AP Archive · 2.9 min · High risk. Suharto signs the $40bn IMF rescue as the rupiah collapses (the signing where IMF chief Camdessus stood arms folded; check the clip for that shot).
85. [SOUTH KOREA: GOLD COLLECTION SCHEME PROVING SUCCESSFUL](https://www.youtube.com/watch?v=INED3nal8hM)  
   AP Archive · 1.8 min · High risk. Koreans queue to hand in wedding rings and gold jewellery to help repay the IMF: the 'citizens save the currency' story.
86. [UK: SINGAPORE: BARINGS BANK COLLAPSE](https://www.youtube.com/watch?v=QxJ_nLI9ymc)  
   AP Archive · 3.1 min · High risk. Singapore reacts as Nick Leeson's SIMEX losses sink 233-year-old Barings: the rogue-trader story on a Southeast Asian exchange.
87. [USA: ALAN GREENSPAN HOUSE BANKING COMMITTEE TESTIMONY](https://www.youtube.com/watch?v=mobE8sH_zdQ)  
   AP Archive · 2.3 min · High risk. Greenspan defends the Fed-brokered $3.6bn LTCM rescue to Congress: the Nobel-prize hedge fund that nearly broke Wall Street.
88. [Interviews with staff who have been let go, boxes being moved](https://www.youtube.com/watch?v=AVIrUDEw5Gs)  
   AP Archive · 2.7 min · High risk. Lehman staff carry their boxes out of HQ on bankruptcy morning: the defining image of 2008 (540k views). Moment: 00:00 (opening shot, woman carrying box).
89. [Brexit Vote Results in Drop in Pound](https://www.youtube.com/watch?v=RKr2zDw4uMk)  
   AP Archive · 1.8 min · High risk. The pound plunges more than 10% in six hours after the Leave vote, one of its biggest one-day falls ever.
90. [Analyst on plummet of British pound](https://www.youtube.com/watch?v=3h_E_shU0oo)  
   AP Archive · 1.6 min · High risk. The Asian-hours 'flash crash' that knocked about 6% off the pound in minutes.
91. [NYSE: Dow drops 5.8% at opening, US stock trading halted for 15 mins](https://www.youtube.com/watch?v=ibr-kyxx4ZI)  
   AFP News Agency · 1.0 min · High risk. NYSE floor as the 7% circuit breaker halts all US stocks for 15 minutes, the first market-wide halt since 1997.
92. [The moment Lizzy Lettuce outlasted Liz Truss as Prime Minister](https://www.youtube.com/watch?v=taW_3T7QzUA)  
   Daily Star · 3.8 min · High risk. The livestreamed lettuce outlasts Liz Truss after her mini-budget crashed gilts and the pound: peak market meme.
93. [Japan's Nikkei 225 plunges 12.4% as world markets tremble over risks to US economy](https://www.youtube.com/watch?v=nJFYY896oEw)  
   AP Archive · 1.7 min · High risk. Tokyo boards flash red as the Nikkei crashes 12.4%, its worst day since 1987, as the yen carry trade unwinds.
94. [Gold price hits record high, topping $US4,000 an ounce for first time | Finance Report | ABC NEWS](https://www.youtube.com/watch?v=yvn5BrYs3TY)  
   ABC News (Australia) · 2.0 min · High risk. Gold breaks US$4,000/oz for the first time as safe-haven buying explodes.
95. [Gold blasts past $5,500 to record high on safe-haven demand](https://www.youtube.com/watch?v=e9OqhlhBQJM)  
   Reuters · 1.2 min · High risk. Gold rips past $5,500, near the January 2026 all-time high before this year's sell-off: 'from $4k to $5.5k in four months'.
96. [CHICAGO BOARD OF TRADE TRADING PITS WHEN ELECTRONIC PLATFORM CRAHSES](https://www.youtube.com/watch?v=GQPt0YR9gzU)  
   ConorsHead · 1.0 min · High risk. An empty CBOT corn pit suddenly fills with yelling traders when the electronic platform goes down: open outcry's revenge.
