import { chromium } from '@playwright/test'
const OUT = '/home/fangnan/PycharmProjects/u667a-u8fdc-u529b-u4f01-saas/e2e/scrape/out'
const b = await chromium.launch({ headless: true, args: ['--no-sandbox'] })
const ctx = await b.newContext({ viewport: { width: 1680, height: 1080 } })
const p = await ctx.newPage()
p.setDefaultTimeout(15000)
let adminToken = ''   // 主站 admin-api accessToken
let pluginToken = ''  // 插件 accessToken（经 shToken 交换）
ctx.on('response', async (r) => {
  const u = r.url()
  try {
    if (/liqicloud/.test(u) && /login|token|shToken|auth/i.test(u)) {
      const body = await r.text()
      const m = body.match(/"accessToken"\s*:\s*"([^"]{8,})"/)
      if (m) {
        if (u.includes('clue-plugin')) pluginToken = m[1]
        else adminToken = m[1]
        if (u.includes('shToken') || u.includes('clue-plugin')) pluginToken = m[1]
        console.log('captured token from', new URL(u).host, u.split('/').slice(-1)[0].slice(0, 30), '=>', m[1].slice(0, 16))
      }
    }
  } catch {}
})
// 注入 token 到插件所有 app-api 请求
await ctx.route(/clue-plugin\.liqicloud\.com\/app-api\//, async (route) => {
  const req = route.request()
  const h = { ...req.headers() }
  const tk = pluginToken || adminToken
  if (tk && (!h['token'] || h['token'] === '')) h['token'] = tk
  await route.continue({ headers: h })
})
await p.goto('https://clue.liqicloud.com/', { waitUntil: 'networkidle' }).catch(() => {})
await p.waitForTimeout(2000)
await p.fill('input[name="username"]', '19911110000'); await p.fill('input[name="password"]', 'admin123')
await p.click('button:has-text("登录")'); await p.waitForTimeout(3500)
const ok = p.locator('button:has-text("确定")').first(); if (await ok.count()) { await ok.click(); await p.waitForTimeout(5000) }
console.log('adminToken=', adminToken.slice(0, 16), 'pluginToken=', pluginToken.slice(0, 16))
// 企业查询
await p.locator('.ant-menu-submenu-title:has-text("获客线索")').first().click().catch(() => {})
await p.waitForTimeout(1000)
await p.evaluate(() => { const el = Array.from(document.querySelectorAll('.ant-menu-item, li, a, span')).find((e) => (e.textContent || '').trim() === '企业查询'); if (el) (el.closest('.ant-menu-item, li, a') || el).click() })
await p.waitForTimeout(5000)
let fr = p.frames().find((f) => f.url().includes('clue-plugin'))
await fr.fill('input[placeholder*="企业名称"], input[placeholder*="关键词"]', '快意电梯股份有限公司').catch(() => {})
await p.waitForTimeout(600)
await fr.press('input[placeholder*="企业名称"], input[placeholder*="关键词"]', 'Enter').catch(() => {})
await p.waitForTimeout(1500)
fr = p.frames().find((f) => f.url().includes('clue-plugin'))
await fr.locator('button:has-text("查询")').first().click().catch(() => {})
await p.waitForTimeout(6000)
fr = p.frames().find((f) => f.url().includes('clue-plugin'))
const cnt = await fr.evaluate(() => { const m = document.body.innerText.match(/已为您找到\s*(\d+)\s*条/); return m ? m[1] : 'N/A' }).catch(() => 'err')
console.log('已为您找到=', cnt)
await p.screenshot({ path: `${OUT}/crack-result.png`, fullPage: true })
await b.close()
