import { chromium } from 'playwright';

const browser = await chromium.launch();
const page = await browser.newPage();
await page.setViewportSize({ width: 390, height: 844 });
await page.goto('http://localhost:3000');
await page.waitForTimeout(2000);

// Dismiss landing overlay if present
const overlay = await page.$('.fixed.inset-0.z-2500');
if (overlay) {
  // Click the CTA button inside overlay
  const btn = await page.$('.fixed.inset-0.z-2500 button');
  if (btn) await btn.click();
  else await page.keyboard.press('Escape');
  await page.waitForTimeout(1000);
}
await page.screenshot({ path: 'screenshot_home.png' });

const markers = await page.$$('.leaflet-marker-icon');
console.log('markers found:', markers.length);
if (markers.length > 0) {
  await markers[0].click();
  await page.waitForTimeout(1500);
  await page.screenshot({ path: 'screenshot_drawer.png' });
}

await browser.close();
console.log('done');
