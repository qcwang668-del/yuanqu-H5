import request from '@/config/axios'

// 力企 - 评分线索（平台管理-评分线索管理）
export interface ScoringClueVO {
  id: number
  userName: string
  phone: string
  clueSource: number // 1=小程序 2=PC端
  companyName: string
  contactInformation: number // 1=微信咨询 2=电话咨询
  scoreTime: Date
  createTime: Date
}

// 分页查询
export const getScoringCluePage = (params: any) => {
  return request.get({ url: '/liqi/scoring-clue/page', params })
}

// 导出
export const exportScoringClue = (params: any) => {
  return request.download({ url: '/liqi/scoring-clue/export-excel', params })
}
