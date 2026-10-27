"""Shared helpers for weeks 2+: channels, compliance lines, render-job + post registries."""
import json, os, sys
S = "/tmp/claude-0/-home-user-onfin-blog/42b2fa22-784d-52c4-a9a8-6ec4971d0812/scratchpad"
sys.path.insert(0, f"{S}/genesis")
import gtpl as G  # noqa: E402

CH = {  # channel key -> (postiz integration id, platform, language)
    "ig": ("cmvl4rmgd12ctmk0yjjk9x6kd", "instagram", "en"),
    "fb": ("cmvjg1etr08j7lf0yde4p29lr", "facebook", "en"),
    "en": ("cmuv1mlcb001dmo0ylwenjxe1", "telegram", "en"),
    "kh": ("cmvjfl0ed087glf0yuoz284sa", "telegram", "en"),
    "ms": ("cmuv1oz5o002gql0y49vluhy3", "telegram", "ms"),
    "ru": ("cmuv1nud2001qmo0y7xgzq68r", "telegram", "ru"),
    "es": ("cmvjg3htg08k9lf0yunmvtsqu", "telegram", "es"),
}
LANG = {k: v[2] for k, v in CH.items()}
RISK = {"en": "CFDs are high-risk; you may lose money.", "ms": "CFD berisiko tinggi; anda mungkin kehilangan wang.",
        "ru": "CFD относятся к высокорисковым инструментам; вы можете потерять деньги.", "es": "Los CFD son de alto riesgo; puedes perder dinero."}
NOTADV = {"en": "Not investment advice. For information only.", "ms": "Bukan nasihat pelaburan. Untuk maklumat sahaja.",
          "ru": "Не является инвестиционной рекомендацией. Только для информации.", "es": "No es asesoramiento de inversión. Solo con fines informativos."}
FULL_RISK = {
    "en": "Risk warning: trading forex and CFDs on margin carries a high level of risk and may not be suitable for all investors. You may lose more than your initial investment.",
    "ms": "Amaran risiko: dagangan forex dan CFD atas margin membawa risiko tinggi dan mungkin tidak sesuai untuk semua pelabur. Anda mungkin kehilangan lebih daripada pelaburan awal anda.",
    "ru": "Предупреждение о рисках: торговля форекс и CFD с использованием маржи сопряжена с высоким риском и подходит не всем инвесторам. Вы можете потерять больше первоначальных вложений.",
    "es": "Advertencia de riesgo: operar forex y CFD con margen conlleva un alto nivel de riesgo y puede no ser adecuado para todos los inversores. Puedes perder más que tu inversión inicial.",
}
# Genesis legal lines, verbatim from genesis.onfin.io footers
G_LEGAL = {
    "en": "Trading leveraged products involves significant risk and may not be suitable for all investors. Genesis rewards are paid by OnFin under the programme terms. OnFin does not provide investment advice.",
    "ru": "Торговля продуктами с кредитным плечом связана со значительным риском и может подходить не всем инвесторам. Вознаграждения Genesis выплачивает OnFin по условиям программы. OnFin не предоставляет инвестиционных консультаций.",
    "es": "Operar productos apalancados implica un riesgo significativo y puede no ser adecuado para todos los inversores. Las recompensas de Genesis las paga OnFin según los términos del programa. OnFin no ofrece asesoría de inversión.",
    "ms": "Dagangan produk berleveraj melibatkan risiko yang ketara dan mungkin tidak sesuai untuk semua pelabur. Ganjaran Genesis dibayar oleh OnFin mengikut terma program. OnFin tidak memberikan nasihat pelaburan.",
}
G_AGE = {
    "en": "18+ only. Every video must carry the #ad disclosure from its brief.",
    "ru": "Только для лиц от 18 лет. Каждое видео должно содержать пометку #ad из брифа.",
    "es": "Solo mayores de 18 años. Cada video debe llevar la etiqueta #ad que indica el brief.",
    "ms": "18 tahun ke atas sahaja. Setiap video mesti menyertakan pendedahan #ad seperti dalam ringkasan.",
}
G_TAGS = "#onfin #genesis #ugccreator #contentcreator #creatorprogramme"


def g_url(l, page="get-started"):
    return f"https://genesis.onfin.io/{l}/{page}" if page else f"https://genesis.onfin.io/{l}"


class Week:
    def __init__(self, name):
        self.name = name
        self.out = f"{S}/{name}/out"
        self.lib_jobs, self.html_jobs, self.posts = [], [], []

    def lib(self, template, props, out):  # OnFin Instagram library template
        self.lib_jobs.append({"out": f"{self.out}/{out}", "name": template, "props": props})
        return f"{self.out}/{out}"

    def gen(self, built, out):  # Genesis HTML template: built = (w, h, html)
        w, h, html = built
        self.html_jobs.append({"out": f"{self.out}/{out}", "w": w, "h": h, "html": html})
        return f"{self.out}/{out}"

    def post(self, key, ch, date, lines, images, story=False):
        self.posts.append({"key": key, "ch": ch, "integrationId": CH[ch][0], "platform": CH[ch][1], "date": date,
                           "story": story, "lines": lines, "images": images})

    def save(self):
        os.makedirs(self.out, exist_ok=True)
        json.dump(self.lib_jobs, open(f"{S}/{self.name}/lib_jobs.json", "w"), ensure_ascii=False)
        json.dump(self.html_jobs, open(f"{S}/{self.name}/html_jobs.json", "w"), ensure_ascii=False)
        json.dump(self.posts, open(f"{S}/{self.name}/posts.json", "w"), ensure_ascii=False, indent=1)
        bad = []
        for p in self.posts:
            text = "\n".join(p["lines"])
            if any(c in text for c in "–—!"):
                bad.append(f'{p["key"]}:{p["ch"]} dash/!')
            if any(0x2600 <= ord(c) <= 0x1FAFF for c in text):
                bad.append(f'{p["key"]}:{p["ch"]} emoji')
            if p["platform"] == "telegram" and p["images"] and len(text) > 1000:
                bad.append(f'{p["key"]}:{p["ch"]} {len(text)} chars')
        print(self.name, len(self.lib_jobs), "lib +", len(self.html_jobs), "genesis renders,", len(self.posts), "posts; issues:", bad)
