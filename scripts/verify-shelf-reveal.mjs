import { chromium } from "@playwright/test";
import assert from "node:assert/strict";
const browser = await chromium.launch({channel:"chrome"});
try {
  for (const width of [1440,390]) {
    const page = await browser.newPage({viewport:{width,height:900}});
    await page.goto("http://localhost:3000/projects");
    await page.waitForFunction(()=>window.__pageIntroDoneForPath===location.pathname);
    const root = page.locator("#project-archive");
    const metrics = await root.evaluate(el=>{
      const viewport=el.querySelector(".shelf-viewport");
      return {start:scrollY+el.parentElement.getBoundingClientRect().top,
        range:el.parentElement.offsetHeight-el.offsetHeight,
        max:viewport.scrollWidth-viewport.clientWidth,
        next:el.querySelectorAll("[data-shelf-page]")[1].offsetLeft,
        viewport:viewport.clientWidth,
        card:el.querySelector(".shelf-card-slot").clientWidth};
    });
    const yFor=left=>metrics.start+metrics.range*(left/metrics.max)/1.08;
    await page.evaluate(y=>scrollTo(0,y),metrics.start+1);
    await page.waitForTimeout(1000);
    const target=root.locator("[data-shelf-page]").nth(1).locator("[data-project-card-reveal]").first();
    await page.evaluate(y=>scrollTo(0,y),yFor(metrics.next-metrics.viewport+metrics.card*.15));
    await page.waitForTimeout(650);
    assert.ok((await target.evaluate(el=>getComputedStyle(el).clipPath)).includes("100%"),"Must stay hidden at first visible sliver");
    const samples=await target.evaluate(async (el,y)=>{
      scrollTo(0,y);
      const samples=[];
      const start=performance.now();
      while(performance.now()-start<2000) {
        await new Promise(requestAnimationFrame);
        samples.push({
          clip: getComputedStyle(el).clipPath,
          visibility: getComputedStyle(el.querySelector("[data-project-card-reveal-inner]")).visibility,
          opacity: Number(getComputedStyle(el.querySelector("[data-project-card-reveal-inner]")).opacity),
          ready: el.dataset.revealReady,
          copy: [...el.querySelectorAll(".shelf-card-reveal")].map(node=>({
            opacity: Number(getComputedStyle(node).opacity),
            y: new DOMMatrix(getComputedStyle(node).transform).m42,
          })),
        });
      }
      return samples;
    },yFor(metrics.next-metrics.viewport+metrics.card*.75));
    const partial=samples.filter(({clip})=>clip!=="none"&&!clip.includes("100%")&&!clip.includes("inset(0% 0%"));
    assert.ok(partial.length>=3,"Wipe must visibly animate across multiple frames");
    assert.ok(partial.every(frame=>frame.visibility==="visible" && frame.opacity>.99 && frame.ready==="true"),
      "The actual card content must remain visible DURING the moving wipe, not pop in at its end");
    assert.ok(partial.every(frame=>frame.copy.every(item=>item.opacity===0)),
      "Text stays empty until the card wipe has finished");
    const onset=[0,1,2,3].map(index=>samples.findIndex(frame=>frame.copy[index].opacity>.01));
    assert.ok(onset.every((value,index)=>value>=0 && (index===0 || value>onset[index-1])),
      "Number, heading, description and link enter one after another");
    assert.ok(samples.at(-1).copy.every(item=>item.opacity>.99 && Math.abs(item.y)<.1),
      "Every item reaches its resting position");
    assert.equal(samples.at(-1).clip,"none","Wipe must finish fully open");
    assert.equal(await target.locator("[data-project-card-reveal-inner]").evaluate(el=>getComputedStyle(el).transform),"none");
    await page.evaluate(y=>scrollTo(0,y),metrics.start);
    await page.waitForTimeout(1200);
    assert.ok((await target.evaluate(el=>getComputedStyle(el).clipPath)).includes("100%"),"Exit restores the closed mask");
    console.log(width+": empty card wipe, strictly ordered text stagger, final positions and reverse passed");
    await page.close();
  }
} finally {await browser.close();}
