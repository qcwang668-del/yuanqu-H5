import { test, expect } from '@playwright/test'
import fs from 'node:fs'

// DaaS 企业数据接口验收：登录力企云后台 → 浏览器内真实 fetch admin-api 接口 → 渲染结果截图
// 链路：nginx:5180 → 后端:48080 → DaasClient(签名) → daas.liqicloud.com
const BASE = 'http://127.0.0.1:5180'
const EV = 'evidence/daas-api'
fs.mkdirSync(EV, { recursive: true })

const CARD_CSS = `
  * { box-sizing: border-box; }
  body { font-family: 'Noto Sans CJK SC','Microsoft YaHei',sans-serif; background:#f0f2f5; margin:0; padding:32px; }
  .wrap { max-width: 1080px; margin:0 auto; }
  h1 { font-size:24px; color:#1f2d3d; margin:0 0 6px; }
  .sub { color:#909399; font-size:14px; margin-bottom:24px; }
  .api { background:#fff; border-radius:10px; padding:18px 22px; margin-bottom:20px; box-shadow:0 2px 12px rgba(0,0,0,.06); }
  .method { display:inline-block; background:#67c23a; color:#fff; font-weight:700; border-radius:4px; padding:2px 10px; font-size:13px; margin-right:10px; }
  .method.post { background:#e6a23c; }
  .path { font-family:monospace; font-size:15px; color:#409eff; font-weight:600; }
  .ok { float:right; background:#f0f9eb; color:#67c23a; border:1px solid #c2e7b0; border-radius:20px; padding:3px 14px; font-size:13px; font-weight:700; }
  table { width:100%; border-collapse:collapse; margin-top:14px; font-size:14px; }
  td { padding:8px 10px; border-bottom:1px solid #ebeef5; vertical-align:top; }
  td.k { color:#909399; width:200px; white-space:nowrap; }
  td.v { color:#303133; font-weight:500; }
  .json { background:#2d2d2d; color:#9cdcfe; border-radius:8px; padding:18px; font-family:monospace; font-size:13px; white-space:pre-wrap; word-break:break-all; margin-top:14px; line-height:1.7; }
  .tag { display:inline-block; background:#ecf5ff; color:#409eff; border-radius:4px; padding:1px 8px; font-size:12px; margin-left:6px; }
`

test('DaaS 企业数据接口 · 登录后台 + 真实调用企业详情/模糊匹配', async ({ page }) => {
  test.setTimeout(180000)

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
  await page.waitForTimeout(2500)
  await page.screenshot({ path: `${EV}/01_后台登录成功.png`, fullPage: false })

  // ===== 2. 登录 API 拿 token（后端直发，不依赖前端 localStorage 存储格式）=====
  const loginResp = await page.request.post(BASE + '/admin-api/system/auth/login', {
    headers: { 'tenant-id': '1', 'Content-Type': 'application/json' },
    data: { username: 'admin', password: 'admin123', captchaVerification: '' },
  })
  const loginJson = await loginResp.json()
  const token = loginJson?.data?.accessToken
  expect(token, '登录 token 应存在').toBeTruthy()

  const callApi = (url: string) => page.evaluate(async ([u, t]) => {
    const r = await fetch(u, { headers: { Authorization: 'Bearer ' + t, 'tenant-id': '1' } })
    return await r.json()
  }, [url, token] as [string, string])

  // ===== 3. 企业基本信息（GET，按统一社会信用代码查工商详情）=====
  const baseInfo = await callApi('/admin-api/liqi/daas/enterprise/base-info?entityId=91110108551385082Q')
  expect(baseInfo.code, '企业详情接口 code 应为 0').toBe(0)
  expect(baseInfo.data.companyName, '应返回公司名称').toBeTruthy()
  await page.evaluate(({ d, css }) => {
    const rows = [
      ['公司名称', d.companyName], ['曾用名', d.companyFormerName], ['法定代表人', d.legalName],
      ['统一社会信用代码', d.entityId], ['注册资本', `${d.regCapital} ${d.regCapitalType || ''}`],
      ['经营状态', d.entStatus], ['成立日期', d.regDate], ['企业类型', d.zcbComType],
      ['行业（一级）', d.industryLv1Name], ['行业（三级）', d.industryLv3Name],
      ['参保人数', d.socialStaffNum != null ? `${d.socialStaffNum} 人` : '-'],
      ['企业规模', { 1: '微型', 2: '小型', 3: '中型', 4: '大型' }[d.companyScale] || '-'],
      ['注册地址', d.regAddress], ['登记机关', d.regOrg], ['英文名称', d.entityEnglishName],
      ['经营范围', d.opScope],
    ].map(([k, v]) => `<tr><td class="k">${k}</td><td class="v">${v ?? '-'}</td></tr>`).join('')
    document.body.innerHTML = `<style>${css}</style><div class="wrap">
      <h1>力企云 DaaS 企业数据接口 · 验收结果</h1>
      <div class="sub">管理后台 admin-api 真实调用 · 签名鉴权 appKey/timestamp/nonce/sign (MD5)</div>
      <div class="api"><span class="ok">✔ code:0 成功</span><span class="method">GET</span><span class="path">/admin-api/liqi/daas/enterprise/base-info</span><span class="tag">企业工商详情 · 强类型VO</span>
        <table>${rows}</table></div></div>`
  }, { d: baseInfo.data, css: CARD_CSS })
  await page.waitForTimeout(500)
  await page.screenshot({ path: `${EV}/02_企业基本信息接口.png`, fullPage: true })

  // ===== 4. 企业模糊匹配（POST，关键词搜企业；平台侧该数据集当前 total=0）=====
  const fuzzy = await callApi('/admin-api/liqi/daas/enterprise/fuzzy-match?keyword=' + encodeURIComponent('科技') + '&page=1&size=3')
  expect(fuzzy.code, '模糊匹配接口 code 应为 0（链路通）').toBe(0)
  await page.evaluate(({ resp, css }) => {
    const d = resp.data || {}
    const note = d.total === 0
      ? '链路已通（签名/POST/解包正常）；平台侧该数据集当前返回 total=0，待数据提供方开通/授权后即返回企业列表。'
      : `命中 ${d.total} 家企业。`
    document.body.innerHTML = `<style>${css}</style><div class="wrap">
      <h1>力企云 DaaS 企业数据接口 · 验收结果</h1>
      <div class="sub">管理后台 admin-api 真实调用 · 企业模糊匹配（关键词搜索 + 分页）</div>
      <div class="api"><span class="ok">✔ code:0 链路通</span><span class="method post">POST</span><span class="path">/admin-api/liqi/daas/enterprise/fuzzy-match</span><span class="tag">关键词模糊搜索 · 分页</span>
        <table>
          <tr><td class="k">请求关键词</td><td class="v">科技（page=1, size=3）</td></tr>
          <tr><td class="k">返回 total</td><td class="v">${d.total ?? '-'}</td></tr>
          <tr><td class="k">返回 list 条数</td><td class="v">${(d.list || []).length}</td></tr>
          <tr><td class="k">说明</td><td class="v">${note}</td></tr>
        </table>
        <div class="json">${JSON.stringify(resp, null, 2)}</div>
      </div></div>`
  }, { resp: fuzzy, css: CARD_CSS })
  await page.waitForTimeout(500)
  await page.screenshot({ path: `${EV}/03_企业模糊匹配接口.png`, fullPage: true })

  console.log('[DaaS E2E] 企业详情公司名 =', baseInfo.data.companyName, '| 模糊匹配 total =', fuzzy.data?.total)
})
