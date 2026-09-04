import { test, expect } from '@playwright/test'
import fs from 'node:fs'

// 验收：真实企业库（137 家深圳企业，已清除假数据）+ 点击企业名实时调 DaaS 工商信息
// 链路：浏览器点企业名 → 抽屉按统一社会信用代码调 /liqi/daas/enterprise/base-info → DaasClient 签名 → daas.liqicloud.com
const BASE = 'http://127.0.0.1:5180'
const EV = 'evidence/enterprise-daas'
fs.mkdirSync(EV, { recursive: true })

test('真实企业库 · 点击企业名实时调 DaaS 工商信息', async ({ page }) => {
  test.setTimeout(120000)

  // ===== 1. 登录后台 =====
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
  await page.waitForTimeout(2000)

  // ===== 2. 企业列表页（真实 137 家深圳企业）=====
  await page.goto(BASE + '/park-enterprise-list', { waitUntil: 'domcontentloaded' })
  await page.waitForSelector('.ent-card', { timeout: 20000 })
  await page.waitForTimeout(1500)
  const firstName = await page.locator('.ent-name').first().innerText()
  console.log('[企业库] 列表第一家:', firstName)
  await page.screenshot({ path: `${EV}/01_真实企业列表.png`, fullPage: false })
  // 断言：已是真实企业（旧假示例「快意电梯」已移除）
  expect(firstName).not.toContain('快意电梯')

  // ===== 3. 点击第一个企业名 → 抽屉自动调 DaaS =====
  const daasRespPromise = page
    .waitForResponse(r => r.url().includes('/liqi/daas/enterprise/base-info'), { timeout: 25000 })
    .catch(() => null)
  await page.locator('.ent-name').first().click()

  // 抽屉 + DaaS 区块出现
  await page.waitForSelector('.ent-drawer .daas-box', { timeout: 15000 })
  // DaaS 查询完成：查到(.daas-grid) 或 平台未覆盖(.daas-empty)
  await page.waitForSelector('.daas-grid, .daas-empty', { timeout: 25000 })
  await page.waitForTimeout(1000)

  const daasResp = await daasRespPromise
  console.log('[DaaS] base-info 请求 HTTP 状态:', daasResp ? daasResp.status() : '未捕获')
  if (daasResp) {
    const json: any = await daasResp.json().catch(() => null)
    console.log('[DaaS] 响应 code:', json?.code, '| data:', json?.data ? '有工商数据' : 'null(平台未覆盖)')
  }

  await page.screenshot({ path: `${EV}/02_点击企业名调DaaS工商信息.png`, fullPage: true })

  // 断言：抽屉打开、DaaS 实时查询区块可见、请求确实发出
  await expect(page.locator('.ent-drawer')).toBeVisible()
  await expect(page.locator('.daas-box')).toBeVisible()
  expect(daasResp, '点击企业名应触发 DaaS base-info 请求').not.toBeNull()
})
