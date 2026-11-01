const {chromium}=require('playwright');const path=require('path');
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:398,height:900},deviceScaleFactor:2.5});
await p.goto('file://'+path.resolve('xcard.html'));await p.waitForTimeout(800);
await (await p.$('#card')).screenshot({path:'ev/x_card.png'});await b.close();console.log('ok');})();
