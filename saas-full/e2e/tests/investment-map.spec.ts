import { test, expect } from '@playwright/test'
import fs from 'node:fs'

const BASE = 'http://127.0.0.1:5180'
const EV = 'evidence/investment-map'
fs.mkdirSync(EV, { recursive: true })

test('智慧招商 · 地图招商 页面 + 菜单验收（Leaflet+高德）', async ({ page }) => {
  await page.setViewportSize({ width: 1680, height: 1000 })

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

  // 2) 侧边栏 智慧招商 → 地图招商
  const dir = page.locator('.el-menu :text("智慧招商")').first()
  await dir.waitFor({ timeout: 15000 })
  await dir.click()
  await page.waitForTimeout(1000)
  await expect(page.locator(':text("地图招商")').first()).toBeVisible()
  await page.screenshot({ path: `${EV}/01_侧栏智慧招商含地图招商.png` })
  await page.locator(':text("地图招商")').first().click()

  // 3) 进入地图招商，等 Leaflet + 高德瓦片
  await page.goto(BASE + '/investment/mapInvest', { waitUntil: 'domcontentloaded' })
  await page.waitForTimeout(7000)
  await expect(page.locator('.map-invest')).toBeVisible()
  await expect(page.locator('.mi-map.leaflet-container')).toBeVisible()
  const tiles = await page.locator('.mi-map img.leaflet-tile-loaded').count()
  expect(tiles).toBeGreaterThan(0)
  await expect(page.getByText(/共为您找到/)).toBeVisible()
  const rows = await page.locator('.mi-side .el-table__row').count()
  expect(rows).toBeGreaterThan(0)
  await page.screenshot({ path: `${EV}/02_地图招商-总览.png` })

  // 4) 圈选模式
  await page.getByText('圈选模式').click()
  await page.waitForTimeout(1200)
  await page.screenshot({ path: `${EV}/03_圈选模式.png` })

  // 5) 半径 3km
  const radius = page.locator('.mi-area input').first()
  await radius.fill('')
  await radius.fill('3')
  await radius.press('Enter')
  await page.waitForTimeout(1500)
  await page.screenshot({ path: `${EV}/04_半径3km.png` })

  // 6) 筛选下拉
  await page.locator('.mi-filters .fsel').first().click()
  await page.waitForTimeout(800)
  await page.screenshot({ path: `${EV}/05_筛选下拉.png` })
})
