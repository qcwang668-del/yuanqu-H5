import { test, expect } from '@playwright/test'
import fs from 'node:fs'

const BASE = process.env.E2E_BASE || 'http://120.79.142.141:8000'
const EV = 'evidence/customer-pool-diag'
fs.mkdirSync(EV, { recursive: true })

test.setTimeout(240000)

test('诊断 /customer-pool 功能：空态→圈选汇入→AI外呼 vs chainInvest', async ({ page }) => {
  await page.setViewportSize({ width: 1600, height: 1000 })
  const shot = (n: string) => page.screenshot({ path: `${EV}/${n}`, fullPage: true })

  // 1) 登录 admin
  await page.goto(BASE + '/', { waitUntil: 'domcontentloaded' })
  await page.waitForTimeout(2500)
  const fillIf = async (sel: string, val: string) => {
    const el = page.locator(sel).first()
    if (await el.count()) { await el.fill(''); await el.fill(val) }
  }
  await fillIf('input[placeholder*="租户"]', '芋道源码')
  await fillIf('input[placeholder*="账号"], input[placeholder*="用户名"]', 'admin')
  await fillIf('input[type="password"]', 'admin123')
  await page.waitForTimeout(400)
  await page.locator('button:has-text("登"), .el-button--primary').first().click()
  // 隧道上登录 + 拉权限较慢，等待跳转到首页（最多 45s）
  try {
    await page.waitForURL((u) => !u.pathname.includes('/login'), { timeout: 45000 })
  } catch {
    console.log('登录后 URL:', page.url())
  }
  await page.waitForTimeout(3000)
  expect(page.url()).not.toContain('/login')

  // 2) 直接访问 /customer-pool —— 空态
  await page.goto(BASE + '/customer-pool', { waitUntil: 'domcontentloaded' })
  await page.waitForTimeout(3000)
  const cw = page.locator('.cw-page')
  console.log('A. /customer-pool .cw-page 可见:', await cw.count())
  const empty = page.locator('.el-empty')
  console.log('A. 空态 el-empty 可见:', await empty.count(), (await empty.count()) ? (await empty.first().textContent()) : '')
  console.log('A. 待联系卡片数 .cw-card:', await page.locator('.cw-card').count())
  await shot('1_customer-pool_空态.png')

  // 3) 对比 chainInvest
  await page.goto(BASE + '/investment/chainInvest', { waitUntil: 'domcontentloaded' })
  await page.waitForTimeout(3500)
  console.log('B. chainInvest 页面存在:', await page.locator('.chain-invest, .ci-page, [class*="chain"]').count())
  await shot('2_chainInvest_对照.png')

  // 4) 榜单招商 → 进企业列表 → 全选本页 → 加入待联系
  await page.goto(BASE + '/investment/rankingList', { waitUntil: 'domcontentloaded' })
  await page.waitForTimeout(2500)
  const card = page.locator('.ranking-list .rk-card, .rk-card').first()
  if (await card.count()) { await card.click(); await page.waitForTimeout(3000) }
  console.log('C. 企业列表 .ent-page:', await page.locator('.ent-page').count(), '.ent-card:', await page.locator('.ent-card').count())
  await shot('3_企业列表.png')

  const selAll = page.locator('button:has-text("全选本页"), button:has-text("全选")').first()
  if (await selAll.count()) { await selAll.click(); await page.waitForTimeout(600) }
  const addBtn = page.locator('button:has-text("加入待联系")').first()
  if (await addBtn.count()) { await addBtn.click(); await page.waitForTimeout(1500) }
  await shot('4_圈选加入待联系.png')

  // 5) 回到 /customer-pool —— 应有数据
  await page.goto(BASE + '/customer-pool', { waitUntil: 'domcontentloaded' })
  await page.waitForTimeout(3000)
  const cards = await page.locator('.cw-card').count()
  console.log('D. 汇入后 .cw-card 数:', cards)
  await shot('5_customer-pool_有数据.png')

  // 6) 一键 AI 外呼
  if (cards > 0) {
    await page.locator('.cw-toolbar .el-checkbox').first().click() // 全选
    await page.waitForTimeout(400)
    const batchBtn = page.locator('button:has-text("一键AI外呼")').first()
    if (await batchBtn.count()) { await batchBtn.click(); await page.waitForTimeout(6000) }
    await shot('6_一键AI外呼.png')
    console.log('E. 批量进度条:', await page.locator('.cw-batch').count())
  }
  await shot('7_customer-pool_最终.png')
})
