import { chromium } from "@playwright/test";
import { mkdir, writeFile } from "node:fs/promises";
import assert from "node:assert/strict";

const baseURL = process.env.TEST_URL || "http://localhost:3000";
const output = ".artifacts/motion";
await mkdir(output, { recursive: true });
const browser = await chromium.launch({ channel: "chrome", headless: true });
const report = [];
const errors = [];
const layouts = [{ width: 1440, height: 900 }, { width: 768, height: 1024 }, { width: 390, height: 844 }, { width: 360, height: 640 }].filter((size) => !process.env.TEST_WIDTH || size.width === Number(process.env.TEST_WIDTH));
try {
  for (const viewport of layouts) {
    const context = await browser.newContext({ viewport });
    const page = await context.newPage();
    page.on("pageerror", (error) => { errors.push(`${viewport.width}: ${error.message}`); console.error("BROWSER ERROR", error.stack); });
    page.on("console", (message) => { if (message.type() === "error" && /hydration|hydrated|GSAP|React error/i.test(message.text())) errors.push(message.text()); });
    for (const route of (process.env.TEST_ROUTES?.split(",") || ["/", "/about", "/projects", "/contact"])) {
      await page.goto(baseURL + route, { waitUntil: "networkidle" });
      await page.waitForFunction(() => window.__pageIntroDoneForPath === location.pathname, { timeout: 20000 });
      await page.waitForTimeout(2500);
      const name = `${viewport.width}-${route.replaceAll("/", "") || "home"}`;
      await page.screenshot({ path: `${output}/${name}-hero.png` });
      assert.equal(await page.locator("h1").count(), 1, `${name}: missing heading; errors: ${errors.join("; ")}`);
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth);
      assert.ok(overflow <= 2, `${name}: horizontal overflow ${overflow}px`);
      await page.screenshot({ path: `${output}/${name}-hero.png` });
      for (let y = 0, max = await page.evaluate(() => document.documentElement.scrollHeight); y < max; y += viewport.height * .7) {
        await page.evaluate((top) => window.scrollTo(0, top), y);
        await page.waitForTimeout(90);
      }
      await page.waitForTimeout(800);
      if (route === "/") {
        await page.locator(".about-scene-layout").first().evaluate((el) => window.scrollTo(0, window.scrollY + el.getBoundingClientRect().top - 130));
        await page.waitForTimeout(1100);
        await page.screenshot({ path: `${output}/${name}-about.png` });
        await page.getByRole("button", { name: "What I Care About" }).click();
        assert.equal(await page.getByRole("button", { name: "What I Care About" }).getAttribute("aria-expanded"), "true");
      }
      if (route === "/projects") {
        await page.getByRole("textbox", { name: "Search projects" }).fill("no-matching-project-xyz");
        await page.waitForTimeout(600);
        assert.equal(await page.locator(".project-card-motion").count(), 0, "empty search must show no cards");
        await page.getByRole("textbox", { name: "Search projects" }).fill("");
        const card = page.locator(".project-card-motion").first();
        await card.scrollIntoViewIfNeeded(); await page.waitForTimeout(1000); await card.click();
        const dialog = page.getByRole("dialog");
        await dialog.waitFor(); await page.waitForTimeout(1000);
        const box = await dialog.locator(".project-modal-panel").boundingBox();
        assert.ok(box.x >= -1 && box.y >= -1 && box.x + box.width <= viewport.width + 1 && box.y + box.height <= viewport.height + 1, `${name}: modal outside viewport`);
        await page.screenshot({ path: `${output}/${name}-modal.png` });
        await page.keyboard.press("Escape"); await dialog.waitFor({ state: "detached" });
      }
      if (route === "/about") {
        await page.getByRole("button", { name: "Interface Stack" }).click();
        await page.locator(".about-scene-layout").evaluate((el) => window.scrollTo(0, window.scrollY + el.getBoundingClientRect().top - 130));
        await page.waitForTimeout(1000); await page.screenshot({ path: `${output}/${name}-tools.png` });
      }
      if (route === "/contact") {
        await page.locator('input[name="name"]').fill("Motion preview");
        await page.locator('input[name="email"]').fill("preview@example.com");
        await page.locator('input[name="project"]').fill("Portfolio website");
        await page.locator('textarea[name="message"]').fill("Checking the interface without sending mail.");
        await page.waitForTimeout(1100);
        const fill = await page.locator('form[aria-label="Project contact form"] > .gradient-bg-flow').evaluate((el) => el.style.width);
        assert.equal(fill, "83%", `${name}: four of five fields should fill the bar to 83%: ${fill}`);
        await page.screenshot({ path: `${output}/${name}-form.png` });
      }
      report.push({ viewport, route, status: "passed" });
      console.log(`PASS ${name}`);
    }
    await context.close();
  }
  const reduced = await browser.newContext({ viewport: { width: 390, height: 844 }, reducedMotion: "reduce" });
  const page = await reduced.newPage();
  for (const route of ["/", "/about", "/projects", "/contact"]) {
    await page.goto(baseURL + route, { waitUntil: "networkidle" });
    assert.ok(await page.locator("h1").isVisible());
    assert.equal(await page.locator(".pin-spacer").count(), 0, `${route}: reduced motion must not pin`);
  }
  await reduced.close();
  assert.deepEqual(errors, [], "browser errors");
  await writeFile(`${output}/report.json`, JSON.stringify({ report, errors }, null, 2));
  console.log(`Verified ${report.length} route/layout combinations plus reduced motion.`);
} finally { await writeFile(`${output}/report.json`, JSON.stringify({ report, errors }, null, 2)); await browser.close(); }
