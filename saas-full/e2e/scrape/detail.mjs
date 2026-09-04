import { chromium } from '@playwright/test'
import fs from 'node:fs'
const OUT = '/home/fangnan/PycharmProjects/u667a-u8fdc-u529b-u4f01-saas/e2e/scrape/out'
const b = await chromium.launch({ headless: true, args: ['--no-sandbox'] })
const ctx = await b.newContext({ viewport: { width: 1680, height: 1050 }, storageState: `${OUT}/state.json` })
const p = await ctx.newPage()
await p.goto('https://clue.liqicloud.com/#/index', { waitUntil: 'networkidle' }).catch(() => {})
await p.waitForTimeout(2500)
await p.locator('.ant-menu-submenu-title:has-text("获客线索")').first().click().catch(() => {})
await p.waitForTimeout(1000)
await p.locator('.ant-menu-item:has-text("企业查询")').first().click().catch(() => {})
await p.waitForTimeout(4500)
console.log('URL=', p.url())
// 列出所有 frame
for (const f of p.frames()) {
  const url = f.url()
  const inputs = await f.evaluate(() => Array.from(document.querySelectorAll('input')).map((i) => i.placeholder || i.type)).catch(() => [])
  console.log('FRAME:', url, '| inputs:', JSON.stringify(inputs))
}
await p.screenshot({ path: `${OUT}/enterprise-search.png`, fullPage: true })

// 在 iframe 内搜索
const kw = '快意电梯股份有限公司'
const fl = p.frameLocator('iframe').first()
const box = fl.locator('input[placeholder*="企业"], input[placeholder*="输入"], input[placeholder*="名称"], input[placeholder*="搜索"], input[type="text"]').first()
await box.fill(kw).catch((e) => console.log('fill err', e.message))
await p.waitForTimeout(500)
const sb = fl.locator('button:has-text("查询"), button:has-text("搜索")').first()
if (await sb.count().catch(() => 0)) { await sb.click().catch(() => {}) } else { await box.press('Enter').catch(() => {}) }
await p.waitForTimeout(4500)
await p.screenshot({ path: `${OUT}/search-result.png`, fullPage: true })

// 打开详情
let opened = false
for (const sel of ['text=快意电梯股份有限公司', 'text=快意电梯', 'text=查看详情', 'text=详情']) {
  const el = fl.locator(sel).first()
  if (await el.count().catch(() => 0)) { await el.click().catch(() => {}); await p.waitForTimeout(4500); opened = true; break }
}
console.log('opened=', opened)
await p.screenshot({ path: `${OUT}/detail-01.png`, fullPage: true })
const tabs = await fl.locator('.ant-tabs-tab, [role="tab"], .el-tabs__item, [class*="tab"]').allInnerTexts().catch(() => [])
console.log('DETAIL TABS=', JSON.stringify(tabs.slice(0, 20)))
await ctx.storageState({ path: `${OUT}/state.json` })
await b.close()
