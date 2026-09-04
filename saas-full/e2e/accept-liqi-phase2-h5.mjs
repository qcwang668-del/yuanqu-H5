// 力企云 H5 二期功能（②园区政策 ③企业绑定 ⑤AI助手 ⑥消息 ⑫直播）验收截图
import { chromium } from './node_modules/playwright/index.mjs';
import fs from 'fs';

const BASE = 'http://120.79.142.141:8000';
const DIR = '/home/fangnan/PycharmProjects/u667a-u8fdc-u529b-u4f01-saas/e2e/evidence/liqi-phase2';
fs.mkdirSync(DIR, { recursive: true });
const log = (...a) => console.log('[h5-acc]', ...a);

const browser = await chromium.launch({
  headless: true, executablePath: '/root/.cache/ms-playwright/chromium-1234/chrome-linux64/chrome',
  args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--disable-gpu']
});
const ctx = await browser.newContext({ viewport: { width: 414, height: 896 }, ignoreHTTPSErrors: true, deviceScaleFactor: 2 });
const page = await ctx.newPage();
const apiLog = [];
page.on('response', async (resp) => {
  const u = resp.url();
  if (u.includes('/app-api/')) apiLog.push({ url: u.replace(BASE, ''), status: resp.status() });
});
page.on('pageerror', e => log('PAGEERROR:', String(e).slice(0, 160)));

async function shot(name) {
  await page.waitForTimeout(1200);
  await page.screenshot({ path: `${DIR}/${name}`, fullPage: true });
  log('截图', name);
}
async function goto(hash) {
  await page.goto(`${BASE}/h5/#${hash}`, { waitUntil: 'networkidle' }).catch(() => {});
  await page.waitForTimeout(1500);
}

// 1) 首页
await goto('/home');
await shot('01_h5_home.png');

// 2) 园区发布（真实库数据）
await goto('/policy?type=park');
await page.waitForTimeout(2500);
await shot('02_h5_park_policies.png');

// 3) 政策详情（园区政策 L2）
await goto('/detail?id=L2');
await page.waitForTimeout(2500);
await shot('03_h5_policy_detail.png');

// 4) AI 帮我读懂（真实 LLM）
try {
  await page.click('#ai-explain', { timeout: 8000 }).catch(() => {});
  // 等待 .ai-answer 出现且有文本（最多 60s）
  for (let i = 0; i < 30; i++) {
    await page.waitForTimeout(2000);
    const t = await page.locator('.ai-answer').innerText().catch(() => '');
    if (t && t.length > 20) { log('AI解读字数:', t.length); break; }
  }
  await shot('04_h5_ai_explain.png');
} catch (e) { log('帮我读懂异常:', String(e).slice(0, 120)); }

// 5) 直播大讲堂
await goto('/live');
await page.waitForTimeout(2500);
await shot('05_h5_live.png');

// 6) AI 政策助手问答（真实 LLM，SSE 流式）
await goto('/ai');
await page.waitForTimeout(1500);
try {
  await page.fill('#ai-q', '高新技术企业认定需要满足什么条件？能拿多少补贴？');
  await page.click('.ai-input button');
  for (let i = 0; i < 30; i++) {
    await page.waitForTimeout(2000);
    const bubbles = await page.locator('.bubble.ai').allInnerTexts().catch(() => []);
    const last = bubbles[bubbles.length - 1] || '';
    if (last && last.length > 30 && !/思考中/.test(last)) { log('AI回答字数:', last.length); break; }
  }
  await shot('06_h5_ai_chat.png');
} catch (e) { log('AI问答异常:', String(e).slice(0, 120)); }

// 7) 工具页
await goto('/tools');
await shot('07_h5_tools.png');

// 8) 绑定企业页（游客：登录引导）
await goto('/bind');
await page.waitForTimeout(1500);
await shot('08_h5_bind_guest.png');

// 9) 消息页（游客：登录引导）
await goto('/message');
await page.waitForTimeout(1200);
await shot('09_h5_message_guest.png');

log('=== app-api 调用情况 ===');
apiLog.forEach(a => log(a.status, a.url));
await browser.close();
log('DONE');
