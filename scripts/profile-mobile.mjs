import { chromium } from "@playwright/test";
import { mkdir, writeFile } from "node:fs/promises";

const browser = await chromium.launch({ channel: "chrome", headless: true });
try {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  await context.addInitScript(() => {
    window.__gradientFrames = 0;
    const original = CanvasRenderingContext2D.prototype.fillRect;
    CanvasRenderingContext2D.prototype.fillRect = function (...args) {
      if (this.canvas === document.querySelector(".portfolio-hero canvas")) window.__gradientFrames++;
      return original.apply(this, args);
    };
  });
  const page = await context.newPage();
  await page.goto(process.env.TEST_URL || "http://localhost:3000", { waitUntil: "networkidle" });
  await page.waitForFunction(() => window.__pageIntroDoneForPath === "/");
  await page.waitForTimeout(3000);
  const cdp = await context.newCDPSession(page);
  await cdp.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [{ x: 195, y: 300 }] });
  await page.waitForTimeout(2200);
  await page.evaluate(() => { window.__gradientFrames = 0; window.__canvasStart = performance.now(); });
  await page.waitForTimeout(2200);
  const result = await page.evaluate(() => ({ frames: window.__gradientFrames, elapsedMs: performance.now() - window.__canvasStart }));
  result.canvasFPS = result.frames / (result.elapsedMs / 1000);
  await cdp.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
  await mkdir(".artifacts/performance", { recursive: true });
  await writeFile(".artifacts/performance/mobile.json", JSON.stringify(result, null, 2));
  console.log(JSON.stringify(result));
} finally { await browser.close(); }
