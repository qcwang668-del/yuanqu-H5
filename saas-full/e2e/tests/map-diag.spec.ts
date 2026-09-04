import { test } from '@playwright/test'

const BASE = process.env.MAP_BASE || 'http://127.0.0.1:5180'

test('地图诊断', async ({ page }) => {
  const fails: string[] = []
  const consoles: string[] = []
  page.on('response', (r) => {
    const u = r.url()
    if (/map\.baidu\.com|bdimg|bdstatic|api\.map/.test(u) && r.status() >= 400) fails.push(`${r.status()} ${u.slice(0, 120)}`)
  })
  page.on('console', (m) => {
    if (m.type() === 'error') consoles.push(m.text().slice(0, 200))
  })
  page.on('pageerror', (e) => consoles.push('pageerror:' + e.message.slice(0, 200)))
  page.on('dialog', (d) => { consoles.push('dialog:' + d.message().slice(0, 200)); d.dismiss().catch(() => {}) })

  await page.goto(BASE + '/', { waitUntil: 'domcontentloaded' })
  await page.waitForTimeout(3000)
  const fillIf = async (sel: string, val: string) => {
    const el = page.locator(sel).first()
    if (await el.count()) { await el.fill(''); await el.fill(val) }
  }
  await fillIf('input[placeholder*="租户"]', '芋道源码')
  await fillIf('input[placeholder*="账号"], input[placeholder*="用户名"]', 'admin')
  await fillIf('input[type="password"]', 'admin123')
  await page.waitForTimeout(500)
  await page.locator('button:has-text("登"), .el-button--primary').first().click()
  await page.waitForTimeout(6000)

  await page.goto(BASE + '/investment/mapInvest', { waitUntil: 'domcontentloaded' })
  await page.waitForTimeout(13000)

  const diag = await page.evaluate(() => {
    const el = document.querySelector('.mi-map') as HTMLElement
    return {
      hasBMapGL: typeof (window as any).BMapGL,
      hasMapCtor: !!((window as any).BMapGL && (window as any).BMapGL.Map),
      miMapChildren: el ? el.children.length : -1,
      miMapCanvas: el ? el.querySelectorAll('canvas').length : -1,
      miMapHTMLlen: el ? el.innerHTML.length : -1,
      errText: (document.querySelector('.mi-map-err') as HTMLElement)?.innerText || '',
      bodyHasBaiduErr: /ak|referer|APP不存在|授权|域名|校验/i.test(document.body.innerText.slice(0, 5000)) ? 'maybe' : 'no'
    }
  })
  console.log('=== BASE:', BASE, '===')
  console.log('DIAG:', JSON.stringify(diag, null, 2))
  console.log('MAP_FAILS:', fails.length ? fails.join('\n  ') : '(none)')
  console.log('CONSOLE_ERRORS:', consoles.length ? consoles.join('\n  ') : '(none)')
})
