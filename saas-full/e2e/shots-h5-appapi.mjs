// 力企云惠企政策 H5 · 接 app-api 后端的 E2E 截图验收（手机视口，真实外网地址）
// 运行：cd e2e && node shots-h5-appapi.mjs
import { chromium } from 'playwright';
import { mkdirSync } from 'fs';

const BASE = 'http://120.79.142.141:8000/h5/';
const OUT = 'evidence/h5-appapi';
mkdirSync(OUT, { recursive: true });

const PAGES = [
  { file: '01_首页.png',        hash: '#/home',                     wait: '.pcard',  mark: '最新政策卡片' },
  { file: '02_政策项目列表.png', hash: '#/policy?type=project',      wait: '.pcard',  mark: '政策卡片' },
  { file: '03_园区发布.png',     hash: '#/policy?type=park',         wait: '.pcard',  mark: '园区政策卡片' },
  { file: '04_政策详情.png',     hash: '#/detail?id=P2001',          wait: '.detail-hero', mark: '详情蓝头图' },
  { file: '05_政策申报.png',     hash: '#/apply?id=P2001&title=' + encodeURIComponent('深圳湾生态园租金补贴'), wait: '.form-card', mark: '申报表单' },
  { file: '06_园区企业.png',     hash: '#/enterprise',               wait: '.ent-card', mark: '企业卡片' },
  { file: '07_政策工具.png',     hash: '#/tools',                    wait: '.mine-list', mark: '工具菜单' },
  { file: '08_我的.png',         hash: '#/mine',                     wait: '.mine-hd', mark: '我的页头' },
  { file: '09_订阅设置.png',     hash: '#/subscribe',                wait: '.sub-item', mark: '订阅开关' },
];

const summary = [];
const browser = await chromium.launch({ headless: true });
const ctx = await browser.newContext({
  viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true,
  deviceScaleFactor: 2, locale: 'zh-CN',
});
const page = await ctx.newPage();
for (const p of PAGES) {
  try {
    await page.goto(BASE + p.hash, { waitUntil: 'networkidle', timeout: 60000 });
    await page.waitForSelector(p.wait, { timeout: 15000 }).catch(() => {});
    await page.waitForTimeout(900);
    await page.screenshot({ path: `${OUT}/${p.file}`, fullPage: true });
    const text = (await page.locator('#page').innerText().catch(() => '')).replace(/\s+/g, ' ').slice(0, 220);
    const loading = /加载中/.test(text);
    summary.push({ file: p.file, mark: p.mark, textLen: text.length, loading, text });
    console.log(`✓ ${p.file}  ${loading ? '⚠️仍在加载' : 'OK'}`);
  } catch (e) {
    summary.push({ file: p.file, error: String(e).slice(0, 120) });
    console.log(`✗ ${p.file}  ${e.message}`);
  }
}
await browser.close();
console.log('\n===== 文本抽样（验证真实数据渲染）=====');
for (const s of summary) console.log(`\n[${s.file}] ${s.mark || ''}\n  ${s.text || s.error || ''}`);
