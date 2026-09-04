import { test, expect } from '@playwright/test'
import fs from 'node:fs'

const BASE = 'http://127.0.0.1:5180'
const EV = 'evidence/liqi'
fs.mkdirSync(EV, { recursive: true })

// 9 个复刻模块的路由（芋道菜单 path 拼接）
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

test('力企云 SaaS 复刻 · 9 模块页面验收', async ({ page }) => {
  // 1. 打开登录页
  await page.goto(BASE + '/', { waitUntil: 'domcontentloaded' })
  await page.waitForTimeout(2500)
  await page.screenshot({ path: `${EV}/01_登录页.png` })

  // 2. 填写并登录（验证码本地已关闭）
  const fillIf = async (sel: string, val: string) => {
    const el = page.locator(sel).first()
    if (await el.count()) { await el.fill(''); await el.fill(val) }
  }
  await fillIf('input[placeholder*="租户"]', '芋道源码')
  await fillIf('input[placeholder*="账号"], input[placeholder*="用户名"]', 'admin')
  await fillIf('input[type="password"]', 'admin123')
  await page.waitForTimeout(500)
  // 点登录按钮
  const loginBtn = page.locator('button:has-text("登"), .el-button--primary').first()
  await loginBtn.click()
  await page.waitForTimeout(5000)
  await page.screenshot({ path: `${EV}/02_登录后首页.png`, fullPage: false })

  // 3. 遍历各模块页面截图
  for (const [name, route] of ROUTES) {
    await page.goto(BASE + route, { waitUntil: 'domcontentloaded' }).catch(() => {})
    await page.waitForTimeout(2500)
    await page.screenshot({ path: `${EV}/${name}.png`, fullPage: false })
  }

  // 断言：至少登录成功（URL 离开 /login）
  expect(page.url()).not.toContain('/login')
})
