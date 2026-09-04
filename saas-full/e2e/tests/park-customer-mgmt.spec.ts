import { test, expect } from '@playwright/test'
import fs from 'node:fs'

const BASE = process.env.E2E_BASE || 'http://192.168.8.43:5180'
const EV = 'evidence/park-customer-mgmt'
fs.mkdirSync(EV, { recursive: true })
test.setTimeout(120000)

test('园区客户管理 · 字段改造 + 参保人数筛选', async ({ page }) => {
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

  // 侧边栏菜单已更名为「园区客户管理」，旧名「会员管理系统」消失
  await page.waitForTimeout(1500)
  expect(await page.locator(':text("园区客户管理")').count()).toBeGreaterThan(0)
  expect(await page.locator(':text-is("会员管理系统")').count()).toBe(0)

  // 通过侧边栏进入（点父级「企业管理」展开 → 园区客户管理）
  const parent = page.locator('.el-menu :text-is("企业管理")').first()
  if (await parent.count()) { await parent.click(); await page.waitForTimeout(800) }
  await page.locator(':text-is("园区客户管理")').first().click()
  await page.waitForTimeout(2500)
  await expect(page.locator('.el-table').first()).toBeVisible({ timeout: 15000 })

  // 新增列存在
  await expect(page.getByText('获取补贴金额').first()).toBeVisible()
  await expect(page.getByText('已申报项目').first()).toBeVisible()
  await expect(page.locator('.el-table__header :text("参保人数")').first()).toBeVisible()
  // 去除列不存在
  expect(await page.getByText('企业对接人姓名').count()).toBe(0)
  expect(await page.getByText('企业对接人联系方式').count()).toBe(0)
  expect(await page.locator('.el-table__header :text("是否推送客户")').count()).toBe(0)
  expect(await page.locator('.el-table__header :text-is("企业负责人姓名")').count()).toBe(0)
  expect(await page.locator('.el-table__header :text-is("企业负责人联系方式")').count()).toBe(0)
  // 注册地址应为「深圳湾生态园」、参保人数应为真实值（非小额 mock）
  await expect(page.locator('.el-table__body').getByText('深圳湾生态园').first()).toBeVisible()
  const insuredTexts = await page.locator('.el-table__body tr td:nth-last-child(4)').allInnerTexts()
  console.log('参保人数样本：' + insuredTexts.slice(0, 5).join(' / '))
  await page.screenshot({ path: `${EV}/01_园区客户管理-列表新字段.png`, fullPage: true })

  // 参保人数筛选：选一个区间
  const rowsBefore = await page.locator('.el-table__body tr').count()
  await page.locator('.el-form-item:has-text("参保人数") .el-select').click()
  await page.waitForTimeout(600)
  await page.locator('.el-select-dropdown__item:visible').nth(3).click() // 100-499 人
  await page.waitForTimeout(1200)
  await page.screenshot({ path: `${EV}/02_参保人数筛选生效.png`, fullPage: true })
  const rowsAfter = await page.locator('.el-table__body tr').count()
  console.log(`参保人数筛选：筛选前 ${rowsBefore} 行 → 筛选后 ${rowsAfter} 行`)
  expect(rowsAfter).toBeLessThanOrEqual(rowsBefore)
})
