import assert from "node:assert/strict";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { chromium } from "playwright";
import { PRIMARY_COLOR } from "../src/data/brand.js";
import { ROUTE_SEO, SEO_LOCALES, SOCIAL_SIZE, siteRoutes } from "../src/lib/seo.js";

const publicDir = new URL("../public/", import.meta.url);
const font = await readFile(new URL("../node_modules/next/dist/next-devtools/server/font/geist-latin.woff2", import.meta.url));
const { width, height } = SOCIAL_SIZE;
const colors = { background: "#141414", foreground: "#ffffff", accent: PRIMARY_COLOR };
const routeShapes = {
  home: '<path d="m86 108-36 36 36 36m108-72 36 36-36 36m-41-86-27 100"/>',
  about: '<circle cx="140" cy="107" r="25"/><path d="M77 200a63 50 0 0 1 126 0"/>',
  projects: '<rect x="57" y="82" width="166" height="124" rx="12"/><path d="M57 111h166m-140-14h1m14 0h1m14 0h1m-21 48h35v33H93zm60 0h35m-35 17h35m-35 16h25"/>',
  contact: '<rect x="55" y="91" width="170" height="106" rx="12"/><path d="m63 105 77 54 77-54"/>',
};

// This monogram is a vector so even the smallest favicon has a clean edge.
function iconSvg(maskable = false) {
  const transform = maskable ? "translate(12 12) scale(.76)" : "";
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
    <rect width="100" height="100" fill="${colors.accent}"/>
    <g fill="${colors.foreground}" transform="${transform}">
      <path d="M19 26h35v10H30v10h17v10H30v18H19z"/>
      <path d="M83 34l-8 7a14 14 0 1 0 0 18l8 7a24 24 0 1 1 0-32z"/>
    </g>
  </svg>`;
}

function makeIco(images) {
  const header = Buffer.alloc(6 + images.length * 16);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(images.length, 4);
  let offset = header.length;
  images.forEach(({ size, png }, i) => {
    const entry = 6 + i * 16;
    header[entry] = size;
    header[entry + 1] = size;
    header.writeUInt16LE(1, entry + 4);
    header.writeUInt16LE(32, entry + 6);
    header.writeUInt32LE(png.length, entry + 8);
    header.writeUInt32LE(offset, entry + 12);
    offset += png.length;
  });
  return Buffer.concat([header, ...images.map(image => image.png)]);
}

async function save(relativePath, data) {
  const file = new URL(relativePath, publicDir);
  await mkdir(new URL(".", file), { recursive: true });
  await writeFile(file, data);
}

const escape = text => text.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
const hexagons = Array.from({ length: 126 }, (_, i) => {
  const row = Math.floor(i / 14);
  const x = (i % 14) * 96 + (row % 2) * 48;
  const y = row * 83;
  return `<path d="m${x} ${y} 47-27 47 27v54l-47 27-47-27z" fill="${i % 5 === 0 ? "#1b1b1e" : "#18181a"}" stroke="#262629"/>`;
}).join("");

function socialCard(key, locale) {
  const { imageHeading: [first, second], imageCaption, label } = ROUTE_SEO[key][locale];
  return `<!doctype html><html lang="${locale}"><meta charset="utf-8"><style>
  @font-face { font-family: Geist; src: url(data:font/woff2;base64,${font.toString("base64")}); font-weight: 100 900; }
  * { box-sizing: border-box; }
  html, body { margin: 0; width: ${width}px; height: ${height}px; overflow: hidden; background: ${colors.background}; color: white; }
  body { font-family: Geist, Arial, sans-serif; }
  .texture { position: absolute; inset: 0; }
  .card { position: absolute; inset: 48px 60px; padding: 30px 37px; border: 1px solid #ffffff35; display: grid; grid-template-rows: 44px 1fr 45px; background: #141414bd; }
  .brand, .footer { display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid #ffffff35; font-size: 23px; font-weight: 850; letter-spacing: -.045em; }
  .brand div { display: flex; align-items: center; gap: 12px; }
  .brand div svg { width: 27px; height: 27px; }
  .brand small, .footer span { text-transform: uppercase; font-size: 15px; letter-spacing: .11em; color: #d3d3d3; }
  main { display: grid; grid-template-columns: 1fr 280px; align-items: center; gap: 20px; }
  h1 { margin: 0; font-size: 103px; font-weight: 900; line-height: .97; letter-spacing: -.063em; }
  h1 span { display: block; color: #ff7845; }
  .caption { margin: 24px 0 0; color: #e1e1e1; font-size: 24px; font-weight: 550; }
  .footer { align-self: end; border: 0; border-top: 1px solid #ffffff35; padding-top: 12px; }
  .footer span:first-child { color: #ff7845; }
  </style><body>
  <svg class="texture" width="${width}" height="${height}" aria-hidden="true">${hexagons}</svg>
  <div class="card">
    <header class="brand"><div>${iconSvg()} FURKAN COŞAR</div><small>${escape(label)} · ${locale.toUpperCase()}</small></header>
    <main><div><h1>${escape(first)}<span>${escape(second)}</span></h1><p class="caption">${escape(imageCaption)}</p></div>
    <svg width="280" height="280" viewBox="0 0 280 280" aria-hidden="true">
      <circle cx="140" cy="143" r="124" fill="#1b1b1e" stroke="#ffffff25"/>
      <circle cx="140" cy="143" r="106" fill="none" stroke="#ffffff40" stroke-dasharray="2 9"/>
      <g stroke="#ff7845" stroke-width="6" fill="none" stroke-linecap="round" stroke-linejoin="round">${routeShapes[key]}</g>
    </svg></main>
    <footer class="footer"><span>FURKANCOSAR.COM</span><span>ISTANBUL · TÜRKİYE</span></footer>
  </div></body></html>`;
}

const browser = await chromium.launch({ channel: "chrome" });
try {
  const page = await browser.newPage({ viewport: { width, height }, deviceScaleFactor: 1 });
  const rasterize = async (size, maskable) => {
    await page.setViewportSize({ width: size, height: size });
    await page.setContent(`<style>body{margin:0}svg{display:block;width:100vw;height:100vh}</style>${iconSvg(maskable)}`);
    return page.screenshot({ type: "png" });
  };

  await save("brand/favicons/icon.svg", iconSvg());
  await save("icon.svg", iconSvg());
  const ico = [];
  for (const size of [16, 32, 48, 96]) {
    const png = await rasterize(size, false);
    await save(`brand/favicons/favicon-${size}.png`, png);
    if (size <= 48) {
      ico.push({ size, png });
      await save(`favicon-${size}x${size}.png`, png);
    }
  }
  await save("favicon.ico", makeIco(ico));
  const touchIcon = await rasterize(180, false);
  await save("apple-touch-icon.png", touchIcon);
  await save("apple-icon.png", touchIcon);
  await save("apple-icon.svg", iconSvg());
  for (const size of [192, 512, 1024]) {
    const png = await rasterize(size, false);
    await save(`icon-${size}.png`, png);
    if (size === 1024) continue;
    await save(`brand/pwa/icon-any-${size}.png`, png);
    await save(`brand/pwa/icon-maskable-${size}.png`, await rasterize(size, true));
  }
  await page.setViewportSize({ width, height });
  for (const locale of SEO_LOCALES) {
    for (const { key } of siteRoutes) {
      await page.setContent(socialCard(key, locale));
      await page.evaluate(() => document.fonts.ready);
      const fits = await page.locator("h1").evaluate(heading => heading.scrollWidth <= heading.clientWidth);
      assert.ok(fits, `${locale}/${key} sharing headline overflows`);
      await save(`brand/social/${locale}/${key}.jpg`, await page.screenshot({ type: "jpeg", quality: 92 }));
    }
  }
  console.log("Generated responsive brand icons and eight 1200 × 630 social cards.");
} finally {
  await browser.close();
}
