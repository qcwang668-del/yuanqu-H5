import { chromium } from '@playwright/test'
const OUT = '/home/fangnan/PycharmProjects/u667a-u8fdc-u529b-u4f01-saas/e2e/scrape/out'
const b = await chromium.launch({ headless: true, args: ['--no-sandbox'] })
const ctx = await b.newContext({ viewport: { width: 1680, height: 1080 }, storageState: `${OUT}/state.json` })
const p = await ctx.newPage()
p.setDefaultTimeout(12000)
// 记录接口
ctx.on('response', async (r) => {
  const u = r.url()
  if (/query|enterprise|company|list|search|page|clue/i.test(u) && r.request().method() !== 'OPTIONS') {
    let body = ''
    try { const ct = r.headers()['content-type'] || ''; if (ct.includes('json')) { const t = await r.text(); body = t.slice(0, 260) } } catch {}
    if (body.includes('total') || body.includes('快意') || /list/i.test(body)) console.log('RESP', r.status(), u.slice(0, 90), '=>', body.replace(/\s+/g, ' '))
  }
})
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
console.log('--- 点查询 ---')
fr = p.frames().find((f) => f.url().includes('clue-plugin'))
await fr.locator('button:has-text("查询")').first().click().catch(() => {})
await p.waitForTimeout(7000)
console.log('--- done ---')
await b.close()
