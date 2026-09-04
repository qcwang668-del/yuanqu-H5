<template>
  <!-- 搜索 -->
  <ContentWrap>
    <el-form
      class="-mb-15px"
      :model="queryParams"
      ref="queryFormRef"
      :inline="true"
      label-width="90px"
    >
      <el-form-item label="企业名称" prop="enterpriseName">
        <el-input
          v-model="queryParams.enterpriseName"
          placeholder="输入企业名称"
          clearable
          class="!w-200px"
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="所属行业" prop="industry">
        <el-input
          v-model="queryParams.industry"
          placeholder="输入行业关键词"
          clearable
          class="!w-200px"
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="参保人数" prop="insuredBand">
        <el-select
          v-model="insuredBand"
          placeholder="请选择参保人数区间"
          clearable
          class="!w-200px"
          @change="handleQuery"
        >
          <el-option v-for="(b, i) in INSURED_BANDS" :key="i" :label="b.label" :value="i" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button @click="handleQuery"><Icon icon="ep:search" class="mr-5px" />搜索</el-button>
        <el-button @click="resetQuery"><Icon icon="ep:refresh" class="mr-5px" />重置</el-button>
      </el-form-item>
    </el-form>
  </ContentWrap>

  <!-- 列表 -->
  <ContentWrap>
    <el-table v-loading="loading" :data="displayList" :stripe="true">
      <el-table-column label="序号" type="index" align="center" width="60" />
      <el-table-column label="企业名称" align="center" prop="enterpriseName" show-overflow-tooltip>
        <template #default="scope">
          <el-link type="primary" :underline="false" @click="openDetail(scope.row)">
            {{ scope.row.enterpriseName }}
          </el-link>
        </template>
      </el-table-column>
      <el-table-column label="法人" align="center" prop="legalPerson" width="90" />
      <el-table-column label="经营状态" align="center" prop="regStatus" width="130">
        <template #default="scope">
          <el-tag
            v-if="scope.row.regStatus"
            :type="scope.row.regStatus.includes('存续') ? 'success' : scope.row.regStatus.includes('注销') ? 'danger' : 'info'"
            size="small"
            effect="light"
          >{{ scope.row.regStatus }}</el-tag>
          <span v-else>-</span>
        </template>
      </el-table-column>
      <el-table-column label="注册资本" align="center" prop="registeredCapital" width="160" show-overflow-tooltip />
      <el-table-column label="所属行业" align="center" prop="industry" min-width="180" show-overflow-tooltip />
      <el-table-column label="参保人数" align="center" prop="insuredCount" width="90">
        <template #default="scope">{{ scope.row.insuredCount ?? 0 }} 人</template>
      </el-table-column>
      <el-table-column label="注册地址" align="center" prop="registerAddress" min-width="200" show-overflow-tooltip />
      <el-table-column label="统一社会信用代码" align="center" prop="creditCode" width="180" show-overflow-tooltip />
      <el-table-column label="操作" align="center" width="90" fixed="right">
        <template #default="scope">
          <el-button link type="primary" @click="openDetail(scope.row)">详情</el-button>
        </template>
      </el-table-column>
    </el-table>
    <Pagination
      :total="total"
      v-model:page="queryParams.pageNo"
      v-model:limit="queryParams.pageSize"
      @pagination="getList"
    />
  </ContentWrap>

  <!-- 企业详情抽屉 -->
  <EnterpriseDrawer v-model="detailVisible" :enterprise="detailEnt" />
</template>

<script setup lang="ts">
import { dateFormatter } from '@/utils/formatTime'
import { getEnterprisePage, getEnterpriseDetail } from '@/api/liqi/enterprise'
import EnterpriseDrawer from '@/views/park/enterpriseList/EnterpriseDrawer.vue'
import { detailFromBackend } from '@/views/park/enterpriseList/enterpriseData'

defineOptions({ name: 'EnterpriseMemberMgSys' })

// 企业详情抽屉（打开后按统一社会信用代码实时调 DaaS 工商信息）
const detailVisible = ref(false)
const detailEnt = ref<any>(null)
const openDetail = async (row: any) => {
  detailEnt.value = detailFromBackend({ enterprise: row })
  detailVisible.value = true
  try {
    const payload: any = await getEnterpriseDetail(row.id)
    if (payload?.enterprise) detailEnt.value = detailFromBackend(payload)
  } catch {
    /* 保留行数据 */
  }
}

const loading = ref(true)
const list = ref<any[]>([])
const total = ref(0)
const queryFormRef = ref()
// 数据源：企业库表 liqi_enterprise（实时调取）
const queryParams = reactive({
  pageNo: 1,
  pageSize: 10,
  enterpriseName: undefined,
  industry: undefined
})

// ------- 参保人数分档（前端筛选当前页，企业库有真实 insuredCount） -------
const INSURED_BANDS = [
  { label: '0 人', min: 0, max: 0 },
  { label: '1-49 人', min: 1, max: 49 },
  { label: '50-99 人', min: 50, max: 99 },
  { label: '100-499 人', min: 100, max: 499 },
  { label: '500 人以上', min: 500, max: Infinity }
]
const insuredBand = ref<number | undefined>(undefined)

/** 查询列表：实时调取企业库表 liqi_enterprise（真实工商数据） */
const getList = async () => {
  loading.value = true
  try {
    const data = await getEnterprisePage(queryParams)
    list.value = data.list || []
    total.value = data.total
  } finally {
    loading.value = false
  }
}

// 参保人数分档：前端过滤当前页（企业库真实参保人数）
const displayList = computed(() => {
  if (insuredBand.value === undefined || insuredBand.value === null) return list.value
  const b = INSURED_BANDS[insuredBand.value]
  return list.value.filter((r: any) => (r.insuredCount ?? 0) >= b.min && (r.insuredCount ?? 0) <= b.max)
})

const handleQuery = () => {
  queryParams.pageNo = 1
  getList()
}

const resetQuery = () => {
  queryFormRef.value?.resetFields()
  insuredBand.value = undefined
  handleQuery()
}

onMounted(() => {
  getList()
})
</script>
