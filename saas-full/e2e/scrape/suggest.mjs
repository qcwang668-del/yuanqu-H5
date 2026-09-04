import { chromium } from '@playwright/test'
const OUT = '/home/fangnan/PycharmProjects/u667a-u8fdc-u529b-u4f01-saas/e2e/scrape/out'
const b = await chromium.launch({ headless: true, args: ['--no-sandbox'] })
const ctx = await b.newContext({ viewport: { width: 1680, height: 1080 }, storageState: `${OUT}/state.json` })
const p = await ctx.newPage()
p.setDefaultTimeout(12000)
await p.goto('https://clue.liqicloud.com/#/index', { waitUntil: 'domcontentloaded' }).catch(() => {})
await p.waitForTimeout(2500)
await p.locator('.ant-menu-submenu-title:has-text("获客线索")').first().click().catch(() => {})
await p.waitForTimeout(1200)
await p.evaluate(() => {
  const el = Array.from(document.querySelectorAll('.ant-menu-item, li, a, span')).find((e) => (e.textContent || '').trim() === '企业查询')
  if (el) (el.closest('.ant-menu-item, li, a') || el).click()
})
await p.waitForTimeout(5000)
const fr = p.frames().find((f) => f.url().includes('clue-plugin'))
console.log('frame=', !!fr)
const kw = '快意电梯股份有限公司'
// 逐字输入触发自动补全
await fr.click('input[placeholder*="企业名称"], input[placeholder*="关键词"]').catch(() => {})
await fr.type('input[placeholder*="企业名称"], input[placeholder*="关键词"]', kw, { delay: 60 }).catch((e) => console.log('type', e.message))
await p.waitForTimeout(3000)
await p.screenshot({ path: `${OUT}/suggest.png`, fullPage: true })
// dump 下拉/候选项
const items = await fr.evaluate(() => {
  const sels = ['.ant-select-dropdown', '.ant-select-item', '.suggestion', '.dropdown', '[class*="option"]', '[class*="suggest"]', 'ul li']
  const out = []
  for (const s of sels) document.querySelectorAll(s).forEach((e) => { const t = (e.innerText || '').trim(); if (t && t.length < 60) out.push(s + ' :: ' + t) })
  return out.slice(0, 30)
})
console.log('SUGGEST ITEMS=', JSON.stringify(items, null, 1))
await b.close()
