import { chromium } from '@playwright/test'

const URL = 'http://120.79.142.141:8000'
const b = await chromium.launch({ args: ['--no-sandbox', '--disable-dev-shm-usage'] })
const p = await b.newPage({ viewport: { width: 1600, height: 900 } })
try {
  await p.goto(URL + '/', { waitUntil: 'load', timeout: 90000 })
  await p.waitForTimeout(6000)
  await p.screenshot({ path: '/home/fangnan/PycharmProjects/u667a-u8fdc-u529b-u4f01-saas/e2e/evidence/liqi/00_卫星入口-登录页.png' })
  console.log('登录页 title:', await p.title())
  // 登录
  const fillIf = async (sel, val) => { const el = p.locator(sel).first(); if (await el.count()) { await el.fill(''); await el.fill(val) } }
  await fillIf('input[placeholder*="租户"]', '芋道源码')
  await fillIf('input[placeholder*="账号"], input[placeholder*="用户名"]', 'admin')
  await fillIf('input[type="password"]', 'admin123')
  await p.waitForTimeout(500)
  await p.locator('button:has-text("登"), .el-button--primary').first().click()
  await p.waitForTimeout(14000)
  await p.screenshot({ path: '/home/fangnan/PycharmProjects/u667a-u8fdc-u529b-u4f01-saas/e2e/evidence/liqi/00_卫星入口-登录后.png' })
  console.log('登录后 url:', p.url())
} catch (e) {
  console.log('ERR:', e.message)
} finally {
  await b.close()
}
