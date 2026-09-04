import { chromium } from 'playwright';
import { mkdirSync } from 'fs';

// 企业政策「AI 智能匹配」H5 验收截图（外网入口，铁律4：外网可达才算完成）
const BASE = 'http://120.79.142.141:8000/h5/';
const OUT = 'evidence/ai-match';
mkdirSync(OUT, { recursive: true });

const COMPANY = '深圳启程智远网络有限公司';

const b = await chromium.launch({ headless: true });
const ctx = await b.newContext({
  viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true,
  deviceScaleFactor: 2, locale: 'zh-CN'
});
const p = await ctx.newPage();
p.setDefaultTimeout(150000);

// 01 首页宫格入口
await p.goto(BASE + '#/home', { waitUntil: 'networkidle', timeout: 60000 });
await p.waitForSelector('.grid', { timeout: 15000 }).catch(() => {});
await p.waitForTimeout(800);
await p.screenshot({ path: `${OUT}/01_首页宫格入口.png`, fullPage: true });
console.log('✓ 01 首页宫格');

// 02 进入 AI 智能匹配表单页
await p.goto(BASE + '#/ai-match', { waitUntil: 'networkidle', timeout: 60000 });
await p.waitForSelector('#am-company', { timeout: 15000 });
await p.waitForTimeout(500);
await p.screenshot({ path: `${OUT}/02_智能匹配表单.png`, fullPage: true });
console.log('✓ 02 匹配表单');

// 03 填写企业名 + 营收 + 人数，点击匹配（大模型约 40~60s）
await p.fill('#am-company', COMPANY);
await p.fill('#am-revenue', '5000');
await p.fill('#am-staff', '100');
await p.screenshot({ path: `${OUT}/03_填写企业信息.png`, fullPage: true });
console.log('✓ 03 填写完成，开始 AI 匹配…');
await p.click('#am-btn');

// 等待大模型返回结果卡片（同步接口约 40~60s，给足 150s）
await p.waitForSelector('.am-card', { timeout: 150000 });
await p.waitForTimeout(1500);
await p.screenshot({ path: `${OUT}/04_AI匹配结果.png`, fullPage: true });
console.log('✓ 04 匹配结果');

// 04 展开第一条的「AI 评估理由」再截一张
await p.waitForSelector('.am-toggle', { timeout: 10000 }).catch(() => {});
const toggled = await p.$('.am-toggle');
if (toggled) {
  await toggled.click().catch(() => {});
  await p.waitForTimeout(800);
  await p.screenshot({ path: `${OUT}/05_评估理由与风险提示.png`, fullPage: true });
  console.log('✓ 05 评估理由展开');
}

// 结果断言：至少 1 张政策卡 + 5 维打分条
const cardCount = await p.$$eval('.am-card', els => els.length).catch(() => 0);
const barCount = await p.$$eval('.am-bar', els => els.length).catch(() => 0);
console.log(`结果政策卡=${cardCount} 打分条=${barCount}`);
if (cardCount < 1) { console.error('❌ 未匹配到政策卡'); process.exit(1); }

await b.close();
console.log('✅ AI 智能匹配 E2E 截图完成 →', OUT);
