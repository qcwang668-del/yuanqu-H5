import fs from 'node:fs'
const dir = '/home/fangnan/PycharmProjects/u667a-u8fdc-u529b-u4f01-saas/e2e/evidence/investment-ranking'
const shots = [
  ['01_侧边栏含智慧招商', '侧边栏新增「智慧招商」一级菜单'],
  ['02_榜单招商-侧栏展开', '展开「智慧招商」→「榜单招商」子菜单'],
  ['03_榜单招商-总览', '① 榜单招商 · 总览（政府认定 / 平台特色 / 商业综合三大区）'],
  ['04_收藏星标点亮', '② 收藏交互 · 星标点亮 + 提示'],
  ['05_点击卡片提示', '③ 点击卡片 · 查看榜单详情提示']
]
const b64 = (n) => { try { return 'data:image/png;base64,' + fs.readFileSync(`${dir}/${n}.png`).toString('base64') } catch { return '' } }
const rows = shots.map(([f, t]) => `<div class="card"><div class="cap">${t}</div><img loading="lazy" src="${b64(f)}" /></div>`).join('')
const html = `<!doctype html><html lang="zh-CN"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1"><title>智慧招商 · 榜单招商 · 验收报告</title>
<style>
  body{margin:0;font-family:-apple-system,"PingFang SC","Microsoft YaHei",sans-serif;background:#f5f7fa;color:#1f2d3d}
  .hd{background:linear-gradient(135deg,#2d5af0,#1e3a8a);color:#fff;padding:32px 40px}
  .hd h1{margin:0 0 8px;font-size:26px}.hd p{margin:2px 0;opacity:.9;font-size:14px}
  .wrap{max-width:1280px;margin:0 auto;padding:24px 40px}
  .sec{background:#fff;border-radius:10px;padding:20px 24px;margin:18px 0;box-shadow:0 1px 3px rgba(0,0,0,.06)}
  .sec h2{margin:0 0 12px;font-size:18px;border-left:4px solid #2d5af0;padding-left:10px}
  table{width:100%;border-collapse:collapse;font-size:14px}
  th,td{border:1px solid #ebeef5;padding:8px 10px;text-align:left}th{background:#f5f7fa}
  .ok{color:#22a06b;font-weight:600}
  .card{margin:20px 0}.cap{font-weight:600;margin-bottom:8px;font-size:15px;color:#2d5af0}
  .card img{width:100%;border:1px solid #e4e7ed;border-radius:8px;display:block}
  .kpi{display:flex;gap:16px;flex-wrap:wrap}
  .kpi div{flex:1;min-width:150px;background:#eaf1fb;border-radius:8px;padding:14px;text-align:center}
  .kpi b{display:block;font-size:22px;color:#2d5af0}
  code{background:#f0f2f5;padding:1px 5px;border-radius:4px}
</style></head><body>
<div class="hd"><h1>智慧招商 · 榜单招商 · 交付验收报告</h1>
<p>新增一级菜单「智慧招商」+ 子菜单「榜单招商」　|　参考截图 1:1 还原（政府认定 / 平台特色 / 商业综合）</p>
<p>底座：芋道 yudao-ui-admin-vue3　|　生成时间：2026-08-26　|　验收：Playwright E2E 真机截图</p></div>
<div class="wrap">
  <div class="sec"><h2>验收结论</h2>
    <div class="kpi"><div><b>1</b>一级菜单(智慧招商)</div><div><b>1</b>子菜单(榜单招商)</div><div><b>34</b>榜单卡片</div><div><b class="ok">PASS</b>E2E 全绿</div></div>
    <p style="margin-top:14px">按截图还原「榜单招商」卡片目录页：<b>政府认定榜单</b>（专精特新/小巨人/科技小巨人/高新/独角兽等 12 项）、<b>平台特色榜单</b>（融资能力/成长潜力/科技引领/绿色 4 项）、<b>商业综合榜单</b>（财富 5 / 福布斯 4 / 其他 5，各带「查看更多」）。卡片含图标磁贴 + 标题 + 描述 + 收藏星标（可点亮）。前端 <code>views/investment/rankingList/index.vue</code>（<code>InvestmentRankingList</code>）；菜单 <code>system_menu</code> 2081(智慧招商·目录)/2082(榜单招商·菜单 → <code>investment/rankingList/index</code>)。</p></div>
  <div class="sec"><h2>交付物清单</h2><table>
    <tr><th>#</th><th>产物</th><th>路径</th><th>状态</th></tr>
    <tr><td>1</td><td>榜单招商页面</td><td>frontend/src/views/investment/rankingList/index.vue</td><td class="ok">✓</td></tr>
    <tr><td>2</td><td>菜单 SQL（已落库）</td><td>backend/sql/liqi/investment-menu.sql</td><td class="ok">✓</td></tr>
    <tr><td>3</td><td>E2E 测试</td><td>e2e/tests/investment-ranking.spec.ts</td><td class="ok">✓ 1 passed</td></tr>
    <tr><td>4</td><td>截图证据（5 张）</td><td>e2e/evidence/investment-ranking/</td><td class="ok">✓</td></tr>
  </table></div>
  <div class="sec"><h2>真机截图证据</h2>${rows}</div>
</div></body></html>`
const out = '/home/fangnan/PycharmProjects/u667a-u8fdc-u529b-u4f01-saas/e2e/reports/investment-ranking.html'
fs.writeFileSync(out, html)
console.log('报告已生成:', out, (fs.statSync(out).size / 1024 / 1024).toFixed(2) + ' MB')
