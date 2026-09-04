<template>
  <!-- 搜索 -->
  <ContentWrap>
    <el-form class="-mb-15px" :model="queryParams" ref="queryFormRef" :inline="true" label-width="90px">
      <el-form-item label="标题" prop="title">
        <el-input v-model="queryParams.title" placeholder="消息标题" clearable class="!w-200px" @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item label="类型" prop="type">
        <el-select v-model="queryParams.type" placeholder="全部类型" clearable class="!w-150px">
          <el-option label="政策推送" :value="1" />
          <el-option label="临期提醒" :value="2" />
          <el-option label="系统通知" :value="3" />
        </el-select>
      </el-form-item>
      <el-form-item label="推送方式" prop="bizType">
        <el-select v-model="queryParams.bizType" placeholder="全部" clearable class="!w-140px">
          <el-option label="系统自动" value="auto" />
          <el-option label="运营定向" value="manual" />
        </el-select>
      </el-form-item>
      <el-form-item label="政策来源" prop="source">
        <el-select v-model="queryParams.source" placeholder="全部" clearable class="!w-140px">
          <el-option label="外部采集政策" value="external" />
          <el-option label="园区发布政策" value="park" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button @click="handleQuery"><Icon icon="ep:search" class="mr-5px" />搜索</el-button>
        <el-button @click="resetQuery"><Icon icon="ep:refresh" class="mr-5px" />重置</el-button>
        <el-button type="primary" plain @click="openPush"><Icon icon="ep:promotion" class="mr-5px" />定向推送政策</el-button>
      </el-form-item>
    </el-form>
  </ContentWrap>

  <!-- 列表 -->
  <ContentWrap>
    <el-table v-loading="loading" :data="list" :stripe="true">
      <el-table-column label="序号" type="index" align="center" width="60" />
      <el-table-column label="消息标题" prop="title" min-width="240" show-overflow-tooltip />
      <el-table-column label="内容" prop="content" min-width="260" show-overflow-tooltip />
      <el-table-column label="接收用户ID" prop="userId" align="center" width="110" />
      <el-table-column label="类型" prop="type" align="center" width="100">
        <template #default="s">{{ ['', '政策推送', '临期提醒', '系统通知'][s.row.type] || '政策推送' }}</template>
      </el-table-column>
      <el-table-column label="政策来源" prop="source" align="center" width="110">
        <template #default="s">
          <el-tag :type="s.row.source === 'park' ? 'success' : 'primary'" size="small">
            {{ s.row.source === 'park' ? '园区发布' : '外部政策' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="推送方式" prop="bizType" align="center" width="100">
        <template #default="s">
          <el-tag :type="s.row.bizType === 'manual' ? 'warning' : 'info'">{{ s.row.bizType === 'manual' ? '运营定向' : '系统自动' }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="已读" prop="isRead" align="center" width="80">
        <template #default="s">
          <el-tag :type="s.row.isRead ? 'success' : 'danger'" size="small">{{ s.row.isRead ? '已读' : '未读' }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="推送时间" prop="createTime" :formatter="dateFormatter" align="center" width="170" />
    </el-table>
    <Pagination :total="total" v-model:page="queryParams.pageNo" v-model:limit="queryParams.pageSize" @pagination="getList" />
  </ContentWrap>

  <!-- 定向推送弹窗 -->
  <Dialog v-model="dialog.visible" title="定向推送一条政策" width="560px">
    <el-alert type="info" :closable="false" show-icon style="margin-bottom:16px"
      title="选择园区政策与推送范围，系统会向符合条件的已绑定企业会员发送站内消息（自动去重）。" />
    <el-form label-width="100px">
      <el-form-item label="选择政策" required>
        <el-select v-model="push.policyId" placeholder="选择已上架的园区政策" filterable class="!w-full">
          <el-option v-for="p in policies" :key="p.id" :label="p.title" :value="'L' + p.id" />
        </el-select>
      </el-form-item>
      <el-form-item label="推送范围">
        <el-radio-group v-model="push.target">
          <el-radio label="match">画像匹配的会员（推荐）</el-radio>
          <el-radio label="all">全部已绑定企业会员</el-radio>
        </el-radio-group>
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="dialog.visible = false">取消</el-button>
      <el-button type="primary" :loading="pushing" @click="submitPush">确认推送</el-button>
    </template>
  </Dialog>
</template>

<script setup lang="ts">
import { dateFormatter } from '@/utils/formatTime'
import { getPushMessagePage, pushPolicy } from '@/api/liqi/pushMessage'
import { getPolicyPage } from '@/api/liqi/policyOps'

defineOptions({ name: 'LiqiPushMessage' })

const message = useMessage()
const loading = ref(true)
const list = ref<any[]>([])
const total = ref(0)
const queryFormRef = ref()
const queryParams = reactive({ pageNo: 1, pageSize: 10, title: undefined, type: undefined, bizType: undefined, source: undefined })

const dialog = reactive({ visible: false })
const pushing = ref(false)
const policies = ref<any[]>([])
const push = reactive<any>({ policyId: '', target: 'match' })

const getList = async () => {
  loading.value = true
  try {
    const data = await getPushMessagePage(queryParams)
    list.value = data.list
    total.value = data.total
  } finally {
    loading.value = false
  }
}
const handleQuery = () => { queryParams.pageNo = 1; getList() }
const resetQuery = () => { queryFormRef.value?.resetFields(); handleQuery() }

const openPush = async () => {
  push.policyId = ''
  push.target = 'match'
  const data = await getPolicyPage({ pageNo: 1, pageSize: 100, status: 0 })
  policies.value = data.list || []
  dialog.visible = true
}
const submitPush = async () => {
  if (!push.policyId) {
    message.warning('请选择要推送的政策')
    return
  }
  pushing.value = true
  try {
    const n = await pushPolicy(push.policyId, push.target)
    message.success(`推送完成，共发送 ${n} 条消息`)
    dialog.visible = false
    getList()
  } finally {
    pushing.value = false
  }
}

getList()
</script>
