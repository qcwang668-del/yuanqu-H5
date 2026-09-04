import { chromium } from '@playwright/test'
const b = await chromium.launch({ headless: false, args: ['--no-sandbox'] })
const ctx = await b.newContext({ viewport: { width: 1680, height: 1050 } })
const p = await ctx.newPage(); p.setDefaultTimeout(20000)
ctx.on('response', async (r) => {
  const u = r.url()
  try {
    const ct = r.headers()['content-type'] || ''
    if (ct.includes('json') && /liqicloud/.test(u)) {
      const bd = await r.text()
      if (/shToken|sh_token|shtoken/i.test(bd) || /shToken/i.test(u)) {
        const m = bd.match(/"(sh[_]?[Tt]oken)"\s*:\s*"([^"]+)"/)
        console.log('SHTOKEN@', new URL(u).host, u.split('/app-api/')[1] ? u.split('/app-api/')[1].split('?')[0].slice(0, 46) : u.slice(-46), '| body:', bd.replace(/\s+/g, ' ').slice(0, 140))
      }
    }
  } catch {}
})
// 也 hook 主站向 iframe 发的 postMessage
await p.addInitScript(() => {
  const origAdd = window.HTMLIFrameElement
  const op = window.postMessage
  // 记录本 window 发出的 postMessage（含 iframe.contentWindow.postMessage 通过原型）
  const OrigWinPost = Window.prototype.postMessage
  Window.prototype.postMessage = function (msg, origin, tr) {
    try { (window.__sent = window.__sent || []).push({ origin, data: typeof msg === 'string' ? msg.slice(0, 200) : JSON.stringify(msg).slice(0, 200) }) } catch {}
    return OrigWinPost.apply(this, arguments)
  }
})
await p.goto('https://clue.liqicloud.com/', { waitUntil: 'networkidle' }).catch(() => {})
await p.waitForTimeout(2500)
await p.fill('input[name="username"]', '19911110000'); await p.fill('input[name="password"]', 'admin123')
await p.click('button:has-text("登录")'); await p.waitForTimeout(4000)
const ok = p.locator('button:has-text("确定")').first(); if (await ok.count()) { await ok.click(); await p.waitForTimeout(5500) }
await p.locator('.ant-menu-submenu-title:has-text("获客线索")').first().click().catch(() => {})
await p.waitForTimeout(1000)
await p.evaluate(() => { const el = Array.from(document.querySelectorAll('.ant-menu-item, li, a, span')).find((e) => (e.textContent || '').trim() === '企业查询'); if (el) (el.closest('.ant-menu-item, li, a') || el).click() })
await p.waitForTimeout(9000)
const sent = await p.evaluate(() => window.__sent || [])
console.log('PARENT SENT postMessages=', JSON.stringify(sent.filter((s) => /token|shToken|LIQI/i.test(s.data)).slice(0, 10), null, 1))
await b.close()
