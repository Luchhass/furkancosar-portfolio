import { chromium } from "@playwright/test";
import assert from "node:assert/strict";

const browser = await chromium.launch({ channel: "chrome" });
const errors = [];
async function pose(target) {
  return target.evaluate(el => {
    const style = getComputedStyle(el);
    const matrix = new DOMMatrix(style.transform);
    return { opacity: Number(style.opacity), x: matrix.m41, y: matrix.m42 };
  });
}
async function cycle(page, target, name) {
  const anchor = target.locator("xpath=ancestor-or-self::*[@data-repeat-reveal][1]");
  const show = () => anchor.evaluate(el => scrollTo(0, scrollY + el.getBoundingClientRect().top - innerHeight * .35));
  await show();
  await page.waitForTimeout(1700);
  assert.equal(await anchor.getAttribute("data-repeat-reveal"), "visible", `${name}: enter`);
  const shown = await pose(target);
  await anchor.evaluate(el => {
    const top = scrollY + el.getBoundingClientRect().top;
    scrollTo(0, top > innerHeight ? 0 : top + innerHeight * 1.5);
  });
  await page.waitForFunction(el => el.dataset.repeatReveal === "hidden", await anchor.elementHandle());
  await page.waitForTimeout(320);
  const hidden = await pose(target);
  assert.ok(hidden.opacity < .02 || Math.abs(hidden.y - shown.y) > 2 || Math.abs(hidden.x - shown.x) > 2,
    `${name}: reverse completes offscreen without an idle timeout`);
  await show();
  await page.waitForFunction(el => el.dataset.repeatReveal === "visible", await anchor.elementHandle());
  await page.waitForTimeout(100);
  const entering = await pose(target);
  assert.notDeepEqual(entering, hidden, `${name}: entrance starts immediately`);
  await page.waitForTimeout(1600);
  const replayed = await pose(target);
  assert.ok(Math.abs(replayed.opacity - shown.opacity) < .02 && Math.abs(replayed.y - shown.y) < 1,
    `${name}: replay finishes at the original pose`);
  // Re-enter before the .26s reverse has finished: no minimum offscreen time.
  await anchor.evaluate(el => scrollTo(0, scrollY + el.getBoundingClientRect().top > innerHeight ? 0 : innerHeight * 2));
  await page.waitForFunction(el => el.dataset.repeatReveal === "hidden", await anchor.elementHandle());
  await show();
  await page.waitForTimeout(100);
  const fast = await pose(target);
  assert.ok(fast.opacity < .99 || Math.abs(fast.y - shown.y) > 1 || Math.abs(fast.x - shown.x) > 1,
    `${name}: fast re-entry visibly restarts the entrance`);
  console.log(`PASS ${name}`);
}
try {
  for (const width of [1440, 390]) {
    if (process.env.TEST_WIDTH && Number(process.env.TEST_WIDTH) !== width) continue;
    const context = await browser.newContext({ viewport: { width, height: width === 390 ? 844 : 900 }, hasTouch: width === 390, isMobile: width === 390 });
    const page = await context.newPage();
    page.on("pageerror", error => errors.push(error.message));
    for (const route of ["/", "/about", "/projects", "/contact"]) {
      if (process.env.TEST_ROUTE && process.env.TEST_ROUTE !== route) continue;
      await page.goto(`http://localhost:3000${route}`, { waitUntil: "domcontentloaded" });
      await page.waitForFunction(() => window.__pageIntroDoneForPath === location.pathname);
      await page.waitForTimeout(1800);
      await cycle(page, page.locator("[data-hero-title]").first(), `${width}${route} hero`);
      await cycle(page, page.locator("[data-reveal-part='title'] [data-title-reveal]").first(), `${width}${route} heading`);
      const cta = page.locator("[data-cta-title]").first();
      if (await cta.count()) await cycle(page, cta, `${width}${route} CTA`);
      // Paragraph/accordion reading masks are covered by verify-reading-reveal.mjs.
      if (route === "/about") {
        await cycle(page, page.locator("[data-toolkit-title]").first(), `${width}${route} toolkit`);
      }
      await cycle(page, page.locator("[data-footer-primary]").first(), `${width}${route} footer`);
    }
    await context.close();
    const reduced = await browser.newPage({ viewport: { width, height: 900 }, reducedMotion: "reduce" });
    await reduced.goto("http://localhost:3000/about");
    await reduced.waitForFunction(() => window.__pageIntroDoneForPath === location.pathname);
    assert.equal(await reduced.locator("[data-repeat-reveal]").count(), 0, "Reduced motion stays static and visible");
    await reduced.close();
  }
  assert.deepEqual(errors, []);
} finally {
  await browser.close();
}
