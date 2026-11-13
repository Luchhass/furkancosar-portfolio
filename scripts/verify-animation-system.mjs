import { chromium } from "@playwright/test";
import assert from "node:assert/strict";
import { mkdir, writeFile } from "node:fs/promises";

const baseURL = process.env.TEST_URL || "http://localhost:3000";
const output = ".artifacts/motion-system";
await mkdir(output, { recursive: true });
const browser = await chromium.launch({ channel: "chrome", headless: true });
const report = [];
const errors = [];
const widths = process.env.TEST_WIDTH ? [Number(process.env.TEST_WIDTH)] : [1440, 390];

async function position(locator) {
  await locator.evaluate((element) => scrollTo(0, scrollY + element.getBoundingClientRect().top - innerHeight * .16));
}

async function inspect(locator) {
  return locator.evaluate((element) => ({ opacity: Number(getComputedStyle(element).opacity), transform: getComputedStyle(element).transform }));
}

async function cycle(page, anchor, animated, name) {
  await position(anchor);
  await page.waitForTimeout(2300);
  assert.equal(await anchor.getAttribute("data-repeat-reveal"), "visible", `${name}: did not enter`);
  const shown = await inspect(animated);
  assert.ok(shown.opacity > .98, `${name}: visible content is transparent`);
  await page.evaluate(() => scrollTo(0, 0));
  await page.waitForTimeout(2300);
  assert.equal(await anchor.getAttribute("data-repeat-reveal"), "hidden", `${name}: did not leave`);
  const hidden = await inspect(animated);
  assert.ok(hidden.opacity < .02 || hidden.transform !== shown.transform, `${name}: animation did not reverse`);
  await position(anchor);
  await page.waitForTimeout(2300);
  assert.equal(await anchor.getAttribute("data-repeat-reveal"), "visible", `${name}: did not re-enter`);
  const replayed = await inspect(animated);
  assert.ok(replayed.opacity > .98, `${name}: replay left content hidden`);
  assert.equal(replayed.transform, shown.transform, `${name}: replay did not reach the same end pose`);
  report.push({ name, shown, hidden, replayed });
}

async function magnetOffset(page, anchor, mover) {
  await anchor.scrollIntoViewIfNeeded();
  await page.mouse.move(1, 1);
  await page.waitForTimeout(2000);
  const original = await mover.evaluate((el) => { const m = new DOMMatrix(getComputedStyle(el).transform); return { x: m.m41, y: m.m42 }; });
  const rect = await anchor.boundingBox();
  await page.mouse.move(rect.x + rect.width / 2 + 80, rect.y + rect.height / 2 + 50);
  await page.waitForTimeout(1200);
  return mover.evaluate((el, before) => { const m = new DOMMatrix(getComputedStyle(el).transform); return { x: m.m41 - before.x, y: m.m42 - before.y }; }, original);
}

try {
  for (const width of widths) {
    const context = await browser.newContext({ viewport: { width, height: width < 600 ? 844 : 900 } });
    const page = await context.newPage();
    page.on("pageerror", (error) => errors.push(`${width}: ${error.message}`));
    let contactMagnet;
    let ctaMagnet;
    for (const route of ["/contact", "/projects", "/about", "/"]) {
      await page.goto(baseURL + route, { waitUntil: "domcontentloaded" });
      await page.waitForFunction(() => window.__pageIntroDoneForPath === location.pathname);
      await page.waitForTimeout(2500);
      assert.equal(await page.locator("[data-page-intro]").count(), 0, "completed intro must unmount");
      assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 2), `${width}${route}: overflow`);
      const section = page.locator("main section[data-scroll-reveal='sequence']").first();
      await cycle(page, section, section.locator(".motion-letter").first(), `${width}${route}: section heading`);
      if (route === "/" || route === "/about") {
        const button = page.getByRole("button", { name: route === "/" ? "What I Care About" : "Interface Stack" });
        await button.click();
        assert.equal(await button.getAttribute("aria-expanded"), "true", `${width}${route}: accordion click did not open the requested panel`);
        const accordion = button.locator("xpath=ancestor::section[1]");
        const line = accordion.locator(route === "/" ? '[aria-hidden="false"] [data-accordion-line]' : '[aria-hidden="false"] [data-tech-line]').first();
        await cycle(page, accordion, line, `${width}${route}: accordion content`);
      }
      const cta = page.locator(".collaboration-scene");
      if (await cta.count()) {
        await cycle(page, cta, cta.locator(".motion-letter").first(), `${width}${route}: CTA`);
        if (width === 1440 && !ctaMagnet) {
          const mover = cta.locator("p [data-cta-follow]");
          ctaMagnet = await magnetOffset(page, cta.locator("p[data-cta-detail]"), mover);
        }
      }
      if (route === "/contact" && width === 1440) {
        contactMagnet = await magnetOffset(page, page.locator("[data-contact-note-anchor]").first(), page.locator("[data-contact-note]").first());
      }
      if (route === "/projects") {
        const card = page.locator("[data-project-card-reveal]").first();
        await cycle(page, card, card.locator("[data-project-card-reveal-inner]"), `${width}: project card`);
        await card.locator("article").click();
        await page.getByRole("dialog").waitFor();
        await page.keyboard.press("Escape");
        await page.getByRole("dialog").waitFor({ state: "detached" });
        await page.getByRole("textbox", { name: "Search projects" }).fill("no-such-project");
        assert.equal(await page.locator("[data-project-card-reveal]").count(), 0);
        await page.getByRole("textbox", { name: "Search projects" }).fill("");
        await cycle(page, page.locator("[data-project-card-reveal]").first(), page.locator("[data-project-card-reveal-inner]").first(), `${width}: filtered card replay`);
      }
      const footer = page.locator("footer");
      await cycle(page, footer, footer.locator("[data-footer-primary]").first(), `${width}${route}: footer`);
      await page.screenshot({ path: `${output}/${width}-${route.replaceAll("/", "") || "home"}.png` });
      assert.deepEqual(errors, [], `${width}${route}: browser errors`);
      console.log(`PASS ${width} ${route}`);
    }
    if (width === 1440) {
      assert.ok(Math.abs(contactMagnet.x - ctaMagnet.x) < 1 && Math.abs(contactMagnet.y - ctaMagnet.y) < 1, `magnet mismatch: ${JSON.stringify({ contactMagnet, ctaMagnet })}`);
      report.push({ name: "equal magnet displacement", contactMagnet, ctaMagnet });
    }
    await page.getByRole("button", { name: "Open navigation" }).click();
    await page.waitForTimeout(1800);
    await page.getByRole("button", { name: "Close navigation" }).click();
    await page.locator("#site-menu").waitFor({ state: "detached" });
    await context.close();
  }
  const reduced = await browser.newContext({ viewport: { width: 390, height: 844 }, reducedMotion: "reduce" });
  const page = await reduced.newPage();
  page.on("pageerror", error => errors.push(error.message));
  for (const route of ["/", "/about", "/projects", "/contact"]) {
    await page.goto(baseURL + route, { waitUntil: "domcontentloaded" });
    await page.waitForFunction(() => window.__pageIntroDoneForPath === location.pathname);
    assert.ok(await page.locator("h1").isVisible());
    assert.equal(await page.locator(".pin-spacer").count(), 0);
  }
  await reduced.close();
  assert.deepEqual(errors, []);
} finally {
  await writeFile(`${output}/report.json`, JSON.stringify({ report, errors }, null, 2));
  await browser.close();
}
