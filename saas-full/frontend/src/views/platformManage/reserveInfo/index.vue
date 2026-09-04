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
      <el-form-item label="用户名" prop="reserveUserName">
        <el-input
          v-model="queryParams.reserveUserName"
          placeholder="请输入用户名"
          clearable
          class="!w-200px"
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="手机号" prop="reservePhone">
        <el-input
          v-model="queryParams.reservePhone"
          placeholder="请输入手机号"
          clearable
          class="!w-200px"
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="来源" prop="source">
        <el-select v-model="queryParams.source" placeholder="请选择来源" clearable class="!w-200px">
          <el-option label="小程序" :value="1" />
          <el-option label="PC端" :value="2" />
        </el-select>
      </el-form-item>
      <el-form-item label="项目名称" prop="content">
        <el-input
          v-model="queryParams.content"
          placeholder="请输入项目名称"
          clearable
          class="!w-200px"
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="预留信息入口" prop="reserveType">
        <el-select
          v-model="queryParams.reserveType"
          placeholder="请选择"
          clearable
          class="!w-200px"
        >
          <el-option label="项目详情" :value="1" />
          <el-option label="企业详情" :value="4" />
        </el-select>
      </el-form-item>
      <el-form-item label="预留方式" prop="reserveWay">
        <el-select
          v-model="queryParams.reserveWay"
          placeholder="请选择预留方式"
          clearable
          class="!w-200px"
        >
          <el-option label="我要申报" :value="1" />
          <el-option label="微信咨询" :value="2" />
          <el-option label="电话咨询" :value="3" />
        </el-select>
      </el-form-item>
      <el-form-item label="预留信息时间" prop="createTime">
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
      <el-table-column label="用户名" align="center" prop="reserveUserName" width="180" />
      <el-table-column label="手机号" align="center" prop="reservePhone" width="120" />
      <el-table-column label="来源" align="center" prop="source" width="100">
        <template #default="scope">
          {{ sourceText(scope.row.source) }}
        </template>
      </el-table-column>
      <el-table-column
        label="公司名称"
        align="center"
        prop="company"
        min-width="200"
        show-overflow-tooltip
      />
      <el-table-column
        label="申报内容"
        align="center"
        prop="content"
        min-width="200"
        show-overflow-tooltip
      />
      <el-table-column label="预留信息入口" align="center" prop="reserveType" width="120">
        <template #default="scope">
          {{ reserveTypeText(scope.row.reserveType) }}
        </template>
      </el-table-column>
      <el-table-column label="预留方式" align="center" prop="reserveWay" width="120">
        <template #default="scope">
          {{ reserveWayText(scope.row.reserveWay) }}
        </template>
      </el-table-column>
      <el-table-column
        label="预留信息时间"
        align="center"
        prop="updateTime"
        :formatter="dateFormatter"
        width="170"
      />
      <el-table-column label="推荐人" align="center" prop="recommendUserName" width="120">
        <template #default="scope">
          {{ scope.row.recommendUserName || '--' }}
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
</template>

<script setup lang="ts">
import { dateFormatter } from '@/utils/formatTime'
import { getReserveInfoPage, exportReserveInfo } from '@/api/liqi/reserveInfo'
import download from '@/utils/download'

defineOptions({ name: 'PlatformReserveInfo' })

const message = useMessage()

const loading = ref(true)
const list = ref<any[]>([])
const total = ref(0)
const exportLoading = ref(false)
const queryFormRef = ref()
const queryParams = reactive({
  pageNo: 1,
  pageSize: 10,
  reserveUserName: undefined,
  reservePhone: undefined,
  source: undefined,
  content: undefined,
  reserveType: undefined,
  reserveWay: undefined,
  createTime: []
})

const sourceText = (val: number) => (val === 1 ? '小程序' : val === 2 ? 'PC端' : '')
const reserveTypeText = (val: number) => (val === 1 ? '项目详情' : val === 4 ? '企业详情' : '')
const reserveWayText = (val: number) =>
  val === 1 ? '我要申报' : val === 2 ? '微信咨询' : val === 3 ? '电话咨询' : ''

/** 查询列表 */
const getList = async () => {
  loading.value = true
  try {
    const data = await getReserveInfoPage(queryParams)
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

/** 导出 */
const handleExport = async () => {
  try {
    await message.exportConfirm()
    exportLoading.value = true
    const data = await exportReserveInfo(queryParams)
    download.excel(data, '预留信息.xls')
  } catch {
  } finally {
    exportLoading.value = false
  }
}

onMounted(() => {
  getList()
})
</script>
