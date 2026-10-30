// node card.js '{"hook": "...", "box_h": 660, "card": "card.png", "wm": "wm.png"}'  -> prints {"video_y": N}
const {chromium}=require('playwright');const path=require('path');
(async()=>{const o=JSON.parse(process.argv[2]);const br=await chromium.launch();const p=await br.newPage({viewport:{width:1080,height:1920}});
await p.goto('file://'+path.join(__dirname,'card.html'));await p.evaluate(()=>document.fonts.ready);
const geo=await p.evaluate(({hook,box_h})=>{
  document.getElementById('hook').textContent=hook;
  const card=document.getElementById('card');const ch=card.getBoundingClientRect().height;
  // video box sits dead centre of the 1920 frame; the hook card sits directly above it
  const gap=44,vy=Math.round((1920-box_h)/2);const top=Math.max(60,vy-gap-Math.round(ch));
  card.style.top=top+'px';return {video_y:Math.max(vy,top+Math.round(ch)+gap)};
},{hook:o.hook,box_h:o.box_h});
await p.screenshot({path:o.card});
await p.evaluate(({vy,box_h})=>{document.body.className='wm';document.documentElement.style.background='transparent';document.getElementById('card').style.display='none';
  const w=document.getElementById('wm');w.style.display='block';w.style.top=(vy+Math.round(box_h*0.66)+44)+'px';},{vy:geo.video_y,box_h:o.box_h});
await p.screenshot({path:o.wm,omitBackground:true});
console.log(JSON.stringify(geo));await br.close();})();
