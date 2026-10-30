// node trsnip.js <url> <row text> <out.png> : header row + the matching table row, BTC cell highlighted
const {chromium}=require('playwright');
(async()=>{const [url,text,out]=process.argv.slice(2);
const b=await chromium.launch();const c=await b.newContext({viewport:{width:560,height:1400},deviceScaleFactor:2.5,locale:'en-US',
 userAgent:'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1'});
const p=await c.newPage();try{await p.goto(url,{waitUntil:'domcontentloaded',timeout:45000});}catch(e){console.log('goto',e.message)}
await p.waitForTimeout(5000);
const ok=await p.evaluate((text)=>{
  const row=[...document.querySelectorAll('tbody tr')].find(r=>[...r.querySelectorAll('td')].some(td=>td.textContent.trim()===text||td.textContent.trim().startsWith(text+' ')));
  if(!row) return false;
  const table=row.closest('table');const head=table.querySelector('thead tr');
  const t=table.cloneNode(false);const th=document.createElement('thead');th.appendChild(head.cloneNode(true));
  const tb=document.createElement('tbody');const r2=row.cloneNode(true);tb.appendChild(r2);t.appendChild(th);t.appendChild(tb);
  for(const td of r2.querySelectorAll('td')){if(/^₿[\d,]{4,}$/.test(td.textContent.replace(/\s/g,''))){td.style.background='#d8ff3c';}}
  const box=document.createElement('div');box.id='snipbox';box.style.cssText='background:#fff;padding:10px 14px;width:540px;font-size:16px';box.appendChild(t);
  document.body.innerHTML='';document.body.appendChild(box);document.body.style.background='#fff';return true;},text);
if(!ok){console.log('row not found');await b.close();return;}
await p.waitForTimeout(500);await p.locator('#snipbox').screenshot({path:out});console.log('ok',out);await b.close();})();
