"""Evidence-led OnFin carousel sample (Alphabet worst day). python3 evid_sample.py"""
import json, os, subprocess
from common import Week, S

E = lambda f: f"file://{S}/evid/{f}"
AV = f"file://{S}/meme/logo/avatar-bolt.jpg"
BG = f"file://{S}/social2/photos/googleplex.jpg"
d = json.load(open(f"{S}/evid/googl_d.json"))["chart"]["result"][0]
closes = [round(c, 2) for c in d["indicators"]["quote"][0]["close"] if c]
W = Week("evid")
common = dict(avatar=AV, bg=BG, bgpos="40% 50%")
W.lib("SocialCover", dict(avatar=AV, photo=BG, pos="40% 50%", logo=E("glogo.svg"), badge="-12.6%", cy=600, cd=400, tag="Market news",
      headline="Google's parent just had its *worst day* since 2004.", credit="Photo: Asoundd, CC BY-SA 4.0, Wikimedia Commons"), "ev-01.png")
W.lib("EvidenceSlide", dict(common, line="*$500 billion* wiped out in one day.", shot=E("ev_nbc_head.png"), cardPad=0, source="NBC News, 29 Oct 2026"), "ev-02.png")
W.lib("ChartSlide", dict(common, line="From $324.89 to *$283.82* in one session.", closes=closes, symbol="GOOGL", change="-12.64%",
      sub="Daily close, last month", fromLabel="$324.89", toLabel="$283.82", startLabel="30 Sep", endLabel="29 Oct",
      source="Data: Yahoo Finance"), "ev-03.png")
W.lib("EvidenceSlide", dict(common, line="Profit came in *far below* forecasts.", shot=E("s_eps.png"), source="Yahoo Finance, 29 Oct 2026"), "ev-04.png")
W.lib("EvidenceSlide", dict(common, line="Wall Street's verdict on *Google search*:", shot=E("s_jpm.png"), source="NBC News, 29 Oct 2026"), "ev-05.png")
W.lib("EvidenceSlide", dict(common, line="The bright spot: *Cloud grew 103%*.", shot=E("s_cloud.png"), source="Yahoo Finance, 29 Oct 2026"), "ev-06.png")
W.lib("SocialSlide", dict(avatar=AV, photo=BG, pos="40% 50%", top=0.5, dark=0.92, line="Would you hold a stock *through earnings?*",
      sub="Follow @onfinkm for daily market stories.", risk="Not investment advice. CFDs are high-risk; you may lose money."), "ev-07.png")
W.save()
r = subprocess.run(["node", "render_page.js", f"{S}/{W.name}/lib_jobs.json"], cwd=f"{S}/igtools",
                   env={**os.environ, "LIB": f"{S}/iglib/library", "PAGE": "render_ft.html"}, capture_output=True, text=True)
print(r.stdout[-200:], r.stderr[-600:])
