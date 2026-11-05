// node shot.js jobs.json : renders each {html, out, w, h, transparent} with Chromium; prints [{out, layout}] where layout = window.layout() if the page defines it
const {chromium} = require('playwright'); const fs = require('fs');
(async () => {
  const jobs = JSON.parse(fs.readFileSync(process.argv[2], 'utf8'));
  const br = await chromium.launch(); const res = [];
  for (const j of jobs) {
    const p = await br.newPage({viewport: {width: j.w, height: j.h}});
    await p.goto('file://' + j.html); await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(150);
    const layout = await p.evaluate(() => (window.layout ? window.layout() : null));
    await p.screenshot({path: j.out, omitBackground: !!j.transparent});
    res.push({out: j.out, layout}); await p.close();
  }
  console.log(JSON.stringify(res)); await br.close();
})();
