import json, random
random.seed(7)
L="#B4EA10"; R="#ff5c5c"; G="rgba(255,255,255,.85)"
def poly(pts, col, w=8): return '<polyline points="%s" fill="none" stroke="%s" stroke-width="%d" stroke-linejoin="round" stroke-linecap="round"/>' % (" ".join("%.0f,%.0f" % p for p in pts), col, w)
def txt(x,y,s,col="#fff",size=28,anchor="middle",font="MS"): return '<text x="%d" y="%d" fill="%s" font-size="%d" font-family="%s" text-anchor="%s">%s</text>'%(x,y,col,size,font,anchor,s)
posts=[]
# 1 the equity curve
s1=poly([(70,480),(890,150)],L,10)+'<circle cx="890" cy="150" r="14" fill="%s"/>'%L
pts=[];random.seed(11);y=430
for i in range(60):
    x=70+i*(820/59); target=330-10*i/59; y+= (target-y)*0.25 + random.uniform(-38,38); y=max(150,min(500,y)); pts.append((x,y))
s2=poly(pts,G,6)+'<circle cx="%.0f" cy="%.0f" r="12" fill="%s"/>'%(pts[-1][0],pts[-1][1],L)
posts.append(dict(slug="curve",n1="your account",n2="your account",s1=s1,s2=s2))
# 2 time spent
def bars(parts,y0=200):
    out="";x=70;tot=820
    for lab,frac,col in parts:
        w=tot*frac; out+='<rect x="%.0f" y="%d" width="%.0f" height="150" rx="12" fill="%s"/>'%(x,y0,w-6,col)
        if frac>0.08: out+=txt(x+w/2,y0+215,lab,"rgba(255,255,255,.85)",28)
        x+=w
    return out
s1=bars([("clicking buy",1.0,L)])
s2=bars([("waiting",0.62,"rgba(255,255,255,.28)"),("reviewing",0.3,"rgba(255,255,255,.5)"),("",0.08,L)])+txt(870,195,"clicking buy","#B4EA10",24,"end")
posts.append(dict(slug="time",n1="a trader's day",n2="a trader's day",s1=s1,s2=s2))
# 3 wins and losses (candles)
def candles(seq,y0=330):
    out="";x=110
    for up,h in seq:
        col=L if up else R
        top=y0-h if up else y0
        out+='<rect x="%d" y="%d" width="52" height="%d" rx="6" fill="%s"/>'%(x,top,h,col); x+=76
    return out
s1=candles([(1,170)]*10)
s2=candles([(1,170),(0,50),(0,45),(1,120),(0,55),(0,40),(0,50),(1,190),(0,45),(1,95)])
posts.append(dict(slug="wins",n1="every trade",n2="small losses, bigger wins",s1=s1,s2=s2))
# 4 news spike
base=[(70,330),(300,330),(420,330)]
s1=poly(base+[(470,330),(890,170)],L,8)+'<line x1="420" y1="120" x2="420" y2="520" stroke="rgba(255,255,255,.25)" stroke-dasharray="10 10" stroke-width="3"/>'+txt(430,530,"news","rgba(255,255,255,.6)",24,"start")
s2=poly(base+[(440,140),(455,500),(470,180),(490,470),(520,300),(600,360),(700,320),(890,340)],G,6)+'<line x1="420" y1="120" x2="420" y2="520" stroke="rgba(255,255,255,.25)" stroke-dasharray="10 10" stroke-width="3"/>'+'<line x1="70" y1="420" x2="890" y2="420" stroke="%s" stroke-width="4"/>'%R+txt(880,445,"your stop","%s"%R,24,"end")+txt(430,530,"news","rgba(255,255,255,.6)",24,"start")
posts.append(dict(slug="news",n1="trading the news",n2="trading the news",s1=s1,s2=s2))
json.dump(posts,open("posts.json","w"))
