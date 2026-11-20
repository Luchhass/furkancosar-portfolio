import assert from "node:assert/strict";
import { chromium } from "playwright";
import { SEO_LOCALES, SITE_URL, siteRoutes, SOCIAL_SIZE } from "../src/lib/seo.js";
import { localizedPath } from "../src/lib/localizedRoutes.js";

const base = new URL(process.env.TEST_URL || "http://localhost:3002");
const request = path => fetch(new URL(path, base), { redirect: "manual", signal: AbortSignal.timeout(30000) });
const browser = await chromium.launch({ channel: "chrome" });
let pwa;
try {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  const titles = new Set();
  const images = new Set();
  const descriptions = new Set();
  const [sitemapResponse, robotsResponse, llmsResponse] = await Promise.all(["/sitemap.xml", "/robots.txt", "/llms.txt"].map(request));
  const sitemap = await sitemapResponse.text();
  const robots = await robotsResponse.text();
  const llms = await llmsResponse.text();
  assert.match(sitemapResponse.headers.get("content-type"), /xml/);
  assert.match(llmsResponse.headers.get("content-type"), /text\/plain/);
  assert.match(llms, /^# Furkan Coşar/);
  assert.match(robots, /^Sitemap: .*\/sitemap\.xml$/m);
  for (const name of ["OAI-SearchBot", "Claude-SearchBot", "PerplexityBot"]) assert.ok(robots.includes(`User-Agent: ${name}`));

  for (const { path, key } of siteRoutes) {
    for (const locale of SEO_LOCALES) {
      const url = localizedPath(path, locale);
      const canonical = new URL(url, SITE_URL).href;
      const response = await page.goto(new URL(url, base).href);
      assert.equal(response?.status(), 200, url);
      assert.equal(await page.locator("html").getAttribute("lang"), locale, url);
      const seo = await page.evaluate(() => {
        const meta = (type, name) => document.head.querySelector(`meta[${type}="${name}"]`)?.content;
        const alternate = lang => document.head.querySelector(`link[rel="alternate"][hreflang="${lang}"]`)?.href;
        return {
          title: document.title,
          description: meta("name", "description"),
          robots: meta("name", "robots"),
          canonical: [...document.head.querySelectorAll('link[rel="canonical"]')].map(link => link.href),
          en: alternate("en"), tr: alternate("tr"), fallback: alternate("x-default"),
          graph: JSON.parse(document.querySelector("[data-route-jsonld]").textContent)["@graph"],
          ogUrl: meta("property", "og:url"),
          ogImage: meta("property", "og:image"),
          ogAlt: meta("property", "og:image:alt"),
          ogLocale: meta("property", "og:locale"),
          twitterCard: meta("name", "twitter:card"),
          twitterImage: meta("name", "twitter:image"),
          headings: document.querySelectorAll("main h1").length,
          placeholderLinks: document.querySelectorAll('a[href*="github.com/fake-user"], a[href*="-demo.vercel.app"]').length,
        };
      });
      assert.ok(seo.title && seo.description && seo.ogAlt);
      assert.doesNotMatch(seo.robots, /\bnoindex\b/);
      assert.deepEqual(seo.canonical, [canonical]);
      assert.equal(seo.en, new URL(path, SITE_URL).href);
      assert.equal(seo.tr, new URL(localizedPath(path, "tr"), SITE_URL).href);
      assert.equal(seo.fallback, seo.en);
      assert.equal(new URL(seo.ogUrl).href, canonical);
      assert.equal(seo.ogLocale, locale === "tr" ? "tr_TR" : "en_US");
      assert.equal(seo.headings, 1);
      assert.equal(await page.locator("[data-intro-prepaint]").isVisible(), false);
      assert.equal(await page.locator("[data-page-intro]").isVisible(), false);
      assert.equal(await page.locator("footer [data-language-link]").count(), 0);
      assert.equal(seo.placeholderLinks, 0);
      assert.ok(seo.graph.some(node => node["@type"] === "Person" && node.name === "Furkan Coşar"));
      assert.ok(seo.graph.some(node => node.url === canonical && node.inLanguage === locale));
      if (key === "about") assert.ok(seo.graph.find(node => node["@type"] === "ProfilePage")?.mainEntity?.["@id"]);
      if (key === "projects") {
        const study = page.locator("footer dialog#portfolio-case-study");
        assert.equal(await study.count(), 1);
        assert.equal(await study.isVisible(), false);
        assert.ok(await study.locator('a[href*="github.com/Luchhass/furkancosar-portfolio"]').count());
      }
      assert.equal(seo.twitterCard, "summary_large_image");
      assert.equal(seo.twitterImage, seo.ogImage);
      assert.ok(sitemap.includes(`<loc>${canonical}</loc>`));
      assert.ok(llms.includes(`(${canonical})`));
      titles.add(seo.title);
      descriptions.add(seo.description);
      images.add(seo.ogImage);
      const asset = await request(new URL(seo.ogImage).pathname);
      assert.match(asset.headers.get("content-type"), /image\/jpeg/);
      assert.ok(asset.ok && (await asset.arrayBuffer()).byteLength < 180_000);
      console.log(`PASS ${url} · server metadata, schema and social image`);
    }
  }
  const count = siteRoutes.length * SEO_LOCALES.length;
  for (const set of [titles, descriptions, images]) assert.equal(set.size, count);
  assert.equal((sitemap.match(/<loc>/g) || []).length, count);
  for (const language of [...SEO_LOCALES, "x-default"]) {
    assert.equal((sitemap.match(new RegExp(`hreflang="${language}"`, "g")) || []).length, count);
  }
  assert.equal((await request("/seo-missing-page")).status, 404);
  assert.equal((await request("/offline.html")).headers.get("x-robots-tag"), "noindex");
  await context.close();

  pwa = await chromium.launchPersistentContext("", { channel: "chrome", reducedMotion: "reduce" });
  const app = pwa.pages()[0];
  const manifest = await (await request("/manifest.webmanifest")).json();
  assert.equal(manifest.display, "standalone");
  assert.deepEqual(manifest.icons.map(icon => [icon.purpose, icon.sizes]), [
    ["any", "192x192"], ["any", "512x512"], ["maskable", "192x192"], ["maskable", "512x512"],
  ]);
  assert.deepEqual(manifest.screenshots.map(shot => shot.form_factor), ["wide", "narrow"]);
  await app.goto(base.href);
  const assets = [
    ...manifest.icons, ...manifest.screenshots,
    ...[...images].map(url => ({ src: new URL(url).pathname, sizes: `${SOCIAL_SIZE.width}x${SOCIAL_SIZE.height}` })),
  ];
  for (const { src, sizes } of assets) {
    const dimensions = await app.evaluate(async src => {
      const image = new Image();
      image.src = src;
      await image.decode();
      return `${image.naturalWidth}x${image.naturalHeight}`;
    }, src);
    assert.equal(dimensions, sizes, src);
  }
  await app.waitForFunction(() => navigator.serviceWorker.controller?.scriptURL.endsWith("/sw.js"));
  const cdp = await pwa.newCDPSession(app);
  const { installabilityErrors } = await cdp.send("Page.getInstallabilityErrors");
  assert.deepEqual(installabilityErrors, []);

  await app.waitForFunction(() => window.__pageIntroDoneForPath === location.pathname);
  await app.locator('button[aria-controls="site-menu"]').click();
  const language = app.locator("#site-menu [data-language-link]");
  assert.equal(await language.textContent(), "EN/TR");
  assert.equal(await language.getAttribute("data-active-language"), "en");
  assert.equal(await language.getAttribute("href"), "/tr");
  await language.click();
  await app.waitForURL("**/tr");
  assert.equal(await app.locator("html").getAttribute("lang"), "tr");
  assert.equal(await app.locator('link[rel="canonical"]').getAttribute("href"), new URL("/tr", SITE_URL).href);
  assert.equal(await language.getAttribute("data-active-language"), "tr");
  assert.equal(await language.getAttribute("href"), "/");
  await app.goto(new URL("/tr/projects", base).href);
  await app.waitForFunction(() => window.__pageIntroDoneForPath === location.pathname);
  await app.locator('footer button[aria-controls="portfolio-case-study"]').click();
  const study = app.getByRole("dialog", { name: /portfolyosunu/ });
  assert.equal(await study.isVisible(), true);
  await app.keyboard.press("Escape");
  await study.waitFor({ state: "hidden" });
  const offlinePath = new URL("/about", base).href;
  await pwa.setOffline(true);
  assert.equal((await app.goto(offlinePath))?.status(), 503);
  assert.match(await app.locator("h1").textContent(), /offline/i);
  await pwa.setOffline(false);
  assert.equal((await app.reload())?.status(), 200);
  console.log("PASS sitemap, hreflang, crawlers, PWA installability and offline recovery");
} finally {
  await pwa?.close();
  await browser.close();
}
