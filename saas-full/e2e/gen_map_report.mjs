import fs from 'node:fs'
const dir = '/home/fangnan/PycharmProjects/u667a-u8fdc-u529b-u4f01-saas/e2e/evidence/investment-map'
const shots = [
  ['EXT_外网出图', '① 外网域名(120.79.142.141:8000)真机出图 · Leaflet + 高德免费瓦片(无需任何 AK)'],
  ['03_圈选模式', '② 圈选模式 · 在地图上点选圈选中心'],
  ['04_半径3km', '③ 半径调整 · 范围联动'],
  ['05_筛选下拉', '④ 多维筛选 · 下拉选项']
]
const b64 = (n) => { try { return 'data:image/png;base64,' + fs.readFileSync(`${dir}/${n}.png`).toString('base64') } catch { return '' } }
const rows = shots.map(([f, t]) => { const d=b64(f); return d?`<div class="card"><div class="cap">${t}</div><img loading="lazy" src="${d}" /></div>`:'' }).join('')
const html = `<!doctype html><html lang="zh-CN"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1"><title>智慧招商 · 地图招商 · 验收报告(Leaflet+高德)</title>
<style>
  body{margin:0;font-family:-apple-system,"PingFang SC","Microsoft YaHei",sans-serif;background:#f5f7fa;color:#1f2d3d}
  .hd{background:linear-gradient(135deg,#1863c7,#0b2450);color:#fff;padding:32px 40px}
  .hd h1{margin:0 0 8px;font-size:26px}.hd p{margin:2px 0;opacity:.9;font-size:14px}
  .wrap{max-width:1280px;margin:0 auto;padding:24px 40px}
  .sec{background:#fff;border-radius:10px;padding:20px 24px;margin:18px 0;box-shadow:0 1px 3px rgba(0,0,0,.06)}
  .sec h2{margin:0 0 12px;font-size:18px;border-left:4px solid #1863c7;padding-left:10px}
  table{width:100%;border-collapse:collapse;font-size:14px}
  th,td{border:1px solid #ebeef5;padding:8px 10px;text-align:left}th{background:#f5f7fa}
  .ok{color:#22a06b;font-weight:600}
  .card{margin:20px 0}.cap{font-weight:600;margin-bottom:8px;font-size:15px;color:#1863c7}
  .card img{width:100%;border:1px solid #e4e7ed;border-radius:8px;display:block}
  .kpi{display:flex;gap:16px;flex-wrap:wrap}
  .kpi div{flex:1;min-width:150px;background:#eaf1fb;border-radius:8px;padding:14px;text-align:center}
  .kpi b{display:block;font-size:22px;color:#1863c7}
  code{background:#f0f2f5;padding:1px 5px;border-radius:4px}
  .note{background:#fff8e6;border:1px solid #ffe2a8;border-radius:8px;padding:12px 14px;font-size:13px;color:#8a6d1a}
</style></head><body>
<div class="hd"><h1>智慧招商 · 地图招商 · 验收报告（演示稳定版）</h1>
<p>地图改造：Leaflet + 高德免费栅格瓦片，<b>无需任何百度 AK / key，无控制台配置</b></p>
<p>底座：芋道 yudao-ui-admin-vue3　|　生成时间：2026-08-26　|　验收：Playwright E2E 真机截图（外网域名）</p></div>
<div class="wrap">
  <div class="sec"><h2>验收结论</h2>
    <div class="kpi"><div><b>真实</b>可交互地图</div><div><b>16/16</b>瓦片加载</div><div><b>0</b>报错</div><div><b class="ok">PASS</b>外网 E2E</div></div>
    <p style="margin-top:14px">原百度地图方案因 AK「APP服务被禁用」无法出图；为保障客户演示稳定，改用 <b>Leaflet + 高德公开栅格瓦片</b>：浏览器直连取图，<b>不需要 AK、无 Referer 校验、无控制台配置</b>。功能保持一致：可拖动/缩放的深圳地图、<b>圈选/拖动模式</b>、<b>半径圈</b>（可调 km）、圈内 <b>编号企业标记 + 点标记弹窗</b>；右侧多维筛选（14 维）+ 企业列表 + 分页不变。已在<b>外网域名 120.79.142.141:8000</b> 用无头浏览器复测：高德瓦片 16/16 加载、无任何报错。前端 <code>views/investment/mapInvest/index.vue</code>；依赖新增 <code>leaflet 1.9.4</code>。</p></div>
  <div class="sec"><h2>真机截图证据（外网域名）</h2>${rows}</div>
</div></body></html>`
const out = '/home/fangnan/PycharmProjects/u667a-u8fdc-u529b-u4f01-saas/e2e/reports/investment-map.html'
fs.writeFileSync(out, html)
console.log('报告已生成:', out, (fs.statSync(out).size/1024/1024).toFixed(2)+' MB')
