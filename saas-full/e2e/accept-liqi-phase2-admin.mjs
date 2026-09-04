// 力企云 管理后台 二期功能（②园区政策发布 ④申报线索 ⑥推送记录 ⑫直播管理）验收截图
import { chromium } from './node_modules/playwright/index.mjs';
import fs from 'fs';

const BASE = 'http://120.79.142.141:8000';
const DIR = '/home/fangnan/PycharmProjects/u667a-u8fdc-u529b-u4f01-saas/e2e/evidence/liqi-phase2';
fs.mkdirSync(DIR, { recursive: true });
const log = (...a) => console.log('[adm-acc]', ...a);

const browser = await chromium.launch({
  headless: true,
  executablePath: '/root/.cache/ms-playwright/chromium-1234/chrome-linux64/chrome',
  args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--disable-gpu']
});
const ctx = await browser.newContext({ viewport: { width: 1680, height: 950 }, ignoreHTTPSErrors: true });
const page = await ctx.newPage();
page.on('pageerror', (e) => log('PAGEERROR:', String(e).slice(0, 160)));

async function waitSel(sel, timeout = 30000) {
  const t0 = Date.now();
  while (Date.now() - t0 < timeout) {
    if ((await page.$$eval(sel, (es) => es.length).catch(() => 0)) > 0) return true;
    await page.waitForTimeout(1500);
  }
  return false;
}

// 登录
await page.goto(BASE + '/login', { waitUntil: 'commit', timeout: 40000 });
await waitSel('input[type="password"]', 60000);
const fillIf = async (sel, val) => {
  const el = page.locator(sel).first();
  if (await el.count()) { await el.fill('').catch(()=>{}); await el.fill(val); }
};
await fillIf('input[placeholder*="租户"]', '芋道源码');
await fillIf('input[placeholder*="账号"], input[placeholder*="用户名"]', 'admin');
await page.locator('input[type="password"]').first().fill('admin123');
const code = page.locator('input[placeholder*="验证码"]:visible').first();
if (await code.count()) { await code.fill('admin').catch(()=>{}); }
await page.locator('button:has-text("登"), button.el-button--primary').first().click();
await page.waitForTimeout(5000);
log('登录后 URL:', page.url());

// 逐个访问新菜单路由并截图
const pages = [
  ['/liqi-ops/policy-publish', '10_admin_policy_publish.png'],
  ['/liqi-ops/policy-apply', '11_admin_policy_apply.png'],
  ['/liqi-ops/live', '12_admin_live.png'],
  ['/liqi-ops/push-message', '13_admin_push_message.png']
];
for (const [route, shot] of pages) {
  await page.goto(BASE + route, { waitUntil: 'networkidle' }).catch(() => {});
  await page.waitForTimeout(4000);
  const hasTable = await waitSel('.el-table', 15000);
  const bodyTxt = await page.locator('.el-card, .app-main, body').first().innerText().catch(() => '');
  log(route, '表格?', hasTable, '| 正文前60:', bodyTxt.replace(/\s+/g, ' ').slice(0, 60));
  await page.screenshot({ path: `${DIR}/${shot}`, fullPage: false });
  log('截图', shot);
}
await browser.close();
log('DONE');
