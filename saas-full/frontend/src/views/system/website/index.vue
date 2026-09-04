<template>
  <ContentWrap>
    <el-form
      ref="formRef"
      :model="formData"
      :rules="formRules"
      label-width="120px"
      v-loading="loading"
    >
      <el-form-item label="品牌名称" prop="brandName">
        <el-input
          v-model="formData.brandName"
          placeholder="请输入品牌名称"
          class="!w-400px"
        />
      </el-form-item>
      <el-form-item label="二级域名" prop="domainName">
        <el-input
          v-model="formData.domainName"
          placeholder="请输入二级域名"
          class="!w-400px"
        />
      </el-form-item>
      <el-form-item label="重定向域名" prop="redirectDomainName">
        <el-input
          v-model="formData.redirectDomainName"
          placeholder="请输入重定向域名"
          class="!w-400px"
        />
      </el-form-item>
      <el-form-item label="网站备案号" prop="icpNum">
        <el-input
          v-model="formData.icpNum"
          placeholder="请输入网站备案号"
          class="!w-400px"
        />
      </el-form-item>
      <el-form-item label="品牌LOGO（横向）" prop="brandLogoHorizontal">
        <el-input
          v-model="formData.brandLogoHorizontal"
          placeholder="请输入品牌LOGO（横向）图片地址"
          class="!w-400px"
        />
      </el-form-item>
      <el-form-item label="品牌LOGO（竖向）" prop="brandLogoVertical">
        <el-input
          v-model="formData.brandLogoVertical"
          placeholder="请输入品牌LOGO（竖向）图片地址"
          class="!w-400px"
        />
      </el-form-item>
      <el-form-item label="小程序二维码" prop="smallProgramQrCode">
        <el-input
          v-model="formData.smallProgramQrCode"
          placeholder="请输入小程序二维码图片地址"
          class="!w-400px"
        />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" :loading="saveLoading" @click="handleSave">
          <Icon icon="ep:check" class="mr-5px" />保存
        </el-button>
      </el-form-item>
    </el-form>
  </ContentWrap>
</template>

<script setup lang="ts">
import { getWebsiteConfig, saveWebsiteConfig } from '@/api/liqi/websiteConfig'

defineOptions({ name: 'SystemWebsite' })

const message = useMessage()

const loading = ref(false)
const saveLoading = ref(false)
const formRef = ref()
const formData = reactive({
  id: undefined as number | undefined,
  domainName: '',
  redirectDomainName: '',
  icpNum: '',
  brandName: '',
  brandLogoHorizontal: '',
  brandLogoVertical: '',
  smallProgramQrCode: ''
})
const formRules = reactive({
  brandName: [{ required: true, message: '请输入品牌名称', trigger: 'blur' }]
})

/** 读取配置回填 */
const getConfig = async () => {
  loading.value = true
  try {
    const data = await getWebsiteConfig()
    if (data) {
      Object.assign(formData, data)
    }
  } finally {
    loading.value = false
  }
}

/** 保存配置 */
const handleSave = async () => {
  await formRef.value?.validate()
  saveLoading.value = true
  try {
    await saveWebsiteConfig(formData as any)
    message.success('保存成功')
    await getConfig()
  } finally {
    saveLoading.value = false
  }
}

onMounted(() => {
  getConfig()
})
</script>
