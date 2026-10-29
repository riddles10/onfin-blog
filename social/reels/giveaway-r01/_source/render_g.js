// node render_g.js <out_dir> [t1,t2,...|-] [query]   ('-' or no list: every frame at 30fps)
// node render_g.js cover <out.png> [query]           query e.g. "r=02" (round file) and/or "p=fb" (Facebook copy), joined with &
const {chromium}=require('playwright');const fs=require('fs');const path=require('path');
(async()=>{const [a,b,qs]=process.argv.slice(2);const br=await chromium.launch();const p=await br.newPage({viewport:{width:1080,height:1920}});
p.on('pageerror',e=>console.error('pageerror',e.message));
const cov=a==='cover';const q=[cov?'cover=1':'',qs||''].filter(Boolean).join('&');
await p.goto('file://'+path.join(__dirname,'give.html')+(q?'?'+q:''));await p.evaluate(()=>window.REEL_READY);
if(cov){await p.evaluate(()=>window.setT(0));await p.screenshot({path:b});await br.close();return;}
fs.mkdirSync(a,{recursive:true});const dur=await p.evaluate(()=>window.REEL_DUR);
const ts=b&&b!=='-'?b.split(',').map(Number):Array.from({length:Math.round(dur*30)},(_,i)=>i/30);
for(let i=0;i<ts.length;i++){await p.evaluate(t=>window.setT(t),ts[i]);await p.screenshot({path:path.join(a,String(i).padStart(4,'0')+'.png'),clip:{x:0,y:0,width:1080,height:1920}});}
console.log('frames',ts.length,'dur',dur);await br.close();})();
