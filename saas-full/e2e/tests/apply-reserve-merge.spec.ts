import { test, expect, type Page } from '@playwright/test'
import fs from 'fs'

// 验收：H5「政策申报」改道写入「预留信息」+ 后台「申报线索」模块下线
// 链路：nginx:5180 → 后端:48080；H5 /app-api/liqi/apply/create → liqi_reserve_info；后台 /admin-api/liqi/reserve-info/page
const BASE = process.env.E2E_BASE || 'http://127.0.0.1:5180'
const DIR = 'apply-reserve-merge'

async function adminToken(page: Page): Promise<string> {
  const r = await page.request.post(BASE + '/admin-api/system/auth/login', {
    headers: { 'tenant-id': '1', 'Content-Type': 'application/json' },
    data: { username: 'admin', password: 'admin123', captchaVerification: '' }
  })
  const j = await r.json()
  return j?.data?.accessToken as string
}

async function adminLogin(page: Page) {
  await page.goto(BASE + '/login', { waitUntil: 'domcontentloaded' })
  await page.waitForTimeout(800)
  await page.locator('input[placeholder*="账号"], input[placeholder*="用户名"]').first().fill('admin')
  await page.locator('input[type="password"]').first().fill('admin123')
  await page.getByRole('button', { name: /登\s*录/ }).first().click()
  await page.waitForURL((u) => !u.toString().includes('/login'), { timeout: 25000 })
}

test('H5申报改道预留信息 + 申报线索模块下线', async ({ page }) => {
  test.setTimeout(180000)
  fs.mkdirSync(`evidence/${DIR}`, { recursive: true })

  // ---------- API 层 ----------
  const token = await adminToken(page)
  expect(token, 'admin 登录应拿到 token').toBeTruthy()
  const h = { headers: { Authorization: 'Bearer ' + token, 'tenant-id': '1' } }

  // 1) 预留信息接口能查到 H5 提交的申报（拉通闭环）
  const rv = await page.request.get(BASE + '/admin-api/liqi/reserve-info/page?pageNo=1&pageSize=20', h)
  const rvj = await rv.json()
  expect(rvj.code).toBe(0)
  const hit = (rvj.data?.list || []).find((x: any) => String(x.company || '').includes('测试改道'))
  expect(hit, '预留信息列表应包含 H5 提交的测试申报').toBeTruthy()
  expect(hit.source).toBe(1)      // 来源：小程序/H5
  expect(hit.reserveType).toBe(1) // 入口：项目详情
  expect(hit.reserveWay).toBe(1)  // 方式：我要申报
  expect(String(hit.content || '')).toContain('高新技术企业认定')

  // 2) 申报线索接口已下线（Controller 已删 → 404 / 业务码非 0）
  const ac = await page.request.get(BASE + '/admin-api/liqi/apply-clue/page?pageNo=1&pageSize=10', h)
  const acj = await ac.json().catch(() => null)
  expect(ac.status() === 404 || (acj && acj.code !== 0), '申报线索接口应已下线').toBeTruthy()

  // ---------- UI 层 ----------
  await adminLogin(page)
  await page.waitForTimeout(1500)

  // 展开「惠企运营」目录，断言菜单中不再有「申报线索」
  const hy = page.getByText('惠企运营').first()
  if (await hy.count()) { await hy.click().catch(() => {}); await page.waitForTimeout(700) }
  await page.screenshot({ path: `evidence/${DIR}/01-菜单-惠企运营(无申报线索).png` })
  expect(await page.getByText('申报线索', { exact: true }).count()).toBe(0)

  // 进入「平台管理 → 预留信息管理」，应能看到 H5 申报数据
  const pt = page.getByText('平台管理').first()
  if (await pt.count()) { await pt.click().catch(() => {}); await page.waitForTimeout(700) }
  await page.getByText('预留信息管理', { exact: true }).first().click()
  await page.waitForTimeout(2200)
  await expect(page.getByText('测试改道企业').first()).toBeVisible({ timeout: 15000 })
  await page.screenshot({ path: `evidence/${DIR}/02-预留信息管理(含H5申报).png`, fullPage: true })

  // H5 政策申报表单页正常渲染
  await page.goto(BASE + '/h5/#/apply?policyId=P1&title=' + encodeURIComponent('E2E截图-专精特新申报') + '&type=project',
    { waitUntil: 'networkidle' })
  await page.waitForTimeout(1200)
  await expect(page.getByText('提交申报').first()).toBeVisible({ timeout: 10000 })
  await page.screenshot({ path: `evidence/${DIR}/03-H5政策申报表单.png`, fullPage: true })
})
