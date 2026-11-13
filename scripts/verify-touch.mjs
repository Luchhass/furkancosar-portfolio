import { chromium } from "@playwright/test";
import assert from "node:assert/strict";

const browser = await chromium.launch({ channel: "chrome", headless: true });
const context = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, deviceScaleFactor: 1 });
const page = await context.newPage();
const errors = [];
page.on("pageerror", (error) => errors.push(error.message));
try {
  await page.goto("http://localhost:3000", { waitUntil: "networkidle" });
  await page.waitForFunction(() => window.__pageIntroDoneForPath === "/");
  assert.equal(await page.locator(".motion-project-cursor").evaluate((el) => getComputedStyle(el).display), "none", "touch must not show custom cursor");
  assert.equal(await page.locator(".pin-spacer").count(), 0, "touch layout must not pin gallery");
  const card = page.locator(".highlights-scene .project-card-motion").first();
  await card.scrollIntoViewIfNeeded(); await page.waitForTimeout(1700);
  await card.tap(); await page.getByRole("dialog").waitFor(); await page.waitForTimeout(1000);
  const box = await page.locator(".project-modal-panel").boundingBox();
  assert.ok(box.x >= 0 && box.y >= 0 && box.x + box.width <= 390 && box.y + box.height <= 844);
  await page.screenshot({ path: ".artifacts/motion/scene-touch-modal.png" });
  await page.getByRole("button", { name: "Close project details" }).tap();
  await page.getByRole("dialog").waitFor({ state: "detached" });
  await page.goto("http://localhost:3000/about", { waitUntil: "networkidle" });
  await page.locator(".journey-deck").waitFor();
  await page.getByRole("button", { name: "Interface Stack" }).tap();
  assert.equal(await page.getByRole("button", { name: "Interface Stack" }).getAttribute("aria-expanded"), "true");
  assert.deepEqual(errors, []);
  console.log("PASS coarse-pointer touch layout, card tap, fullscreen details, sticky journey, accordion tap");
} finally { await browser.close(); }
