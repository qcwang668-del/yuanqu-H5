import { test, expect } from '@playwright/test'
import fs from 'node:fs'

const BASE = 'http://127.0.0.1:5180'
const EV = 'evidence/logo-replace'
fs.mkdirSync(EV, { recursive: true })

test('系统 logo 替换 · 登录页 + 侧栏 logo', async ({ page }) => {
  await page.setViewportSize({ width: 1600, height: 1000 })

  // 1) 登录页 logo
  await page.goto(BASE + '/', { waitUntil: 'domcontentloaded' })
  await page.waitForTimeout(2500)
  await page.screenshot({ path: `${EV}/01_登录页logo.png` })
  // 登录页 logo <img> 应加载成功（naturalWidth>0）
  const loginImgOk = await page.evaluate(() => {
    const imgs = Array.from(document.querySelectorAll('img')) as HTMLImageElement[]
    return imgs.some((i) => i.src.includes('logo') && i.naturalWidth > 0)
  })
  expect(loginImgOk).toBeTruthy()

  // 2) 登录
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

  // 3) 侧栏 logo
  await page.waitForTimeout(1500)
  await page.screenshot({ path: `${EV}/02_侧栏logo.png` })
  const sideImgOk = await page.evaluate(() => {
    const imgs = Array.from(document.querySelectorAll('img')) as HTMLImageElement[]
    return imgs.some((i) => i.src.includes('logo') && i.naturalWidth > 0)
  })
  expect(sideImgOk).toBeTruthy()
  // 放大截取左上角 logo 区域
  await page.locator('.tab-logo, #logo, [class*="logo"]').first().screenshot({ path: `${EV}/03_logo特写.png` }).catch(() => {})
})
