import { chromium } from "@playwright/test";
import assert from "node:assert/strict";

const browser = await chromium.launch({ channel: "chrome" });
try {
  for (const width of [1440, 390]) {
    const page = await browser.newPage({ viewport: { width, height: 900 } });
    const errors = [];
    page.on("pageerror", error => errors.push(error.message));
    for (const route of ["/", "/about", "/projects", "/contact"]) {
      await page.goto(`http://localhost:3000${route}`);
      await page.waitForFunction(() => window.__pageIntroDoneForPath === location.pathname);
      const cases = [
        [page.locator("[data-hero-title]").first(), false],
        [page.locator("[data-hero-title]").nth(1), true],
        [page.locator("[data-reveal-part='title'] [data-title-reveal]").first(), false],
        [page.locator("footer h2 [data-footer-primary]").first(), false],
      ];
      if (route === "/") cases.push([page.locator("[data-cta-title]").first(), false], [page.locator("[data-cta-title]").nth(1), true], [page.locator(".identity-title-reveal"), false]);
      if (route === "/about") cases.push([page.locator("[data-toolkit-title]").first(), false], [page.locator(".journey-line").first(), false]);
      for (const [target, fromRight] of cases) {
        const anchor = target.locator("xpath=ancestor-or-self::*[@data-repeat-reveal][1]");
        await anchor.evaluate(el => scrollTo(0, scrollY + el.getBoundingClientRect().top > innerHeight ? 0 : innerHeight * 2));
        await page.waitForTimeout(450);
        const frames = await target.evaluate(async el => {
          const anchor = el.closest("[data-repeat-reveal]");
          scrollTo(0, scrollY + anchor.getBoundingClientRect().top - innerHeight * .3);
          const frames = [];
          const start = performance.now();
          while (performance.now() - start < 400) {
            await new Promise(requestAnimationFrame);
            const s = getComputedStyle(el);
            const m = new DOMMatrix(s.transform);
            frames.push({ x: m.m41, y: m.m42, a: m.a, b: m.b, c: m.c, d: m.d, is2D: m.is2D, opacity: Number(s.opacity) });
          }
          return frames;
        });
        assert.ok(frames.some(frame => fromRight ? frame.x > 1 : frame.x < -1), `${route} ${await target.textContent()}: correct entrance direction`);
        assert.ok(frames.every(f => f.is2D && f.a === 1 && f.d === 1 && f.b === 0 && f.c === 0 && f.y === 0 && f.opacity === 1), "Title entrance only translates horizontally, without scale, opacity or 3D");
        await page.waitForTimeout(1000);
        assert.ok(await target.evaluate(el => Math.abs(new DOMMatrix(getComputedStyle(el).transform).m41) < 1), "Title reaches its original resting position");
        assert.ok(await target.evaluate(el => ["hidden", "clip"].includes(getComputedStyle(el.parentElement).overflowX)), "Entrance stays inside a mask");
      }
      if (width === 1440 && route === "/") {
        const identity = page.locator(".identity-title-reveal");
        await identity.scrollIntoViewIfNeeded();
        await page.waitForTimeout(1200);
        await identity.locator(".identity-letter").first().dispatchEvent("pointerover", { pointerType: "mouse" });
        await page.waitForTimeout(100);
        assert.ok(await identity.locator(".identity-letter").first().evaluate(el => new DOMMatrix(getComputedStyle(el).transform).m42 < -1), "Identity letter hover is preserved");
        const hero = page.locator(".ui-hero");
        await page.evaluate(() => scrollTo(0, 0));
        await page.waitForTimeout(1800);
        const tiltBefore = await hero.locator("h1").evaluate(el => getComputedStyle(el).transform);
        await page.mouse.move(width / 2 + 150, 400);
        await page.waitForTimeout(800);
        assert.notEqual(await hero.locator("h1").evaluate(el => getComputedStyle(el).transform), tiltBefore, "Hero pointer tilt is preserved");
        const cta = page.locator(".collaboration-scene");
        await cta.scrollIntoViewIfNeeded();
        await page.mouse.move(1, 1);
        await page.waitForTimeout(1600);
        const follower = cta.locator("h2 > [data-cta-follow]").first();
        const before = await follower.evaluate(el => { const m = new DOMMatrix(getComputedStyle(el).transform); return { x: m.m41, y: m.m42 }; });
        const rect = await cta.locator("h2").boundingBox();
        await page.mouse.move(rect.x + rect.width / 2 + 80, rect.y + rect.height / 2 + 50);
        await page.waitForTimeout(800);
        const after = await follower.evaluate(el => { const m = new DOMMatrix(getComputedStyle(el).transform); return { x: m.m41, y: m.m42 }; });
        assert.ok(Math.hypot(after.x - before.x, after.y - before.y) > 2, "CTA magnet is preserved independently of the entrance");
      }
      console.log(`${width} ${route}: title directions, pure 2D motion and masks passed`);
    }
    assert.deepEqual(errors, []);
    await page.close();
  }
} finally { await browser.close(); }
