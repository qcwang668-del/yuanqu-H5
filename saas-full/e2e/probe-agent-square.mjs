import { chromium } from './node_modules/playwright/index.mjs';

const BASE = 'http://120.79.142.141:8000';
const DIR = '/home/fangnan/PycharmProjects/u667a-u8fdc-u529b-u4f01-saas/e2e/evidence/agent-square';

const log = (...a) => console.log('[probe]', ...a);
const browser = await chromium.launch({
  headless: true,
  executablePath: '/usr/bin/chromium',
  args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--disable-gpu']
});
const ctx = await browser.newContext({
  viewport: { width: 1680, height: 950 },
  ignoreHTTPSErrors: true,
  extraHTTPHeaders: { 'tenant-id': '1' }
});
const page = await ctx.newPage();

const apiLog = [];
const consoleErrs = [];
page.on('response', async (resp) => {
  const u = resp.url();
  if (u.includes('/admin-api/') || u.includes('/app-api/')) {
    let body = '';
    try { body = (await resp.text()).slice(0, 800); } catch {}
    apiLog.push({ url: u.replace(BASE, ''), status: resp.status(), body });
  }
});
page.on('pageerror', e => consoleErrs.push('PAGEERROR: ' + String(e).slice(0, 200)));
page.on('console', m => { if (m.type() === 'error') consoleErrs.push('CONSOLE: ' + String(m.text()).slice(0, 200)); });

async function waitBodyText(re, timeout, label) {
  const t0 = Date.now();
  while (Date.now() - t0 < timeout) {
    const txt = await page.locator('body').innerText().catch(() => '');
    if (re.test(txt)) { log(`命中[${label}]，耗时 ${((Date.now()-t0)/1000).toFixed(0)}s`); return txt; }
    await page.waitForTimeout(2000);
  }
  log(`!! 超时未命中[${label}] (${timeout/1000}s)`);
  return await page.locator('body').innerText().catch(() => '');
}
async function waitSel(sel, timeout) {
  const t0 = Date.now();
  while (Date.now() - t0 < timeout) {
    const n = await page.$$eval(sel, es => es.length).catch(() => 0);
    if (n > 0) return true;
    await page.waitForTimeout(2000);
  }
  return false;
}

// ===== 1. 登录 =====
log('打开登录页...');
await page.goto(BASE + '/login', { waitUntil: 'commit', timeout: 40000 });
const pwOk = await waitSel('input[type="password"]', 240000);
log('密码框出现:', pwOk);
if (!pwOk) { await page.screenshot({ path: DIR + '/x_登录超时.png' }); await browser.close(); process.exit(2); }
await page.waitForTimeout(1500);

const fillIf = async (sel, val) => {
  const el = page.locator(sel).first();
  if (await el.count()) { await el.fill(''); await el.fill(val); log('填写', sel, '=', val); }
  else log('!! 未找到', sel);
};
await fillIf('input[placeholder*="租户"]', '芋道源码');
await fillIf('input[placeholder*="账号"], input[placeholder*="用户名"]', 'admin');
await page.locator('input[type="password"]').first().fill('admin123');
await page.waitForTimeout(800);
// 若有【可见的】验证码输入框，填旁路值；隐藏的（已旁路）跳过
const code = page.locator('input[placeholder*="验证码"]:visible, input[placeholder*="图形"]:visible').first();
if (await code.count()) { log('发现可见验证码框，尝试旁路: admin'); await code.fill('admin').catch(()=>{}); }
else log('无可见验证码框（已旁路），跳过');
await page.screenshot({ path: DIR + '/p_登录表单.png' });

await page.locator('button:has-text("登"), button.el-button--primary').first().click();
log('已点登录，等待进入主页...');
await waitSel('.el-menu, .el-aside', 90000);
await page.waitForTimeout(6000);
log('登录后 URL:', page.url());
await page.screenshot({ path: DIR + '/01_登录后主页.png' });

// ===== 2. 进入智能体广场（菜单点击）=====
apiLog.length = 0;
const subTitle = page.locator('.el-sub-menu__title').filter({ hasText: '智能体广场' }).first();
if (await subTitle.count()) {
  await subTitle.click().catch(e => log('展开目录异常:', e.message));
  await page.waitForTimeout(2000);
  const item = page.locator('.el-menu .el-menu-item').filter({ hasText: '智能体广场' }).first();
  if (await item.count()) { await item.click().catch(e => log('点子菜单异常:', e.message)); }
} else {
  log('未找到目录，尝试直接 goto /agentSquare');
  await page.goto(BASE + '/agentSquare', { waitUntil: 'commit', timeout: 40000 }).catch(()=>{});
}
log('等待广场卡片文本(最多150s)...');
const squareTxt = await waitBodyText(/工商信息智能体|企业司法风险|司法风险智能体/, 150000, '广场卡片');
await page.waitForTimeout(3000);
log('点广场后 URL:', page.url());
await page.screenshot({ path: DIR + '/02_智能体广场卡片.png', fullPage: true });

log('=== 广场页 body 文本(前600字) ===');
log(squareTxt.replace(/\s+/g, ' ').slice(0, 600));

// dump 卡片元素
const cardInfo = await page.$$eval('*', els => {
  const out = [];
  for (const e of els) {
    const t = (e.textContent || '').trim();
    if ((t === '工商信息智能体' || t === '企业司法风险智能体' || t.includes('司法风险智能体') && e.children.length <= 2) && e.childElementCount <= 3) {
      out.push({ tag: e.tagName, cls: (e.className||'').toString().slice(0,120), text: t.slice(0,60) });
    }
  }
  return out.slice(0, 20);
}).catch(() => []);
log('=== 卡片标题元素 ===');
console.log(JSON.stringify(cardInfo, null, 1));

// dump 广场页所有按钮/可点元素文本
const clickables = await page.$$eval('button, a, [class*="card"], [class*="btn"], [role="button"]', els =>
  [...new Set(els.map(e => (e.textContent||'').replace(/\s+/g,' ').trim()).filter(Boolean))].slice(0, 40)
).catch(() => []);
log('=== 广场页可点元素文本 ===');
console.log(JSON.stringify(clickables, null, 1));

log('=== 广场相关接口 ===');
for (const a of apiLog) {
  if (/agent|square|liqi|chat|mcp|tool|ai/i.test(a.url)) {
    log(a.status, a.url);
    log('   body:', a.body.slice(0, 400));
  }
}
log('=== 本页全部 admin-api 接口 ===');
for (const a of apiLog) log(a.status, a.url);

// ===== 3. 点“企业司法风险智能体”卡片，探对话页结构（不发送）=====
log('尝试点击司法风险智能体卡片...');
const judCard = page.getByText('企业司法风险智能体', { exact: false }).first();
let clicked = false;
if (await judCard.count()) {
  // 优先点卡片本体/按钮
  const clickTarget = page.locator('[class*="card"]:has-text("企业司法风险智能体"), [class*="agent"]:has-text("企业司法风险智能体")').first();
  try {
    if (await clickTarget.count()) { await clickTarget.click({ timeout: 5000 }); clicked = true; }
    else { await judCard.click({ timeout: 5000 }); clicked = true; }
  } catch (e) { log('点击卡片异常:', e.message); }
}
log('卡片点击:', clicked);
await page.waitForTimeout(6000);
log('进入对话页 URL:', page.url());
// 等输入框
const hasInput = await waitSel('textarea, [contenteditable="true"], input[type="text"]', 30000);
log('对话页输入框出现:', hasInput);
await page.waitForTimeout(2000);
await page.screenshot({ path: DIR + '/p_司法对话页初始.png', fullPage: true });

const chatStruct = await page.evaluate(() => {
  const tas = [...document.querySelectorAll('textarea')].map(e => ({tag:'textarea', ph:e.placeholder, cls:(e.className||'').slice(0,80), vis: e.offsetParent!==null}));
  const ces = [...document.querySelectorAll('[contenteditable="true"]')].map(e => ({tag:'ce', cls:(e.className||'').slice(0,80), vis: e.offsetParent!==null}));
  const btns = [...document.querySelectorAll('button')].map(e => ({txt:(e.textContent||'').replace(/\s+/g,' ').trim().slice(0,20), cls:(e.className||'').slice(0,60), vis:e.offsetParent!==null})).filter(b=>b.vis);
  return { tas, ces, btns: btns.slice(0,30) };
}).catch(() => ({}));
log('=== 对话页结构 ===');
console.log(JSON.stringify(chatStruct, null, 1));

log('=== 对话页 body 文本(前500) ===');
log((await page.locator('body').innerText().catch(()=>'')).replace(/\s+/g,' ').slice(0,500));

log('=== JS/控制台 错误 ===');
consoleErrs.length ? console.log(consoleErrs.join('\n')) : log('(无)');

await browser.close();
log('DONE');
