import puppeteer from "puppeteer-core";
import { mkdirSync } from "node:fs";
import { resolve } from "node:path";

const outDir = resolve("screenshots");
mkdirSync(outDir, { recursive: true });

const browser = await puppeteer.launch({
  executablePath: "/usr/bin/google-chrome",
  args: ["--no-sandbox", "--disable-dev-shm-usage", "--hide-scrollbars"],
  headless: true
});

const page = await browser.newPage();
await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2 });

async function shot(hash, file, ready) {
  const url = `http://127.0.0.1:4173/${hash}`;
  await page.goto(url, { waitUntil: "networkidle0", timeout: 30000 });
  await page.waitForSelector(ready, { timeout: 15000 });
  await page.screenshot({ path: resolve(outDir, file), fullPage: false });
  console.log("wrote", file);
}

await shot("#/", "01-home.png", "h1");
await shot("#/study", "02-study-topics.png", ".topic-list");
await shot("#/permit", "03-getting-my-permit.png", ".checklist-group");

await browser.close();
