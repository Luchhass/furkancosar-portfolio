import { chromium } from "@playwright/test";
import assert from "node:assert/strict";

const browser = await chromium.launch({ channel: "chrome" });
try {
  for (const width of [1440, 390]) {
    const page = await browser.newPage({ viewport: { width, height: 900 }, hasTouch: width === 390 });
    const errors = [];
    page.on("pageerror", error => errors.push(error.message));
    await page.goto("http://localhost:3000");
    await page.waitForFunction(() => window.__pageIntroDoneForPath === location.pathname);
    await page.waitForTimeout(600);
    for (const gesture of ["tap", "drag", "return-drag", "cancel", "hold", "scroll"]) {
      await page.locator(".ui-hero").evaluate(async (el, { gesture, width }) => {
        const r = el.getBoundingClientRect();
        const init = { bubbles: true, clientX: r.left + r.width * .25, clientY: r.top + r.height * .3,
          button: 0, pointerType: width === 390 ? "touch" : "mouse", pointerId: 1, isPrimary: true };
        el.dispatchEvent(new PointerEvent("pointerdown", init));
        if (gesture.includes("drag")) {
          el.dispatchEvent(new PointerEvent("pointermove", { ...init, clientX: init.clientX + 40 }));
        }
        if (gesture === "hold") await new Promise(resolve => setTimeout(resolve, 500));
        if (gesture === "scroll") window.dispatchEvent(new Event("scroll"));
        el.dispatchEvent(new PointerEvent(gesture === "cancel" ? "pointercancel" : "pointerup", {
          ...init, clientX: init.clientX + (gesture === "drag" ? 40 : 0),
        }));
      }, { gesture, width });
      let peak = 0;
      for (let frame = 0; frame < 13; frame++) {
        await page.waitForTimeout(80);
        peak = Math.max(peak, await page.locator(".ui-hero canvas").first().evaluate(el => {
          const data = el.getContext("2d").getImageData(Math.floor(el.width * .8), Math.floor(el.height * .75), 12, 12).data;
          return data.reduce((sum, value, index) => sum + (index % 4 === 3 ? value : 0), 0);
        }));
      }
      assert.equal(peak > 0, gesture === "tap", `${width}: ${gesture} burst detection (peak ${peak})`);
      await page.waitForTimeout(1300);
      console.log(`${width}: ${gesture} passed`);
    }
    assert.deepEqual(errors, []);
    await page.close();
  }
} finally {
  await browser.close();
}
