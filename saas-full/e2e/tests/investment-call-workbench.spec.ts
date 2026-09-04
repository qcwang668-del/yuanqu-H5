import { test, expect } from '@playwright/test'
import fs from 'node:fs'

// 容器直连 GPU 上的前端预览（可覆盖：E2E_BASE=http://120.79.142.141:8000）
const BASE = process.env.E2E_BASE || 'http://192.168.8.43:5180'
const EV = 'evidence/investment-call-workbench'
fs.mkdirSync(EV, { recursive: true })

test.setTimeout(180000)

test('智慧招商 · 圈选→待联系→AI外呼→推CRM 全链路', async ({ page }) => {
  await page.setViewportSize({ width: 1600, height: 1000 })

  // ---------- 1) 登录 ----------
  await page.goto(BASE + '/', { waitUntil: 'domcontentloaded' })
  await page.waitForTimeout(2500)
  const fillIf = async (sel: string, val: string) => {
    const el = page.locator(sel).first()
    if (await el.count()) { await el.fill(''); await el.fill(val) }
  }
  await fillIf('input[placeholder*="租户"]', '芋道源码')
  await fillIf('input[placeholder*="账号"], input[placeholder*="用户名"]', 'admin')
  await fillIf('input[type="password"]', 'admin123')
  await page.waitForTimeout(500)
  await page.locator('button:has-text("登"), .el-button--primary').first().click()
  await page.waitForTimeout(5000)
  expect(page.url()).not.toContain('/login')

  // ---------- 1.5) 侧边栏应出现「客户池管理」一级菜单 ----------
  const menu = page.locator('.el-menu :text("客户池管理")').first()
  await menu.waitFor({ timeout: 15000 })
  await page.screenshot({ path: `${EV}/00_一级菜单-客户池管理.png` })
  await menu.click()
  await page.waitForTimeout(2000)
  await expect(page.locator('.cw-page')).toBeVisible()
  expect(page.url()).toContain('/customer-pool')
  await page.screenshot({ path: `${EV}/00b_菜单进入客户池管理.png`, fullPage: true })

  // ---------- 2) 榜单招商入口 → 企业列表 ----------
  await page.goto(BASE + '/investment/rankingList', { waitUntil: 'domcontentloaded' })
  await page.waitForTimeout(1800)
  await expect(page.locator('.ranking-list')).toBeVisible()
  await page.screenshot({ path: `${EV}/01_榜单招商入口.png`, fullPage: true })

  await page.locator('.ranking-list .rk-card').first().click()
  await page.waitForTimeout(2500)
  await expect(page.locator('.ent-page')).toBeVisible()
  await expect(page.locator('.ent-card').first()).toBeVisible({ timeout: 15000 })
  await page.screenshot({ path: `${EV}/02_企业列表-可圈选.png`, fullPage: true })

  // ---------- 3) 圈选：全选本页 + 加入待联系 ----------
  await page.locator('button:has-text("全选本页")').click()
  await page.waitForTimeout(500)
  const addBtn = page.locator('button:has-text("加入待联系")').first()
  await addBtn.click()
  await page.waitForTimeout(1200)
  // 待联系工作台 badge 应显示数量
  const badge = page.locator('.el-badge__content').first()
  await expect(badge).toBeVisible()
  await page.screenshot({ path: `${EV}/03_圈选加入待联系.png`, fullPage: true })

  // ---------- 4) 进入 客户池管理（AI 外呼工作台） ----------
  await page.locator('button:has-text("客户池管理")').click()
  await page.waitForTimeout(2000)
  await expect(page.locator('.cw-page')).toBeVisible()
  await expect(page.locator('.cw-card').first()).toBeVisible({ timeout: 10000 })
  const cardCount = await page.locator('.cw-card').count()
  expect(cardCount).toBeGreaterThan(0)
  await page.screenshot({ path: `${EV}/04_外呼工作台-待联系池.png`, fullPage: true })

  // ---------- 5) 单个 AI 外呼：拨号→通话→挂断→小结 ----------
  await page.locator('.cw-card .ph button:has-text("拨打")').first().click()
  await page.waitForTimeout(600)
  await expect(page.locator('.dial-dlg')).toBeVisible()
  await page.screenshot({ path: `${EV}/05_拨号中.png` })
  // 进入通话中（等待自动接通 + 话术字幕）
  await page.locator('.dial-stage.talking').waitFor({ timeout: 8000 })
  await page.waitForTimeout(3500)
  await expect(page.locator('.subtitles .sub-line').first()).toBeVisible()
  await page.screenshot({ path: `${EV}/06_通话中-AI话术字幕.png` })
  // 挂断 → 小结
  await page.locator('button:has-text("挂断")').click()
  await page.waitForTimeout(800)
  await expect(page.locator('.dial-stage.summary')).toBeVisible()
  await page.screenshot({ path: `${EV}/07_通话小结-意向分级.png` })
  await page.locator('button:has-text("保存通话记录")').click()
  await page.waitForTimeout(1200)
  // 该企业应出现「已接通」状态 + 通话记录
  await expect(page.locator('.cw-card:has-text("已接通")').first()).toBeVisible({ timeout: 8000 })
  await page.screenshot({ path: `${EV}/08_回填-已接通状态.png`, fullPage: true })

  // ---------- 6) 批量 AI 外呼 ----------
  await page.locator('.cw-toolbar >> text=全选').first().click()
  await page.waitForTimeout(400)
  await page.locator('button:has-text("一键AI外呼")').click()
  // 等待批量进度跑完
  await page.locator('.cw-batch').waitFor({ timeout: 8000 })
  await page.screenshot({ path: `${EV}/09_批量外呼进行中.png`, fullPage: true })
  await page.locator('text=批量外呼完成').first().waitFor({ timeout: 30000 })
  await page.waitForTimeout(800)
  await page.screenshot({ path: `${EV}/10_批量外呼完成-漏斗更新.png`, fullPage: true })

  // ---------- 7) 一键推送 CRM ----------
  const pushBtn = page.locator('.cw-card button:has-text("推送CRM")').first()
  await pushBtn.click()
  await page.waitForTimeout(800)
  await expect(page.getByText('推送到 CRM · 生成跟进线索')).toBeVisible()
  await page.screenshot({ path: `${EV}/11_推CRM弹窗.png` })
  await page.locator('.el-dialog button:has-text("确认推送")').click()
  await page.waitForTimeout(1200)
  // CRM 线索列表应出现记录
  await expect(page.locator('.clue-it').first()).toBeVisible({ timeout: 8000 })
  await page.screenshot({ path: `${EV}/12_CRM线索生成-闭环.png`, fullPage: true })

  console.log('全链路 E2E 通过：卡片数=' + cardCount)
})
