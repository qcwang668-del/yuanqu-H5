import { test, expect } from '@playwright/test'
import fs from 'node:fs'

const BASE = 'http://127.0.0.1:5180'
const EV = 'evidence/enterprise-8tabs'
fs.mkdirSync(EV, { recursive: true })

test('企业详情 · 快意电梯 8 页签 1:1 复刻', async ({ page }) => {
  await page.setViewportSize({ width: 1600, height: 1000 })
  // 登录
  await page.goto(BASE + '/', { waitUntil: 'domcontentloaded' })
  await page.waitForTimeout(2500)
  const fillIf = async (s: string, v: string) => { const el = page.locator(s).first(); if (await el.count()) { await el.fill(''); await el.fill(v) } }
  await fillIf('input[placeholder*="租户"]', '芋道源码')
  await fillIf('input[placeholder*="账号"], input[placeholder*="用户名"]', 'admin')
  await fillIf('input[type="password"]', 'admin123')
  await page.waitForTimeout(500)
  await page.locator('button:has-text("登"), .el-button--primary').first().click()
  await page.waitForTimeout(5000)

  // 园区企业清单 → 置顶「快意电梯」
  await page.goto(BASE + '/park-enterprise-list', { waitUntil: 'domcontentloaded' })
  await page.locator('.ent-card').first().waitFor({ timeout: 20000 })
  await expect(page.locator('.ent-card .ent-name').first()).toHaveText('快意电梯股份有限公司')
  await page.locator('.ent-card .ent-name').first().click()
  await page.waitForTimeout(1200)
  await expect(page.locator('.ent-drawer .ent')).toBeVisible()
  await expect(page.locator('.eh-name')).toHaveText('快意电梯股份有限公司')

  const tabs = ['基本信息', '联系方式', '项目申报', '人员/投资信息', '知识产权信息', '经营信息', '经营风险', '企业发展']
  // 断言 8 个页签都存在
  for (const tn of tabs) {
    await expect(page.locator('.ent-tabs .el-tabs__item', { hasText: tn }).first()).toBeVisible()
  }
  // 逐个页签切换并截图
  let i = 0
  for (const tn of tabs) {
    i++
    await page.locator('.ent-tabs .el-tabs__item', { hasText: tn }).first().click()
    await page.waitForTimeout(tn === '项目申报' ? 1400 : 700)
    await page.screenshot({ path: `${EV}/${String(i).padStart(2, '0')}_${tn.replace(/[\/\s]/g, '')}.png` })
  }
  // 关键内容断言
  await page.locator('.ent-tabs .el-tabs__item', { hasText: '人员/投资信息' }).first().click()
  await page.waitForTimeout(600)
  await expect(page.locator('.rich-sec', { hasText: '股东信息' })).toBeVisible()
  await expect(page.locator('.ent-drawer').getByText('罗爱文').first()).toBeVisible()
  await page.locator('.ent-tabs .el-tabs__item', { hasText: '知识产权信息' }).first().click()
  await page.waitForTimeout(600)
  await expect(page.locator('.rs-stats').first()).toBeVisible()
  await page.locator('.ent-tabs .el-tabs__item', { hasText: '企业发展' }).first().click()
  await page.waitForTimeout(600)
  await expect(page.locator('.rs-tags .rs-tag').first()).toBeVisible()

  console.log('快意电梯 8 页签均渲染通过')
})
