import { mkdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";

const directory = new URL("../public/brand/pwa/", import.meta.url);
await mkdir(directory, { recursive: true });
const browser = await chromium.launch({ channel: "chrome" });
try {
  for (const [form, width, height] of [["wide", 1440, 900], ["narrow", 402, 874]]) {
    const page = await browser.newPage({
      viewport: { width, height }, deviceScaleFactor: 1, reducedMotion: "reduce", hasTouch: form === "narrow",
    });
    const response = await page.goto(process.env.TEST_URL || "http://localhost:3001");
    if (!response?.ok()) throw new Error(`Could not load the portfolio: ${response?.status()}`);
    await page.waitForFunction(() => window.__pageIntroDoneForPath === location.pathname);
    await page.locator("[data-page-intro]").waitFor({ state: "hidden" });
    await page.evaluate(() => document.fonts.ready);
    await page.screenshot({
      path: fileURLToPath(new URL(`screenshot-${form}.jpg`, directory)),
      type: "jpeg", quality: 88, style: "nextjs-portal { display: none !important; }",
    });
    await page.close();
  }
} finally {
  await browser.close();
}
