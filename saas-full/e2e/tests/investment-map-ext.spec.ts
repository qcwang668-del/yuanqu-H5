import { test, expect } from '@playwright/test'
import fs from 'node:fs'

// 用外网域名访问，复现用户真实 referer（百度地图 AK 白名单校验）
const BASE = 'http://120.79.142.141:8000'
const EV = 'evidence/investment-map'
fs.mkdirSync(EV, { recursive: true })

test('地图招商 · 外网域名真实可达 + 百度地图出图', async ({ page }) => {
  await page.setViewportSize({ width: 1680, height: 1000 })

  // 收集百度地图相关网络失败 / 报错
  const mapErrors: string[] = []
  page.on('response', (r) => {
    const u = r.url()
    if (u.includes('api.map.baidu.com') || u.includes('.bdimg.com') || u.includes('bdstatic')) {
      if (r.status() >= 400) mapErrors.push(`${r.status()} ${u.slice(0, 90)}`)
    }
  })
  page.on('console', (m) => {
    const t = m.text()
    if (/百度地图|referer|APP不存在|ak|BMap/i.test(t) && m.type() === 'error') mapErrors.push('console:' + t.slice(0, 120))
  })

  await page.goto(BASE + '/', { waitUntil: 'domcontentloaded' })
  await page.waitForTimeout(3000)
  const fillIf = async (sel: string, val: string) => {
    const el = page.locator(sel).first()
    if (await el.count()) { await el.fill(''); await el.fill(val) }
  }
  await fillIf('input[placeholder*="租户"]', '芋道源码')
  await fillIf('input[placeholder*="账号"], input[placeholder*="用户名"]', 'admin')
  await fillIf('input[type="password"]', 'admin123')
  await page.waitForTimeout(500)
  await page.locator('button:has-text("登"), .el-button--primary').first().click()
  await page.waitForTimeout(6000)
  expect(page.url()).not.toContain('/login')

  await page.goto(BASE + '/investment/mapInvest', { waitUntil: 'domcontentloaded' })
  await page.waitForTimeout(10000) // 等 SDK + 瓦片

  await expect(page.locator('.map-invest')).toBeVisible()
  await expect(page.locator('.mi-map.leaflet-container')).toBeVisible()
  const tiles = await page.locator('.mi-map img.leaflet-tile').count()
  const loadedTiles = await page.locator('.mi-map img.leaflet-tile-loaded').count()
  await page.screenshot({ path: `${EV}/EXT_外网出图.png` })

  console.log('瓦片总数:', tiles, ' 已加载:', loadedTiles)
  console.log('地图错误:', mapErrors.length ? mapErrors.join(' | ') : '无')
  // 出图判据：加载出高德瓦片
  expect(tiles).toBeGreaterThan(0)
  expect(loadedTiles).toBeGreaterThan(0)
})
