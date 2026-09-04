import { chromium } from '@playwright/test'
import fs from 'node:fs'
const OUT = '/home/fangnan/PycharmProjects/u667a-u8fdc-u529b-u4f01-saas/e2e/scrape/out'
const HTML = `${OUT}/html`; fs.mkdirSync(HTML, { recursive: true })
const b = await chromium.launch({ headless: true, args: ['--no-sandbox'] })
const ctx = await b.newContext({ viewport: { width: 1680, height: 1080 }, storageState: `${OUT}/state.json` })
const pages = []
ctx.on('page', (pg) => { pages.push(pg); console.log('NEW PAGE', pg.url()) })
const p = await ctx.newPage()
p.setDefaultTimeout(12000)
await p.goto('https://clue.liqicloud.com/#/index', { waitUntil: 'domcontentloaded' }).catch(() => {})
await p.waitForTimeout(2500)
await p.locator('.ant-menu-submenu-title:has-text("获客线索")').first().click().catch(() => {})
await p.waitForTimeout(1200)
await p.evaluate(() => { const el = Array.from(document.querySelectorAll('.ant-menu-item, li, a, span')).find((e) => (e.textContent || '').trim() === '企业查询'); if (el) (el.closest('.ant-menu-item, li, a') || el).click() })
await p.waitForTimeout(5000)
let fr = p.frames().find((f) => f.url().includes('clue-plugin'))
const kw = '快意电梯股份有限公司'
await fr.fill('input[placeholder*="企业名称"], input[placeholder*="关键词"]', kw).catch(() => {})
await p.waitForTimeout(500)
await fr.press('input[placeholder*="企业名称"], input[placeholder*="关键词"]', 'Enter').catch(() => {})
await p.waitForTimeout(1500)
fr = p.frames().find((f) => f.url().includes('clue-plugin'))
await fr.locator('button:has-text("查询")').first().click().catch(() => {})
await p.waitForTimeout(6000)

// 找到详情页（新标签）
let det = pages.find((pg) => pg !== p) || p
await det.bringToFront().catch(() => {})
await det.waitForTimeout(3000)
console.log('DETAIL PAGE URL=', det.url())
console.log('ALL PAGES=', pages.map((x) => x.url()))
await det.screenshot({ path: `${OUT}/detail-01.png`, fullPage: true }).catch((e) => console.log('shot', e.message))
// detail 可能也在 iframe
const dfr = det.frames().find((f) => f.url().includes('clue-plugin') || f.url().includes('detail')) || det.mainFrame()
console.log('DETAIL FRAMES=', det.frames().map((f) => f.url().slice(0, 80)))
let tabs = await dfr.locator('.ant-tabs-tab, [role="tab"], [class*="tab-item"]').allInnerTexts().catch(() => [])
tabs = tabs.map((t) => t.trim()).filter(Boolean)
console.log('DETAIL TABS=', JSON.stringify(tabs))
fs.writeFileSync(`${HTML}/detail-main.html`, await dfr.content().catch(() => ''))
await b.close()
