<template>
  <!-- 搜索 -->
  <ContentWrap>
    <el-form class="-mb-15px" :model="queryParams" ref="queryFormRef" :inline="true" label-width="90px">
      <el-form-item label="政策标题" prop="title">
        <el-input v-model="queryParams.title" placeholder="请输入政策标题" clearable class="!w-200px" @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item label="分类" prop="category">
        <el-select v-model="queryParams.category" placeholder="全部分类" clearable class="!w-160px">
          <el-option v-for="c in CATEGORIES" :key="c" :label="c" :value="c" />
        </el-select>
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <el-select v-model="queryParams.status" placeholder="全部状态" clearable class="!w-140px">
          <el-option label="已上架" :value="0" />
          <el-option label="已下架" :value="1" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button @click="handleQuery"><Icon icon="ep:search" class="mr-5px" />搜索</el-button>
        <el-button @click="resetQuery"><Icon icon="ep:refresh" class="mr-5px" />重置</el-button>
        <el-button type="primary" plain @click="openForm()"><Icon icon="ep:plus" class="mr-5px" />发布园区政策</el-button>
      </el-form-item>
    </el-form>
  </ContentWrap>

  <!-- 列表 -->
  <ContentWrap>
    <el-table v-loading="loading" :data="list" :stripe="true">
      <el-table-column label="序号" type="index" align="center" width="60" />
      <el-table-column label="政策标题" prop="title" min-width="240" show-overflow-tooltip />
      <el-table-column label="园区/发布主体" prop="parkName" align="center" width="160" show-overflow-tooltip />
      <el-table-column label="最高补贴(万)" prop="subsidyMax" align="center" width="110">
        <template #default="s">{{ s.row.subsidyMax || '—' }}</template>
      </el-table-column>
      <el-table-column label="地区" prop="region" align="center" width="130" show-overflow-tooltip />
      <el-table-column label="截止日期" prop="deadline" align="center" width="110">
        <template #default="s">{{ s.row.deadline || '长期' }}</template>
      </el-table-column>
      <el-table-column label="发布日期" prop="publishDate" align="center" width="110" />
      <el-table-column label="状态" prop="status" align="center" width="90">
        <template #default="s">
          <el-tag :type="s.row.status === 0 ? 'success' : 'info'">{{ s.row.status === 0 ? '已上架' : '已下架' }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" width="270" fixed="right">
        <template #default="s">
          <el-button link type="primary" @click="openForm(s.row.id)">编辑</el-button>
          <el-button link type="success" @click="openPush(s.row)"><Icon icon="ep:promotion" class="mr-2px" />推送企业</el-button>
          <el-button link :type="s.row.status === 0 ? 'warning' : 'success'" @click="toggleStatus(s.row)">
            {{ s.row.status === 0 ? '下架' : '上架' }}
          </el-button>
          <el-button link type="danger" @click="handleDelete(s.row.id)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    <Pagination :total="total" v-model:page="queryParams.pageNo" v-model:limit="queryParams.pageSize" @pagination="getList" />
  </ContentWrap>

  <!-- 新增/编辑弹窗 -->
  <Dialog v-model="dialog.visible" :title="dialog.title" width="760px">
    <el-form ref="formRef" :model="form" :rules="rules" label-width="110px">
      <el-form-item label="政策标题" prop="title">
        <el-input v-model="form.title" placeholder="请输入政策标题" />
      </el-form-item>
      <el-row :gutter="12">
        <el-col :span="12">
          <el-form-item label="园区/发布主体" prop="parkName">
            <el-input v-model="form.parkName" placeholder="如 深圳湾生态科技园" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="发布部门">
            <el-input v-model="form.publishOrg" placeholder="发布部门/来源" />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row :gutter="12">
        <el-col :span="8">
          <el-form-item label="最高补贴(万)">
            <el-input v-model="form.subsidyMax" placeholder="如 20.00" />
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="所属地区">
            <el-input v-model="form.region" placeholder="如 深圳市/南山区" />
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="所属行业">
            <el-input v-model="form.industry" placeholder="如 科技服务" />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row :gutter="12">
        <el-col :span="8">
          <el-form-item label="分类">
            <el-select v-model="form.category" placeholder="选择分类" clearable class="!w-full">
              <el-option v-for="c in CATEGORIES" :key="c" :label="c" :value="c" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="截止日期">
            <el-date-picker v-model="form.deadline" type="date" value-format="YYYY-MM-DD" placeholder="长期有效可不填" class="!w-full" />
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="发布日期">
            <el-date-picker v-model="form.publishDate" type="date" value-format="YYYY-MM-DD" placeholder="默认今天" class="!w-full" />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row :gutter="12">
        <el-col :span="12">
          <el-form-item label="申报联系人">
            <el-input v-model="form.contactName" placeholder="园区服务联系人" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="咨询电话">
            <el-input v-model="form.contactPhone" placeholder="咨询/申报电话" />
          </el-form-item>
        </el-col>
      </el-row>
      <el-form-item label="标签">
        <el-input v-model="form.tags" placeholder="多个标签用 ; 分隔，如 园区发布;研发补贴" />
      </el-form-item>
      <el-form-item label="摘要">
        <el-input v-model="form.summary" type="textarea" :rows="2" placeholder="一句话摘要" />
      </el-form-item>
      <el-form-item label="政策正文">
        <el-input v-model="form.content" type="textarea" :rows="6" placeholder="政策正文/申报条件/材料清单（支持换行）" />
      </el-form-item>
      <el-form-item label="原文链接">
        <el-input v-model="form.sourceUrl" placeholder="外部原文链接（选填）" />
      </el-form-item>
      <el-form-item label="可见范围">
        <el-radio-group v-model="form.visibleScope">
          <el-radio label="all">全部可见</el-radio>
          <el-radio label="park">仅本园区</el-radio>
          <el-radio label="region">仅本地区</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="状态">
        <el-radio-group v-model="form.status">
          <el-radio :label="0">立即上架</el-radio>
          <el-radio :label="1">存为草稿（下架）</el-radio>
        </el-radio-group>
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="dialog.visible = false">取消</el-button>
      <el-button type="primary" @click="submitForm">保存</el-button>
    </template>
  </Dialog>

  <!-- 推送企业对话框（园区运营筛选本园区符合企业并勾选推送） -->
  <Dialog v-model="pushDialog.visible" :title="pushDialog.title" width="860px">
    <div class="mb-10px text-13px" style="color:#606266;line-height:1.6">
      已筛出本园区「<b style="color:#0066ff">{{ pushDialog.parkName }}</b>」的绑定企业，按画像匹配排序；
      默认勾选「画像符合且未推送」的企业，可手动调整。
    </div>
    <el-table ref="pushTableRef" v-loading="pushDialog.loading" :data="pushDialog.list" :stripe="true"
      max-height="440" row-key="userId" @selection-change="onPushSelect">
      <el-table-column type="selection" width="48" align="center" :selectable="(r) => !r.pushed" />
      <el-table-column label="企业名称" prop="enterpriseName" min-width="190" show-overflow-tooltip />
      <el-table-column label="法人" prop="legalPerson" width="80" align="center" />
      <el-table-column label="行业" prop="industry" width="100" align="center" show-overflow-tooltip />
      <el-table-column label="地区" prop="region" width="110" align="center" show-overflow-tooltip />
      <el-table-column label="画像" width="70" align="center">
        <template #default="s">
          <el-tag v-if="s.row.matched" type="success" size="small">符合</el-tag>
          <el-tag v-else type="info" size="small">—</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="状态" width="76" align="center">
        <template #default="s">
          <el-tag v-if="s.row.pushed" type="warning" size="small">已推</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="匹配理由" min-width="170">
        <template #default="s">
          <span style="color:#909399;font-size:12px">{{ (s.row.reasons || []).join('；') || '—' }}</span>
        </template>
      </el-table-column>
    </el-table>
    <template #footer>
      <el-button @click="pushDialog.visible = false">取消</el-button>
      <el-button type="primary" :loading="pushDialog.submitting" @click="submitPush">
        确认推送（{{ pushDialog.checked.length }} 家）
      </el-button>
    </template>
  </Dialog>
</template>

<script setup lang="ts">
import { getPolicyPage, createPolicy, updatePolicy, deletePolicy, updatePolicyStatus, getPolicy } from '@/api/liqi/policyOps'
import { getParkCandidates, pushParkPolicy } from '@/api/liqi/pushMessage'

defineOptions({ name: 'LiqiPolicyPublish' })

const CATEGORIES = ['专精特新', '研发投入', '技术改造', '设备更新', '高企认定', '创业扶持']
const message = useMessage()

const loading = ref(true)
const list = ref<any[]>([])
const total = ref(0)
const queryFormRef = ref()
const queryParams = reactive({ pageNo: 1, pageSize: 10, title: undefined, category: undefined, status: undefined })

const dialog = reactive({ visible: false, title: '' })
const formRef = ref()
const form = reactive<any>({})
const rules = { title: [{ required: true, message: '请输入政策标题', trigger: 'blur' }] }

const getList = async () => {
  loading.value = true
  try {
    const data = await getPolicyPage(queryParams)
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
  form.visibleScope = 'all'
  form.status = 0
  if (id) {
    const data = await getPolicy(id)
    Object.assign(form, data)
    dialog.title = '编辑园区政策'
  } else {
    dialog.title = '发布园区政策'
  }
  dialog.visible = true
}
const submitForm = async () => {
  await formRef.value?.validate()
  if (form.id) {
    await updatePolicy(form)
    message.success('修改成功')
  } else {
    await createPolicy(form)
    message.success('发布成功')
  }
  dialog.visible = false
  getList()
}
const toggleStatus = async (row: any) => {
  const next = row.status === 0 ? 1 : 0
  await updatePolicyStatus(row.id, next)
  message.success(next === 0 ? '已上架' : '已下架')
  getList()
}
const handleDelete = async (id: number) => {
  await message.delConfirm('确定删除该园区政策？')
  await deletePolicy(id)
  message.success('删除成功')
  getList()
}

// ---- 推送企业（园区运营手动筛选本园区符合企业） ----
const pushTableRef = ref()
const pushDialog = reactive({
  visible: false,
  title: '',
  loading: false,
  submitting: false,
  policyId: '',
  parkName: '',
  list: [] as any[],
  checked: [] as any[]
})
const onPushSelect = (rows: any[]) => { pushDialog.checked = rows }
const openPush = async (row: any) => {
  const policyId = 'L' + row.id
  pushDialog.visible = true
  pushDialog.title = '推送园区政策 · ' + row.title
  pushDialog.loading = true
  pushDialog.list = []
  pushDialog.checked = []
  pushDialog.policyId = policyId
  pushDialog.parkName = row.parkName || '本园区'
  try {
    const data = (await getParkCandidates(policyId)) || []
    pushDialog.list = data
    // 默认勾选：画像符合 且 未推送 的企业
    await nextTick()
    data.forEach((item: any) => {
      if (item.matched && !item.pushed) {
        pushTableRef.value?.toggleRowSelection(item, true)
      }
    })
    if (!data.length) {
      message.info('本园区暂无绑定企业，企业在 H5 绑定后会自动归属园区')
    }
  } finally {
    pushDialog.loading = false
  }
}
const submitPush = async () => {
  const userIds = pushDialog.checked.map((c: any) => c.userId)
  if (!userIds.length) {
    message.warning('请至少勾选一家企业')
    return
  }
  await message.confirm(`确定推送给选中的 ${userIds.length} 家企业？`)
  pushDialog.submitting = true
  try {
    const n = await pushParkPolicy(pushDialog.policyId, userIds)
    message.success(`已成功推送 ${n} 条消息`)
    pushDialog.visible = false
  } finally {
    pushDialog.submitting = false
  }
}

getList()
</script>
