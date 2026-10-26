"""Build carousel HTML files from content specs. Usage: python3 build.py"""
import json, sys

EXTRA_CSS = """
.row .t small{display:block;font-size:26px;font-weight:400;color:var(--ink300);margin-top:6px}
body.light .row .t small{color:var(--ink400)}
.m .s.w{white-space:nowrap;font-size:23px}
.m .lbl b{display:block;font-weight:600;font-size:32px}
.m .lbl small{display:block;font-size:25px;color:var(--ink300);margin-top:6px}
body.light .m .lbl small{color:var(--ink400)}
.ex{margin-top:56px;display:grid;grid-template-columns:1fr auto 1fr;align-items:center;gap:24px}
.ex .box{padding:34px;border-radius:28px;background:#000;border:1px solid var(--ink500);text-align:center}
.ex .box .k{font-size:22px;letter-spacing:.12em;text-transform:uppercase;color:var(--ink300);font-weight:600}
.ex .box .v{font-size:64px;font-weight:600;margin-top:10px}
.ex .arrow{font-size:52px;color:var(--lime);font-weight:700}
.big{margin-top:44px;font-size:150px;font-weight:600;letter-spacing:-.02em;line-height:1;color:var(--lime)}
.big small{display:block;font-size:32px;font-weight:500;color:var(--ink200);letter-spacing:0;margin-top:18px;line-height:1.4}
body.light .ex .box{background:#fff;border:1px solid var(--ink100);box-shadow:0 6px 24px rgba(0,0,0,.05)}
body.light .ex .box .k{color:var(--ink400)}
body.light .ex .arrow{color:#000}
body.light .big{color:#000}
body.light .big span{background:linear-gradient(180deg,transparent 62%,var(--lime2) 62%,var(--lime2) 90%,transparent 90%)}
body.light .big small{color:var(--ink500)}
.stats.flow{position:static;margin-top:60px}
.cover .body{top:auto;bottom:170px}
table.sm td:first-child{white-space:nowrap;padding-right:28px}
.stats.g4{grid-template-columns:1fr 1fr}
table.sm{font-size:26px} table.sm td:first-child{font-size:27px}
.slide .cover-photo{position:absolute;left:0;top:0;width:1080px;height:760px;background-position:center;background-size:cover}
"""

GLOWS = ["right:-420px;top:-380px", "left:-500px;bottom:-500px", "right:-500px;bottom:-500px",
         "left:-500px;top:-450px", "right:-450px;top:-420px", "left:-480px;bottom:-480px"]


def page(spec):
    theme = spec["theme"]
    n = len(spec["slides"]) + 2  # cover + slides + cta
    logo = "logo-main.svg" if theme == "light" else "logo.svg"
    short = spec["short"]
    out = []
    # cover
    out.append(f'''<section class="slide cover" id="s1">
  <div class="photo" style="background-image:url({spec['cover']})"></div>
  <div class="bar"><img class="logo" src="{logo}"><span class="count"><b>1</b> / {n}</span></div>
  <div class="body">
    <span class="tag fill">{spec['tag']}</span>
    <h1 style="font-size:{spec.get('title_size', 96)}px">{spec['title']}</h1>
    <p class="lead">{spec['lead']}</p>
  </div>
  <div class="foot"><span>blog.onfin.io</span><span class="swipe">Swipe to read <span class="arr">→</span></span></div>
</section>''')
    for i, body in enumerate(spec["slides"]):
        k = i + 2
        glow = GLOWS[i % len(GLOWS)]
        foot = body.get("foot", short)
        out.append(f'''<section class="slide" id="s{k}">
  <div class="glow" style="{glow}"></div>
  <div class="pad">
    <div class="top"><img class="logo" src="{logo}"><span class="count"><b>{k}</b> / {n}</span></div>
    {body['html']}{body.get('after', '').replace('class="stats"', 'class="stats flow"')}
  </div>
  <div class="foot"><span>{foot}</span><span class="swipe"><span class="arr">→</span></span></div>
</section>''')
    cta = spec["cta"]
    out.append(f'''<section class="slide cta" id="s{n}">
  <div class="pad"><div class="top"><img class="logo" src="{logo}"><span class="count"><b>{n}</b> / {n}</span></div></div>
  <div class="center">
    <span class="tag">Keep reading</span>
    <h2>Get the full guide on the OnFin blog</h2>
    <p class="lead">{cta}</p>
    <span class="btn">blog.onfin.io</span>
    <p class="url">Search "{spec['search']}"</p>
  </div>
  <p class="risk">CFDs are high-risk; you may lose money. This content is educational and is not investment advice.</p>
</section>''')
    css = open("carousel.css", encoding="utf-8").read() + EXTRA_CSS
    body_cls = ' class="light"' if theme == "light" else ""
    return f'<!doctype html><html><head><meta charset="utf-8"><style>{css}</style></head><body{body_cls}>\n' + "\n".join(out) + "\n</body></html>", n


# ---------- helpers ----------
def head(tag=None, title="", mt=96):
    t = f'<div style="margin-top:{mt}px"><span class="tag">{tag}</span></div>' if tag else ""
    h_mt = "" if tag else f' style="margin-top:{mt + 14}px"'
    return f'{t}<h2{h_mt}>{title}</h2>'

def chip(t): return f'<span class="chip"><i></i>{t}</span>'
def lead(t, mt=30): return f'<p class="lead" style="margin-top:{mt}px">{t}</p>'
def pts(items): return '<div class="pts">' + "".join(f'<div class="pt"><span>{x}</span></div>' for x in items) + '</div>'
def rows(items, mt=44):
    h = ""
    for i, it in enumerate(items, 1):
        t, sub = (it if isinstance(it, tuple) else (it, None))
        h += f'<div class="row"><span class="n">{i:02d}</span><span class="t">{t}{f"<small>{sub}</small>" if sub else ""}</span></div>'
    return f'<div class="rows" style="margin-top:{mt}px">{h}</div>'
def stats(pairs, flow=False):
    cls = "stats flow" if flow else "stats"
    h = "".join(f'<div class="stat"><div class="k">{k}</div><div class="v{" l" if i == 0 else ""}">{v}</div></div>' for i, (k, v) in enumerate(pairs))
    return f'<div class="{cls}">{h}</div>'
def table(headers, body, cls=""):
    h = "".join(f"<th>{x}</th>" for x in headers)
    b = "".join("<tr>" + "".join(f"<td>{c}</td>" for c in r) + "</tr>" for r in body)
    return f'<table class="{cls}"><tr>{h}</tr>{b}</table>'
def note(t, mt=44): return f'<div class="note" style="margin-top:{mt}px">{t}</div>'
def match(items, mt=50):
    h = ""
    for it in items:
        left, pill = it[0], it[1]
        sub = it[2] if len(it) > 2 else None
        lbl = f'<span class="lbl"><b>{left}</b><small>{sub}</small></span>' if sub else f'<span>{left}</span>'
        h += f'<div class="m">{lbl}<span class="s w">{pill}</span></div>'
    return f'<div class="match" style="margin-top:{mt}px">{h}</div>'
def quote(t, mt=40): return f'<p class="quote" style="margin-top:{mt}px">{t}</p>'


if __name__ == "__main__":
    from content import CAROUSELS
    import os
    for c in CAROUSELS:
        html, n = page(c)
        open(f"{c['id']}.html", "w", encoding="utf-8").write(html)
        print(c["id"], n)
