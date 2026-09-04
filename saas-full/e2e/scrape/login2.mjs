import { chromium } from '@playwright/test'
import fs from 'node:fs'
const OUT = '/home/fangnan/PycharmProjects/u667a-u8fdc-u529b-u4f01-saas/e2e/scrape/out'
fs.mkdirSync(OUT, { recursive: true })
const b = await chromium.launch({ headless: true, args: ['--no-sandbox'] })
const ctx = await b.newContext({ viewport: { width: 1600, height: 1000 } })
const p = await ctx.newPage()
await p.goto('https://clue.liqicloud.com/', { waitUntil: 'networkidle' }).catch(() => {})
await p.waitForTimeout(2500)
await p.fill('input[name="username"]', '19911110000')
await p.fill('input[name="password"]', 'admin123')
await p.click('button:has-text("登录")')
await p.waitForTimeout(4000)
// 选择登录企业 → 确定
const okBtn = p.locator('button:has-text("确定")').first()
if (await okBtn.count()) { await okBtn.click(); await p.waitForTimeout(5000) }
console.log('URL=', p.url())
await p.screenshot({ path: `${OUT}/dashboard.png`, fullPage: true })
// dump 顶部/侧栏菜单
const menu = await p.evaluate(() => {
  const els = Array.from(document.querySelectorAll('.ant-menu-item, .ant-menu-submenu-title, [class*="menu"] span, [class*="nav"] a, a'))
  const seen = new Set(); const out = []
  for (const el of els) {
    const t = (el.innerText || '').trim().split('\n')[0]
    if (t && t.length <= 12 && !seen.has(t)) { seen.add(t); out.push(t) }
  }
  return out.slice(0, 80)
})
console.log('MENU=', JSON.stringify(menu))
await ctx.storageState({ path: `${OUT}/state.json` })
console.log('SAVED')
await b.close()
