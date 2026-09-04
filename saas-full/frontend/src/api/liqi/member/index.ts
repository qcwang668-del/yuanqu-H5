import request from '@/config/axios'

// 力企 - 会员管理（企业管理-会员管理系统）
export interface MemberVO {
  id: number
  enterpriseName: string
  legalPerson: string
  registerAddress: string
  phone: string
  responsiblePersonName: string
  responsiblePersonPhone: string
  contactPersonName: string
  contactPersonPhone: string
  isPushedCustomer: number // 0=否 1=是
  creatorName: string
  createTime: Date
}

// 分页查询
export const getMemberPage = (params: any) => {
  return request.get({ url: '/liqi/member/page', params })
}

// 导出
export const exportMember = (params: any) => {
  return request.download({ url: '/liqi/member/export-excel', params })
}
