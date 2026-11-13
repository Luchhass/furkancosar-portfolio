import { chromium } from "@playwright/test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";

const browser = await chromium.launch({ channel: "chrome", headless: true });
const errors = [];
const hash = (value) => createHash("sha256").update(value).digest("hex");
try {
  for (const deviceScaleFactor of [1, 2]) {
    const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor });
    const page = await context.newPage();
    page.on("pageerror", (error) => errors.push(error.message));
    await page.goto("http://localhost:3000", { waitUntil: "networkidle" });
    await page.waitForFunction(() => window.__pageIntroDoneForPath === "/");
    await page.waitForTimeout(3000);
    const canvas = page.locator(".portfolio-hero canvas").last();
    const original = hash(await canvas.evaluate((el) => el.toDataURL()));
    for (let i = 0; i < 45; i++) { await page.mouse.move(400 + i * 12, 350 + Math.sin(i * .2) * 100); await page.waitForTimeout(16); }
    assert.notEqual(hash(await canvas.evaluate((el) => el.toDataURL())), original, "petals must still react to the pointer");
    await page.waitForTimeout(2600);
    await page.evaluate(() => {
      window.__cellBlits = 0;
      const original = CanvasRenderingContext2D.prototype.drawImage;
      const cells = document.querySelectorAll(".portfolio-hero canvas")[1];
      CanvasRenderingContext2D.prototype.drawImage = function (...args) { if (this.canvas === cells) window.__cellBlits++; return original.apply(this, args); };
    });
    await page.waitForTimeout(600);
    assert.equal(await page.evaluate(() => window.__cellBlits), 0, "stationary petal geometry must not be redrawn");
    await page.mouse.down(); await page.mouse.up();
    await page.waitForTimeout(3000);
    assert.equal(hash(await canvas.evaluate((el) => el.toDataURL())), original, `DPR ${deviceScaleFactor}: clearing the trail must restore the original pixels exactly`);
    await page.evaluate(() => scrollTo(0, 1600)); await page.waitForTimeout(1000);
    const runningOffscreen = await page.evaluate(() => document.getAnimations().filter((animation) => animation.constructor.name === "CSSAnimation" && animation.playState === "running" && animation.effect?.target?.closest('[data-motion-active="false"]')).length);
    assert.equal(runningOffscreen, 0, "offscreen CSS animations must pause");
    console.log(`PASS DPR ${deviceScaleFactor}: pointer reaction, cached stationary geometry, pixel-exact restoration, offscreen pause`);
    await context.close();
  }
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("http://localhost:3000/about", { waitUntil: "networkidle" });
  await page.waitForFunction(() => window.__pageIntroDoneForPath === "/about");
  const counters = page.locator("[data-reveal-counter]");
  for (const counter of await counters.all()) {
    const value = await counter.getAttribute("aria-label");
    if (!/^\d+$/.test(value)) continue;
    await counter.scrollIntoViewIfNeeded();
    let reading;
    for (let attempt = 0; attempt < 35; attempt++) {
    reading = await counter.evaluate((root) => Array.from(root.querySelectorAll(".absolute")).map((track) => {
      if (track.children.length > 11) throw new Error("Unbounded digit reel");
      const height = track.firstElementChild.getBoundingClientRect().height;
      const index = Math.round(-new DOMMatrix(getComputedStyle(track).transform).m42 / height);
      return track.children[index]?.textContent;
    }).join(""));
    if (reading === value.padStart(2, "0")) break;
    await page.waitForTimeout(300);
    }
    assert.equal(reading, value.padStart(2, "0"), "bounded digit reels must finish on the correct value");
  }
  const before = JSON.parse(await readFile(".artifacts/performance/before.json", "utf8"));
  const after = JSON.parse(await readFile(".artifacts/performance/after.json", "utf8"));
  assert.equal(after.staticCanvasHash, before.staticCanvasHash, "the original idle hero artwork must be pixel-identical");
  assert.deepEqual(errors, []);
  console.log("PASS correct bounded counters, original artwork hash, no browser errors");
} finally { await browser.close(); }
