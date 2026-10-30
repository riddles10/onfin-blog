// node shot.js <url> <out.png> [height]  -> mobile screenshot of the top of an article, cookie banners dismissed when possible
const {chromium}=require('playwright');
(async()=>{const [url,out,hh]=process.argv.slice(2);
const b=await chromium.launch();const c=await b.newContext({viewport:{width:430,height:parseInt(hh||'900')},deviceScaleFactor:2.5,
 userAgent:'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1',locale:'en-US'});
const p=await c.newPage();
try{await p.goto(url,{waitUntil:'domcontentloaded',timeout:45000});}catch(e){console.log('goto',e.message)}
await p.waitForTimeout(4000);
for(const t of ['Accept all','Accept All','I Accept','Accept','Agree','I agree','Got it','OK','Continue','Close']){
 try{const el=p.getByRole('button',{name:t,exact:false}).first(); if(await el.isVisible({timeout:500})){await el.click({timeout:1500});await p.waitForTimeout(800);}}catch(e){}}
await p.waitForTimeout(1500);
await p.screenshot({path:out});
console.log('title:',await p.title());await b.close();})();
