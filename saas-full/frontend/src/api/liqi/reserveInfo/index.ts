import request from '@/config/axios'

// 力企 - 预留信息（平台管理-预留信息管理）
export interface ReserveInfoVO {
  id: number
  reserveUserName: string
  reservePhone: string
  source: number // 1=小程序 2=PC端
  company: string
  entityId: number
  content: string
  reserveType: number // 1=项目详情 4=企业详情
  reserveWay: number // 1=我要申报 2=微信咨询 3=电话咨询
  relationId: number
  recommendUserName: string
  updateTime: Date
  createTime: Date
}

// 分页查询
export const getReserveInfoPage = (params: any) => {
  return request.get({ url: '/liqi/reserve-info/page', params })
}

// 导出
export const exportReserveInfo = (params: any) => {
  return request.download({ url: '/liqi/reserve-info/export-excel', params })
}
