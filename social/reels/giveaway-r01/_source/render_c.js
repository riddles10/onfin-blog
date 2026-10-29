// node render_c.js <out_prefix> [p=fb]  -> <out_prefix>-1.png .. -5.png (1080x1350)
const {chromium}=require('playwright');const path=require('path');
(async()=>{const [pre,qs]=process.argv.slice(2);const br=await chromium.launch();const p=await br.newPage({viewport:{width:1080,height:1350}});
p.on('pageerror',e=>console.error('pageerror',e.message));
for(let s=1;s<=5;s++){await p.goto('file://'+path.join(__dirname,'carousel.html')+'?s='+s+(qs?'&'+qs:''));await p.evaluate(()=>window.READY);
 await p.screenshot({path:pre+'-'+s+'.png',clip:{x:0,y:0,width:1080,height:1350}});}
await br.close();console.log('ok');})();
