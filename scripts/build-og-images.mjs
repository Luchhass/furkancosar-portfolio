import { PRIMARY_COLOR } from "../src/data/brand.js";
import { readFile, writeFile, mkdir, mkdtemp, access } from "node:fs/promises";
import { tmpdir } from "node:os";
import { resolve, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { createRequire } from "node:module";
import { spawn } from "node:child_process";
import assert from "node:assert/strict";

const require = createRequire(import.meta.url);
const root = fileURLToPath(new URL("../", import.meta.url));
const output = resolve(root, "public/social/og-home.png");
const preview = resolve(root, ".artifacts/og-preview");
const chrome = process.env.OG_CHROME_PATH || "C:/Program Files/Google/Chrome/Application/chrome.exe";
await access(chrome);
const workspace = await mkdtemp(join(tmpdir(), "furkancosar-og-"));
await mkdir(resolve(root, "public/social"), { recursive: true });
await mkdir(preview, { recursive: true });
const font = await readFile(require.resolve("next/dist/next-devtools/server/font/geist-latin.woff2"));
// Match the homepage canvas geometry, noise and face shading.
const cellWidth = Math.min(65, Math.max(42, 1732 * .0375)) * Math.SQRT2;
const cellHeight = cellWidth * 1.15;
const columns = Math.ceil(1732 / (cellWidth * 1.01)) + 4;
const rows = Math.ceil(908 / (cellHeight * .758)) + 4;
const hexagons = Array.from({ length: columns * rows }, (_, index) => {
  const column = index % columns, row = Math.floor(index / columns);
  const x = -cellWidth * 1.35 + column * cellWidth * 1.01 + (row % 2 ? cellWidth * 1.01 * .5 : 0) + cellWidth * .5;
  const y = -cellHeight * 1.25 + row * cellHeight * .758 + cellHeight * .5;
  const noise = Math.sin((row + 1) * 127.1 + (column + 1) * 311.7);
  const shade = 4 + Math.floor((noise - Math.floor(noise)) * 24);
  const w = cellWidth * .982 / 2, h = cellHeight * .982 / 2;
  return `<polygon points="${x},${y - h} ${x + w},${y - h * .5} ${x + w},${y + h * .5} ${x},${y + h} ${x - w},${y + h * .5} ${x - w},${y - h * .5}" fill="rgb(${shade + 12},${shade + 12},${shade + 14})" stroke="#ffffff0a" stroke-width=".65"/>`;
}).join("");
const html = `<!doctype html><html lang="en"><meta charset="utf-8"><title>Furkan Cosar — homepage social preview</title><style>
@font-face{font-family:Geist;src:url(data:font/woff2;base64,${font.toString("base64")}) format('woff2');font-weight:100 900;font-style:normal}
*{box-sizing:border-box}html,body{margin:0;width:1732px;height:908px;overflow:hidden;background:#030303;color:white}
body{font-family:Geist,Arial,sans-serif;-webkit-font-smoothing:antialiased}
.texture{position:absolute;inset:0}
main{position:absolute;inset:0;display:grid;place-items:center;padding:0 96px;text-align:center}
h1{display:grid;justify-items:center;gap:0;margin:0;font-size:clamp(116px,10.5vw,182px);font-weight:900;line-height:.94;letter-spacing:-.04em;white-space:nowrap;color:#fff}
h1 span{display:block}
h1 .primary{color:${PRIMARY_COLOR}}
</style><body><svg class="texture" width="1732" height="908" viewBox="0 0 1732 908" aria-hidden="true">${hexagons}</svg>
<main><h1><span>FURKAN</span><span>FRONTEND</span><span class="primary">DEVELOPER</span></h1></main></body></html>`;
const htmlPath = join(preview, "og-home.html");
await writeFile(htmlPath, html);
const screenshot = join(preview, "og-home.png");
await new Promise((done, fail) => {
  const child = spawn(chrome, ["--headless", "--disable-gpu", "--no-first-run", "--no-default-browser-check", "--hide-scrollbars", "--force-device-scale-factor=1", "--window-size=1732,908", "--virtual-time-budget=2500", `--user-data-dir=${join(workspace, "chrome")}`, `--screenshot=${screenshot}`, pathToFileURL(htmlPath).href], { windowsHide: true, stdio: ["ignore", "ignore", "pipe"] });
  let errors = "";
  child.stderr.on("data", chunk => { errors += chunk; });
  child.on("error", fail);
  child.on("exit", code => code === 0 ? done() : fail(new Error(errors)));
});
const png = await readFile(screenshot);
assert.equal(png.subarray(1, 4).toString(), "PNG");
assert.equal(png.readUInt32BE(16), 1732);
assert.equal(png.readUInt32BE(20), 908);
await writeFile(output, png);
console.log("Homepage OG saved: public/social/og-home.png (1732 × 908). HTML preview: .artifacts/og-preview/og-home.html");
