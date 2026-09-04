import { chromium } from '@playwright/test'
import fs from 'node:fs'
const OUT = '/home/fangnan/PycharmProjects/u667a-u8fdc-u529b-u4f01-saas/e2e/scrape/out'
const HTML = `${OUT}/html`; fs.mkdirSync(HTML, { recursive: true })
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
const getFrame = () => p.frames().find((f) => f.url().includes('clue-plugin'))
let fr = getFrame()
console.log('plugin frame=', !!fr, fr && fr.url())
// 搜索：填企业名 → 回车加条件 → 点「查询」
const kw = '快意电梯股份有限公司'
await fr.fill('input[placeholder*="企业名称"], input[placeholder*="关键词"]', kw).catch((e) => console.log('fill', e.message))
await p.waitForTimeout(800)
await fr.press('input[placeholder*="企业名称"], input[placeholder*="关键词"]', 'Enter').catch(() => {})
await p.waitForTimeout(1200)
fr = getFrame()
await fr.locator('button:has-text("查询")').first().click().catch((e) => console.log('查询', e.message))
await p.waitForTimeout(5000)
await p.screenshot({ path: `${OUT}/search-result.png`, fullPage: true })
// 点结果里的企业名进详情
fr = getFrame()
const found = await fr.locator('text=快意电梯股份有限公司').count().catch(() => 0)
console.log('result contains 快意电梯 count=', found)
await fr.locator('text=快意电梯股份有限公司').first().click().catch(async () => {
  await fr.locator('text=快意电梯').first().click().catch(() => {})
})
await p.waitForTimeout(5000)
fr = getFrame()
await p.screenshot({ path: `${OUT}/detail-01.png`, fullPage: true })
// 详情 tabs
let tabs = await fr.locator('.ant-tabs-tab, [role="tab"]').allInnerTexts().catch(() => [])
tabs = tabs.map((t) => t.trim()).filter(Boolean)
console.log('TABS=', JSON.stringify(tabs))
// 存详情主区 HTML
const dumpHtml = async (name) => {
  const html = await fr.evaluate(() => {
    const c = document.querySelector('.detail, .enterprise-detail, .content, #app') || document.body
    return c.outerHTML
  }).catch(() => '')
  fs.writeFileSync(`${HTML}/${name}.html`, html)
}
await dumpHtml('detail-basic')
// 遍历每个 tab 截图
let i = 0
for (const tname of tabs) {
  i++
  await fr.locator('.ant-tabs-tab, [role="tab"]', { hasText: tname }).first().click().catch(() => {})
  await p.waitForTimeout(2000)
  const safe = String(i).padStart(2, '0') + '_' + tname.replace(/[\/\s]/g, '')
  await p.screenshot({ path: `${OUT}/tab-${safe}.png`, fullPage: true })
  await dumpHtml('tab-' + safe)
  console.log('captured tab', safe)
}
await b.close()
