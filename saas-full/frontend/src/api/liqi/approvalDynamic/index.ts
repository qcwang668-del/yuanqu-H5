import request from '@/config/axios'

// 力企 - 企业获批动态（企业管理-企业获批动态）
export interface ApprovalDynamicVO {
  id: number
  enterpriseName: string
  creditCode: string
  legalPerson: string
  approvalProject: string
  approvalTime: Date
  status: number // 0=正常 1=异常
  createTime: Date
}

// 分页查询
export const getApprovalDynamicPage = (params: any) => {
  return request.get({ url: '/liqi/approval-dynamic/page', params })
}

// 导出
export const exportApprovalDynamic = (params: any) => {
  return request.download({ url: '/liqi/approval-dynamic/export-excel', params })
}
