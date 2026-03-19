const { chromium } = require('playwright-core');
const path = require('path');
(async () => {
  const CHROMIUM = 'C:/Users/keega/AppData/Local/ms-playwright/chromium-1208/chrome-win64/chrome.exe';
  const outDir = 'C:/Users/keega/Agents of Change Consulting Projec/output/playwright';
  const browser = await chromium.launch({ executablePath: CHROMIUM, headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 1100 } });
  await page.goto('http://127.0.0.1:4325/', { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForTimeout(3000);
  await page.evaluate(() => window.scrollTo(0, 7200));
  await page.waitForTimeout(1200);
  await page.screenshot({ path: path.join(outDir, 'verify-pricing-fix-2.png') });
  await browser.close();
})();
