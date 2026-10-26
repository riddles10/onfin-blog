"""Single-image Instagram posts (announcements and offers), 1080x1350.
Usage: python3 singles.py  -> writes single-<id>.html"""

CSS_EXTRA = """
.slide.single .pad{padding-top:88px}
.s-tag{margin-top:92px}
.s-h{font-size:68px;font-weight:600;letter-spacing:-.01em;line-height:1.08;margin-top:30px;max-width:640px}
.s-upto{margin-top:34px;font-size:32px;font-weight:600;letter-spacing:.14em;text-transform:uppercase;color:var(--ink300)}
.s-fig{font-size:196px;font-weight:700;letter-spacing:-.03em;line-height:.95;color:var(--lime);margin-top:6px}
.s-fig small{font-size:56px;font-weight:600;letter-spacing:-.01em;color:#fff;margin-left:14px}
.s-sub{font-size:32px;line-height:1.4;color:var(--ink200);margin-top:22px;max-width:560px}
.s-ill{position:absolute;right:-40px;top:250px;width:520px;filter:drop-shadow(0 30px 60px rgba(0,0,0,.45))}
.s-list{margin-top:44px;display:flex;flex-direction:column;gap:18px}
.s-li{display:flex;gap:22px;align-items:center;padding:20px 30px;border-radius:24px;background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.09);font-size:31px;line-height:1.3}
.s-li i{flex:none;width:44px;height:44px;border-radius:100px;background:var(--lime);color:#000;font-style:normal;font-weight:700;font-size:24px;display:grid;place-items:center}
.s-cta{position:absolute;left:88px;right:88px;bottom:142px;display:flex;align-items:center;justify-content:space-between}
.s-cta .btn{margin:0;padding:24px 40px;font-size:32px}
.s-cta .when{font-size:26px;font-weight:600;color:var(--ink200);text-align:right;line-height:1.35}
.s-cta .when b{color:var(--lime);display:block;font-size:30px}
.s-risk{position:absolute;left:88px;right:88px;bottom:62px;font-size:21px;line-height:1.4;color:var(--ink300)}
.s-big{font-size:250px;font-weight:700;letter-spacing:-.04em;line-height:.9;color:var(--lime);margin-top:60px}
.s-big small{display:block;font-size:64px;letter-spacing:-.01em;color:#fff;font-weight:600;margin-top:18px;line-height:1.15}
.s-duo{margin-top:64px;display:grid;grid-template-columns:1fr 1fr;gap:22px}
.s-duo .stat{background:#000}
.s-duo .stat .v{font-size:54px}
.s-duo .stat .d{font-size:24px;color:var(--ink300);margin-top:8px;line-height:1.35}
table.lv{margin-top:40px;font-size:30px}
table.lv td{padding:22px 16px}
table.lv td:last-child{font-weight:700;color:var(--lime);text-align:right}
table.lv th:last-child{text-align:right}

body.light .s-upto{color:var(--ink400)}
body.light .s-fig{color:#000}
body.light .s-fig span{background:linear-gradient(180deg,transparent 64%,var(--lime2) 64%,var(--lime2) 92%,transparent 92%)}
body.light .s-fig small{color:#000}
body.light .s-sub{color:var(--ink500)}
body.light .s-ill{filter:drop-shadow(0 30px 50px rgba(0,0,0,.18))}
body.light .s-li{background:#fff;border:1px solid var(--ink100);box-shadow:0 6px 24px rgba(0,0,0,.05)}
body.light .s-cta .when{color:var(--ink500)}
body.light .s-cta .when b{color:#000}
body.light .s-risk{color:var(--ink400)}
body.light .s-big{color:#000}
body.light .s-big span{background:linear-gradient(180deg,transparent 62%,var(--lime2) 62%,var(--lime2) 90%,transparent 90%)}
body.light .s-big small{color:#000}
body.light .s-duo .stat{background:#fff}
body.light .s-duo .stat .d{color:var(--ink400)}
body.light table.lv td:last-child{color:#000}
"""

TC = "T&amp;Cs apply. Rewards subject to final validation. CFDs are high-risk; you may lose money."
LEV = "Trading leveraged products involves significant risk of loss. Higher leverage amplifies both profits and losses."


def li(items):
    return '<div class="s-list">' + "".join(f'<div class="s-li"><i>✓</i><span>{x}</span></div>' for x in items) + '</div>'


def cta(link, when, risk):
    return (f'<div class="s-cta"><span class="btn">{link}</span><span class="when">{when}</span></div>'
            f'<p class="s-risk">{risk}</p>')


POSTS = [
 {"id": "trader-launch", "theme": "light", "glow": "right:-380px;top:-300px",
  "html": '<div class="s-tag"><span class="tag fill">New offer</span></div>'
    '<h2 class="s-h">Trader Growth Rewards</h2>'
    '<p class="s-upto">Earn up to</p><p class="s-fig"><span>$3,000</span><small>cash</small></p>'
    '<img class="s-ill" src="ill-coins-stack-rising-sm.png" style="top:110px;width:380px;right:-10px">'
    + li(["Grow your net deposit, from $1,000", "Trade 15+ lots in Forex &amp; Metals",
          "No sign-up: deposit $100+ to a verified live account"])
    + cta("onfin.io/en/promotions", "<b>20 Oct to 20 Nov</b>Paid after validation", TC)},
 {"id": "network-launch", "theme": "dark", "glow": "left:-420px;top:-380px",
  "html": '<div class="s-tag"><span class="tag fill">For partners</span></div>'
    '<h2 class="s-h">Network Growth Rewards</h2>'
    '<p class="s-upto">Earn up to</p><p class="s-fig">$6,000</p>'
    '<img class="s-ill" src="ill-ib-handshake-sm.png" style="top:110px;width:400px;right:-40px">'
    + li(["Network NET from $5,000 across direct clients", "3+ new clients depositing $100+ each",
          "50+ network lots in Forex &amp; Metals"])
    + cta("onfin.io/en/promotions", "<b>20 Oct to 20 Nov</b>Partners join automatically", TC)},
 {"id": "gold-leverage", "theme": "light", "glow": "right:-400px;top:-340px",
  "html": '<div class="s-tag"><span class="tag fill">Now on MT5</span></div>'
    '<h2 class="s-h">Gold leverage, now up to</h2>'
    '<p class="s-fig" style="margin-top:30px;font-size:210px"><span>1:3000</span></p>'
    '<img class="s-ill" src="ill-gold-bars-sm.png" style="top:150px;width:440px;right:-30px">'
    + li(["Up to 1:3000 on the first $40K of XAUUSD notional", "Tiers step down gradually as your position grows",
          "New positions may be capped at 1:200 around major news and weekends"])
    + cta("onfin.io/leverage", "<b>MT5 accounts only</b>Up from 1:1000", LEV)},
 {"id": "trader-levels", "theme": "dark", "glow": "right:-420px;top:-380px",
  "html": '<div class="s-tag"><span class="tag">Halfway point</span></div>'
    '<h2 class="s-h" style="max-width:none">Six levels. Which one is yours?</h2>'
    '<table class="lv"><tr><th>Level</th><th>Net deposit</th><th>Lots</th><th>Reward</th></tr>'
    '<tr><td>1</td><td>$1,000</td><td>15</td><td>$50</td></tr>'
    '<tr><td>2</td><td>$2,500</td><td>30</td><td>$125</td></tr>'
    '<tr><td>3</td><td>$5,000</td><td>60</td><td>$275</td></tr>'
    '<tr><td>4</td><td>$10,000</td><td>120</td><td>$600</td></tr>'
    '<tr><td>5</td><td>$25,000</td><td>300</td><td>$1,500</td></tr>'
    '<tr><td>6</td><td>$50,000</td><td>600</td><td>$3,000</td></tr></table>'
    + cta("onfin.io/en/promotions", "<b>Trader Growth Rewards</b>Lower of your two levels applies", TC)},
 {"id": "network-levels", "theme": "light", "glow": "left:-420px;top:-380px",
  "html": '<div class="s-tag"><span class="tag">For partners</span></div>'
    '<h2 class="s-h" style="max-width:none">Six levels. One goal: $6,000</h2>'
    '<table class="lv" style="font-size:28px"><tr><th>Level</th><th>Network NET</th><th>FTDs</th><th>Lots</th><th>Payment</th></tr>'
    '<tr><td>1</td><td>$5K</td><td>3</td><td>50</td><td>$250</td></tr>'
    '<tr><td>2</td><td>$10K</td><td>6</td><td>100</td><td>$500</td></tr>'
    '<tr><td>3</td><td>$25K</td><td>10</td><td>250</td><td>$1,300</td></tr>'
    '<tr><td>4</td><td>$50K</td><td>15</td><td>500</td><td>$2,750</td></tr>'
    '<tr><td>5</td><td>$75K</td><td>20</td><td>750</td><td>$4,350</td></tr>'
    '<tr><td>6</td><td>$100K</td><td>25</td><td>1,000</td><td>$6,000</td></tr></table>'
    + cta("onfin.io/en/promotions", "<b>Network Growth Rewards</b>Lowest measure applies", TC)},
 {"id": "final-week", "theme": "dark", "glow": "right:-420px;bottom:-420px",
  "html": '<div class="s-tag"><span class="tag fill">Final week</span></div>'
    '<p class="s-big">6 days<small>left to reach your next level</small></p>'
    '<div class="s-duo">'
    '<div class="stat"><div class="k">Trader Growth Rewards</div><div class="v l">$3,000</div><div class="d">Top cash reward for traders</div></div>'
    '<div class="stat"><div class="k">Network Growth Rewards</div><div class="v l">$6,000</div><div class="d">Top payment for partners</div></div></div>'
    + cta("onfin.io/en/promotions", "<b>Ends 20 November</b>Both campaigns", TC)},
 {"id": "ends-tomorrow", "theme": "light", "glow": "left:-420px;bottom:-420px",
  "html": '<div class="s-tag"><span class="tag fill">Last chance</span></div>'
    '<p class="s-big" style="font-size:176px;margin-top:50px"><span>Ends</span><br><span>tomorrow</span><small style="font-size:46px">Growth Rewards close on 20 November</small></p>'
    + li(["Trades must open and close by 20 November",
          "Withdrawals up to 27 November reduce your NET"])
    + cta("onfin.io/en/promotions", "<b>Up to $3,000</b>Up to $6,000 for partners", TC)},
]


def render(p):
    logo = "logo-main.svg" if p["theme"] == "light" else "logo.svg"
    css = open("carousel.css", encoding="utf-8").read() + CSS_EXTRA
    cls = ' class="light"' if p["theme"] == "light" else ""
    return (f'<!doctype html><html><head><meta charset="utf-8"><style>{css}</style></head><body{cls}>'
            f'<section class="slide single" id="s1"><div class="glow" style="{p["glow"]}"></div>'
            f'<div class="pad"><div class="top"><img class="logo" src="{logo}"></div>{p["html"]}</div></section>'
            '</body></html>')


if __name__ == "__main__":
    for p in POSTS:
        open(f"single-{p['id']}.html", "w", encoding="utf-8").write(render(p))
        print(p["id"])
