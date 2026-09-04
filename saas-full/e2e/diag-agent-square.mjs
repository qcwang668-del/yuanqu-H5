import { chromium } from './node_modules/playwright/index.mjs';

const BASE = 'http://120.79.142.141:8000';
const DIR = '/home/fangnan/PycharmProjects/u667a-u8fdc-u529b-u4f01-saas/e2e/evidence/agent-square';

const apiLog = [];
const browser = await chromium.launch({
  headless: true,
  executablePath: '/usr/bin/chromium',
  args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
});
const ctx = await browser.newContext({ viewport: { width: 1600, height: 900 }, ignoreHTTPSErrors: true });
const page = await ctx.newPage();

page.on('response', async (resp) => {
  const u = resp.url();
  if (u.includes('/admin-api/') || u.includes('/app-api/')) {
    let body = '';
    try { body = (await resp.text()).slice(0, 600); } catch {}
    apiLog.push({ url: u, status: resp.status(), body });
  }
});

// 1. 登录页
await page.goto(BASE + '/login', { waitUntil: 'commit', timeout: 30000 });
await page.waitForTimeout(2500);
const fillIf = async (sel, val) => {
  const el = page.locator(sel).first();
  if (await el.count()) { await el.fill(''); await el.fill(val); }
};
await fillIf('input[placeholder*="租户"]', '芋道源码');
await fillIf('input[placeholder*="账号"], input[placeholder*="用户名"]', 'admin');
await fillIf('input[type="password"]', 'admin123');
await page.waitForTimeout(500);
await page.screenshot({ path: DIR + '/00_登录页.png', fullPage: false });
const loginBtn = page.locator('button:has-text("登"), .el-button--primary').first();
await loginBtn.click();
await page.waitForTimeout(6000);
console.log('登录后 URL:', page.url());

// 2. 首页 + 侧边栏（菜单乱码证据）
try { await page.goto(BASE + '/index', { waitUntil: 'commit', timeout: 30000 }); } catch {}
await page.waitForTimeout(4000);
await page.screenshot({ path: DIR + '/01_首页侧边栏.png', fullPage: true });

// 抓侧边栏菜单文本
const menuTexts = await page.$$eval('.el-menu .el-sub-menu__title, .el-menu .el-menu-item, .el-menu span',
  els => els.map(e => (e.textContent || '').trim()).filter(Boolean));
const weird = menuTexts.filter(t => /[æè™ºå¹³œåœºâ]/.test(t) || t.includes('广场') || t.includes('智能体'));
console.log('=== 侧边栏疑似乱码/广场菜单 ===');
console.log(JSON.stringify([...new Set(weird)], null, 1));

// 3. 直接进 agentSquare 页
apiLog.length = 0;
try {
  await page.goto(BASE + '/agentSquare', { waitUntil: 'commit', timeout: 30000 });
} catch (e) { console.log('goto agentSquare:', e.message); }
await page.waitForTimeout(5000);
await page.screenshot({ path: DIR + '/02_广场页.png', fullPage: true });

// 页面标题/内容文本
const bodyText = (await page.locator('body').innerText().catch(() => '')).slice(0, 800);
console.log('=== 广场页 body 文本片段 ===');
console.log(bodyText);

console.log('=== agentSquare 相关接口 ===');
for (const a of apiLog) {
  if (/agent|square|liqi/i.test(a.url)) {
    console.log(a.status, a.url);
    console.log('  body:', a.body.slice(0, 300));
  }
}
console.log('=== 本页所有 admin-api 接口(简) ===');
for (const a of apiLog) console.log(a.status, a.url.replace(BASE, ''));

await browser.close();
console.log('DONE');
