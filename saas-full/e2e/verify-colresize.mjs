import { chromium } from '@playwright/test'
import { mkdirSync } from 'node:fs'

const URL = 'http://127.0.0.1:5180'
const EV = '/home/fangnan/PycharmProjects/u667a-u8fdc-u529b-u4f01-saas/e2e/evidence/colresize'
mkdirSync(EV, { recursive: true })

const b = await chromium.launch({ args: ['--no-sandbox', '--disable-dev-shm-usage'] })
const p = await b.newPage({ viewport: { width: 1600, height: 900 } })
try {
  await p.goto(URL + '/', { waitUntil: 'domcontentloaded', timeout: 60000 })
  await p.waitForTimeout(3000)
  const fillIf = async (sel, val) => { const el = p.locator(sel).first(); if (await el.count()) { await el.fill(''); await el.fill(val) } }
  await fillIf('input[placeholder*="租户"]', '芋道源码')
  await fillIf('input[placeholder*="账号"], input[placeholder*="用户名"]', 'admin')
  await fillIf('input[type="password"]', 'admin123')
  await p.waitForTimeout(500)
  await p.locator('button:has-text("登"), .el-button--primary').first().click()
  await p.waitForTimeout(6000)

  // 进有 el-table 的列表页
  await p.goto(URL + '/platformManage/clientUser', { waitUntil: 'domcontentloaded' })
  await p.waitForTimeout(4000)

  // 1) 验证 border 是否全局生效（列宽可拖拽的前提）
  const hasBorder = await p.locator('.el-table--border').count()
  console.log('el-table--border 元素数(全局border生效证据):', hasBorder)

  // 2) 取一列表头，记录拖拽前宽度
  const headerCells = p.locator('.el-table__header-wrapper thead th.el-table__cell')
  const n = await headerCells.count()
  console.log('表头列数:', n)
  // 选一个靠中间、可见的列
  const idx = Math.min(2, n - 2)
  const th = headerCells.nth(idx)
  const before = await th.evaluate((el) => el.offsetWidth)
  const box = await th.boundingBox()
  console.log(`第${idx}列 拖拽前宽度:`, before)
  await p.screenshot({ path: `${EV}/01_列表页带边框_拖拽前.png` })

  // 3) 在该列右边界执行拖拽（+140px）
  const startX = box.x + box.width - 2
  const y = box.y + box.height / 2
  await p.mouse.move(startX, y)
  await p.waitForTimeout(300)
  // 悬停时应出现 col-resize 光标 / resize-proxy
  await p.mouse.down()
  await p.mouse.move(startX + 140, y, { steps: 15 })
  await p.waitForTimeout(300)
  await p.screenshot({ path: `${EV}/02_拖拽中_出现分隔线.png` })
  await p.mouse.up()
  await p.waitForTimeout(800)

  // 4) 记录拖拽后宽度
  const after = await th.evaluate((el) => el.offsetWidth)
  console.log(`第${idx}列 拖拽后宽度:`, after)
  console.log('宽度变化:', after - before)
  await p.screenshot({ path: `${EV}/03_拖拽后_列变宽.png` })

  // 结论
  const ok = hasBorder > 0 && (after - before) >= 80
  console.log('=== 列宽拖拽验收:', ok ? 'PASS ✅' : 'FAIL ❌', '===')
} catch (e) {
  console.log('ERR:', e.message)
} finally {
  await b.close()
}
