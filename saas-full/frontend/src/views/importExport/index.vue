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
      <el-form-item label="文件名称" prop="fileName">
        <el-input
          v-model="queryParams.fileName"
          placeholder="请输入文件名进行查询"
          clearable
          class="!w-200px"
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="类型" prop="type">
        <el-select v-model="queryParams.type" placeholder="请选择类型" clearable class="!w-200px">
          <el-option label="导入" :value="0" />
          <el-option label="导出" :value="1" />
        </el-select>
      </el-form-item>
      <el-form-item label="模块" prop="module">
        <el-input
          v-model="queryParams.module"
          placeholder="请输入模块"
          clearable
          class="!w-200px"
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <el-select v-model="queryParams.status" placeholder="请选择状态" clearable class="!w-200px">
          <el-option label="处理中" :value="0" />
          <el-option label="成功" :value="1" />
          <el-option label="失败" :value="2" />
        </el-select>
      </el-form-item>
      <el-form-item label="操作时间" prop="createTime">
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
      <el-table-column label="文件名称" align="center" prop="fileName" show-overflow-tooltip />
      <el-table-column label="类型" align="center" prop="type" width="90">
        <template #default="scope">
          <el-tag :type="scope.row.type === 0 ? 'success' : 'warning'">
            {{ scope.row.type === 0 ? '导入' : '导出' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="模块" align="center" prop="module" />
      <el-table-column label="状态" align="center" prop="status" width="90">
        <template #default="scope">
          <el-tag :type="statusTagType(scope.row.status)">
            {{ statusText(scope.row.status) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="文件地址" align="center" prop="fileUrl" show-overflow-tooltip>
        <template #default="scope">
          <el-link
            v-if="scope.row.fileUrl"
            type="primary"
            :href="scope.row.fileUrl"
            target="_blank"
          >
            下载
          </el-link>
          <span v-else>-</span>
        </template>
      </el-table-column>
      <el-table-column label="错误信息" align="center" prop="errMsg" show-overflow-tooltip />
      <el-table-column
        label="操作时间"
        align="center"
        prop="createTime"
        :formatter="dateFormatter"
        width="170"
      />
      <el-table-column label="操作" align="center" width="100" fixed="right">
        <template #default="scope">
          <el-button link type="danger" @click="handleDelete(scope.row.id)">删除</el-button>
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
import { getImportExportPage, exportImportExport, deleteImportExport } from '@/api/liqi/importExport'
import download from '@/utils/download'

defineOptions({ name: 'ImportExport' })

const message = useMessage()

const loading = ref(true)
const list = ref<any[]>([])
const total = ref(0)
const exportLoading = ref(false)
const queryFormRef = ref()
const queryParams = reactive({
  pageNo: 1,
  pageSize: 10,
  fileName: undefined,
  type: undefined,
  module: undefined,
  status: undefined,
  createTime: []
})

const statusText = (status: number) => {
  return status === 1 ? '成功' : status === 2 ? '失败' : '处理中'
}
const statusTagType = (status: number) => {
  return status === 1 ? 'success' : status === 2 ? 'danger' : 'info'
}

/** 查询列表 */
const getList = async () => {
  loading.value = true
  try {
    const data = await getImportExportPage(queryParams)
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

/** 删除 */
const handleDelete = async (id: number) => {
  try {
    await message.delConfirm()
    await deleteImportExport(id)
    message.success('删除成功')
    await getList()
  } catch {}
}

/** 导出 */
const handleExport = async () => {
  try {
    await message.exportConfirm()
    exportLoading.value = true
    const data = await exportImportExport(queryParams)
    download.excel(data, '我的导入导出记录.xls')
  } catch {
  } finally {
    exportLoading.value = false
  }
}

onMounted(() => {
  getList()
})
</script>
