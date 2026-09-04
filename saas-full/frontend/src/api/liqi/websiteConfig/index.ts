import request from '@/config/axios'

// 力企 - 网站配置（系统管理-网站配置，单例配置）
export interface WebsiteConfigVO {
  id?: number
  domainName: string // 二级域名
  redirectDomainName: string // 重定向域名
  icpNum: string // 网站备案号
  brandName: string // 品牌名称
  brandLogoHorizontal: string // 品牌LOGO（横向）
  brandLogoVertical: string // 品牌LOGO（竖向）
  smallProgramQrCode: string // 小程序二维码
}

// 获得网站配置
export const getWebsiteConfig = () => {
  return request.get({ url: '/liqi/website-config/get' })
}

// 保存网站配置
export const saveWebsiteConfig = (data: WebsiteConfigVO) => {
  return request.put({ url: '/liqi/website-config/update', data })
}
