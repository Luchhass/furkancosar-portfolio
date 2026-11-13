import { chromium } from "@playwright/test";
import assert from "node:assert/strict";
import { mkdir, writeFile } from "node:fs/promises";

const base = process.env.TEST_URL || "http://localhost:3000";
const output = ".artifacts/ui-system";
await mkdir(output, { recursive: true });
const browser = await chromium.launch({ channel: "chrome", headless: true });
const report = [];
const errors = [];
const failures = [];
const check = (condition, message) => { if (!condition) failures.push(message); };
try {
  for (const width of (process.env.TEST_WIDTHS || "1440,1024,768,390,360").split(",").map(Number)) {
    const context = await browser.newContext({ viewport: { width, height: 900 }, reducedMotion: "reduce" });
    const page = await context.newPage();
    page.on("pageerror", error => errors.push(`${width}: ${error.message}`));
    for (const route of (process.env.TEST_ROUTES || "/,/about,/projects,/contact").split(",")) {
      await page.goto(base + route, { waitUntil: "domcontentloaded" });
      await page.waitForFunction(() => window.__pageIntroDoneForPath === location.pathname);
      await page.evaluate(() => document.fonts.ready);
      const measurements = await page.evaluate(() => {
        const css = getComputedStyle(document.documentElement);
        const gutter = parseFloat(css.getPropertyValue("--ui-gutter"));
        const rail = parseFloat(css.getPropertyValue("--ui-rail"));
        const gap = parseFloat(css.getPropertyValue("--ui-column-gap"));
        return {
          overflow: document.documentElement.scrollWidth > innerWidth + 2,
          gutter, expectedStart: gutter + (innerWidth >= 768 ? rail + gap : 0),
          sections: Array.from(document.querySelectorAll("main .ui-section-grid")).map(grid => {
            const title = grid.querySelector(".ui-section-title");
            const label = grid.querySelector(".ui-section-label");
            return {
              title: title?.textContent, x: title?.getBoundingClientRect().x,
              rightSpace: innerWidth - grid.querySelector(".ui-section-body").getBoundingClientRect().right,
              labelX: label?.getBoundingClientRect().x,
              titleOverflow: title ? title.scrollWidth > title.clientWidth + 2 : false,
              accordionX: grid.querySelector(".ui-accordion-row button")?.getBoundingClientRect().x,
            };
          }),
          heroPadding: getComputedStyle(document.querySelector(".ui-hero")).paddingLeft,
          headerPadding: getComputedStyle(document.querySelector(".ui-header")).paddingLeft,
          footerPadding: getComputedStyle(document.querySelector("footer")).paddingLeft,
          buttons: Array.from(document.querySelectorAll(".ui-button")).map(el => el.getBoundingClientRect().height),
          fields: Array.from(document.querySelectorAll(".ui-form input,.ui-form select")).map(el => el.getBoundingClientRect().height),
          statOverflow: Array.from(document.querySelectorAll(".ui-stat-value")).some(el => el.scrollWidth > el.clientWidth + 2),
        };
      });
      check(!measurements.overflow, `${width}${route}: page overflows`);
      for (const section of measurements.sections) {
        check(Math.abs(section.x - measurements.expectedStart) < 2, `${width}${route} ${section.title}: content start ${section.x}`);
        check(Math.abs(section.rightSpace - measurements.expectedStart) < 2, `${width}${route} ${section.title}: main content is not centered`);
        check(Math.abs(section.labelX - measurements.gutter) < 2, `${width}${route} ${section.title}: label start`);
        check(!section.titleOverflow, `${width}${route} ${section.title}: heading overflows`);
        if (section.accordionX !== undefined) check(Math.abs(section.accordionX - section.x) < 2, `${width}${route}: accordion start`);
      }
      check(measurements.heroPadding === measurements.headerPadding && measurements.headerPadding === measurements.footerPadding, `${width}${route}: outer frames differ`);
      check(measurements.buttons.every(height => height >= 55.5), `${width}${route}: button height`);
      check(measurements.fields.every(height => height >= 44), `${width}${route}: field touch target`);
      check(!measurements.statOverflow, `${width}${route}: stat value clipped`);

      const intro = page.locator("main .ui-section-grid").first();
      await intro.evaluate(el => scrollTo(0, scrollY + el.getBoundingClientRect().top - 150));
      await page.waitForTimeout(600);
      if ([1440, 390].includes(width)) await page.screenshot({ path: `${output}/${width}-${route.replaceAll("/", "") || "home"}.png` });
      if (route === "/") {
        const button = page.getByRole("button", { name: "What I Care About" });
        await button.click();
        check(await button.getAttribute("aria-expanded") === "true", `${width}: accordion interaction`);
      }
      if (route === "/contact") {
        const form = page.locator(".ui-form");
        await form.locator('[name="name"]').fill("Layout verification");
        check(await form.locator('[name="name"]').inputValue() === "Layout verification", `${width}: form input`);
      }
      await page.getByRole("button", { name: "Open navigation", exact: true }).click();
      await page.locator("#site-menu").waitFor();
      const menu = await page.locator("#site-menu").evaluate(el => ({ padding: getComputedStyle(el).paddingLeft, width: el.clientWidth, overflow: el.scrollHeight > el.clientHeight + 2 }));
      check(menu.padding === measurements.headerPadding, `${width}${route}: menu gutter`);
      check(menu.width === width && !menu.overflow, `${width}${route}: menu viewport`);
      if (route === "/" && [1440, 390].includes(width)) await page.screenshot({ path: `${output}/${width}-menu.png` });
      await page.getByRole("button", { name: "Close navigation", exact: true }).click();
      await page.locator("#site-menu").waitFor({ state: "detached" });
      report.push({ width, route, ...measurements });
      console.log(`${width} ${route}: checked`);
    }
    await context.close();
  }
} finally {
  await browser.close();
  await writeFile(`${output}/report.json`, JSON.stringify({ report, failures, errors }, null, 2));
}
assert.deepEqual(errors, [], "browser errors");
assert.deepEqual(failures, [], "UI consistency checks");
console.log(`Passed ${report.length} route/viewport combinations.`);
