import request from '@/config/axios'

// 力企 - APP 用户（平台管理-用户管理）
export interface AppUserVO {
  id: number
  userName: string
  phone: string
  source: number // 0=小程序 1=PC端
  maintainEnterprise: string
  promoteCount: number
  firstPromoter: string
  secondPromoter: string
  registerTime: Date
  lastLoginTime: Date
  createTime: Date
}

// 分页查询
export const getAppUserPage = (params: any) => {
  return request.get({ url: '/liqi/app-user/page', params })
}

// 详情
export const getAppUser = (id: number) => {
  return request.get({ url: '/liqi/app-user/get?id=' + id })
}

// 新增
export const createAppUser = (data: AppUserVO) => {
  return request.post({ url: '/liqi/app-user/create', data })
}

// 修改
export const updateAppUser = (data: AppUserVO) => {
  return request.put({ url: '/liqi/app-user/update', data })
}

// 删除
export const deleteAppUser = (id: number) => {
  return request.delete({ url: '/liqi/app-user/delete?id=' + id })
}

// 导出
export const exportAppUser = (params: any) => {
  return request.download({ url: '/liqi/app-user/export-excel', params })
}
