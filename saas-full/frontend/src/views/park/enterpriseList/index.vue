<!--
  园区企业列表页 · 由大屏「园区特色榜单」/榜单招商 点击进入。
  数据走后端接口 /liqi/enterprise/page（深圳湾生态园 1000 家企业）。样式参考产品截图。
-->
<template>
  <div class="ent-page">
    <div class="ent-hd">
      <div class="ent-title">
        园区企业列表
        <em>· 深圳湾生态园（共 {{ total }} 家）</em>
        <em v-if="rankName" style="color: #2f6fe0">· 来源榜单：{{ rankName }}</em>
      </div>
      <div class="ent-tools">
        <el-input
          v-model="queryParams.enterpriseName"
          placeholder="搜索企业名称"
          clearable
          class="ent-search"
          @keyup.enter="handleQuery"
          @clear="handleQuery"
        />
        <el-button type="primary" @click="handleQuery">搜索</el-button>
        <el-button plain @click="pickAllPage">{{ allPicked ? '取消全选' : '全选本页' }}</el-button>
        <el-button type="success" :disabled="picked.size === 0" @click="addToCallList">
          加入待联系（{{ picked.size }}）
        </el-button>
        <el-badge :value="callStore.count" :hidden="callStore.count === 0" type="danger">
          <el-button @click="goWorkbench">📞 客户池管理</el-button>
        </el-badge>
        <el-button plain @click="goBack">← 返回</el-button>
      </div>
    </div>

    <div class="ent-list" v-loading="loading">
      <div class="ent-card" :class="{ picked: picked.has(e.id) }" v-for="e in list" :key="e.id">
        <el-checkbox
          class="ent-ck"
          :model-value="picked.has(e.id)"
          @change="(v) => togglePick(e, v)"
        />
        <div class="ent-logo" :style="{ background: e.logoColor || '#3f6fd0' }">{{ e.shortName }}</div>
        <div class="ent-body">
          <div class="ent-name" title="查看企业详情" @click="openDetail(e)">{{ e.enterpriseName }}</div>
          <div class="ent-meta">
            <span>法定代表人：<b>{{ e.legalPerson }}</b></span>
            <span>成立时间：{{ fmtDate(e.establishDate) }}</span>
            <span>注册资本：{{ e.registeredCapital }}</span>
            <span>参保人数：{{ e.insuredCount }}人</span>
            <span>所属行业：{{ e.industry }}</span>
          </div>
          <div class="ent-addr">注册地址：{{ e.registerAddress }}</div>
        </div>
        <div class="ent-op">
          <el-button
            v-if="!inCallList(e.id)"
            size="small"
            type="primary"
            plain
            @click="addOne(e)"
          >+ 加入待联系</el-button>
          <el-tag v-else size="small" type="success" effect="light">✓ 已加入</el-tag>
        </div>
      </div>
      <el-empty v-if="!loading && list.length === 0" description="暂无企业" />
    </div>

    <div class="ent-pager">
      <el-pagination
        background
        layout="total, prev, pager, next, jumper"
        :total="total"
        :page-size="queryParams.pageSize"
        v-model:current-page="queryParams.pageNo"
        @current-change="getList"
      />
    </div>

    <!-- 企业详情抽屉 -->
    <EnterpriseDrawer
      v-model="drawerVisible"
      :enterprise="currentEnterprise"
      :enrichable="!!currentBackendId"
      :enriching="enriching"
      @enrich="onEnrich"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, reactive, ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { getEnterprisePage, getEnterpriseDetail, enrichEnterprise } from '@/api/liqi/enterprise'
import { useCallListStore } from '@/store/modules/callList'
import EnterpriseDrawer from './EnterpriseDrawer.vue'
import { detailFromParkEntity, detailFromBackend, type EnterpriseDetail } from './enterpriseData'

defineOptions({ name: 'ParkEnterpriseList' })

// ------- 企业详情抽屉 -------
const drawerVisible = ref(false)
const currentEnterprise = ref<EnterpriseDetail | null>(null)
const currentBackendId = ref<number | null>(null)
const enriching = ref(false)
const openDetail = async (e: any) => {
  currentEnterprise.value = detailFromParkEntity(e)
  drawerVisible.value = true
  // 后端真实企业（数字 id）：拉取库中已有详情（含天眼查回填字段 + 股东）
  const idNum = Number(e.id)
  currentBackendId.value = Number.isFinite(idNum) ? idNum : null
  if (currentBackendId.value) {
    try {
      const payload: any = await getEnterpriseDetail(currentBackendId.value)
      if (payload?.enterprise) currentEnterprise.value = detailFromBackend(payload)
    } catch {
      /* 忽略，保留列表行构造的详情 */
    }
  }
}
// 按需实时调天眼查回填
const onEnrich = async () => {
  if (!currentBackendId.value) {
    ElMessage.warning('该企业无后端记录，无法回填')
    return
  }
  enriching.value = true
  try {
    const res: any = await enrichEnterprise(currentBackendId.value)
    if (res?.enterprise) currentEnterprise.value = detailFromBackend(res)
    ElMessage.success(res?.enriched ? '已从天眼查回填工商信息 + 股东' : (res?.msg || '天眼查查无结果（需工商登记全称）'))
  } catch (err: any) {
    ElMessage.error('回填失败：' + (err?.msg || err?.message || '请稍后重试'))
  } finally {
    enriching.value = false
  }
}

const route = useRoute()
const router = useRouter()
const rankName = computed(() => (route.query.name as string) || '')
const callStore = useCallListStore()
// 圈选来源：榜单名 / 产业链 / 园区
const source = computed(() => (route.query.name as string) || (route.query.source as string) || '园区企业')

// ------- 圈选（多选） -------
const picked = reactive(new Set<any>())
const inCallList = (id: any) => callStore.list.some((x) => String(x.id) === String(id))
const togglePick = (e: any, v: any) => {
  if (v) picked.add(e.id)
  else picked.delete(e.id)
}
const allPicked = computed(() => list.value.length > 0 && list.value.every((e) => picked.has(e.id)))
const pickAllPage = () => {
  if (allPicked.value) list.value.forEach((e) => picked.delete(e.id))
  else list.value.forEach((e) => picked.add(e.id))
}
const addOne = (e: any) => {
  const n = callStore.addEnterprises([e], source.value)
  ElMessage.success(n ? `已加入待联系：${e.enterpriseName}` : '该企业已在待联系池')
}
const addToCallList = () => {
  const rows = list.value.filter((e) => picked.has(e.id))
  const n = callStore.addEnterprises(rows, source.value)
  picked.clear()
  ElMessage.success(`已加入待联系 ${n} 家企业${n < rows.length ? '（部分已存在，自动去重）' : ''}`)
}
const goWorkbench = () => router.push('/customer-pool')

const goBack = () => {
  if (window.history.length > 1) router.back()
  else router.push('/park-screen')
}

const loading = ref(false)
const list = ref<any[]>([])
const total = ref(0)
const queryParams = reactive({ pageNo: 1, pageSize: 10, enterpriseName: undefined })

// 成立时间：后端 LocalDate 序列化为 [y,m,d] 数组
const fmtDate = (d: any) => {
  if (Array.isArray(d)) return `${d[0]}-${String(d[1]).padStart(2, '0')}-${String(d[2]).padStart(2, '0')}`
  return d || ''
}

const getList = async () => {
  loading.value = true
  try {
    const data = await getEnterprisePage(queryParams)
    list.value = data.list
    total.value = data.total
  } finally {
    loading.value = false
  }
}

const handleQuery = () => {
  queryParams.pageNo = 1
  getList()
}

onMounted(() => getList())
</script>

<style scoped>
.ent-page {
  min-height: 100vh;
  background: #f2f5fa;
  padding: 18px 32px 40px;
  box-sizing: border-box;
}
.ent-hd {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 16px;
  flex-wrap: wrap;
}
.ent-title {
  font-size: 20px;
  font-weight: 600;
  color: #1f2d3d;
}
.ent-title em {
  font-style: normal;
  font-size: 14px;
  font-weight: 400;
  color: #6b7a90;
  margin-left: 8px;
}
.ent-tools {
  display: flex;
  align-items: center;
  gap: 10px;
}
.ent-search {
  width: 240px;
}
.ent-list {
  display: flex;
  flex-direction: column;
  gap: 14px;
  min-height: 300px;
}
.ent-card {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  background: #fff;
  border: 1px solid #eef1f6;
  border-radius: 10px;
  padding: 18px 22px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
  transition: box-shadow 0.2s, border-color 0.2s;
}
.ent-card:hover {
  box-shadow: 0 4px 16px rgba(30, 90, 200, 0.1);
  border-color: #cfe0f5;
}
.ent-card.picked {
  border-color: #2f6fe0;
  background: #f5f9ff;
}
.ent-op {
  flex: none;
  align-self: center;
}
.ent-ck {
  margin-top: 4px;
}
.ent-logo {
  flex: none;
  width: 64px;
  height: 64px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 20px;
  font-weight: 700;
  letter-spacing: 1px;
}
.ent-body {
  flex: 1;
  min-width: 0;
}
.ent-name {
  font-size: 17px;
  font-weight: 600;
  color: #2f6fe0;
  margin-bottom: 12px;
  cursor: pointer;
}
.ent-name:hover {
  text-decoration: underline;
}
.ent-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 8px 40px;
  font-size: 13px;
  color: #6b7a90;
  margin-bottom: 10px;
}
.ent-meta b {
  color: #1f2d3d;
  font-weight: 500;
}
.ent-addr {
  font-size: 13px;
  color: #6b7a90;
}
.ent-pager {
  display: flex;
  justify-content: center;
  margin-top: 26px;
}
</style>
