const {chromium}=require('playwright');const path=require('path');
(async()=>{const jobs=JSON.parse(require('fs').readFileSync(process.argv[2]));const only=process.argv[3];const br=await chromium.launch();
const p=await br.newPage({viewport:{width:1080,height:1350}});
for(const j of jobs){ if(only && !j.out.includes(only)) continue;
await p.goto('about:blank');await p.goto('file://'+path.join(__dirname,'slides.html')+'#'+encodeURIComponent(JSON.stringify(j)));
await p.evaluate(()=>document.fonts.ready);await p.waitForTimeout(250);
const ov=await p.evaluate(()=>{const w=document.querySelector('.wrap');if(!w)return 0;let m=0;for(const e of w.querySelectorAll('*')){const r=e.getBoundingClientRect();if(r.bottom>m)m=r.bottom}return Math.round(m)});
await p.screenshot({path:path.join(__dirname,j.out)});if(ov>1300)console.log('OVERFLOW',j.out,ov);}
await br.close();console.log('done');})();
