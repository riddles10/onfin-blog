"""Genesis sub-brand templates (key art + lime on black). Each function returns full HTML for one canvas."""
import html as H, re

S = "/tmp/claude-0/-home-user-onfin-blog/42b2fa22-784d-52c4-a9a8-6ec4971d0812/scratchpad"
A = f"file://{S}/genesis/assets"
FONTS = f"file://{S}/iglib/library/tokens/fonts.css"
LIME = "#a9c45a"


def rich(t):
    """*word* -> lime emphasis; \n -> <br>"""
    t = H.escape(t)
    return re.sub(r"\*(.+?)\*", r'<em>\1</em>', t).replace("\n", "<br>")


BASE = """<!doctype html><html><head><meta charset="utf-8"><link rel="stylesheet" href="{fonts}">
<style>
*{{box-sizing:border-box;margin:0;padding:0}}
body{{width:{w}px;height:{h}px;background:#101010;color:#f5f5f5;font-family:Montserrat,'Noto Sans Khmer',sans-serif;overflow:hidden}}
#c{{position:relative;width:{w}px;height:{h}px;overflow:hidden;background:#101010}}
em{{font-style:normal;color:{lime}}}
.mono{{font-family:'JetBrains Mono',monospace;letter-spacing:.04em}}
.top{{position:absolute;left:64px;right:64px;top:56px;display:flex;justify-content:space-between;align-items:center;z-index:3;font-size:22px;letter-spacing:.14em;text-transform:uppercase;color:#cfcfcf;font-weight:600}}
.by{{display:flex;align-items:center;gap:14px}} .by img{{height:22px}}
.scene{{position:absolute;left:0;width:{w}px;z-index:1}}
.fade{{position:absolute;left:0;right:0;z-index:2;background:linear-gradient(180deg,rgba(16,16,16,0) 0%,#101010 92%)}}
.wm{{position:absolute;left:50%;transform:translateX(-50%);z-index:3}}
.kick{{display:inline-flex;align-items:center;gap:12px;font-size:24px;font-weight:700;letter-spacing:.16em;text-transform:uppercase;color:{lime}}}
.kick:before{{content:"";width:28px;height:6px;border-radius:3px;background:{lime}}}
h1{{font-weight:800;letter-spacing:-.02em;line-height:1.04}}
.sub{{color:#cfcfcf;font-weight:500;line-height:1.35}}
.chips{{display:flex;flex-wrap:wrap;gap:12px}}
.chip{{border:1.5px solid #3a3a3a;border-radius:999px;padding:10px 20px;font-size:22px;font-weight:600;color:#e8e8e8}}
.pill{{display:inline-block;background:#9fce10;color:#0b0b0b;border-radius:999px;padding:16px 30px;font-weight:700;font-size:28px}}
.foot{{color:#8a8a8a;font-size:19px;line-height:1.4}}
</style></head><body><div id="c" data-g-canvas>{body}</div></body></html>"""


def page(w, h, body):
    return BASE.format(fonts=FONTS, w=w, h=h, lime=LIME, body=body)


def header(right):
    return (f'<div class="top"><div class="by"><span>Genesis</span><span style="color:#6a6a6a">by</span>'
            f'<img src="{A}/onfin-white.svg"></div><div class="mono" style="letter-spacing:.06em;text-transform:none">{H.escape(right)}</div></div>')


def cover(kicker, headline, sub, chips=(), url="genesis.onfin.io", story=False, size=None, foot=None, cta=None):
    """Key-art cover. Portrait 1080x1350 or story 1080x1920."""
    w, h = 1080, (1920 if story else 1350)
    y0 = 190 if story else 0                       # scene top
    scene_h = 820
    fade_top = y0 + scene_h - 330
    hs = size or (84 if story else 68)
    text_top = y0 + scene_h - (150 if story else 170)
    chips_html = "".join(f'<span class="chip">{H.escape(c)}</span>' for c in chips)
    wm_w = 760 if not story else 857
    body = (header(url) +
            f'<img class="scene" src="{A}/scene.png" style="top:{y0}px">'
            f'<div class="fade" style="top:{fade_top}px;height:340px"></div>'
            + f'<div style="position:absolute;left:0;right:0;top:0;height:{y0+170}px;z-index:2;background:linear-gradient(180deg,#101010 {35 if not story else 70}%,rgba(16,16,16,0))"></div>' +
            f'<div style="position:absolute;left:64px;right:64px;top:{text_top}px;z-index:3;display:flex;flex-direction:column;gap:{30 if story else 24}px">'
            f'<span class="kick">{H.escape(kicker)}</span>'
            f'<h1 style="font-size:{hs}px">{rich(headline)}</h1>'
            + (f'<p class="sub" style="font-size:{36 if story else 32}px">{rich(sub)}</p>' if sub else "")
            + (f'<div class="chips"{' style="zoom:1.25"' if story else ""}>{chips_html}</div>' if chips else "")
            + (f'<div style="margin-top:{24 if story else 0}px"><span class="pill"{' style="font-size:34px;padding:20px 38px"' if story else ""}>{H.escape(cta)}</span></div>' if cta else "")
            + (f'<p class="foot" style="font-size:{26 if story else 20}px">{H.escape(foot)}</p>' if foot else "")
            + '</div>'
            f'<img class="wm" src="{A}/wordmark-lime.png" style="width:{wm_w}px;bottom:{70 if story else 34}px">')
    return w, h, page(w, h, body)


def end(heading, body, cta, foot, url="genesis.onfin.io", index=None, total=None):
    """Closing slide: smaller scene, CTA pill, wordmark."""
    w, h = 1080, 1350
    dots = ""
    if index and total:
        dots = (f'<div class="mono" style="position:absolute;right:64px;bottom:52px;z-index:3;font-size:20px;color:#8a8a8a">'
                f'{index:02d} / {total:02d}</div>')
    body = (header(url) +
            f'<img class="scene" src="{A}/scene.png" style="top:110px;opacity:.55">'
            f'<div class="fade" style="top:420px;height:520px"></div>'
            f'<div style="position:absolute;left:64px;right:64px;top:640px;z-index:3;display:flex;flex-direction:column;gap:28px">'
            f'<h1 style="font-size:66px">{rich(heading)}</h1>'
            f'<p class="sub" style="font-size:30px">{rich(body)}</p>'
            f'<div><span class="pill">{H.escape(cta)}</span></div>'
            f'<p class="foot">{H.escape(foot)}</p></div>'
            f'<img class="wm" src="{A}/wordmark-lime.png" style="width:520px;bottom:40px;left:64px;transform:none">' + dots)
    return w, h, page(w, h, body)


def table(kicker, heading, cols, rows, note, legal, story=False):
    """Genesis earnings table: big lime figures on black, small scene strip at the top."""
    w, h = 1080, (1920 if story else 1350)
    top = 520 if story else 330
    trs = "".join(
        f'<div style="display:flex;justify-content:space-between;align-items:baseline;padding:{30 if story else 24}px 0;border-bottom:1.5px solid #262626">'
        f'<span style="font-size:{40 if story else 36}px;font-weight:600;color:#e8e8e8">{H.escape(a)}</span>'
        f'<span style="font-size:{72 if story else 62}px;font-weight:800;color:{LIME if i < len(rows) - 1 else "#f5f5f5"}">{H.escape(b)}</span></div>'
        for i, (a, b) in enumerate(rows))
    body = (header("genesis.onfin.io") +
            f'<img class="scene" src="{A}/scene.png" style="top:-600px;opacity:.45">'
            f'<div class="fade" style="top:40px;height:200px"></div>'
            f'<div style="position:absolute;left:64px;right:64px;top:{top - 110}px;z-index:3;display:flex;flex-direction:column;gap:22px">'
            f'<span class="kick">{H.escape(kicker)}</span>'
            f'<h1 style="font-size:{80 if story else 66}px">{rich(heading)}</h1>'
            f'<div class="mono" style="display:flex;justify-content:space-between;margin-top:26px;font-size:20px;color:#8a8a8a;text-transform:uppercase">'
            f'<span>{H.escape(cols[0])}</span><span>{H.escape(cols[1])}</span></div>'
            f'<div style="border-top:1.5px solid #303030">{trs}</div>'
            f'<p class="sub" style="font-size:{30 if story else 26}px;margin-top:10px">{rich(note)}</p>'
            f'<p class="foot" style="font-size:{24 if story else 19}px">{H.escape(legal)}</p></div>'
            f'<img class="wm" src="{A}/wordmark-lime.png" style="width:{520 if story else 420}px;bottom:{90 if story else 40}px;left:64px;transform:none">')
    return w, h, page(w, h, body)
