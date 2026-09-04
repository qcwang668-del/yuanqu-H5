import { chromium } from '@playwright/test'
import fs from 'node:fs'
const OUT = '/home/fangnan/PycharmProjects/u667a-u8fdc-u529b-u4f01-saas/e2e/scrape/out'
const HTML = `${OUT}/html`; fs.mkdirSync(HTML, { recursive: true })
const b = await chromium.launch({ headless: false, args: ['--no-sandbox', '--disable-blink-features=AutomationControlled'] })
const ctx = await b.newContext({ viewport: { width: 1680, height: 1050 } })
const p = await ctx.newPage()
p.setDefaultTimeout(20000)
const pages = [p]
ctx.on('page', (pg) => { pages.push(pg); console.log('NEW PAGE', pg.url()) })
ctx.on('response', async (r) => {
  const u = r.url()
  if (u.includes('clue-plugin.liqicloud.com/app-api')) {
    let bd = ''; try { bd = await r.text() } catch {}
    const code = (bd.match(/"code"\s*:\s*(-?\d+)/) || [])[1]
    const total = (bd.match(/"total"\s*:\s*(\d+)/) || [])[1]
    if (code && code !== '0' || total) console.log('PLUGIN code=' + code, 'total=' + (total || '-'), '|', u.split('/app-api/')[1].split('?')[0].slice(0, 45))
  }
})
// 自然登录（模拟真实用户）
await p.goto('https://clue.liqicloud.com/', { waitUntil: 'networkidle' }).catch(() => {})
await p.waitForTimeout(2500)
await p.fill('input[name="username"]', '19911110000'); await p.fill('input[name="password"]', 'admin123')
await p.click('button:has-text("登录")'); await p.waitForTimeout(4000)
const ok = p.locator('button:has-text("确定")').first(); if (await ok.count()) { await ok.click(); await p.waitForTimeout(6000) }
console.log('logged in:', p.url())
// 线索管理 → 解锁列表
await p.locator('.ant-menu-submenu-title:has-text("线索管理")').first().click().catch(() => {})
await p.waitForTimeout(1200)
await p.evaluate(() => { const el = Array.from(document.querySelectorAll('.ant-menu-item, li, a, span')).find((e) => (e.textContent || '').trim() === '解锁列表'); if (el) (el.closest('.ant-menu-item, li, a') || el).click() })
await p.waitForTimeout(6000)
const getFr = () => p.frames().find((f) => f.url().includes('clue-plugin'))
let fr = getFr()
console.log('unlock frame=', fr && fr.url())
await p.screenshot({ path: `${OUT}/uh-list.png`, fullPage: true })
// 读表格企业名
const names = await fr.evaluate(() => {
  const out = []
  document.querySelectorAll('table tbody tr').forEach((tr) => {
    const a = tr.querySelector('a, [class*="link"], [class*="name"]')
    const t = (a?.innerText || tr.innerText || '').trim().split('\n')[0]
    if (t && /(公司|集团|股份|中心|厂|店|部|所)/.test(t)) out.push(t)
  })
  return out.slice(0, 10)
}).catch(() => [])
console.log('UNLOCK NAMES=', JSON.stringify(names))
if (!names.length) { console.log('解锁列表为空 — 无法从此入口进详情'); await b.close(); process.exit(0) }
// 点第一家企业名进详情
fr = getFr()
await fr.locator(`text=${names[0]}`).first().click().catch(() => {})
await p.waitForTimeout(5000)
// 详情可能在新标签
let det = pages.find((x) => x !== p && !x.isClosed()) || p
await det.bringToFront().catch(() => {})
await det.waitForTimeout(3000)
console.log('DETAIL URL=', det.url())
await det.screenshot({ path: `${OUT}/uh-detail.png`, fullPage: true }).catch(() => {})
const dfr = det.frames().find((f) => f.url().includes('clue-plugin')) || det.mainFrame()
let tabs = await dfr.locator('.ant-tabs-tab, [role="tab"]').allInnerTexts().catch(() => [])
tabs = [...new Set(tabs.map((t) => t.trim()).filter(Boolean))]
console.log('DETAIL TABS=', JSON.stringify(tabs))
const dump = async (n) => { try { fs.writeFileSync(`${HTML}/${n}.html`, await dfr.content()) } catch {} }
await dump('uh-detail-default')
let i = 0
for (const tn of tabs) { i++; await dfr.locator('.ant-tabs-tab, [role="tab"]', { hasText: tn }).first().click().catch(() => {}); await det.waitForTimeout(2200); const s = String(i).padStart(2, '0') + '_' + tn.replace(/[\/\s\(\)]/g, ''); await det.screenshot({ path: `${OUT}/uh-tab-${s}.png`, fullPage: true }); await dump('uh-tab-' + s); console.log('captured', s) }
await b.close()
