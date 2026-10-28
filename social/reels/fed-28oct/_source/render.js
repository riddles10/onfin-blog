// node render.js <out_dir> [t1,t2,...]   (no list: every frame at 30fps)
const {chromium}=require('playwright');const fs=require('fs');const path=require('path');
(async()=>{const out=process.argv[2];fs.mkdirSync(out,{recursive:true});
const b=await chromium.launch();const p=await b.newPage({viewport:{width:1080,height:1920}});
p.on('pageerror',e=>console.error('pageerror',e.message));
await p.goto('file://'+path.join(__dirname,'reel.html'));await p.evaluate(()=>window.REEL_READY);
const dur=await p.evaluate(()=>window.REEL_DUR);
const ts=process.argv[3]?process.argv[3].split(',').map(Number):Array.from({length:Math.round(dur*30)},(_,i)=>i/30);
for(let i=0;i<ts.length;i++){await p.evaluate(t=>window.setT(t),ts[i]);
 await p.screenshot({path:path.join(out,String(i).padStart(4,'0')+'.png'),clip:{x:0,y:0,width:1080,height:1920}});}
console.log('frames',ts.length);await b.close();})();
