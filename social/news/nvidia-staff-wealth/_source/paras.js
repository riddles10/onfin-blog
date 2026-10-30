// node paras.js <url> : print paragraph texts (mobile UA)
const {chromium}=require('playwright');
(async()=>{const [url]=process.argv.slice(2);const b=await chromium.launch();
const c=await b.newContext({viewport:{width:430,height:900},userAgent:'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1'});
const p=await c.newPage();try{await p.goto(url,{waitUntil:'domcontentloaded',timeout:45000});}catch(e){}
await p.waitForTimeout(4000);
const t=await p.$$eval('p, li, blockquote',els=>els.map(e=>e.innerText.trim()).filter(x=>x.length>40));
t.forEach((x,i)=>console.log(i,x.slice(0,300)));await b.close();})();
