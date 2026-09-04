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
await p.evaluate(() => { const el = Array.from(document.querySelectorAll('.ant-menu-item, li, a, span')).find((e) => (e.textContent || '').trim() === '找线索'); if (el) (el.closest('.ant-menu-item, li, a') || el).click() })
await p.waitForTimeout(6000)
console.log('URL=', p.url())
const fr = p.frames().find((f) => f.url().includes('clue-plugin')) || p.mainFrame()
console.log('frame url=', fr.url())
await p.screenshot({ path: `${OUT}/zhaoxiansuo.png`, fullPage: true })
// 找企业名/详情入口
const names = await fr.evaluate(() => {
  const out = []
  document.querySelectorAll('a, [class*="name"], [class*="company"], .title, td').forEach((e) => {
    const t = (e.innerText || '').trim()
    if (t && /有限|公司|集团|股份/.test(t) && t.length < 40) out.push(t)
  })
  return [...new Set(out)].slice(0, 15)
})
console.log('COMPANY NAMES ON PAGE=', JSON.stringify(names, null, 1))
await b.close()
