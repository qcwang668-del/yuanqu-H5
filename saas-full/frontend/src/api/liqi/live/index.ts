import request from '@/config/axios'

// 力企 - 专家直播大讲堂
export const getLivePage = (params: any) => {
  return request.get({ url: '/liqi/live/page', params })
}
export const getLive = (id: number | string) => {
  return request.get({ url: '/liqi/live/get', params: { id } })
}
export const createLive = (data: any) => {
  return request.post({ url: '/liqi/live/create', data })
}
export const updateLive = (data: any) => {
  return request.put({ url: '/liqi/live/update', data })
}
export const deleteLive = (id: number | string) => {
  return request.delete({ url: '/liqi/live/delete?id=' + id })
}
export const updateLiveStatus = (id: number | string, status: number) => {
  return request.put({ url: '/liqi/live/update-status?id=' + id + '&status=' + status })
}
