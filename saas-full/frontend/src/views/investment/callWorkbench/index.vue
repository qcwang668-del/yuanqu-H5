<!--
  智慧招商 · AI 外呼工作台（待联系池）
  三大招商入口（榜单 / 产业链 / 地图）圈选的企业汇入此处：
  多号码逐个可拨 → AI 外呼 → 通话小结 → 一键推 CRM → 转化漏斗。
-->
<template>
  <div class="cw-page">
    <!-- 顶部统计 -->
    <div class="cw-stats">
      <div class="stat" v-for="s in statCards" :key="s.key" :style="{ '--c': s.color }">
        <div class="stat-num">{{ s.val }}</div>
        <div class="stat-lb">{{ s.label }}</div>
      </div>
    </div>

    <div class="cw-main">
      <!-- 左：待联系企业池 -->
      <div class="cw-list-wrap">
        <div class="cw-toolbar">
          <el-checkbox v-model="allChecked" :indeterminate="someChecked" @change="toggleAll">全选</el-checkbox>
          <span class="tb-cnt">已选 {{ checked.size }} / {{ store.list.length }}</span>
          <el-button
            type="primary"
            :icon="PhoneFilled"
            :disabled="checked.size === 0 || batch.running"
            :loading="batch.running"
            @click="startBatch"
          >
            一键AI外呼（{{ checked.size }}）
          </el-button>
          <el-input v-model="keyword" placeholder="筛选企业名称" clearable size="default" style="width: 180px" />
          <el-select v-model="statusFilter" placeholder="状态筛选" clearable size="default" style="width: 130px">
            <el-option v-for="o in STATUS_OPTS" :key="o.v" :label="o.t" :value="o.v" />
          </el-select>
          <div class="tb-right">
            <el-button text type="danger" :disabled="!store.list.length" @click="clearAll">清空</el-button>
          </div>
        </div>

        <!-- 批量外呼进度 -->
        <div v-if="batch.running || batch.done" class="cw-batch">
          <el-progress :percentage="batch.percent" :status="batch.done ? 'success' : ''" :stroke-width="14" />
          <span class="bt-txt">
            {{ batch.done ? '批量外呼完成' : `正在外呼：${batch.current}` }} ·
            接通 {{ batch.connected }} / 已拨 {{ batch.dialed }}
          </span>
        </div>

        <div class="cw-cards" v-loading="false">
          <el-empty v-if="filtered.length === 0" description="待联系池为空，请从榜单 / 产业链 / 地图招商圈选企业加入" />
          <div class="cw-card" :class="{ checked: checked.has(e.id) }" v-for="e in filtered" :key="e.id">
            <el-checkbox class="c-ck" :model-value="checked.has(e.id)" @change="(v) => toggle(e, v)" />
            <div class="c-logo" :style="{ background: e.logoColor }">{{ e.shortName }}</div>
            <div class="c-body">
              <div class="c-line1">
                <span class="c-name link" title="查看企业详情" @click="openDetail(e)">{{ e.enterpriseName }}</span>
                <el-tag size="small" :type="STATUS_TAG[e.status].type" effect="light">{{ STATUS_TAG[e.status].t }}</el-tag>
                <el-tag v-if="e.intent" size="small" :type="INTENT_TAG[e.intent]" effect="dark">意向 {{ e.intent }}</el-tag>
                <span class="c-src">来源：{{ e.source }}</span>
              </div>
              <div class="c-meta">
                <span v-if="e.legalPerson">法人：{{ e.legalPerson }}</span>
                <span v-if="e.industry">行业：{{ e.industry }}</span>
                <span v-if="e.registeredCapital">注册资本：{{ e.registeredCapital }}</span>
                <span>加入：{{ e.addedAt }}</span>
              </div>
              <!-- 多号码逐个可拨 -->
              <div class="c-phones">
                <div class="ph" v-for="p in e.phones" :key="p.number" :class="p.state">
                  <span class="ph-label">{{ p.label }}</span>
                  <span class="ph-num">{{ p.number }}</span>
                  <span v-if="p.state === 'connected'" class="ph-st ok">✓ 已接通</span>
                  <span v-else-if="p.state === 'called'" class="ph-st miss">已拨未通</span>
                  <el-button size="small" type="primary" :icon="PhoneFilled" plain @click="dial(e, p)">拨打</el-button>
                </div>
                <el-button class="ph-add" size="small" text @click="promptAddPhone(e)">+ 号码</el-button>
              </div>
            </div>
            <div class="c-ops">
              <el-popover v-if="e.records.length" placement="left" width="300" trigger="hover">
                <template #reference><el-button size="small" text>通话记录({{ e.records.length }})</el-button></template>
                <div class="rec-list">
                  <div class="rec-it" v-for="(r, i) in e.records" :key="i">
                    <span :class="r.connected ? 'ok' : 'miss'">{{ r.connected ? '接通' : '未通' }}</span>
                    <span>{{ r.phone }}</span>
                    <span v-if="r.intent">意向{{ r.intent }}</span>
                    <span class="rt">{{ r.at }}</span>
                    <div v-if="r.note" class="rn">{{ r.note }}</div>
                  </div>
                </div>
              </el-popover>
              <el-button
                size="small"
                type="success"
                :disabled="e.pushedCrm || e.status === 'pending'"
                @click="openCrm(e)"
              >{{ e.pushedCrm ? '✓ 已推CRM' : '推送CRM' }}</el-button>
              <el-button size="small" text type="danger" @click="store.remove(e.id)">移除</el-button>
            </div>
          </div>
        </div>
      </div>

      <!-- 右：转化漏斗 + CRM线索 -->
      <div class="cw-side">
        <div class="side-card">
          <div class="side-hd"><span class="bar"></span>转化漏斗</div>
          <div ref="funnelRef" class="funnel"></div>
        </div>
        <div class="side-card grow">
          <div class="side-hd"><span class="bar"></span>已推 CRM 线索（{{ store.clues.length }}）</div>
          <div class="clue-list">
            <el-empty v-if="!store.clues.length" description="暂无，接通高意向后推送 CRM" :image-size="60" />
            <div class="clue-it" v-for="c in store.clues" :key="c.id">
              <div class="cl-top">
                <span class="cl-name">{{ c.enterpriseName }}</span>
                <el-tag size="small" :type="INTENT_TAG[c.intent] || 'info'" effect="dark">意向{{ c.intent || '-' }}</el-tag>
              </div>
              <div class="cl-meta">负责人：{{ c.owner }} · 下次跟进：{{ c.nextFollow || '待定' }}</div>
              <div class="cl-meta">来源：{{ c.source }} · {{ c.at }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 企业详情抽屉 -->
    <EnterpriseDrawer v-model="detailVisible" :enterprise="detailEnt" />

    <!-- 拨号弹窗 -->
    <DialDialog v-model="dialVisible" :ent="dialEnt" :phone="dialPhone" @done="onDialDone" />

    <!-- 推 CRM 弹窗 -->
    <el-dialog v-model="crmVisible" title="推送到 CRM · 生成跟进线索" width="440px">
      <el-form label-width="88px">
        <el-form-item label="企业"><b>{{ crmEnt?.enterpriseName }}</b></el-form-item>
        <el-form-item label="意向分级">
          <el-tag :type="INTENT_TAG[crmEnt?.intent] || 'info'" effect="dark">{{ crmEnt?.intent || '未分级' }}</el-tag>
        </el-form-item>
        <el-form-item label="负责人">
          <el-select v-model="crmForm.owner" style="width: 100%">
            <el-option v-for="o in OWNERS" :key="o" :label="o" :value="o" />
          </el-select>
        </el-form-item>
        <el-form-item label="下次跟进">
          <el-date-picker v-model="crmForm.nextFollow" type="date" value-format="YYYY-MM-DD" style="width: 100%" />
        </el-form-item>
        <el-form-item label="备注"><el-input v-model="crmForm.note" type="textarea" :rows="2" /></el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="crmVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmCrm">确认推送</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, onBeforeUnmount, reactive, ref, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { PhoneFilled } from '@element-plus/icons-vue'
import * as echarts from 'echarts'
import { useCallListStore } from '@/store/modules/callList'
import DialDialog from './DialDialog.vue'
import EnterpriseDrawer from '@/views/park/enterpriseList/EnterpriseDrawer.vue'
import { detailFromParkEntity } from '@/views/park/enterpriseList/enterpriseData'

defineOptions({ name: 'InvestmentCallWorkbench' })

const store = useCallListStore()

// 企业详情抽屉
const detailVisible = ref(false)
const detailEnt = ref<any>(null)
const openDetail = (e: any) => {
  detailEnt.value = detailFromParkEntity(e)
  detailVisible.value = true
}

const STATUS_OPTS = [
  { v: 'pending', t: '待联系' },
  { v: 'connected', t: '已接通' },
  { v: 'missed', t: '未接通' },
  { v: 'converted', t: '已转化' }
]
const STATUS_TAG: Record<string, { t: string; type: any }> = {
  pending: { t: '待联系', type: 'info' },
  calling: { t: '外呼中', type: 'warning' },
  connected: { t: '已接通', type: 'success' },
  missed: { t: '未接通', type: 'danger' },
  converted: { t: '已转化', type: 'primary' }
}
const INTENT_TAG: Record<string, any> = { A: 'danger', B: 'warning', C: 'info' }
const OWNERS = ['招商专员·王敏', '招商专员·李强', '招商专员·陈静', '招商主管·赵磊']

// ------- 统计卡 -------
const statCards = computed(() => {
  const f = store.funnel
  return [
    { key: 'added', label: '待联系企业', val: f.added, color: '#2f6fe0' },
    { key: 'called', label: '已外呼', val: f.called, color: '#e6a23c' },
    { key: 'connected', label: '已接通', val: f.connected, color: '#58c0a8' },
    { key: 'intent', label: '高/中意向', val: f.intent, color: '#e0483c' },
    { key: 'converted', label: '已推CRM', val: f.converted, color: '#8a5cf0' }
  ]
})

// ------- 筛选 -------
const keyword = ref('')
const statusFilter = ref('')
const filtered = computed(() =>
  store.list.filter(
    (e) =>
      (!keyword.value || e.enterpriseName.includes(keyword.value)) &&
      (!statusFilter.value || e.status === statusFilter.value)
  )
)

// ------- 多选 -------
const checked = reactive(new Set<any>())
const toggle = (e: any, v: any) => (v ? checked.add(e.id) : checked.delete(e.id))
const allChecked = computed(() => filtered.value.length > 0 && filtered.value.every((e) => checked.has(e.id)))
const someChecked = computed(() => checked.size > 0 && !allChecked.value)
const toggleAll = (v: any) => {
  if (v) filtered.value.forEach((e) => checked.add(e.id))
  else checked.clear()
}

// ------- 单个拨打 -------
const dialVisible = ref(false)
const dialEnt = ref<any>(null)
const dialPhone = ref<any>(null)
const dial = (e: any, p: any) => {
  dialEnt.value = e
  dialPhone.value = p
  dialVisible.value = true
}
const onDialDone = (payload: { connected: boolean; intent: any; note: string; duration: number }) => {
  if (!dialEnt.value || !dialPhone.value) return
  store.recordCall(dialEnt.value.id, dialPhone.value.number, payload)
  ElMessage.success(payload.connected ? '通话已接通，记录已保存' : '已记录：未接通')
}

const promptAddPhone = async (e: any) => {
  try {
    const { value } = await ElMessageBox.prompt('请输入新增联系号码', '新增号码', {
      inputPattern: /\d{6,}/,
      inputErrorMessage: '请输入有效号码'
    })
    store.addPhone(e.id, value)
    ElMessage.success('已新增号码')
  } catch {}
}

// ------- 批量外呼（自动模拟） -------
const batch = reactive({ running: false, done: false, percent: 0, dialed: 0, connected: 0, current: '' })
let batchTimer: any = null
const startBatch = () => {
  const targets = store.list.filter((e) => checked.has(e.id) && e.phones.some((p) => p.state === 'idle'))
  if (!targets.length) {
    ElMessage.warning('所选企业均无可拨号码')
    return
  }
  batch.running = true
  batch.done = false
  batch.percent = 0
  batch.dialed = 0
  batch.connected = 0
  let i = 0
  const step = () => {
    if (i >= targets.length) {
      batch.running = false
      batch.done = true
      batch.current = ''
      ElMessage.success(`批量外呼完成：接通 ${batch.connected} / ${batch.dialed}`)
      return
    }
    const e = targets[i]
    batch.current = e.enterpriseName
    const phone = e.phones.find((p) => p.state === 'idle') || e.phones[0]
    // 加权随机：约 60% 接通，接通里 A/B/C
    const connected = pseudo(e.id, i) < 0.6
    const intent = connected ? (['A', 'B', 'B', 'C'] as const)[Math.floor(pseudo(e.id, i + 9) * 4)] : ''
    store.recordCall(e.id, phone.number, {
      connected,
      intent,
      note: connected ? 'AI 外呼已接通，自动记录意向' : '无人接听',
      duration: connected ? 40 + Math.floor(pseudo(e.id, i + 3) * 80) : 6
    })
    batch.dialed++
    if (connected) batch.connected++
    i++
    batch.percent = Math.round((i / targets.length) * 100)
    batchTimer = setTimeout(step, 650)
  }
  step()
}
// 确定性伪随机（避免依赖 Math.random 抖动）
const pseudo = (id: any, salt: number) => {
  const n = (Number(String(id).replace(/\D/g, '').slice(-6)) || 1) * 9301 + salt * 49297
  return ((n % 233280) / 233280 + 0.37) % 1
}

const clearAll = async () => {
  try {
    await ElMessageBox.confirm('确认清空待联系池？', '提示', { type: 'warning' })
    store.clearAll()
    checked.clear()
    ElMessage.success('已清空')
  } catch {}
}

// ------- 推 CRM -------
const crmVisible = ref(false)
const crmEnt = ref<any>(null)
const crmForm = reactive({ owner: OWNERS[0], nextFollow: '', note: '' })
const openCrm = (e: any) => {
  crmEnt.value = e
  crmForm.owner = OWNERS[0]
  crmForm.nextFollow = ''
  crmForm.note = e.note || ''
  crmVisible.value = true
}
const confirmCrm = () => {
  if (!crmEnt.value) return
  crmEnt.value.note = crmForm.note
  store.pushToCrm(crmEnt.value.id, { owner: crmForm.owner, nextFollow: crmForm.nextFollow })
  crmVisible.value = false
  ElMessage.success('已推送至 CRM，生成跟进线索')
}

// ------- 漏斗图 -------
const funnelRef = ref<HTMLElement>()
let chart: echarts.ECharts | null = null
const renderFunnel = () => {
  if (!chart) return
  const f = store.funnel
  chart.setOption({
    tooltip: { trigger: 'item', formatter: '{b}: {c}' },
    series: [
      {
        type: 'funnel',
        left: 6,
        right: 6,
        top: 10,
        bottom: 10,
        minSize: '24%',
        gap: 3,
        label: { position: 'inside', color: '#fff', fontSize: 12 },
        data: [
          { value: Math.max(f.added, 1), name: `加入待联系 ${f.added}`, itemStyle: { color: '#2f6fe0' } },
          { value: Math.max(f.called, 0.6), name: `已外呼 ${f.called}`, itemStyle: { color: '#e6a23c' } },
          { value: Math.max(f.connected, 0.4), name: `已接通 ${f.connected}`, itemStyle: { color: '#58c0a8' } },
          { value: Math.max(f.intent, 0.25), name: `高/中意向 ${f.intent}`, itemStyle: { color: '#e0483c' } },
          { value: Math.max(f.converted, 0.12), name: `已转化 ${f.converted}`, itemStyle: { color: '#8a5cf0' } }
        ]
      }
    ]
  })
}
watch(() => store.funnel, renderFunnel, { deep: true })
const onResize = () => chart?.resize()

onMounted(() => {
  nextTick(() => {
    if (funnelRef.value) {
      chart = echarts.init(funnelRef.value)
      renderFunnel()
      window.addEventListener('resize', onResize)
    }
  })
})
onBeforeUnmount(() => {
  clearTimeout(batchTimer)
  window.removeEventListener('resize', onResize)
  chart?.dispose()
})
</script>

<style scoped>
.cw-page { padding: 16px 20px; background: #f4f6fb; min-height: 100%; }
.cw-stats { display: flex; gap: 14px; margin-bottom: 14px; }
.stat {
  flex: 1; background: #fff; border-radius: 10px; padding: 14px 18px;
  border: 1px solid #eef1f6; border-left: 3px solid var(--c);
}
.stat-num { font-size: 26px; font-weight: 700; color: var(--c); line-height: 1.1; }
.stat-lb { font-size: 13px; color: #6b7a90; margin-top: 4px; }

.cw-main { display: flex; gap: 14px; align-items: stretch; }
.cw-list-wrap { flex: 1; min-width: 0; display: flex; flex-direction: column; }
.cw-toolbar {
  display: flex; align-items: center; gap: 12px; flex-wrap: wrap;
  background: #fff; border: 1px solid #eef1f6; border-radius: 10px; padding: 10px 14px; margin-bottom: 12px;
}
.tb-cnt { color: #909aa8; font-size: 13px; }
.tb-right { margin-left: auto; }
.cw-batch {
  display: flex; align-items: center; gap: 14px;
  background: #fff; border: 1px solid #eef1f6; border-radius: 10px; padding: 10px 16px; margin-bottom: 12px;
}
.cw-batch .el-progress { flex: 1; }
.bt-txt { flex: none; font-size: 13px; color: #6b7a90; }

.cw-cards { display: flex; flex-direction: column; gap: 12px; }
.cw-card {
  display: flex; align-items: flex-start; gap: 14px;
  background: #fff; border: 1px solid #eef1f6; border-radius: 10px; padding: 16px 18px;
  transition: 0.16s;
}
.cw-card:hover { box-shadow: 0 4px 16px rgba(30, 90, 200, 0.08); }
.cw-card.checked { border-color: #2f6fe0; background: #f6faff; }
.c-ck { margin-top: 4px; }
.c-logo {
  flex: none; width: 52px; height: 52px; border-radius: 9px;
  display: grid; place-items: center; color: #fff; font-weight: 700; font-size: 16px;
}
.c-body { flex: 1; min-width: 0; }
.c-line1 { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
.c-name { font-size: 16px; font-weight: 600; color: #1f2d3d; }
.c-name.link { color: #2f6fe0; cursor: pointer; }
.c-name.link:hover { text-decoration: underline; }
.c-src { font-size: 12px; color: #909aa8; margin-left: 4px; }
.c-meta { display: flex; flex-wrap: wrap; gap: 6px 22px; font-size: 12.5px; color: #6b7a90; margin: 8px 0 10px; }
.c-phones { display: flex; align-items: center; flex-wrap: wrap; gap: 8px; }
.ph {
  display: flex; align-items: center; gap: 8px;
  background: #f6f8fc; border: 1px solid #eef1f6; border-radius: 8px; padding: 5px 10px;
}
.ph.connected { border-color: #b6e3d5; background: #f0faf6; }
.ph.called { border-color: #f2c9c4; background: #fdf4f3; }
.ph-label { font-size: 11px; color: #909aa8; }
.ph-num { font-size: 13px; color: #1f2d3d; font-variant-numeric: tabular-nums; }
.ph-st { font-size: 11px; }
.ph-st.ok { color: #58c0a8; }
.ph-st.miss { color: #e0483c; }
.ph-add { color: #2f6fe0; }
.c-ops { flex: none; display: flex; flex-direction: column; gap: 8px; align-items: flex-end; }

.rec-list { max-height: 260px; overflow-y: auto; }
.rec-it { font-size: 12px; color: #6b7a90; padding: 6px 0; border-bottom: 1px dashed #eee; display: flex; flex-wrap: wrap; gap: 8px; }
.rec-it .ok { color: #58c0a8; }
.rec-it .miss { color: #e0483c; }
.rec-it .rt { margin-left: auto; color: #b0b8c4; }
.rec-it .rn { flex-basis: 100%; color: #33404f; }

.cw-side { flex: 0 0 320px; display: flex; flex-direction: column; gap: 14px; }
.side-card { background: #fff; border: 1px solid #eef1f6; border-radius: 10px; padding: 14px 16px; }
.side-card.grow { flex: 1; min-height: 0; display: flex; flex-direction: column; }
.side-hd { display: flex; align-items: center; font-size: 14px; font-weight: 600; color: #1f2d3d; margin-bottom: 10px; }
.side-hd .bar { width: 4px; height: 14px; background: #2d5af0; border-radius: 2px; margin-right: 8px; }
.funnel { width: 100%; height: 230px; }
.clue-list { flex: 1; overflow-y: auto; }
.clue-it { border: 1px solid #eef1f6; border-radius: 8px; padding: 10px 12px; margin-bottom: 10px; }
.cl-top { display: flex; align-items: center; justify-content: space-between; }
.cl-name { font-size: 13.5px; font-weight: 600; color: #1f2d3d; }
.cl-meta { font-size: 12px; color: #909aa8; margin-top: 4px; }
</style>
