import { test, expect } from '@playwright/test'
import fs from 'node:fs'

const BASE = process.env.E2E_BASE || 'http://192.168.8.43:5180'
const EV = 'evidence/enterprise-enrich-tyc'
fs.mkdirSync(EV, { recursive: true })
test.setTimeout(150000)

test('企业详情 · 点击刷新工商数据 → 天眼查真实回写', async ({ page }) => {
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

  // 进入园区企业列表（快意电梯 真实企业 置顶）
  await page.goto(BASE + '/park-enterprise-list?name=快意', { waitUntil: 'domcontentloaded' })
  await page.waitForTimeout(2500)
  await expect(page.locator('.ent-card').first()).toBeVisible({ timeout: 15000 })
  // 首条应为快意电梯
  await expect(page.locator('.ent-card').first().getByText('快意电梯股份有限公司')).toBeVisible()

  // 点企业名称 → 详情抽屉
  await page.locator('.ent-card').first().locator('.ent-name').click()
  await page.waitForTimeout(2000)
  await expect(page.locator('.ent-drawer .eh-name').last()).toBeVisible({ timeout: 8000 })
  await page.screenshot({ path: `${EV}/01_详情-回填前.png`, fullPage: true })

  // 点「刷新工商数据（天眼查）」→ 实时调天眼查回写
  const drawer = page.locator('.ent-drawer').last()
  await drawer.locator('.eh-enrich').click()
  // 等待回填完成（按钮 loading 结束 / 出现成功提示）
  await page.waitForTimeout(1500)
  await expect(page.locator('.el-message').first()).toBeVisible({ timeout: 20000 }).catch(() => {})
  await page.waitForFunction(() => {
    const btn = document.querySelector('.ent-drawer .eh-enrich') as HTMLElement
    return btn && !btn.className.includes('is-loading')
  }, { timeout: 30000 }).catch(() => {})
  await page.waitForTimeout(1500)

  // 校验：详情摘要出现真实工商信息（法人 罗爱文 / 统一社会信用代码）
  await expect(drawer.getByText('罗爱文').first()).toBeVisible({ timeout: 8000 })
  await expect(drawer.getByText('91441900708017879M').first()).toBeVisible()
  await page.screenshot({ path: `${EV}/02_详情-天眼查回填后.png`, fullPage: true })

  console.log('天眼查回写验证通过：法人罗爱文 + 统一社会信用代码 91441900708017879M')
})
