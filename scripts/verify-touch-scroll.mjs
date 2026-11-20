import assert from "node:assert/strict";
import { chromium } from "@playwright/test";

const base = process.env.TEST_URL ?? "http://localhost:3001";
const browser = await chromium.launch({ channel: "chrome" });
const errors = [];

async function contact(options, fallback = false) {
  const context = await browser.newContext(options);
  await context.route(/googletagmanager|google-analytics/, route => route.abort());
  await context.addInitScript(({ fallback }) => {
    if (fallback) {
      for (let proto = document; proto; proto = Object.getPrototypeOf(proto)) {
        if (Object.hasOwn(proto, "onscrollend")) delete proto.onscrollend;
      }
    }
    window.traceScroll = [];
    const scrollTo = window.scrollTo;
    window.scrollTo = function (options, ...args) {
      if (typeof options === "object" && options.behavior === "instant") {
        window.traceScroll.push({ type: "alignment", y: options.top, time: performance.now() });
      }
      return scrollTo.call(window, options, ...args);
    };
    window.addEventListener("scrollend", event => {
      if (event.isTrusted && event.target === document) {
        window.traceScroll.push({ type: "native-end", y: scrollY, time: performance.now() });
      }
    }, true);
    window.addEventListener("scroll", () => {
      window.traceScroll.push({ type: "position", y: scrollY });
    }, { passive: true });
  }, { fallback });
  const page = await context.newPage();
  page.on("pageerror", error => errors.push(error.message));
  await page.goto(base + "/contact", { waitUntil: "domcontentloaded" });
  await page.waitForFunction(() => window.__pageIntroDoneForPath === location.pathname);
  await page.waitForFunction(() => document.documentElement.classList.contains("lenis"));
  assert.equal(await page.evaluate(() => "onscrollend" in document), !fallback);
  const target = await page.locator("main .ui-screen").first().evaluate(element =>
    Math.round(scrollY + element.getBoundingClientRect().top));
  return { context, page, target };
}

async function prepare(page, y) {
  await page.evaluate(y => scrollTo(0, y), y);
  await page.waitForTimeout(300);
  await page.evaluate(() => { window.traceScroll = []; });
}

async function swipe(client, direction, hold = false) {
  const x = 24;
  const y = 440;
  const send = (type, touchPoints) => client.send("Input.dispatchTouchEvent", { type, touchPoints });
  await send("touchStart", [{ x, y }]);
  for (let index = 1; index <= 4; index++) {
    await send("touchMove", [{ x, y: y - direction * index * 10 }]);
  }
  if (!hold) await send("touchEnd", []);
}

async function assertStable(page, target) {
  await page.waitForFunction(y => scrollY === y, target);
  await page.waitForTimeout(500);
  assert.equal(await page.evaluate(() => scrollY), target);
  const positions = await page.evaluate(() => traceScroll.filter(event => event.type === "position").map(event => event.y));
  const arrival = positions.indexOf(target);
  assert.notEqual(arrival, -1);
  assert.ok(positions.slice(arrival).every(y => y === target), "The page moved after reaching the section");
}

const mobile = { viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true };
try {
  const modern = await contact(mobile);
  const client = await modern.context.newCDPSession(modern.page);
  for (const direction of [1, -1]) {
    await prepare(modern.page, modern.target - direction * 90);
    const hold = direction === -1;
    await swipe(client, direction, hold);
    if (hold) {
      await modern.page.waitForTimeout(250);
      assert.equal(await modern.page.evaluate(() => traceScroll.some(event => event.type === "alignment")), false);
      await client.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
    }
    await assertStable(modern.page, modern.target);
    const trace = await modern.page.evaluate(() => traceScroll.filter(event => event.type !== "position"));
    assert.equal(trace[0]?.type, "native-end");
    assert.ok(trace.some(event => event.type === "alignment"));
    console.log("Chrome mobile release and document scrollend precede alignment, direction " + direction);
  }
  await modern.context.close();

  const legacy = await contact(mobile, true);
  const legacyClient = await legacy.context.newCDPSession(legacy.page);
  for (const direction of [1, -1]) {
    await prepare(legacy.page, legacy.target - direction * 90);
    await swipe(legacyClient, direction);
    await legacy.page.evaluate(async direction => {
      // Model the last few pixels of native inertia after releasing the finger.
      for (let frame = 0; frame < 9; frame++) {
        await new Promise(resolve => setTimeout(resolve, 40));
        scrollTo(0, scrollY + direction);
      }
    }, direction);
    assert.equal(await legacy.page.evaluate(() => traceScroll.some(event => event.type === "alignment")), false,
      "Alignment started while the simulated momentum tail was still moving the page");
    await assertStable(legacy.page, legacy.target);
    console.log("Chrome legacy fallback waits through continued movement, direction " + direction);
  }
  await legacy.context.close();

  const desktop = await contact({ viewport: { width: 1440, height: 900 } });
  await prepare(desktop.page, desktop.target - 120);
  await desktop.page.mouse.move(24, 440);
  await desktop.page.mouse.wheel(0, 40);
  await assertStable(desktop.page, desktop.target);
  assert.deepEqual(errors, []);
  console.log("Desktop wheel alignment and stable final position passed");
} finally {
  await browser.close();
}
