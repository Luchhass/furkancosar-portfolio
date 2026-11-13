import { chromium } from '@playwright/test';
import assert from 'node:assert/strict';
const browser = await chromium.launch({channel:'chrome'});
for (const [width,height] of [[1440,900],[768,1024],[390,844],[844,390]]) {
  const page = await browser.newPage({ viewport: {width,height}, reducedMotion:'reduce' });
  for (const route of ['/','/about','/projects','/contact']) {
    await page.goto('http://localhost:3000'+route);
    await page.locator('.ui-hero').waitFor();
    for (const section of await page.locator('.ui-screen, .ui-hero').all()) {
      assert.equal(await section.evaluate(n => n.offsetHeight), height);
    }
    for (const section of await page.locator('.ui-screen-scroll').all()) {
      const result = await section.evaluate(n => {
        n.scrollTop = n.scrollHeight;
        return { remaining: n.scrollHeight - n.clientHeight - n.scrollTop, mode: getComputedStyle(n).overflowY };
      });
      assert.equal(result.mode, 'auto');
      assert.ok(result.remaining < 2, 'Section bottom must remain reachable');
    }
    console.log(JSON.stringify({width,height,route,sections:await page.locator('.ui-screen, .ui-hero').evaluateAll(nodes=>nodes.map(n=>({name:n.getAttribute('aria-labelledby')||n.className.slice(0,50),height:n.offsetHeight,scroll:n.scrollHeight,client:n.clientHeight})))}));
  }
  await page.close();
}
await browser.close();
