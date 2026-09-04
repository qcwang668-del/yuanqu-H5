import { chromium } from './node_modules/playwright/index.mjs';
import fs from 'fs';

const BASE = 'http://120.79.142.141:8000';
const DIR = '/home/fangnan/PycharmProjects/u667a-u8fdc-u529b-u4f01-saas/e2e/evidence/agent-square';
const RESULT = DIR + '/v2_result.json';

const result = { steps: [], answers: {}, apiChat: [], consoleErrs: [], startedAt: new Date().toISOString() };
const save = () => fs.writeFileSync(RESULT, JSON.stringify(result, null, 2));
const log = (...a) => console.log('[v2]', ...a);

const browser = await chromium.launch({
  headless: true, executablePath: '/usr/bin/chromium',
  args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--disable-gpu']
});
const ctx = await browser.newContext({ viewport: { width: 1680, height: 950 }, ignoreHTTPSErrors: true });
const page = await ctx.newPage();

const apiLog = [];
page.on('response', async (resp) => {
  const u = resp.url();
  if (u.includes('/admin-api/') || u.includes('/app-api/')) {
    let body = '';
    try { body = (await resp.text()).slice(0, 1500); } catch {}
    const rec = { url: u.replace(BASE, ''), status: resp.status(), method: resp.request().method(), body };
    apiLog.push(rec);
    if (/chat|agent|message|mcp|tool|sse|stream|liqi|ai/i.test(rec.url)) result.apiChat.push(rec);
  }
});
page.on('pageerror', e => result.consoleErrs.push('PAGEERROR: ' + String(e).slice(0, 300)));
page.on('console', m => {
  if (m.type() === 'error') {
    const t = String(m.text());
    if (/iconify|simplesvg|fontawesome|cdn|favicon/i.test(t)) return;
    result.consoleErrs.push('CONSOLE: ' + t.slice(0, 300));
  }
});

const ERR_RE = /401|AuthenticationError|API key|AK\/SK|Unauthorized|服务异常|missing or invalid|认证失败|鉴权/i;

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

// 抓取对话区所有候选消息文本
async function grabMessages() {
  return await page.evaluate(() => {
    const sels = ['[class*="message-content"]','[class*="msg-content"]','[class*="markdown-body"]','[class*="markdown"]','[class*="answer"]','[class*="bubble"]','[class*="chat-content"]','[class*="message-text"]','[class*="message"]'];
    const out = [];
    const seen = new Set();
    for (const s of sels) {
      for (const e of document.querySelectorAll(s)) {
        if (e.offsetParent === null) continue;
        const t = (e.innerText || '').trim();
        if (!t || t.length < 2) continue;
        if (seen.has(t)) continue;
        seen.add(t);
        out.push({ cls: (e.className || '').toString().slice(0, 70), len: t.length, text: t });
      }
    }
    return out.sort((a, b) => b.len - a.len);
  }).catch(() => []);
}

// 发送问题并等待流式回答完成
async function askAndWait(question, tag, maxWaitMs = 150000) {
  const ta = page.locator('textarea:visible').first();
  await ta.click();
  await ta.fill(question);
  await page.waitForTimeout(700);
  const apiBefore = apiLog.length;
  // 发送按钮
  const sendBtn = page.locator('button.send-btn:visible, button:has-text("发送"):visible').first();
  await sendBtn.click();
  log(`[${tag}] 已发送: ${question}`);

  let lastLen = 0, stable = 0, answer = '', isError = false, thinkingSeen = false;
  let errSnapshot = '';
  const t0 = Date.now();
  while (Date.now() - t0 < maxWaitMs) {
    await page.waitForTimeout(3000);
    const body = await page.locator('body').innerText().catch(() => '');
    if (/思考中|正在思考|思考…|生成中|正在生成|停止生成|正在回答|AI 思考/.test(body)) thinkingSeen = true;

    const msgs = await grabMessages();
    // 排除用户问题本身，取最长的候选作为 AI 回答
    const aiCands = msgs.filter(m => m.text !== question && !m.text.startsWith(question) && m.len >= 8);
    const best = aiCands[0];
    const cur = best ? best.text : '';

    if (ERR_RE.test(cur) || ERR_RE.test(body)) {
      isError = true;
      errSnapshot = (ERR_RE.test(cur) ? cur : body).slice(0, 400);
    }
    answer = cur;

    if (answer.length >= 30 && answer.length === lastLen) {
      stable++;
      if (stable >= 3) break;
    } else stable = 0;
    lastLen = answer.length;

    // 若已明确错误且文本不再变化，提前结束
    if (isError && stable >= 2) break;
  }
  await page.waitForTimeout(2000);

  // 相关接口
  const rel = apiLog.slice(apiBefore).filter(a => /chat|agent|message|mcp|tool|sse|stream|liqi|ai/i.test(a.url));
  const apiSummary = rel.map(a => ({ method: a.method, status: a.status, url: a.url, bodyHead: a.body.slice(0, 300) }));

  log(`[${tag}] 思考中:${thinkingSeen} 错误:${isError} 回答长度:${answer.length} 耗时${((Date.now()-t0)/1000).toFixed(0)}s`);
  return { question, answer, answerHead: answer.slice(0, 260), isError, thinkingSeen, errSnapshot, apiSummary, msgsDump: (await grabMessages()).slice(0, 6).map(m => ({ len: m.len, cls: m.cls, head: m.text.slice(0, 80) })) };
}

// ============ 1. 登录 ============
log('打开登录页...');
await page.goto(BASE + '/login', { waitUntil: 'commit', timeout: 40000 });
if (!(await waitSel('input[type="password"]', 240000))) {
  await page.screenshot({ path: DIR + '/v2_x_登录超时.png' });
  result.fatal = '登录超时'; save(); await browser.close(); process.exit(2);
}
await page.waitForTimeout(1500);
const fillIf = async (sel, val) => {
  const el = page.locator(sel).first();
  if (await el.count()) { await el.fill(''); await el.fill(val); log('填写', sel, '=', val); }
};
await fillIf('input[placeholder*="租户"]', '芋道源码');
await fillIf('input[placeholder*="账号"], input[placeholder*="用户名"]', 'admin');
await page.locator('input[type="password"]').first().fill('admin123');
const code = page.locator('input[placeholder*="验证码"]:visible, input[placeholder*="图形"]:visible').first();
if (await code.count()) { await code.fill('admin').catch(() => {}); log('填了可见验证码(旁路)'); }
await page.waitForTimeout(800);
await page.locator('button:has-text("登"), button.el-button--primary').first().click();
log('已点登录...');
await waitSel('.el-menu, .el-aside', 90000);
await page.waitForTimeout(7000);
log('登录后 URL:', page.url());
result.steps.push({ step: 'login', url: page.url() });
save();

// ============ 2. 进广场 ============
const subTitle = page.locator('.el-sub-menu__title').filter({ hasText: '智能体广场' }).first();
if (await subTitle.count()) {
  await subTitle.click().catch(() => {});
  await page.waitForTimeout(2000);
  await page.locator('.el-menu .el-menu-item').filter({ hasText: '智能体广场' }).first().click().catch(() => {});
} else {
  await page.goto(BASE + '/agentSquare/index', { waitUntil: 'commit', timeout: 40000 }).catch(() => {});
}
await waitBody(/工商信息智能体|企业司法风险/, 150000, '广场卡片');
await page.waitForTimeout(3000);
const cardCount = await page.$$eval('.agent-card', es => es.length).catch(() => 0);
const squareTxt = (await page.locator('body').innerText().catch(() => '')).replace(/\s+/g, ' ');
const hasGongshang = /工商信息智能体/.test(squareTxt);
const hasSifa = /企业司法风险智能体|司法风险智能体/.test(squareTxt);
log(`广场卡片 .agent-card=${cardCount}; 含工商:${hasGongshang} 含司法:${hasSifa}`);
await page.screenshot({ path: DIR + '/v2_01_广场卡片.png', fullPage: true });
result.steps.push({ step: 'square', cardCount, hasGongshang, hasSifa });
save();

// ============ 3. 司法风险智能体 ============
log('点击 企业司法风险智能体 ...');
await page.locator('.agent-card:has-text("司法风险")').first().click().catch(async () => {
  await page.getByText('企业司法风险智能体').first().click().catch(() => {});
});
await waitSel('textarea:visible', 40000);
await page.waitForTimeout(3000);
log('司法对话页 URL:', page.url(), 'placeholder:', await page.locator('textarea:visible').first().getAttribute('placeholder').catch(() => ''));

const j1 = await askAndWait('评估一家企业的司法风险需要关注哪些维度？', '司法1');
await page.screenshot({ path: DIR + '/v2_02_司法对话1.png', fullPage: true });
result.answers.judicial1 = j1;
log('=== 司法回答1 开头 ===\n', j1.answerHead);
save();

// 第二次提问（同一会话）
await page.waitForTimeout(2500);
const j2 = await askAndWait('被执行人和失信被执行人有什么区别？', '司法2');
await page.screenshot({ path: DIR + '/v2_03_司法对话2.png', fullPage: true });
result.answers.judicial2 = j2;
log('=== 司法回答2 开头 ===\n', j2.answerHead);
save();

// ============ 4. 返回广场 → 工商信息智能体 ============
log('返回广场...');
await page.locator('button:has-text("智能体广场"):visible, a:has-text("智能体广场"):visible, [class*="back"]:visible').first().click().catch(async () => {
  await page.goto(BASE + '/agentSquare/index', { waitUntil: 'commit', timeout: 40000 });
});
await waitBody(/工商信息智能体/, 60000, '返回广场');
await page.waitForTimeout(2500);
log('点击 工商信息智能体 ...');
await page.locator('.agent-card:has-text("工商信息")').first().click().catch(async () => {
  await page.getByText('工商信息智能体').first().click().catch(() => {});
});
await waitSel('textarea:visible', 40000);
await page.waitForTimeout(3000);
log('工商对话页 URL:', page.url());

const b1 = await askAndWait('查一下深圳市大疆创新科技有限公司的工商基本信息', '工商');
await page.screenshot({ path: DIR + '/v2_04_工商对话降级.png', fullPage: true });
result.answers.business = b1;
log('=== 工商回答 开头 ===\n', b1.answerHead);
save();

// ============ 5. 新会话 ============
log('点击 ＋ 新会话 ...');
const newBtn = page.locator('button:has-text("新会话"):visible, [class*="new"]:has-text("新会话"):visible').first();
const newBtnCount = await newBtn.count();
if (newBtnCount) {
  const beforeText = await page.locator('body').innerText().catch(() => '');
  await newBtn.click().catch(e => log('新会话点击异常:', e.message));
  await page.waitForTimeout(3500);
  const afterText = await page.locator('body').innerText().catch(() => '');
  const taStill = await page.locator('textarea:visible').count().catch(() => 0);
  // 新会话后对话区应清空（大疆问题不再显示在主区，或输入框为空）
  const taVal = await page.locator('textarea:visible').first().inputValue().catch(() => '');
  result.steps.push({ step: 'newSession', clicked: true, textareaStill: taStill > 0, textareaEmpty: taVal === '', djiStillVisible: /大疆创新/.test(afterText) });
  log(`新会话后 textarea 在:${taStill > 0} 空:${taVal === ''} 大疆仍可见:${/大疆创新/.test(afterText)}`);
} else {
  result.steps.push({ step: 'newSession', clicked: false, note: '未找到新会话按钮' });
  log('!! 未找到新会话按钮');
}
await page.screenshot({ path: DIR + '/v2_05_新会话.png', fullPage: true });
save();

result.finishedAt = new Date().toISOString();
result.consoleErrs = result.consoleErrs.slice(0, 30);
save();
log('\n=== 控制台/页面错误(过滤图标CDN) ===');
console.log(result.consoleErrs.length ? result.consoleErrs.join('\n') : '(无)');
log('\n=== chat/agent 相关接口 ===');
for (const a of result.apiChat) log(a.method, a.status, a.url, '| body:', a.body.slice(0, 180));

await browser.close();
log('DONE');
