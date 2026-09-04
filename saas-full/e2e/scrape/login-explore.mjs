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
await p.waitForTimeout(300)
await p.click('button:has-text("登录")')
await p.waitForTimeout(6000)
console.log('AFTER LOGIN URL=', p.url())
await p.screenshot({ path: `${OUT}/home.png`, fullPage: true })
// dump left menu / nav text + hrefs
const menu = await p.evaluate(() => {
  const items = Array.from(document.querySelectorAll('a, .ant-menu-item, .ant-menu-submenu, [class*="menu"] li, [class*="nav"] a'))
  const seen = new Set()
  const out = []
  for (const el of items) {
    const t = (el.innerText || '').trim().split('\n')[0]
    const href = el.getAttribute('href') || ''
    if (t && !seen.has(t + href) && t.length < 20) { seen.add(t + href); out.push({ t, href }) }
  }
  return out.slice(0, 60)
})
console.log('MENU=', JSON.stringify(menu, null, 1))
// save session
await ctx.storageState({ path: `${OUT}/state.json` })
console.log('SAVED state.json')
await b.close()
