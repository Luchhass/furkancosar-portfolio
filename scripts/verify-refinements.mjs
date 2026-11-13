import { chromium } from "@playwright/test";
import assert from "node:assert/strict";
import { mkdir } from "node:fs/promises";

const browser = await chromium.launch({ channel: "chrome", headless: true });
await mkdir(".artifacts/refinements", { recursive: true });
const errors = [];
const layouts = [{ width: 1440, height: 900 }, { width: 1536, height: 680 }, { width: 390, height: 844 }, { width: 360, height: 640 }, { width: 844, height: 390 }].filter((layout) => !process.env.TEST_WIDTH || layout.width === Number(process.env.TEST_WIDTH));
try {
  for (const viewport of layouts) {
    const context = await browser.newContext({ viewport, hasTouch: viewport.width < 900 });
    const page = await context.newPage();
    page.on("pageerror", (error) => errors.push(error.message));
    await page.goto("http://localhost:3000/about", { waitUntil: "networkidle" });
    await page.waitForFunction(() => window.__pageIntroDoneForPath === "/about");
    await page.locator(".journey-deck").waitFor();
    const range = await page.locator(".journey-story").evaluate((el) => ({ start: scrollY + el.getBoundingClientRect().top, distance: el.offsetHeight - innerHeight }));
    let lastProgress = -1;
    for (const [index, progress] of [0.06, 0.32, 0.58, 0.87].entries()) {
      await page.evaluate((top) => scrollTo(0, top), range.start + range.distance * progress);
      await page.waitForTimeout(1000);
      const frame = await page.locator(".journey-frame").boundingBox();
      assert.ok(Math.abs(frame.y) < 2 && Math.abs(frame.height - viewport.height) < 2, `${viewport.width}: frame must stay fixed`);
      const visible = await page.locator(".journey-slide").evaluateAll((slides) => slides.map((slide, i) => ({ i, style: getComputedStyle(slide) })).filter(({ style }) => style.visibility === "visible" && Number(style.opacity) > .95).map(({ i }) => i));
      assert.deepEqual(visible, [index], `${viewport.width}: only chapter ${index + 1} should be visible`);
      assert.ok(await page.locator(".journey-slide").nth(index).locator(".journey-slide-index").evaluate((el) => el.scrollWidth <= el.clientWidth + 1), "chapter number must not be clipped");
      assert.equal(await page.locator(".journey-chapter-links button[aria-current='step']").textContent(), `0${index + 1}${["Foundation", "In practice", "Independent", "What's next"][index]}`);
      const rail = await page.locator(".journey-rail-fill").evaluate((el) => Number(getComputedStyle(el).transform.match(/matrix\(([^,]+)/)[1]));
      assert.ok(rail > lastProgress, "progress rail must advance"); lastProgress = rail;
      const content = await page.locator(".journey-slide").nth(index).locator(".journey-slide-words").boundingBox();
      assert.ok(content.y >= 0 && content.y + content.height <= viewport.height, "chapter content must fit viewport");
      if (index === 1) await page.screenshot({ path: `.artifacts/refinements/${viewport.width}x${viewport.height}-journey.png` });
    }
    await page.getByRole("button", { name: "Go to chapter 2: In practice", exact: true }).click();
    await page.waitForTimeout(1400);
    assert.equal(await page.locator(".journey-slide[aria-hidden='false'] .journey-slide-label").textContent(), "LEARNING BY BUILDING");
    await page.locator(".collaboration-scene").evaluate((el) => scrollTo(0, scrollY + el.getBoundingClientRect().top));
    await page.waitForTimeout(1700);
    assert.equal(await page.locator(".collaboration-scene .orbital-sculpture").count(), 0);
    await page.screenshot({ path: `.artifacts/refinements/${viewport.width}x${viewport.height}-cta.png` });
    await page.goto("http://localhost:3000/projects", { waitUntil: "networkidle" });
    const card = page.locator(".project-card-motion").first();
    await card.scrollIntoViewIfNeeded(); await page.waitForTimeout(1500); await card.click();
    await page.getByRole("dialog").waitFor(); await page.waitForTimeout(1000);
    const box = await page.locator(".project-modal-panel").boundingBox();
    assert.ok(Math.abs(box.x) < 1 && Math.abs(box.y) < 1 && Math.abs(box.width - viewport.width) < 1 && Math.abs(box.height - viewport.height) < 1, "detail must occupy the full viewport");
    assert.equal(await page.getByRole("dialog").evaluate((el) => getComputedStyle(el).backgroundColor), "rgb(17, 17, 17)");
    await page.screenshot({ path: `.artifacts/refinements/${viewport.width}x${viewport.height}-project.png` });
    await page.keyboard.press("Escape"); await page.getByRole("dialog").waitFor({ state: "detached" });
    assert.notEqual(await page.evaluate(() => document.body.style.overflow), "hidden");
    await context.close();
    console.log(`PASS ${viewport.width}x${viewport.height}: chapter progression, sticky frame, progress, chapter click, clean CTA, fullscreen details`);
  }
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, reducedMotion: "reduce" });
  const page = await context.newPage();
  await page.goto("http://localhost:3000/about", { waitUntil: "networkidle" });
  assert.equal(await page.locator(".journey-deck").count(), 0);
  assert.equal(await page.locator(".journey-slide:not([aria-hidden='true'])").count(), 4);
  await context.close();
  assert.deepEqual(errors, []);
  console.log("PASS reduced-motion readable journey; no browser errors");
} finally { await browser.close(); }
