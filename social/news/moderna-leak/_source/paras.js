// node paras.js <url> <out.txt> : dump paragraph texts
const {chromium}=require('playwright');
(async()=>{const [url,out]=process.argv.slice(2);const b=await chromium.launch();const p=await (await b.newContext({userAgent:'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1'})).newPage();
try{await p.goto(url,{waitUntil:'domcontentloaded',timeout:45000});}catch(e){}
await p.waitForTimeout(4000);
const t=await p.evaluate(()=>[...document.querySelectorAll('h1, p, li, blockquote')].map(e=>e.innerText.trim()).filter(x=>x.length>40).join('\n\n'));
require('fs').writeFileSync(out,t);await b.close();})();
