// node render.js card.html outdir "label1" "label2" [secs]
const {chromium}=require('playwright');const fs=require('fs');
(async()=>{const [html,out,l1,l2,secs]=process.argv.slice(2);const dur=parseFloat(secs||'7');fs.mkdirSync(out,{recursive:true});
const b=await chromium.launch();const p=await b.newPage({viewport:{width:1080,height:1920}});
await p.goto('file://'+html);await p.evaluate(([a,c])=>window.setCard(a,c),[l1,l2]);await p.evaluate(()=>document.fonts.ready);
const n=Math.round(dur*30);for(let i=0;i<n;i++){await p.evaluate(t=>window.draw(t),i/30);await p.screenshot({path:`${out}/f${String(i).padStart(4,'0')}.jpg`,type:'jpeg',quality:92});}
await b.close();console.log('frames',n);})();
