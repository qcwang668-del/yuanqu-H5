import { test, expect } from '@playwright/test'
import fs from 'node:fs'

const BASE = process.env.E2E_BASE || 'http://192.168.8.43:5180'
const EV = 'evidence/enterprise-detail'
fs.mkdirSync(EV, { recursive: true })
test.setTimeout(150000)

async function login(page: any) {
  await page.goto(BASE + '/', { waitUntil: 'domcontentloaded' })
  await page.waitForTimeout(2500)
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
}

test('企业详情 · 地图招商「详情」列 + 园区客户管理名称点击', async ({ page }) => {
  await page.setViewportSize({ width: 1600, height: 1000 })
  await login(page)

  // ---------- 地图招商：企业名称后「详情」列 → 企业详情抽屉 ----------
  await page.goto(BASE + '/investment/mapInvest', { waitUntil: 'domcontentloaded' })
  await page.waitForTimeout(3000)
  await expect(page.locator('.mi-side .el-table').first()).toBeVisible({ timeout: 15000 })
  // 表头应含「详情」列
  await expect(page.locator('.mi-side .el-table__header :text-is("详情")').first()).toBeVisible()
  await page.locator('.mi-side .el-table__body button:has-text("详情")').first().click()
  await page.waitForTimeout(1500)
  await expect(page.locator('.ent-drawer .eh-name').first()).toBeVisible({ timeout: 8000 })
  await page.screenshot({ path: `${EV}/01_地图招商-详情列-企业详情抽屉.png`, fullPage: true })
  // 关闭抽屉
  await page.keyboard.press('Escape')
  await page.waitForTimeout(800)

  // ---------- 园区客户管理：企业名称可点 → 企业详情抽屉（含真实参保人数） ----------
  const parent = page.locator('.el-menu :text-is("企业管理")').first()
  if (await parent.count()) { await parent.click(); await page.waitForTimeout(800) }
  await page.locator(':text-is("园区客户管理")').first().click()
  await page.waitForTimeout(2500)
  await expect(page.locator('.el-table').first()).toBeVisible({ timeout: 15000 })
  await page.locator('.el-table__body .el-link').first().click()
  await page.waitForTimeout(1500)
  await expect(page.locator('.ent-drawer .eh-name').last()).toBeVisible({ timeout: 8000 })
  // 详情里应能看到「参保人数」字段
  await expect(page.locator('.ent-drawer').last().getByText('参保人数').first()).toBeVisible()
  await page.screenshot({ path: `${EV}/02_园区客户管理-名称点击-企业详情.png`, fullPage: true })

  // ---------- 项目申报 tab（按参考稿：概况图表 + 项目列表 + 备注 + 更新时间） ----------
  const drawer = page.locator('.ent-drawer').last()
  await drawer.locator('.ent-tabs :text-is("项目申报")').first().click()
  await page.waitForTimeout(1500)
  await expect(drawer.getByText('本司已申报项目概况').first()).toBeVisible()
  await expect(drawer.locator('.proj-item').first()).toBeVisible()
  await expect(drawer.getByText('最近更新时间').first()).toBeVisible()
  await expect(drawer.locator('.pi-remark').first()).toBeVisible()
  await page.screenshot({ path: `${EV}/03_企业详情-项目申报页.png`, fullPage: true })

  console.log('企业详情抽屉：地图招商详情列 + 园区客户管理名称点击 + 项目申报页 均通过')
})
