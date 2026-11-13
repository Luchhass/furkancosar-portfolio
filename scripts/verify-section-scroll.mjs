import { chromium } from "@playwright/test";
import assert from "node:assert/strict";

const browser = await chromium.launch({ channel: "chrome" });
const errors = [];
try {
  for (const [width, height, touch] of [[1440,900,false],[768,1024,true],[390,844,true]]) {
    if (process.env.TEST_WIDTH && Number(process.env.TEST_WIDTH)!==width) continue;
    const context = await browser.newContext({viewport:{width,height},hasTouch:touch,isMobile:touch});
    const page = await context.newPage();
    page.on("pageerror", error => errors.push(error.message));
    for (const route of ["/", "/about", "/projects", "/contact"]) {
      if (process.env.TEST_ROUTE && process.env.TEST_ROUTE!==route) continue;
      await page.goto("http://localhost:3000"+route);
      await page.waitForFunction(() => window.__pageIntroDoneForPath === location.pathname);
      await page.waitForTimeout(600);
      assert.ok(await page.locator("html").evaluate(el=>el.classList.contains("lenis")), "Smooth scroll mounted");
      const anchor = page.locator("main .ui-screen").first();
      const top = await anchor.evaluate(el=>scrollY+el.getBoundingClientRect().top);
      await page.evaluate(y=>scrollTo(0,y),top-130);
      await page.waitForTimeout(100);
      await page.mouse.move(10,height/2);
      await page.mouse.wheel(0,35);
      await page.waitForTimeout(1400);
      const approach = await page.evaluate(()=>scrollY);
      assert.ok(approach > top-130 && approach < top-50, "Approach adds resistance");
      await page.waitForTimeout(600);
      assert.ok(Math.abs(await page.evaluate(()=>scrollY)-approach)<2,"Stopping never triggers a later alignment correction");
      for (let step=0;step<12;step++) {
        if (Math.abs(await page.evaluate(()=>scrollY)-top)<3) break;
        await page.mouse.wheel(0,80);
        await page.waitForTimeout(650);
      }
      const actual = await page.evaluate(()=>scrollY);
      if (Math.abs(actual-top)>=3) console.log(await page.evaluate(()=>({html:document.documentElement.className,bodyOverflow:document.body.style.overflow,htmlOverflow:document.documentElement.style.overflow,intro:window.__pageIntroDoneForPath,menu:document.body.dataset.siteMenuOpen,body:document.body.style.cssText})));
      assert.ok(Math.abs(actual-top)<3, route+": gentle input docks "+JSON.stringify({actual,top}));
      await page.mouse.wheel(0,240);
      await page.waitForTimeout(650);
      const progressed = await page.evaluate(()=>scrollY)>top+160 || await anchor.evaluate(el=>el.classList.contains("ui-screen-scroll") && el.scrollTop>0);
      assert.ok(progressed, route+": strong input continues page or nested content");
      console.log(width+" "+route+": gentle dock / fast release passed");
    }
    await page.getByRole("button",{name:"Open navigation",exact:true}).click();
    await page.waitForTimeout(1100);
    const lockedY = await page.evaluate(()=>scrollY);
    await page.mouse.wheel(0,300);
    await page.waitForTimeout(400);
    assert.equal(await page.evaluate(()=>scrollY), lockedY, "Menu locks page scrolling");
    await page.getByRole("button",{name:"Close navigation",exact:true}).click();
    await page.waitForTimeout(1100);
    await page.goto("http://localhost:3000/projects");
    await page.waitForFunction(() => window.__pageIntroDoneForPath === location.pathname);
    const archive = page.locator("#project-archive");
    await archive.evaluate(el=>scrollTo(0,scrollY+el.getBoundingClientRect().top));
    await page.waitForTimeout(600);
    await page.mouse.move(width/2,height/2);
    await page.mouse.wheel(0,220);
    await page.waitForTimeout(600);
    assert.ok(await archive.evaluate(el=>el.scrollTop)>50, "Nested archive stays scrollable");
    if (touch) {
      await page.goto("http://localhost:3000/contact");
      await page.waitForFunction(() => window.__pageIntroDoneForPath === location.pathname);
      const cdp = await context.newCDPSession(page);
      await cdp.send("Input.dispatchTouchEvent",{type:"touchStart",touchPoints:[{x:width/2,y:height*.75}]});
      for (let i=1;i<=6;i++) {
        await cdp.send("Input.dispatchTouchEvent",{type:"touchMove",touchPoints:[{x:width/2,y:height*.75-i*22}]});
        await page.waitForTimeout(30);
      }
      await cdp.send("Input.dispatchTouchEvent",{type:"touchEnd",touchPoints:[]});
      await page.waitForTimeout(600);
      assert.ok(await page.evaluate(()=>scrollY)>50,"Touch swipe moves page");
    }
    await context.close();
  }
  const reduced = await browser.newPage({reducedMotion:"reduce"});
  await reduced.goto("http://localhost:3000");
  await reduced.waitForTimeout(600);
  assert.equal(await reduced.locator("html").evaluate(el=>el.classList.contains("lenis")),false);
  assert.deepEqual(errors,[]);
  console.log("Touch, nested scrolling, reduced motion and page errors passed");
} finally {
  await browser.close();
}
