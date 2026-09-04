import { chromium } from '@playwright/test'
const URL = 'http://127.0.0.1:5180'
const b = await chromium.launch({ args: ['--no-sandbox'] })
const p = await b.newPage({ viewport: { width: 1600, height: 900 } })
p.on('console', m => { if (m.type() === 'error') console.log('CONSOLE ERR:', m.text().slice(0, 200)) })
p.on('pageerror', e => console.log('PAGE ERR:', e.message.slice(0, 300)))
try {
  await p.goto(URL + '/', { waitUntil: 'domcontentloaded', timeout: 60000 })
  await p.waitForTimeout(3000)
  const fillIf = async (s, v) => { const el = p.locator(s).first(); if (await el.count()) { await el.fill(''); await el.fill(v) } }
  await fillIf('input[placeholder*="租户"]', '芋道源码')
  await fillIf('input[placeholder*="账号"], input[placeholder*="用户名"]', 'admin')
  await fillIf('input[type="password"]', 'admin123')
  await p.locator('button:has-text("登"), .el-button--primary').first().click()
  await p.waitForTimeout(6000)
  await p.goto(URL + '/park-screen', { waitUntil: 'domcontentloaded' })
  await p.waitForTimeout(6000)
  console.log('.dash 存在:', await p.locator('.dash').count(), '| .dc 卡片:', await p.locator('.dc').count())
  const style = await p.locator('.dash').first().getAttribute('style').catch(() => 'N/A')
  console.log('.dash style:', style)
} catch (e) { console.log('ERR:', e.message) } finally { await b.close() }
