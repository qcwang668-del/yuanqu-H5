<!--
  企业详情抽屉（参考截图 1:1）
  头部：logo + 名称 + 存续标签 + 资质标签 + 解锁人 + 关闭；企业快讯条；摘要栏
  标签页：基本信息 / 联系方式 / 项目申报（完整）| 人员投资 / 知识产权 / 经营信息 / 经营风险 / 企业发展（占位）
-->
<template>
  <el-drawer
    v-model="visible"
    :with-header="false"
    size="70%"
    direction="rtl"
    append-to-body
    class="ent-drawer"
    @closed="$emit('closed')"
  >
    <div v-if="ent" class="ent">
      <!-- ===== 头部 ===== -->
      <div class="ent-head">
        <div class="eh-top">
          <el-button
            v-if="enrichable"
            size="small"
            type="primary"
            plain
            :loading="enriching"
            class="eh-enrich"
            @click="$emit('enrich')"
          >{{ enriching ? '回填中…' : '刷新工商数据（天眼查）' }}</el-button>
          <span class="eh-unlock">解锁人：{{ unlockUser }}（{{ unlockTime }}）</span>
          <el-icon class="eh-close" @click="visible = false"><Close /></el-icon>
        </div>
        <div class="eh-main">
          <div class="eh-logo">{{ ent.logo }}</div>
          <div class="eh-info">
            <div class="eh-title">
              <span class="eh-name">{{ ent.name }}</span>
              <span class="eh-status">{{ ent.status }}</span>
              <el-icon class="eh-copy" title="复制"><CopyDocument /></el-icon>
            </div>
            <div class="eh-tags">
              <span v-for="tg in ent.tags" :key="tg" class="eh-tag">{{ tg }}</span>
              <span class="eh-more">查看更多 +{{ ent.moreTags }} ›</span>
            </div>
          </div>
        </div>
        <!-- 企业快讯 -->
        <div class="eh-news"><el-icon><ChatDotRound /></el-icon><span>企业快讯</span></div>
        <!-- 摘要栏 -->
        <div class="eh-summary">
          <div class="es-row">
            <span class="es-item"><i>法定代表人：</i>{{ ent.legalPerson }}</span>
            <span class="es-item"><i>注册资本：</i>{{ ent.regCapital }}</span>
            <span class="es-item"><i>统一社会信用代码：</i>{{ ent.creditCode }}</span>
          </div>
          <div class="es-row">
            <span class="es-item"><i>行业：</i>{{ ent.industry }}</span>
            <span class="es-item"><i>注册地址：</i>{{ ent.regAddress }}</span>
          </div>
          <div class="es-row scope">
            <span class="es-item full">
              <i>经营范围：</i>
              <span :class="{ ellipsis: !scopeOpen }">{{ ent.scope }}</span>
              <a class="es-toggle" @click="scopeOpen = !scopeOpen">{{ scopeOpen ? '收起' : '展开' }}</a>
            </span>
          </div>
        </div>
      </div>

      <!-- ===== 标签页 ===== -->
      <el-tabs v-model="activeTab" class="ent-tabs">
        <!-- 基本信息 -->
        <el-tab-pane label="基本信息" name="basic">
          <!-- ===== DaaS 实时工商信息（力企云企业数据平台，点击企业名自动按统一社会信用代码查询）===== -->
          <div class="daas-box" v-loading="daasLoading" element-loading-text="正在查询力企云企业数据平台…">
            <div class="daas-head">
              <span class="daas-title"><span class="bar"></span>工商信息（力企云数据平台 · 实时查询）</span>
              <el-button v-if="!daasLoading && isRealCreditCode(ent?.creditCode)" link type="primary" @click="loadDaas(ent?.creditCode)">刷新</el-button>
            </div>
            <div v-if="daasInfo" class="daas-grid">
              <div class="daas-item"><label>公司名称</label><span :title="daasInfo.companyName">{{ daasInfo.companyName }}</span></div>
              <div class="daas-item"><label>统一社会信用代码</label><span>{{ daasInfo.entityId }}</span></div>
              <div class="daas-item"><label>法定代表人</label><span>{{ daasInfo.legalName }}</span></div>
              <div class="daas-item"><label>经营状态</label><span class="daas-ok">{{ daasInfo.entStatus }}</span></div>
              <div class="daas-item"><label>注册资本</label><span>{{ daasInfo.regCapital != null ? daasInfo.regCapital + ' ' + (daasInfo.regCapitalType || '') : '-' }}</span></div>
              <div class="daas-item"><label>成立日期</label><span>{{ daasInfo.regDate }}</span></div>
              <div class="daas-item"><label>企业类型</label><span>{{ daasInfo.zcbComType }}</span></div>
              <div class="daas-item"><label>企业规模</label><span>{{ daasScaleText(daasInfo.companyScale) }}</span></div>
              <div class="daas-item"><label>参保人数</label><span>{{ daasInfo.socialStaffNum != null ? daasInfo.socialStaffNum + ' 人' : '-' }}</span></div>
              <div class="daas-item"><label>工商注册号</label><span>{{ daasInfo.licenseNumber }}</span></div>
              <div class="daas-item"><label>所属行业</label><span>{{ [daasInfo.industryLv1Name, daasInfo.industryLv2Name, daasInfo.industryLv3Name, daasInfo.industryLv4Name].filter(Boolean).join(' / ') }}</span></div>
              <div class="daas-item"><label>登记机关</label><span>{{ daasInfo.regOrg }}</span></div>
              <div class="daas-item daas-full"><label>注册地址</label><span :title="daasInfo.regAddress">{{ daasInfo.regAddress }}</span></div>
              <div class="daas-item daas-full"><label>经营范围</label><span class="daas-scope">{{ daasInfo.opScope }}</span></div>
              <div class="daas-item" v-if="daasInfo.finalShowInfo && daasInfo.finalShowInfo.length"><label>荣誉资质</label><span>{{ daasInfo.finalShowInfo.join('；') }}</span></div>
            </div>
            <div v-else-if="!daasLoading && daasError" class="daas-empty">
              企业数据平台查询失败，请稍后重试。
            </div>
            <div v-else-if="!daasLoading && daasEmpty" class="daas-empty">
              <template v-if="isRealCreditCode(ent?.creditCode)">
                力企云数据平台暂未覆盖该企业（统一社会信用代码：{{ ent?.creditCode }}）。<b>深圳地区企业数据正在开通中</b>，开通后点击「刷新」即可获取真实工商信息。
              </template>
              <template v-else>该企业暂无有效的统一社会信用代码，无法查询工商信息。</template>
            </div>
          </div>

          <div class="basic-grid">
            <div class="bg-col">
              <div v-for="p in ent.basicLeft" :key="p.label" class="bg-row">
                <div class="bg-label">{{ p.label }}</div>
                <div class="bg-value" :title="p.value">{{ p.value }}</div>
              </div>
            </div>
            <div class="bg-col">
              <div v-for="p in ent.basicRight" :key="p.label" class="bg-row">
                <div class="bg-label">{{ p.label }}</div>
                <div class="bg-value" :title="p.value">{{ p.value }}</div>
              </div>
            </div>
          </div>
        </el-tab-pane>

        <!-- 联系方式 -->
        <el-tab-pane label="联系方式" name="contact">
          <div class="contact-filter">
            <span
              v-for="f in contactFilters"
              :key="f.key"
              class="cf-chip"
              :class="{ on: contactType === f.key }"
              @click="contactType = f.key"
            >{{ f.label }}({{ f.count }})</span>
          </div>
          <el-table :data="filteredContacts" class="contact-table" stripe>
            <el-table-column prop="phone" label="电话/手机/邮箱" min-width="150" />
            <el-table-column prop="name" label="姓名" min-width="120" />
            <el-table-column label="标签" min-width="150">
              <template #default="{ row }">
                <span v-for="tg in row.tags" :key="tg" class="ct-tag" :class="tagClass(tg)">{{ tg }}</span>
              </template>
            </el-table-column>
            <el-table-column label="状态" min-width="90">
              <template #default="{ row }"><span class="ct-status">{{ row.status }}</span></template>
            </el-table-column>
            <el-table-column label="星级" min-width="120">
              <template #default="{ row }"><span class="ct-star">{{ '★'.repeat(row.star) }}{{ '☆'.repeat(5 - row.star) }}</span></template>
            </el-table-column>
            <el-table-column prop="platform" label="平台信息" min-width="100" />
          </el-table>
          <div class="contact-pager">
            <el-pagination layout="prev, pager, next" :total="ent.contactCounts.all" :page-size="10" background />
          </div>
        </el-tab-pane>

        <!-- 项目申报 -->
        <el-tab-pane label="项目申报" name="project">
          <div class="proj-block">
            <div class="pb-title"><span class="bar"></span>本司已申报项目概况</div>
            <div class="pb-charts">
              <Echart :options="pieOption" :height="260" width="100%" />
              <Echart :options="trendOption" :height="260" width="100%" />
            </div>
          </div>
          <div class="proj-block">
            <div class="pb-title">
              <span class="bar"></span>本司已申报项目（{{ ent.projectTotal }}）
              <span class="pb-update">最近更新时间：{{ projUpdateTime }}</span>
            </div>
            <div class="pb-search">
              <el-input v-model="projKw" placeholder="项目关键字搜索" class="pb-kw" />
              <el-select v-model="projLevel" placeholder="项目级别" class="pb-sel"><el-option label="全部" value="" /><el-option label="国家级" value="国家级" /><el-option label="省级" value="省级" /><el-option label="市级" value="市级" /></el-select>
              <el-select v-model="projYear" placeholder="年度" class="pb-sel"><el-option label="全部" value="" /><el-option label="2026" value="2026" /><el-option label="2025" value="2025" /><el-option label="2024" value="2024" /></el-select>
              <el-button type="primary" :icon="Search">搜索</el-button>
            </div>
            <div class="proj-list">
              <div v-for="(p, i) in filteredProjects" :key="i" class="proj-item">
                <div class="pi-main">
                  <div class="pi-title">
                    <span v-if="p.level" class="pi-level">{{ p.level }}</span>{{ p.title }}
                  </div>
                  <div class="pi-remark">项目备注：<span :class="{ empty: !p.remark }">{{ p.remark || '—' }}</span></div>
                  <div class="pi-meta"><span>{{ p.org }}</span><span class="sep">|</span><span>{{ p.region }}</span></div>
                </div>
                <div class="pi-year"><div class="pi-lb">年度</div><div class="pi-val">{{ p.year }}</div></div>
                <div class="pi-subsidy"><div class="pi-lb">已获补贴</div><div class="pi-val money">{{ p.subsidy }}<small>万元</small></div></div>
              </div>
            </div>
          </div>
        </el-tab-pane>

        <!-- 人员投资 / 知识产权 / 经营信息 / 经营风险 / 企业发展（按真实详情页结构） -->
        <el-tab-pane v-for="rt in richTabs" :key="rt.name" :label="rt.label" :name="rt.name">
          <div v-for="(sec, si) in rt.sections" :key="si" class="rich-sec">
            <div class="rs-title">
              <span class="bar"></span>{{ sec.title }}
              <span v-if="sec.count !== undefined" class="rs-count">（{{ sec.count }}）</span>
              <span v-if="sec.note" class="rs-note">{{ sec.note }}</span>
            </div>
            <!-- 概览统计 -->
            <div v-if="sec.type === 'stat'" class="rs-stats">
              <div v-for="(s, i) in sec.stats" :key="i" class="rs-stat">
                <div class="rs-stat-num"><b>{{ s.value }}</b><small v-if="s.unit">{{ s.unit }}</small></div>
                <div class="rs-stat-lb">{{ s.label }}</div>
              </div>
            </div>
            <!-- 键值 -->
            <div v-else-if="sec.type === 'kv'" class="rs-kv">
              <div v-for="(pr, i) in sec.pairs" :key="i" class="rs-kv-row"><span class="k">{{ pr.label }}</span><span class="v">{{ pr.value }}</span></div>
            </div>
            <!-- 标签 -->
            <div v-else-if="sec.type === 'tags'" class="rs-tags">
              <span v-for="(tg, i) in sec.tags" :key="i" class="rs-tag">{{ tg }}</span>
            </div>
            <!-- 表格 -->
            <el-table v-else :data="sec.rows" class="rs-table" stripe :empty-text="sec.note || '暂无数据'">
              <el-table-column v-for="c in sec.columns" :key="c.prop" :prop="c.prop" :label="c.label" :width="c.width" />
            </el-table>
          </div>
        </el-tab-pane>
      </el-tabs>
    </div>
  </el-drawer>
</template>

<script setup lang="ts">
import { computed, nextTick, ref, watch } from 'vue'
import { ChatDotRound, Close, CopyDocument, Search } from '@element-plus/icons-vue'
import { Echart } from '@/components/Echart'
import { getDaasBaseInfo } from '@/api/liqi/daas'
import type { EnterpriseDetail } from './enterpriseData'

const props = defineProps<{
  modelValue: boolean
  enterprise: EnterpriseDetail | null
  enrichable?: boolean
  enriching?: boolean
}>()
const emit = defineEmits(['update:modelValue', 'closed', 'enrich'])

const visible = computed({
  get: () => props.modelValue,
  set: (v) => emit('update:modelValue', v)
})
const ent = computed(() => props.enterprise)

const unlockUser = '王雁'
const unlockTime = '2026-08-26 18:35:19'

const scopeOpen = ref(false)
const activeTab = ref('basic')

// ===== DaaS 实时工商信息（点击企业名、拿到统一社会信用代码后自动查询力企云数据平台）=====
const daasLoading = ref(false)
const daasInfo = ref<any>(null)
const daasEmpty = ref(false) // 平台未覆盖（如深圳企业数据待开通）
const daasError = ref(false)
const daasScaleText = (s?: number) => ({ 1: '微型企业', 2: '小型企业', 3: '中型企业', 4: '大型企业' } as any)[s || 0] || '-'
const isRealCreditCode = (c?: string) => !!c && /^[0-9A-HJ-NPQRTUWXY]{18}$/.test(c.trim())

const loadDaas = async (code?: string) => {
  daasInfo.value = null
  daasEmpty.value = false
  daasError.value = false
  if (!isRealCreditCode(code)) {
    daasEmpty.value = true // 无有效统一社会信用代码
    return
  }
  daasLoading.value = true
  try {
    const info = await getDaasBaseInfo(code!.trim())
    daasInfo.value = info
    daasEmpty.value = !info
  } catch {
    daasError.value = true
  } finally {
    daasLoading.value = false
  }
}
watch(
  () => props.enterprise?.creditCode,
  (code) => loadDaas(code),
  { immediate: true }
)

// 图表在懒加载 tab 中首渲时容器宽度可能未就绪 → 切到「项目申报」时强制 echart 重算尺寸
const nudgeCharts = () => {
  nextTick(() => {
    setTimeout(() => window.dispatchEvent(new Event('resize')), 60)
    setTimeout(() => window.dispatchEvent(new Event('resize')), 240)
  })
}
watch(activeTab, (t) => {
  if (t === 'project') nudgeCharts()
})
watch(visible, (v) => {
  if (v) activeTab.value = 'basic'
})

// 联系方式
const contactType = ref<'all' | 'mobile' | 'tel' | 'email'>('all')
const contactFilters = computed(() => [
  { key: 'all', label: '全部', count: ent.value?.contactCounts.all || 0 },
  { key: 'mobile', label: '手机', count: ent.value?.contactCounts.mobile || 0 },
  { key: 'tel', label: '固话', count: ent.value?.contactCounts.tel || 0 },
  { key: 'email', label: '邮箱', count: ent.value?.contactCounts.email || 0 }
])
const filteredContacts = computed(() => {
  const list = ent.value?.contacts || []
  if (contactType.value === 'all') return list
  return list.filter((c) => c.type === contactType.value)
})
const tagClass = (tg: string) => {
  if (tg === '推荐人') return 'blue'
  if (tg === '疑似法人') return 'green'
  if (tg === '疑似高管') return 'orange'
  return ''
}

// 项目申报
const projKw = ref('')
const projLevel = ref('')
const projYear = ref('')
const filteredProjects = computed(() => {
  let list = ent.value?.projects || []
  if (projKw.value.trim()) list = list.filter((p) => p.title.includes(projKw.value.trim()))
  if (projYear.value) list = list.filter((p) => p.year === projYear.value)
  if (projLevel.value) list = list.filter((p) => p.level === projLevel.value)
  return list
})
// 最近更新时间（展示用）
const projUpdateTime = (() => {
  const d = new Date()
  const p = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}`
})()

const pieOption = computed(() => ({
  tooltip: { trigger: 'item' },
  legend: { bottom: 0, left: 'center', itemWidth: 10, itemHeight: 10, textStyle: { fontSize: 11 } },
  series: [
    {
      type: 'pie',
      radius: ['0%', '62%'],
      center: ['50%', '44%'],
      label: { show: false },
      data: (ent.value?.projectPie || []).map((d) => ({ name: d.name, value: d.value }))
    }
  ]
}))
const trendOption = computed(() => ({
  tooltip: { trigger: 'axis' },
  legend: { top: 0, right: 0, data: ['补贴金额', '已申报项目'], itemWidth: 10, itemHeight: 10, textStyle: { fontSize: 11 } },
  grid: { left: 44, right: 44, top: 36, bottom: 24 },
  xAxis: { type: 'category', data: ent.value?.projectTrend.years || [], boundaryGap: false },
  yAxis: [
    { type: 'value', name: '万元', nameTextStyle: { fontSize: 10 } },
    { type: 'value', name: '项', nameTextStyle: { fontSize: 10 } }
  ],
  series: [
    { name: '补贴金额', type: 'line', smooth: true, areaStyle: { opacity: 0.25 }, itemStyle: { color: '#4a86ff' }, data: ent.value?.projectTrend.subsidy || [] },
    { name: '已申报项目', type: 'line', smooth: true, yAxisIndex: 1, areaStyle: { opacity: 0.18 }, itemStyle: { color: '#f0a020' }, data: ent.value?.projectTrend.count || [] }
  ]
}))

const richTabs = computed(() => ent.value?.richTabs || [])
</script>

<style lang="scss" scoped>
.ent {
  display: flex;
  flex-direction: column;
  height: 100%;
}
/* ===== 头部 ===== */
.ent-head {
  padding: 12px 20px 0;
  background: #fff;
}
.eh-top {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 12px;
  color: #2f7bff;
  font-size: 13px;

  .eh-close {
    cursor: pointer;
    color: #909399;
    font-size: 18px;

    &:hover {
      color: #f56c6c;
    }
  }
}
.eh-main {
  display: flex;
  gap: 14px;
  margin-top: 6px;
}
.eh-logo {
  width: 58px;
  height: 58px;
  flex-shrink: 0;
  border-radius: 6px;
  background: linear-gradient(135deg, #3a7bff, #2f6bff);
  color: #fff;
  font-size: 15px;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  line-height: 1.15;
  padding: 4px;
}
.eh-info {
  flex: 1;
  min-width: 0;
}
.eh-title {
  display: flex;
  align-items: center;
  gap: 10px;

  .eh-name {
    font-size: 20px;
    font-weight: 700;
    color: #1f2d3d;
  }
  .eh-status {
    font-size: 12px;
    color: #22a06b;
    background: #e7f7ef;
    border-radius: 3px;
    padding: 2px 8px;
  }
  .eh-copy {
    color: #a0a6b2;
    cursor: pointer;
  }
}
.eh-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 8px;

  .eh-tag {
    font-size: 12px;
    color: #2f7bff;
    border: 1px solid #a9c6ff;
    border-radius: 3px;
    padding: 1px 8px;
  }
  .eh-more {
    font-size: 12px;
    color: #2f7bff;
    cursor: pointer;
  }
}
.eh-news {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 12px;
  padding: 8px 14px;
  background: linear-gradient(90deg, #eef4ff, #f7faff);
  border-radius: 6px;
  color: #2f7bff;
  font-weight: 600;
  font-size: 14px;
}
.eh-summary {
  margin-top: 10px;
  padding: 12px 14px;
  background: #f8fafc;
  border-radius: 6px;
  font-size: 13px;
  color: #303133;

  .es-row {
    display: flex;
    flex-wrap: wrap;
    gap: 6px 32px;
    margin-bottom: 6px;

    &:last-child {
      margin-bottom: 0;
    }
  }
  .es-item {
    i {
      color: #8a93a6;
      font-style: normal;
    }
    &.full {
      display: block;
      width: 100%;
    }
  }
  .es-item .ellipsis {
    display: inline-block;
    max-width: 78%;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    vertical-align: bottom;
  }
  .es-toggle {
    color: #2f7bff;
    cursor: pointer;
    margin-left: 6px;
  }
}
/* ===== 标签页 ===== */
.ent-tabs {
  flex: 1;
  margin-top: 8px;
  padding: 0 20px 20px;
  overflow: auto;

  :deep(.el-tabs__item) {
    font-size: 15px;
  }
}
/* 基本信息 */
.daas-box {
  background: linear-gradient(135deg, #f5f9ff, #eef4ff);
  border: 1px solid #d6e4fb;
  border-radius: 10px;
  padding: 16px 18px;
  margin-bottom: 18px;
  min-height: 60px;
}
.daas-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}
.daas-title {
  font-size: 15px;
  font-weight: 600;
  color: #1f2d3d;
  display: flex;
  align-items: center;
  .bar {
    display: inline-block;
    width: 4px;
    height: 15px;
    background: #2f6fe0;
    border-radius: 2px;
    margin-right: 8px;
  }
}
.daas-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px 28px;
}
.daas-item {
  display: flex;
  font-size: 13px;
  line-height: 1.6;
  label {
    flex: none;
    width: 110px;
    color: #909399;
  }
  span {
    color: #303133;
    word-break: break-all;
  }
  &.daas-full {
    grid-column: 1 / -1;
  }
}
.daas-ok {
  color: #67c23a;
  font-weight: 600;
}
.daas-scope {
  white-space: pre-wrap;
}
.daas-empty {
  font-size: 13px;
  color: #b88230;
  background: #fdf6ec;
  border: 1px dashed #f5dab1;
  border-radius: 8px;
  padding: 14px 16px;
  line-height: 1.7;
  b {
    color: #b88230;
  }
}
.basic-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0 24px;
}
.bg-row {
  display: flex;
  border-bottom: 1px solid #f0f2f5;
}
.bg-label {
  width: 130px;
  flex-shrink: 0;
  padding: 12px 12px;
  color: #8a93a6;
  background: #fafbfc;
  font-size: 13px;
}
.bg-value {
  flex: 1;
  padding: 12px 12px;
  color: #303133;
  font-size: 13px;
  word-break: break-all;
}
/* 联系方式 */
.contact-filter {
  display: flex;
  gap: 10px;
  margin-bottom: 14px;

  .cf-chip {
    padding: 5px 14px;
    font-size: 13px;
    color: #606266;
    background: #f4f6fa;
    border-radius: 4px;
    cursor: pointer;

    &.on {
      color: #2f7bff;
      background: #eaf2ff;
      border: 1px solid #a9c6ff;
    }
  }
}
.ct-tag {
  font-size: 12px;
  border-radius: 3px;
  padding: 1px 6px;
  margin-right: 4px;

  &.blue {
    color: #2f7bff;
    background: #eaf2ff;
  }
  &.green {
    color: #22a06b;
    background: #e7f7ef;
  }
  &.orange {
    color: #e6820a;
    background: #fdf1e2;
  }
}
.ct-status {
  color: #22a06b;
}
.ct-star {
  color: #f7b500;
  letter-spacing: 1px;
}
.contact-pager {
  display: flex;
  justify-content: flex-end;
  margin-top: 14px;
}
/* 项目申报 */
.proj-block {
  margin-bottom: 20px;
}
.pb-title {
  display: flex;
  align-items: center;
  font-size: 14px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 12px;

  .bar {
    width: 3px;
    height: 14px;
    background: #2f7bff;
    border-radius: 2px;
    margin-right: 8px;
  }
  .pb-update {
    margin-left: auto;
    font-size: 12px;
    font-weight: 400;
    color: #909399;
  }
}
.pb-charts {
  display: grid;
  grid-template-columns: 1fr 1.4fr;
  gap: 16px;
  background: #fafbfc;
  border-radius: 8px;
  padding: 10px;
}
.pb-search {
  display: flex;
  gap: 10px;
  margin-bottom: 14px;

  .pb-kw {
    width: 240px;
  }
  .pb-sel {
    width: 160px;
  }
}
.proj-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 14px 16px;
  border: 1px solid #eef1f6;
  border-radius: 8px;
  margin-bottom: 10px;

  .pi-main {
    flex: 1;
    min-width: 0;
  }
  .pi-title {
    font-size: 14px;
    color: #303133;
    font-weight: 500;
    margin-bottom: 6px;
    line-height: 1.5;

    .pi-level {
      display: inline-block;
      font-size: 12px;
      font-weight: 600;
      color: #2f7bff;
      background: #eaf1ff;
      border-radius: 3px;
      padding: 1px 6px;
      margin-right: 6px;
    }
  }
  .pi-remark {
    font-size: 12px;
    color: #606266;
    margin-bottom: 6px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;

    .empty {
      color: #c0c4cc;
    }
  }
  .pi-meta {
    font-size: 12px;
    color: #909399;

    .sep {
      margin: 0 8px;
    }
  }
  .pi-year,
  .pi-subsidy {
    flex-shrink: 0;
    text-align: center;
    padding: 6px 14px;
    border-radius: 6px;
    background: #f5f8ff;

    .pi-lb {
      font-size: 12px;
      color: #8a93a6;
    }
    .pi-val {
      font-size: 18px;
      font-weight: 600;
      color: #2f7bff;

      &.money {
        color: #f5803e;
      }
      small {
        font-size: 12px;
        font-weight: 400;
      }
    }
  }
}
/* 富页签（人员投资/知产/经营信息/经营风险/企业发展） */
.rich-sec {
  margin-bottom: 22px;
}
.rs-title {
  display: flex;
  align-items: center;
  font-size: 14px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 12px;

  .bar {
    width: 3px;
    height: 14px;
    background: #2f7bff;
    border-radius: 2px;
    margin-right: 8px;
  }
  .rs-count {
    color: #2f7bff;
    font-weight: 500;
  }
  .rs-note {
    margin-left: 10px;
    font-size: 12px;
    font-weight: 400;
    color: #b6bcc6;
  }
}
.rs-stats {
  display: flex;
  flex-wrap: wrap;
  gap: 14px;
}
.rs-stat {
  min-width: 120px;
  flex: 1;
  background: #f7faff;
  border: 1px solid #e8f0ff;
  border-radius: 8px;
  padding: 14px 12px;
  text-align: center;

  .rs-stat-num {
    b {
      font-size: 24px;
      color: #2f7bff;
    }
    small {
      font-size: 12px;
      color: #8a93a6;
      margin-left: 2px;
    }
  }
  .rs-stat-lb {
    margin-top: 6px;
    font-size: 13px;
    color: #606266;
  }
}
.rs-kv {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0 24px;
}
.rs-kv-row {
  display: flex;
  border-bottom: 1px solid #f0f2f5;
  padding: 10px 0;
  font-size: 13px;

  .k {
    width: 130px;
    flex-shrink: 0;
    color: #8a93a6;
  }
  .v {
    color: #303133;
  }
}
.rs-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;

  .rs-tag {
    font-size: 12px;
    color: #2f7bff;
    background: #eaf2ff;
    border: 1px solid #cfe0ff;
    border-radius: 4px;
    padding: 3px 10px;
  }
}
.rs-table {
  width: 100%;
}
</style>
