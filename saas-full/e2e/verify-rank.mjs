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
  // 榜单招商页
  await p.goto(URL + '/investment/rankingList', { waitUntil: 'domcontentloaded' })
  await p.waitForTimeout(4000)
  const cnt = await p.locator('.rk-card').count()
  console.log('榜单卡片数:', cnt)
  await p.screenshot({ path: `${EV}/rank_目录页.png` })
  if (cnt > 0) {
    await p.locator('.rk-card').first().click({ force: true })
    await p.waitForTimeout(3000)
    console.log('点击后 url:', p.url())
    await p.screenshot({ path: `${EV}/rank_点击跳转企业列表.png` })
  }
} catch (e) {
  console.log('ERR:', e.message)
} finally {
  await b.close()
}
