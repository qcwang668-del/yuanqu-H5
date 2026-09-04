import { test, expect } from '@playwright/test'
import fs from 'node:fs'

// 迁移验收：直接打公网入口（socat:8000 → nginx:5180 → 后端:48080 → liqi-mysql:3316）
const BASE = 'http://120.79.142.141:8000'
const EV = 'evidence/migration'
fs.mkdirSync(EV, { recursive: true })

const ROUTES: [string, string][] = [
  ['03_平台管理-用户管理', '/platformManage/clientUser'],
  ['04_平台管理-预留信息管理', '/platformManage/reserveInfo'],
  ['05_平台管理-匹配线索管理', '/platformManage/matchClues'],
  ['06_平台管理-评分线索管理', '/platformManage/scoringClues'],
  ['07_企业管理-会员管理系统', '/enterpriseManage/memberMgSys'],
  ['08_企业管理-会员线索管理', '/enterpriseManage/memberCluesMg'],
  ['09_企业管理-企业获批动态', '/enterpriseManage/approvalDynamics'],
  ['10_我的导入导出', '/importExportRoot/index'],
  ['11_系统管理-网站配置', '/system/website']
]

test('迁移验收 · 公网入口登录 + 9 模块页面', async ({ page }) => {
  test.setTimeout(240000)
  await page.goto(BASE + '/', { waitUntil: 'domcontentloaded' })
  await page.waitForTimeout(3000)
  await page.screenshot({ path: `${EV}/01_登录页.png` })

  const fillIf = async (sel: string, val: string) => {
    const el = page.locator(sel).first()
    if (await el.count()) { await el.fill(''); await el.fill(val) }
  }
  await fillIf('input[placeholder*="租户"]', '芋道源码')
  await fillIf('input[placeholder*="账号"], input[placeholder*="用户名"]', 'admin')
  await fillIf('input[type="password"]', 'admin123')
  await page.waitForTimeout(500)
  const loginBtn = page.locator('button:has-text("登"), .el-button--primary').first()
  await loginBtn.click()
  // 等登录真正完成：URL 离开 /login + 网络空闲 + 首页渲染
  await page.waitForURL(u => !u.toString().includes('/login'), { timeout: 25000 }).catch(() => {})
  await page.waitForTimeout(5000)
  await page.screenshot({ path: `${EV}/02_登录后首页.png`, fullPage: false })

  for (const [name, route] of ROUTES) {
    await page.goto(BASE + route, { waitUntil: 'domcontentloaded' }).catch(() => {})
    await page.waitForTimeout(3000)
    await page.screenshot({ path: `${EV}/${name}.png`, fullPage: false })
  }

  expect(page.url()).not.toContain('/login')
})
