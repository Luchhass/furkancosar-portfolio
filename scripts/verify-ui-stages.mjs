import { chromium } from "@playwright/test";
import { mkdir, writeFile } from "node:fs/promises";
import assert from "node:assert/strict";

const output = ".artifacts/ui-system/stages";
await mkdir(output, { recursive: true });
const browser = await chromium.launch({ channel: "chrome", headless: true });
const report = [];
const failures = [];
try {
  for (const [width, height] of [[1440, 900], [1024, 768], [390, 844], [844, 390]]) {
    const page = await browser.newPage({ viewport: { width, height } });
    for (const route of ["/", "/about"]) {
      await page.goto((process.env.TEST_URL || "http://localhost:3000") + route, { waitUntil: "domcontentloaded" });
      await page.waitForFunction(() => window.__pageIntroDoneForPath === location.pathname);
      await page.waitForTimeout(1000);
      const stage = page.locator(route === "/" ? ".highlights-scene" : ".journey-story");
      await stage.evaluate(el => scrollTo(0, scrollY + el.getBoundingClientRect().top + 50));
      await page.waitForTimeout(2500);
      const geometry = await stage.evaluate((el, isJourney) => {
        const nodes = isJourney ? [el.querySelector(".journey-deck-heading"), el.querySelector(".journey-controls"), el.querySelector('.journey-slide[aria-hidden="false"] .journey-slide-words')] : [el.querySelector(".ui-section-title"), el.querySelector(".ui-project-card-body")];
        return nodes.filter(Boolean).map(node => {
          const r = node.getBoundingClientRect();
          const clips = ["auto", "scroll", "hidden", "clip"].includes(getComputedStyle(node).overflowY);
          return { name: node.className, x: r.x, y: r.y, right: r.right, bottom: r.bottom, overflowY: clips && node.scrollHeight > node.clientHeight + 2, overflowX: clips && node.scrollWidth > node.clientWidth + 2 };
        });
      }, route === "/about");
      for (const item of geometry) {
        if (item.x < -2 || item.right > width + 2) failures.push(`${width}x${height} ${route}: horizontal ${item.name}`);
        if (item.overflowX) failures.push(`${width}x${height} ${route}: content clipped inside ${item.name}`);
        if (route === "/about" && (item.y < -2 || item.bottom > height + 2 || item.overflowY)) failures.push(`${width}x${height}: journey ${item.name} does not fit`);
        if (route === "/" && width >= 1024 && height >= 720 && item.bottom > height + 2) failures.push(`${width}x${height}: pinned gallery ${item.name} clipped`);
      }
      await page.screenshot({ path: `${output}/${width}x${height}-${route === "/" ? "highlights" : "journey"}.png` });
      report.push({ width, height, route, geometry });
      console.log(`${width}x${height} ${route}: checked`);
    }
    await page.close();
  }
} finally {
  await browser.close();
  await writeFile(`${output}/report.json`, JSON.stringify({ report, failures }, null, 2));
}
assert.deepEqual(failures, []);
