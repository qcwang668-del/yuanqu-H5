<template>
  <!-- 搜索 -->
  <ContentWrap>
    <el-form
      class="-mb-15px"
      :model="queryParams"
      ref="queryFormRef"
      :inline="true"
      label-width="110px"
    >
      <el-form-item label="企业名称" prop="enterpriseName">
        <el-input
          v-model="queryParams.enterpriseName"
          placeholder="请输入企业名称"
          clearable
          class="!w-200px"
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="统一社会信用代码" prop="creditCode">
        <el-input
          v-model="queryParams.creditCode"
          placeholder="请输入统一社会信用代码"
          clearable
          class="!w-220px"
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="法定代表人" prop="legalPerson">
        <el-input
          v-model="queryParams.legalPerson"
          placeholder="请输入法定代表人"
          clearable
          class="!w-200px"
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="获批项目" prop="approvalProject">
        <el-input
          v-model="queryParams.approvalProject"
          placeholder="请输入获批项目"
          clearable
          class="!w-200px"
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <el-select v-model="queryParams.status" placeholder="请选择状态" clearable class="!w-160px">
          <el-option label="正常" :value="0" />
          <el-option label="异常" :value="1" />
        </el-select>
      </el-form-item>
      <el-form-item label="获批时间" prop="approvalTime">
        <el-date-picker
          v-model="queryParams.approvalTime"
          value-format="YYYY-MM-DD HH:mm:ss"
          type="daterange"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          :default-time="[new Date('1 00:00:00'), new Date('1 23:59:59')]"
          class="!w-240px"
        />
      </el-form-item>
      <el-form-item>
        <el-button @click="handleQuery"><Icon icon="ep:search" class="mr-5px" />搜索</el-button>
        <el-button @click="resetQuery"><Icon icon="ep:refresh" class="mr-5px" />重置</el-button>
        <el-button type="success" plain @click="handleExport" :loading="exportLoading">
          <Icon icon="ep:download" class="mr-5px" />导出
        </el-button>
      </el-form-item>
    </el-form>
  </ContentWrap>

  <!-- 列表 -->
  <ContentWrap>
    <el-table v-loading="loading" :data="list" :stripe="true">
      <el-table-column label="序号" type="index" align="center" width="60" />
      <el-table-column label="企业名称" align="center" prop="enterpriseName" min-width="220" show-overflow-tooltip>
        <template #default="scope">
          <el-link type="primary" :underline="false" @click="openEntDetail(scope.row)">
            {{ scope.row.enterpriseName }}
          </el-link>
        </template>
      </el-table-column>
      <el-table-column label="统一社会信用代码" align="center" prop="creditCode" width="190" />
      <el-table-column label="法定代表人" align="center" prop="legalPerson" width="110" />
      <el-table-column label="获批项目" align="center" prop="approvalProject" min-width="180" show-overflow-tooltip />
      <el-table-column
        label="获批时间"
        align="center"
        prop="approvalTime"
        :formatter="dateFormatter"
        width="170"
      />
      <el-table-column label="状态" align="center" prop="status" width="90">
        <template #default="scope">
          <el-tag :type="scope.row.status === 0 ? 'success' : 'danger'">
            {{ scope.row.status === 0 ? '正常' : '异常' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" width="120" fixed="right">
        <template #default="scope">
          <el-button link type="primary" @click="handleDetail(scope.row)">查看详情</el-button>
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

  <!-- 详情抽屉：多 tab 结构占位（框架级） -->
  <el-drawer v-model="detailVisible" title="企业获批动态详情" size="60%">
    <div v-if="currentRow" class="mb-15px">
      <el-descriptions :column="2" border>
        <el-descriptions-item label="企业名称">{{ currentRow.enterpriseName }}</el-descriptions-item>
        <el-descriptions-item label="统一社会信用代码">{{ currentRow.creditCode }}</el-descriptions-item>
        <el-descriptions-item label="法定代表人">{{ currentRow.legalPerson }}</el-descriptions-item>
        <el-descriptions-item label="获批项目">{{ currentRow.approvalProject }}</el-descriptions-item>
      </el-descriptions>
    </div>
    <el-tabs v-model="activeTab" type="border-card">
      <el-tab-pane v-for="tab in detailTabs" :key="tab.name" :label="tab.label" :name="tab.name">
        <el-empty description="该维度数据建设中" />
      </el-tab-pane>
    </el-tabs>
  </el-drawer>

  <!-- 企业详情抽屉（点击企业名称打开） -->
  <EnterpriseDrawer v-model="entDetailVisible" :enterprise="entDetail" />
</template>

<script setup lang="ts">
import { dateFormatter } from '@/utils/formatTime'
import { getApprovalDynamicPage, exportApprovalDynamic } from '@/api/liqi/approvalDynamic'
import download from '@/utils/download'
import EnterpriseDrawer from '@/views/park/enterpriseList/EnterpriseDrawer.vue'
import { detailFromParkEntity } from '@/views/park/enterpriseList/enterpriseData'

defineOptions({ name: 'EnterpriseApprovalDynamics' })

const message = useMessage()

// 企业详情抽屉（点击企业名称）
const entDetailVisible = ref(false)
const entDetail = ref<any>(null)
const openEntDetail = (row: any) => {
  entDetail.value = detailFromParkEntity(row)
  entDetailVisible.value = true
}

const loading = ref(true)
const list = ref<any[]>([])
const total = ref(0)
const exportLoading = ref(false)
const queryFormRef = ref()
const queryParams = reactive({
  pageNo: 1,
  pageSize: 10,
  enterpriseName: undefined,
  creditCode: undefined,
  legalPerson: undefined,
  approvalProject: undefined,
  status: undefined,
  approvalTime: []
})

// 详情多 tab（12 个维度占位）
const detailVisible = ref(false)
const currentRow = ref<any>(null)
const activeTab = ref('business')
const detailTabs = [
  { name: 'business', label: '工商信息' },
  { name: 'taxRate', label: '税率' },
  { name: 'license', label: '行政许可' },
  { name: 'patent', label: '专利' },
  { name: 'trademark', label: '商标' },
  { name: 'qualification', label: '资质证书' },
  { name: 'software', label: '软件著作权' },
  { name: 'shareholder', label: '股东' },
  { name: 'investment', label: '投资' },
  { name: 'branch', label: '分支机构' },
  { name: 'lawsuit', label: '司法涉诉' },
  { name: 'punishment', label: '行政处罚' }
]

/** 查询列表 */
const getList = async () => {
  loading.value = true
  try {
    const data = await getApprovalDynamicPage(queryParams)
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

const resetQuery = () => {
  queryFormRef.value?.resetFields()
  queryParams.approvalTime = []
  handleQuery()
}

const handleDetail = (row: any) => {
  currentRow.value = row
  activeTab.value = 'business'
  detailVisible.value = true
}

/** 导出 */
const handleExport = async () => {
  try {
    await message.exportConfirm()
    exportLoading.value = true
    const data = await exportApprovalDynamic(queryParams)
    download.excel(data, '企业获批动态.xls')
  } catch {
  } finally {
    exportLoading.value = false
  }
}

onMounted(() => {
  getList()
})
</script>
