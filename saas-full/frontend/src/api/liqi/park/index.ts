import request from '@/config/axios'

// 力企 - 园区
export interface ParkVO {
  id: number
  parkName: string
  addressKeyword: string
  city: string
}

// 获取启用园区列表（会员关联园区下拉用）
export const getParkList = () => {
  return request.get({ url: '/liqi/park/list' })
}
