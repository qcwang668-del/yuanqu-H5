import { chromium } from '@playwright/test'
const OUT = '/home/fangnan/PycharmProjects/u667a-u8fdc-u529b-u4f01-saas/e2e/scrape/out'
const b = await chromium.launch({ headless: false, args: ['--no-sandbox'] })
const ctx = await b.newContext({ viewport: { width: 1680, height: 1050 } })
const p = await ctx.newPage()
p.setDefaultTimeout(20000)
let adminToken = '', pluginToken = ''
ctx.on('response', async (r) => {
  const u = r.url()
  try {
    if (/liqicloud/.test(u) && /login|token|shToken|auth/i.test(u)) {
      const bd = await r.text(); const m = bd.match(/"accessToken"\s*:\s*"([^"]{8,})"/)
      if (m) { if (u.includes('clue-plugin') || u.includes('shToken')) pluginToken = m[1]; else adminToken = m[1] }
    }
    if (u.includes('clue-plugin.liqicloud.com/app-api')) {
      let bd = ''; try { bd = await r.text() } catch {}
      const code = (bd.match(/"code"\s*:\s*(-?\d+)/) || [])[1]
      const msg = (bd.match(/"msg"\s*:\s*"([^"]*)"/) || [])[1]
      const total = (bd.match(/"total"\s*:\s*(\d+)/) || [])[1]
      const hasKuaiyi = bd.includes('快意') ? 'YES快意' : ''
      console.log('PLUGIN', r.status(), 'code=' + code, 'total=' + (total || '-'), hasKuaiyi, (msg || '').slice(0, 20), '|', u.split('/app-api/')[1].split('?')[0].slice(0, 40))
    }
  } catch {}
})
// 不注入，纯自然握手（观察 headed 下插件是否自然拿到有效 token）
await p.goto('https://clue.liqicloud.com/', { waitUntil: 'networkidle' }).catch(() => {})
await p.waitForTimeout(2500)
await p.fill('input[name="username"]', '19911110000'); await p.fill('input[name="password"]', 'admin123')
await p.click('button:has-text("登录")'); await p.waitForTimeout(4000)
const ok = p.locator('button:has-text("确定")').first(); if (await ok.count()) { await ok.click(); await p.waitForTimeout(5500) }
await p.locator('.ant-menu-submenu-title:has-text("获客线索")').first().click().catch(() => {})
await p.waitForTimeout(1200)
await p.evaluate(() => { const el = Array.from(document.querySelectorAll('.ant-menu-item, li, a, span')).find((e) => (e.textContent || '').trim() === '企业查询'); if (el) (el.closest('.ant-menu-item, li, a') || el).click() })
await p.waitForTimeout(6000)
console.log('=== 输入 快意电梯（触发 keyword/list）===')
const fr = () => p.frames().find((f) => f.url().includes('clue-plugin'))
await fr().click('input[placeholder*="企业名称"], input[placeholder*="关键词"]').catch(() => {})
await fr().type('input[placeholder*="企业名称"], input[placeholder*="关键词"]', '快意电梯', { delay: 130 }).catch(() => {})
await p.waitForTimeout(4000)
await p.screenshot({ path: `${OUT}/net-suggest.png`, clip: { x: 220, y: 90, width: 1200, height: 560 } }).catch(() => {})
console.log('=== 回车 + 查询 ===')
await fr().press('input[placeholder*="企业名称"], input[placeholder*="关键词"]', 'Enter').catch(() => {})
await p.waitForTimeout(1500)
await fr().locator('button:has-text("查询")').first().click().catch(() => {})
await p.waitForTimeout(6000)
await b.close()
