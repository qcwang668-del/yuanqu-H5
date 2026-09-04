import request from '@/config/axios'

// 力企云 DaaS 企业数据平台
// 后端 DaasClient 自动完成 appKey/timestamp/nonce/sign 签名（MD5），前端无需关心
export interface QiYeInfo {
  entityId?: string // 统一社会信用代码/唯一 id
  companyName?: string // 公司名称
  companyFormerName?: string // 曾用名
  entityEnglishName?: string // 英文名称
  legalName?: string // 法定代表人
  regCapital?: number // 注册资本
  regCapitalType?: string // 注册资本币种
  entStatus?: string // 经营状态
  regAddress?: string // 注册地址
  industryLv1Name?: string // 行业一级
  industryLv2Name?: string // 行业二级
  industryLv3Name?: string // 行业三级
  industryLv4Name?: string // 行业四级
  regDate?: string // 成立日期
  licenseNumber?: string // 工商注册号
  zcbComType?: string // 企业类型
  opFrom?: string // 经营期限自
  opTo?: string // 经营期限至
  regOrg?: string // 登记机关
  checkDate?: string // 核准日期
  opScope?: string // 经营范围
  socialStaffNum?: number // 参保人数
  organizationNumber?: string // 组织机构代码
  companyScale?: number // 企业规模 1微型 2小型 3中型 4大型
  subsidyTotalMoney?: number // 补贴总金额
  zcbWeb?: string // 网址
  zcbEmail?: string // 邮箱
  finalShowInfo?: string[] // 荣誉资质
}

// 企业工商基本信息（按统一社会信用代码实时查询力企云 DaaS 数据平台）
// 查无数据（平台未覆盖该区域企业）时 resolve 为 null
export const getDaasBaseInfo = (entityId: string): Promise<QiYeInfo | null> => {
  return request.get({ url: '/liqi/daas/enterprise/base-info', params: { entityId } })
}
