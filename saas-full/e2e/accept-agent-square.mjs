import { chromium } from './node_modules/playwright/index.mjs';

const BASE = 'http://120.79.142.141:8000';
const DIR = '/home/fangnan/PycharmProjects/u667a-u8fdc-u529b-u4f01-saas/e2e/evidence/agent-square';
const log = (...a) => console.log('[acc]', ...a);

const browser = await chromium.launch({
  headless: true, executablePath: '/usr/bin/chromium',
  args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--disable-gpu']
});
// 不设全局 tenant-id 头（产品登录自带；避免污染第三方图标 CDN 造成 CORS 噪音）
const ctx = await browser.newContext({ viewport: { width: 1680, height: 950 }, ignoreHTTPSErrors: true });
const page = await ctx.newPage();

const apiLog = [];
const consoleErrs = [];
page.on('response', async (resp) => {
  const u = resp.url();
  if (u.includes('/admin-api/') || u.includes('/app-api/')) {
    let body = '';
    try { body = (await resp.text()).slice(0, 1200); } catch {}
    apiLog.push({ url: u.replace(BASE, ''), status: resp.status(), method: resp.request().method(), body });
  }
});
page.on('pageerror', e => consoleErrs.push('PAGEERROR: ' + String(e).slice(0, 200)));
page.on('console', m => {
  if (m.type() === 'error') {
    const t = String(m.text());
    if (/iconify|simplesvg|fontawesome|cdn/i.test(t)) return; // 第三方图标 CDN 噪音
    consoleErrs.push('CONSOLE: ' + t.slice(0, 200));
  }
});

async function waitSel(sel, timeout) {
  const t0 = Date.now();
  while (Date.now() - t0 < timeout) {
    const n = await page.$$eval(sel, es => es.length).catch(() => 0);
    if (n > 0) return true;
    await page.waitForTimeout(2000);
  }
  return false;
}
async function waitBody(re, timeout, label) {
  const t0 = Date.now();
  while (Date.now() - t0 < timeout) {
    const txt = await page.locator('body').innerText().catch(() => '');
    if (re.test(txt)) return txt;
    await page.waitForTimeout(2000);
  }
  log('!! 等待超时:', label);
  return '';
}
// 抓取对话区 AI 回答候选文本（取消息容器里最长的可见文本块）
async function grabAnswer() {
  return await page.evaluate(() => {
    const sels = ['[class*="message-content"]','[class*="msg-content"]','[class*="markdown-body"]','[class*="markdown"]','[class*="answer"]','[class*="bubble"]','[class*="chat-content"]','[class*="message-text"]','[class*="content"]'];
    let best = '';
    const seen = new Set();
    for (const s of sels) {
      for (const e of document.querySelectorAll(s)) {
        if (e.offsetParent === null) continue;
        const t = (e.innerText || '').trim();
        if (t.length > best.length && !seen.has(t)) { best = t; }
        seen.add(t);
      }
    }
    return best;
  }).catch(() => '');
}
// 发送问题并等待流式回答完成；返回 {answer, shots}
async function askAndWait(question, tag, maxWaitMs = 170000) {
  const ta = page.locator('textarea:visible').first();
  await ta.click();
  await ta.fill(question);
  await page.waitForTimeout(600);
  await page.screenshot({ path: `${DIR}/p_${tag}_0_已输入.png` });
  const apiBefore = apiLog.length;
  await page.locator('button.send-btn:visible, button:has-text("发送"):visible').first().click();
  log(`[${tag}] 已发送问题: ${question}`);

  let lastLen = 0, stable = 0, answer = '', shotIdx = 1;
  const t0 = Date.now();
  let thinkingSeen = false;
  while (Date.now() - t0 < maxWaitMs) {
    await page.waitForTimeout(3000);
    const body = await page.locator('body').innerText().catch(() => '');
    if (/思考中|正在思考|思考…|生成中|正在生成|停止生成/.test(body)) thinkingSeen = true;
    answer = await grabAnswer();
    // 流式过程截图（每 ~9s）
    if (shotIdx <= 6 && (Date.now() - t0) > shotIdx * 9000) {
      await page.screenshot({ path: `${DIR}/p_${tag}_流式${shotIdx}.png` }).catch(()=>{});
      shotIdx++;
    }
    if (answer.length >= 40 && answer.length === lastLen) {
      stable++;
      if (stable >= 3) break; // 连续 ~9s 不增长 => 完成
    } else stable = 0;
    lastLen = answer.length;
  }
  await page.waitForTimeout(1500);
  await page.screenshot({ path: `${DIR}/p_${tag}_最终.png` });
  log(`[${tag}] 思考中出现过: ${thinkingSeen}; 回答长度: ${answer.length}; 耗时 ${((Date.now()-t0)/1000).toFixed(0)}s`);
  // 本问题相关接口
  const rel = apiLog.slice(apiBefore).filter(a => /chat|agent|message|mcp|tool|sse|stream|liqi/i.test(a.url));
  for (const a of rel) log(`[${tag}-api]`, a.method, a.status, a.url, '\n     body:', a.body.slice(0, 500));
  return { answer, thinkingSeen };
}

// ============ 1. 登录 ============
log('打开登录页...');
await page.goto(BASE + '/login', { waitUntil: 'commit', timeout: 40000 });
if (!(await waitSel('input[type="password"]', 240000))) {
  await page.screenshot({ path: DIR + '/x_登录超时.png' }); await browser.close(); process.exit(2);
}
await page.waitForTimeout(1500);
const fillIf = async (sel, val) => {
  const el = page.locator(sel).first();
  if (await el.count()) { await el.fill(''); await el.fill(val); log('填写', sel, '=', val); }
};
await fillIf('input[placeholder*="租户"]', '芋道源码');
await fillIf('input[placeholder*="账号"], input[placeholder*="用户名"]', 'admin');
await page.locator('input[type="password"]').first().fill('admin123');
const code = page.locator('input[placeholder*="验证码"]:visible').first();
if (await code.count()) { await code.fill('admin').catch(()=>{}); log('填了可见验证码(旁路)'); }
await page.waitForTimeout(800);
await page.locator('button:has-text("登"), button.el-button--primary').first().click();
log('已点登录...');
await waitSel('.el-menu, .el-aside', 90000);
await page.waitForTimeout(7000);
log('登录后 URL:', page.url());
await page.screenshot({ path: DIR + '/01_登录后主页.png' });

// ============ 2. 进广场 ============
const subTitle = page.locator('.el-sub-menu__title').filter({ hasText: '智能体广场' }).first();
if (await subTitle.count()) {
  await subTitle.click().catch(()=>{});
  await page.waitForTimeout(2000);
  await page.locator('.el-menu .el-menu-item').filter({ hasText: '智能体广场' }).first().click().catch(()=>{});
} else {
  await page.goto(BASE + '/agentSquare/index', { waitUntil: 'commit', timeout: 40000 }).catch(()=>{});
}
await waitBody(/工商信息智能体/, 150000, '广场卡片');
await page.waitForTimeout(3000);
const cardCount = await page.$$eval('.agent-card', es => es.length).catch(()=>0);
log('广场卡片数(.agent-card):', cardCount);
await page.screenshot({ path: DIR + '/02_智能体广场卡片.png', fullPage: true });

// ============ 3. 司法风险智能体（纯大模型）============
log('点击 企业司法风险智能体 卡片...');
await page.locator('.agent-card:has-text("企业司法风险智能体")').first().click().catch(async () => {
  await page.getByText('企业司法风险智能体').first().click();
});
await waitSel('textarea:visible', 40000);
await page.waitForTimeout(2500);
log('进入对话页, textarea 占位:', await page.locator('textarea:visible').first().getAttribute('placeholder').catch(()=>''));
await page.screenshot({ path: DIR + '/p_司法_对话页.png' });

const jud = await askAndWait('评估一家企业的司法风险需要关注哪些维度？', '司法', 170000);
await page.screenshot({ path: DIR + '/03_司法智能体对话.png', fullPage: true });
log('=== 司法回答 前 220 字 ===\n', jud.answer.slice(0, 220));

// 会话列表 / 新会话
const sessInfo = await page.evaluate(() => {
  const els = [...document.querySelectorAll('[class*="session"], [class*="history"], [class*="conversation"], [class*="chat-list"]')];
  return els.filter(e => e.offsetParent !== null).map(e => ({cls:(e.className||'').toString().slice(0,80), txt:(e.innerText||'').replace(/\s+/g,' ').slice(0,120)})).slice(0,10);
}).catch(()=>[]);
log('=== 会话列表相关元素 ===');
console.log(JSON.stringify(sessInfo, null, 1));

// ============ 4. 返回广场 → 工商信息智能体 ============
log('返回广场...');
await page.locator('button.back-btn:visible, button:has-text("智能体广场"):visible').first().click().catch(async () => {
  await page.goto(BASE + '/agentSquare/index', { waitUntil: 'commit', timeout: 40000 });
});
await waitBody(/工商信息智能体/, 60000, '返回广场');
await page.waitForTimeout(2500);
log('点击 工商信息智能体 卡片...');
await page.locator('.agent-card:has-text("工商信息智能体")').first().click().catch(async () => {
  await page.getByText('工商信息智能体').first().click();
});
await waitSel('textarea:visible', 40000);
await page.waitForTimeout(2500);
log('工商对话页 textarea 占位:', await page.locator('textarea:visible').first().getAttribute('placeholder').catch(()=>''));
await page.screenshot({ path: DIR + '/p_工商_对话页.png' });

const biz = await askAndWait('查一下深圳市大疆创新科技有限公司的工商基本信息', '工商', 170000);
await page.screenshot({ path: DIR + '/04_工商智能体对话.png', fullPage: true });
log('=== 工商回答 前 300 字 ===\n', biz.answer.slice(0, 300));

// 新会话按钮验证
log('点击 ＋ 新会话 验证...');
await page.locator('button:has-text("新会话"):visible').first().click().catch(e => log('新会话点击异常:', e.message));
await page.waitForTimeout(3000);
await page.screenshot({ path: DIR + '/05_新建会话.png', fullPage: true });
const afterNew = await page.locator('textarea:visible').count().catch(()=>0);
log('新会话后 textarea 仍在(可继续提问):', afterNew > 0);

log('\n=== 全部 liqi/agent/chat 接口 ===');
for (const a of apiLog) if (/liqi|agent|chat|message/i.test(a.url)) log(a.method, a.status, a.url);
log('\n=== 控制台/页面错误(已过滤图标CDN) ===');
consoleErrs.length ? console.log(consoleErrs.join('\n')) : log('(无)');

await browser.close();
log('DONE');
