import { chromium } from './node_modules/playwright/index.mjs';
const BASE = 'http://120.79.142.141:8000';
const DIR = '/home/fangnan/PycharmProjects/u667a-u8fdc-u529b-u4f01-saas/e2e/evidence/agent-square';

const b = await chromium.launch({ headless: true, executablePath: '/usr/bin/chromium',
  args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'] });
const ctx = await b.newContext({ viewport: { width: 1680, height: 950 } });
const p = await ctx.newPage();
const errs = [];
p.on('pageerror', e => errs.push(String(e).slice(0, 150)));

async function waitFor(sel, timeout) {
  const t0 = Date.now();
  while (Date.now() - t0 < timeout) {
    const n = await p.$$eval(sel, es => es.length).catch(() => 0);
    if (n > 0) return true;
    await p.waitForTimeout(2000);
  }
  return false;
}

// 1. 登录页
await p.goto(BASE + '/login', { waitUntil: 'commit', timeout: 30000 });
console.log('等待 SPA 加载登录表单(最多4分钟)...');
const formOk = await waitFor('input[type="password"]', 240000);
console.log('密码框出现:', formOk);
if (!formOk) { await p.screenshot({ path: DIR + '/x_loading超时.png' }); console.log('SPA 加载超时，终止'); await b.close(); process.exit(2); }

await p.waitForTimeout(1500);
// 填租户
const tenant = p.locator('input[placeholder*="租户"]').first();
if (await tenant.count()) { await tenant.fill(''); await tenant.fill('芋道源码'); }
// 填账号（账号输入框，非密码、非租户）
const user = p.locator('input[placeholder*="账号"], input[placeholder*="用户名"]').first();
if (await user.count()) { await user.fill(''); await user.fill('admin'); }
// 密码
await p.locator('input[type="password"]').first().fill('admin123');
await p.waitForTimeout(500);
await p.screenshot({ path: DIR + '/01_登录页_已填表单.png' });
await p.locator('button:has-text("登"), button.el-button--primary').first().click();
console.log('已点登录，等待跳转...');

// 2. 等进入主页（侧边栏出现）
const homeOk = await waitFor('.el-menu, .el-aside, .layout, [class*="sidebar"]', 90000);
await p.waitForTimeout(6000);
console.log('进入主页:', homeOk, 'url=', p.url());
await p.screenshot({ path: DIR + '/02_登录后主页.png', fullPage: false });

// 3. 抓侧边栏菜单文本，找"智能体广场"
const menuTexts = await p.$$eval('.el-menu *',
  els => els.map(e => (e.childElementCount === 0 ? (e.textContent || '').trim() : '')).filter(Boolean));
const agentMenus = [...new Set(menuTexts)].filter(t => t.includes('智能体') || t.includes('广场') || /[æè™ºåœº]/.test(t));
console.log('=== 侧边栏智能体相关菜单文本 ===');
console.log(JSON.stringify(agentMenus));

// 4. 展开"智能体广场"目录(2100)，再点子菜单(2101)
const subTitle = p.locator('.el-sub-menu__title').filter({ hasText: '智能体广场' }).first();
if (await subTitle.count()) {
  await subTitle.click().catch(e => console.log('展开目录:', e.message));
  await p.waitForTimeout(2500);
  await p.screenshot({ path: DIR + '/03_广场目录展开.png', fullPage: false });
  // 子菜单项
  const item = p.locator('.el-menu .el-menu-item').filter({ hasText: '智能体广场' }).first();
  console.log('子菜单项数量:', await p.locator('.el-menu .el-menu-item').filter({ hasText: '智能体广场' }).count());
  if (await item.count()) {
    await item.click().catch(e => console.log('点子菜单:', e.message));
    await p.waitForTimeout(9000);
    console.log('点子菜单后 url=', p.url());
    await p.screenshot({ path: DIR + '/04_智能体广场页.png', fullPage: false });
    const body = (await p.locator('.app-main, main, #app').first().innerText().catch(() => '')).replace(/\s+/g, ' ').slice(0, 400);
    console.log('=== 广场页内容片段 ===', body);
  }
} else {
  console.log('未找到"智能体广场"目录');
}

console.log('=== 页面 JS 错误 ===');
console.log(errs.length ? errs.join('\n') : '(无)');
await b.close();
console.log('DONE');
