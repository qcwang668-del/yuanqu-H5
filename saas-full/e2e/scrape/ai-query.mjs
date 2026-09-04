import { chromium } from '@playwright/test'
import fs from 'node:fs'
const OUT = '/home/fangnan/PycharmProjects/u667a-u8fdc-u529b-u4f01-saas/e2e/scrape/out'
const b = await chromium.launch({ headless: true, args: ['--no-sandbox'] })
const ctx = await b.newContext({ viewport: { width: 1680, height: 1080 }, storageState: `${OUT}/state.json` })
const pages = []
ctx.on('page', (pg) => { pages.push(pg) })
const p = await ctx.newPage()
p.setDefaultTimeout(12000)
await p.goto('https://clue.liqicloud.com/#/index', { waitUntil: 'domcontentloaded' }).catch(() => {})
await p.waitForTimeout(2500)
await p.locator('.ant-menu-submenu-title:has-text("获客线索")').first().click().catch(() => {})
await p.waitForTimeout(1200)
await p.evaluate(() => { const el = Array.from(document.querySelectorAll('.ant-menu-item, li, a, span')).find((e) => (e.textContent || '').trim() === '企业查询'); if (el) (el.closest('.ant-menu-item, li, a') || el).click() })
await p.waitForTimeout(5000)
let fr = p.frames().find((f) => f.url().includes('clue-plugin'))
// 输入关键词 人工智能
await fr.fill('input[placeholder*="企业名称"], input[placeholder*="关键词"]', '人工智能').catch(() => {})
await p.waitForTimeout(700)
await fr.press('input[placeholder*="企业名称"], input[placeholder*="关键词"]', 'Enter').catch(() => {})
await p.waitForTimeout(1500)
fr = p.frames().find((f) => f.url().includes('clue-plugin'))
await fr.locator('button:has-text("查询")').first().click().catch(() => {})
await p.waitForTimeout(6500)
fr = p.frames().find((f) => f.url().includes('clue-plugin'))
const cnt = await fr.evaluate(() => { const m = document.body.innerText.match(/已为您找到\s*([\d,]+)\s*条/); return m ? m[1] : 'N/A' }).catch(() => 'err')
console.log('已为您找到=', cnt)
await p.screenshot({ path: `${OUT}/ai-result.png`, fullPage: true })
// dump 结果行：企业名 + 可点元素
const rows = await fr.evaluate(() => {
  const out = []
  document.querySelectorAll('*').forEach((e) => {
    const t = (e.childElementCount === 0 ? (e.innerText || '') : '').trim()
    if (t && /(有限公司|股份|集团|研究院|科技)$/.test(t) && t.length >= 4 && t.length < 40) {
      out.push({ tag: e.tagName, cls: (e.className || '').toString().slice(0, 40), t })
    }
  })
  const uniq = []; const seen = new Set()
  for (const r of out) { if (!seen.has(r.t)) { seen.add(r.t); uniq.push(r) } }
  return uniq.slice(0, 15)
}).catch(() => [])
console.log('RESULT COMPANIES=', JSON.stringify(rows, null, 1))
// 详情入口按钮
const detailBtns = await fr.evaluate(() => {
  const out = new Set()
  document.querySelectorAll('a,button,span,div').forEach((e) => { if (e.childElementCount === 0) { const t = (e.innerText || '').trim(); if (/详情|查看|解锁/.test(t) && t.length < 8) out.add(t) } })
  return [...out]
}).catch(() => [])
console.log('DETAIL BTNS=', JSON.stringify(detailBtns))
await b.close()
