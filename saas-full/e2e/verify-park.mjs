import { chromium } from '@playwright/test'

const URL = 'http://127.0.0.1:5180'
const EV = '/home/fangnan/PycharmProjects/u667a-u8fdc-u529b-u4f01-saas/e2e/evidence/liqi'
const b = await chromium.launch({ args: ['--no-sandbox', '--disable-dev-shm-usage'] })
const p = await b.newPage({ viewport: { width: 1600, height: 900 } })
try {
  await p.goto(URL + '/', { waitUntil: 'domcontentloaded', timeout: 60000 })
  await p.waitForTimeout(3000)
  const fillIf = async (sel, val) => { const el = p.locator(sel).first(); if (await el.count()) { await el.fill(''); await el.fill(val) } }
  await fillIf('input[placeholder*="租户"]', '芋道源码')
  await fillIf('input[placeholder*="账号"], input[placeholder*="用户名"]', 'admin')
  await fillIf('input[type="password"]', 'admin123')
  await p.waitForTimeout(500)
  await p.locator('button:has-text("登"), .el-button--primary').first().click()
  await p.waitForTimeout(6000)
  // 会员管理页
  await p.goto(URL + '/enterpriseManage/memberMgSys', { waitUntil: 'domcontentloaded' })
  await p.waitForTimeout(4000)
  await p.screenshot({ path: `${EV}/park_01_会员全部.png` })
  console.log('会员页已打开')
  // 选园区：深圳湾科技园
  await p.locator('.el-form-item:has-text("关联园区") .el-select').first().click()
  await p.waitForTimeout(1000)
  await p.locator('.el-select-dropdown__item:has-text("深圳湾科技园")').first().click()
  await p.waitForTimeout(3000)
  await p.screenshot({ path: `${EV}/park_02_筛选深圳湾科技园.png` })
  console.log('已选园区并截图')
} catch (e) {
  console.log('ERR:', e.message)
} finally {
  await b.close()
}
