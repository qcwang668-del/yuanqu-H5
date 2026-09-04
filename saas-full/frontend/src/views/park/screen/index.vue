<!--
  园区可视化大屏 · 深圳湾生态园 智慧园区惠企政策服务总览（单屏）
  由 prototype/screen.html 移植为芋道前端 SFC。
  full-viewport(fixed inset:0) 脱离后台侧栏/顶栏，点菜单在页签内全屏展示。
-->
<template>
  <div class="pkscreen" ref="rootRef">
    <div class="dash">
      <div class="dash-hd">
        <h1>深圳湾生态园 · 智慧园区惠企政策服务总览 <em>AI 政策数据服务园区企业</em></h1>
        <div class="rt">
          <span class="lv"><i></i>数据实时更新中</span>
          <span class="mono" id="dashTime">2026-08-24 09:41:26</span>
          <button class="btn g sm" @click="dashFinale">▶ 播放收尾闭环</button>
          <button class="exit-btn" @click="exitScreen">✕ 退出大屏</button>
        </div>
      </div>
      <!-- A 区：园区体征条 -->
      <div class="vital" id="dashVital"></div>
      <div class="dash-grid">
        <!-- 左列：企业质量结构 + 政策服务成效 -->
        <div>
          <div class="dc"><h4><span class="l">企业质量结构</span><span class="r" @click="go('ops')">下钻运营后台 ›</span></h4>
            <div class="badges" id="dashBadges"></div>
            <div style="height:1px;background:rgba(90,150,230,.2);margin:7px 0"></div>
            <div class="donut-wrap">
              <div class="donut" id="donut1"><div class="cn"><b class="mono">1,326</b><span>园区企业</span></div></div>
              <div class="lg" id="lg1"></div>
            </div>
            <div class="priv-note" id="trackNote"></div>
          </div>
          <div class="dc" style="margin-top:8px"><h4><span class="l">政策服务成效</span><span class="r">本年累计</span></h4>
            <div class="big-num" id="dashKpi"></div>
            <div class="reach">
              <div class="rr"><div class="lb"><span>政策触达率</span><b id="reachTxt">82%</b></div>
              <div class="bb"><i id="reachBar"></i></div></div>
              <div class="rr"><div class="lb"><span>申报转化率</span><b>38.3%</b></div>
              <div class="bb"><i id="convBar"></i></div></div>
            </div>
          </div>
        </div>
        <!-- 中列：迁入迁出流动 + 特色榜单 -->
        <div>
          <div class="dc"><h4><span class="l">企业迁入迁出流动</span><span class="r">本季度 · 含去向</span></h4>
            <div class="flow">
              <div class="side i"><div class="lb">迁入 / 新设</div><div class="nb mono" id="flowIn">0</div></div>
              <div class="mid" id="flowMid">
                <div class="band" id="bandIn" style="top:4px;background:linear-gradient(90deg,rgba(23,169,122,.75),rgba(37,208,224,.5))"><span class="cap" id="capIn"></span></div>
                <div class="band" id="bandOut" style="bottom:4px;background:linear-gradient(90deg,rgba(224,72,60,.7),rgba(240,139,50,.45))"><span class="cap" id="capOut"></span></div>
              </div>
              <div class="side o"><div class="lb">迁出 / 注销</div><div class="nb mono" id="flowOut">0</div></div>
            </div>
            <h4 style="margin:2px 0 7px"><span class="l">迁出去向 TOP 5</span><span class="r">挽留策略依据</span></h4>
            <div class="flow-list" id="flowDest"></div>
          </div>
          <div class="dc" style="margin-top:8px"><h4><span class="l">园区特色榜单</span>
            <span class="rank-tabs" id="rankTabs">
              <button class="on" @click="switchRank('fund',$event.currentTarget)">补贴排行</button>
              <button @click="switchRank('track',$event.currentTarget)">行业排行</button>
              <button @click="switchRank('qual',$event.currentTarget)">资质新增</button>
            </span></h4>
            <div class="rank" id="dashRank"></div>
            <div class="priv-note" id="rankNote"></div>
          </div>
        </div>
        <!-- 右列：风险总览 + 企业动态 -->
        <div>
          <div class="dc"><h4><span class="l">企业风险总览</span><span class="r">AI 风险评判</span></h4>
            <div class="risk-nums" id="riskNums"></div>
            <div class="risk-bars" id="riskBars"></div>
            <div class="priv-note">🔒 大屏仅展示风险等级分布与处置进度，<b style="color:#a9ccf2">不展示具体企业名单</b>；企业明细与风险因子详情在运营后台按权限查看。</div>
          </div>
          <div class="dc" style="margin-top:8px"><h4><span class="l">园区企业动态</span><span class="r">实时</span></h4>
            <div class="roll" style="max-height:138px"><div class="rl" id="dashDyn"></div></div>
          </div>
        </div>
      </div>
      <!-- G 区：底部滚动播报 -->
      <div class="ticker" style="margin-top:7px;margin-bottom:0"><div class="tk" id="tk"></div></div>
    </div>
    <div id="toast"><span class="ic">✓</span><span id="toastTxt"></span></div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import request from '@/config/axios'

defineOptions({ name: 'ParkScreen' })

const router = useRouter()
const rootRef = ref<HTMLElement>()
let timers: number[] = []

const exitScreen = () => {
  if (window.history.length > 1) router.back()
  else router.push('/index')
}

onMounted(() => {
  const root = rootRef.value as HTMLElement
  const $ = (s: string) => root.querySelector(s) as HTMLElement | null
  const $$ = (s: string) => [...root.querySelectorAll(s)] as HTMLElement[]

  function toast(t: string) {
    const e = $('#toast'); const tx = $('#toastTxt'); if (!e || !tx) return
    tx.innerHTML = t; e.classList.add('on')
    clearTimeout((e as any)._t); (e as any)._t = setTimeout(() => e.classList.remove('on'), 2800)
  }
  function animateNums(scope: HTMLElement) {
    scope.querySelectorAll('[data-num]').forEach((el: any) => {
      const target = parseFloat(el.dataset.num), dec = (el.dataset.num.split('.')[1] || '').length
      const dur = 1000, t0 = performance.now()
      function step(t: number) {
        const p = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - p, 3)
        const v = target * e
        el.textContent = dec ? v.toFixed(dec) : Math.round(v).toLocaleString()
        if (p < 1) requestAnimationFrame(step)
      }
      requestAnimationFrame(step)
    })
  }
  function animateBars(scope: HTMLElement) {
    setTimeout(() => { scope.querySelectorAll('[data-w]').forEach((el: any) => (el.style.width = el.dataset.w + '%')) }, 60)
  }
  function go(_k: string) { toast('该模块请在完整系统中查看（当前为园区可视化大屏）') }

  /* ==================== 大屏数据 ==================== */
  const DASH_RANK = [
    { n: '深圳精测半导体设备', c: 9, a: '286 万', hero: false },
    { n: '深圳绿动新能源', c: 8, a: '243 万', hero: false },
    { n: '深圳市鹏芯光电', c: 7, a: '198 万', hero: false },
    { n: '深圳鲲鹏生物医药', c: 6, a: '176 万', hero: false },
    { n: '深圳智联工业互联', c: 6, a: '154 万', hero: false },
    { n: '深圳市湾芯智能科技', c: 4, a: '45 万', hero: true },
    { n: '深圳前海云智数据', c: 4, a: '92 万', hero: false },
    { n: '深圳湾创智能装备', c: 3, a: '78 万', hero: false },
    { n: '深圳启元材料科技', c: 3, a: '64 万', hero: false },
    { n: '深圳市宏图光学', c: 3, a: '58 万', hero: false }
  ]
  const DASH_DYN = [
    ['资质', '深圳精测半导体设备 新增<b>国家专精特新小巨人</b>认定', '09:38'],
    ['知产', '深圳市湾芯智能科技 新增<b>发明专利授权 2 件</b>（累计 18 件）', '09:31'],
    ['资质', '深圳绿动新能源 通过<b>知识产权贯标</b>认证', '09:22'],
    ['申报', '深圳鲲鹏生物医药 提交<b>研发投入资助</b>申报', '09:15'],
    ['到账', '深圳市鹏芯光电 高企奖补<b>14 万元到账</b>', '09:02'],
    ['资质', '深圳前海云智数据 入库<b>科技型中小企业</b>', '08:54'],
    ['知产', '深圳湾创智能装备 新增<b>实用新型 5 件</b>', '08:47']
  ]
  const DASH_VITAL = { co: 1326, addIn: 47, addNew: 29, moveIn: 18, out: 23, cancel: 9, moveOut: 14, insured: 38620, insuredUp: 4.2 }
  const DASH_DEST = [
    ['东莞松山湖片区', 5, '成本导向 · 制造扩产'],
    ['深圳市外其他城市', 4, '总部迁移'],
    ['龙岗坂田片区', 2, '就近扩租'],
    ['宝安新桥片区', 2, '厂房需求'],
    ['市内其他区园区', 1, '租约到期未续']
  ]
  const DASH_QUAL = [
    ['🏅', '国家高新技术企业', 386, '+22 本季'],
    ['⭐', '专精特新', 118, '国家级 26 / 省级 92'],
    ['📈', '上市企业', 23, 'A 股 14 / 港股 6 / 新三板 3'],
    ['🌐', '500 强关联', 11, '总部 3 / 子公司 8'],
    ['🏛', '国企央企', 34, '央属 9 / 省市属 25'],
    ['🏭', '规模以上企业', 162, '占比 12.2%']
  ]
  const DASH_RISK = { total: 96, high: 14, mid: 82, low: 214, none: 1016, newUp: 11, handled: 68, doing: 19, todo: 9 }
  const DASH_TRACK_RANK = [
    { n: 'AI 半导体 / 集成电路', c: 318, a: '6,240 万' },
    { n: '软件与信息服务', c: 286, a: '4,180 万' },
    { n: '高端装备制造', c: 214, a: '3,520 万' },
    { n: '其他产业', c: 170, a: '1,460 万' },
    { n: '生物医药', c: 176, a: '2,860 万' },
    { n: '新能源新材料', c: 162, a: '2,140 万' }
  ]
  const DASH_QUAL_RANK = [
    { n: 'AI 半导体 / 集成电路', c: 18, a: '高企 11 / 专精 7' },
    { n: '高端装备制造', c: 12, a: '高企 8 / 专精 4' },
    { n: '软件与信息服务', c: 10, a: '高企 7 / 专精 3' },
    { n: '生物医药', c: 8, a: '高企 5 / 专精 3' },
    { n: '新能源新材料', c: 7, a: '高企 4 / 专精 3' },
    { n: '其他产业', c: 3, a: '高企 2 / 专精 1' }
  ]

  let dashInited = false
  let rankMode = 'fund'

  function drawDonut(id: string, lgId: string, data: any[], _total: number) {
    const el = $('#' + id); if (!el) return
    const sum = data.reduce((s, d) => s + d[1], 0) || 1
    const segs: any[] = []; let acc = 0
    data.forEach((d) => { const from = (acc / sum) * 360; acc += d[1]; segs.push([d[2], from, (acc / sum) * 360]) })
    const paint = (k: number) => {
      const stops = segs.map((s) => s[0] + ' ' + (s[1] * k).toFixed(2) + 'deg ' + (s[2] * k).toFixed(2) + 'deg').join(',')
      el.style.background = 'conic-gradient(from -90deg,' + stops + ',rgba(90,150,230,.12) ' + (360 * k).toFixed(2) + 'deg 360deg)'
    }
    const t0 = performance.now(), dur = 900
    const step = (now: number) => { const r = Math.min(1, (now - t0) / dur); paint(1 - Math.pow(1 - r, 3)); if (r < 1) requestAnimationFrame(step) }
    paint(0); requestAnimationFrame(step)
    const lg = $('#' + lgId)
    if (lg) lg.innerHTML = data.map((d) => `<div class="l ${d[3] ? 'hero' : ''}"><i class="sq" style="background:${d[2]}"></i>
     <span>${d[0]}</span><span class="vl mono">${d[1]} 家 · ${((d[1] / sum) * 100).toFixed(1)}%</span></div>`).join('')
  }

  function renderRank() {
    let rk: any[], note: string, unit: (r: any) => string
    if (rankMode === 'fund') {
      rk = DASH_RANK.slice().sort((a, b) => b.c - a.c || parseInt(b.a) - parseInt(a.a))
      note = '按企业<b style="color:#ffd28a">累计获批补贴金额</b>降序 · 支持切换本年 / 累计口径'
      unit = (r) => `${r.c} 项 / ${r.a}`
    } else if (rankMode === 'track') {
      rk = DASH_TRACK_RANK.slice().sort((a, b) => b.c - a.c)
      note = '按<b style="color:#ffd28a">赛道企业数</b>降序 · 可切换赛道获批金额 / 净增数排序'
      unit = (r) => `${r.c} 家 / ${r.a}`
    } else {
      rk = DASH_QUAL_RANK.slice().sort((a, b) => b.c - a.c)
      note = '本季度<b style="color:#ffd28a">新增资质企业数</b>（QL-08）· 同时驱动喜报素材自动生成'
      unit = (r) => `${r.c} 家 · ${r.a}`
    }
    rk = rk.slice(0, 8)
    const mx = Math.max(...rk.map((r) => r.c))
    const box = $('#dashRank'); if (box) box.innerHTML = rk.map((r, i) => `<div class="r ${r.hero ? 'hero' : ''}">
     <span class="no">${i + 1}</span><span class="nm rank-ent" title="${r.n}" data-ent="${r.n}" style="cursor:pointer">${r.n}${r.hero ? ' ★' : ''}</span>
     <span class="bb"><i data-w="${Math.round((r.c / mx) * 100)}"></i></span>
     <span class="vv mono">${unit(r)}</span></div>`).join('')
    const nb = $('#rankNote'); if (nb) nb.innerHTML = note
    animateBars(root)
  }

  function switchRank(m: string, btn: HTMLElement) {
    rankMode = m
    $$('#rankTabs button').forEach((b) => b.classList.remove('on'))
    if (btn) btn.classList.add('on')
    renderRank()
  }
  ;(window as any).__pkSwitchRank = switchRank

  function initDash() {
    const V = DASH_VITAL, net = V.addIn - V.out
    const dv = $('#dashVital'); if (dv) dv.innerHTML = `
     <div class="v"><span class="k">🏢 在园企业总数</span><b class="n mono"><span data-num="${V.co}">0</span><em>家</em></b>
      <div class="d">3 个在营园区合计</div></div>
     <div class="v in"><span class="k">➡ 本季迁入 / 新设</span><b class="n mono"><span data-num="${V.addIn}">0</span><em>家</em></b>
      <div class="d">新设 ${V.addNew} · 迁入 ${V.moveIn}</div></div>
     <div class="v out"><span class="k">⬅ 本季迁出 / 注销</span><b class="n mono"><span data-num="${V.out}">0</span><em>家</em></b>
      <div class="d dn">注销 ${V.cancel} · 迁出 ${V.moveOut}</div></div>
     <div class="v"><span class="k">📊 净增企业</span><b class="n mono">+<span data-num="${net}">0</span><em>家</em></b>
      <div class="d">迁入减迁出</div></div>
     <div class="v"><span class="k">📈 企业增长率</span><b class="n mono"><span data-num="${((net / (V.co - net)) * 100).toFixed(1)}">0</span><em>%</em></b>
      <div class="d">环比上季 +0.6pct</div></div>
     <div class="v hl"><span class="k">👥 园区参保总人数</span><b class="n mono"><span data-num="${(V.insured / 10000).toFixed(2)}">0</span><em>万人</em></b>
      <div class="d">↑ 同比 +${V.insuredUp}%</div></div>`
    const db = $('#dashBadges'); if (db) db.innerHTML = DASH_QUAL.map((q) => `<div class="bg">
     <div class="t"><i>${q[0]}</i>${q[1]}</div>
     <div class="v mono">${q[2]}<em>家</em></div>
     <div class="s ${(q[3] as string).indexOf('+') === 0 ? '' : 'mut'}">${q[3]}</div></div>`).join('')
    const d1 = [['AI 半导体 / 集成电路', 318, '#1f7bd6', true], ['软件与信息服务', 286, '#25d0e0'], ['高端装备制造', 214, '#d9a13b'], ['生物医药', 176, '#17a97a'], ['新能源新材料', 162, '#7a63d8'], ['其他', 170, '#5d7290']]
    drawDonut('donut1', 'lg1', d1, V.co)
    const tn = $('#trackNote'); if (tn) tn.innerHTML = `主导产业集中度：前 3 大赛道合计 <b style="color:#ffd28a">${((818 / V.co) * 100).toFixed(1)}%</b> · 中小微企业占比 <b style="color:#ffd28a">86%</b>`
    const fi = $('#flowIn'); if (fi) fi.textContent = String(V.addIn)
    const fo = $('#flowOut'); if (fo) fo.textContent = String(V.out)
    const ci = $('#capIn'); if (ci) ci.textContent = `迁入 ${V.addIn} 家`
    const co = $('#capOut'); if (co) co.textContent = `迁出 ${V.out} 家`
    const mxF = Math.max(V.addIn, V.out)
    setTimeout(() => {
      const bi = $('#bandIn'); if (bi) bi.style.height = Math.round((V.addIn / mxF) * 33) + 'px'
      const bo = $('#bandOut'); if (bo) bo.style.height = Math.round((V.out / mxF) * 33) + 'px'
    }, 120)
    const mxD = Math.max(...DASH_DEST.map((d) => d[1] as number))
    const fd = $('#flowDest'); if (fd) fd.innerHTML = DASH_DEST.map((d) => `<div class="fr">
     <span class="nm" title="${d[2]}">${d[0]}</span>
     <span class="bb"><i data-w="${Math.round(((d[1] as number) / mxD) * 100)}"></i></span>
     <span class="vv mono">${d[1]} 家</span></div>`).join('')
    const R = DASH_RISK, hSum = R.handled + R.doing + R.todo
    const rn = $('#riskNums'); if (rn) rn.innerHTML = `
     <div class="rn warn"><div class="k">中高风险企业</div><div class="v mono">${R.total}<em style="font-size:11px;font-style:normal;color:#a9ccf2"> 家</em></div></div>
     <div class="rn warn"><div class="k">本季新增风险</div><div class="v mono">${R.newUp}<em style="font-size:11px;font-style:normal;color:#a9ccf2"> 家</em></div></div>
     <div class="rn ok"><div class="k">已处置缓解</div><div class="v mono">${R.handled}<em style="font-size:11px;font-style:normal;color:#a9ccf2"> 家</em></div></div>
     <div class="rn ok"><div class="k">风险处置率</div><div class="v mono">${Math.round((R.handled / hSum) * 100)}<em style="font-size:11px;font-style:normal;color:#a9ccf2"> %</em></div></div>`
    const lv = [['高风险', R.high, 'linear-gradient(90deg,#e0483c,#f0705f)'], ['中风险', R.mid, 'linear-gradient(90deg,#f08b32,#f3b06b)'],
      ['低风险', R.low, 'linear-gradient(90deg,#d9a13b,#f0c069)'], ['无风险', R.none, 'linear-gradient(90deg,#17a97a,#5ce0b0)']]
    const rb = $('#riskBars'); if (rb) rb.innerHTML = lv.map((l) => `<div class="rb">
     <div class="lb"><span>${l[0]}</span><b class="mono">${l[1]} 家 · ${(((l[1] as number) / V.co) * 100).toFixed(1)}%</b></div>
     <div class="bar"><i data-w="${(((l[1] as number) / V.co) * 100).toFixed(1)}" style="background:${l[2]}"></i></div></div>`).join('')
    renderRank()
    const dy = $('#dashDyn'); if (dy) dy.innerHTML = DASH_DYN.map((d) => `<div class="it"><span class="tg">${d[0]}</span>
     <div class="mn">${d[1]}<div class="dd">${d[2]}</div></div></div>`).join('')
    const kpi = $('#dashKpi'); if (kpi) kpi.innerHTML = `
     <div class="b"><span>政策触达企业</span><b><span data-num="1268">0</span><em>家</em></b><div class="up">↑ 触达率 82%</div></div>
     <div class="b"><span>申报企业数</span><b><span data-num="486">0</span><em>家</em></b><div class="up">↑ 转化率 38.3%</div></div>
     <div class="b"><span>获批项目</span><b><span data-num="312">0</span><em>项</em></b><div class="up">↑ 较上季 +36%</div></div>
     <div class="b hl"><span>补贴到账金额</span><b><span data-num="1.86">0</span><em>亿元</em></b><div class="up">预估总额 4.32 亿元</div></div>`
    setTimeout(() => { const r1 = $('#reachBar'); if (r1) r1.style.width = '82%'; const c1 = $('#convBar'); if (c1) c1.style.width = '38.3%' }, 120)
    const tk = $('#tk'); if (tk) tk.innerHTML = [...Array(2)].map(() =>
      `<span>🏢 在园企业 <b>1,326</b> 家 · 本季净增 <b>+${net}</b> 家</span>
       <span>🎥 政策宣讲直播覆盖率 <b>76%</b>（观看企业 1,008 家）</span>
       <span>🎯 招商线索池 <b>3,860</b> 条 · 本季签约落地 <b>17</b> 家</span>
       <span>📞 AI 累计触达企业 <b>2,140</b> 家 · 识别意向 <b>386</b> 家</span>
       <span>📮 政策触达率 <b>82%</b>（原 &lt;30%）</span>
       <span>💰 补贴到账 <b>1.86 亿元</b></span>
       <span>🗄 政策数据 <b>2,300 万+</b> 条 · 日更新 <b>29,966</b> 条</span>
       <span>⚡ AI 平均匹配响应 <b>0.8 秒</b></span>
       <span>🏙 在营园区 <b>3</b> 个（深圳湾生态园 512 / 创智天地 386 / 光明科技园 428）· 筹建 <b>1</b> 个</span>`).join('')
    animateNums(root)
    if (!dashInited) { dashInited = true; timers.push(window.setInterval(tickTime, 1000), window.setInterval(rollDyn, 3600)) }
  }

  function tickTime() {
    const el = $('#dashTime'); if (!el) return
    const base = new Date(2026, 7, 24, 9, 41, 26)
    base.setSeconds(base.getSeconds() + ((tickTime as any).n = ((tickTime as any).n || 0) + 1))
    const p = (n: number) => String(n).padStart(2, '0')
    el.textContent = `2026-08-24 ${p(base.getHours())}:${p(base.getMinutes())}:${p(base.getSeconds())}`
  }
  function rollDyn() {
    const box = $('#dashDyn'); if (!box) return
    if (box.firstElementChild) box.appendChild(box.firstElementChild)
  }
  function dashFinaleFn() {
    rankMode = 'fund'; $$('#rankTabs button').forEach((b, i) => b.classList.toggle('on', i === 0))
    const hero = DASH_RANK.find((r) => r.hero); if (hero) { hero.c = 6; hero.a = '173 万' }
    toast('湾芯科技研发资助 60 万 + 专精特新 30 万获批，累计到账 173 万，故事闭环 ✓')
    DASH_DYN.unshift(['到账', '深圳市湾芯智能科技 <b>研发投入资助 60 万元到账</b>（累计 173 万）', '09:42'])
    const fc = $('#footClose'); if (fc) fc.innerHTML = '累计补贴到账 173 万元，闭环完成 ✓'
    initDash()
    const first = $$('#dashDyn .it')[0]; if (first) first.classList.add('new')
    const heroRow = $('#dashRank .r.hero') as HTMLElement | null
    if (heroRow) { heroRow.scrollIntoView({ block: 'nearest' }); heroRow.style.transition = '.4s'; heroRow.style.background = 'rgba(190,140,40,.22)'; heroRow.style.borderRadius = '8px' }
  }
  ;(window as any).__pkDashFinale = dashFinaleFn

  // 绑定模板事件
  ;(root as any).__go = go
  // 初始化（先用内置数据同步渲染，保证大屏立即可见）
  initDash(); tickTime(); animateNums(root); animateBars(root)

  // 暴露给模板 @click（通过闭包）
  ;(rootRef as any)._api = { switchRank, dashFinale: dashFinaleFn, go }

  // 榜单企业名称点击 → 进入企业列表页
  const rankBox = root.querySelector('#dashRank')
  rankBox?.addEventListener('click', (e) => {
    const t = (e.target as HTMLElement).closest('[data-ent]')
    if (t) router.push({ path: '/park-enterprise-list', query: { name: t.getAttribute('data-ent') || '' } })
  })

  // 大屏等比缩放：按基准宽度(1600) 铺满视口，不同尺寸屏幕自适应
  const fitScreen = () => {
    const dash = root.querySelector('.dash') as HTMLElement | null
    if (!dash) return
    dash.style.transform = 'none'
    const scale = Math.min(window.innerWidth / dash.offsetWidth, window.innerHeight / dash.offsetHeight)
    dash.style.transform = `scale(${scale})`
  }
  fitScreen()
  setTimeout(fitScreen, 300) // 内容异步渲染后再校准一次
  window.addEventListener('resize', fitScreen)
  ;(rootRef as any)._fit = fitScreen

  // 异步拉取企业库真实统计（不阻塞首屏渲染）：覆盖「在园企业总数」+「园区特色榜单」后重渲
  request.get({ url: '/liqi/enterprise/stats' }).then((stats: any) => {
    if (stats && stats.total) {
      DASH_VITAL.co = stats.total
      if (Array.isArray(stats.topList) && stats.topList.length) {
        DASH_RANK.length = 0
        stats.topList.forEach((t: any, i: number) =>
          DASH_RANK.push({ n: t.name, c: Number(t.value) || 0, a: (t.value || 0) + ' 人', hero: i === 0 }))
      }
      initDash(); animateNums(root); animateBars(root)
      setTimeout(fitScreen, 100)
    }
  }).catch(() => {})
})

// 模板事件转发到 onMounted 内闭包
const switchRank = (m: string, btn: HTMLElement) => (rootRef as any)._api?.switchRank(m, btn)
const dashFinale = () => (rootRef as any)._api?.dashFinale()
const go = (k: string) => (rootRef as any)._api?.go(k)

onUnmounted(() => {
  timers.forEach((t) => clearInterval(t))
  const f = (rootRef as any)._fit
  if (f) window.removeEventListener('resize', f)
})
</script>

<style>
.pkscreen *{box-sizing:border-box;margin:0;padding:0}
.pkscreen{--navy:#04102a; --navy2:#071a3d; --navy3:#0b2450;
  --blue:#1863c7; --blue-d:#0b4694; --blue-l:#3f8ae0; --blue-fade:#e8f1fd;
  --gold:#d9a13b; --gold-l:#f0c069;
  --cyan:#25d0e0; --green:#17a97a; --red:#e0483c; --orange:#f08b32; --purple:#7a63d8;
  --ink:#0f1d33; --ink2:#3c4a63; --ink3:#7b879c; --line:#e3e8f0; --bg:#f2f5fa; --white:#fff;
  --r:14px; --sh:0 6px 24px rgba(12,38,80,.08); --sh2:0 12px 40px rgba(8,28,64,.14);}
.pkscreen,.pkscreen{height:100%}
.pkscreen{font-family:"Microsoft YaHei","PingFang SC","Hiragino Sans GB","Source Han Sans SC",system-ui,sans-serif;
  background:var(--bg);color:var(--ink);-webkit-font-smoothing:antialiased;overflow:hidden;
  position:fixed;inset:0;width:100vw;height:100vh;display:flex;align-items:center;justify-content:center}
.pkscreen button{font-family:inherit;cursor:pointer;border:none;background:none;color:inherit}
.pkscreen input,.pkscreen select{font-family:inherit}
.pkscreen ::-webkit-scrollbar{width:8px;height:8px}
.pkscreen ::-webkit-scrollbar-thumb{background:rgba(120,140,170,.35);border-radius:8px}
.pkscreen ::-webkit-scrollbar-track{background:transparent}
.pkscreen .mono{font-family:"DIN Alternate","Bahnschrift",Consolas,"SF Mono",monospace;font-variant-numeric:tabular-nums}
.pkscreen #app{display:flex;flex-direction:column;height:100vh}
.pkscreen #main{flex:1;overflow:hidden;position:relative}
.pkscreen .screen{display:none;height:100%;overflow:auto}
.pkscreen .screen.on{display:block}
.pkscreen .btn{display:inline-flex;align-items:center;justify-content:center;gap:6px;padding:9px 17px;border-radius:9px;font-size:13px;
  background:linear-gradient(135deg,#1c6bd0,#0c4693);transition:.18s}
.pkscreen .btn{background:linear-gradient(135deg,#1c6bd0,#0c4693);color:#fff;box-shadow:0 4px 14px rgba(21,90,180,.28)}
.pkscreen .btn:hover{transform:translateY(-1px);box-shadow:0 7px 18px rgba(21,90,180,.35)}
.pkscreen .btn.g{background:linear-gradient(135deg,#f0c069,#d9a13b);color:#3a2604;box-shadow:0 4px 14px rgba(200,145,40,.3)}
.pkscreen .btn.o{background:var(--white);color:var(--blue-d);border:1px solid #bcd4f2;box-shadow:none}
.pkscreen .btn.o:hover{background:var(--blue-fade)}
.pkscreen .btn.sm{padding:6px 12px;font-size:12px;border-radius:7px}
.pkscreen .btn.gh{background:transparent;color:var(--ink2);border:1px solid var(--line);box-shadow:none}
.pkscreen .btn.gh:hover{border-color:#b9cdea;color:var(--blue-d)}
.pkscreen .btn:disabled{opacity:.5;cursor:not-allowed;transform:none}
@keyframes fade{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:none}}
@keyframes pulse2{50%{transform:scale(1.15)}}
.pkscreen{background:radial-gradient(circle at 18% 8%,#0d2f60,#04102a 58%,#020a1c)}
.pkscreen .dash{width:1600px;flex:none;padding:7px 18px 6px;color:#dbe8fb;transform-origin:center center}
.pkscreen .dash-hd{display:flex;align-items:center;justify-content:space-between;gap:16px;padding:6px 14px;margin-bottom:7px;
  border-radius:13px;background:linear-gradient(90deg,rgba(13,58,125,.7),rgba(18,83,159,.42),rgba(13,58,125,.7));
  border:1px solid rgba(90,150,230,.28);flex-wrap:wrap}
.pkscreen .dash-hd h1{font-size:18px;letter-spacing:2px;color:#fff;display:flex;align-items:center;gap:9px}
.pkscreen .dash-hd h1 em{font-style:normal;font-size:11.5px;letter-spacing:1.5px;color:#7fb2e8;border-left:1px solid rgba(120,170,230,.4);padding-left:11px}
.pkscreen .dash-hd .rt{display:flex;align-items:center;gap:14px;font-size:11.5px;color:#8fb6e4}
.pkscreen .dash-hd .rt .lv{display:flex;align-items:center;gap:5px;color:#5ce0b0}
.pkscreen .dash-hd .rt .lv i{width:6px;height:6px;border-radius:50%;background:#5ce0b0;animation:pulse2 1.3s infinite}
.pkscreen .ticker{overflow:hidden;border-radius:9px;background:rgba(6,26,60,.6);border:1px solid rgba(90,150,230,.2);
  padding:4px 0;margin-bottom:7px;font-size:12px;color:#a7c8ee}
.pkscreen .ticker .tk{display:flex;gap:44px;white-space:nowrap;animation:slide 34s linear infinite;padding-left:20px}
@keyframes slide{to{transform:translateX(-50%)}}
.pkscreen .ticker .tk span b{color:#ffd28a}
.pkscreen .dash-grid{display:grid;grid-template-columns:1fr 1.32fr 1fr;gap:10px;align-items:start}
.pkscreen .dc{background:linear-gradient(160deg,rgba(10,38,84,.85),rgba(6,22,52,.9));border:1px solid rgba(88,148,228,.24);
  border-radius:12px;padding:10px 12px;position:relative;overflow:hidden}
.pkscreen .dc::before{content:"";position:absolute;left:0;top:0;width:100%;height:1px;
  background:linear-gradient(90deg,transparent,rgba(90,190,255,.6),transparent)}
.pkscreen .dc h4{font-size:13px;color:#e6f1ff;letter-spacing:1px;margin-bottom:8px;display:flex;align-items:center;gap:8px;justify-content:space-between}
.pkscreen .dc h4 .l{display:flex;align-items:center;gap:8px}
.pkscreen .dc h4 .l::before{content:"";width:3px;height:14px;background:linear-gradient(180deg,#25d0e0,#1863c7);border-radius:2px}
.pkscreen .dc h4 .r{font-size:11px;color:#7fa8d8;font-weight:400;cursor:pointer}
.pkscreen .dc h4 .r:hover{color:#a9ccf2}
.pkscreen .big-num{display:grid;grid-template-columns:repeat(2,1fr);gap:6px}
.pkscreen .big-num .b{background:rgba(15,52,110,.5);border:1px solid rgba(90,150,230,.2);border-radius:10px;padding:5px 9px;position:relative}
.pkscreen .big-num .b span{font-size:11px;color:#8fb6e4;display:block}
.pkscreen .big-num .b b{font-size:17.5px;color:#fff;letter-spacing:.5px;display:block;margin-top:1px}
.pkscreen .big-num .b b em{font-size:12px;font-style:normal;color:#a9ccf2;margin-left:2px;font-weight:400}
.pkscreen .big-num .b.hl b{background:linear-gradient(120deg,#ffe6b0,#f0b24f);-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent}
.pkscreen .big-num .b .up{font-size:9.5px;color:#5ce0b0;margin-top:1px}
.pkscreen .rank{display:grid;gap:6px}
.pkscreen .rank .r{display:flex;align-items:center;gap:9px;font-size:12px}
.pkscreen .rank .r .no{width:19px;height:19px;border-radius:5px;background:rgba(90,150,230,.2);color:#a9ccf2;
  display:grid;place-items:center;font-size:11px;font-weight:600;flex:0 0 auto}
.pkscreen .rank .r:nth-child(1) .no{background:linear-gradient(135deg,#f3c877,#d0942c);color:#3b2703}
.pkscreen .rank .r:nth-child(2) .no{background:linear-gradient(135deg,#d6dee9,#9fb0c4);color:#2b3546}
.pkscreen .rank .r:nth-child(3) .no{background:linear-gradient(135deg,#e0b184,#b1793f);color:#3b2703}
.pkscreen .rank .r .nm{flex:0 0 118px;color:#d3e4fa;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.pkscreen .rank .r .bb{flex:1;height:9px;border-radius:5px;background:rgba(90,150,230,.14);overflow:hidden}
.pkscreen .rank .r .bb i{display:block;height:100%;border-radius:5px;width:0;transition:width 1.1s cubic-bezier(.25,.9,.3,1);
  background:linear-gradient(90deg,#1f7bd6,#25d0e0)}
.pkscreen .rank .r.hero .bb i{background:linear-gradient(90deg,#d9a13b,#ffd98f)}
.pkscreen .rank .r.hero .nm{color:#ffd98f;font-weight:600}
.pkscreen .rank .r .vv{flex:0 0 86px;text-align:right;color:#ffd28a;font-size:12px}
.pkscreen .roll{max-height:138px;overflow:hidden;position:relative}
.pkscreen .roll .rl{display:grid;gap:6px}
.pkscreen .roll .rl .it{display:flex;gap:9px;align-items:flex-start;font-size:11.5px;color:#b7d2ef;
  background:rgba(15,52,110,.34);border-radius:9px;padding:7px 9px;border-left:2px solid rgba(90,190,255,.5)}
.pkscreen .roll .rl .it.new{border-left-color:#ffca6b;background:rgba(120,80,20,.28);animation:flash 1.6s 2}
@keyframes flash{50%{background:rgba(190,140,40,.4)}}
.pkscreen .roll .rl .it .tg{flex:0 0 auto;font-size:10.5px;padding:1px 6px;border-radius:4px;background:rgba(90,150,230,.24);color:#c6dcf6}
.pkscreen .roll .rl .it .mn{flex:1;line-height:1.6}
.pkscreen .roll .rl .it .mn b{color:#e9f3ff;font-weight:600}
.pkscreen .roll .rl .it .dd{font-size:10px;color:#84a9d6;margin-top:2px}
.pkscreen .donut-wrap{display:flex;gap:12px;align-items:center;flex-wrap:wrap}
.pkscreen .donut{width:86px;height:86px;border-radius:50%;position:relative;flex:0 0 auto}
.pkscreen .donut::after{content:"";position:absolute;inset:18px;border-radius:50%;background:#071c40;
  box-shadow:inset 0 0 22px rgba(0,0,0,.55)}
.pkscreen .donut .cn{position:absolute;inset:0;display:grid;place-items:center;z-index:2;text-align:center;line-height:1.3}
.pkscreen .donut .cn b{font-size:16px;color:#fff;display:block}
.pkscreen .donut .cn span{font-size:10.5px;color:#8fb6e4}
.pkscreen .lg{flex:1;min-width:150px;display:grid;grid-template-columns:1fr 1fr;gap:5px 10px}
.pkscreen .lg .l{display:flex;align-items:center;gap:6px;font-size:11px;color:#b7d2ef}
.pkscreen .lg .l .sq{width:9px;height:9px;border-radius:3px;flex:0 0 auto}
.pkscreen .lg .l .vl{margin-left:auto;color:#dbe8fb}
.pkscreen .lg .l.hero{color:#ffd98f;font-weight:600}
.pkscreen .reach{display:flex;align-items:center;gap:14px;margin-top:8px}
.pkscreen .reach .rr{flex:1}
.pkscreen .reach .rr .lb{display:flex;justify-content:space-between;font-size:11px;color:#8fb6e4;margin-bottom:3px}
.pkscreen .reach .rr .lb b{color:#5ce0b0}
.pkscreen .reach .rr .bb{height:8px;border-radius:5px;background:rgba(90,150,230,.16);overflow:hidden}
.pkscreen .reach .rr .bb i{display:block;height:100%;width:0;border-radius:5px;transition:width 1.2s;background:linear-gradient(90deg,#17a97a,#5ce0b0)}
.pkscreen .dash-foot{margin-top:7px;display:flex;gap:12px;flex-wrap:wrap;align-items:center;justify-content:space-between;
  background:rgba(10,38,84,.6);border:1px solid rgba(88,148,228,.22);border-radius:12px;padding:6px 13px}
.pkscreen .dash-foot .t{font-size:11.5px;color:#a7c8ee;line-height:1.5}
.pkscreen .dash-foot .t b{color:#ffd28a}
.pkscreen .vital{display:grid;grid-template-columns:repeat(6,1fr);gap:8px;margin-bottom:7px}
.pkscreen .vital .v{background:linear-gradient(160deg,rgba(12,44,96,.9),rgba(6,22,52,.92));border:1px solid rgba(88,148,228,.26);
  border-radius:11px;padding:5px 9px;position:relative;overflow:hidden}
.pkscreen .vital .v::before{content:"";position:absolute;left:0;top:0;width:100%;height:1px;
  background:linear-gradient(90deg,transparent,rgba(90,190,255,.55),transparent)}
.pkscreen .vital .v .k{font-size:11.5px;color:#8fb6e4;display:flex;align-items:center;gap:5px}
.pkscreen .vital .v .n{font-size:19px;color:#fff;letter-spacing:.5px;margin-top:2px;line-height:1.15;display:block}
.pkscreen .vital .v .n em{font-size:11.5px;font-style:normal;color:#a9ccf2;margin-left:3px;font-weight:400}
.pkscreen .vital .v .d{font-size:10px;margin-top:1px;color:#5ce0b0}
.pkscreen .vital .v .d.dn{color:#ff9b8e}
.pkscreen .vital .v.in .n{color:#7fe3b6}
.pkscreen .vital .v.out .n{color:#ffb1a4}
.pkscreen .vital .v.hl .n{background:linear-gradient(120deg,#ffe6b0,#f0b24f);-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent}
.pkscreen .badges{display:grid;grid-template-columns:repeat(3,1fr);gap:5px}
.pkscreen .badges .bg{background:rgba(15,52,110,.5);border:1px solid rgba(90,150,230,.22);border-radius:10px;padding:4px 7px}
.pkscreen .badges .bg .t{font-size:10.5px;color:#8fb6e4;display:flex;align-items:center;gap:4px}
.pkscreen .badges .bg .t i{font-style:normal}
.pkscreen .badges .bg .v{font-size:16px;color:#fff;margin-top:1px;line-height:1.2}
.pkscreen .badges .bg .v em{font-size:10.5px;font-style:normal;color:#a9ccf2;margin-left:2px;font-weight:400}
.pkscreen .badges .bg .s{font-size:9.5px;color:#5ce0b0;margin-top:1px}
.pkscreen .badges .bg .s.mut{color:#84a9d6}
.pkscreen .flow{display:flex;align-items:center;gap:10px;margin-bottom:8px}
.pkscreen .flow .side{flex:0 0 92px;text-align:center;border-radius:10px;padding:6px 5px;border:1px solid rgba(90,150,230,.24)}
.pkscreen .flow .side.i{background:rgba(20,110,80,.28)}
.pkscreen .flow .side.o{background:rgba(140,50,40,.26)}
.pkscreen .flow .side .lb{font-size:11px;color:#a9ccf2}
.pkscreen .flow .side .nb{font-size:19px;color:#fff;line-height:1.2}
.pkscreen .flow .mid{flex:1;position:relative;height:52px}
.pkscreen .flow .band{position:absolute;left:0;right:0;height:0;border-radius:6px;transition:height .9s cubic-bezier(.25,.9,.3,1)}
.pkscreen .flow .band .cap{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);font-size:10.5px;color:#eaf4ff;white-space:nowrap}
.pkscreen .flow-list{display:grid;gap:5px}
.pkscreen .flow-list .fr{display:flex;align-items:center;gap:9px;font-size:11px;color:#b7d2ef}
.pkscreen .flow-list .fr .nm{flex:0 0 128px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.pkscreen .flow-list .fr .bb{flex:1;height:8px;border-radius:5px;background:rgba(90,150,230,.14);overflow:hidden}
.pkscreen .flow-list .fr .bb i{display:block;height:100%;width:0;border-radius:5px;transition:width 1.1s cubic-bezier(.25,.9,.3,1);
  background:linear-gradient(90deg,#e0483c,#f08b32)}
.pkscreen .flow-list .fr .vv{flex:0 0 52px;text-align:right;color:#ffb1a4}
.pkscreen .risk-nums{display:grid;grid-template-columns:1fr 1fr;gap:7px}
.pkscreen .risk-nums .rn{background:rgba(15,52,110,.5);border:1px solid rgba(90,150,230,.2);border-radius:10px;padding:6px 9px}
.pkscreen .risk-nums .rn .k{font-size:11px;color:#8fb6e4}
.pkscreen .risk-nums .rn .v{font-size:18px;color:#fff;margin-top:1px}
.pkscreen .risk-nums .rn.warn .v{color:#ffb1a4}
.pkscreen .risk-nums .rn.ok .v{color:#7fe3b6}
.pkscreen .risk-bars{display:grid;gap:6px;margin-top:8px}
.pkscreen .risk-bars .rb{font-size:11px;color:#b7d2ef}
.pkscreen .risk-bars .rb .lb{display:flex;justify-content:space-between;margin-bottom:3px}
.pkscreen .risk-bars .rb .lb b{color:#dbe8fb}
.pkscreen .risk-bars .rb .bar{height:8px;border-radius:5px;background:rgba(90,150,230,.14);overflow:hidden}
.pkscreen .risk-bars .rb .bar i{display:block;height:100%;width:0;border-radius:5px;transition:width 1.1s cubic-bezier(.25,.9,.3,1)}
.pkscreen .priv-note{font-size:10px;color:#84a9d6;margin-top:6px;line-height:1.45;
  border-top:1px dashed rgba(90,150,230,.26);padding-top:5px}
.pkscreen .rank-tabs{display:flex;gap:6px}
.pkscreen .rank-tabs button{font-size:10.5px;padding:3px 9px;border-radius:20px;color:#a9ccf2;
  background:rgba(90,150,230,.16);border:1px solid rgba(90,150,230,.24);transition:.18s}
.pkscreen .rank-tabs button:hover{color:#e6f1ff}
.pkscreen .rank-tabs button.on{background:linear-gradient(135deg,#1c6bd0,#0d4a9c);color:#fff;border-color:rgba(120,180,255,.5)}
.pkscreen #toast{position:fixed;left:50%;bottom:38px;transform:translateX(-50%) translateY(20px);z-index:99;opacity:0;
  transition:.3s;background:rgba(6,26,60,.94);color:#eaf2ff;border-radius:11px;padding:13px 22px;font-size:13.5px;
  box-shadow:0 14px 34px rgba(4,16,40,.4);display:flex;align-items:center;gap:9px;pointer-events:none;max-width:80vw}
.pkscreen #toast.on{opacity:1;transform:translateX(-50%) translateY(0)}
.pkscreen #toast .ic{color:#5ce0b0;font-size:15px}
@media(max-width:1180px){.pkscreen .dash-grid{grid-template-columns:1fr}.pkscreen .vital{grid-template-columns:repeat(3,1fr)}}
/* —— 芋道全屏大屏根容器（覆盖侧栏/顶栏，脱离后台布局）—— */
.pkscreen{position:fixed;inset:0;z-index:3000;height:100%;width:100%;overflow:auto;
  background:radial-gradient(circle at 18% 8%,#0d2f60,#04102a 58%,#020a1c)}
.pkscreen .exit-btn{display:inline-flex;align-items:center;gap:5px;font-size:12px;color:#a9ccf2;
  background:rgba(90,150,230,.16);border:1px solid rgba(120,180,255,.35);border-radius:8px;padding:5px 12px;cursor:pointer;transition:.18s}
.pkscreen .exit-btn:hover{background:rgba(90,150,230,.3);color:#fff}
</style>
