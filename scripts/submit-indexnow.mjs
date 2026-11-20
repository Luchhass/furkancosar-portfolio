import { randomUUID } from "node:crypto";
import { SEO_LOCALES, SITE_URL, siteRoutes } from "../src/lib/seo.js";
import { localizedPath } from "../src/lib/localizedRoutes.js";

const args = process.argv.slice(2);
if (args.length === 1 && args[0] === "--generate-key") {
  console.log(randomUUID().replaceAll("-", ""));
  process.exit(0);
}

const send = args.includes("--send");
const paths = args.filter(arg => arg !== "--send");
const known = new Set(siteRoutes.flatMap(({ path }) => SEO_LOCALES.map(locale => localizedPath(path, locale))));
if (paths.length === 0 || paths.some(path => !known.has(path))) {
  throw new Error("Specify changed canonical paths, such as /projects /tr/projects. Add --send to submit.");
}

const origin = new URL(SITE_URL);
if (origin.protocol !== "https:" || !origin.hostname.includes(".") || process.env.SEO_NOINDEX === "true" || process.env.VERCEL_ENV === "preview") {
  throw new Error("IndexNow submission requires the public HTTPS production origin.");
}
const urlList = [...new Set(paths)].map(path => new URL(path, origin).href);
if (!send) {
  console.log("Preview only. Changed URLs:\n" + urlList.join("\n"));
  process.exit(0);
}

const key = process.env.INDEXNOW_KEY?.trim();
if (!key || !/^[a-zA-Z0-9-]{8,128}$/.test(key)) throw new Error("Set a valid INDEXNOW_KEY in production and locally.");
const keyLocation = new URL(`/${key}.txt`, origin).href;
const requestOptions = { redirect: "error", signal: AbortSignal.timeout(10000) };
const [keyResponse, sitemapResponse, ...pages] = await Promise.all([keyLocation, new URL("/sitemap.xml", origin), ...urlList]
  .map(url => fetch(url, requestOptions)));
if (!keyResponse.ok || (await keyResponse.text()).trim() !== key) throw new Error("The deployed IndexNow key could not be verified.");
if (!sitemapResponse.ok) throw new Error("The production sitemap did not respond successfully.");
const sitemap = await sitemapResponse.text();
if (urlList.some((url, i) => !sitemap.includes(`<loc>${url}</loc>`) || !pages[i].ok || /\bnoindex\b/i.test(pages[i].headers.get("x-robots-tag") || ""))) {
  throw new Error("One or more URLs are missing from the live sitemap or cannot be indexed.");
}

const response = await fetch("https://api.indexnow.org/indexnow", {
  method: "POST",
  headers: { "Content-Type": "application/json; charset=utf-8" },
  body: JSON.stringify({ host: origin.host, key, keyLocation, urlList }),
  ...requestOptions,
});
if (![200, 202].includes(response.status)) throw new Error(`IndexNow returned HTTP ${response.status}.`);
console.log(`IndexNow accepted ${urlList.length} URL(s) (HTTP ${response.status}).`);
