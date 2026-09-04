import request from '@/config/axios'

// 力企 - 园区政策发布（惠企运营）
export const getPolicyPage = (params: any) => {
  return request.get({ url: '/liqi/policy/page', params })
}
export const getPolicy = (id: number | string) => {
  return request.get({ url: '/liqi/policy/get', params: { id } })
}
export const createPolicy = (data: any) => {
  return request.post({ url: '/liqi/policy/create', data })
}
export const updatePolicy = (data: any) => {
  return request.put({ url: '/liqi/policy/update', data })
}
export const deletePolicy = (id: number | string) => {
  return request.delete({ url: '/liqi/policy/delete?id=' + id })
}
export const updatePolicyStatus = (id: number | string, status: number) => {
  return request.put({ url: '/liqi/policy/update-status?id=' + id + '&status=' + status })
}
