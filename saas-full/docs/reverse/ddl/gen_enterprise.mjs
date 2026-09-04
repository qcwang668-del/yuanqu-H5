import fs from 'node:fs'

// 生成 1000 条「深圳湾生态园」企业真实感数据
const surname = '王李张刘陈杨赵黄周吴徐孙胡朱高林何郭马罗梁宋郑谢韩唐冯于董萧程曹袁邓许傅沈曾彭吕苏卢蒋蔡贾丁魏薛叶阎余潘杜戴夏钟汪田任姜范方石姚谭廖邹熊金陆郝孔白崔康毛邱秦江史顾侯邵孟龙万段章钱汤尹黎易常武乔贺赖龚文'
const given1 = '伟强磊军洋勇艳杰娟涛明超秀霞平刚桂英华建国志远宏斌波辉刚健世廷凯旭鹏浩宇轩晨阳'
const given2 = '华建国志远宏斌波辉健世廷凯旭鹏浩宇轩晨阳峰帆锐钧岩琳婷玲芳燕丹梅静敏'
// 字号（两字组合池）
const zi1 = '华创智远腾云鑫盛博瑞高新精测绿动鹏芯鲲鹏前海湾创启元宏图联合天成中科众诚同兴汇通startExtra'.replace('startExtra','')
const ziA = ['华','智','创','腾','鑫','博','瑞','高','精','绿','鹏','鲲','前','湾','启','宏','联','天','中','众','同','汇','恒','海','光','芯','数','云','擎','锐','卓','恒','嘉','兆','景','唯','锦','拓','翔','昇']
const ziB = ['创','远','云','盛','瑞','测','动','芯','鹏','海','元','图','合','成','科','诚','兴','通','达','联','智','谷','源','擎','越','翼','驰','和','安','邦','信','望','拓','鸿','晟','étc'.replace('étc','宇')]
const bizWords = ['科技', '信息技术', '智能科技', '半导体', '集成电路', '生物医药', '新能源', '智能装备', '数据科技', '网络科技', '光电科技', '电子科技', '软件', '医疗器械', '新材料', '人工智能', '物联网', '云计算', '大数据', '芯片技术']
const suffix = ['有限公司', '股份有限公司', '（深圳）有限公司', '集团有限公司', '科技有限公司']
const industries = ['制造业/计算机、通信和其他电子设备制造业', '制造业/专用设备制造业', '制造业/医药制造业', '制造业/电气机械和器材制造业', '信息传输、软件和信息技术服务业/软件和信息技术服务业', '科学研究和技术服务业/研究和试验发展', '制造业/仪器仪表制造业', '制造业/通用设备制造业', '批发和零售业/批发业', '租赁和商务服务业/商务服务业']
const colors = ['#c62828', '#e65100', '#1565c0', '#0277bd', '#00838f', '#2e7d32', '#4527a0', '#00695c', '#283593', '#5d4037', '#ad1457', '#37474f']

const R = (arr) => arr[Math.floor(Math.random() * arr.length)]
const RI = (a, b) => Math.floor(Math.random() * (b - a + 1)) + a
const pad = (n) => String(n).padStart(2, '0')

const names = new Set()
const rows = []
let guard = 0
while (rows.length < 5000 && guard < 200000) {
  guard++
  const zihao = R(ziA) + R(ziB)
  const name = `深圳${R(['市', ''])}${zihao}${R(bizWords)}${R(suffix)}`
  if (names.has(name)) continue
  names.add(name)
  const legal = R(surname) + (Math.random() < 0.5 ? R(given1) : R(given1) + R(given2))
  const y = RI(2005, 2023), m = RI(1, 12), d = RI(1, 28)
  const cap = (RI(100, 500000) + Math.random()).toFixed(2)
  const insured = RI(8, 5200)
  const industry = R(industries)
  const bldg = RI(1, 22), floor = RI(1, 30), room = RI(1, 40)
  const addr = `深圳市南山区深圳湾生态园${bldg}栋${floor}0${pad(room)}`
  rows.push({ name, legal, date: `${y}-${pad(m)}-${pad(d)}`, cap: `${cap}万元`, insured, industry, addr, short: zihao, color: R(colors) })
}

// 批量 INSERT（每 200 条一条语句）
const esc = (s) => s.replace(/'/g, "''")
let sql = '-- 深圳湾生态园 1000 家企业（真实感 mock）\nSET NAMES utf8mb4;\n'
for (let i = 0; i < rows.length; i += 200) {
  const chunk = rows.slice(i, i + 200)
  sql += 'INSERT INTO liqi_enterprise (enterprise_name,legal_person,establish_date,registered_capital,insured_count,industry,register_address,short_name,logo_color,tenant_id) VALUES\n'
  sql += chunk.map(r => `('${esc(r.name)}','${esc(r.legal)}','${r.date}','${r.cap}',${r.insured},'${esc(r.industry)}','${esc(r.addr)}','${esc(r.short)}','${r.color}',1)`).join(',\n')
  sql += ';\n'
}
fs.writeFileSync('/home/fangnan/PycharmProjects/u667a-u8fdc-u529b-u4f01-saas/docs/reverse/ddl/liqi_enterprise_data.sql', sql)
console.log('生成', rows.length, '条，SQL bytes:', fs.statSync('/home/fangnan/PycharmProjects/u667a-u8fdc-u529b-u4f01-saas/docs/reverse/ddl/liqi_enterprise_data.sql').size)
console.log('样本:', rows[0].name, '|', rows[0].legal, '|', rows[0].addr)
