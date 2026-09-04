// 菜单重构验收截图：首页 / 智能匹配 / 我的
import { chromium } from 'playwright';
import { mkdirSync } from 'fs';
const BASE = 'http://120.79.142.141:8000/h5/';
const OUT = 'evidence/menu-layout';
mkdirSync(OUT, { recursive: true });
const PAGES = [
  { f: '01_首页.png', h: '#/home', wait: '.grid' },
  { f: '02_智能匹配.png', h: '#/match', wait: '.bind-card' },
  { f: '03_我的.png', h: '#/mine', wait: '.mine-hd' },
];
const b = await chromium.launch({ headless: true });
const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2, locale: 'zh-CN' });
const p = await ctx.newPage();
for (const x of PAGES) {
  await p.goto(BASE + x.h, { waitUntil: 'networkidle', timeout: 60000 });
  await p.waitForSelector(x.wait, { timeout: 15000 }).catch(() => {});
  await p.waitForTimeout(800);
  await p.screenshot({ path: `${OUT}/${x.f}`, fullPage: true });
  console.log('✓', x.f);
}
await b.close();
