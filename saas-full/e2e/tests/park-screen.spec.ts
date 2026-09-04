import { test, expect } from '@playwright/test'
import fs from 'node:fs'

const BASE = 'http://127.0.0.1:5180'
const EV = 'evidence/park-screen'
fs.mkdirSync(EV, { recursive: true })

test('园区可视化大屏 · 页面 + 菜单验收', async ({ page }) => {
  await page.setViewportSize({ width: 1600, height: 1000 })

  // 1) 登录（本地验证码已关）
  await page.goto(BASE + '/', { waitUntil: 'domcontentloaded' })
  await page.waitForTimeout(2500)
  await page.screenshot({ path: `${EV}/01_登录页.png` })

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

  // 2) 侧边栏应出现「园区可视化大屏」菜单
  const menuItem = page.locator('text=园区可视化大屏').first()
  await menuItem.waitFor({ timeout: 15000 })
  await page.screenshot({ path: `${EV}/02_侧边栏含大屏菜单.png` })

  // 3) 进入大屏页面
  await page.goto(BASE + '/park-screen', { waitUntil: 'domcontentloaded' })
  await page.waitForTimeout(3500) // 等数字/进度条/环形图动画
  // 断言核心结构
  await expect(page.locator('.pkscreen')).toBeVisible()
  await expect(page.getByText('智慧园区惠企政策服务总览')).toBeVisible()
  const vitalCount = await page.locator('.pkscreen .vital .v').count()
  expect(vitalCount).toBe(6)
  const rankRows = await page.locator('.pkscreen #dashRank .r').count()
  expect(rankRows).toBeGreaterThan(0)
  const badgeCount = await page.locator('.pkscreen #dashBadges .bg').count()
  expect(badgeCount).toBe(6)
  await page.screenshot({ path: `${EV}/03_大屏总览.png` })

  // 4) 切换榜单 tab：行业排行
  await page.locator('.pkscreen #rankTabs button:has-text("行业排行")').click()
  await page.waitForTimeout(1500)
  await page.screenshot({ path: `${EV}/04_榜单-行业排行.png` })

  // 5) 切换榜单 tab：资质新增
  await page.locator('.pkscreen #rankTabs button:has-text("资质新增")').click()
  await page.waitForTimeout(1500)
  await page.screenshot({ path: `${EV}/05_榜单-资质新增.png` })

  // 6) 播放收尾闭环（故事主角高亮 + toast）
  await page.locator('.pkscreen button:has-text("播放收尾闭环")').click()
  await page.waitForTimeout(2500)
  await page.screenshot({ path: `${EV}/06_播放收尾闭环.png` })

  // 7) 退出大屏返回后台
  await page.locator('.pkscreen .exit-btn').click()
  await page.waitForTimeout(2000)
  await page.screenshot({ path: `${EV}/07_退出大屏返回后台.png` })
})
