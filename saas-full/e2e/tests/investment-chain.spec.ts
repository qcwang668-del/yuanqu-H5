import { test, expect } from '@playwright/test'
import fs from 'node:fs'

const BASE = 'http://127.0.0.1:5180'
const EV = 'evidence/investment-chain'
fs.mkdirSync(EV, { recursive: true })

test('智慧招商 · 产业链招商 · 先选产业(28产业链图谱)→注入默认条件→组合条件', async ({ page }) => {
  await page.setViewportSize({ width: 1600, height: 1000 })

  // 1) 登录
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

  // 2) 进入产业链招商
  const dir = page.locator('.el-menu :text("智慧招商")').first()
  await dir.waitFor({ timeout: 15000 })
  await dir.click()
  await page.waitForTimeout(800)
  await expect(page.locator(':text("产业链招商")').first()).toBeVisible()
  await page.goto(BASE + '/investment/chainInvest', { waitUntil: 'domcontentloaded' })
  await page.waitForTimeout(2000)
  await expect(page.locator('.chain-invest')).toBeVisible()

  // 3) 未选产业：主选区引导
  await expect(page.locator('.ind-guide')).toBeVisible()
  await expect(page.getByText('请先选择')).toBeVisible()
  await page.screenshot({ path: `${EV}/01_未选产业-引导.png`, fullPage: true })

  // 4) 打开产业选择器：左产业大类(28个) + 右产业链图谱(上中下游)
  await page.locator('.ind-guide .el-button--primary:has-text("选择产业")').click()
  await page.waitForTimeout(800)
  await expect(page.locator('.ci-dialog .dlg-title', { hasText: '选择目标产业' })).toBeVisible()
  await expect(page.locator('.idlg-inds .dlg-cat', { hasText: '半导体与集成电路' })).toBeVisible()
  await expect(page.locator('.idlg-inds .dlg-cat', { hasText: '人工智能' })).toBeVisible()
  await expect(page.locator('.idlg-inds .dlg-cat', { hasText: '合成生物' })).toBeVisible()
  await expect(page.locator('.idlg-inds .dlg-cat', { hasText: '深地深海' })).toBeVisible()
  const indCount = await page.locator('.idlg-inds .dlg-cat').count()
  expect(indCount).toBe(28)
  await expect(page.locator('.lane-lb', { hasText: '上游' })).toBeVisible()
  await expect(page.locator('.lane-lb', { hasText: '中游' })).toBeVisible()
  await expect(page.locator('.lane-lb', { hasText: '下游' })).toBeVisible()
  // 默认首个产业(半导体与集成电路)含"晶圆制造"
  await expect(page.locator('.idlg-graph .chip', { hasText: '晶圆制造' })).toBeVisible()
  await page.screenshot({ path: `${EV}/02_产业选择器-28产业链图谱.png` })

  // 5) 切到"智能网联汽车"，选赛道 动力电池(上游) + 智能座舱(中游)，确认
  await page.locator('.idlg-inds .dlg-cat', { hasText: '智能网联汽车' }).click()
  await page.waitForTimeout(400)
  await page.locator('.idlg-graph .chip', { hasText: '动力电池' }).click()
  await page.locator('.idlg-graph .chip', { hasText: '智能座舱' }).click()
  await expect(page.locator('.dlg-count b:visible')).toHaveText('2')
  await page.screenshot({ path: `${EV}/03_选中赛道.png` })
  await page.locator('.dlg-footer:visible .el-button--primary:has-text("确认")').click()
  await page.waitForTimeout(1000)

  // 6) 主选区显示已选产业 + 赛道标签；条件区自动注入产业默认条件(置顶·产业徽标)
  await expect(page.locator('.ind-selected .ind-name')).toHaveText('智能网联汽车')
  await expect(page.locator('.ind-tag', { hasText: '动力电池' })).toBeVisible()
  await expect(page.locator('.ind-tag', { hasText: '智能座舱' })).toBeVisible()
  const industryRows = page.locator('.ci-cond-row.from-industry')
  await expect(industryRows).toHaveCount(2)
  await expect(page.locator('.ci-cond-row.from-industry', { hasText: '所属行业' })).toBeVisible()
  await expect(page.locator('.ci-cond-row.from-industry', { hasText: '经营范围' })).toBeVisible()
  await expect(page.locator('.cond-badge').first()).toHaveText('产业')
  await page.screenshot({ path: `${EV}/04_已选产业-默认条件注入.png`, fullPage: true })

  // 7) 叠加用户条件：企业名称 + 成立日期 + 注册资本
  await page.locator('.add-btn:has-text("添加条件")').click()
  await page.waitForTimeout(800)
  await page.locator('.dlg-cat', { hasText: '企业基本信息' }).first().click()
  await page.waitForTimeout(400)
  await page.locator('.dlg-fields .chip', { hasText: '企业名称' }).first().click()
  await page.locator('.dlg-fields .chip', { hasText: '成立日期' }).first().click()
  await page.locator('.dlg-fields .chip', { hasText: '注册资本' }).first().click()
  await expect(page.locator('.dlg-count b:visible')).toHaveText('3')
  await page.locator('.dlg-footer:visible .el-button--primary:has-text("确认")').click()
  await page.waitForTimeout(800)

  // 8) 条件行 = 2 产业 + 3 用户 = 5，且产业条件仍置顶
  await expect(page.locator('.ci-cond-row')).toHaveCount(5)
  await expect(page.locator('.ci-cond-row').first()).toHaveClass(/from-industry/)
  await page.screenshot({ path: `${EV}/05_产业条件置顶+用户条件叠加.png`, fullPage: true })

  // 9) 查询（纯前端空态）
  await page.locator('.ci-actions .el-button--primary:has-text("查询")').click()
  await page.waitForTimeout(1200)
  await page.screenshot({ path: `${EV}/06_查询后空态.png`, fullPage: true })

  // 10) 清空：仅清用户条件，保留产业主轴与产业预置条件
  await page.locator('.ci-actions .el-button:has-text("清空")').click()
  await page.waitForTimeout(800)
  await expect(page.locator('.ci-cond-row')).toHaveCount(2)
  await expect(page.locator('.ci-cond-row.from-industry')).toHaveCount(2)
  await expect(page.locator('.ind-selected .ind-name')).toHaveText('智能网联汽车')
  await page.screenshot({ path: `${EV}/07_清空保留产业条件.png`, fullPage: true })

  // 11) 更换产业：切到 半导体与集成电路 → 晶圆制造，默认条件随之刷新；搜索赛道
  await page.locator('.ind-change:has-text("更换产业")').click()
  await page.waitForTimeout(700)
  await page.locator('.idlg-inds .dlg-cat', { hasText: '半导体与集成电路' }).click()
  await page.waitForTimeout(400)
  // 搜索"光刻"应过滤出 光刻胶
  await page.locator('.dlg-kw:visible input').fill('光刻')
  await page.waitForTimeout(400)
  await expect(page.locator('.idlg-graph .chip', { hasText: '光刻胶' })).toBeVisible()
  await page.locator('.dlg-kw:visible input').fill('')
  await page.waitForTimeout(300)
  await page.locator('.idlg-graph .chip', { hasText: '晶圆制造' }).click()
  await page.locator('.dlg-footer:visible .el-button--primary:has-text("确认")').click()
  await page.waitForTimeout(800)
  await expect(page.locator('.ind-selected .ind-name')).toHaveText('半导体与集成电路')
  await expect(page.locator('.ind-tag', { hasText: '晶圆制造' })).toBeVisible()
  await expect(page.locator('.ci-cond-row.from-industry')).toHaveCount(2)
  await page.screenshot({ path: `${EV}/08_更换产业-条件刷新.png`, fullPage: true })
})
