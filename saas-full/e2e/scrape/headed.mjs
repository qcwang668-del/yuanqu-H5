import { chromium } from '@playwright/test'
import fs from 'node:fs'
const OUT = '/home/fangnan/PycharmProjects/u667a-u8fdc-u529b-u4f01-saas/e2e/scrape/out'
const HTML = `${OUT}/html`; fs.mkdirSync(HTML, { recursive: true })
const b = await chromium.launch({ headless: false, args: ['--no-sandbox', '--disable-blink-features=AutomationControlled'] })
const ctx = await b.newContext({ viewport: { width: 1680, height: 1080 } })
const p = await ctx.newPage()
p.setDefaultTimeout(20000)
let tk = ''
ctx.on('response', async (r) => {
  const u = r.url()
  try {
    if (/liqicloud/.test(u) && /login|token|shToken|auth/i.test(u)) {
      const m = (await r.text()).match(/"accessToken"\s*:\s*"([^"]{8,})"/)
      if (m) { tk = m[1] }
    }
  } catch {}
})
await ctx.route(/clue-plugin\.liqicloud\.com\/app-api\//, async (route) => {
  const req = route.request(); const h = { ...req.headers() }
  if (tk && (!h['token'])) h['token'] = tk
  await route.continue({ headers: h })
})
// 登录
await p.goto('https://clue.liqicloud.com/', { waitUntil: 'networkidle' }).catch(() => {})
await p.waitForTimeout(2500)
await p.fill('input[name="username"]', '19911110000'); await p.fill('input[name="password"]', 'admin123')
await p.click('button:has-text("登录")'); await p.waitForTimeout(4000)
const ok = p.locator('button:has-text("确定")').first(); if (await ok.count()) { await ok.click(); await p.waitForTimeout(6000) }
console.log('token captured=', tk.slice(0, 16))
// 企业查询
await p.locator('.ant-menu-submenu-title:has-text("获客线索")').first().click().catch(() => {})
await p.waitForTimeout(1500)
await p.evaluate(() => { const el = Array.from(document.querySelectorAll('.ant-menu-item, li, a, span')).find((e) => (e.textContent || '').trim() === '企业查询'); if (el) (el.closest('.ant-menu-item, li, a') || el).click() })
await p.waitForTimeout(6000)
let fr = p.frames().find((f) => f.url().includes('clue-plugin'))
await fr.fill('input[placeholder*="企业名称"], input[placeholder*="关键词"]', '快意电梯股份有限公司').catch(() => {})
await p.waitForTimeout(800)
await fr.press('input[placeholder*="企业名称"], input[placeholder*="关键词"]', 'Enter').catch(() => {})
await p.waitForTimeout(1800)
fr = p.frames().find((f) => f.url().includes('clue-plugin'))
await fr.locator('button:has-text("查询")').first().click().catch(() => {})
await p.waitForTimeout(7000)
fr = p.frames().find((f) => f.url().includes('clue-plugin'))
const cnt = await fr.evaluate(() => { const m = document.body.innerText.match(/已为您找到\s*(\d+)\s*条/); return m ? m[1] : 'N/A' }).catch(() => 'err')
console.log('已为您找到=', cnt)
await p.screenshot({ path: `${OUT}/headed-result.png`, fullPage: true })
if (cnt !== '0' && cnt !== 'N/A' && cnt !== 'err') {
  // 打开详情
  await fr.locator('text=快意电梯股份有限公司').first().click().catch(() => {})
  await p.waitForTimeout(6000)
  fr = p.frames().find((f) => f.url().includes('clue-plugin')) || fr
  await p.screenshot({ path: `${OUT}/headed-detail-01.png`, fullPage: true })
  let tabs = await fr.locator('.ant-tabs-tab, [role="tab"]').allInnerTexts().catch(() => [])
  tabs = tabs.map((t) => t.trim()).filter(Boolean)
  console.log('DETAIL TABS=', JSON.stringify(tabs))
  fs.writeFileSync(`${HTML}/headed-detail.html`, await fr.content().catch(() => ''))
  let i = 0
  for (const tn of tabs) {
    i++
    await fr.locator('.ant-tabs-tab, [role="tab"]', { hasText: tn }).first().click().catch(() => {})
    await p.waitForTimeout(2500)
    await p.screenshot({ path: `${OUT}/headed-tab-${String(i).padStart(2, '0')}_${tn.replace(/[\/\s]/g, '')}.png`, fullPage: true })
    fs.writeFileSync(`${HTML}/tab-${i}-${tn.replace(/[\/\s]/g, '')}.html`, await fr.content().catch(() => ''))
    console.log('captured', tn)
  }
}
await b.close()
