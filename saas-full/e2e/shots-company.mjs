import { chromium } from 'playwright';
import { mkdirSync } from 'fs';
const BASE = 'http://120.79.142.141:8000/h5/';
const OUT = 'evidence/company-check';
mkdirSync(OUT, { recursive: true });
const kw = encodeURIComponent('深圳市云启智能科技有限公司');
const b = await chromium.launch({ headless: true });
const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2, locale: 'zh-CN' });
const p = await ctx.newPage();
// 首页（宫格入口）
await p.goto(BASE + '#/home', { waitUntil: 'networkidle', timeout: 60000 });
await p.waitForSelector('.grid', { timeout: 15000 }).catch(()=>{});
await p.waitForTimeout(800);
await p.screenshot({ path: `${OUT}/01_首页宫格入口.png`, fullPage: true });
console.log('✓ 01 首页');
// 查询结果页（带 kw 自动查）
await p.goto(BASE + '#/company-check?kw=' + kw, { waitUntil: 'networkidle', timeout: 60000 });
await p.waitForSelector('.pcard', { timeout: 15000 }).catch(()=>{});
await p.waitForTimeout(1500);
await p.screenshot({ path: `${OUT}/02_企业获批查询结果.png`, fullPage: true });
console.log('✓ 02 查询结果');
await b.close();
