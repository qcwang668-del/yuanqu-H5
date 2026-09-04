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

  // 企业列表页（后端 1000 条分页）
  await p.goto(URL + '/park-enterprise-list', { waitUntil: 'domcontentloaded' })
  await p.waitForTimeout(3500)
  console.log('企业列表卡片数:', await p.locator('.ent-card').count())
  await p.screenshot({ path: `${EV}/entlist_企业列表.png` })

  // 大屏（看板改名深圳湾生态园）
  await p.goto(URL + '/park-screen', { waitUntil: 'domcontentloaded' })
  await p.waitForTimeout(7000)
  await p.screenshot({ path: `${EV}/screen_深圳湾生态园.png` })
  console.log('大屏 done')
} catch (e) {
  console.log('ERR:', e.message)
} finally {
  await b.close()
}
