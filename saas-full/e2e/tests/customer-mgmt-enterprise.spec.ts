import { test, expect } from '@playwright/test'
import fs from 'node:fs'

// 验收：园区客户管理 实时调取企业库表 liqi_enterprise（137 家真实企业）+ 点击企业名调 DaaS 工商详情
const BASE = 'http://127.0.0.1:5180'
const EV = 'evidence/customer-mgmt-enterprise'
fs.mkdirSync(EV, { recursive: true })

test('园区客户管理 · 实时读企业库表 + 点击企业名调 DaaS', async ({ page }) => {
  test.setTimeout(120000)

  // 1. 登录
  await page.goto(BASE + '/login', { waitUntil: 'domcontentloaded' })
  const fillIf = async (sel: string, val: string) => {
    const el = page.locator(sel).first()
    if (await el.count()) { await el.fill(''); await el.fill(val) }
  }
  await fillIf('input[placeholder*="租户"]', '芋道源码')
  await fillIf('input[placeholder*="账号"], input[placeholder*="用户名"]', 'admin')
  await fillIf('input[type="password"]', 'admin123')
  await page.locator('button:has-text("登"), .el-button--primary').first().click()
  await page.waitForURL(u => !u.toString().includes('/login'), { timeout: 25000 })
  await page.waitForTimeout(3000)

  // 2. 侧边栏：企业管理 → 园区客户管理
  const parent = page.locator('.el-menu :text-is("企业管理")').first()
  if (await parent.count()) { await parent.click(); await page.waitForTimeout(1000) }
  await page.locator(':text-is("园区客户管理")').first().click()
  await page.waitForTimeout(2500)
  await expect(page.locator('.el-table').first()).toBeVisible({ timeout: 15000 })
  await page.waitForTimeout(1500)

  // 3. 断言：企业库真实字段列存在
  await expect(page.locator('.el-table__header :text("统一社会信用代码")').first()).toBeVisible()
  await expect(page.locator('.el-table__header :text("经营状态")').first()).toBeVisible()
  await expect(page.locator('.el-table__header :text("注册资本")').first()).toBeVisible()
  await expect(page.locator('.el-table__header :text("参保人数")').first()).toBeVisible()
  // 旧的假派生列已移除
  expect(await page.locator('.el-table__header :text("获取补贴金额")').count()).toBe(0)
  expect(await page.locator('.el-table__header :text("已申报项目")').count()).toBe(0)
  // 表格含真实企业
  await expect(page.locator('.el-table__body').getByText('三三医社').first()).toBeVisible()
  await page.screenshot({ path: `${EV}/01_园区客户管理-企业库实时数据.png`, fullPage: true })

  // 4. 点击第一个企业名 → 抽屉实时调 DaaS 工商详情
  const daasResp = page
    .waitForResponse(r => r.url().includes('/liqi/daas/enterprise/base-info'), { timeout: 25000 })
    .catch(() => null)
  await page.locator('.el-table__body .el-link').first().click()
  await page.waitForSelector('.ent-drawer .daas-box', { timeout: 15000 })
  await page.waitForSelector('.daas-grid, .daas-empty', { timeout: 25000 })
  await page.waitForTimeout(1000)
  const resp = await daasResp
  console.log('[DaaS] base-info HTTP:', resp ? resp.status() : '未捕获')
  await page.screenshot({ path: `${EV}/02_点击企业调DaaS工商详情.png`, fullPage: true })

  await expect(page.locator('.ent-drawer')).toBeVisible()
  await expect(page.locator('.daas-box')).toBeVisible()
  expect(resp, '点击企业名应触发 DaaS 请求').not.toBeNull()
})
