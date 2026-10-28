// node render_range.js <out_dir> <from> <to>   renders frames [from, to) at 30fps, skipping frames already on disk
const {chromium}=require('playwright');const fs=require('fs');const path=require('path');
(async()=>{const [out,from,to]=[process.argv[2],+process.argv[3],+process.argv[4]];fs.mkdirSync(out,{recursive:true});
const b=await chromium.launch();const p=await b.newPage({viewport:{width:1080,height:1920}});
p.on('pageerror',e=>console.error('pageerror',e.message));
await p.goto('file://'+path.join(__dirname,'reel2.html'));await p.evaluate(()=>window.REEL_READY);
for(let i=from;i<to;i++){const f=path.join(out,String(i).padStart(4,'0')+'.png');if(fs.existsSync(f))continue;
 await p.evaluate(t=>window.setT(t),i/30);await p.screenshot({path:f,clip:{x:0,y:0,width:1080,height:1920}});}
console.log('done',from,to);await b.close();})();
