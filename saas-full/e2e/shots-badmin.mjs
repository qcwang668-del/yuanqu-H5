// B 端管理后台 · 园区政策「推送企业」功能截图验收（桌面视口，真实外网）
import { chromium } from 'playwright';
import { mkdirSync } from 'fs';
const BASE = 'http://120.79.142.141:8000';
const OUT = 'evidence/push-admin';
mkdirSync(OUT, { recursive: true });

const b = await chromium.launch({ headless: true });
const ctx = await b.newContext({ viewport: { width: 1440, height: 900 }, locale: 'zh-CN' });
const p = await ctx.newPage();

// 1) 登录
await p.goto(BASE + '/login', { waitUntil: 'networkidle', timeout: 60000 });
await p.waitForTimeout(1500);
await p.fill('input[placeholder*="用户名"], input[type="text"]', 'admin').catch(() => {});
await p.fill('input[placeholder*="密码"], input[type="password"]', 'admin123').catch(() => {});
await p.click('button:has-text("登录")').catch(() => {});
await p.waitForTimeout(4000);

// 2) 园区政策发布页
await p.goto(BASE + '/liqi-ops/policy-publish', { waitUntil: 'networkidle', timeout: 60000 });
await p.waitForSelector('.el-table', { timeout: 20000 }).catch(() => {});
await p.waitForTimeout(1500);
await p.screenshot({ path: `${OUT}/01_园区政策列表.png`, fullPage: true });
console.log('✓ 01 园区政策列表');

// 3) 点第一行「推送企业」
const pushBtn = p.locator('.el-table button:has-text("推送企业")').first();
if (await pushBtn.count()) {
  await pushBtn.click();
  await p.waitForSelector('.el-dialog .el-table', { timeout: 15000 }).catch(() => {});
  await p.waitForTimeout(2000);
  await p.screenshot({ path: `${OUT}/02_推送企业候选名单.png` });
  console.log('✓ 02 推送企业候选对话框');
  await p.keyboard.press('Escape');
  await p.waitForTimeout(800);
} else {
  console.log('✗ 未找到推送企业按钮');
}

// 4) 推送记录页（含来源列）
await p.goto(BASE + '/liqi-ops/push-message', { waitUntil: 'networkidle', timeout: 60000 });
await p.waitForSelector('.el-table', { timeout: 20000 }).catch(() => {});
await p.waitForTimeout(1500);
await p.screenshot({ path: `${OUT}/03_推送记录(来源列).png`, fullPage: true });
console.log('✓ 03 推送记录');

await b.close();
