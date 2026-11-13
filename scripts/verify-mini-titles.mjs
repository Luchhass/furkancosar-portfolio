import { chromium } from "@playwright/test";
import assert from "node:assert/strict";

const browser = await chromium.launch({ channel: "chrome" });
try {
  for (const width of [1440, 390]) {
    const page = await browser.newPage({ viewport: { width, height: 900 } });
    const errors = [];
    page.on("pageerror", error => errors.push(error.message));
    for (const route of ["/", "/about", "/projects", "/contact"]) {
      await page.goto(`http://localhost:3000${route}`);
      await page.waitForFunction(() => window.__pageIntroDoneForPath === location.pathname);
      const labels = page.locator("main .ui-section-label");
      for (const label of await labels.all()) {
        assert.equal(await label.locator(".mini-title-mask > [data-mini-title-inner]").count(), 1, "Every mini title has a mask and inner text");
        await page.evaluate(() => scrollTo(0, 0));
        await page.waitForTimeout(350);
        const samples = await label.evaluate(async el => {
          const mask = el.querySelector(".mini-title-mask");
          const inner = mask.firstElementChild;
          scrollTo(0, scrollY + el.getBoundingClientRect().top - innerHeight * .4);
          const frames = [];
          const start = performance.now();
          while (performance.now() - start < 700) {
            await new Promise(requestAnimationFrame);
            const style = getComputedStyle(inner);
            const m = new DOMMatrix(style.transform);
            frames.push({ y: m.m42, x: m.m41, scaleX: m.a, scaleY: m.d, opacity: Number(style.opacity), is2D: m.is2D });
          }
          return { frames, overflow: getComputedStyle(mask).overflowY, height: mask.clientHeight };
        });
        assert.equal(samples.overflow, "hidden", "The text stays clipped to its own label area");
        assert.ok(samples.frames.some(frame => frame.y < -1), "Entrance visibly starts above the resting position");
        assert.ok(samples.frames.every(frame => frame.opacity === 1 && frame.is2D && frame.scaleX === 1 && frame.scaleY === 1 && frame.x === 0),
          "Only 2D vertical translation: no opacity, scale, rotation or horizontal movement");
        assert.ok(Math.abs(samples.frames.at(-1).y) < .1, "Entrance settles at y=0");
        await page.evaluate(() => scrollTo(0, 0));
        await page.waitForTimeout(350);
        const y = await label.locator("[data-mini-title-inner]").evaluate(el => new DOMMatrix(getComputedStyle(el).transform).m42);
        assert.ok(y < -samples.height, "Reverse hides the text above its mask offscreen: "+JSON.stringify({route,width,text:await label.textContent(),y,height:samples.height,state:await label.getAttribute("data-repeat-reveal")}));
      }
      console.log(`${width} ${route}: ${await labels.count()} masked mini titles passed`);
    }
    assert.deepEqual(errors, []);
    await page.close();
  }
  const reduced = await browser.newPage({ reducedMotion: "reduce" });
  await reduced.goto("http://localhost:3000/contact");
  assert.equal(await reduced.locator("main .ui-section-label [data-mini-title-inner]").evaluate(el => getComputedStyle(el).transform), "none");
  await reduced.close();
} finally {
  await browser.close();
}
