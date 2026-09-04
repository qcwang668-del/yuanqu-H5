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
          placeholder="请输入企业名称"
          clearable
          class="!w-200px"
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="资质类型" prop="clueType">
        <el-select
          v-model="queryParams.clueType"
          placeholder="请选择资质类型"
          clearable
          class="!w-200px"
        >
          <el-option label="高新技术企业" :value="0" />
          <el-option label="科技型中小企业" :value="1" />
          <el-option label="专精特新" :value="2" />
        </el-select>
      </el-form-item>
      <el-form-item label="注册地址" prop="registerAddress">
        <el-input
          v-model="queryParams.registerAddress"
          placeholder="请输入注册地址"
          clearable
          class="!w-200px"
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="线索来源" prop="source">
        <el-select
          v-model="queryParams.source"
          placeholder="请选择线索来源"
          clearable
          class="!w-200px"
        >
          <el-option label="小程序" :value="0" />
          <el-option label="PC端" :value="1" />
          <el-option label="系统匹配" :value="2" />
        </el-select>
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <el-select v-model="queryParams.status" placeholder="请选择状态" clearable class="!w-200px">
          <el-option label="待跟进" :value="0" />
          <el-option label="跟进中" :value="1" />
          <el-option label="已转化" :value="2" />
          <el-option label="已关闭" :value="3" />
        </el-select>
      </el-form-item>
      <el-form-item label="创建时间" prop="createTime">
        <el-date-picker
          v-model="queryParams.createTime"
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
      <el-table-column label="企业名称" align="center" prop="enterpriseName" show-overflow-tooltip>
        <template #default="scope">
          <el-link type="primary" :underline="false" @click="openEntDetail(scope.row)">
            {{ scope.row.enterpriseName }}
          </el-link>
        </template>
      </el-table-column>
      <el-table-column label="资质类型" align="center" prop="clueType" width="140">
        <template #default="scope">
          <el-tag>{{ clueTypeText(scope.row.clueType) }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="注册地址" align="center" prop="registerAddress" show-overflow-tooltip />
      <el-table-column label="符合条件" align="center" prop="matchCondition" show-overflow-tooltip />
      <el-table-column label="线索来源" align="center" prop="source" width="110">
        <template #default="scope">
          {{ sourceText(scope.row.source) }}
        </template>
      </el-table-column>
      <el-table-column label="状态" align="center" prop="status" width="100">
        <template #default="scope">
          <el-tag :type="statusTagType(scope.row.status)">{{ statusText(scope.row.status) }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column
        label="创建时间"
        align="center"
        prop="createTime"
        :formatter="dateFormatter"
        width="170"
      />
      <el-table-column label="操作" align="center" width="100" fixed="right">
        <template #default="scope">
          <el-button link type="primary" @click="handleDetail(scope.row)">详情</el-button>
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

  <!-- 企业详情抽屉（点击企业名称打开） -->
  <EnterpriseDrawer v-model="entDetailVisible" :enterprise="entDetail" />
</template>

<script setup lang="ts">
import { dateFormatter } from '@/utils/formatTime'
import { getMemberCluePage, exportMemberClue } from '@/api/liqi/memberClue'
import download from '@/utils/download'
import EnterpriseDrawer from '@/views/park/enterpriseList/EnterpriseDrawer.vue'
import { detailFromParkEntity } from '@/views/park/enterpriseList/enterpriseData'

defineOptions({ name: 'EnterpriseMemberCluesMg' })

// 企业详情抽屉（点击企业名称）
const entDetailVisible = ref(false)
const entDetail = ref<any>(null)
const openEntDetail = (row: any) => {
  entDetail.value = detailFromParkEntity(row)
  entDetailVisible.value = true
}

const message = useMessage()

const loading = ref(true)
const list = ref<any[]>([])
const total = ref(0)
const exportLoading = ref(false)
const queryFormRef = ref()
const queryParams = reactive({
  pageNo: 1,
  pageSize: 10,
  enterpriseName: undefined,
  clueType: undefined,
  registerAddress: undefined,
  source: undefined,
  status: undefined,
  createTime: []
})

const clueTypeText = (v: number) =>
  ({ 0: '高新技术企业', 1: '科技型中小企业', 2: '专精特新' }[v] ?? '-')
const sourceText = (v: number) => ({ 0: '小程序', 1: 'PC端', 2: '系统匹配' }[v] ?? '-')
const statusText = (v: number) => ({ 0: '待跟进', 1: '跟进中', 2: '已转化', 3: '已关闭' }[v] ?? '-')
const statusTagType = (v: number) =>
  ({ 0: 'info', 1: 'warning', 2: 'success', 3: 'danger' }[v] ?? 'info')

/** 查询列表 */
const getList = async () => {
  loading.value = true
  try {
    const data = await getMemberCluePage(queryParams)
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
  queryParams.createTime = []
  handleQuery()
}

const handleDetail = (row: any) => {
  message.info(`线索「${row.enterpriseName}」详情（后续接入详情页）`)
}

/** 导出 */
const handleExport = async () => {
  try {
    await message.exportConfirm()
    exportLoading.value = true
    const data = await exportMemberClue(queryParams)
    download.excel(data, '会员线索.xls')
  } catch {
  } finally {
    exportLoading.value = false
  }
}

onMounted(() => {
  getList()
})
</script>
