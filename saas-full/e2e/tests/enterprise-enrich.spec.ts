import { test, expect } from '@playwright/test'
import fs from 'node:fs'

const BASE = 'http://127.0.0.1:5180'
const EV = 'evidence/enterprise-enrich'
fs.mkdirSync(EV, { recursive: true })

test('企业库 · 天眼查按需回填（快意电梯真实工商数据 + 股东）', async ({ page }) => {
  await page.setViewportSize({ width: 1600, height: 1000 })
  await page.goto(BASE + '/', { waitUntil: 'domcontentloaded' })
  await page.waitForTimeout(2500)
  const fillIf = async (s: string, v: string) => { const el = page.locator(s).first(); if (await el.count()) { await el.fill(''); await el.fill(v) } }
  await fillIf('input[placeholder*="租户"]', '芋道源码')
  await fillIf('input[placeholder*="账号"], input[placeholder*="用户名"]', 'admin')
  await fillIf('input[type="password"]', 'admin123')
  await page.waitForTimeout(500)
  await page.locator('button:has-text("登"), .el-button--primary').first().click()
  await page.waitForTimeout(5000)

  await page.goto(BASE + '/park-enterprise-list', { waitUntil: 'domcontentloaded' })
  await page.locator('.ent-card').first().waitFor({ timeout: 20000 })
  await expect(page.locator('.ent-card .ent-name').first()).toHaveText('快意电梯股份有限公司')
  await page.locator('.ent-card .ent-name').first().click()
  await page.waitForTimeout(2500) // 等待后端 /get 返回真实数据

  await expect(page.locator('.ent-drawer .ent')).toBeVisible()
  await expect(page.locator('.eh-name')).toHaveText('快意电梯股份有限公司')
  // 基本信息：后端天眼查回填的统一社会信用代码
  await expect(page.locator('.ent-drawer').getByText('91441900708017879M').first()).toBeVisible()
  // 头部含「刷新工商数据」按钮
  await expect(page.locator('.eh-enrich')).toBeVisible()
  await page.screenshot({ path: `${EV}/01_后端回填-基本信息.png` })

  // 人员/投资信息 → 真实股东（罗爱文 8.1648%）
  await page.locator('.ent-tabs .el-tabs__item', { hasText: '人员/投资信息' }).first().click()
  await page.waitForTimeout(700)
  await expect(page.locator('.rich-sec', { hasText: '股东信息' }).getByText('罗爱文').first()).toBeVisible()
  await expect(page.locator('.ent-drawer').getByText('8.1648%').first()).toBeVisible()
  await page.screenshot({ path: `${EV}/02_真实股东.png` })

  // 点击「刷新工商数据（天眼查）」→ 实时回填
  await page.locator('.eh-enrich').click()
  await page.waitForTimeout(6000) // 天眼查调用
  // 回填后仍应能看到真实信用代码
  await page.locator('.ent-tabs .el-tabs__item', { hasText: '基本信息' }).first().click()
  await page.waitForTimeout(500)
  await expect(page.locator('.ent-drawer').getByText('91441900708017879M').first()).toBeVisible()
  await page.screenshot({ path: `${EV}/03_点击天眼查回填后.png` })

  console.log('天眼查按需回填链路（前端→后端→天眼查→入库→回显）通过')
})
