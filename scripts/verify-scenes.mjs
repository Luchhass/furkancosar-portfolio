import { chromium } from "@playwright/test";
import assert from "node:assert/strict";
import { mkdir } from "node:fs/promises";

const browser = await chromium.launch({ channel: "chrome", headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
const errors = [];
page.on("pageerror", (error) => errors.push(error.message));
await mkdir(".artifacts/motion", { recursive: true });
async function open(route) {
  await page.goto(`http://localhost:3000${route}`, { waitUntil: "networkidle" });
  await page.waitForFunction(() => window.__pageIntroDoneForPath === location.pathname);
  await page.waitForTimeout(2800);
}
async function capture(selector, name, offset = 0) {
  await page.locator(selector).first().evaluate((el, dy) => window.scrollTo(0, scrollY + el.getBoundingClientRect().top - dy), offset);
  await page.waitForTimeout(1700);
  await page.screenshot({ path: `.artifacts/motion/scene-${name}.png` });
}
try {
  await open("/");
  await page.screenshot({ path: ".artifacts/motion/scene-hero-final.png" });
  await capture(".highlights-scene", "highlights");
  const gallery = page.locator(".gallery-viewport");
  const firstScroll = await gallery.evaluate((el) => el.scrollLeft);
  await page.evaluate(() => window.scrollBy(0, 700)); await page.waitForTimeout(1500);
  assert.ok(await gallery.evaluate((el) => el.scrollLeft) > firstScroll + 100, "pinned gallery must advance with vertical scroll");
  await page.screenshot({ path: ".artifacts/motion/scene-highlights-scroll.png" });
  await page.locator(".highlights-scene .project-card-motion").nth(2).click();
  await page.waitForTimeout(1100);
  const modal = await page.locator(".project-modal-panel").boundingBox();
  assert.ok(Math.abs(modal.x) < 1 && Math.abs(modal.y) < 1 && Math.abs(modal.width - 1440) < 1 && Math.abs(modal.height - 900) < 1, "details must cover the viewport, including from pinned sections");
  await page.screenshot({ path: ".artifacts/motion/scene-pinned-modal.png" });
  await page.keyboard.press("Escape"); await page.getByRole("dialog").waitFor({ state: "detached" });
  await capture(".collaboration-scene", "cta");
  await capture(".portfolio-footer", "footer");
  await page.setViewportSize({ width: 1440, height: 720 });
  await open("/");
  await capture(".highlights-scene", "highlights-short");
  const shortCard = await page.locator(".highlights-scene .project-card-motion").first().boundingBox();
  assert.ok(shortCard.y >= 100 && shortCard.y + shortCard.height <= 710, "gallery cards must fit short desktop viewport");
  await page.setViewportSize({ width: 1440, height: 900 });
  await open("/about");
  await capture(".about-intro-layout", "about-intro", 130);
  await capture(".journey-story", "journey");
  const first = page.locator(".journey-slide").first();
  const chapterBox = await first.boundingBox();
  assert.ok(chapterBox.y > 0 && chapterBox.y + chapterBox.height < 900, "journey must fit viewport");
  await page.evaluate(() => scrollBy(0, 1200)); await page.waitForTimeout(1600);
  await page.screenshot({ path: ".artifacts/motion/scene-journey-scroll.png" });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.waitForTimeout(800);
  assert.equal(await page.locator(".journey-deck").count(), 1, "mobile resize must retain the sticky presentation");
  await page.setViewportSize({ width: 1440, height: 900 });
  await open("/contact");
  await capture(".contact-scene-grid", "contact", 130);
  await page.route("**/api/contact", (route) => route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ message: "Preview only" }) }));
  await page.locator('[name="name"]').fill("Animation preview"); await page.locator('[name="email"]').fill("preview@example.com");
  await page.locator('[name="phone"]').fill("+90 555 123 45 67");
  await page.locator('[name="project"]').fill("Portfolio website"); await page.locator('[name="message"]').fill("Visual verification; request is intercepted locally.");
  await page.getByRole("button", { name: "SEND MESSAGE" }).click();
  await page.getByRole("dialog").waitFor(); await page.waitForTimeout(1100);
  await page.screenshot({ path: ".artifacts/motion/scene-contact-result.png" });
  await page.getByRole("button", { name: "CLOSE", exact: true }).click();
  await page.evaluate(() => scrollTo(0, 0));
  await page.getByRole("button", { name: "Open navigation", exact: true }).click();
  await page.waitForTimeout(3400); await page.screenshot({ path: ".artifacts/motion/scene-navigation.png" });
  for (const link of await page.locator("[data-menu-nav-item]").all()) {
    const box = await link.boundingBox();
    assert.ok(box.x >= 0 && box.x + box.width <= 1440, "menu links must settle inside viewport");
  }
  await page.getByRole("navigation", { name: "Main menu", exact: true }).getByRole("link", { name: "About", exact: true }).click();
  await page.waitForURL("**/about"); await page.waitForTimeout(3500);
  assert.equal(await page.locator("h1").count(), 1, "client navigation must preserve hero");
  await page.setViewportSize({ width: 390, height: 844 });
  await capture(".collaboration-scene", "cta-mobile");
  const mobileTitle = await page.locator(".cta-center h2").boundingBox();
  assert.ok(mobileTitle.x >= 0 && mobileTitle.x + mobileTitle.width <= 390, "CTA title must fit mobile");
  assert.deepEqual(errors, [], "scene browser errors");
  console.log("PASS pinned gallery, pinned modal, journey fit, responsive unpin, mocked form result, client navigation");
} finally { await browser.close(); }
