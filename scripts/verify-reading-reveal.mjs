import { chromium } from "@playwright/test";
import assert from "node:assert/strict";

const browser = await chromium.launch({ channel: "chrome" });
const errors = [];
async function verify(page, paragraph, name) {
  await paragraph.evaluate(el => {
    const top = scrollY + el.getBoundingClientRect().top;
    scrollTo(0, top > innerHeight ? 0 : top + innerHeight * 1.2);
  });
  await page.waitForFunction(el => el.dataset.repeatReveal === "hidden", await paragraph.elementHandle());
  await page.waitForTimeout(350);
  const frames = await paragraph.evaluate(async el => {
    scrollTo(0, scrollY + el.getBoundingClientRect().top - innerHeight * .3);
    const samples = [];
    const start = performance.now();
    while (performance.now() - start < 2200) {
      await new Promise(requestAnimationFrame);
      samples.push([...el.querySelectorAll(".reading-word")].filter(word => !word.closest("[data-about-highlight-fill]")).map(word => {
        const s = getComputedStyle(word);
        const mask = word.parentElement;
        const matrix = new DOMMatrix(s.transform);
        return { progress: 1 + matrix.m42 / (mask.getBoundingClientRect().height + 32), opacity: Number(s.opacity), x: matrix.m41, y: matrix.m42,
          mask: getComputedStyle(mask).overflowY };
      }));
    }
    return samples;
  });
  assert.ok(frames.some(frame => frame.length > 1), `${name}: word-level reveal`);
  let moving = false;
  for (const frame of frames) {
    if (frame.some(word => word.progress > .02 && word.progress < .98)) moving = true;
    if (frame.length) assert.ok(frame[0].progress + .03 >= frame.at(-1).progress, `${name}: words enter in reading order`);
    assert.ok(frame.every(word => word.opacity === 1 && word.x === 0 && word.y <= .1), `${name}: original solid downward slide`);
    assert.ok(frame.every(word => ["hidden", "clip"].includes(word.mask)), `${name}: every word stays in its own mask`);
  }
  assert.ok(moving, `${name}: visible smooth word entrances`);
  assert.ok(frames.at(-1).every(word => Math.abs(word.y) < .1), `${name}: complete readable paragraph`);
  assert.equal(await paragraph.locator(".reading-char, .reading-front-blur").count(), 0, `${name}: no character masks or blur copies`);
  console.log(`PASS ${name}`);
}
try {
  for (const width of [1440, 390]) {
    if (process.env.TEST_WIDTH && Number(process.env.TEST_WIDTH) !== width) continue;
    const page = await browser.newPage({ viewport: { width, height: 900 } });
    page.on("pageerror", error => errors.push(error.message));
    for (const route of ["/", "/about", "/projects", "/contact"]) {
      if (process.env.TEST_ROUTE && process.env.TEST_ROUTE !== route) continue;
      await page.goto(`http://localhost:3000${route}`);
      await page.waitForFunction(() => window.__pageIntroDoneForPath === location.pathname);
      await page.evaluate(() => document.fonts.ready);
      await page.waitForTimeout(300);
      await verify(page, page.locator(".ui-hero [data-reading-reveal]").nth(width >= 768 ? 1 : 0), `${width}${route} hero`);
      const selector = route === "/" ? '[aria-hidden="false"] [data-reading-reveal]' : route === "/about" ? '.about-now [data-reading-reveal]' : route === "/projects" ? '.ui-section-copy[data-reading-reveal]' : '.contact-description [data-reading-reveal]';
      await verify(page, page.locator(selector).first(), `${width}${route} body`);
      if (route === "/") {
        await page.getByRole("button", { name: "What I Care About" }).click();
        await verify(page, page.locator('[aria-hidden="false"] [data-reading-reveal]').first(), `${width} switched accordion`);
        await verify(page, page.locator('.cta-description [data-reading-reveal]'), `${width} CTA`);
      }
    }
    await page.setViewportSize({ width: width === 390 ? 768 : 1024, height: 900 });
    await page.waitForTimeout(1200);
    assert.ok(await page.locator('[data-reading-reveal] .reading-line').count() > 0, "Resize remeasures reading lines");
    await page.close();
  }
  const reduced = await browser.newPage({ reducedMotion: "reduce" });
  await reduced.goto("http://localhost:3000/contact");
  assert.equal(await reduced.locator(".reading-line").count(), 0, "Reduced motion keeps plain readable text");
  await reduced.close();
  assert.deepEqual(errors, []);
} finally { await browser.close(); }
