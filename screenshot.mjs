import { createServer } from 'http';
import { readFile } from 'fs/promises';
import { existsSync, mkdirSync } from 'fs';
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const targetUrl = process.argv[2] || 'http://localhost:3000';
const label     = process.argv[3] || '';

const dir = path.join(__dirname, 'temporary screenshots');
if (!existsSync(dir)) mkdirSync(dir, { recursive: true });

let n = 1;
while (existsSync(path.join(dir, `screenshot-${n}${label ? '-' + label : ''}.png`))) n++;
const outFile = path.join(dir, `screenshot-${n}${label ? '-' + label : ''}.png`);

// Load Playwright from ms-playwright-go
const playwrightPath = 'C:/Users/LENOVO/AppData/Local/ms-playwright-go/1.50.1/package/index.mjs';
const { chromium } = await import(pathToFileURL(playwrightPath).href);

const browser = await chromium.launch({
  executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
  args: ['--no-sandbox', '--disable-setuid-sandbox'],
});

const page = await browser.newPage();
await page.setViewportSize({ width: 1440, height: 900 });
await page.goto(targetUrl, { waitUntil: 'networkidle', timeout: 30000 });
await page.waitForTimeout(600);
// Scroll through the page to trigger intersection observers
await page.evaluate(async () => {
  await new Promise(resolve => {
    let y = 0;
    const step = 400;
    const id = setInterval(() => {
      window.scrollBy(0, step);
      y += step;
      if (y >= document.body.scrollHeight) {
        window.scrollTo(0, 0);
        clearInterval(id);
        resolve();
      }
    }, 60);
  });
});
await page.waitForTimeout(1400);
await page.screenshot({ path: outFile, fullPage: true });
await browser.close();

console.log(`Saved: ${outFile}`);
