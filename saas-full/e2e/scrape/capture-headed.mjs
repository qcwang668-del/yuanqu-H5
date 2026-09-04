import { chromium } from '@playwright/test'
import fs from 'node:fs'
const OUT = '/home/fangnan/PycharmProjects/u667a-u8fdc-u529b-u4f01-saas/e2e/scrape/out'
const HTML = `${OUT}/html`; fs.mkdirSync(HTML, { recursive: true })
const b = await chromium.launch({ headless: false, args: ['--no-sandbox', '--disable-blink-features=AutomationControlled'] })
const ctx = await b.newContext({ viewport: { width: 1680, height: 1050 } })
const p = await ctx.newPage()
p.setDefaultTimeout(20000)
let adminToken = '', pluginToken = ''
ctx.on('response', async (r) => {
  const u = r.url()
  try {
    if (/liqicloud/.test(u) && /login|token|shToken|auth/i.test(u)) {
      const body = await r.text()
      const m = body.match(/"accessToken"\s*:\s*"([^"]{8,})"/)
      if (m) { if (u.includes('clue-plugin') || u.includes('shToken')) pluginToken = m[1]; else adminToken = m[1] }
    }
  } catch {}
})
await ctx.route(/clue-plugin\.liqicloud\.com\/app-api\//, async (route) => {
  const h = { ...route.request().headers() }
  const tk = pluginToken || adminToken
  if (tk && !h['token']) h['token'] = tk
  await route.continue({ headers: h })
})

await p.goto('https://clue.liqicloud.com/', { waitUntil: 'networkidle' }).catch(() => {})
await p.waitForTimeout(2500)
await p.fill('input[name="username"]', '19911110000'); await p.fill('input[name="password"]', 'admin123')
await p.click('button:has-text("登录")'); await p.waitForTimeout(4000)
const ok = p.locator('button:has-text("确定")').first(); if (await ok.count()) { await ok.click(); await p.waitForTimeout(5500) }
console.log('login ok. adminToken=', adminToken.slice(0, 12), 'pluginToken=', pluginToken.slice(0, 12))

await p.locator('.ant-menu-submenu-title:has-text("获客线索")').first().click().catch(() => {})
await p.waitForTimeout(1200)
await p.evaluate(() => { const el = Array.from(document.querySelectorAll('.ant-menu-item, li, a, span')).find((e) => (e.textContent || '').trim() === '企业查询'); if (el) (el.closest('.ant-menu-item, li, a') || el).click() })
await p.waitForTimeout(6000)

const getFr = () => p.frames().find((f) => f.url().includes('clue-plugin'))
let cnt = '0'
for (let attempt = 1; attempt <= 3; attempt++) {
  let fr = getFr()
  if (!fr) { await p.waitForTimeout(2000); continue }
  await fr.fill('input[placeholder*="企业名称"], input[placeholder*="关键词"]', '快意电梯股份有限公司').catch(() => {})
  await p.waitForTimeout(700)
  await fr.press('input[placeholder*="企业名称"], input[placeholder*="关键词"]', 'Enter').catch(() => {})
  await p.waitForTimeout(1500)
  fr = getFr()
  await fr.locator('button:has-text("查询")').first().click().catch(() => {})
  await p.waitForTimeout(6000)
  fr = getFr()
  cnt = await fr.evaluate(() => { const m = document.body.innerText.match(/已为您找到\s*(\d+)\s*条/); return m ? m[1] : '0' }).catch(() => '0')
  console.log(`attempt ${attempt}: 已为您找到 ${cnt} 条 (pluginToken=${pluginToken.slice(0, 10)})`)
  if (cnt !== '0' && cnt !== 'N/A') break
  await p.waitForTimeout(2000)
}
await p.screenshot({ path: `${OUT}/headed-result.png`, fullPage: true })
if (cnt === '0' || cnt === 'N/A') { console.log('STILL 0 — abort detail'); await b.close(); process.exit(0) }

// 打开详情
let fr = getFr()
await fr.locator('text=快意电梯股份有限公司').first().click().catch(async () => { await fr.locator('text=快意电梯').first().click().catch(() => {}) })
await p.waitForTimeout(5000)
fr = getFr()
await p.screenshot({ path: `${OUT}/detail-full.png`, fullPage: true })
let tabs = await fr.locator('.ant-tabs-tab, [role="tab"]').allInnerTexts().catch(() => [])
tabs = [...new Set(tabs.map((t) => t.trim()).filter(Boolean))]
console.log('DETAIL TABS=', JSON.stringify(tabs))
const dump = async (name) => { try { fs.writeFileSync(`${HTML}/${name}.html`, await fr.content()) } catch {} }
await dump('detail-default')
let i = 0
for (const tn of tabs) {
  i++
  await fr.locator('.ant-tabs-tab, [role="tab"]', { hasText: tn }).first().click().catch(() => {})
  await p.waitForTimeout(2200)
  const safe = String(i).padStart(2, '0') + '_' + tn.replace(/[\/\s\(\)]/g, '')
  await p.screenshot({ path: `${OUT}/dtab-${safe}.png`, fullPage: true })
  await dump('dtab-' + safe)
  console.log('captured', safe)
}
await b.close()
