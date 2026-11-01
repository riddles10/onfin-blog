import json, re
S = json.load(open('summary.json'))
SRC = 'https://finance.yahoo.com/markets/stocks/articles/stock-market-today-nasdaq-p-123540419.html'
def r(x): return int(x + 0.5)
def pc(p, ru=False):
    s = '-%.1f%%' % abs(p); return s.replace('.', ',') if ru else s
B = {
 'en': lambda t: '• %s $%s: %s (about $%dB)' % (t['name'], t['t'], pc(t['pct']), r(t['loss'])),
 'ms': lambda t: '• %s $%s: %s (kira-kira $%d bilion)' % (t['name'], t['t'], pc(t['pct']), r(t['loss'])),
 'ru': lambda t: '• %s $%s: %s (около $%d млрд)' % (t['name'], t['t'], pc(t['pct'], True), r(t['loss'])),
 'es': lambda t: '• %s $%s: %s (unos $%s millones)' % (t['name'], t['t'], pc(t['pct']), '{:,}'.format(r(t['loss']) * 1000)),
}
bul = {l: [f(t) for t in S['top']] for l, f in B.items()}
FB = ['About $1.2 trillion was wiped from US tech stocks on Friday, 30 October.', '\n'.join(bul['en']),
      'Intel led the slide after "a weak outlook that overshadowed better-than-expected third-quarter results", as stocks fell "amid mounting concerns about the health of the AI trade" (Investopedia via Yahoo Finance). The Nasdaq Composite closed 2.9% lower.',
      'Viral posts put the total at $1.3 trillion. Our count across 42 large US tech companies comes to about $1.2 trillion, or about $1.4 trillion if US-listed TSMC, ASML, Arm and Shopify are included.',
      'Data: Yahoo Finance, 30 Oct close. Value lost is our calculation: price change × shares outstanding from SEC filings.',
      'Which of these 10 do you watch most closely?',
      'Not investment advice. CFDs are high-risk; you may lose money.']
TG = {
 'en': ['<strong>About $1.2 trillion wiped from US tech in one day</strong>', 'Friday 30 Oct, the 10 biggest losers by market value:', '\n'.join(bul['en']),
        'Intel led after a weak outlook, as stocks fell on "mounting concerns about the health of the AI trade" (<a href="%s">Investopedia via Yahoo Finance</a>).' % SRC,
        'Data: Yahoo Finance, 30 Oct close. Value lost = price change × SEC share counts, OnFin calculation across 42 US tech companies.',
        'Not investment advice. CFDs are high-risk; you may lose money.'],
 'ms': ['<strong>Kira-kira $1.2 trilion lenyap daripada saham teknologi AS dalam sehari</strong>', 'Jumaat 30 Okt, 10 kerugian terbesar mengikut nilai pasaran:', '\n'.join(bul['ms']),
        'Intel mendahului selepas unjuran yang lemah, ketika saham jatuh kerana "kebimbangan yang memuncak tentang kesihatan dagangan AI" (<a href="%s">Investopedia melalui Yahoo Finance</a>).' % SRC,
        'Data: Yahoo Finance, tutup 30 Okt. Nilai hilang: kiraan OnFin (harga × saham SEC) bagi 42 syarikat teknologi AS.',
        'Bukan nasihat pelaburan. CFD berisiko tinggi; anda mungkin kehilangan wang.'],
 'ru': ['<strong>Около $1,2 трлн стоимости техкомпаний США исчезло за день</strong>', 'Пятница, 30 октября: 10 крупнейших потерь по капитализации:', '\n'.join(bul['ru']),
        'Лидером падения стала Intel после слабого прогноза; рынок снижался на фоне «растущих опасений за состояние ИИ-торговли» (<a href="%s">Investopedia через Yahoo Finance</a>).' % SRC,
        'Данные: Yahoo Finance, закрытие 30 окт. Потеря = изменение цены × число акций по отчётам SEC, расчёт OnFin по 42 техкомпаниям США.',
        'Не является инвестиционной рекомендацией. CFD относятся к высокорисковым инструментам; вы можете потерять деньги.'],
 'es': ['<strong>Cerca de $1.2 billones borrados de las tecnológicas de EE. UU. en un día</strong>', 'Viernes 30 oct, las 10 mayores pérdidas de valor de mercado:', '\n'.join(bul['es']),
        'Intel lideró la caída tras un pronóstico débil, mientras las bolsas bajaban por la "creciente preocupación por la salud de la apuesta por la IA" (<a href="%s">Investopedia vía Yahoo Finance</a>).' % SRC,
        'Datos: Yahoo Finance, cierre del 30 oct. Valor perdido: cálculo de OnFin (precio × acciones SEC) con 42 tecnológicas.',
        'No es asesoramiento de inversión. Los CFD son de alto riesgo; puedes perder dinero.'],
}
def html(paras):
    out = []
    for p in paras:
        for line in p.split('\n'):
            out.append('<p>%s</p>' % line)
        out.append('<p></p>')
    return ''.join(out[:-1])
def visible(paras): return len(re.sub('<[^>]+>', '', '\n\n'.join(paras)))
res = {'fb': html(FB), 'tg': {l: html(p) for l, p in TG.items()}}
for l, p in TG.items():
    t = '\n\n'.join(p); assert not any(c in t for c in '–—!'), l
    print(l, visible(p))
assert not any(c in '\n'.join(FB) for c in '–—!')
json.dump(res, open('captions.json', 'w'), ensure_ascii=False)
md = ['# Quick post: about $1.2T wiped from US tech on Fri 30 Oct 2026', '',
      'Method: value lost = (30 Oct close - 29 Oct close) × shares outstanding from each company\'s latest SEC filing (cover-page shares, or weighted average basic shares for multi-class companies), across 42 large US tech companies: total about $%.0fB. Adding US-listed TSMC (ADR = 5 shares), ASML, Arm and Shopify: about $1.40T. Viral posts said $1.3T.' % S['total'],
      'Driver: Investopedia via Yahoo Finance, 30 Oct (Stephen Wisnefski): "Stocks plunged Friday amid mounting concerns about the health of the AI trade"; Intel "issued a weak outlook that overshadowed better-than-expected third-quarter results". ' + SRC, '',
      '## facebook', ''] + FB + ['', '## instagram-story', '', 'No caption; image story-en.png carries the information.', '']
for l, p in TG.items():
    md += ['## telegram-%s' % l, ''] + [re.sub('<a href="([^"]+)">([^<]+)</a>', r'\2 (\1)', x).replace('<strong>', '').replace('</strong>', '') for x in p] + ['']
open('captions.md', 'w').write('\n\n'.join(x for x in md if x != '') + '\n')
