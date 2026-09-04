import { chromium } from '@playwright/test'
import fs from 'node:fs'
const OUT = '/home/fangnan/PycharmProjects/u667a-u8fdc-u529b-u4f01-saas/e2e/scrape/out'
const HTML = `${OUT}/html`; fs.mkdirSync(HTML, { recursive: true })
const URL = 'https://www.liqicloud.com/enterprise/914403001922038216?datasource=1'
const b = await chromium.launch({ headless: true, args: ['--no-sandbox'] })
const ctx = await b.newContext({ viewport: { width: 1680, height: 1080 } })
const p = await ctx.newPage()
p.setDefaultTimeout(18000)
await p.goto(URL, { waitUntil: 'networkidle' }).catch(() => {})
await p.waitForTimeout(2500)
console.log('URL1=', p.url())
// 若跳到登录，填表登录
if (/login|auth/i.test(p.url())) {
  await p.screenshot({ path: `${OUT}/www-login.png` })
  const inputs = await p.evaluate(() => Array.from(document.querySelectorAll('input')).map((i) => ({ name: i.name, ph: i.placeholder, type: i.type })))
  console.log('LOGIN INPUTS=', JSON.stringify(inputs))
  const uName = p.locator('input[name="username"], input[placeholder*="手机"], input[placeholder*="账号"]').first()
  const uPass = p.locator('input[type="password"], input[name="password"], input[placeholder*="密码"]').first()
  await uName.fill('19911110000').catch(() => {})
  await uPass.fill('admin123').catch(() => {})
  await p.waitForTimeout(400)
  await p.locator('button:has-text("登录"), button:has-text("登 录"), .login-btn').first().click().catch(() => {})
  await p.waitForTimeout(4000)
  // 可能需选企业
  const ok = p.locator('button:has-text("确定")').first()
  if (await ok.count()) { await ok.click().catch(() => {}); await p.waitForTimeout(4000) }
  console.log('after login URL=', p.url())
  // 再次直达企业页
  await p.goto(URL, { waitUntil: 'networkidle' }).catch(() => {})
  await p.waitForTimeout(4000)
}
console.log('FINAL URL=', p.url())
await p.screenshot({ path: `${OUT}/ent-page-01.png`, fullPage: true })
// 页签
let tabs = await p.locator('.ant-tabs-tab, [role="tab"], .el-tabs__item, [class*="tab-item"], [class*="tabItem"]').allInnerTexts().catch(() => [])
tabs = [...new Set(tabs.map((t) => t.trim()).filter(Boolean))]
console.log('TABS=', JSON.stringify(tabs))
fs.writeFileSync(`${HTML}/entpage.html`, await p.content().catch(() => ''))
await b.close()
