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
      await page.evaluate(y=>scrollTo(0,y),top-160);
      await page.waitForTimeout(100);
      await page.mouse.move(10,height/2);
      await page.mouse.wheel(0,35);
      await page.waitForTimeout(1400);
      const approach = await page.evaluate(()=>scrollY);
      assert.ok(Math.abs(approach-(top-125))<3, "Scroll input keeps its full distance outside alignment range");
      await page.waitForTimeout(600);
      assert.ok(Math.abs(await page.evaluate(()=>scrollY)-approach)<2,"No distant snap after stopping");
      await page.mouse.wheel(0,60);
      await page.waitForTimeout(1400);
      const actual = await page.evaluate(()=>scrollY);
      if (Math.abs(actual-top)>=3) console.log(await page.evaluate(()=>({html:document.documentElement.className,bodyOverflow:document.body.style.overflow,htmlOverflow:document.documentElement.style.overflow,intro:window.__pageIntroDoneForPath,menu:document.body.dataset.siteMenuOpen,body:document.body.style.cssText})));
      assert.ok(Math.abs(actual-top)<3, route+": gentle input docks "+JSON.stringify({actual,top}));
      const innerBefore = await anchor.evaluate(el=>el.scrollTop);
      await page.mouse.wheel(0,20);
      await page.waitForTimeout(1200);
      const departure = await page.evaluate(()=>scrollY);
      const innerAfter = await anchor.evaluate(el=>el.scrollTop);
      assert.ok(Math.abs(departure-(top+20))<3 || innerAfter-innerBefore>10,
        "Even small input moves the page or overflowing section without resistance: "+JSON.stringify({departure,top,innerBefore,innerAfter}));
      await page.mouse.wheel(0,240);
      await page.waitForTimeout(650);
      const progressed = await page.evaluate(()=>scrollY)>top+160 || await anchor.evaluate(el=>el.classList.contains("ui-screen-scroll") && el.scrollTop>0);
      assert.ok(progressed, route+": strong input continues page or nested content");
      if (route === "/") {
        await page.waitForTimeout(700);
        await page.evaluate(y=>scrollTo(0,y),top-260);
        await page.waitForTimeout(150);
        await page.mouse.wheel(0,240);
        await page.waitForTimeout(1400);
        const fastEnd = await page.evaluate(()=>scrollY);
        assert.ok(Math.abs(fastEnd-(top-20))<3, "Fast gesture stays free even when it ends near a section: "+JSON.stringify({fastEnd,top}));
        await page.evaluate(y=>scrollTo(0,y),top-140);
        await page.waitForTimeout(300);
        await page.mouse.wheel(0,70);
        await page.waitForFunction(y=>scrollY>y-65 && scrollY<y-3,top);
        await page.mouse.wheel(0,-25);
        await page.waitForTimeout(1400);
        assert.ok(await page.evaluate(()=>scrollY)<top-50, "New input interrupts alignment immediately");
      }
      console.log(width+" "+route+": full input / nearby resting alignment / immediate departure passed");
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
    assert.ok(await archive.locator(".shelf-viewport").evaluate(el=>el.scrollLeft)>20,
      "Archive retains its horizontal shelf progression");
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
      await page.waitForTimeout(700);
      const formTop = await page.locator("main .ui-screen").first().evaluate(el=>scrollY+el.getBoundingClientRect().top);
      await page.evaluate(y=>scrollTo(0,y),formTop-100);
      await page.waitForTimeout(300);
      await cdp.send("Input.dispatchTouchEvent",{type:"touchStart",touchPoints:[{x:10,y:height*.7}]});
      await cdp.send("Input.dispatchTouchEvent",{type:"touchMove",touchPoints:[{x:10,y:height*.7-35}]});
      await page.waitForTimeout(600);
      const held = await page.evaluate(()=>scrollY);
      assert.ok(held<formTop-20 && held>formTop-100, "No alignment while the finger remains down");
      await cdp.send("Input.dispatchTouchEvent",{type:"touchEnd",touchPoints:[]});
      await page.waitForTimeout(1500);
      assert.ok(Math.abs(await page.evaluate(()=>scrollY)-formTop)<3, "Touch aligns only after release and momentum");
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
