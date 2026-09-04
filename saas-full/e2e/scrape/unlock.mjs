import { chromium } from '@playwright/test'
const OUT = '/home/fangnan/PycharmProjects/u667a-u8fdc-u529b-u4f01-saas/e2e/scrape/out'
const b = await chromium.launch({ headless: true, args: ['--no-sandbox'] })
const ctx = await b.newContext({ viewport: { width: 1680, height: 1080 }, storageState: `${OUT}/state.json` })
const p = await ctx.newPage()
p.setDefaultTimeout(12000)
await p.goto('https://clue.liqicloud.com/#/index', { waitUntil: 'domcontentloaded' }).catch(() => {})
await p.waitForTimeout(2500)
// 展开 线索管理
await p.locator('.ant-menu-submenu-title:has-text("线索管理")').first().click().catch(() => {})
await p.waitForTimeout(1200)
// 点 解锁列表
await p.evaluate(() => { const el = Array.from(document.querySelectorAll('.ant-menu-item, li, a, span')).find((e) => (e.textContent || '').trim() === '解锁列表'); if (el) (el.closest('.ant-menu-item, li, a') || el).click() })
await p.waitForTimeout(6000)
console.log('URL=', p.url())
console.log('FRAMES=', p.frames().map((f) => f.url().slice(0, 90)))
await p.screenshot({ path: `${OUT}/unlock-list.png`, fullPage: true })
const fr = p.frames().find((f) => f.url().includes('clue-plugin')) || p.mainFrame()
// 列企业名候选
const names = await fr.evaluate(() => {
  const out = []
  document.querySelectorAll('a, [class*="name"], [class*="company"], .title, td, span').forEach((e) => {
    const t = (e.innerText || '').trim()
    if (t && /(有限公司|集团|股份|有限责任)/.test(t) && t.length < 40) out.push({ cls: e.className, tag: e.tagName, t })
  })
  const seen = new Set(); return out.filter((x) => !seen.has(x.t) && seen.add(x.t)).slice(0, 15)
})
console.log('NAMES=', JSON.stringify(names, null, 1))
await b.close()
