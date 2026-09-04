import { test, expect } from '@playwright/test'
import fs from 'node:fs'

const BASE = 'http://127.0.0.1:5180'
const EV = 'evidence/investment-ranking'
fs.mkdirSync(EV, { recursive: true })

test('智慧招商 · 榜单招商 页面 + 菜单验收', async ({ page }) => {
  await page.setViewportSize({ width: 1600, height: 1000 })

  // 1) 登录
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

  // 2) 侧边栏应出现「智慧招商」一级菜单
  const dir = page.locator('.el-menu :text("智慧招商")').first()
  await dir.waitFor({ timeout: 15000 })
  await page.screenshot({ path: `${EV}/01_侧边栏含智慧招商.png` })
  // 展开目录，点子菜单
  await dir.click()
  await page.waitForTimeout(1000)
  await page.locator(':text("榜单招商")').first().click()
  await page.waitForTimeout(2500)
  await page.screenshot({ path: `${EV}/02_榜单招商-侧栏展开.png` })

  // 3) 直达路由并断言结构
  await page.goto(BASE + '/investment/rankingList', { waitUntil: 'domcontentloaded' })
  await page.waitForTimeout(2000)
  await expect(page.locator('.ranking-list')).toBeVisible()
  await expect(page.getByText('政府认定榜单')).toBeVisible()
  await expect(page.getByText('平台特色榜单')).toBeVisible()
  await expect(page.getByText('商业综合榜单')).toBeVisible()
  await expect(page.getByText('财富榜单')).toBeVisible()
  await expect(page.getByText('福布斯榜单')).toBeVisible()
  const cardCount = await page.locator('.ranking-list .rk-card').count()
  expect(cardCount).toBeGreaterThanOrEqual(30)
  // 政府认定榜单应有 12 张卡（专精特新等）
  await expect(page.getByText('专精特新小巨人')).toBeVisible()
  await expect(page.getByText('独角兽企业')).toBeVisible()
  await page.screenshot({ path: `${EV}/03_榜单招商-总览.png`, fullPage: true })

  // 4) 收藏交互
  await page.locator('.ranking-list .rk-card .rk-star').first().click()
  await page.waitForTimeout(1200)
  await page.screenshot({ path: `${EV}/04_收藏星标点亮.png` })

  // 5) 点卡片查看详情（toast）
  await page.locator('.ranking-list .rk-card').first().click()
  await page.waitForTimeout(1200)
  await page.screenshot({ path: `${EV}/05_点击卡片提示.png` })
})
