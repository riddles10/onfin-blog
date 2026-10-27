// node render_html.js jobs.json -> jobs: [{out, html, w, h}]  (screenshots [data-g-canvas])
const {chromium}=require('playwright');const fs=require('fs');const path=require('path');
(async()=>{const jobs=JSON.parse(fs.readFileSync(process.argv[2],'utf8'));
const b=await chromium.launch();const p=await b.newPage({viewport:{width:1080,height:1920}});
for(const j of jobs){fs.mkdirSync(path.dirname(j.out),{recursive:true});
 const tmp=j.out.replace(/\.png$/,'.html');fs.writeFileSync(tmp,j.html);
 await p.setViewportSize({width:j.w,height:j.h});await p.goto('file://'+tmp);
 await p.evaluate(()=>document.fonts.ready);await p.waitForTimeout(100);
 await (await p.$('[data-g-canvas]')).screenshot({path:j.out});fs.unlinkSync(tmp);}
await b.close();console.log('rendered',jobs.length);})();
