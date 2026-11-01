import json, re
S = json.load(open('quick/summary.json'))
CNBC = 'https://www.cnbc.com/2026/10/30/amazon-intel-earnings-big-tech-ai-spending-concerns.html'
YF = 'https://finance.yahoo.com/markets/stocks/articles/stock-market-today-nasdaq-p-123540419.html'
def r(x): return int(x + 0.5)
def pc(p, ru=False):
    s = '-%.1f%%' % abs(p); return s.replace('.', ',') if ru else s
B = {
 'en': lambda i, t: '%d. %s $%s: %s (about $%dB)' % (i, t['name'], t['t'], pc(t['pct']), r(t['loss'])),
 'ms': lambda i, t: '%d. %s $%s: %s (kira-kira $%d bilion)' % (i, t['name'], t['t'], pc(t['pct']), r(t['loss'])),
 'ru': lambda i, t: '%d. %s $%s: %s (около $%d млрд)' % (i, t['name'], t['t'], pc(t['pct'], True), r(t['loss'])),
 'es': lambda i, t: '%d. %s $%s: %s (unos $%s millones)' % (i, t['name'], t['t'], pc(t['pct']), '{:,}'.format(r(t['loss']) * 1000)),
}
L = {l: '\n'.join(f(i + 1, t) for i, t in enumerate(S['top'])) for l, f in B.items()}
IG = ['About $1.2 trillion was wiped from 42 large US tech stocks on Friday, 30 October. Here are the 10 biggest losers, where each one stands now, and what comes next.',
      "Intel led the slide after a weak outlook, as worries about AI spending hit chip stocks (CNBC, Investopedia). In China, battery maker CATL fell about 10% on 21 October after slower profit growth (Trading Economics).",
      L['en'],
      'Value lost is our calculation: the day\'s price change × shares outstanding from SEC filings. Prices: Yahoo Finance, 30 Oct close. Dates and analyst views: Nvidia, AMD, AppleInsider, CNBC, Benzinga, TipRanks, NBC News, MarketBeat. Logos: Wikimedia Commons.',
      'Which of these 10 will you watch this week?',
      'Not investment advice. CFDs are high-risk; you may lose money.',
      '#onfin #stockmarket #nasdaq #techstocks #nvidia']
TG = {
 'en': ['<strong>About $1.2 trillion gone from US tech in a day: the 10 biggest losers</strong>', 'Fri 30 Oct, by market value lost:', L['en'],
        "Intel's weak outlook and worries about AI spending hit chip stocks (<a href=\"%s\">CNBC</a>, <a href=\"%s\">Investopedia</a>). The video shows where each one stands and what comes next." % (CNBC, YF),
        'Data: Yahoo Finance; value lost = price change × SEC share counts (OnFin calculation).',
        'Not investment advice. CFDs are high-risk; you may lose money.'],
 'ms': ['<strong>Kira-kira $1.2 trilion lenyap dari saham teknologi AS dalam sehari: 10 kerugian terbesar</strong>', 'Jumaat 30 Okt, mengikut nilai pasaran yang hilang:', L['ms'],
        'Unjuran lemah Intel dan kebimbangan perbelanjaan AI memukul saham cip (<a href="%s">CNBC</a>, <a href="%s">Investopedia</a>). Video menunjukkan kedudukan setiap satu dan apa seterusnya.' % (CNBC, YF),
        'Data: Yahoo Finance; nilai hilang = perubahan harga × saham SEC (kiraan OnFin).',
        'Bukan nasihat pelaburan. CFD berisiko tinggi; anda mungkin kehilangan wang.'],
 'ru': ['<strong>Техкомпании США потеряли около $1,2 трлн за день: 10 крупнейших потерь</strong>', 'Пятница, 30 окт, по потере капитализации:', L['ru'],
        'Слабый прогноз Intel и опасения насчёт расходов на ИИ ударили по чипмейкерам (<a href="%s">CNBC</a>, <a href="%s">Investopedia</a>). В видео: где сейчас каждая компания и что дальше.' % (CNBC, YF),
        'Данные: Yahoo Finance; потеря = изменение цены × число акций по SEC (расчёт OnFin).',
        'Не является инвестиционной рекомендацией. CFD относятся к высокорисковым инструментам; вы можете потерять деньги.'],
 'es': ['<strong>Cerca de $1.2 billones borrados de las tecnológicas de EE. UU. en un día: las 10 mayores pérdidas</strong>', 'Viernes 30 oct, por valor de mercado perdido:', L['es'],
        'El débil pronóstico de Intel y las dudas sobre el gasto en IA golpearon a los chips (<a href="%s">CNBC</a>, <a href="%s">Investopedia</a>). El video muestra dónde está cada una y qué sigue.' % (CNBC, YF),
        'Datos: Yahoo Finance; valor perdido = cambio de precio × acciones SEC (cálculo de OnFin).',
        'No es asesoramiento de inversión. Los CFD son de alto riesgo; puedes perder dinero.'],
}
def html(paras):
    out = []
    for p in paras:
        out += ['<p>%s</p>' % x for x in p.split('\n')] + ['<p></p>']
    return ''.join(out[:-1])
for l, p in TG.items():
    t = '\n\n'.join(p); assert not any(c in t for c in '–—!'), l
    print(l, len(re.sub('<[^>]+>', '', t)))
assert not any(c in '\n'.join(IG) for c in '–—!')
json.dump({'ig': html(IG), 'tg': {l: html(p) for l, p in TG.items()}}, open('caps.json', 'w'), ensure_ascii=False)
md = ['# Tech sell-off explainer reel (3 Nov 2026)', '',
      'Day: Friday 30 Oct 2026. Value lost per company = (30 Oct close - 29 Oct close) × shares outstanding from each company\'s latest SEC filing (cover-page shares; weighted average basic shares for multi-class companies). Total across 42 large US tech companies: about $%.0fB. With US-listed TSMC (ADR = 5 shares), ASML, Arm and Shopify: about $1.40T. Viral posts said $1.3T.' % S['total'],
      'Record highs and YTD: Yahoo Finance daily closes since 1990 (record = highest close; YTD vs 31 Dec 2025 close).',
      'Sources: CNBC 30 Oct (%s); Investopedia via Yahoo Finance 30 Oct (%s); Trading Economics 21 Oct (Hang Seng, CATL); Nvidia press release 28 Oct (17 Nov call); AMD IR (3 Nov); AppleInsider 6 Oct (Apple 2 Nov); Moscone Center / event listings (Ignite 17 to 20 Nov); AWS re:Invent listings (30 Nov to 4 Dec); Wall Street Horizon (Micron about 16 Dec, unconfirmed); earnings calendars (Broadcom about 10 Dec, Dell about 24 Nov, unconfirmed); Benzinga 30 Oct (BofA Vivek Arya); TipRanks 30 Oct (Susquehanna Christopher Rolland) and 22 Oct (consensus); CNBC 29 Oct (Cantor Thomas Blakey); NBC News 29 Oct (JPMorgan on Google search); MarketBeat 30 Oct (Amazon targets); CNBC 14 Oct (Barclays on Dell); iThinkDiff (JPMorgan on Apple); CNBC 30 Oct (Raymond James Matt Orton).' % (CNBC, YF),
      '', '## instagram', ''] + IG + ['']
for l, p in TG.items():
    md += ['## telegram-%s' % l, ''] + [re.sub('<a href="([^"]+)">([^<]+)</a>', r'\2', x).replace('<strong>', '').replace('</strong>', '') for x in p] + ['']
open('captions.md', 'w').write('\n\n'.join(x for x in md if x != '') + '\n')
