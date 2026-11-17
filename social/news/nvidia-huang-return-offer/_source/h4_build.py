"""Jensen Huang says he would return as Nvidia CEO if the board asks (X post, 17 Nov 2026). Single quote card in EN, MS, RU, ES.
python3 h4_build.py"""
import json, os, subprocess, sys
sys.path.insert(0, "/tmp/claude-0/-home-user-onfin-blog/42b2fa22-784d-52c4-a9a8-6ec4971d0812/scratchpad/wk")
from common import Week, S
from PIL import Image

M = f"{S}/huang4"
AV = f"file://{S}/meme/logo/avatar-bolt.jpg"
PH = f"file://{S}/huang/photo/huang.jpg"
CREDIT = "Photo: Anderseidesvik, CC BY-SA 4.0, Wikimedia Commons"
T = {
 "en": dict(tag="Jensen Huang on X", q="If the Board of Directors decides that my return is in the best interest of our shareholders, our employees, the company, and America, *I would be honored to answer these calls and return as CEO.*",
            a="Jensen Huang on X, 17 Nov 2026", c="Nvidia's board is not considering bringing him back, a person familiar told CNBC."),
 "ms": dict(tag="Jensen Huang di X", q="Jika Lembaga Pengarah memutuskan bahawa kepulangan saya adalah demi kepentingan terbaik pemegang saham kami, pekerja kami, syarikat dan Amerika, *saya berbesar hati untuk menyahut seruan ini dan kembali sebagai CEO.*",
            a="Jensen Huang di X, 17 Nov 2026 (terjemahan)", c="Lembaga Nvidia tidak menimbang untuk membawanya kembali, menurut sumber kepada CNBC."),
 "ru": dict(tag="Дженсен Хуанг в X", q="Если совет директоров решит, что моё возвращение отвечает интересам наших акционеров, наших сотрудников, компании и Америки, *я почту за честь откликнуться на эти призывы и вернуться на пост CEO.*",
            a="Дженсен Хуанг в X, 17 нояб. 2026 (перевод)", c="Совет директоров Nvidia не рассматривает его возвращение, сообщил CNBC источник."),
 "es": dict(tag="Jensen Huang en X", q="Si el consejo de administración decide que mi regreso es lo mejor para nuestros accionistas, nuestros empleados, la empresa y Estados Unidos, *sería un honor responder a estos llamados y volver como CEO.*",
            a="Jensen Huang en X, 17 nov 2026 (traducción)", c="El consejo de Nvidia no contempla traerlo de vuelta, dijo a CNBC una fuente al tanto."),
}


def render():
    W = Week("huang4")
    for l, t in T.items():
        W.lib("QuoteCover", dict(avatar=AV, photo=PH, tag=t["tag"], quote=t["q"], attrib=t["a"], context=t["c"], credit=CREDIT, qsize=42 if l == "en" else 38), f"h4-{l}.png")
    W.save()
    for j in W.lib_jobs:
        if any(ch in json.dumps(j["props"], ensure_ascii=False) for ch in "–—!"):
            print("BAD CHAR", j["out"])
    page = f"{S}/iglib/library/render_huang4.html"
    open(page, "w").write(open(f"{S}/iglib/library/render_antspacex.html").read().replace(f"{S}/antspacex/antspacex.js", f"{M}/quote.js"))
    r = subprocess.run(["node", "render_page.js", f"{M}/lib_jobs.json"], cwd=f"{S}/igtools", env={**os.environ, "LIB": f"{S}/iglib/library", "PAGE": "render_huang4.html"}, capture_output=True, text=True)
    print(r.stdout[-120:], r.stderr[-600:])
    ims = [Image.open(f"{M}/out/h4-{l}.png").convert("RGB") for l in ("en", "ms", "ru", "es")]
    w = 400; hh = int(w * 1350 / 1080); sh = Image.new("RGB", (w * 4 + 30, hh), "white")
    for i, x in enumerate(ims):
        sh.paste(x.resize((w, hh)), (i * (w + 10), 0))
    sh.save(f"{M}/sheet.jpg", quality=88)


if __name__ == "__main__":
    render()
