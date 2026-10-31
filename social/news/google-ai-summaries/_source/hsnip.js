// node hsnip.js <url> <out.png> [highlight] : BBC-style article headline + timestamp, fixed bars hidden
const {chromium}=require('playwright');
(async()=>{const [url,out,hl]=process.argv.slice(2);
const b=await chromium.launch();const c=await b.newContext({viewport:{width:430,height:900},deviceScaleFactor:2.5,
 userAgent:'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1'});
const p=await c.newPage();try{await p.goto(url,{waitUntil:'domcontentloaded',timeout:45000});}catch(e){}
await p.waitForTimeout(4000);
await p.evaluate(()=>{for(const el of document.querySelectorAll('body *')){const s=getComputedStyle(el);if(s.position==='fixed'||s.position==='sticky')el.style.setProperty('display','none','important');}});
const h1=p.locator('h1').first();
if(hl){await h1.evaluate((el,t)=>{el.innerHTML=el.innerHTML.split(t).join('<mark style="background:#d8ff3c;color:inherit;padding:0 2px;border-radius:3px">'+t+'</mark>');},hl);}
await h1.evaluate(el=>{const r=el.getBoundingClientRect();window.scrollBy(0,r.top-160);});await p.waitForTimeout(600);
const box=await p.evaluate(()=>{const h=document.querySelector('h1').getBoundingClientRect();const t=document.querySelector('time');let tb=t?t.getBoundingClientRect():h;
 if(tb.top-h.bottom>200)tb=h;return {x:Math.min(h.left,tb.left)-14,y:Math.min(h.top,tb.top)-14,r:Math.max(h.right,tb.right)+14,b:Math.max(h.bottom,tb.bottom)+14};});
await p.screenshot({path:out,clip:{x:Math.max(0,box.x),y:box.y,width:Math.min(430,box.r)-Math.max(0,box.x),height:box.b-box.y}});
console.log('ok',out);await b.close();})();
