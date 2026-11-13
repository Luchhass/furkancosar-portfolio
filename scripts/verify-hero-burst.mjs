import { chromium } from "@playwright/test";
import assert from "node:assert/strict";
const browser = await chromium.launch({channel:"chrome"});
const errors=[];
try {
  for (const [width,height,touch] of [[1440,900,false],[390,844,true]]) {
    const context=await browser.newContext({viewport:{width,height},hasTouch:touch,isMobile:touch});
    const page=await context.newPage();
    page.on("pageerror",error=>errors.push(error.message));
    await page.goto("http://localhost:3000");
    await page.waitForFunction(()=>window.__pageIntroDoneForPath===location.pathname);
    await page.waitForTimeout(600);
    const canvas=page.locator(".ui-hero canvas").nth(1);
    await canvas.evaluate(el=>{
      const x=Math.floor(el.width*.8),y=Math.floor(el.height*.75);
      window.burstSample={x,y,baseline:Array.from(el.getContext("2d").getImageData(x,y,40,40).data)};
    });
    await page.locator(".ui-hero").evaluate(el=>{
      const r=el.getBoundingClientRect();
      const init={bubbles:true,clientX:r.width*.3,clientY:r.height*.35,button:0,pointerType:"mouse"};
      el.dispatchEvent(new PointerEvent("pointerdown",init));
      el.dispatchEvent(new PointerEvent("pointerup",init));
    });
    let maxDifference=0;
    for(let frame=0;frame<10;frame++) {
      await page.waitForTimeout(100);
      const difference=await canvas.evaluate(el=>{
        const {x,y,baseline}=window.burstSample;
        const data=el.getContext("2d").getImageData(x,y,40,40).data;
        return data.reduce((sum,value,index)=>sum+Math.abs(value-baseline[index]),0);
      });
      maxDifference=Math.max(maxDifference,difference);
    }
    assert.ok(maxDifference>100,"Wave must reach cells far from the click");
    await page.waitForTimeout(2000);
    const restored=await canvas.evaluate(el=>{
      const {x,y,baseline}=window.burstSample;
      const data=el.getContext("2d").getImageData(x,y,40,40).data;
      return data.every((value,index)=>value===baseline[index]);
    });
    assert.ok(restored,"Cells return exactly to their original geometry");
    console.log(width+": outward ripple and exact recovery passed ("+maxDifference+")");
    await context.close();
  }
  assert.deepEqual(errors,[]);
} finally {await browser.close();}
