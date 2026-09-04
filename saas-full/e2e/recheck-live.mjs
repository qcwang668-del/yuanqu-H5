import { chromium } from './node_modules/playwright/index.mjs';
const BASE = 'http://120.79.142.141:8000';
const DIR = '/home/fangnan/PycharmProjects/u667a-u8fdc-u529b-u4f01-saas/e2e/evidence/liqi-phase2';
const b = await chromium.launch({
  headless: true,
  executablePath: '/root/.cache/ms-playwright/chromium-1234/chrome-linux64/chrome',
  args: ['--no-sandbox', '--disable-dev-shm-usage']
});
const ctx = await b.newContext({ viewport: { width: 414, height: 896 }, deviceScaleFactor: 2 });
const p = await ctx.newPage();
const errs = [];
p.on('pageerror', (e) => errs.push(String(e).slice(0, 150)));
await p.goto(`${BASE}/h5/#/live`, { waitUntil: 'networkidle' }).catch(() => {});
await p.waitForTimeout(3500);
const txt = await p.locator('body').innerText();
console.log('含加载失败?', txt.includes('加载失败'));
console.log('含直播标题?', txt.includes('大讲堂'));
console.log('含讲师?', txt.includes('讲师'));
console.log('PAGEERROR:', errs);
await p.screenshot({ path: `${DIR}/05_h5_live.png`, fullPage: true });
console.log('截图完成');
await b.close();
