// node render2.js <ep> <lang> <out_dir> [from to]   |   node render2.js <ep> <lang> <stills_dir> t1,t2,...
const {chromium}=require('playwright');const fs=require('fs');const path=require('path');
(async()=>{const [ep,lang,out,a,b]=process.argv.slice(2);fs.mkdirSync(out,{recursive:true});
const br=await chromium.launch();const p=await br.newPage({viewport:{width:1080,height:1920}});
p.on('pageerror',e=>console.error('pageerror',e.message));
await p.goto('file://'+path.join(__dirname,'myth2.html')+'?ep='+ep+'&lang='+lang);await p.evaluate(()=>window.REEL_READY);
const dur=await p.evaluate(()=>window.REEL_DUR);
let ts; if(a&&a.includes(',')) ts=a.split(',').map(Number).map((t,i)=>[i,t]); else {const N=Math.round(dur*30);const f=a?+a:0,to=b?Math.min(+b,N):N;ts=[];for(let i=f;i<to;i++)ts.push([i,i/30]);}
const still=a&&a.includes(',');
for(const [i,t] of ts){const fp=path.join(out,String(i).padStart(4,'0')+'.png');if(!still&&fs.existsSync(fp))continue;
 await p.evaluate(t=>window.setT(t),t);await p.screenshot({path:fp,clip:{x:0,y:0,width:1080,height:1920}});}
console.log(ep,lang,'frames',ts.length,'dur',dur);await br.close();})();
