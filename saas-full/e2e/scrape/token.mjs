import { chromium } from '@playwright/test'
const OUT = '/home/fangnan/PycharmProjects/u667a-u8fdc-u529b-u4f01-saas/e2e/scrape/out'
const b = await chromium.launch({ headless: true, args: ['--no-sandbox'] })
const ctx = await b.newContext({ viewport: { width: 1680, height: 1080 } })
const p = await ctx.newPage()
p.setDefaultTimeout(15000)
let tokenSeen = []
ctx.on('response', async (r) => {
  const u = r.url()
  if (/login|auth|token|user\/get|profile|permission/i.test(u) && /liqicloud/.test(u)) {
    let body = ''; try { body = await r.text() } catch {}
    const m = body.match(/"(accessToken|token)"\s*:\s*"([^"]{8,})"/)
    if (m) { tokenSeen.push({ url: u.split('/').slice(-2).join('/').slice(0, 40), key: m[1], val: m[2] }); console.log('TOKEN in resp', m[1], '=', m[2].slice(0, 40), 'from', u.slice(-40)) }
  }
})
// 捕获 iframe 收到的 postMessage
await p.addInitScript(() => {
  window.__msgs = []
  window.addEventListener('message', (e) => {
    try { window.__msgs.push({ origin: e.origin, data: typeof e.data === 'string' ? e.data.slice(0, 300) : JSON.stringify(e.data).slice(0, 300) }) } catch {}
  })
})
await p.goto('https://clue.liqicloud.com/', { waitUntil: 'networkidle' }).catch(() => {})
await p.waitForTimeout(2000)
await p.fill('input[name="username"]', '19911110000'); await p.fill('input[name="password"]', 'admin123')
await p.click('button:has-text("登录")'); await p.waitForTimeout(3500)
const ok = p.locator('button:has-text("确定")').first(); if (await ok.count()) { await ok.click(); await p.waitForTimeout(4500) }
await p.locator('.ant-menu-submenu-title:has-text("获客线索")').first().click().catch(() => {})
await p.waitForTimeout(1000)
await p.evaluate(() => { const el = Array.from(document.querySelectorAll('.ant-menu-item, li, a, span')).find((e) => (e.textContent || '').trim() === '企业查询'); if (el) (el.closest('.ant-menu-item, li, a') || el).click() })
await p.waitForTimeout(4500)
// 读 parent + iframe 的 __msgs
const pm = await p.evaluate(() => window.__msgs || [])
console.log('PARENT MSGS=', JSON.stringify(pm.slice(0, 10), null, 1))
const fr = p.frames().find((f) => f.url().includes('clue-plugin'))
const fm = fr ? await fr.evaluate(() => window.__msgs || []).catch(() => []) : []
console.log('IFRAME MSGS=', JSON.stringify(fm.slice(0, 10), null, 1))
console.log('TOKENS SEEN=', JSON.stringify(tokenSeen.map((x) => ({ key: x.key, val: x.val.slice(0, 24) })), null, 1))
await b.close()
