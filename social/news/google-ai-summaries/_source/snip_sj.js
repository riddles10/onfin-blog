// node snip2.js <url> <text> <out.png> [highlight1|highlight2...] : clean element screenshot (fixed bars hidden, key phrases highlighted)
const {chromium}=require('playwright');
(async()=>{const [url,text,out,hl]=process.argv.slice(2);
const b=await chromium.launch();const c=await b.newContext({viewport:{width:430,height:900},deviceScaleFactor:2.5,
 userAgent:'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1'});
const p=await c.newPage();
try{await p.goto(url,{waitUntil:'domcontentloaded',timeout:45000});}catch(e){console.log('goto',e.message)}
await p.waitForTimeout(4000);await p.evaluate(()=>{for(const el of document.querySelectorAll('.content-hidden'))el.style.setProperty('display','block','important');});
for(const t of ['Accept all','Accept All','I Accept','Accept','Agree','Got it']){try{const el=p.getByRole('button',{name:t}).first(); if(await el.isVisible({timeout:400})){await el.click({timeout:1500});await p.waitForTimeout(600);}}catch(e){}}
const loc=p.locator('p, li, blockquote').filter({hasText:text}).first();
await loc.scrollIntoViewIfNeeded({timeout:8000});await p.waitForTimeout(800);
await p.evaluate(()=>{for(const el of document.querySelectorAll('body *')){const s=getComputedStyle(el);if(s.position==='fixed'||s.position==='sticky')el.style.setProperty('display','none','important');}});
await loc.evaluate((target)=>{for(const el of document.querySelectorAll('body *')){if(el.children.length<12&&/Ask AI/.test(el.textContent||'')&&(el.textContent||'').length<80){let a=el;for(let i=0;i<8&&a;i++){if(a.contains(target))break;const s=getComputedStyle(a);if(['fixed','sticky','absolute'].includes(s.position)){a.style.setProperty('display','none','important');break;}a=a.parentElement;}}}});
if(hl){await loc.evaluate((el,terms)=>{for(const t of terms){el.innerHTML=el.innerHTML.split(t).join('<mark style="background:#d8ff3c;color:inherit;padding:0 2px;border-radius:3px">'+t+'</mark>');}},hl.split('|'));}
await loc.evaluate(el=>{el.style.padding='14px 16px';el.style.margin='0';el.style.background='#fff';});
await loc.evaluate(el=>{const r=el.getBoundingClientRect();window.scrollBy(0,r.top-120);});
await p.waitForTimeout(600);
const bb=await loc.boundingBox();
await p.screenshot({path:out,clip:{x:bb.x,y:bb.y,width:bb.width,height:bb.height}});
console.log('ok', out);await b.close();})();
