import request from '@/config/axios'

// 力企 - 匹配线索（平台管理-匹配线索管理）
export interface MatchClueVO {
  id: number
  reserveUserName: string
  reservePhone: string
  source: number // 0=小程序 1=PC端
  company: string
  content: string
  reserveType: string
  reserveWay: string
  reserveTime: Date
  recommendUserName: string
  createTime: Date
}

// 分页查询
export const getMatchCluePage = (params: any) => {
  return request.get({ url: '/liqi/match-clue/page', params })
}

// 导出
export const exportMatchClue = (params: any) => {
  return request.download({ url: '/liqi/match-clue/export-excel', params })
}
