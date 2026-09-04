import { chromium } from '@playwright/test'
import fs from 'node:fs'
const OUT = '/home/fangnan/PycharmProjects/u667a-u8fdc-u529b-u4f01-saas/e2e/scrape/out'
const HTML = `${OUT}/html`; fs.mkdirSync(HTML, { recursive: true })
const b = await chromium.launch({ headless: true, args: ['--no-sandbox'] })
const ctx = await b.newContext({ viewport: { width: 1680, height: 1080 }, storageState: `${OUT}/state.json` })
const pages = []
ctx.on('page', (pg) => pages.push(pg))
let queryResp = null
ctx.on('response', async (r) => {
  const u = r.url()
  if (/enterprise|company|query|search|list|page/i.test(u) && r.request().method() === 'POST') {
    try { const t = await r.text(); if (t.includes('total') || t.includes('快意') || t.includes('list')) { queryResp = t.slice(0, 400); console.log('QUERY API', r.status(), u.slice(0, 80)) } } catch {}
  }
})
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
// DOM 内点击「查询」
fr = p.frames().find((f) => f.url().includes('clue-plugin'))
const qClicked = await fr.evaluate(() => {
  const btns = Array.from(document.querySelectorAll('button, .ant-btn, [class*="btn"]'))
  const q = btns.find((x) => (x.innerText || '').trim() === '查询')
  if (q) { q.click(); return true }
  return false
})
console.log('查询 DOM click=', qClicked)
await p.waitForTimeout(7000)
console.log('QUERY RESP=', queryResp)
fr = p.frames().find((f) => f.url().includes('clue-plugin'))
const cnt = await fr.evaluate(() => { const m = document.body.innerText.match(/已为您找到\s*(\d+)\s*条/); return m ? m[1] : '?' }).catch(() => '?')
console.log('已找到条数=', cnt)
await p.screenshot({ path: `${OUT}/q-result.png`, fullPage: true })
// DOM 点击企业名进详情
const opened = await fr.evaluate(() => {
  const el = Array.from(document.querySelectorAll('a, [class*="name"], [class*="company"], .title, span, td')).find((e) => (e.innerText || '').trim().includes('快意电梯') && (e.innerText || '').trim().length < 30)
  if (el) { el.click(); return el.innerText.trim() }
  return null
})
console.log('detail click=', opened)
await p.waitForTimeout(6000)
const det = pages.find((x) => x !== p) || p
await det.bringToFront().catch(() => {})
await det.waitForTimeout(2500)
console.log('detail page url=', det.url(), '| frames=', det.frames().map((f) => f.url().slice(0, 70)))
await det.screenshot({ path: `${OUT}/detail-final.png`, fullPage: true }).catch(() => {})
const dfr = det.frames().find((f) => f.url().includes('clue-plugin')) || det.mainFrame()
let tabs = await dfr.locator('.ant-tabs-tab, [role="tab"]').allInnerTexts().catch(() => [])
console.log('DETAIL TABS=', JSON.stringify(tabs.map((t) => t.trim()).filter(Boolean)))
await b.close()
