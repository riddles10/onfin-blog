// node snip3.js <url> <text> <out.png> [hl1|hl2] [vw]: screenshot of the smallest block element containing <text>, fixed bars hidden, phrases highlighted
const {chromium}=require('playwright');
(async()=>{const [url,text,out,hl,vw]=process.argv.slice(2);
const b=await chromium.launch();const c=await b.newContext({viewport:{width:parseInt(vw||'430'),height:900},deviceScaleFactor:2.5,
 userAgent:'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1'});
const p=await c.newPage();
try{await p.goto(url,{waitUntil:'domcontentloaded',timeout:45000});}catch(e){console.log('goto',e.message)}
await p.waitForTimeout(5000);
for(const t of ['Accept all','Accept All','I Accept','Accept','Agree','Got it']){try{const el=p.getByRole('button',{name:t}).first(); if(await el.isVisible({timeout:400})){await el.click({timeout:1500});await p.waitForTimeout(600);}}catch(e){}}
const ok=await p.evaluate(([text,hl])=>{
  const cands=[...document.querySelectorAll('p,li,blockquote,h1,h2,div,span')].filter(e=>(e.innerText||'').includes(text)&&e.offsetHeight>0);
  if(!cands.length) return false;
  cands.sort((a,b)=>a.innerText.length-b.innerText.length); let el=cands[0];
  while(el.parentElement && getComputedStyle(el).display==='inline') el=el.parentElement;
  for(const x of document.querySelectorAll('body *')){const s=getComputedStyle(x);if((s.position==='fixed'||s.position==='sticky')&&!x.contains(el))x.style.setProperty('display','none','important');}
  if(hl){for(const t of hl.split('|')){el.innerHTML=el.innerHTML.split(t).join('<mark style="background:#d8ff3c;color:inherit;padding:0 2px;border-radius:3px">'+t+'</mark>');}}
  el.style.padding='14px 16px';el.style.margin='0';el.style.background='#fff';el.setAttribute('data-snip','1');
  el.scrollIntoView({block:'center'});return true;},[text,hl]);
if(!ok){console.log('NOT FOUND',text);await b.close();process.exit(2);}
await p.waitForTimeout(1200);
const loc=p.locator('[data-snip]');const bb=await loc.boundingBox();
await p.screenshot({path:out,clip:{x:bb.x,y:bb.y,width:bb.width,height:bb.height}});
console.log('ok',out,Math.round(bb.width),Math.round(bb.height));await b.close();})();
