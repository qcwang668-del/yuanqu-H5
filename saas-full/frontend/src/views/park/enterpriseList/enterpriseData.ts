// 产业链招商 · 企业线索/详情 纯前端 mock 数据
// 查询结果展示示例企业；点击企业名 → 抽屉展示企业详情（基本信息/联系方式/项目申报 参考截图 1:1）
// P1 接真实企业库后由后端返回，结构保持一致。

export interface EnterpriseContact {
  phone: string
  name: string
  tags: string[] // 推荐人 / 疑似法人 / 疑似高管
  status: string // 正常
  star: number // 1-5
  platform: string
  type: 'mobile' | 'tel' | 'email'
}
export interface EnterpriseProject {
  title: string
  org: string
  region: string
  year: string
  subsidy: string // 已获补贴（万元）
  remark?: string // 项目备注（名单/说明），无则空
  level?: string // 项目级别：国家级/省级/市级
}
export interface BasicPair {
  label: string
  value: string
}
// 富页签（人员投资/知产/经营信息/经营风险/企业发展）通用结构
export interface DetailSection {
  title: string
  count?: number | string
  type: 'kv' | 'table' | 'tags' | 'stat'
  pairs?: { label: string; value: string }[]
  columns?: { prop: string; label: string; width?: number }[]
  rows?: Record<string, any>[]
  tags?: string[]
  stats?: { label: string; value: number | string; unit?: string }[]
  note?: string
}
export interface RichTab {
  name: string
  label: string
  sections: DetailSection[]
}

export interface EnterpriseDetail {
  id: string
  name: string
  logo: string // 头像文字（2-4字）
  status: string // 存续
  tags: string[] // 大型 / 高新技术企业 …
  moreTags: number // 查看更多 +N
  // 摘要栏
  legalPerson: string
  regCapital: string
  creditCode: string
  industry: string
  regAddress: string
  scope: string
  // 基本信息（左右两列）
  basicLeft: BasicPair[]
  basicRight: BasicPair[]
  // 联系方式
  contactCounts: { all: number; mobile: number; tel: number; email: number }
  contacts: EnterpriseContact[]
  // 项目申报
  projectPie: { name: string; value: number }[]
  projectTrend: { years: string[]; subsidy: number[]; count: number[] }
  projectTotal: number
  projects: EnterpriseProject[]
  // 人员/投资 · 知识产权 · 经营信息 · 经营风险 · 企业发展（按真实接口结构组织）
  richTabs?: RichTab[]
}
export interface EnterpriseListItem {
  id: string
  name: string
  status: string
  tags: string[]
  legalPerson: string
  regCapital: string
  establishDate: string
  industry: string
  regAddress: string
  unlocked: boolean
}

// ---------- 查询结果示例企业（半导体与集成电路方向）----------
export const ENTERPRISE_LIST: EnterpriseListItem[] = [
  {
    id: 'byd-semi', name: '比亚迪半导体股份有限公司', status: '存续',
    tags: ['大型', '高新技术企业', '排污许可证', '扩产扶持企业'],
    legalPerson: '陈刚', regCapital: '45621.8756 万元', establishDate: '2004-10-15',
    industry: '计算机、通信和其他电子设备制造业', regAddress: '深圳市大鹏新区葵涌街道延安路1号', unlocked: false
  },
  {
    id: 'smic-sz', name: '中芯国际集成电路制造(深圳)有限公司', status: '存续',
    tags: ['大型', '高新技术企业', '专精特新'],
    legalPerson: '张昕', regCapital: '520000 万元', establishDate: '2008-03-18',
    industry: '计算机、通信和其他电子设备制造业', regAddress: '深圳市坪山区龙田街道', unlocked: false
  },
  {
    id: 'zte-micro', name: '深圳市中兴微电子技术有限公司', status: '存续',
    tags: ['大型', '高新技术企业'],
    legalPerson: '李伟', regCapital: '120000 万元', establishDate: '2003-06-11',
    industry: '软件和信息技术服务业', regAddress: '深圳市南山区科技南路中兴通讯大厦', unlocked: false
  },
  {
    id: 'crmicro-sz', name: '华润微电子(深圳)有限公司', status: '存续',
    tags: ['大型', '高新技术企业', '排污许可证'],
    legalPerson: '王健', regCapital: '89000 万元', establishDate: '2010-09-25',
    industry: '计算机、通信和其他电子设备制造业', regAddress: '深圳市南山区高新技术产业园', unlocked: false
  },
  {
    id: 'goodix', name: '深圳市汇顶科技股份有限公司', status: '存续',
    tags: ['上市公司', '高新技术企业', '专精特新'],
    legalPerson: '张帆', regCapital: '45700 万元', establishDate: '2002-05-08',
    industry: '计算机、通信和其他电子设备制造业', regAddress: '深圳市福田区新洲十一街', unlocked: true
  },
  {
    id: 'chipsea', name: '芯海科技(深圳)股份有限公司', status: '存续',
    tags: ['上市公司', '高新技术企业', '专精特新'],
    legalPerson: '卢国建', regCapital: '15600 万元', establishDate: '2003-09-19',
    industry: '计算机、通信和其他电子设备制造业', regAddress: '深圳市南山区高新区科技南十二路', unlocked: false
  }
]

// ---------- 联系方式 / 项目 共用示例 ----------
const SAMPLE_CONTACTS: EnterpriseContact[] = [
  { phone: '13510881210', name: '陈*', tags: ['推荐人', '疑似法人'], status: '正常', star: 5, platform: '其他', type: 'mobile' },
  { phone: '13844445555', name: '王** (监事)', tags: ['推荐人', '疑似高管'], status: '正常', star: 5, platform: '其他', type: 'mobile' },
  { phone: '13249301256', name: '杨**', tags: ['推荐人'], status: '正常', star: 5, platform: '其他', type: 'mobile' },
  { phone: '13510889889', name: '陈*', tags: ['疑似法人'], status: '正常', star: 5, platform: '其他', type: 'mobile' },
  { phone: '13632996665', name: '陈**', tags: ['疑似法人'], status: '正常', star: 5, platform: '其他', type: 'mobile' },
  { phone: '13808981777', name: '陈*', tags: ['疑似法人'], status: '正常', star: 5, platform: '其他', type: 'mobile' },
  { phone: '13907182090', name: '陈*', tags: ['疑似法人'], status: '正常', star: 5, platform: '其他', type: 'mobile' },
  { phone: '15134219142', name: '陈*', tags: ['疑似法人'], status: '正常', star: 5, platform: '其他', type: 'mobile' },
  { phone: '17300772516', name: '陈**', tags: ['疑似法人'], status: '正常', star: 5, platform: '其他', type: 'mobile' },
  { phone: '13510881389', name: '王** (监事)', tags: ['疑似高管'], status: '正常', star: 4, platform: '其他', type: 'tel' }
]

const SAMPLE_PROJECTS: EnterpriseProject[] = [
  { title: '市工业和信息化局关于2026年企业技术改造项目扶持计划（绿色化改造）', org: '深圳市工业和信息化局', region: '广东省深圳市', year: '2026', subsidy: '30.00', level: '市级', remark: '' },
  { title: '深圳市发展和改革委员会2025年第二批战略性新兴产业（半导体与集成电路）扶持计划', org: '深圳市发展和改革委员会', region: '广东省深圳市', year: '2025', subsidy: '120.00', level: '市级', remark: '' },
  { title: '2026年第八批深圳市新引进博士人才生活补贴拟发放', org: '深圳市人力资源和社会保障局', region: '广东省深圳市', year: '2026', subsidy: '18.00', level: '市级', remark: '刘伟鸿;李钰;林逸琦;白云开;舒培根;车波;郑子成' },
  { title: '深圳市科技创新委员会2024年技术攻关重点项目', org: '深圳市科技创新委员会', region: '广东省深圳市', year: '2024', subsidy: '200.00', level: '省级', remark: '' },
  { title: '大鹏新区组织人事局2023年人才引进扶持项目', org: '大鹏新区组织人事局', region: '广东省深圳市', year: '2023', subsidy: '45.00', level: '市级', remark: '张敬栋;朱雪豪;李志豪;杨昕磊' }
]

const SAMPLE_PIE = [
  { name: '其他', value: 62 },
  { name: '大鹏新区人民政府', value: 15 },
  { name: '深圳市工业和信息化局', value: 12 },
  { name: '大鹏新区组织人事局', value: 7 },
  { name: '人力资源和社会保障局', value: 4 }
]
const SAMPLE_TREND = {
  years: ['2022', '2023', '2024', '2025', '2026'],
  subsidy: [1000, 3400, 1400, 400, 50],
  count: [25, 30, 58, 42, 8]
}

// ---------- 比亚迪半导体（按截图 1:1）----------
const BYD: EnterpriseDetail = {
  id: 'byd-semi',
  name: '比亚迪半导体股份有限公司',
  logo: '比亚迪半',
  status: '存续',
  tags: ['大型', '高新技术企业', '排污许可证', '扩产扶持企业'],
  moreTags: 10,
  legalPerson: '陈刚',
  regCapital: '45621.8756 人民币(单位：万元)',
  creditCode: '91440300766363876J',
  industry: '计算机、通信和其他电子设备制造业',
  regAddress: '深圳市大鹏新区葵涌街道延安路1号',
  scope: '一般经营项目：无。许可经营项目：半导体（集成电路、分立器件、光电器件及其它半导体产品）设计、制造及销售；半导体相关产品封装、测试及销售；半导体器件、电力电子器件、光电子器件的技术开发与销售。',
  basicLeft: [
    { label: '企业名称', value: '比亚迪半导体股份有限公司' },
    { label: '曾用名', value: '比亚迪半导体有限公司，深圳比亚迪微电子有限公司' },
    { label: '注册资本', value: '45621.8756 人民币(单位：万元)' },
    { label: '成立日期', value: '2004-10-15' },
    { label: '统一社会信用代码', value: '91440300766363876J' },
    { label: '官网', value: '/' },
    { label: '企业类型', value: '股份有限公司（外商投资、未上市）' },
    { label: '所属行业', value: '计算机、通信和其他电子设备制造业' },
    { label: '核准日期', value: '2025-11-28' },
    { label: '地址', value: '深圳市大鹏新区葵涌街道延安路1号' }
  ],
  basicRight: [
    { label: '工商注册号', value: '440307501125036' },
    { label: '法定代表人', value: '陈刚' },
    { label: '所属行业分类', value: '制造业' },
    { label: '经营状态', value: '存续（在营、开业、在册）' },
    { label: '组织机构代码', value: '766363876' },
    { label: '登记机关', value: '深圳市市场监督管理局' },
    { label: '参保人数', value: '6171' },
    { label: '经营期限', value: '2004-10-15 至 -' }
  ],
  contactCounts: { all: 107, mobile: 54, tel: 13, email: 40 },
  contacts: SAMPLE_CONTACTS,
  projectPie: SAMPLE_PIE,
  projectTrend: SAMPLE_TREND,
  projectTotal: 156,
  projects: SAMPLE_PROJECTS
}

// ---------- 通用详情生成（其余示例企业）----------
function buildDetail(item: EnterpriseListItem): EnterpriseDetail {
  return {
    id: item.id,
    name: item.name,
    logo: item.name.slice(0, 4),
    status: item.status,
    tags: item.tags,
    moreTags: 8,
    legalPerson: item.legalPerson,
    regCapital: `${item.regCapital}`,
    creditCode: '9144030000' + item.id.replace(/[^0-9a-z]/gi, '').slice(0, 8).toUpperCase(),
    industry: item.industry,
    regAddress: item.regAddress,
    scope: '一般经营项目：集成电路设计、研发、销售；电子元器件制造与销售；软件开发；技术进出口。许可经营项目：以审批结果为准。',
    basicLeft: [
      { label: '企业名称', value: item.name },
      { label: '曾用名', value: '-' },
      { label: '注册资本', value: `${item.regCapital}` },
      { label: '成立日期', value: item.establishDate },
      { label: '统一社会信用代码', value: '9144030000' + item.id.replace(/[^0-9a-z]/gi, '').slice(0, 8).toUpperCase() },
      { label: '官网', value: '/' },
      { label: '企业类型', value: '有限责任公司' },
      { label: '所属行业', value: item.industry },
      { label: '核准日期', value: '2025-10-20' },
      { label: '地址', value: item.regAddress }
    ],
    basicRight: [
      { label: '工商注册号', value: '-' },
      { label: '法定代表人', value: item.legalPerson },
      { label: '所属行业分类', value: '制造业' },
      { label: '经营状态', value: `${item.status}（在营、开业、在册）` },
      { label: '组织机构代码', value: '-' },
      { label: '登记机关', value: '深圳市市场监督管理局' },
      { label: '参保人数', value: '1200' },
      { label: '经营期限', value: `${item.establishDate} 至 -` }
    ],
    contactCounts: { all: 68, mobile: 35, tel: 9, email: 24 },
    contacts: SAMPLE_CONTACTS.slice(0, 8),
    projectPie: SAMPLE_PIE,
    projectTrend: SAMPLE_TREND,
    projectTotal: 96,
    projects: SAMPLE_PROJECTS.slice(0, 4),
    richTabs: buildRichTabs(item)
  }
}

// ---------- 快意电梯股份有限公司（真实公开工商数据 + 参考详情页 8 页签结构）----------
// 基本信息/股东/企业标签为真实公开数据；联系方式、项目申报、知产明细、司法明细等为代表性示例（后端接口就绪后替换）。
const KYD: EnterpriseDetail = {
  id: 'kuaiyi',
  name: '快意电梯股份有限公司',
  logo: '快意电梯',
  status: '存续',
  tags: ['A股上市', '高新技术企业', '专精特新中小企业', '企业技术中心', '创新型中小企业'],
  moreTags: 7,
  legalPerson: '罗爱文',
  regCapital: '33668.79 万人民币',
  creditCode: '91441900708017879M',
  industry: '通用设备制造业',
  regAddress: '广东省东莞市清溪镇青滨东路160号2号楼107室',
  scope: '产销、安装、维修、改造：电梯，自动扶梯；产销、安装30吨以下桥式起重机，门式起重机；经营本企业自产产品及技术的出口业务；经营本企业生产所需的原辅材料、仪器仪表、机械设备、零配件及技术的进口业务；生产、销售：机电产品、日用百货、办公用品、家具、活动房、体育用品、教学设备；电梯零部件销售；房地产开发经营。（依法须经批准的项目，经相关部门批准后方可开展经营活动）',
  basicLeft: [
    { label: '企业名称', value: '快意电梯股份有限公司' },
    { label: '曾用名', value: '东莞市飞鹏电梯有限公司，东莞市快意电梯有限公司，快意电梯有限公司' },
    { label: '注册资本', value: '33668.79 万人民币' },
    { label: '实缴资本', value: '33668.79 万人民币' },
    { label: '成立日期', value: '1998-09-15' },
    { label: '统一社会信用代码', value: '91441900708017879M' },
    { label: '上市代码', value: '002774（快意电梯）' },
    { label: '企业类型', value: '其他股份有限公司(上市)' },
    { label: '所属行业', value: '通用设备制造业' },
    { label: '地址', value: '广东省东莞市清溪镇青滨东路160号2号楼107室' }
  ],
  basicRight: [
    { label: '工商注册号', value: '441900000059300' },
    { label: '法定代表人', value: '罗爱文' },
    { label: '经营状态', value: '存续（在营、开业、在册）' },
    { label: '组织机构代码', value: '70801787-9' },
    { label: '纳税人识别号', value: '91441900708017879M' },
    { label: '人员规模', value: '500-999人' },
    { label: '参保人数', value: '778' },
    { label: '登记机关', value: '东莞市市场监督管理局' }
  ],
  contactCounts: { all: 42, mobile: 20, tel: 12, email: 10 },
  contacts: SAMPLE_CONTACTS.map((c) => ({ ...c, name: c.name.replace('陈', '罗').replace('王', '罗') })),
  projectPie: [
    { name: '其他', value: 40 },
    { name: '东莞市工业和信息化局', value: 22 },
    { name: '广东省科技厅', value: 18 },
    { name: '清溪镇人民政府', value: 12 },
    { name: '东莞市人力资源和社会保障局', value: 8 }
  ],
  projectTrend: { years: ['2022', '2023', '2024', '2025', '2026'], subsidy: [600, 1500, 2400, 1800, 300], count: [10, 18, 26, 22, 5] },
  projectTotal: 81,
  projects: [
    { title: '东莞市工业和信息化局2026年度企业技术改造项目扶持计划', org: '东莞市工业和信息化局', region: '广东省东莞市', year: '2026', subsidy: '50.00' },
    { title: '广东省2025年专精特新中小企业奖励', org: '广东省工业和信息化厅', region: '广东省', year: '2025', subsidy: '80.00' },
    { title: '东莞市高新技术企业培育入库奖励', org: '东莞市科学技术局', region: '广东省东莞市', year: '2024', subsidy: '30.00' },
    { title: '清溪镇智能制造示范项目扶持', org: '清溪镇人民政府', region: '广东省东莞市', year: '2024', subsidy: '25.00' }
  ],
  richTabs: [
    {
      name: 'people', label: '人员/投资信息',
      sections: [
        {
          title: '主要人员', count: 8, type: 'table',
          columns: [{ prop: 'name', label: '姓名', width: 140 }, { prop: 'post', label: '职务' }],
          rows: [
            { name: '罗爱文', post: '董事长、总经理' },
            { name: '罗爱明', post: '董事、副总经理' },
            { name: '白植平', post: '董事、财务负责人' },
            { name: '罗爱武', post: '监事' },
            { name: '李某某', post: '董事会秘书' }
          ]
        },
        {
          title: '股东信息', count: 5, type: 'table', note: '持股比例为公开披露数据',
          columns: [{ prop: 'name', label: '股东名称' }, { prop: 'ratio', label: '持股比例', width: 140 }],
          rows: [
            { name: '罗爱文', ratio: '8.1648%' },
            { name: '罗爱明', ratio: '2.2424%' },
            { name: '白植平', ratio: '0.5881%' },
            { name: '罗爱武', ratio: '0.5821%' },
            { name: '东莞市快意股权投资有限公司', ratio: '—' }
          ]
        },
        {
          title: '对外投资', count: 6, type: 'table', note: '示例数据',
          columns: [{ prop: 'name', label: '被投资企业' }, { prop: 'ratio', label: '出资比例', width: 120 }, { prop: 'status', label: '状态', width: 100 }],
          rows: [
            { name: '快意电梯（东莞）销售有限公司', ratio: '100%', status: '存续' },
            { name: '快意智能装备有限公司', ratio: '70%', status: '存续' },
            { name: '快意电梯安装工程有限公司', ratio: '100%', status: '存续' }
          ]
        }
      ]
    },
    {
      name: 'ip', label: '知识产权信息',
      sections: [
        {
          title: '知识产权概览', type: 'stat',
          stats: [
            { label: '专利', value: 186, unit: '件' },
            { label: '商标', value: 92, unit: '件' },
            { label: '软件著作权', value: 24, unit: '件' },
            { label: '作品著作权', value: 6, unit: '件' }
          ]
        },
        {
          title: '专利', count: 186, type: 'table', note: '示例数据',
          columns: [{ prop: 'name', label: '专利名称' }, { prop: 'type', label: '类型', width: 120 }, { prop: 'date', label: '申请日期', width: 130 }, { prop: 'status', label: '法律状态', width: 100 }],
          rows: [
            { name: '一种电梯智能群控调度系统', type: '发明专利', date: '2023-05-18', status: '有效' },
            { name: '一种自动扶梯安全监测装置', type: '实用新型', date: '2022-11-02', status: '有效' },
            { name: '电梯轿厢结构', type: '外观设计', date: '2022-03-15', status: '有效' }
          ]
        },
        {
          title: '商标', count: 92, type: 'table', note: '示例数据',
          columns: [{ prop: 'name', label: '商标名称' }, { prop: 'cls', label: '国际分类', width: 160 }, { prop: 'status', label: '状态', width: 100 }],
          rows: [
            { name: '快意 KUAIYI', cls: '第7类-机械设备', status: '已注册' },
            { name: '快意电梯', cls: '第37类-建筑修理', status: '已注册' }
          ]
        }
      ]
    },
    {
      name: 'operate', label: '经营信息',
      sections: [
        {
          title: '纳税信用', type: 'kv',
          pairs: [
            { label: '纳税人资质', value: '增值税一般纳税人' },
            { label: '纳税信用等级', value: 'A级' },
            { label: '评价年度', value: '2024' }
          ]
        },
        {
          title: '招投标', count: 34, type: 'table', note: '示例数据',
          columns: [{ prop: 'title', label: '项目名称' }, { prop: 'role', label: '身份', width: 90 }, { prop: 'date', label: '发布日期', width: 130 }],
          rows: [
            { title: '某产业园电梯采购及安装项目', role: '中标', date: '2025-06-20' },
            { title: '某医院自动扶梯采购项目', role: '中标', date: '2024-12-08' }
          ]
        },
        {
          title: '抽查检查', count: 5, type: 'table', note: '示例数据',
          columns: [{ prop: 'org', label: '检查机关' }, { prop: 'result', label: '结果', width: 120 }, { prop: 'date', label: '日期', width: 130 }],
          rows: [
            { org: '东莞市市场监督管理局', result: '未发现问题', date: '2024-09-10' }
          ]
        }
      ]
    },
    {
      name: 'risk', label: '经营风险',
      sections: [
        {
          title: '风险概览', type: 'stat',
          stats: [
            { label: '裁判文书', value: 15, unit: '条' },
            { label: '被执行人', value: 0, unit: '条' },
            { label: '限制高消费', value: 0, unit: '条' },
            { label: '经营异常', value: 0, unit: '条' },
            { label: '行政处罚', value: 2, unit: '条' },
            { label: '股权质押', value: 3, unit: '条' }
          ]
        },
        {
          title: '裁判文书', count: 15, type: 'table', note: '示例数据',
          columns: [{ prop: 'cause', label: '案由' }, { prop: 'role', label: '身份', width: 100 }, { prop: 'no', label: '案号', width: 200 }, { prop: 'date', label: '裁判日期', width: 120 }],
          rows: [
            { cause: '买卖合同纠纷', role: '原告', no: '(2024)粤19民初1234号', date: '2024-07-15' },
            { cause: '产品责任纠纷', role: '被告', no: '(2023)粤19民初5678号', date: '2023-10-22' }
          ]
        },
        {
          title: '行政处罚', count: 2, type: 'table', note: '示例数据',
          columns: [{ prop: 'content', label: '处罚内容' }, { prop: 'org', label: '处罚机关', width: 200 }, { prop: 'date', label: '公示日期', width: 120 }],
          rows: [
            { content: '未按规定进行安全检测', org: '东莞市应急管理局', date: '2023-04-11' }
          ]
        }
      ]
    },
    {
      name: 'growth', label: '企业发展',
      sections: [
        {
          title: '企业标签', type: 'tags', note: '公开标签',
          tags: ['存续', '曾用名', '投资机构', 'A股(正常上市)', '高新技术企业', '专精特新中小企业', '企业技术中心', '创新型中小企业', '合作风险', '股权质押', '破产案件', '司法案件']
        },
        {
          title: '企业新闻', count: 128, type: 'table', note: '示例数据',
          columns: [{ prop: 'title', label: '标题' }, { prop: 'src', label: '来源', width: 140 }, { prop: 'date', label: '日期', width: 130 }],
          rows: [
            { title: '快意电梯发布2025年半年度报告，营收稳步增长', src: '公司公告', date: '2025-08-20' },
            { title: '快意电梯入选省级专精特新中小企业名单', src: '东莞日报', date: '2025-03-12' }
          ]
        },
        {
          title: '备案网站', count: 2, type: 'table', note: '示例数据',
          columns: [{ prop: 'name', label: '网站名称' }, { prop: 'domain', label: '域名', width: 220 }, { prop: 'date', label: '审核日期', width: 130 }],
          rows: [
            { name: '快意电梯官网', domain: 'www.kuaiyi.com', date: '2016-05-08' }
          ]
        }
      ]
    }
  ]
}

const DETAILS: Record<string, EnterpriseDetail> = { 'byd-semi': BYD, 'kuaiyi': KYD }

export function getEnterpriseDetail(id: string): EnterpriseDetail {
  if (DETAILS[id]) return DETAILS[id]
  const item = ENTERPRISE_LIST.find((e) => e.id === id)
  return item ? buildDetail(item) : BYD
}

// ---------- 由后端返回（/liqi/enterprise/get|enrich）构造详情：{enterprise, shareholders} ----------
// enterprise 为天眼查回填后的主表全字段；shareholders 为股东子表。其余维度（联系/知产/司法/项目）暂无数据源。
export function detailFromBackend(payload: any): EnterpriseDetail {
  const e = payload?.enterprise || {}
  const holders = payload?.shareholders || []
  const tags: string[] = (e.tags ? String(e.tags).split(/[;；]/).filter(Boolean) : []).slice(0, 6)
  const establish = fmtD(e.establishDate)
  const enriched = e.enrichStatus === 1
  const rich = buildRichTabs(e)
  // 用真实股东替换「人员/投资信息」的股东区块
  const people = rich.find((r) => r.name === 'people')
  if (people) {
    const shSec = people.sections.find((s) => s.title === '股东信息')
    if (shSec) {
      shSec.count = holders.length
      shSec.rows = holders.map((h: any) => ({ name: h.name, ratio: h.percent || '—' }))
      shSec.note = enriched ? '天眼查回填' : shSec.note
    }
    const mainSec = people.sections.find((s) => s.title === '主要人员')
    if (mainSec) mainSec.rows = [{ name: e.legalPerson || '—', post: '法定代表人' }]
  }
  // 企业标签用真实
  const growth = rich.find((r) => r.name === 'growth')
  if (growth) {
    const tagSec = growth.sections.find((s) => s.title === '企业标签')
    if (tagSec && tags.length) tagSec.tags = tags
  }
  return {
    id: String(e.id ?? ''),
    name: e.enterpriseName || '-',
    logo: e.shortName || (e.enterpriseName || '企业').slice(0, 4),
    status: e.regStatus || '存续',
    tags: tags.length ? tags : ['未回填'],
    moreTags: Math.max(0, tags.length - 4),
    legalPerson: e.legalPerson || '-',
    regCapital: e.registeredCapital || '-',
    creditCode: e.creditCode || '-',
    industry: e.industry || '-',
    regAddress: e.registerAddress || '-',
    scope: e.businessScope || '—',
    basicLeft: [
      { label: '企业名称', value: e.enterpriseName || '-' },
      { label: '曾用名', value: e.formerName || '-' },
      { label: '注册资本', value: e.registeredCapital || '-' },
      { label: '实缴资本', value: e.actualCapital || '-' },
      { label: '成立日期', value: establish },
      { label: '统一社会信用代码', value: e.creditCode || '-' },
      { label: '上市代码', value: e.bondNum ? `${e.bondNum}（${e.bondName || ''}）` : '-' },
      { label: '企业类型', value: e.companyOrgType || '-' },
      { label: '所属行业', value: e.industry || '-' },
      { label: '地址', value: e.registerAddress || '-' }
    ],
    basicRight: [
      { label: '工商注册号', value: e.regNumber || '-' },
      { label: '法定代表人', value: e.legalPerson || '-' },
      { label: '经营状态', value: e.regStatus ? `${e.regStatus}（在营、开业、在册）` : '-' },
      { label: '组织机构代码', value: e.orgNumber || '-' },
      { label: '纳税人识别号', value: e.taxNumber || '-' },
      { label: '人员规模', value: e.staffNumRange || '-' },
      { label: '参保人数', value: e.insuredCount != null ? String(e.insuredCount) : '-' },
      { label: '登记机关', value: e.regInstitute || '-' }
    ],
    contactCounts: { all: 0, mobile: 0, tel: 0, email: 0 },
    contacts: [],
    projectPie: SAMPLE_PIE,
    projectTrend: SAMPLE_TREND,
    projectTotal: 0,
    projects: [],
    richTabs: rich
  }
}

// ---------- 由园区企业清单实体（后端 /liqi/enterprise/page 行）构造详情 ----------
// 后端返回字段：enterpriseName / legalPerson / establishDate / registeredCapital
//   / insuredCount / industry / registerAddress / shortName / creditCode? 等
// 详情中「联系方式 / 项目申报」后端暂无 → 用示例数据占位（P1 接详情接口后替换）
function fmtD(d: any): string {
  if (Array.isArray(d)) return `${d[0]}-${String(d[1]).padStart(2, '0')}-${String(d[2]).padStart(2, '0')}`
  return d || '-'
}

// 通用富页签（人员投资/知产/经营信息/经营风险/企业发展）——结构对齐真实详情页，取代占位
function buildRichTabs(e: any): RichTab[] {
  const nm = e.enterpriseName || e.name || '该企业'
  const lp = e.legalPerson || '法定代表人'
  return [
    {
      name: 'people', label: '人员/投资信息',
      sections: [
        { title: '主要人员', count: 3, type: 'table', columns: [{ prop: 'name', label: '姓名', width: 140 }, { prop: 'post', label: '职务' }], rows: [{ name: lp, post: '执行董事、总经理' }, { name: '—', post: '监事' }] },
        { title: '股东信息', count: 2, type: 'table', columns: [{ prop: 'name', label: '股东名称' }, { prop: 'ratio', label: '持股比例', width: 140 }], rows: [{ name: lp, ratio: '—' }] },
        { title: '对外投资', count: 0, type: 'table', note: '暂无数据', columns: [{ prop: 'name', label: '被投资企业' }, { prop: 'ratio', label: '出资比例', width: 120 }], rows: [] }
      ]
    },
    {
      name: 'ip', label: '知识产权信息',
      sections: [
        { title: '知识产权概览', type: 'stat', stats: [{ label: '专利', value: '—', unit: '件' }, { label: '商标', value: '—', unit: '件' }, { label: '软件著作权', value: '—', unit: '件' }, { label: '作品著作权', value: '—', unit: '件' }] },
        { title: '专利', type: 'table', note: '接入企业库后展示', columns: [{ prop: 'name', label: '专利名称' }, { prop: 'type', label: '类型', width: 120 }, { prop: 'status', label: '法律状态', width: 100 }], rows: [] }
      ]
    },
    {
      name: 'operate', label: '经营信息',
      sections: [
        { title: '纳税信用', type: 'kv', pairs: [{ label: '纳税人资质', value: '—' }, { label: '纳税信用等级', value: '—' }] },
        { title: '招投标', type: 'table', note: '接入企业库后展示', columns: [{ prop: 'title', label: '项目名称' }, { prop: 'role', label: '身份', width: 90 }], rows: [] }
      ]
    },
    {
      name: 'risk', label: '经营风险',
      sections: [
        { title: '风险概览', type: 'stat', stats: [{ label: '裁判文书', value: '—' }, { label: '被执行人', value: '—' }, { label: '限制高消费', value: '—' }, { label: '经营异常', value: '—' }, { label: '行政处罚', value: '—' }] },
        { title: '裁判文书', type: 'table', note: '接入企业库后展示', columns: [{ prop: 'cause', label: '案由' }, { prop: 'role', label: '身份', width: 100 }, { prop: 'date', label: '裁判日期', width: 120 }], rows: [] }
      ]
    },
    {
      name: 'growth', label: '企业发展',
      sections: [
        { title: '企业标签', type: 'tags', tags: Array.isArray(e.tags) && e.tags.length ? e.tags : ['存续', '高新技术企业'] },
        { title: '企业新闻', type: 'table', note: '接入企业库后展示', columns: [{ prop: 'title', label: '标题' }, { prop: 'date', label: '日期', width: 130 }], rows: [{ title: `${nm} 近期经营动态`, date: '—' }] }
      ]
    }
  ]
}
export function detailFromParkEntity(e: any): EnterpriseDetail {
  const rawName = e.enterpriseName || e.name || ''
  if (rawName.includes('快意电梯')) return KYD // 参考真实详情页的 8 页签样例
  const name = rawName || '-'
  const credit = e.creditCode || e.unifiedSocialCreditCode || '-'
  const capital = e.registeredCapital || e.regCapital || '-'
  const establish = fmtD(e.establishDate)
  const industry = e.industry || '-'
  const address = e.registerAddress || e.regAddress || '-'
  const status = e.status || '存续'
  const tags: string[] = Array.isArray(e.tags) && e.tags.length ? e.tags : ['高新技术企业']
  return {
    id: String(e.id ?? name),
    name,
    logo: e.shortName || name.slice(0, 4),
    status,
    tags,
    moreTags: 8,
    legalPerson: e.legalPerson || '-',
    regCapital: capital,
    creditCode: credit,
    industry,
    regAddress: address,
    scope: e.businessScope || e.scope || '一般经营项目：以营业执照登记为准。许可经营项目：以审批结果为准。',
    basicLeft: [
      { label: '企业名称', value: name },
      { label: '曾用名', value: e.formerName || '-' },
      { label: '注册资本', value: capital },
      { label: '成立日期', value: establish },
      { label: '统一社会信用代码', value: credit },
      { label: '官网', value: e.website || '/' },
      { label: '企业类型', value: e.enterpriseType || '有限责任公司' },
      { label: '所属行业', value: industry },
      { label: '核准日期', value: e.approvalDate || '-' },
      { label: '地址', value: address }
    ],
    basicRight: [
      { label: '工商注册号', value: e.regNo || '-' },
      { label: '法定代表人', value: e.legalPerson || '-' },
      { label: '所属行业分类', value: e.industryCategory || '-' },
      { label: '经营状态', value: `${status}（在营、开业、在册）` },
      { label: '组织机构代码', value: e.orgCode || '-' },
      { label: '登记机关', value: e.registrar || '-' },
      { label: '参保人数', value: e.insuredCount != null ? String(e.insuredCount) : '-' },
      { label: '经营期限', value: establish !== '-' ? `${establish} 至 -` : '-' }
    ],
    contactCounts: { all: 68, mobile: 35, tel: 9, email: 24 },
    contacts: SAMPLE_CONTACTS.slice(0, 8),
    projectPie: SAMPLE_PIE,
    projectTrend: SAMPLE_TREND,
    projectTotal: 96,
    projects: SAMPLE_PROJECTS.slice(0, 4),
    richTabs: buildRichTabs(e)
  }
}
