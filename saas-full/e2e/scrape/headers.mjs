import { chromium } from '@playwright/test'
const OUT = '/home/fangnan/PycharmProjects/u667a-u8fdc-u529b-u4f01-saas/e2e/scrape/out'
const b = await chromium.launch({ headless: true, args: ['--no-sandbox'] })
const ctx = await b.newContext({ viewport: { width: 1680, height: 1080 } })
const p = await ctx.newPage()
p.setDefaultTimeout(15000)
const interesting = (h) => {
  const o = {}
  for (const k of Object.keys(h)) if (/authorization|token|tenant|access|sign|x-/i.test(k)) o[k] = (h[k] || '').slice(0, 50)
  return o
}
ctx.on('request', (r) => {
  const u = r.url()
  if (/app-api|\/api\//i.test(u) && /liqicloud/.test(u)) {
    const h = interesting(r.headers())
    if (Object.keys(h).length) console.log('REQ', new URL(u).host, u.split('?')[0].split('/').slice(-2).join('/'), JSON.stringify(h))
  }
})
await p.goto('https://clue.liqicloud.com/', { waitUntil: 'networkidle' }).catch(() => {})
await p.waitForTimeout(2000)
await p.fill('input[name="username"]', '19911110000'); await p.fill('input[name="password"]', 'admin123')
await p.click('button:has-text("登录")'); await p.waitForTimeout(3500)
const ok = p.locator('button:has-text("确定")').first(); if (await ok.count()) { await ok.click(); await p.waitForTimeout(4500) }
console.log('=== 进入企业查询并输入触发 keyword/list ===')
await p.locator('.ant-menu-submenu-title:has-text("获客线索")').first().click().catch(() => {})
await p.waitForTimeout(1000)
await p.evaluate(() => { const el = Array.from(document.querySelectorAll('.ant-menu-item, li, a, span')).find((e) => (e.textContent || '').trim() === '企业查询'); if (el) (el.closest('.ant-menu-item, li, a') || el).click() })
await p.waitForTimeout(4500)
const fr = p.frames().find((f) => f.url().includes('clue-plugin'))
await fr.click('input[placeholder*="企业名称"], input[placeholder*="关键词"]').catch(() => {})
await fr.type('input[placeholder*="企业名称"], input[placeholder*="关键词"]', '快意电梯', { delay: 120 }).catch(() => {})
await p.waitForTimeout(3500)
await b.close()
