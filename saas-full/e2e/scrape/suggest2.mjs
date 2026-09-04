import { chromium } from '@playwright/test'
const OUT = '/home/fangnan/PycharmProjects/u667a-u8fdc-u529b-u4f01-saas/e2e/scrape/out'
const b = await chromium.launch({ headless: true, args: ['--no-sandbox'] })
const ctx = await b.newContext({ viewport: { width: 1680, height: 1080 }, storageState: `${OUT}/state.json` })
const p = await ctx.newPage()
p.setDefaultTimeout(12000)
ctx.on('response', async (r) => {
  const u = r.url()
  if (/suggest|search|match|associate|company|enterprise|keyword|list|query/i.test(u) && r.request().method() === 'POST') {
    let body = ''; try { body = (await r.text()).slice(0, 200) } catch {}
    console.log('POST', r.status(), u.slice(0, 80), '=>', body.replace(/\s+/g, ' '))
  }
})
await p.goto('https://clue.liqicloud.com/#/index', { waitUntil: 'domcontentloaded' }).catch(() => {})
await p.waitForTimeout(2500)
await p.locator('.ant-menu-submenu-title:has-text("获客线索")').first().click().catch(() => {})
await p.waitForTimeout(1200)
await p.evaluate(() => { const el = Array.from(document.querySelectorAll('.ant-menu-item, li, a, span')).find((e) => (e.textContent || '').trim() === '企业查询'); if (el) (el.closest('.ant-menu-item, li, a') || el).click() })
await p.waitForTimeout(5000)
const fr = p.frames().find((f) => f.url().includes('clue-plugin'))
await fr.click('input[placeholder*="企业名称"], input[placeholder*="关键词"]').catch(() => {})
await fr.type('input[placeholder*="企业名称"], input[placeholder*="关键词"]', '快意电梯', { delay: 120 }).catch(() => {})
await p.waitForTimeout(3500)
// 截取顶部区域（含可能的下拉）
await p.screenshot({ path: `${OUT}/suggest2.png`, clip: { x: 220, y: 90, width: 1200, height: 500 } }).catch(() => {})
// dump 输入框附近所有可见文本块
const dd = await fr.evaluate(() => {
  const out = []
  document.querySelectorAll('[class*="dropdown"],[class*="option"],[class*="suggest"],[class*="associate"],[class*="result"],[class*="item"],li').forEach((e) => {
    const t = (e.innerText || '').trim()
    if (t.includes('快意') || /电梯/.test(t)) out.push(t.slice(0, 50))
  })
  return [...new Set(out)].slice(0, 15)
})
console.log('DROPDOWN 快意=', JSON.stringify(dd))
await b.close()
