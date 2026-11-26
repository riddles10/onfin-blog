const {chromium}=require('playwright');const fs=require('fs');
(async()=>{const [html,posts,out]=process.argv.slice(2);const P=JSON.parse(fs.readFileSync(posts));fs.mkdirSync(out,{recursive:true});
const b=await chromium.launch();const p=await b.newPage({viewport:{width:1080,height:1350},deviceScaleFactor:1});
await p.goto('file://'+html);await p.evaluate(()=>document.fonts.ready);
for(const [i,c] of P.entries()){await p.evaluate(c=>window.setCard(c),c);await p.waitForTimeout(100);await p.screenshot({path:`${out}/evr-${String(i+1).padStart(2,'0')}-${c.slug}.png`});}
await b.close();})();
