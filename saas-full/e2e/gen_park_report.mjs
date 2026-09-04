import fs from 'node:fs'
const dir = '/home/fangnan/PycharmProjects/u667a-u8fdc-u529b-u4f01-saas/e2e/evidence/park-screen'
const shots = [
  ['01_登录页', '登录页（本地验证码已关）'],
  ['02_侧边栏含大屏菜单', '侧边栏已出现「园区可视化大屏」菜单'],
  ['03_大屏总览', '① 园区可视化大屏 · 总览（体征条 / 质量结构 / 迁入迁出 / 风险 / 榜单 / 动态 / 滚播）'],
  ['04_榜单-行业排行', '② 特色榜单切换 · 行业排行'],
  ['05_榜单-资质新增', '③ 特色榜单切换 · 资质新增'],
  ['06_播放收尾闭环', '④ 播放收尾闭环 · 湾芯科技故事高亮 + toast'],
  ['07_退出大屏返回后台', '⑤ 退出大屏 · 返回后台首页']
]
const b64 = (n) => {
  try { return 'data:image/png;base64,' + fs.readFileSync(`${dir}/${n}.png`).toString('base64') }
  catch { return '' }
}
const rows = shots.map(([f, t]) => `
  <div class="card"><div class="cap">${t}</div><img loading="lazy" src="${b64(f)}" /></div>`).join('')
const html = `<!doctype html><html lang="zh-CN"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>园区可视化大屏 · 验收报告</title>
<style>
  body{margin:0;font-family:-apple-system,"PingFang SC","Microsoft YaHei",sans-serif;background:#f5f7fa;color:#1f2d3d}
  .hd{background:linear-gradient(135deg,#0d2f60,#04102a);color:#fff;padding:32px 40px}
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
</style></head><body>
<div class="hd"><h1>园区可视化大屏 · 交付验收报告</h1>
<p>模块：深投控 · 智慧园区惠企政策服务总览（单屏大屏）　|　参考：prototype/screen.html 1:1 还原</p>
<p>底座：芋道 yudao-ui-admin-vue3（Vue3 + ElementPlus）　|　生成时间：2026-08-26　|　验收：Playwright E2E 真机截图</p></div>
<div class="wrap">
  <div class="sec"><h2>验收结论</h2>
    <div class="kpi"><div><b>1</b>全屏大屏页面</div><div><b>1</b>侧边栏菜单(已落库)</div><div><b class="ok">PASS</b>E2E 全绿</div><div><b class="ok">✓</b>渲染/动画/交互</div></div>
    <p style="margin-top:14px">按用户选定方案交付：<b>独立全屏大屏页</b>（<code>position:fixed;inset:0</code> 覆盖侧栏/顶栏，点菜单在页签内全屏展示）+ <b>菜单落库</b>。前端页面 <code>views/park/screen/index.vue</code>（组件名 <code>ParkScreen</code>）由参考原型 <code>screen.html</code> 移植，CSS 全量加 <code>.pkscreen</code> 作用域前缀避免全局污染。菜单 <code>system_menu</code> id=2080（<code>/park-screen</code> → <code>park/screen/index</code>），本地由 super_admin(admin) 可见。</p></div>
  <div class="sec"><h2>交付物清单</h2><table>
    <tr><th>#</th><th>产物</th><th>路径</th><th>状态</th></tr>
    <tr><td>1</td><td>大屏 Vue 页面</td><td>frontend/src/views/park/screen/index.vue</td><td class="ok">✓</td></tr>
    <tr><td>2</td><td>菜单 SQL（已落库）</td><td>backend/sql/liqi/park-screen-menu.sql</td><td class="ok">✓</td></tr>
    <tr><td>3</td><td>E2E 测试</td><td>e2e/tests/park-screen.spec.ts</td><td class="ok">✓ 1 passed</td></tr>
    <tr><td>4</td><td>截图证据（7 张）</td><td>e2e/evidence/park-screen/</td><td class="ok">✓</td></tr>
  </table></div>
  <div class="sec"><h2>功能点核验</h2><table>
    <tr><th>区块</th><th>内容</th><th>核验</th></tr>
    <tr><td>A 区 · 园区体征条</td><td>在园企业/迁入/迁出/净增/增长率/参保人数（6 项，数字滚动动画）</td><td class="ok">✓</td></tr>
    <tr><td>B 区 · 企业质量结构</td><td>资质徽章矩阵(6) + 产业结构环形图(conic-gradient 动画) + 图例</td><td class="ok">✓</td></tr>
    <tr><td>C 区 · 迁入迁出流动</td><td>迁入/迁出流量带 + 迁出去向 TOP5 进度条</td><td class="ok">✓</td></tr>
    <tr><td>D 区 · 企业风险总览</td><td>风险分布(高/中/低/无) + 处置率（不点名企业）</td><td class="ok">✓</td></tr>
    <tr><td>E 区 · 园区特色榜单</td><td>补贴/行业/资质 三榜切换</td><td class="ok">✓</td></tr>
    <tr><td>F 区 · 政策服务成效</td><td>触达/申报/获批/到账 KPI + 触达率/转化率进度</td><td class="ok">✓</td></tr>
    <tr><td>G 区 · 底部滚播</td><td>ticker 滚动 + 故事主角闭环文案</td><td class="ok">✓</td></tr>
    <tr><td>交互 · 收尾闭环</td><td>播放收尾闭环：湾芯故事高亮 + toast + 页脚更新</td><td class="ok">✓</td></tr>
  </table></div>
  <div class="sec"><h2>真机截图证据</h2>${rows}</div>
</div></body></html>`
const out = '/home/fangnan/PycharmProjects/u667a-u8fdc-u529b-u4f01-saas/e2e/reports/park-screen.html'
fs.writeFileSync(out, html)
console.log('报告已生成:', out, (fs.statSync(out).size / 1024 / 1024).toFixed(2) + ' MB')
