<template>
  <!-- 搜索 -->
  <ContentWrap>
    <el-form class="-mb-15px" :model="queryParams" ref="queryFormRef" :inline="true" label-width="80px">
      <el-form-item label="标题" prop="title">
        <el-input v-model="queryParams.title" placeholder="直播标题" clearable class="!w-200px" @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item label="讲师" prop="lecturer">
        <el-input v-model="queryParams.lecturer" placeholder="讲师" clearable class="!w-150px" @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <el-select v-model="queryParams.status" placeholder="全部状态" clearable class="!w-140px">
          <el-option v-for="(t, i) in STATUS" :key="i" :label="t" :value="i" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button @click="handleQuery"><Icon icon="ep:search" class="mr-5px" />搜索</el-button>
        <el-button @click="resetQuery"><Icon icon="ep:refresh" class="mr-5px" />重置</el-button>
        <el-button type="primary" plain @click="openForm()"><Icon icon="ep:plus" class="mr-5px" />新增直播</el-button>
      </el-form-item>
    </el-form>
  </ContentWrap>

  <!-- 列表 -->
  <ContentWrap>
    <el-table v-loading="loading" :data="list" :stripe="true">
      <el-table-column label="序号" type="index" align="center" width="60" />
      <el-table-column label="直播标题" prop="title" min-width="240" show-overflow-tooltip />
      <el-table-column label="讲师" prop="lecturer" align="center" width="140" />
      <el-table-column label="开播时间" prop="startTime" :formatter="dateFormatter" align="center" width="170" />
      <el-table-column label="直播链接" align="center" width="90">
        <template #default="s">
          <el-link v-if="s.row.liveUrl" type="primary" :href="s.row.liveUrl" target="_blank">打开</el-link>
          <span v-else>—</span>
        </template>
      </el-table-column>
      <el-table-column label="回放链接" align="center" width="90">
        <template #default="s">
          <el-link v-if="s.row.replayUrl" type="success" :href="s.row.replayUrl" target="_blank">回放</el-link>
          <span v-else>—</span>
        </template>
      </el-table-column>
      <el-table-column label="状态" prop="status" align="center" width="100">
        <template #default="s">
          <el-tag :type="s.row.status === 1 ? 'danger' : s.row.status === 2 ? 'success' : s.row.status === 3 ? 'info' : 'primary'">
            {{ STATUS[s.row.status] }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" width="230" fixed="right">
        <template #default="s">
          <el-button link type="primary" @click="openForm(s.row.id)">编辑</el-button>
          <el-dropdown trigger="click" @command="(c) => changeStatus(s.row, c)">
            <el-button link type="warning">改状态<Icon icon="ep:arrow-down" class="ml-2px" /></el-button>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item v-for="(t, i) in STATUS" :key="i" :command="i" :disabled="i === s.row.status">{{ t }}</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
          <el-button link type="danger" @click="handleDelete(s.row.id)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    <Pagination :total="total" v-model:page="queryParams.pageNo" v-model:limit="queryParams.pageSize" @pagination="getList" />
  </ContentWrap>

  <!-- 新增/编辑弹窗 -->
  <Dialog v-model="dialog.visible" :title="dialog.title" width="680px">
    <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
      <el-form-item label="直播标题" prop="title">
        <el-input v-model="form.title" placeholder="如 高新企业认定全攻略" />
      </el-form-item>
      <el-row :gutter="12">
        <el-col :span="12">
          <el-form-item label="讲师">
            <el-input v-model="form.lecturer" placeholder="讲师/专家" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="讲师简介">
            <el-input v-model="form.lecturerDesc" placeholder="如 政策研究院专家" />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row :gutter="12">
        <el-col :span="12">
          <el-form-item label="开播时间">
            <el-date-picker v-model="form.startTime" type="datetime" value-format="YYYY-MM-DD HH:mm:ss" placeholder="选择开播时间" class="!w-full" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="结束时间">
            <el-date-picker v-model="form.endTime" type="datetime" value-format="YYYY-MM-DD HH:mm:ss" placeholder="选择结束时间" class="!w-full" />
          </el-form-item>
        </el-col>
      </el-row>
      <el-form-item label="直播间地址">
        <el-input v-model="form.liveUrl" placeholder="腾讯会议/视频号直播链接" />
      </el-form-item>
      <el-form-item label="回放地址">
        <el-input v-model="form.replayUrl" placeholder="回放视频链接（直播结束后填）" />
      </el-form-item>
      <el-form-item label="封面图">
        <el-input v-model="form.coverUrl" placeholder="封面图 URL（选填）" />
      </el-form-item>
      <el-form-item label="直播简介">
        <el-input v-model="form.summary" type="textarea" :rows="3" placeholder="本期内容简介" />
      </el-form-item>
      <el-row :gutter="12">
        <el-col :span="12">
          <el-form-item label="状态">
            <el-select v-model="form.status" class="!w-full">
              <el-option v-for="(t, i) in STATUS" :key="i" :label="t" :value="i" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="排序">
            <el-input-number v-model="form.sort" :min="0" />
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>
    <template #footer>
      <el-button @click="dialog.visible = false">取消</el-button>
      <el-button type="primary" @click="submitForm">保存</el-button>
    </template>
  </Dialog>
</template>

<script setup lang="ts">
import { dateFormatter } from '@/utils/formatTime'
import { getLivePage, getLive, createLive, updateLive, deleteLive, updateLiveStatus } from '@/api/liqi/live'

defineOptions({ name: 'LiqiLive' })

const STATUS = ['预告', '直播中', '回放', '已下架']
const message = useMessage()

const loading = ref(true)
const list = ref<any[]>([])
const total = ref(0)
const queryFormRef = ref()
const queryParams = reactive({ pageNo: 1, pageSize: 10, title: undefined, lecturer: undefined, status: undefined })

const dialog = reactive({ visible: false, title: '' })
const formRef = ref()
const form = reactive<any>({})
const rules = { title: [{ required: true, message: '请输入直播标题', trigger: 'blur' }] }

const getList = async () => {
  loading.value = true
  try {
    const data = await getLivePage(queryParams)
    list.value = data.list
    total.value = data.total
  } finally {
    loading.value = false
  }
}
const handleQuery = () => { queryParams.pageNo = 1; getList() }
const resetQuery = () => { queryFormRef.value?.resetFields(); handleQuery() }

const openForm = async (id?: number) => {
  Object.keys(form).forEach((k) => delete form[k])
  form.status = 0
  form.sort = 0
  if (id) {
    const data = await getLive(id)
    Object.assign(form, data)
    dialog.title = '编辑直播'
  } else {
    dialog.title = '新增直播'
  }
  dialog.visible = true
}
const submitForm = async () => {
  await formRef.value?.validate()
  if (form.id) {
    await updateLive(form)
    message.success('修改成功')
  } else {
    await createLive(form)
    message.success('新增成功')
  }
  dialog.visible = false
  getList()
}
const changeStatus = async (row: any, status: number) => {
  await updateLiveStatus(row.id, status)
  message.success('状态已更新')
  getList()
}
const handleDelete = async (id: number) => {
  await message.delConfirm('确定删除该直播？')
  await deleteLive(id)
  message.success('删除成功')
  getList()
}

getList()
</script>
