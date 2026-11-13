import { chromium } from "@playwright/test";
import assert from "node:assert/strict";
const browser=await chromium.launch({channel:"chrome"});
const errors=[];
try {
  for(const [width,height,count] of [[1440,900,6],[1024,768,6],[768,1024,4],[390,844,2],[360,667,2],[844,390,4]]) {
    const page=await browser.newPage({viewport:{width,height},reducedMotion:"reduce"});
    page.on("pageerror",e=>errors.push(e.message));
    await page.goto("http://localhost:3000/projects");
    const root=page.locator("#project-archive");
    await page.waitForTimeout(600);
    assert.equal(await root.locator("input, select, .shelf-controls").count(),0);
    assert.equal(await root.locator(".ui-section-title").count(),0);
    const metrics=await root.evaluate(el=>{
      const spacer=el.parentElement;
      const viewport=el.querySelector(".shelf-viewport");
      return {start:scrollY+spacer.getBoundingClientRect().top,range:spacer.offsetHeight-el.offsetHeight,
        max:viewport.scrollWidth-viewport.clientWidth,height:el.offsetHeight};
    });
    assert.equal(metrics.height,height);
    assert.ok(metrics.range>metrics.max);
    for(const progress of [0,.25,.5,.75,.94]) {
      await page.evaluate(y=>scrollTo(0,y),metrics.start+metrics.range*progress);
      await page.waitForTimeout(180);
      const state=await root.evaluate(el=>{
        const viewport=el.querySelector(".shelf-viewport");
        const cards=[...el.querySelectorAll("[data-shelf-page]:not([inert]) .shelf-card")];
        const page=cards[0].closest("[data-shelf-page]");
        return {top:el.getBoundingClientRect().top,left:viewport.scrollLeft,
          count:cards.length,overflow:page.scrollHeight>page.clientHeight+2,
          nextTop:el.parentElement.nextElementSibling.getBoundingClientRect().top};
      });
      assert.ok(Math.abs(state.top)<3,"Shelf must stay pinned");
      assert.ok(Math.abs(state.left-metrics.max*Math.min(1,progress*1.08))<4,"Vertical input must drive horizontal travel");
      assert.ok(state.count<=count);
      assert.equal(state.overflow,false);
      assert.ok(state.nextTop>=height-3,"Next section cannot enter before shelf completes");
    }
    const last=root.locator("[data-shelf-page]:not([inert]) .shelf-card").last();
    await last.click();
    await page.getByRole("dialog").waitFor();
    await page.keyboard.press("Escape");
    await page.getByRole("dialog").waitFor({state:"detached"});
    await page.evaluate(y=>scrollTo(0,y),metrics.start+metrics.range+100);
    await page.waitForTimeout(150);
    assert.ok(await root.evaluate(el=>el.getBoundingClientRect().top)<-90,"Shelf releases after the last projects");
    await page.evaluate(y=>scrollTo(0,y),metrics.start+metrics.range*.5);
    await page.waitForTimeout(150);
    assert.ok(Math.abs(await root.evaluate(el=>el.getBoundingClientRect().top))<3,"Reverse scroll pins again");
    console.log(width+": "+count+"-card grid, full horizontal travel, pin/release, reverse and modal passed");
    await page.close();
  }
  assert.deepEqual(errors,[]);
} finally {await browser.close();}
