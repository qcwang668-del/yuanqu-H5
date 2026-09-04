import { chromium } from '@playwright/test'
import fs from 'node:fs'
const OUT = '/home/fangnan/PycharmProjects/u667a-u8fdc-u529b-u4f01-saas/e2e/scrape/out'
fs.mkdirSync(OUT, { recursive: true })
const b = await chromium.launch({ headless: true, args: ['--no-sandbox'] })
const p = await b.newPage()
await p.setViewportSize({ width: 1600, height: 1000 })
await p.goto('https://clue.liqicloud.com/', { waitUntil: 'networkidle' }).catch(() => {})
await p.waitForTimeout(3000)
console.log('URL=', p.url())
console.log('TITLE=', await p.title())
await p.screenshot({ path: `${OUT}/login.png`, fullPage: true })
// dump inputs
const inputs = await p.evaluate(() => Array.from(document.querySelectorAll('input')).map((i) => ({
  type: i.type, placeholder: i.placeholder, name: i.name, id: i.id, cls: i.className
})))
console.log('INPUTS=', JSON.stringify(inputs, null, 1))
const btns = await p.evaluate(() => Array.from(document.querySelectorAll('button, .btn, [class*="btn"]')).slice(0, 20).map((b) => (b.innerText || '').trim()).filter(Boolean))
console.log('BUTTONS=', JSON.stringify(btns))
const tabs = await p.evaluate(() => Array.from(document.querySelectorAll('.el-tabs__item, [role="tab"], .tab')).map((t) => (t.innerText || '').trim()).filter(Boolean))
console.log('TABS=', JSON.stringify(tabs))
await b.close()
