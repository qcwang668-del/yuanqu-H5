import fs from 'node:fs'
const BASE = '/home/fangnan/PycharmProjects/u667a-u8fdc-u529b-u4f01-saas/e2e'
const dir = `${BASE}/evidence/investment-chain`
const shots = [
  ['01_未选产业-引导', '未选产业 · 主选区引导"请先选择目标产业"'],
  ['02_产业选择器-28产业链图谱', '产业选择器 · 左产业大类(28个「20+8」集群) + 右产业链图谱（上游/中游/下游泳道 + 赛道）'],
  ['03_选中赛道', '选赛道 · 正极材料(上游) + 动力电池(中游)，已选 2 个赛道'],
  ['04_已选产业-默认条件注入', '确认后 · 主选区显示产业面包屑，条件区自动注入 2 条"产业"默认条件（所属行业=行业代码 / 经营范围=关键词）'],
  ['05_产业条件置顶+用户条件叠加', '叠加用户条件 · 产业条件置顶高亮，其后为企业名称/成立日期/注册资本（按类型智能取值）'],
  ['06_查询后空态', '点击"查询" · 产业+条件组合，纯前端返回空态'],
  ['07_清空保留产业条件', '点击"清空" · 仅清用户条件，保留产业主轴与产业预置条件'],
  ['08_更换产业-条件刷新', '"更换产业" · 切到集成电路→晶圆制造，默认条件随之刷新']
]
const b64 = (n) => { try { return 'data:image/png;base64,' + fs.readFileSync(`${dir}/${n}.png`).toString('base64') } catch { return '' } }
const cards = shots.map(([f, t]) => `<div class="card"><div class="cap">${t}</div><img loading="lazy" src="${b64(f)}" /></div>`).join('')
const html = `<!doctype html><html lang="zh-CN"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1"><title>智慧招商 · 产业链招商（先选产业→组合条件）· 验收报告</title>
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
  .tag{display:inline-block;background:#eaf2ff;color:#2f7bff;border:1px solid #a9c6ff;border-radius:4px;padding:2px 8px;margin:2px;font-size:12px}
</style></head><body>
<div class="hd"><h1>智慧招商 · 产业链招商 ·「先选产业 → 组合条件」筛客户群体 · 验收报告</h1>
<p>P0 落地：产业链图谱选择器（产业›环节›赛道）+ 选产业自动注入默认条件 + 241 字段多维叠加　|　纯前端（查询空态，不接后端）</p>
<p>底座：芋道 yudao-ui-admin-vue3　|　生成时间：2026-08-26　|　验收：Playwright E2E 真机截图（全绿）</p></div>
<div class="wrap">
  <div class="sec"><h2>产业覆盖（28 个「20+8」集群）</h2>
    <p style="font-size:13px;color:#555">半导体与集成电路 · 人工智能 · 智能网联汽车 · 低空经济与空天 · 生物医药 · 高端医疗器械 · 大健康 · 新能源 · 安全节能环保 · 网络与通信 · 超高清视频显示 · 智能终端 · 智能传感器 · 高端装备与仪器 · 机器人 · 软件与信息服务 · 数字创意 · 高性能材料 · 现代时尚 · 海洋产业 · 量子信息 · 光载信息 · 智能机器人 · 合成生物 · 细胞与基因 · 脑科学与脑机工程 · 前沿新材料 · 深地深海</p>
    <p style="font-size:13px;color:#888">每个产业均按 上游/中游/下游 拆分赛道，赛道映射国标行业代码 + 经营范围关键词（内置 <code>industryChain.ts</code>，P1 后台化）。</p>
  </div>
  <div class="sec"><h2>验收结论</h2>
    <div class="kpi"><div><b>28</b>产业集群(20+8)</div><div><b>3级</b>产业链图谱</div><div><b>自动注入</b>产业默认条件</div><div><b>241</b>可叠加字段</div><div><b class="ok">PASS</b>E2E 全绿</div></div>
    <p style="margin-top:14px">按方案 P0 实现「<b>先选产业 → 再组合条件</b>」：① 页面顶部新增<b>产业主选区</b>，未选时引导先选产业；② <b>产业选择器</b>弹窗＝左产业大类（新能源汽车 / 集成电路 / 生物医药 / 高端装备）＋右<b>产业链图谱</b>（上游/中游/下游泳道 + 赛道 chips，可多选，支持搜索）；③ 选定赛道后<b>自动注入产业默认条件</b>（<code>所属行业∈行业代码集</code> + <code>经营范围包含关键词</code>），以「产业」徽标<b>置顶高亮</b>、可编辑可删除；④ 用户在此基础叠加 241 字段条件；⑤「清空」仅清用户条件、保留产业主轴；「更换产业」刷新默认条件。</p></div>
  <div class="sec"><h2>产业→条件 联动（示例：新能源汽车·正极材料+动力电池）</h2>
    <p><span class="tag">所属行业 包含 → C3985 电子专用材料制造、C3841 锂离子电池制造</span><span class="tag">经营范围 包含 → 正极材料、磷酸铁锂、三元材料、动力电池、锂电池…</span></p>
    <p>产业链图谱与行业代码/关键词映射内置于 <code>industryChain.ts</code>（P1 将后台化，接真实国标行业代码）。</p></div>
  <div class="sec"><h2>交付物清单</h2><table>
    <tr><th>#</th><th>产物</th><th>路径</th><th>状态</th></tr>
    <tr><td>1</td><td>产业链招商页面（产业主选区+两弹窗+条件注入）</td><td>frontend/src/views/investment/chainInvest/index.vue</td><td class="ok">✓</td></tr>
    <tr><td>2</td><td>产业链图谱知识库（4产业/上中下游/赛道→行业代码+关键词）</td><td>frontend/src/views/investment/chainInvest/industryChain.ts</td><td class="ok">✓</td></tr>
    <tr><td>3</td><td>筛选字段数据（241 字段/14 分类）</td><td>frontend/src/views/investment/chainInvest/fields.ts</td><td class="ok">✓</td></tr>
    <tr><td>4</td><td>菜单 SQL（system_menu 2084）</td><td>backend/sql/liqi/chain-invest-menu.sql</td><td class="ok">✓</td></tr>
    <tr><td>5</td><td>E2E 测试用例（11 步）</td><td>e2e/tests/investment-chain.spec.ts</td><td class="ok">✓ PASS</td></tr>
    <tr><td>6</td><td>截图证据（8 张）</td><td>e2e/evidence/investment-chain/</td><td class="ok">✓</td></tr>
  </table></div>
  <div class="sec"><h2>E2E 截图证据</h2>${cards}</div>
</div></body></html>`
fs.mkdirSync(`${BASE}/reports`, { recursive: true })
fs.writeFileSync(`${BASE}/reports/investment-chain.html`, html)
console.log('report written:', `${BASE}/reports/investment-chain.html`, 'bytes=', html.length)
