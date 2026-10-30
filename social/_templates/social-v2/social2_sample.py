"""Sample of the new PostHuman-style OnFin carousel (Alphabet story). python3 social2_sample.py"""
import os, subprocess
from common import Week, S

P = lambda k: f"file://{S}/social2/photos/{k}.jpg"
AV = f"file://{S}/meme/logo/avatar-bolt.jpg"
W = Week("social2")
slides = [
    dict(photo=P("googleplex"), pos="40% 50%", tag="Market news", headline="Google's parent just had its *worst day* since 2004.", credit="Photo: Asoundd, CC BY-SA 4.0, Wikimedia Commons"),
    dict(photo=P("trader"), pos="74% 50%", line="*$500 billion* gone in a single day."),
    dict(photo=P("phone"), pos="50% 40%", line="Ad sales missed. *Spending kept climbing.*"),
    dict(photo=P("servers"), pos="50% 30%", line="The bright spot: *Cloud grew 103%.*"),
    dict(photo=P("darkroom"), pos="60% 50%", line="Would you hold a stock *through earnings?*", sub="Follow @onfinkm for daily market stories.",
         risk="Not investment advice. CFDs are high-risk; you may lose money."),
]
for i, s in enumerate(slides, 1):
    W.lib("SocialSlide", dict(s, avatar=AV), f"s2-{i:02d}.png")
W.save()
r = subprocess.run(["node", "render_page.js", f"{S}/{W.name}/lib_jobs.json"], cwd=f"{S}/igtools",
                   env={**os.environ, "LIB": f"{S}/iglib/library", "PAGE": "render_ft.html"}, capture_output=True, text=True)
print(r.stdout[-200:], r.stderr[-600:])
