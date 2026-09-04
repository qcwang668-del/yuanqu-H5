<!--
  智慧招商 · 产业链招商（找线索）
  流程：① 选产业（产业链图谱：产业›环节›赛道）→ ② 组合条件（产业默认条件置顶 + 241 字段叠加）→ ③ 筛客户群体
  上：产业主选区 + 满足下列(所有/任一)条件 + 添加条件 + 条件行（产业预置置顶高亮 / 按字段类型智能取值）+ 查询/清空
  下：结果工具条 + 空态漏斗插画
  「产业选择器」弹窗：左产业大类 / 右产业链图谱(上中下游泳道·赛道 chips)；「添加条件」弹窗：左一级分类 / 右字段 chips
  参考截图 1:1 还原；纯前端（查询展示空态/示例，不接后端），与地图招商/榜单招商同一模式。
-->
<template>
  <div class="chain-invest">
    <!-- ================= 产业主选区 ================= -->
    <div class="ci-industry">
      <!-- 未选产业：引导 -->
      <div v-if="!selectedIndustry" class="ind-guide">
        <div class="ind-guide-txt">
          <span class="ind-step">1</span>
          <span>请先选择<b>目标产业</b>，锁定园区招商方向后再组合条件筛选客户群体</span>
        </div>
        <el-button type="primary" @click="openIndustryDialog">选择产业</el-button>
      </div>
      <!-- 已选产业：面包屑 + 赛道标签 -->
      <div v-else class="ind-selected">
        <div class="ind-crumb">
          <span class="ind-label">目标产业</span>
          <span class="ind-name">{{ selectedIndustry.name }}</span>
          <template v-if="selectedTrackNames.length">
            <span class="ind-sep">›</span>
            <span v-for="t in selectedTrackNames" :key="t" class="ind-tag">{{ t }}</span>
          </template>
          <span v-else class="ind-tag ghost">全产业链</span>
        </div>
        <el-button text bg class="ind-change" @click="openIndustryDialog">更换产业</el-button>
      </div>
    </div>

    <!-- ================= 条件区 ================= -->
    <div class="ci-filter">
      <div class="ci-filter-top">
        <div class="ci-match">
          <span class="lb">满足下列</span>
          <el-select v-model="matchMode" class="match-sel" size="default">
            <el-option label="所有条件" value="all" />
            <el-option label="任一条件" value="any" />
          </el-select>
          <el-button class="add-btn" text bg @click="openDialog">添加条件</el-button>
        </div>
        <div class="ci-actions">
          <el-button type="primary" @click="onQuery">查询</el-button>
          <el-button @click="onClear">清空</el-button>
        </div>
      </div>

      <!-- 条件行：产业预置置顶高亮，其后为用户条件 -->
      <div v-if="orderedConditions.length" class="ci-cond-list">
        <div
          v-for="c in orderedConditions"
          :key="c.key"
          class="ci-cond-row"
          :class="{ 'from-industry': c.source === 'industry' }"
        >
          <span v-if="c.source === 'industry'" class="cond-badge" title="由所选产业自动带入，可编辑或删除">产业</span>
          <span v-else class="cond-idx">{{ matchMode === 'all' ? '且' : '或' }}</span>
          <span class="cond-name" :title="fullName(c)">{{ c.name }}</span>

          <!-- 操作符 -->
          <el-select v-model="c.op" class="cond-op" size="default" @change="onOpChange(c)">
            <el-option v-for="op in opOptions(c.type)" :key="op" :label="op" :value="op" />
          </el-select>

          <!-- 取值控件（按字段类型） -->
          <template v-if="c.type === 'bool'">
            <el-select v-model="c.value" class="cond-val" size="default" placeholder="请选择">
              <el-option label="是" value="是" />
              <el-option label="否" value="否" />
            </el-select>
          </template>

          <template v-else-if="c.type === 'daterange'">
            <el-date-picker
              v-if="c.op === '介于'"
              v-model="c.value"
              type="daterange"
              class="cond-val-wide"
              value-format="YYYY-MM-DD"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              size="default"
            />
            <el-date-picker
              v-else
              v-model="c.value"
              type="date"
              class="cond-val"
              value-format="YYYY-MM-DD"
              placeholder="选择日期"
              size="default"
            />
          </template>

          <template v-else-if="c.type === 'numrange'">
            <template v-if="c.op === '介于'">
              <el-input v-model="c.valueMin" class="cond-val-sm" size="default" placeholder="最小" />
              <span class="cond-tilde">~</span>
              <el-input v-model="c.valueMax" class="cond-val-sm" size="default" placeholder="最大" />
            </template>
            <el-input v-else v-model="c.value" class="cond-val" size="default" placeholder="请输入数值" />
          </template>

          <template v-else>
            <el-input v-model="c.value" class="cond-val-wide" size="default" placeholder="请输入" clearable />
          </template>

          <el-icon class="cond-del" title="删除条件" @click="removeCond(c)"><Close /></el-icon>
        </div>
      </div>
    </div>

    <!-- ================= 结果工具条 ================= -->
    <div class="ci-result-bar">
      <div class="rb-left">
        <el-checkbox v-model="selectAll" :disabled="total === 0">全选</el-checkbox>
        <span class="rb-count">已为您找到 <b>{{ total }}</b> 条数据</span>
      </div>
      <div class="rb-right">
        <el-select v-model="lockFilter" class="rb-lock" size="default">
          <el-option label="只看未解锁" value="unlocked" />
          <el-option label="只看已解锁" value="locked" />
          <el-option label="查看全部" value="all" />
        </el-select>
        <el-dropdown trigger="click" :disabled="total === 0">
          <el-button :disabled="total === 0">线索操作<el-icon class="el-icon--right"><ArrowDown /></el-icon></el-button>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item>批量解锁</el-dropdown-item>
              <el-dropdown-item>加入线索池</el-dropdown-item>
              <el-dropdown-item>导出线索</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
        <el-dropdown trigger="click" :disabled="total === 0">
          <el-button :disabled="total === 0">操作前5千条线索<el-icon class="el-icon--right"><ArrowDown /></el-icon></el-button>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item>操作前 1000 条</el-dropdown-item>
              <el-dropdown-item>操作前 5000 条</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
    </div>

    <!-- ================= 结果区 / 空态 ================= -->
    <div class="ci-result-body">
      <div class="ci-empty">
        <div class="funnel">
          <svg viewBox="0 0 160 150" width="180" height="170">
            <defs>
              <linearGradient id="fg" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stop-color="#a9c6ff" />
                <stop offset="1" stop-color="#4a86ff" />
              </linearGradient>
            </defs>
            <ellipse cx="80" cy="34" rx="52" ry="16" fill="#cfe0ff" opacity="0.7" />
            <path d="M30 40 L130 40 L92 96 L92 120 L68 120 L68 96 Z" fill="url(#fg)" opacity="0.92" />
            <rect x="60" y="120" width="40" height="16" rx="3" fill="#dbe8ff" />
            <rect x="70" y="126" width="20" height="12" rx="2" fill="#7aa6ff" />
            <rect x="88" y="10" width="12" height="12" rx="2" fill="#bcd3ff" transform="rotate(12 94 16)" />
            <rect x="104" y="18" width="10" height="10" rx="2" fill="#dfeaff" transform="rotate(-14 109 23)" />
            <rect x="50" y="12" width="11" height="11" rx="2" fill="#cfe0ff" transform="rotate(-8 55 17)" />
          </svg>
        </div>
        <div class="empty-txt">{{ selectedIndustry ? '多条件自由组合，一键过滤无效信息，筛选高质量线索' : '先选产业，再组合条件，精准筛选园区目标客户群体' }}</div>
      </div>
    </div>

    <!-- ================= 产业选择器弹窗 ================= -->
    <el-dialog
      v-model="industryDialogVisible"
      width="920px"
      :show-close="true"
      class="ci-dialog"
      align-center
      append-to-body
    >
      <template #header>
        <div class="dlg-title"><el-icon><Share /></el-icon><span>选择目标产业</span></div>
      </template>

      <div class="dlg-search">
        <el-input v-model="industrySearchKw" placeholder="搜索产业 / 环节 / 赛道" clearable class="dlg-kw" />
      </div>

      <div class="dlg-body">
        <!-- 左：产业大类 -->
        <div class="dlg-cats idlg-inds">
          <div
            v-for="ind in INDUSTRIES"
            :key="ind.id"
            class="dlg-cat"
            :class="{ on: activeIndustryId === ind.id }"
            @click="switchIndustry(ind.id)"
          >
            <div class="ind-cat-name">{{ ind.name }}</div>
            <div class="ind-cat-desc">{{ ind.desc }}</div>
          </div>
        </div>
        <!-- 右：产业链图谱（上中下游泳道 + 赛道 chips） -->
        <div class="dlg-fields idlg-graph">
          <div v-if="activeIndustry" class="graph-hd">
            {{ activeIndustry.name }} · 产业链图谱
            <span class="graph-tip">点选赛道以锁定招商方向（可多选；不选则按全产业链）</span>
          </div>
          <div v-for="node in filteredChain" :key="node.segment" class="lane">
            <span class="lane-lb" :class="node.segment">{{ SEGMENT_LABEL[node.segment] }}</span>
            <div class="lane-nodes">
              <span
                v-for="t in node.tracks"
                :key="t.key"
                class="chip"
                :class="{ on: draftTrackKeys.has(t.key) }"
                :title="t.keywords.join('、')"
                @click="toggleTrack(t.key)"
              >
                {{ t.name }}
              </span>
            </div>
          </div>
          <el-empty v-if="!filteredChain.length" description="未找到匹配的产业/赛道" :image-size="90" />
        </div>
      </div>

      <template #footer>
        <div class="dlg-footer">
          <span class="dlg-count">已选 <b>{{ draftTrackKeys.size }}</b> 个赛道（{{ activeIndustry?.name }}）</span>
          <div>
            <el-button @click="industryDialogVisible = false">取消</el-button>
            <el-button type="primary" @click="confirmIndustry">确认</el-button>
          </div>
        </div>
      </template>
    </el-dialog>

    <!-- ================= 添加条件弹窗 ================= -->
    <el-dialog
      v-model="dialogVisible"
      width="880px"
      :show-close="true"
      class="ci-dialog"
      align-center
      append-to-body
    >
      <template #header>
        <div class="dlg-title"><el-icon><Share /></el-icon><span>添加条件</span></div>
      </template>

      <div class="dlg-search">
        <el-input v-model="searchKw" placeholder="请输入条件名称搜索" clearable class="dlg-kw" />
        <el-button type="primary" @click="() => {}">查询</el-button>
        <el-button @click="searchKw = ''">清空</el-button>
      </div>

      <div class="dlg-body">
        <!-- 左：一级分类 -->
        <div class="dlg-cats">
          <div
            v-for="cat in FIELD_CATEGORIES"
            :key="cat.name"
            class="dlg-cat"
            :class="{ on: activeCat === cat.name }"
            @click="activeCat = cat.name"
          >
            {{ cat.name }}
          </div>
        </div>
        <!-- 右：二级分组 + 字段 chips -->
        <div class="dlg-fields">
          <template v-if="filteredGroups.length">
            <div v-for="grp in filteredGroups" :key="grp.name" class="dlg-grp">
              <div class="grp-name">{{ grp.name }}</div>
              <div class="grp-chips">
                <span
                  v-for="f in grp.fields"
                  :key="f.key"
                  class="chip"
                  :class="{ on: draftSel.has(f.key) }"
                  @click="toggleChip(f)"
                >
                  {{ f.name }}
                </span>
              </div>
            </div>
          </template>
          <el-empty v-else description="未找到匹配的条件" :image-size="90" />
        </div>
      </div>

      <template #footer>
        <div class="dlg-footer">
          <span class="dlg-count">已选择 <b>{{ draftSel.size }}</b> 个条件</span>
          <div>
            <el-button @click="dialogVisible = false">取消</el-button>
            <el-button type="primary" @click="confirmDialog">确认</el-button>
          </div>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { ArrowDown, Close, Share } from '@element-plus/icons-vue'
import { FIELD_CATEGORIES, type FieldItem, type FieldType } from './fields'
import { INDUSTRIES, SEGMENT_LABEL, aggregateTracks } from './industryChain'

defineOptions({ name: 'InvestmentChainInvest' })

const router = useRouter()

// ------- 条件行模型 -------
interface Condition {
  key: string
  name: string
  cat: string
  group: string
  type: FieldType
  op: string
  value: any
  valueMin?: string
  valueMax?: string
  source: 'industry' | 'user'
}

const matchMode = ref<'all' | 'any'>('all')
const conditions = reactive<Condition[]>([])

const orderedConditions = computed(() => [
  ...conditions.filter((c) => c.source === 'industry'),
  ...conditions.filter((c) => c.source === 'user')
])

// 各类型的操作符与默认值
const OP_MAP: Record<FieldType, string[]> = {
  bool: ['为'],
  daterange: ['介于', '早于', '晚于', '等于'],
  numrange: ['介于', '大于', '小于', '等于'],
  text: ['包含', '等于', '不包含']
}
const opOptions = (t: FieldType) => OP_MAP[t]
const defaultOp = (t: FieldType) => OP_MAP[t][0]
const onOpChange = (c: Condition) => {
  c.value = c.type === 'daterange' ? undefined : ''
  c.valueMin = ''
  c.valueMax = ''
}

const FIELD_INDEX = (() => {
  const map: Record<string, { name: string; cat: string; group: string; type: FieldType }> = {}
  for (const cat of FIELD_CATEGORIES) {
    for (const g of cat.groups) {
      for (const f of g.fields) {
        map[f.key] = { name: f.name, cat: cat.name, group: g.name, type: f.type }
      }
    }
  }
  return map
})()

const fullName = (c: Condition) => (c.source === 'industry' ? `产业带入 · ${c.name}` : `${c.cat} / ${c.group} / ${c.name}`)

const removeCond = (c: Condition) => {
  const i = conditions.findIndex((x) => x === c)
  if (i >= 0) conditions.splice(i, 1)
}

// ------- 产业选择 -------
const selectedIndustryId = ref('')
const selectedTrackKeys = ref<string[]>([])
const selectedIndustry = computed(() => INDUSTRIES.find((i) => i.id === selectedIndustryId.value) || null)
const selectedTrackNames = computed(() => aggregateTracks(selectedIndustryId.value, selectedTrackKeys.value).trackNames)

const industryDialogVisible = ref(false)
const activeIndustryId = ref(INDUSTRIES[0]?.id || '')
const activeIndustry = computed(() => INDUSTRIES.find((i) => i.id === activeIndustryId.value) || null)
const industrySearchKw = ref('')
const draftTrackKeys = reactive(new Set<string>())

const openIndustryDialog = () => {
  activeIndustryId.value = selectedIndustryId.value || INDUSTRIES[0]?.id || ''
  draftTrackKeys.clear()
  if (selectedIndustryId.value === activeIndustryId.value) selectedTrackKeys.value.forEach((k) => draftTrackKeys.add(k))
  industrySearchKw.value = ''
  industryDialogVisible.value = true
}
const switchIndustry = (id: string) => {
  if (activeIndustryId.value === id) return
  activeIndustryId.value = id
  draftTrackKeys.clear() // 赛道归属单一产业，切换产业时重置选择
}
const toggleTrack = (key: string) => {
  if (draftTrackKeys.has(key)) draftTrackKeys.delete(key)
  else draftTrackKeys.add(key)
}
// 产业链图谱按搜索词过滤
const filteredChain = computed(() => {
  const ind = activeIndustry.value
  if (!ind) return []
  const kw = industrySearchKw.value.trim()
  return ind.chain
    .map((node) => ({
      segment: node.segment,
      tracks: kw ? node.tracks.filter((t) => t.name.includes(kw) || t.keywords.some((k) => k.includes(kw))) : node.tracks
    }))
    .filter((node) => node.tracks.length)
})

const confirmIndustry = () => {
  selectedIndustryId.value = activeIndustryId.value
  selectedTrackKeys.value = [...draftTrackKeys]
  injectIndustryConditions()
  industryDialogVisible.value = false
  ElMessage.success(`已锁定产业「${selectedIndustry.value?.name}」，已带入产业默认条件`)
}

// 选产业 → 注入/刷新产业默认条件（置顶、source=industry）
const injectIndustryConditions = () => {
  // 先移除旧的产业条件
  for (let i = conditions.length - 1; i >= 0; i--) {
    if (conditions[i].source === 'industry') conditions.splice(i, 1)
  }
  const agg = aggregateTracks(selectedIndustryId.value, selectedTrackKeys.value)
  const groupLabel = agg.trackNames.length ? agg.trackNames.join('、') : `${agg.industryName}（全产业链）`
  const injected: Condition[] = []
  if (agg.codes.length) {
    injected.push({
      key: 'ind:code', name: '所属行业', cat: '产业', group: groupLabel, type: 'text',
      op: '包含', value: agg.codes.join('、'), valueMin: '', valueMax: '', source: 'industry'
    })
  }
  const kws = agg.keywords.length ? agg.keywords : [agg.industryName]
  injected.push({
    key: 'ind:kw', name: '经营范围', cat: '产业', group: groupLabel, type: 'text',
    op: '包含', value: kws.join('、'), valueMin: '', valueMax: '', source: 'industry'
  })
  conditions.unshift(...injected)
}

// ------- 结果区（纯前端，暂无真实数据）-------
const total = ref(0)
const selectAll = ref(false)
const lockFilter = ref<'unlocked' | 'locked' | 'all'>('unlocked')

const onQuery = () => {
  if (!selectedIndustry.value) {
    ElMessage.warning('请先选择目标产业')
    return
  }
  const invalid = orderedConditions.value.find((c) => !hasValue(c))
  if (invalid) {
    ElMessage.warning(`条件「${invalid.name}」尚未填写取值`)
    return
  }
  total.value = 0
  selectAll.value = false
  const indName = selectedIndustry.value.name
  ElMessage.success(`已按产业「${indName}」+ ${orderedConditions.value.length} 个条件查询，正在打开目标企业清单`)
  // 产业链筛选 → 统一进入企业清单页进行圈选、加入待联系
  router.push({
    path: '/park-enterprise-list',
    query: { name: `产业链·${indName}`, source: `产业链招商·${indName}` }
  })
}
const hasValue = (c: Condition) => {
  if (c.type === 'numrange' && c.op === '介于') return c.valueMin !== '' || c.valueMax !== ''
  if (c.type === 'daterange' && c.op === '介于') return Array.isArray(c.value) && c.value.length === 2
  return c.value !== '' && c.value !== undefined && c.value !== null
}
const onClear = () => {
  // 仅清用户条件，保留产业主轴与产业预置条件
  for (let i = conditions.length - 1; i >= 0; i--) {
    if (conditions[i].source === 'user') conditions.splice(i, 1)
  }
  total.value = 0
  selectAll.value = false
}

// ------- 添加条件弹窗 -------
const dialogVisible = ref(false)
const activeCat = ref(FIELD_CATEGORIES[0]?.name || '')
const searchKw = ref('')
const draftSel = reactive(new Set<string>())

const openDialog = () => {
  draftSel.clear()
  conditions.filter((c) => c.source === 'user').forEach((c) => draftSel.add(c.key))
  searchKw.value = ''
  activeCat.value = FIELD_CATEGORIES[0]?.name || ''
  dialogVisible.value = true
}

const filteredGroups = computed(() => {
  const kw = searchKw.value.trim()
  const cat = FIELD_CATEGORIES.find((c) => c.name === activeCat.value)
  if (!cat) return []
  if (!kw) return cat.groups
  return cat.groups
    .map((g) => ({ name: g.name, fields: g.fields.filter((f) => f.name.includes(kw)) }))
    .filter((g) => g.fields.length)
})

const toggleChip = (f: FieldItem) => {
  if (draftSel.has(f.key)) draftSel.delete(f.key)
  else draftSel.add(f.key)
}

const confirmDialog = () => {
  // 仅同步用户条件；产业条件不受影响
  const selKeys = new Set(draftSel)
  for (let i = conditions.length - 1; i >= 0; i--) {
    if (conditions[i].source === 'user' && !selKeys.has(conditions[i].key)) conditions.splice(i, 1)
  }
  const existing = new Set(conditions.filter((c) => c.source === 'user').map((c) => c.key))
  for (const key of selKeys) {
    if (existing.has(key)) continue
    const info = FIELD_INDEX[key]
    if (!info) continue
    conditions.push({
      key,
      name: info.name,
      cat: info.cat,
      group: info.group,
      type: info.type,
      op: defaultOp(info.type),
      value: info.type === 'daterange' ? undefined : info.type === 'bool' ? '是' : '',
      valueMin: '',
      valueMax: '',
      source: 'user'
    })
  }
  dialogVisible.value = false
}
</script>

<style lang="scss" scoped>
.chain-invest {
  display: flex;
  flex-direction: column;
  gap: 12px;
  min-height: calc(100vh - 120px);
}

/* ---------- 产业主选区 ---------- */
.ci-industry {
  padding: 14px 20px;
  background: linear-gradient(90deg, #eef4ff, #f7faff);
  border: 1px solid #dbe7ff;
  border-radius: 8px;
}
.ind-guide {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;

  .ind-guide-txt {
    display: flex;
    align-items: center;
    gap: 10px;
    font-size: 14px;
    color: #495570;
  }
  .ind-step {
    width: 22px;
    height: 22px;
    line-height: 22px;
    text-align: center;
    border-radius: 50%;
    background: #2f7bff;
    color: #fff;
    font-size: 13px;
    flex-shrink: 0;
  }
}
.ind-selected {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;

  .ind-crumb {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 8px;
  }
  .ind-label {
    font-size: 13px;
    color: #8a93a6;
  }
  .ind-name {
    font-size: 16px;
    font-weight: 600;
    color: #1f2d3d;
  }
  .ind-sep {
    color: #b6c2da;
  }
  .ind-tag {
    padding: 2px 10px;
    font-size: 13px;
    color: #2f7bff;
    background: #fff;
    border: 1px solid #a9c6ff;
    border-radius: 12px;

    &.ghost {
      color: #909399;
      border-color: #dcdfe6;
    }
  }
  .ind-change {
    color: #2f7bff;
    flex-shrink: 0;
  }
}

/* ---------- 条件区 ---------- */
.ci-filter {
  padding: 16px 20px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04);
}
.ci-filter-top {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
}
.ci-match {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;

  .lb {
    font-size: 14px;
    color: #606266;
  }
  .match-sel {
    width: 180px;
  }
  .add-btn {
    color: #2f7bff;
    font-weight: 500;
  }
}
.ci-actions {
  display: flex;
  gap: 8px;
  flex-shrink: 0;
}

.ci-cond-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-top: 16px;
  padding-top: 14px;
  border-top: 1px dashed #ebeef5;
}
.ci-cond-row {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 4px 0;

  &.from-industry {
    background: #f3f8ff;
    border-radius: 6px;
    padding: 6px 8px;
    margin: -2px 0;
  }

  .cond-idx {
    width: 22px;
    height: 22px;
    line-height: 22px;
    text-align: center;
    font-size: 12px;
    color: #2f7bff;
    background: #eaf2ff;
    border-radius: 4px;
    flex-shrink: 0;
  }
  .cond-badge {
    height: 22px;
    line-height: 22px;
    padding: 0 8px;
    font-size: 12px;
    color: #fff;
    background: #2f7bff;
    border-radius: 4px;
    flex-shrink: 0;
  }
  .cond-name {
    min-width: 150px;
    max-width: 220px;
    font-size: 14px;
    color: #303133;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .cond-op {
    width: 96px;
    flex-shrink: 0;
  }
  .cond-val {
    width: 200px;
  }
  .cond-val-wide {
    width: 280px;
  }
  .cond-val-sm {
    width: 120px;
  }
  .cond-tilde {
    color: #909399;
  }
  .cond-del {
    color: #c0c4cc;
    cursor: pointer;
    font-size: 16px;

    &:hover {
      color: #f56c6c;
    }
  }
}

/* ---------- 结果工具条 ---------- */
.ci-result-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 20px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04);
}
.rb-left {
  display: flex;
  align-items: center;
  gap: 16px;

  .rb-count {
    font-size: 14px;
    color: #606266;

    b {
      color: #2f7bff;
      padding: 0 2px;
    }
  }
}
.rb-right {
  display: flex;
  align-items: center;
  gap: 10px;

  .rb-lock {
    width: 130px;
  }
}

/* ---------- 结果区 / 空态 ---------- */
.ci-result-body {
  flex: 1;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04);
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 340px;
}
.ci-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 14px;

  .empty-txt {
    font-size: 14px;
    color: #b6bcc6;
  }
}

/* ---------- 弹窗（通用） ---------- */
.dlg-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
  font-weight: 600;
  color: #303133;

  .el-icon {
    color: #2f7bff;
  }
}
.dlg-search {
  display: flex;
  gap: 8px;
  margin-bottom: 12px;

  .dlg-kw {
    flex: 1;
  }
}
.dlg-body {
  display: flex;
  height: 440px;
  border: 1px solid #ebeef5;
  border-radius: 6px;
  overflow: hidden;
}
.dlg-cats {
  width: 132px;
  flex-shrink: 0;
  background: #f7f9fc;
  overflow-y: auto;
  border-right: 1px solid #ebeef5;

  .dlg-cat {
    padding: 12px 14px;
    font-size: 14px;
    color: #606266;
    cursor: pointer;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;

    &:hover {
      color: #2f7bff;
    }
    &.on {
      color: #2f7bff;
      background: #fff;
      font-weight: 500;
      box-shadow: inset 3px 0 0 #2f7bff;
    }
  }
}
.dlg-fields {
  flex: 1;
  padding: 8px 16px 16px;
  overflow-y: auto;
}
.dlg-grp {
  margin-top: 14px;

  .grp-name {
    font-size: 14px;
    font-weight: 600;
    color: #303133;
    margin-bottom: 10px;
  }
  .grp-chips {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
  }
}
.chip {
  padding: 6px 14px;
  font-size: 13px;
  color: #606266;
  background: #f4f6fa;
  border: 1px solid transparent;
  border-radius: 4px;
  cursor: pointer;
  user-select: none;
  transition: all 0.15s;

  &:hover {
    color: #2f7bff;
  }
  &.on {
    color: #2f7bff;
    background: #eaf2ff;
    border-color: #a9c6ff;
  }
}
.dlg-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;

  .dlg-count {
    font-size: 14px;
    color: #909399;

    b {
      color: #2f7bff;
      padding: 0 2px;
    }
  }
}

/* ---------- 产业选择器弹窗特有 ---------- */
.idlg-inds {
  width: 190px;

  .dlg-cat {
    padding: 12px 14px;
    line-height: 1.4;
    white-space: normal;

    .ind-cat-name {
      font-size: 14px;
      font-weight: 500;
    }
    .ind-cat-desc {
      font-size: 12px;
      color: #a0a6b2;
      margin-top: 3px;
    }
  }
}
.idlg-graph {
  .graph-hd {
    font-size: 15px;
    font-weight: 600;
    color: #303133;
    margin: 6px 0 14px;

    .graph-tip {
      font-size: 12px;
      font-weight: 400;
      color: #a0a6b2;
      margin-left: 8px;
    }
  }
  .lane {
    display: flex;
    align-items: flex-start;
    gap: 12px;
    padding: 12px 0;
    border-bottom: 1px dashed #eef1f6;

    &:last-child {
      border-bottom: none;
    }
  }
  .lane-lb {
    flex: 0 0 52px;
    text-align: center;
    color: #fff;
    font-size: 13px;
    font-weight: 600;
    border-radius: 6px;
    padding: 6px 0;

    &.up {
      background: #5b8def;
    }
    &.mid {
      background: #2f7bff;
    }
    &.down {
      background: #7aa6ff;
    }
  }
  .lane-nodes {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
  }
}
</style>
