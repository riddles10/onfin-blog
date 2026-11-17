"""Tweet-screenshot version: real X embed screenshot + exact excerpt (EN, MS, RU, ES)."""
import json, os, subprocess, sys
sys.path.insert(0, "/tmp/claude-0/-home-user-onfin-blog/42b2fa22-784d-52c4-a9a8-6ec4971d0812/scratchpad/wk")
from common import Week, S
from PIL import Image
M = f"{S}/huang4"
AV = f"file://{S}/meme/logo/avatar-bolt.jpg"
PH = f"file://{S}/huang/photo/huang.jpg"
T = {
 "en": dict(line="Jensen Huang's first statement since *resigning as Nvidia CEO*:", ex="Later in the same post:",
            q="“If the Board of Directors decides that my return is in the best interest of our shareholders, our employees, the company, and America, *I would be honored to answer these calls and return as CEO.*”",
            c="Nvidia's board is not considering bringing him back, a person familiar told CNBC."),
 "ms": dict(line="Kenyataan pertama Jensen Huang sejak *meletak jawatan sebagai CEO Nvidia*:", ex="Kemudian dalam hantaran yang sama (terjemahan):",
            q="“Jika Lembaga Pengarah memutuskan bahawa kepulangan saya adalah demi kepentingan terbaik pemegang saham kami, pekerja kami, syarikat dan Amerika, *saya berbesar hati untuk menyahut seruan ini dan kembali sebagai CEO.*”",
            c="Lembaga Nvidia tidak menimbang untuk membawanya kembali, menurut sumber kepada CNBC."),
 "ru": dict(line="Первое заявление Дженсена Хуанга после *ухода с поста CEO Nvidia*:", ex="Далее в том же посте (перевод):",
            q="«Если совет директоров решит, что моё возвращение отвечает интересам наших акционеров, наших сотрудников, компании и Америки, *я почту за честь откликнуться на эти призывы и вернуться на пост CEO.*»",
            c="Совет директоров Nvidia не рассматривает его возвращение, сообщил CNBC источник."),
 "es": dict(line="La primera declaración de Jensen Huang desde que *renunció como CEO de Nvidia*:", ex="Más adelante en la misma publicación (traducción):",
            q="“Si el consejo de administración decide que mi regreso es lo mejor para nuestros accionistas, nuestros empleados, la empresa y Estados Unidos, *sería un honor responder a estos llamados y volver como CEO.*”",
            c="El consejo de Nvidia no contempla traerlo de vuelta, dijo a CNBC una fuente al tanto."),
}
W = Week("huang4b")
for l, t in T.items():
    W.lib("TweetSlide", dict(avatar=AV, bg=PH, shot=f"file://{M}/ev/x_embed.png", line=t["line"], exLabel=t["ex"], excerpt=t["q"], context=t["c"],
          lsize=46 if l == "en" else 40, exsize=27 if l == "en" else 24), f"h4b-{l}.png")
W.save()
for j in W.lib_jobs:
    if any(ch in json.dumps(j["props"], ensure_ascii=False) for ch in "–—!"):
        print("BAD CHAR", j["out"])
r = subprocess.run(["node", "render_page.js", f"{S}/huang4b/lib_jobs.json"], cwd=f"{S}/igtools", env={**os.environ, "LIB": f"{S}/iglib/library", "PAGE": "render_huang4.html"}, capture_output=True, text=True)
print(r.stdout[-120:], r.stderr[-600:])
ims = [Image.open(f"{S}/huang4b/out/h4b-{l}.png").convert("RGB") for l in ("en", "ms", "ru", "es")]
w = 400; hh = int(w * 1350 / 1080); sh = Image.new("RGB", (w * 4 + 30, hh), "white")
for i, x in enumerate(ims):
    sh.paste(x.resize((w, hh)), (i * (w + 10), 0))
sh.save(f"{M}/sheet_b.jpg", quality=88)
