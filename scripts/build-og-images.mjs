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
const gradients = Array.from({ length: 24 }, (_, index) => {
  const shade = index + 4;
  return `<linearGradient id="face-${shade}" x1="0" y1="0" x2="1" y2="1"><stop stop-color="rgb(${shade + 24},${shade + 24},${shade + 25})"/><stop offset=".48" stop-color="rgb(${shade + 10},${shade + 10},${shade + 12})"/><stop offset="1" stop-color="rgb(${shade},${shade},${shade + 2})"/></linearGradient>`;
}).join("");
const hexagons = Array.from({ length: columns * rows }, (_, index) => {
  const column = index % columns, row = Math.floor(index / columns);
  const x = -cellWidth * 1.35 + column * cellWidth * 1.01 + (row % 2 ? cellWidth * 1.01 * .5 : 0) + cellWidth * .5;
  const y = -cellHeight * 1.25 + row * cellHeight * .758 + cellHeight * .5;
  const noise = Math.sin((row + 1) * 127.1 + (column + 1) * 311.7);
  const shade = 4 + Math.floor((noise - Math.floor(noise)) * 24);
  const w = cellWidth * .982 / 2, h = cellHeight * .982 / 2;
  return `<polygon points="${x},${y - h} ${x + w},${y - h * .5} ${x + w},${y + h * .5} ${x},${y + h} ${x - w},${y + h * .5} ${x - w},${y - h * .5}" fill="url(#face-${shade})" stroke="#ffffff0a" stroke-width=".65"/>`;
}).join("");
const html = `<!doctype html><html lang="en"><meta charset="utf-8"><title>Furkan Cosar — homepage social preview</title><style>
@font-face{font-family:Geist;src:url(data:font/woff2;base64,${font.toString("base64")}) format('woff2');font-weight:100 900;font-style:normal}
*{box-sizing:border-box}html,body{margin:0;width:1732px;height:908px;overflow:hidden;background:#030303;color:white}
body{font-family:Geist,Arial,sans-serif;-webkit-font-smoothing:antialiased}
.texture{position:absolute;inset:0}.shade{position:absolute;inset:0;background:linear-gradient(#0001,#0001)}
header{position:absolute;left:64px;right:64px;top:38px;height:44px;display:flex;align-items:center;justify-content:space-between}
.tag{font-size:12px;font-weight:900}.tag:before{content:'';display:inline-block;width:8px;height:8px;border-radius:50%;background:linear-gradient(110deg,#ee4b67,#8b45ff);margin-right:8px}
.brand{position:absolute;left:50%;transform:translateX(-50%);font-size:30px;font-weight:900;letter-spacing:-.9px}.brand sup{font-size:10px;vertical-align:top;position:relative;top:5px;margin-left:4px}
.controls{display:flex;align-items:center;gap:28px;font-size:13px;font-weight:900}
.menu{width:28px;height:20px;border-top:3px solid white;border-bottom:3px solid white}.menu:after{content:'';display:block;margin-top:6px;border-top:3px solid white}
main{position:absolute;left:64px;right:64px;top:274px;text-align:center}h1{margin:0;font-size:120px;font-weight:900;line-height:1;letter-spacing:-4.8px}h1 span{display:block;width:max-content;margin:auto}.gradient{background:linear-gradient(90deg,#6768ff,#884cff,#a53cdd,#cf3d9f,#ee4b67,#cf3d9f,#884cff,#6768ff);background-size:260% 100%;background-position:50% 50%;background-clip:text;-webkit-background-clip:text;color:transparent}
.cue{position:absolute;right:64px;top:43%;display:flex;align-items:center;gap:20px;writing-mode:vertical-rl;font-size:10px;font-weight:900;letter-spacing:.12em}.cue svg{width:15px;height:68px}
footer{position:absolute;left:64px;right:64px;bottom:38px;display:flex;align-items:end;justify-content:space-between;font-size:14px;line-height:1.25;color:#eee}
.stat{display:flex;align-items:center;gap:12px;min-width:196px}.stat strong{font-size:32px;font-weight:900;line-height:.82}.stat p{margin:0;font-size:14px;font-weight:500}
.copy{position:absolute;bottom:0;left:50%;transform:translateX(-50%);margin:0;width:448px;text-align:center;font-size:14px;line-height:1.45;font-weight:500}
.button{height:56px;width:167px;display:flex;align-items:center;justify-content:center;gap:10px;border:1px solid transparent;background:linear-gradient(#080808,#080808) padding-box,linear-gradient(110deg,#884cff,#ee4b67) border-box;font-size:12px;font-weight:900;color:white}.dot{width:8px;height:8px;border-radius:50%;background:linear-gradient(110deg,#884cff,#ee4b67)}
</style><body><svg class="texture" width="1732" height="908" viewBox="0 0 1732 908" aria-hidden="true"><defs>${gradients}</defs>${hexagons}</svg><div class="shade"></div>
<header><span class="tag">SEE MY PROJECTS</span><span class="brand">FURKANCOSAR<sup>®</sup></span><span class="controls">EN<span class="menu"></span></span></header>
<main><h1><span>CREATIVE</span><span>FRONTEND</span><span class="gradient">DEVELOPER</span></h1></main>
<div class="cue">SCROLL TO EXPLORE<svg viewBox="0 0 15 68" fill="none"><path d="M7.5 0v65M1 59l6.5 7 6.5-7" stroke="white" stroke-width="1.5"/></svg></div>
<footer><div class="stat"><strong class="gradient">20</strong><p>completed projects<br>with modern interfaces</p></div><p class="copy">I build responsive, animated and user-focused web interfaces with React, Next.js, GSAP and Tailwind CSS. I turn ideas into clean, modern digital experiences across every screen.</p><div class="button"><span class="dot"></span>CONTACT ME</div></footer></body></html>`;
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
