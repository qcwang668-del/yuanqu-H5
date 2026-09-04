import { chromium } from 'playwright';
import { mkdirSync } from 'fs';
const BASE = 'http://120.79.142.141:8000/h5/';
const OUT = 'evidence/push-msg';
mkdirSync(OUT, { recursive: true });
const PAGES = [
  { f: '01_消息子tab.png', h: '#/message', wait: '.subtabs' },
  { f: '02_消息-园区发布.png', h: '#/message', wait: '.subtabs', clickTab: 2 },
  { f: '03_我的(无订阅).png', h: '#/mine', wait: '.mine-hd' },
];
const b = await chromium.launch({ headless: true });
const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2, locale: 'zh-CN' });
const p = await ctx.newPage();
for (const x of PAGES) {
  await p.goto(BASE + x.h, { waitUntil: 'networkidle', timeout: 60000 });
  await p.waitForSelector(x.wait, { timeout: 15000 }).catch(() => {});
  if (x.clickTab) { await p.locator('.subtabs .st').nth(x.clickTab).click().catch(() => {}); await p.waitForTimeout(600); }
  await p.waitForTimeout(700);
  await p.screenshot({ path: `${OUT}/${x.f}`, fullPage: true });
  console.log('✓', x.f);
}
await b.close();
