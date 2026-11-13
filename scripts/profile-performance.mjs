import { chromium } from "@playwright/test";
import { mkdir, writeFile } from "node:fs/promises";
import { createHash } from "node:crypto";

const label = process.argv[2] || "sample";
const baseURL = process.env.TEST_URL || "http://localhost:3000";
const output = ".artifacts/performance";
await mkdir(output, { recursive: true });
const browser = await chromium.launch({ channel: "chrome", headless: true });
const results = { label, browser: browser.version(), viewport: { width: 1440, height: 900 }, mode: "dev, headless Chrome, unthrottled; instrumented Canvas2D calls", scenarios: [] };
try {
  const context = await browser.newContext({ viewport: results.viewport });
  await context.addInitScript(() => {
    window.__canvasStats = { calls: {}, clearPixels: 0, blitPixels: 0 };
    for (const method of ["clearRect", "drawImage", "fillRect", "fill", "stroke", "createLinearGradient", "createRadialGradient"]) {
      const original = CanvasRenderingContext2D.prototype[method];
      CanvasRenderingContext2D.prototype[method] = function (...args) {
        const stats = window.__canvasStats;
        stats.calls[method] = (stats.calls[method] || 0) + 1;
        if (method === "clearRect") stats.clearPixels += Math.abs(args[2] * args[3]);
        if (method === "drawImage") stats.blitPixels += args.length === 9 ? args[7] * args[8] : args.length === 5 ? args[3] * args[4] : args[0].width * args[0].height;
        return original.apply(this, args);
      };
    }
    window.__beginSample = () => {
      window.__canvasStats = { calls: {}, clearPixels: 0, blitPixels: 0 };
      window.__frames = []; window.__lastFrame = 0;
      const tick = (time) => { if (window.__lastFrame) window.__frames.push(time - window.__lastFrame); window.__lastFrame = time; window.__sampleRAF = requestAnimationFrame(tick); };
      window.__sampleRAF = requestAnimationFrame(tick);
    };
    window.__endSample = () => {
      cancelAnimationFrame(window.__sampleRAF);
      const frames = window.__frames;
      const sorted = frames.slice().sort((a, b) => a - b);
      return { canvas: window.__canvasStats, frame: { count: frames.length, averageMs: frames.reduce((a, b) => a + b, 0) / frames.length, p95Ms: sorted[Math.floor(sorted.length * .95)], over25ms: frames.filter((ms) => ms > 25).length }, domNodes: document.querySelectorAll("*").length, counterFrames: document.querySelectorAll("[data-reveal-counter] .absolute > span").length, runningCSSAnimations: document.getAnimations().filter((animation) => animation.playState === "running" && animation.constructor.name === "CSSAnimation").length };
    };
  });
  const page = await context.newPage();
  const cdp = await context.newCDPSession(page);
  await cdp.send("Performance.enable");
  async function metrics() { return Object.fromEntries((await cdp.send("Performance.getMetrics")).metrics.map(({ name, value }) => [name, value])); }
  async function measure(name, run) {
    await page.evaluate(() => window.__beginSample());
    const before = await metrics(); const start = Date.now();
    await run();
    const after = await metrics(); const sample = await page.evaluate(() => window.__endSample());
    results.scenarios.push({ name, elapsedMs: Date.now() - start, taskMs: (after.TaskDuration - before.TaskDuration) * 1000, layoutMs: (after.LayoutDuration - before.LayoutDuration) * 1000, styleMs: (after.RecalcStyleDuration - before.RecalcStyleDuration) * 1000, heapMB: after.JSHeapUsedSize / 1024 ** 2, ...sample });
    console.log(JSON.stringify(results.scenarios.at(-1)));
  }
  await page.goto(baseURL, { waitUntil: "networkidle" });
  await page.waitForFunction(() => window.__pageIntroDoneForPath === "/");
  await page.waitForTimeout(3500);
  results.staticCanvas = await page.locator(".portfolio-hero canvas").last().evaluate((canvas) => canvas.toDataURL());
  results.staticCanvasHash = createHash("sha256").update(results.staticCanvas).digest("hex");
  await measure("hero-idle", () => page.waitForTimeout(2200));
  await measure("hero-pointer", async () => {
    for (let i = 0; i < 150; i++) { await page.mouse.move(720 + Math.sin(i * .12) * 420, 390 + Math.cos(i * .15) * 220); await page.waitForTimeout(16); }
  });
  await page.waitForTimeout(1600);
  await measure("hero-stationary-pointer", () => page.waitForTimeout(2200));
  await measure("scroll-exit", async () => { for (let y = 0; y < 1400; y += 12) { await page.evaluate((top) => scrollTo(0, top), y); await page.waitForTimeout(16); } });
  await page.mouse.move(20, 20); await page.waitForTimeout(1400);
  await measure("below-hero-idle", () => page.waitForTimeout(2200));
  await page.goto(baseURL + "/about", { waitUntil: "networkidle" });
  await page.waitForFunction(() => window.__pageIntroDoneForPath === "/about");
  await page.waitForTimeout(3200);
  await cdp.send("HeapProfiler.collectGarbage");
  await measure("about-idle", () => page.waitForTimeout(2200));
  results.counterReelFrames = await page.locator("[data-reveal-counter]").evaluateAll((counters) => counters.map((counter) => ({ label: counter.getAttribute("aria-label"), frames: counter.querySelectorAll(".absolute > span").length })));
  await writeFile(`${output}/${label}.json`, JSON.stringify(results, null, 2));
  console.log(`Saved ${output}/${label}.json; static canvas hash ${results.staticCanvasHash}`);
} finally { await browser.close(); }
