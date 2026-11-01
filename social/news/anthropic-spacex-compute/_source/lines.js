// node lines.js <file.htm> <needle> [n] : print the line divs around a needle (same line model as edgar_reflow.js)
const {chromium}=require('playwright');
(async()=>{const [file,needle,n]=process.argv.slice(2);const b=await chromium.launch();const p=await b.newPage();
await p.goto('file://'+file,{waitUntil:'domcontentloaded',timeout:180000});
const out=await p.evaluate(({needle,n})=>{const L=[...document.querySelectorAll('div')].filter(d=>d.children.length&&[...d.children].every(c=>c.tagName==='FONT'));
const norm=s=>s.replace(/\s+/g,' ');const i=L.findIndex(d=>norm(d.textContent).includes(needle));if(i<0)return ['NOTFOUND'];
return L.slice(Math.max(0,i-2),i+(+n||14)).map((d,k)=>k+': '+norm(d.textContent));},{needle,n});
console.log(out.join('\n'));await b.close();})();
