import { chromium } from '@playwright/test'
const b = await chromium.launch({ headless: false, args: ['--no-sandbox'] })
const ctx = await b.newContext({ viewport: { width: 1680, height: 1050 } })
const p = await ctx.newPage()
p.setDefaultTimeout(20000)
ctx.on('response', async (r) => {
  const u = r.url()
  if (!/liqicloud/.test(u)) return
  let bd = ''; try { bd = await r.text() } catch {}
  const hasSh = /shToken|shtoken/i.test(u) || /shToken/i.test(bd)
  const hasAcc = /"accessToken"/.test(bd)
  if (hasSh || (hasAcc && /app-api/.test(u))) {
    const sh = (bd.match(/"(shToken|sh_token)"\s*:\s*"([^"]+)"/) || [])[2]
    const acc = (bd.match(/"accessToken"\s*:\s*"([^"]{8,})"/) || [])[1]
    console.log('>>', new URL(u).host, u.split('?')[0].split('/').slice(-3).join('/').slice(0, 50),
      '| reqQ=', (u.split('?')[1] || '').slice(0, 40), '| sh=', sh ? sh.slice(0, 16) : '-', '| acc=', acc ? acc.slice(0, 12) : '-')
  }
})
await p.goto('https://clue.liqicloud.com/', { waitUntil: 'networkidle' }).catch(() => {})
await p.waitForTimeout(2500)
await p.fill('input[name="username"]', '19911110000'); await p.fill('input[name="password"]', 'admin123')
await p.click('button:has-text("登录")'); await p.waitForTimeout(4000)
const ok = p.locator('button:has-text("确定")').first(); if (await ok.count()) { await ok.click(); await p.waitForTimeout(6000) }
console.log('=== 打开企业查询以触发 token 交换 ===')
await p.locator('.ant-menu-submenu-title:has-text("获客线索")').first().click().catch(() => {})
await p.waitForTimeout(1200)
await p.evaluate(() => { const el = Array.from(document.querySelectorAll('.ant-menu-item, li, a, span')).find((e) => (e.textContent || '').trim() === '企业查询'); if (el) (el.closest('.ant-menu-item, li, a') || el).click() })
await p.waitForTimeout(8000)
await b.close()
