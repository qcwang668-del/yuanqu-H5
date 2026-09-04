import { chromium } from '@playwright/test'

const BASE = 'http://120.79.142.141/liqi-attachments/miniapp/preview/index.html'
const EV = '/home/fangnan/PycharmProjects/u667a-u8fdc-u529b-u4f01-saas/e2e/evidence/p0-miniapp'

const routes = [
  ['01_policy_list', '#/pages/policy/list'],
  ['02_apply_form', '#/pages/apply/form'],
  ['03_assistant', '#/pages/assistant/index'],
  ['04_message', '#/pages/message/index'],
  ['05_subscribe_setting', '#/pages/subscribe/setting'],
  ['06_policy_detail_park', '#/pages/policy/detail?type=park&id=1'],
]

const b = await chromium.launch({ args: ['--no-sandbox', '--disable-dev-shm-usage'] })
const p = await b.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 })
const summary = []
for (const [name, hash] of routes) {
  try {
    await p.goto(BASE + hash, { waitUntil: 'load', timeout: 60000 })
    await p.waitForTimeout(1500)
    // ensure SPA lands on the intended hash route
    await p.evaluate((h) => { if (location.hash !== h) { location.hash = h } }, hash)
    await p.waitForTimeout(3500)
    await p.screenshot({ path: `${EV}/${name}.png`, fullPage: true })
    const info = await p.evaluate(() => {
      const app = document.getElementById('app')
      return {
        title: document.title,
        appChildren: app ? app.children.length : -1,
        bodyLen: (document.body ? document.body.innerText : '').length,
        text: (document.body ? document.body.innerText : '').replace(/\s+/g, ' ').slice(0, 220),
      }
    })
    summary.push({ name, hash, ...info })
    console.log(`[${name}] appChildren=${info.appChildren} bodyLen=${info.bodyLen}`)
    console.log('   text:', info.text)
  } catch (e) {
    summary.push({ name, hash, error: e.message })
    console.log(`[${name}] ERR ${e.message}`)
  }
}
await b.close()
import('fs').then(fs => fs.writeFileSync(`${EV}/_summary.json`, JSON.stringify(summary, null, 2)))
console.log('DONE')
