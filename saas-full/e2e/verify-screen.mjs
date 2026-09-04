import { chromium } from '@playwright/test'

const URL = 'http://127.0.0.1:5180'
const EV = '/home/fangnan/PycharmProjects/u667a-u8fdc-u529b-u4f01-saas/e2e/evidence/liqi'
const b = await chromium.launch({ args: ['--no-sandbox', '--disable-dev-shm-usage'] })
const p = await b.newPage({ viewport: { width: 1920, height: 1080 } })
try {
  // 登录
  await p.goto(URL + '/', { waitUntil: 'domcontentloaded', timeout: 60000 })
  await p.waitForTimeout(3000)
  const fillIf = async (sel, val) => { const el = p.locator(sel).first(); if (await el.count()) { await el.fill(''); await el.fill(val) } }
  await fillIf('input[placeholder*="租户"]', '芋道源码')
  await fillIf('input[placeholder*="账号"], input[placeholder*="用户名"]', 'admin')
  await fillIf('input[type="password"]', 'admin123')
  await p.waitForTimeout(500)
  await p.locator('button:has-text("登"), .el-button--primary').first().click()
  await p.waitForTimeout(6000)
  // 大屏 1920x1080
  await p.goto(URL + '/park-screen', { waitUntil: 'domcontentloaded' })
  await p.waitForTimeout(4000)
  await p.screenshot({ path: `${EV}/screen_1920x1080.png` })
  console.log('1920x1080 done')
  // 切换到 1366x768 测自适应
  await p.setViewportSize({ width: 1366, height: 768 })
  await p.waitForTimeout(2500)
  await p.screenshot({ path: `${EV}/screen_1366x768.png` })
  console.log('1366x768 done')
  // 再切 2560x1440 大屏
  await p.setViewportSize({ width: 2560, height: 1440 })
  await p.waitForTimeout(2500)
  await p.screenshot({ path: `${EV}/screen_2560x1440.png` })
  console.log('2560x1440 done')
} catch (e) {
  console.log('ERR:', e.message)
} finally {
  await b.close()
}
