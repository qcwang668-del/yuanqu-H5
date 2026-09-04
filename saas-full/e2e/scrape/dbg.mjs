import { chromium } from '@playwright/test'
const OUT = '/home/fangnan/PycharmProjects/u667a-u8fdc-u529b-u4f01-saas/e2e/scrape/out'
const b = await chromium.launch({ headless: true, args: ['--no-sandbox'] })
const ctx = await b.newContext({ viewport: { width: 1680, height: 1080 }, storageState: `${OUT}/state.json` })
let popup = null
ctx.on('page', (pg) => { popup = pg; console.log('NEW PAGE opened') })
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
// 点查询
await fr.locator('button:has-text("查询")').first().click().catch((e) => console.log('查询click', e.message))
await p.waitForTimeout(6000)
fr = p.frames().find((f) => f.url().includes('clue-plugin'))
const cnt = await fr.evaluate(() => {
  const t = document.body.innerText
  const m = t.match(/已为您找到\s*(\d+)\s*条/)
  return m ? m[1] : 'N/A'
}).catch(() => 'err')
console.log('已为您找到=', cnt)
// dump 可能的结果行/企业名链接
const rows = await fr.evaluate(() => {
  const out = []
  document.querySelectorAll('a, [class*="name"], [class*="company"], td, .title').forEach((e) => {
    const t = (e.innerText || '').trim()
    if (t.includes('快意电梯')) out.push({ tag: e.tagName, cls: e.className, t: t.slice(0, 40) })
  })
  return out.slice(0, 10)
}).catch(() => [])
console.log('快意电梯 elements=', JSON.stringify(rows, null, 1))
await p.screenshot({ path: `${OUT}/dbg.png`, fullPage: true })
await b.close()
