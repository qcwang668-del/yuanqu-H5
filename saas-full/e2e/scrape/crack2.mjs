import { chromium } from '@playwright/test'
const OUT = '/home/fangnan/PycharmProjects/u667a-u8fdc-u529b-u4f01-saas/e2e/scrape/out'
const b = await chromium.launch({ headless: false, args: ['--no-sandbox'] })
const ctx = await b.newContext({ viewport: { width: 1680, height: 1050 } })
const p = await ctx.newPage()
p.setDefaultTimeout(20000)
let liqiToken = ''
ctx.on('response', async (r) => {
  const u = r.url()
  if (/clue\.liqicloud\.com/.test(u) && /login|refresh-token|auth/i.test(u)) {
    let bd = ''; try { bd = await r.text() } catch {}
    // 登录响应里独立的 token 字段（= liqiToken），排除 accessToken/refreshToken
    const m = bd.match(/"token"\s*:\s*"([^"]{8,})"/)
    if (m) { liqiToken = m[1]; console.log('LIQI TOKEN captured:', liqiToken.slice(0, 20), 'len', liqiToken.length) }
  }
})
await ctx.route(/clue-plugin\.liqicloud\.com\/app-api\//, async (route) => {
  const h = { ...route.request().headers() }
  if (liqiToken) h['token'] = liqiToken   // 强制用 liqiToken
  await route.continue({ headers: h })
})
await p.goto('https://clue.liqicloud.com/', { waitUntil: 'networkidle' }).catch(() => {})
await p.waitForTimeout(2500)
await p.fill('input[name="username"]', '19911110000'); await p.fill('input[name="password"]', 'admin123')
await p.click('button:has-text("登录")'); await p.waitForTimeout(4000)
const ok = p.locator('button:has-text("确定")').first(); if (await ok.count()) { await ok.click(); await p.waitForTimeout(6000) }
console.log('liqiToken after login=', liqiToken.slice(0, 20))
// 企业查询 快意电梯
await p.locator('.ant-menu-submenu-title:has-text("获客线索")').first().click().catch(() => {})
await p.waitForTimeout(1200)
await p.evaluate(() => { const el = Array.from(document.querySelectorAll('.ant-menu-item, li, a, span')).find((e) => (e.textContent || '').trim() === '企业查询'); if (el) (el.closest('.ant-menu-item, li, a') || el).click() })
await p.waitForTimeout(6000)
// 监听查询结果接口
ctx.on('response', async (r) => {
  if (r.url().includes('clue-plugin') && /select\/list|keyword\/list|info\/list/.test(r.url())) {
    let bd = ''; try { bd = await r.text() } catch {}
    const code = (bd.match(/"code":(-?\d+)/) || [])[1]; const total = (bd.match(/"total":(\d+)/) || [])[1]
    console.log('QUERY API code=' + code, 'total=' + (total || '-'), bd.includes('快意') ? 'HAS快意' : '')
  }
})
const fr = () => p.frames().find((f) => f.url().includes('clue-plugin'))
await fr().fill('input[placeholder*="企业名称"], input[placeholder*="关键词"]', '快意电梯股份有限公司').catch(() => {})
await p.waitForTimeout(700)
await fr().press('input[placeholder*="企业名称"], input[placeholder*="关键词"]', 'Enter').catch(() => {})
await p.waitForTimeout(1500)
await fr().locator('button:has-text("查询")').first().click().catch(() => {})
await p.waitForTimeout(6000)
const cnt = await fr().evaluate(() => { const m = document.body.innerText.match(/已为您找到\s*(\d+)\s*条/); return m ? m[1] : 'N/A' }).catch(() => 'err')
console.log('=== 已为您找到', cnt, '条 ===')
await p.screenshot({ path: `${OUT}/crack2-result.png`, fullPage: true })
await b.close()
