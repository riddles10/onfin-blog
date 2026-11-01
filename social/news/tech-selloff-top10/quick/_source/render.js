const {chromium}=require('playwright');const path=require('path');
(async()=>{const jobs=JSON.parse(require('fs').readFileSync(process.argv[2]));const br=await chromium.launch();
for(const j of jobs){const p=await br.newPage({viewport:{width:1080,height:j.h}});
await p.goto('file://'+path.join(__dirname,'bars.html')+'#'+encodeURIComponent(JSON.stringify(j)));
await p.evaluate(()=>document.fonts.ready);await p.waitForTimeout(400);
const ov=await p.evaluate(()=>{const w=document.getElementById('wrap').getBoundingClientRect();return w.bottom});
await p.screenshot({path:j.out});console.log(j.out,'content bottom',Math.round(ov),'of',j.h);await p.close();}
await br.close();})();
