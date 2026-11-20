import { chromium } from "@playwright/test";
import assert from "node:assert/strict";

const baseURL = process.env.TEST_URL || "http://localhost:3000";
const browser = await chromium.launch({ channel: "chrome" });
try {
  const contact = await browser.newPage({ viewport: { width: 1919, height: 879 } });
  const hoverErrors = [];
  contact.on("pageerror", error => hoverErrors.push(error.message));
  await contact.goto(baseURL + "/contact", { waitUntil: "domcontentloaded" });
  await contact.waitForFunction(() => window.__pageIntroDoneForPath === "/contact");
  const cells = contact.locator(".ui-hero canvas").last();
  const readPixels = () => cells.evaluate(canvas => canvas.toDataURL());
  const idle = await readPixels();
  await contact.mouse.move(450, 240);
  await contact.mouse.move(1380, 440, { steps: 32 });
  assert.notEqual(await readPixels(), idle, "Pointer movement must deform the contact hero cells");
  await contact.evaluate(() => window.dispatchEvent(new Event("blur")));
  await contact.waitForFunction(pixels =>
    document.querySelector(".ui-hero canvas:last-of-type").toDataURL() === pixels, idle, { polling: 100 });
  assert.deepEqual(hoverErrors, []);
  await contact.close();
  console.log("Contact hero: pointer deformation and pixel-exact recovery passed");

  for (const width of [1440, 390]) {
    const page = await browser.newPage({ viewport: { width, height: 900 }, hasTouch: width === 390 });
    const errors = [];
    page.on("pageerror", error => errors.push(error.message));
    await page.goto(baseURL);
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
