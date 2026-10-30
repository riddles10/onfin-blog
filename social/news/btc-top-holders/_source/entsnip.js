// node entsnip.js <bitcointreasuries entity url> <out_prefix>  -> <out>_head.png (logo + name), <out>_card.png (BTC holdings card), prints JSON {holdings, asof}
const {chromium}=require('playwright');
(async()=>{const [url,out]=process.argv.slice(2);
const b=await chromium.launch();const c=await b.newContext({viewport:{width:430,height:1400},deviceScaleFactor:2.5,
 userAgent:'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1',locale:'en-US'});
const p=await c.newPage();
try{await p.goto(url,{waitUntil:'domcontentloaded',timeout:45000});}catch(e){console.log('goto',e.message)}
await p.waitForTimeout(5000);
await p.evaluate(()=>{for(const el of document.querySelectorAll('body *')){const s=getComputedStyle(el);if(s.position==='fixed'||s.position==='sticky')el.style.setProperty('display','none','important');}});
const info=await p.evaluate(()=>{
  const lab=[...document.querySelectorAll('body *')].find(e=>e.children.length===0&&/^\s*BTC HOLDINGS\s*$/i.test(e.textContent));
  if(!lab) return {err:'no label'};
  let card=lab; while(card&&!/BTC VALUE/i.test(card.textContent)) card=card.parentElement;
  const rows=[...card.querySelectorAll('*')].filter(e=>e.children.length===0&&/^\s*(TOTAL COST BASIS|AVG COST|NET CHANGE|% OF 21M|SUPPLY)/i.test(e.textContent));
  const cands=[...card.querySelectorAll('*')].filter(e=>/^₿[\d,]+$/.test(e.textContent.replace(/\s/g,'')));const num=cands[cands.length-1];
  const asof=[...card.querySelectorAll('*')].find(e=>e.children.length===0&&/As of/i.test(e.textContent));
  if(num){num.style.background='#d8ff3c';num.style.borderRadius='8px';num.style.padding='0 8px';num.style.display='inline-block';}
  card.setAttribute('data-snip','card');
  const cr=card.getBoundingClientRect();
  let bottom=cr.bottom; if(rows.length){const r0=rows[0].closest('div');let rr=rows[0];while(rr.parentElement&&rr.parentElement!==card&&rr.parentElement.getBoundingClientRect().height<200)rr=rr.parentElement;bottom=rr.getBoundingClientRect().top;}
  const h1=document.querySelector('h1');let head=h1;while(head.parentElement&&head.parentElement.getBoundingClientRect().height<190)head=head.parentElement;
  const hr=head?head.getBoundingClientRect():h1.getBoundingClientRect();
  return {holdings:num?num.textContent.trim():null, asof:asof?asof.textContent.trim():null, card:[cr.left,cr.top+scrollY,cr.width,bottom-cr.top], head:[hr.left,hr.top+scrollY,hr.width,hr.height], title:h1?h1.textContent.trim():''};
});
if(info.err){console.log(JSON.stringify(info));await b.close();return;}
await p.evaluate(()=>window.scrollTo(0,0));await p.waitForTimeout(300);
const fullH=await p.evaluate(()=>document.documentElement.scrollHeight);
await p.setViewportSize({width:430,height:Math.min(fullH,4000)});await p.waitForTimeout(500);
const [hx,hy,hw,hh]=info.head;await p.screenshot({path:out+'_head.png',clip:{x:hx,y:hy,width:hw,height:hh}});
const [cx,cy,cw,ch]=info.card;await p.screenshot({path:out+'_card.png',clip:{x:cx,y:cy,width:cw,height:ch}});
console.log(JSON.stringify({holdings:info.holdings,asof:info.asof,title:info.title}));await b.close();})();
