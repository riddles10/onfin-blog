"""Build the OnFin Academy lockup: OnFin wordmark paths + "Academy" (Montserrat SemiBold, text converted to paths).
Usage: python3 lockup.py LOGO_DIR FONT OUT_DIR"""
import re, sys, io, os
import uharfbuzz as hb
from fontTools.ttLib import TTFont
from fontTools.varLib.instancer import instantiateVariableFont
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen

LOGO, FONT, OUT = sys.argv[1:4]
LIME = "#B4EA10"        # the capsule colour in the library wordmark files
FIN_TOP, BASE = 209, 591  # "f" ascender top and baseline in wordmark units (measured with getBBox)
GAP = 150

def text_path(text, font_path, wght, cap_h, x0, baseline):
    f = TTFont(font_path); inst = instantiateVariableFont(f, {"wght": wght}, inplace=False)
    buf = io.BytesIO(); inst.save(buf); data = buf.getvalue()
    face = hb.Face(data); hbf = hb.Font(face)
    b = hb.Buffer(); b.add_str(text); b.guess_segment_properties(); hb.shape(hbf, b, {"kern": True, "liga": True})
    tt = TTFont(io.BytesIO(data)); gs = tt.getGlyphSet(); order = tt.getGlyphOrder()
    upm = tt["head"].unitsPerEm; capH = tt["OS/2"].sCapHeight
    s = cap_h / capH
    pen = SVGPathPen(gs); x = 0
    for info, pos in zip(b.glyph_infos, b.glyph_positions):
        name = order[info.codepoint]
        tp = TransformPen(pen, (s, 0, 0, -s, x0 + (x + pos.x_offset) * s, baseline - pos.y_offset * s))
        gs[name].draw(tp); x += pos.x_advance
    return pen.getCommands(), x * s

svg = open(os.path.join(LOGO, "wordmark-main.svg")).read()
paths = re.findall(r'<path d="([^"]+)"[^>]*fill="([^"]+)"', svg)
# path order in wordmark-main: capsule, f, i stem, i dot, n, (n of on), (o of on)
capsule = paths[0][0]; on_letters = [p for p, c in paths[1:] if p.startswith(("M982.763", "M453.249"))]
fin = [p for p, c in paths[1:] if not p.startswith(("M982.763", "M453.249"))]
acad, w = text_path("Academy", FONT, 600, BASE - FIN_TOP, 2267 + GAP, BASE)
x0, x1, y0, y1 = 134, 2267 + GAP + w, 192, 704
pad = 0
W, H = round(x1 - x0 + 2 * pad), round(y1 - y0 + 2 * pad)
def lock(fin_col, on_col, acad_col, bg=None):
    vb = f"{x0 - pad:.1f} {y0 - pad:.1f} {W} {H}"
    out = [f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="{vb}" width="{W}" height="{H}">']
    if bg: out.append(f'<rect x="{x0 - pad}" y="{y0 - pad}" width="{W}" height="{H}" fill="{bg}"/>')
    out.append(f'<path d="{capsule}" fill="{LIME}"/>')
    out += [f'<path d="{p}" fill="{on_col}"/>' for p in on_letters]
    out += [f'<path d="{p}" fill="{fin_col}"/>' for p in fin]
    out.append(f'<path d="{acad}" fill="{acad_col}"/>')
    out.append("</svg>")
    return "\n".join(out)
os.makedirs(OUT, exist_ok=True)
open(os.path.join(OUT, "onfin-academy-lockup-dark.svg"), "w").write(lock("#FFFFFF", "#000000", LIME))   # for dark backgrounds
open(os.path.join(OUT, "onfin-academy-lockup-light.svg"), "w").write(lock("#000000", "#000000", "#000000"))  # for light backgrounds: lime fails contrast on white
print("lockup", W, H, "academy width", round(w))
