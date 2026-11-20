import { chromium } from "@playwright/test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";

const expected = {
  name: "Contact preview",
  email: "preview@example.com",
  phone: "+90 555 123 45 67",
  project: "A portfolio website",
  message: "Project details for a local verification.",
};
const browser = await chromium.launch({channel:"chrome"});
try {
  for (const width of [1440,768,390]) {
    const page = await browser.newPage({viewport:{width,height:900},reducedMotion:"reduce"});
    let submitted;
    // All UI submissions are intercepted: no actual mail is sent.
    await page.route("**/api/contact",async route=>{
      submitted=route.request().postDataJSON();
      await route.fulfill({status:200,contentType:"application/json",body:JSON.stringify({message:"Message sent successfully."})});
    });
    await page.goto((process.env.TEST_URL || "http://localhost:3000") + "/contact");
    const form=page.getByRole("form",{name:"Project contact form"});
    assert.equal(await form.locator("select").count(),0);
    assert.equal(await form.locator("[name=timeline], [name=projectType]").count(),0);
    assert.equal(await form.locator(":scope > .gradient-bg-flow").evaluate(el=>el.style.width),"15%");
    for(const [name,value] of Object.entries(expected)) await form.locator("[name="+name+"]").fill(value);
    assert.equal(await form.locator(":scope > .gradient-bg-flow").evaluate(el=>el.style.width),"100%");
    await form.getByRole("button",{name:"SEND MESSAGE"}).click();
    await page.locator("[data-contact-success-overlay]").waitFor();
    assert.deepEqual(submitted,expected);
    console.log(width+": five fields, progress and submission passed");
    await page.close();
  }
} finally {await browser.close();}

// Exercise the real request validation and email templates with a fake transport.
const source = (await readFile("src/app/api/contact/route.js", "utf8"))
  .replace(
    'import nodemailer from "nodemailer";',
    'const nodemailer = {createTransport: () => ({sendMail: async mail => {globalThis.contactTestMail = mail;}})};',
  )
  .replace('"@/lib/contactFields"', JSON.stringify(pathToFileURL(resolve("src/lib/contactFields.js")).href))
  .replace('"./contactMail"', JSON.stringify(pathToFileURL(resolve("src/app/api/contact/contactMail.js")).href));
process.env.EMAIL_USER="test@example.com";
process.env.EMAIL_PASS="test-password";
const {POST}=await import("data:text/javascript;base64,"+Buffer.from(source).toString("base64"));
const request=payload=>new Request("http://localhost/api/contact",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(payload)});
assert.equal((await POST(request(expected))).status,200);
assert.ok(globalThis.contactTestMail.text.includes("Phone: "+expected.phone));
assert.ok(globalThis.contactTestMail.text.includes("Project: "+expected.project));
assert.ok(!globalThis.contactTestMail.text.includes("Timeline:"));
assert.equal((await POST(request({...expected,phone:""}))).status,400);
assert.equal((await POST(request({...expected,phone:"invalid"}))).status,400);
assert.equal((await POST(request({...expected,project:""}))).status,400);
await POST(request({...expected,project:"<script>alert(1)</script>"}));
assert.ok(globalThis.contactTestMail.html.includes("&lt;script&gt;"));
assert.ok(!globalThis.contactTestMail.html.includes("<script>"));
console.log("API validation and mail content passed with mocked transport");
