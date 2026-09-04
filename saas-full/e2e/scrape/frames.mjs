import { chromium } from '@playwright/test'
const OUT = '/home/fangnan/PycharmProjects/u667a-u8fdc-u529b-u4f01-saas/e2e/scrape/out'
const b = await chromium.launch({ headless: true, args: ['--no-sandbox'] })
const ctx = await b.newContext({ viewport: { width: 1680, height: 1050 }, storageState: `${OUT}/state.json` })
const p = await ctx.newPage()
p.setDefaultTimeout(8000)
await p.goto('https://clue.liqicloud.com/#/index', { waitUntil: 'domcontentloaded' }).catch(() => {})
await p.waitForTimeout(2500)
// 展开 获客线索
await p.locator('.ant-menu-submenu-title:has-text("获客线索")').first().click().catch(() => {})
await p.waitForTimeout(1500)
// DOM 内按精确文本点击「企业查询」
const clicked = await p.evaluate(() => {
  const all = Array.from(document.querySelectorAll('.ant-menu-item, .ant-menu-item-only-child, li, a, span'))
  const el = all.find((e) => (e.textContent || '').trim() === '企业查询')
  if (el) { (el.closest('.ant-menu-item, li, a') || el).click(); return true }
  return false
})
console.log('clicked 企业查询=', clicked)
await p.waitForTimeout(5000)
console.log('URL=', p.url())
await p.screenshot({ path: `${OUT}/eq.png`, fullPage: true }).catch(() => {})
const frames = p.frames()
console.log('FRAME COUNT=', frames.length)
for (const f of frames) {
  let inputs = []
  try { inputs = await f.evaluate(() => Array.from(document.querySelectorAll('input')).map((i) => i.placeholder || i.type || '')) } catch (e) {}
  console.log('FRAME url=', f.url().slice(0, 110), '| inputs=', JSON.stringify(inputs.slice(0, 10)))
}
await b.close()
