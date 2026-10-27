// node render.js jobs.json  -> jobs: [{out, name, props, scale?}]
const {chromium}=require('playwright');const fs=require('fs');const path=require('path');
const LIB=process.env.LIB;
(async()=>{const jobs=JSON.parse(fs.readFileSync(process.argv[2],'utf8'));
const b=await chromium.launch();const p=await b.newPage({viewport:{width:1080,height:1920}});
await p.goto('file://'+path.join(LIB,'render.html'));await p.waitForFunction(()=>window.OF_READY);
for(const j of jobs){fs.mkdirSync(path.dirname(j.out),{recursive:true});
 await p.evaluate(([n,pr])=>window.ofRender(n,pr),[j.name,j.props]);await p.waitForTimeout(150);
 const el=await p.$('[data-of-canvas]');if(!el){console.error('no canvas',j.name);continue;}
 await el.screenshot({path:j.out});}
const fams=await p.evaluate(()=>[...document.fonts].filter(f=>f.status==='loaded').map(f=>f.family+' '+f.weight));
console.log('rendered',jobs.length,'fonts loaded:',[...new Set(fams)].join(', '));await b.close();})();
