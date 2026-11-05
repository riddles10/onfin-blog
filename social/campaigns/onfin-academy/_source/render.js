// Render HTML jobs to images. Usage: node render.js jobs.json   (jobs: [{html, out, w, h, scale?}])
const {chromium} = require('playwright'); const fs = require('fs'); const path = require('path');
(async () => {
  const jobs = JSON.parse(fs.readFileSync(process.argv[2], 'utf8'));
  const b = await chromium.launch();
  const ctx = await b.newContext({deviceScaleFactor: 1});
  const p = await ctx.newPage();
  for (const j of jobs) {
    await p.setViewportSize({width: j.w, height: j.h});
    await p.goto('file://' + j.html);
    await p.evaluate(() => document.fonts.ready);
    await p.waitForTimeout(150);
    fs.mkdirSync(path.dirname(j.out), {recursive: true});
    const opts = {path: j.out, clip: {x: 0, y: 0, width: j.w, height: j.h}};
    if (j.out.endsWith('.jpg')) opts.type = 'jpeg', opts.quality = 92;
    if (j.transparent) opts.omitBackground = true;
    await p.screenshot(opts);
  }
  await b.close(); console.log('rendered', jobs.length);
})();
