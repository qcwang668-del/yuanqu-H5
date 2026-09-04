import request from '@/config/axios'

// 力企 - 推送记录（政策找人 / 站内消息）
export const getPushMessagePage = (params: any) => {
  return request.get({ url: '/liqi/push-message/page', params })
}
// 运营定向推送一条政策：target=match 画像匹配会员 / all 全部已绑定会员
export const pushPolicy = (policyId: string, target: string) => {
  return request.post({ url: '/liqi/push-message/push?policyId=' + policyId + '&target=' + target })
}
// 园区政策：预览本园区可推送的候选企业名单（含匹配理由/是否已推）
export const getParkCandidates = (policyId: string) => {
  return request.get({ url: '/liqi/push-message/park-candidates?policyId=' + policyId })
}
// 园区政策：推送给勾选的会员 userIds
export const pushParkPolicy = (policyId: string, userIds: (string | number)[]) => {
  return request.post({ url: '/liqi/push-message/park-push?policyId=' + policyId, data: { userIds } })
}
