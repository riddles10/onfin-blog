// node edgar_reflow.js <file.htm> <jobs.json> <outdir> : [{start,end,from,to,hl,out}] -> outdir/<out>_<k>.png segments + manifest.json
const {chromium}=require('playwright');const fs=require('fs');
(async()=>{const [file,jf,od]=process.argv.slice(2);const jobs=JSON.parse(fs.readFileSync(jf,'utf8'));const man={};
const b=await chromium.launch();const p=await b.newPage({viewport:{width:1100,height:1600},deviceScaleFactor:3});
await p.goto('file://'+file,{waitUntil:'domcontentloaded',timeout:180000});await p.waitForTimeout(2000);
await p.evaluate(()=>{window.__L=[...document.querySelectorAll('div')].filter(d=>d.children.length&&[...d.children].every(c=>c.tagName==='FONT'));});
for(const j of jobs){
 await p.evaluate(n=>{window.__parts=n;},j.parts||2);
 const segs=await p.evaluate(({start,end,from,to,hl})=>{
  const norm=s=>s.replace(/\s+/g,' ');const L=window.__L;
  L.forEach(d=>d.style.visibility='');
  let i1=-1,i2=-1;for(let k=0;k<L.length;k++){if(!norm(L[k].textContent).includes(start))continue;for(let m=k;m<Math.min(L.length,k+12);m++){if(norm(L[m].textContent).includes(end)){i1=k;i2=m;break;}}if(i1>=0)break;}
  if(i1<0)return {err:'start/end'};
  const sel=L.slice(i1,i2+1);sel[0].scrollIntoView({block:'center'});
  const t0=sel[0].getBoundingClientRect().top-60,t9=sel[sel.length-1].getBoundingClientRect().bottom+60;
  for(const d of L){if(sel.includes(d))continue;const q=d.getBoundingClientRect();if(q.bottom>t0&&q.top<t9)d.style.visibility='hidden';}
  for(const t of hl){for(const ln of sel){let done=false;const w=document.createTreeWalker(ln,NodeFilter.SHOW_TEXT);let n;while((n=w.nextNode())){const i=n.nodeValue.indexOf(t);if(i<0)continue;
    const rg=document.createRange();rg.setStart(n,i);rg.setEnd(n,i+t.length);const m=document.createElement('mark');m.style.cssText='background:#d8ff3c;color:inherit;border-radius:2px';rg.surroundContents(m);done=true;break;}if(done)break;}}
  const chars=ln=>{const out=[];const w=document.createTreeWalker(ln,NodeFilter.SHOW_TEXT);let n;while((n=w.nextNode())){for(let i=0;i<n.nodeValue.length;i++)out.push([n,i]);}return out;};
  const rectOf=(n,i)=>{const r=document.createRange();r.setStart(n,i);r.setEnd(n,i+1);return r.getBoundingClientRect();};
  const res=[];
  sel.forEach((ln,k)=>{
   const cs=chars(ln);const txt=cs.map(([n,i])=>n.nodeValue[i]).join('');
   let a=0,z=cs.length-1;while(a<z&&/\s/.test(txt[a]))a++;while(z>a&&/\s/.test(txt[z]))z--;
   if(k===0&&from){const q=txt.indexOf(from);if(q>=0)a=q;}
   if(k===sel.length-1&&to){const q=txt.indexOf(to);if(q>=0)z=q+to.length-1;}
   const ra=rectOf(...cs[a]),rz=rectOf(...cs[z]);let top=1e9,bot=-1e9;
   for(const f of ln.children){const q=f.getBoundingClientRect();if(!f.textContent.trim())continue;top=Math.min(top,q.top);bot=Math.max(bot,q.bottom);}
   const x0=ra.left,x1=rz.right;const P=Math.max(1,Math.min(window.__parts||2,Math.round((x1-x0)/180)));
   const sp=[];for(let c=a+1;c<z;c++){if(txt[c]===' ')sp.push(rectOf(...cs[c]));}
   const cuts=[];for(let q=1;q<P;q++){const tx=x0+(x1-x0)*q/P;let best=null;for(const r of sp){if(cuts.length&&r.left<=cuts[cuts.length-1].right)continue;if(!best||Math.abs(r.left-tx)<Math.abs(best.left-tx))best=r;}if(best)cuts.push(best);}
   let sx=x0;for(const c of cuts){res.push({x:sx,y:top,w:c.left-sx,h:bot-top});sx=c.right;}res.push({x:sx,y:top,w:x1-sx,h:bot-top});
  });
  return res;},j);
 if(segs.err){console.log('MISS',j.out,segs.err);continue;}
 man[j.out]=[];
 for(let k=0;k<segs.length;k++){const s=segs[k];if(s.w<3||s.h<3)continue;const f=`${od}/${j.out}_${k}.png`;
  await p.screenshot({path:f,clip:{x:s.x-2,y:s.y-3,width:s.w+4,height:s.h+6}});man[j.out].push(f);}
 console.log('ok',j.out,segs.length);}
fs.writeFileSync(`${od}/manifest.json`,JSON.stringify(man));await b.close();})();
