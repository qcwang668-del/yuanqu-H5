import { chromium } from '@playwright/test'
import fs from 'node:fs'
const OUT = '/home/fangnan/PycharmProjects/u667a-u8fdc-u529b-u4f01-saas/e2e/scrape/out'
const b = await chromium.launch({ headless: true, args: ['--no-sandbox'] })
const ctx = await b.newContext({ viewport: { width: 1680, height: 1080 } })
const p = await ctx.newPage()
p.setDefaultTimeout(15000)
ctx.on('response', async (r) => {
  const u = r.url()
  if (/keyword\/lis|qiyedata|enterprise|detail|unlock/i.test(u)) {
    let body = ''; try { body = (await r.text()).slice(0, 160) } catch {}
    console.log('API', r.status(), u.split('/').slice(-2).join('/').slice(0, 40), '=>', body.replace(/\s+/g, ' ').slice(0, 120))
  }
})
// 全新登录
await p.goto('https://clue.liqicloud.com/', { waitUntil: 'networkidle' }).catch(() => {})
await p.waitForTimeout(2500)
await p.fill('input[name="username"]', '19911110000')
await p.fill('input[name="password"]', 'admin123')
await p.click('button:has-text("登录")')
await p.waitForTimeout(4000)
const ok = p.locator('button:has-text("确定")').first()
if (await ok.count()) { await ok.click(); await p.waitForTimeout(5000) }
console.log('logged in URL=', p.url())
fs.writeFileSync(`${OUT}/state.json`, JSON.stringify(await ctx.storageState()))
// 进企业查询
await p.locator('.ant-menu-submenu-title:has-text("获客线索")').first().click().catch(() => {})
await p.waitForTimeout(1200)
await p.evaluate(() => { const el = Array.from(document.querySelectorAll('.ant-menu-item, li, a, span')).find((e) => (e.textContent || '').trim() === '企业查询'); if (el) (el.closest('.ant-menu-item, li, a') || el).click() })
await p.waitForTimeout(5000)
let fr = p.frames().find((f) => f.url().includes('clue-plugin'))
await fr.click('input[placeholder*="企业名称"], input[placeholder*="关键词"]').catch(() => {})
await fr.type('input[placeholder*="企业名称"], input[placeholder*="关键词"]', '快意电梯', { delay: 120 }).catch(() => {})
await p.waitForTimeout(3500)
await p.screenshot({ path: `${OUT}/fresh-suggest.png`, clip: { x: 220, y: 90, width: 1200, height: 560 } }).catch(() => {})
// 尝试点候选公司（下拉里含"快意电梯"的项，排除"已选条件/公司名称"标签）
const picked = await fr.evaluate(() => {
  const cands = Array.from(document.querySelectorAll('li, [class*="option"], [class*="item"], [class*="dropdown"] *'))
  const el = cands.find((e) => { const t = (e.innerText || '').trim(); return /快意电梯/.test(t) && !/已选|修改|查询|公司名称/.test(t) && t.length < 30 })
  if (el) { el.click(); return el.innerText.trim().slice(0, 30) }
  return null
})
console.log('picked suggestion=', picked)
await p.waitForTimeout(3500)
fr = p.frames().find((f) => f.url().includes('clue-plugin'))
await fr.locator('button:has-text("查询")').first().click().catch(() => {})
await p.waitForTimeout(5000)
fr = p.frames().find((f) => f.url().includes('clue-plugin'))
const cnt = await fr.evaluate(() => { const m = document.body.innerText.match(/已为您找到\s*(\d+)\s*条/); return m ? m[1] : 'N/A' }).catch(() => 'err')
console.log('已为您找到=', cnt)
await p.screenshot({ path: `${OUT}/fresh-result.png`, fullPage: true })
await b.close()
