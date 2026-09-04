import { test, expect } from '@playwright/test'
import fs from 'node:fs'

const BASE = process.env.E2E_BASE || 'http://192.168.8.43:5180'
const EV = 'evidence/park-filter-fix'
fs.mkdirSync(EV, { recursive: true })
test.setTimeout(120000)

// 验证「关联园区」筛选修复：选中「深圳湾生态园」应能筛出企业（修复前 address_keyword=科技园 → 0 行）
test('关联园区筛选 · 深圳湾生态园可正常筛出企业', async ({ page }) => {
  await page.setViewportSize({ width: 1600, height: 1000 })

  // 登录
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

  // 进入「园区客户管理」
  const parent = page.locator('.el-menu :text-is("企业管理")').first()
  if (await parent.count()) { await parent.click(); await page.waitForTimeout(800) }
  await page.locator(':text-is("园区客户管理")').first().click()
  await page.waitForTimeout(2500)
  await expect(page.locator('.el-table').first()).toBeVisible({ timeout: 15000 })
  await page.screenshot({ path: `${EV}/01_进入园区客户管理.png`, fullPage: true })

  // 打开「关联园区」下拉，确认有「深圳湾生态园」选项
  const parkSelect = page.locator('.el-form-item:has-text("关联园区") .el-select').first()
  await parkSelect.click()
  await page.waitForTimeout(800)
  const opt = page.getByRole('option', { name: '深圳湾生态园', exact: true }).first()
  await expect(opt).toBeVisible({ timeout: 5000 })
  await page.screenshot({ path: `${EV}/02_关联园区下拉-深圳湾生态园.png`, fullPage: true })
  await opt.click()
  await page.waitForTimeout(500)

  // 点查询
  await page.locator('.el-form button:has-text("搜索"), .el-form button:has-text("查询"), button.el-button--primary:has-text("搜")').first().click()
  await page.waitForTimeout(2500)

  // 断言：筛出企业行数 > 0（修复前为 0）
  const dataRows = await page.locator('.el-table__body tr').count()
  const emptyBlock = await page.locator('.el-table__empty-text:visible, :text("暂无数据")').count()
  console.log(`关联园区=深圳湾生态园 筛选结果行数：${dataRows}，空态块：${emptyBlock}`)
  expect(dataRows).toBeGreaterThan(0)
  expect(emptyBlock).toBe(0)
  // 结果里注册地址应含「深圳湾生态园」
  await expect(page.locator('.el-table__body').getByText('深圳湾生态园').first()).toBeVisible({ timeout: 8000 })
  await page.screenshot({ path: `${EV}/03_筛选生效-筛出企业.png`, fullPage: true })

  // 分页总数（若有）
  const totalTxt = await page.locator('.el-pagination__total, .el-pagination :text("共")').first().innerText().catch(() => '')
  console.log('分页总数文案：' + totalTxt)
})
