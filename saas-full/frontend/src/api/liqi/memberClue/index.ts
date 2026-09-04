import request from '@/config/axios'

// 力企 - 会员线索（企业管理-会员线索管理）
export interface MemberClueVO {
  id: number
  enterpriseName: string
  clueType: number // 0=高新技术企业 1=科技型中小企业 2=专精特新
  registerAddress: string
  matchCondition: string
  source: number // 0=小程序 1=PC端 2=系统匹配
  status: number // 0=待跟进 1=跟进中 2=已转化 3=已关闭
  createTime: Date
}

// 分页查询
export const getMemberCluePage = (params: any) => {
  return request.get({ url: '/liqi/member-clue/page', params })
}

// 导出
export const exportMemberClue = (params: any) => {
  return request.download({ url: '/liqi/member-clue/export-excel', params })
}
