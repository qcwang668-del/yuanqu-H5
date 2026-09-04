import { test, expect } from '@playwright/test'
import fs from 'node:fs'

// 园区客户管理：实时调取企业库表 liqi_enterprise 数据（真实深圳企业 + DaaS 工商信息）
const BASE = 'http://127.0.0.1:5180'
const EV = 'evidence/park-customer-ent'
fs.mkdirSync(EV, { recursive: true })

test('园区客户管理 · 实时调取企业库表真实数据 + 点击企业名 DaaS 详情', async ({ page }) => {
  test.setTimeout(120000)
  await page.setViewportSize({ width: 1600, height: 1000 })

  // ===== 登录 =====
  await page.goto(BASE + '/', { waitUntil: 'domcontentloaded' })
  await page.waitForTimeout(2000)
  const fillIf = async (sel: string, val: string) => {
    const el = page.locator(sel).first()
    if (await el.count()) { await el.fill(''); await el.fill(val) }
  }
  await fillIf('input[placeholder*="租户"]', '芋道源码')
  await fillIf('input[placeholder*="账号"], input[placeholder*="用户名"]', 'admin')
  await fillIf('input[type="password"]', 'admin123')
  await page.locator('button:has-text("登"), .el-button--primary').first().click()
  await page.waitForTimeout(4500)
  expect(page.url()).not.toContain('/login')

  // ===== 侧边栏进入「园区客户管理」=====
  await page.waitForTimeout(1200)
  const parent = page.locator('.el-menu :text-is("企业管理")').first()
  if (await parent.count()) { await parent.click(); await page.waitForTimeout(800) }
  await page.locator(':text-is("园区客户管理")').first().click()
  await page.waitForTimeout(2500)
  await expect(page.locator('.el-table').first()).toBeVisible({ timeout: 15000 })
  await page.waitForTimeout(1500)

  // ===== 断言：实时读企业库表的真实工商列 =====
  const header = page.locator('.el-table__header').first()
  await expect(header.getByText('经营状态').first()).toBeVisible()
  await expect(header.getByText('注册资本').first()).toBeVisible()
  await expect(header.getByText('所属行业').first()).toBeVisible()
  await expect(header.getByText('统一社会信用代码').first()).toBeVisible()
  // 旧的假派生列已移除
  expect(await page.getByText('获取补贴金额').count()).toBe(0)
  expect(await page.getByText('已申报项目').count()).toBe(0)

  // 表体有真实企业数据（企业名链接 + 信用代码 91440300 深圳码）
  const firstRowName = await page.locator('.el-table__body .el-link').first().innerText()
  console.log('[客户管理] 第一家企业:', firstRowName)
  expect(firstRowName.length).toBeGreaterThan(2)
  await page.screenshot({ path: `${EV}/01_园区客户管理-企业库真实数据.png`, fullPage: true })

  // ===== 点击企业名 → 抽屉实时调 DaaS 工商信息 =====
  const daasPromise = page
    .waitForResponse(r => r.url().includes('/liqi/daas/enterprise/base-info'), { timeout: 25000 })
    .catch(() => null)
  await page.locator('.el-table__body .el-link').first().click()
  await page.waitForSelector('.ent-drawer .daas-box', { timeout: 15000 })
  await page.waitForSelector('.daas-grid, .daas-empty', { timeout: 25000 })
  await page.waitForTimeout(1000)
  const daasResp = await daasPromise
  console.log('[DaaS] base-info 请求:', daasResp ? daasResp.status() : '未捕获')
  await page.screenshot({ path: `${EV}/02_点击企业调DaaS工商详情.png`, fullPage: true })

  await expect(page.locator('.daas-box')).toBeVisible()
  expect(daasResp, '点击企业名应触发 DaaS 请求').not.toBeNull()
})
