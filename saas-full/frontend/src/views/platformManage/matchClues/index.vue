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
          <el-option label="小程序" :value="0" />
          <el-option label="PC端" :value="1" />
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
      <el-form-item label="预留方式" prop="reserveWay">
        <el-input
          v-model="queryParams.reserveWay"
          placeholder="请输入预留方式"
          clearable
          class="!w-200px"
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="预留信息时间" prop="reserveTime">
        <el-date-picker
          v-model="queryParams.reserveTime"
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
      <el-table-column label="用户名" align="center" prop="reserveUserName" />
      <el-table-column label="手机号" align="center" prop="reservePhone" width="130" />
      <el-table-column label="来源" align="center" prop="source">
        <template #default="scope">
          <el-tag :type="scope.row.source === 0 ? 'success' : 'warning'">
            {{ scope.row.source === 0 ? '小程序' : 'PC端' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="公司名称" align="center" prop="company" show-overflow-tooltip />
      <el-table-column label="申报内容" align="center" prop="content" show-overflow-tooltip />
      <el-table-column label="预留信息入口" align="center" prop="reserveType" />
      <el-table-column label="预留方式" align="center" prop="reserveWay" />
      <el-table-column
        label="预留信息时间"
        align="center"
        prop="reserveTime"
        :formatter="dateFormatter"
        width="170"
      />
      <el-table-column label="推荐人" align="center" prop="recommendUserName" />
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
</template>

<script setup lang="ts">
import { dateFormatter } from '@/utils/formatTime'
import { getMatchCluePage, exportMatchClue } from '@/api/liqi/matchClue'
import download from '@/utils/download'

defineOptions({ name: 'PlatformMatchClues' })

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
  reserveWay: undefined,
  reserveTime: []
})

/** 查询列表 */
const getList = async () => {
  loading.value = true
  try {
    const data = await getMatchCluePage(queryParams)
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
  queryParams.reserveTime = []
  handleQuery()
}

const handleDetail = (row: any) => {
  message.info(`线索「${row.reserveUserName}」详情（后续接入详情页）`)
}

/** 导出 */
const handleExport = async () => {
  try {
    await message.exportConfirm()
    exportLoading.value = true
    const data = await exportMatchClue(queryParams)
    download.excel(data, '匹配线索.xls')
  } catch {
  } finally {
    exportLoading.value = false
  }
}

onMounted(() => {
  getList()
})
</script>
