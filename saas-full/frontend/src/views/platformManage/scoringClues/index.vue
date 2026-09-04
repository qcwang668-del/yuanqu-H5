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
      <el-form-item label="用户名" prop="userName">
        <el-input
          v-model="queryParams.userName"
          placeholder="请输入用户名"
          clearable
          class="!w-200px"
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="手机号" prop="phone">
        <el-input
          v-model="queryParams.phone"
          placeholder="请输入用户手机号"
          clearable
          class="!w-200px"
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="来源" prop="clueSource">
        <el-select
          v-model="queryParams.clueSource"
          placeholder="请选择来源"
          clearable
          class="!w-200px"
        >
          <el-option label="小程序" :value="1" />
          <el-option label="PC端" :value="2" />
        </el-select>
      </el-form-item>
      <el-form-item label="参与评分公司名称" prop="companyName">
        <el-input
          v-model="queryParams.companyName"
          placeholder="请输入参与评分公司名称"
          clearable
          class="!w-200px"
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="咨询方式" prop="contactInformation">
        <el-select
          v-model="queryParams.contactInformation"
          placeholder="请选择咨询方式"
          clearable
          class="!w-200px"
        >
          <el-option label="微信咨询" :value="1" />
          <el-option label="电话咨询" :value="2" />
        </el-select>
      </el-form-item>
      <el-form-item label="评分时间" prop="scoreTime">
        <el-date-picker
          v-model="queryParams.scoreTime"
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
      <el-table-column label="用户名" align="center" prop="userName" />
      <el-table-column label="手机号" align="center" prop="phone" width="130" />
      <el-table-column label="来源" align="center" prop="clueSource" width="100">
        <template #default="scope">
          <el-tag :type="scope.row.clueSource === 1 ? 'success' : 'warning'">
            {{ scope.row.clueSource === 1 ? '小程序' : 'PC端' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column
        label="公司名称"
        align="center"
        prop="companyName"
        show-overflow-tooltip
      />
      <el-table-column label="咨询方式" align="center" prop="contactInformation" width="120">
        <template #default="scope">
          <span v-if="scope.row.contactInformation === 1">微信咨询</span>
          <span v-else-if="scope.row.contactInformation === 2">电话咨询</span>
          <span v-else>--</span>
        </template>
      </el-table-column>
      <el-table-column
        label="评分时间"
        align="center"
        prop="scoreTime"
        :formatter="dateFormatter"
        width="180"
      />
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
import { getScoringCluePage, exportScoringClue } from '@/api/liqi/scoringClue'
import download from '@/utils/download'

defineOptions({ name: 'PlatformScoringClues' })

const message = useMessage()

const loading = ref(true)
const list = ref<any[]>([])
const total = ref(0)
const exportLoading = ref(false)
const queryFormRef = ref()
const queryParams = reactive({
  pageNo: 1,
  pageSize: 10,
  userName: undefined,
  phone: undefined,
  clueSource: undefined,
  companyName: undefined,
  contactInformation: undefined,
  scoreTime: []
})

/** 查询列表 */
const getList = async () => {
  loading.value = true
  try {
    const data = await getScoringCluePage(queryParams)
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
  queryParams.scoreTime = []
  handleQuery()
}

/** 导出 */
const handleExport = async () => {
  try {
    await message.exportConfirm()
    exportLoading.value = true
    const data = await exportScoringClue(queryParams)
    download.excel(data, '评分线索.xls')
  } catch {
  } finally {
    exportLoading.value = false
  }
}

onMounted(() => {
  getList()
})
</script>
