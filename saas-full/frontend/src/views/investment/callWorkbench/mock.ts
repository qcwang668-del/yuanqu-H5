/**
 * 外呼工作台 · 演示用 mock 数据生成
 * ------------------------------------------------------------
 * liqi_enterprise 表暂无电话字段，本轮以「企业 id」确定性派生联系号码，
 * 保证同一企业每次进入号码一致；后续接入天眼查/企业联系人库后替换本文件。
 */

export interface MockPhone {
  number: string
  label: string
}

// 号段池（座机区号 + 手机号段），按 id 取模确定性选择
const MOBILE_PREFIX = ['138', '139', '158', '186', '135', '188', '150', '199']
const TEL_AREA = ['0755', '020', '010', '021', '0769']
const PHONE_LABELS = ['公司总机', '招商专线', '法人手机', '联系人手机', '前台电话']

/** 由数字种子生成一串定长数字 */
function seededDigits(seed: number, len: number): string {
  let s = ''
  let x = (seed * 9301 + 49297) % 233280
  for (let i = 0; i < len; i++) {
    x = (x * 9301 + 49297) % 233280
    s += Math.floor((x / 233280) * 10)
  }
  return s
}

/** 依据企业 id 生成 1~3 个联系号码（确定性） */
export function genPhones(id: number | string, name = ''): MockPhone[] {
  const seed = Number(id) || Array.from(String(name)).reduce((a, c) => a + c.charCodeAt(0), 0) || 1
  const count = (seed % 3) + 1 // 1~3 个号码
  const phones: MockPhone[] = []
  // 第 1 个：座机总机
  const area = TEL_AREA[seed % TEL_AREA.length]
  phones.push({ number: `${area}-${seededDigits(seed + 1, 8)}`, label: PHONE_LABELS[0] })
  // 其余：手机
  for (let i = 1; i < count; i++) {
    const pre = MOBILE_PREFIX[(seed + i) % MOBILE_PREFIX.length]
    phones.push({
      number: `${pre}${seededDigits(seed + i * 7, 8)}`,
      label: PHONE_LABELS[Math.min(i + 1, PHONE_LABELS.length - 1)]
    })
  }
  return phones
}

/**
 * AI 外呼话术（演示字幕逐句滚动）。变量 {ent} 会被替换为企业名。
 * connected=true 走完整意向沟通；false 走无人接听。
 */
export const AI_SCRIPT_CONNECTED = (ent: string) => [
  { role: 'ai', text: `您好，请问是${ent}吗？我是智远力企招商中心的 AI 助理小远。` },
  { role: 'cust', text: '是的，你好，请讲。' },
  { role: 'ai', text: '打扰您一分钟。我们正在为贵司所在产业整理一批区域招商与产业配套政策，想确认下贵司近期是否有选址、扩产或政策申报的需求？' },
  { role: 'cust', text: '嗯，我们下半年确实在看新的生产基地。' },
  { role: 'ai', text: '好的，那非常匹配。我们园区有税收返还与厂房补贴，我把资料发给您，并安排招商专员和您对接，方便留个微信或邮箱吗？' },
  { role: 'cust', text: '可以，你加我微信吧。' },
  { role: 'ai', text: '收到，已为您登记高意向。稍后专员会带政策明细联系您，感谢接听，祝您工作顺利，再见！' }
]

export const AI_SCRIPT_MISSED = (ent: string) => [
  { role: 'ai', text: `正在呼叫 ${ent} ...` },
  { role: 'sys', text: '嘟——嘟——嘟——' },
  { role: 'sys', text: '当前用户暂时无人接听，通话结束。' }
]

/** 通话小结建议话术（供人工快速填写备注） */
export const NOTE_TEMPLATES = [
  '有选址/扩产意向，已加微信，待专员对接',
  '暂无明确需求，可 3 个月后再回访',
  '接通但表示不方便，另约时间',
  '空号/停机，需核实号码',
  '已明确无意向，可移出'
]
