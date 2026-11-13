import { chromium } from "@playwright/test";
import assert from "node:assert/strict";
import { mkdir, writeFile } from "node:fs/promises";

const browser = await chromium.launch({ channel: "chrome", headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
const cdp = await page.context().newCDPSession(page);
const samples = [];
const errors = [];
const baseURL = process.env.TEST_URL || "http://localhost:3000";
page.on("pageerror", (error) => errors.push(error.message));
try {
  await page.goto(baseURL, { waitUntil: "networkidle" });
  await page.waitForFunction(() => window.__pageIntroDoneForPath === "/");
  for (let round = 0; round < 3; round++) {
    for (const [label, path] of [["About", "/about"], ["Projects", "/projects"], ["Contact", "/contact"], ["Home", "/"]]) {
      await page.evaluate(() => { scrollTo(0, 0); window.__previousCanvas = document.querySelectorAll(".portfolio-hero canvas")[1]; });
      await page.getByRole("button", { name: "Open navigation", exact: true }).click();
      await page.getByRole("navigation", { name: "Main menu", exact: true }).getByRole("link", { name: label, exact: true }).click();
      await page.waitForURL(`**${path}`);
      await page.waitForFunction((path) => window.__pageIntroDoneForPath === path, path);
      assert.equal(await page.evaluate(() => window.__previousCanvas.width), 0, "old canvas backing store must be released on route change");
      await page.evaluate(() => { delete window.__previousCanvas; });
    }
    await page.waitForTimeout(3500);
    await cdp.send("HeapProfiler.collectGarbage");
    const heap = await cdp.send("Runtime.getHeapUsage");
    const dom = await cdp.send("Memory.getDOMCounters");
    samples.push({ round: round + 1, heapMB: heap.usedSize / 1024 ** 2, ...dom });
    console.log(JSON.stringify(samples.at(-1)));
  }
  assert.deepEqual(errors, []);
  assert.ok(samples.at(-1).jsEventListeners <= samples[0].jsEventListeners + 4, "native event listeners must not accumulate across route changes");
  await mkdir(".artifacts/performance", { recursive: true });
  await writeFile(`.artifacts/performance/lifecycle${process.env.TEST_URL ? "-production" : ""}.json`, JSON.stringify(samples, null, 2));
  console.log("PASS 12 client navigations: old canvas buffers released; no browser errors");
} finally { await browser.close(); }
