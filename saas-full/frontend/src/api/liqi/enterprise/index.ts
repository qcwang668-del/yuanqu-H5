import request from '@/config/axios'

// 力企 - 企业库（深圳湾生态园）
export const getEnterprisePage = (params: any) => {
  return request.get({ url: '/liqi/enterprise/page', params })
}

// 企业详情（主表全字段 + 股东子表）
export const getEnterpriseDetail = (id: number | string) => {
  return request.get({ url: '/liqi/enterprise/get', params: { id } })
}

// 按需实时调天眼查回填工商信息 + 股东
export const enrichEnterprise = (id: number | string) => {
  return request.post({ url: '/liqi/enterprise/enrich', params: { id } })
}
