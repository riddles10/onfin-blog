// node edgar_snip2.js <file.htm> <jobs.json> : jobs [{start,end,out,hl:[...]}]; start/end must each sit within one printed line
const {chromium}=require('playwright');const fs=require('fs');
(async()=>{const [file,jf]=process.argv.slice(2);const jobs=JSON.parse(fs.readFileSync(jf,'utf8'));
const b=await chromium.launch();const p=await b.newPage({viewport:{width:1100,height:1600},deviceScaleFactor:2.2});
await p.goto('file://'+file,{waitUntil:'domcontentloaded',timeout:180000});await p.waitForTimeout(2000);
await p.evaluate(()=>{window.__L=[...document.querySelectorAll('div')].filter(d=>d.children.length&&[...d.children].every(c=>c.tagName==='FONT'));});
for(const j of jobs){
 const r=await p.evaluate(({start,end,hl})=>{
  const norm=s=>s.replace(/\s+/g,' ');const L=window.__L;
  const i1=L.findIndex(d=>norm(d.textContent).includes(start));if(i1<0)return {err:'start'};
  let i2=i1;if(end){i2=L.findIndex((d,k)=>k>=i1&&norm(d.textContent).includes(end));if(i2<0)return {err:'end'};}
  const sel=L.slice(i1,i2+1);sel[0].scrollIntoView({block:'center'});L.forEach(d=>d.style.visibility='');const t0=sel[0].getBoundingClientRect().top-40,t9=sel[sel.length-1].getBoundingClientRect().bottom+40;for(const d of L){if(sel.includes(d))continue;const q=d.getBoundingClientRect();if(q.bottom>t0&&q.top<t9)d.style.visibility='hidden';}
  for(const t of hl){for(const ln of sel){let done=false;for(const f of ln.children){const n=f.firstChild;if(!n||n.nodeType!==3)continue;const i=n.nodeValue.indexOf(t);if(i<0)continue;
    const rg=document.createRange();rg.setStart(n,i);rg.setEnd(n,i+t.length);const m=document.createElement('mark');m.style.cssText='background:#d8ff3c;color:inherit;border-radius:2px';rg.surroundContents(m);done=true;break;}if(done)break;}}
  let x1=1e9,x2=-1e9,y1=1e9,y2=-1e9;for(const ln of sel)for(const f of ln.children){const q=f.getBoundingClientRect();if(!f.textContent.trim())continue;x1=Math.min(x1,q.left);x2=Math.max(x2,q.right);y1=Math.min(y1,q.top);y2=Math.max(y2,q.bottom);}
  return {x:x1,y:y1,w:x2-x1,h:y2-y1,n:sel.length};},j);
 if(r.err){console.log('MISS',j.out,r.err);continue;}
 await p.screenshot({path:j.out,clip:{x:Math.max(0,r.x-14),y:Math.max(0,r.y-10),width:r.w+28,height:r.h+20}});console.log('ok',j.out,JSON.stringify(r));}
await b.close();})();
