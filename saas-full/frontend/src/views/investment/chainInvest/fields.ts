// 产业链招商 · 找线索筛选字段清单（由字段清单.xlsx 自动生成，共 241 个字段）
// 类型：bool=有无/是否 | daterange=日期区间 | numrange=数值区间 | text=文本
export type FieldType = 'bool' | 'daterange' | 'numrange' | 'text'
export interface FieldItem { key: string; name: string; type: FieldType }
export interface FieldGroup { name: string; fields: FieldItem[] }
export interface FieldCategory { name: string; groups: FieldGroup[] }

export const FIELD_CATEGORIES: FieldCategory[] = [
  {
    "name": "企业基本信息",
    "groups": [
      {
        "name": "基本信息",
        "fields": [
          {
            "key": "f1",
            "name": "企业名称",
            "type": "text"
          },
          {
            "key": "f2",
            "name": "登记状态",
            "type": "text"
          },
          {
            "key": "f3",
            "name": "经营范围",
            "type": "text"
          },
          {
            "key": "f4",
            "name": "企业注册地址",
            "type": "text"
          },
          {
            "key": "f5",
            "name": "法人名称",
            "type": "text"
          },
          {
            "key": "f6",
            "name": "成立日期",
            "type": "daterange"
          },
          {
            "key": "f7",
            "name": "注册资本",
            "type": "numrange"
          },
          {
            "key": "f8",
            "name": "实缴资本",
            "type": "numrange"
          },
          {
            "key": "f9",
            "name": "企业类型",
            "type": "text"
          },
          {
            "key": "f10",
            "name": "所属行业",
            "type": "text"
          },
          {
            "key": "f11",
            "name": "主要人员姓名",
            "type": "text"
          },
          {
            "key": "f12",
            "name": "股东姓名",
            "type": "text"
          },
          {
            "key": "f13",
            "name": "有无分支机构",
            "type": "bool"
          },
          {
            "key": "f14",
            "name": "分支机构数量",
            "type": "numrange"
          },
          {
            "key": "f15",
            "name": "参保人数",
            "type": "numrange"
          },
          {
            "key": "f16",
            "name": "有无当前对外投资",
            "type": "bool"
          },
          {
            "key": "f17",
            "name": "年营业额",
            "type": "numrange"
          },
          {
            "key": "f18",
            "name": "企业经济类型",
            "type": "text"
          },
          {
            "key": "f19",
            "name": "吊销日期",
            "type": "daterange"
          },
          {
            "key": "f20",
            "name": "注销日期",
            "type": "daterange"
          },
          {
            "key": "f21",
            "name": "股东认缴出资日期",
            "type": "daterange"
          },
          {
            "key": "f22",
            "name": "核准日期",
            "type": "daterange"
          },
          {
            "key": "f23",
            "name": "有无历史对外投资",
            "type": "bool"
          }
        ]
      },
      {
        "name": "变更信息",
        "fields": [
          {
            "key": "f24",
            "name": "有无工商变更",
            "type": "bool"
          },
          {
            "key": "f25",
            "name": "最新企业名称变更日期",
            "type": "daterange"
          },
          {
            "key": "f26",
            "name": "最新注册地址变更日期",
            "type": "daterange"
          },
          {
            "key": "f27",
            "name": "企业工商变更项目类别",
            "type": "text"
          }
        ]
      },
      {
        "name": "企业情况",
        "fields": [
          {
            "key": "f28",
            "name": "是否是上市企业",
            "type": "bool"
          },
          {
            "key": "f29",
            "name": "员工人数",
            "type": "numrange"
          },
          {
            "key": "f30",
            "name": "上市类型",
            "type": "text"
          }
        ]
      },
      {
        "name": "年报信息",
        "fields": [
          {
            "key": "f31",
            "name": "有无年报",
            "type": "bool"
          },
          {
            "key": "f32",
            "name": "有年报的年份",
            "type": "text"
          },
          {
            "key": "f33",
            "name": "纳税总额",
            "type": "numrange"
          }
        ]
      }
    ]
  },
  {
    "name": "经营异常信息",
    "groups": [
      {
        "name": "经营异常",
        "fields": [
          {
            "key": "f34",
            "name": "有无当前经营异常",
            "type": "bool"
          },
          {
            "key": "f35",
            "name": "有无历史经营异常",
            "type": "bool"
          },
          {
            "key": "f36",
            "name": "当前被列入经营异常的原因",
            "type": "text"
          },
          {
            "key": "f37",
            "name": "历史被列入经营异常的原因",
            "type": "text"
          },
          {
            "key": "f38",
            "name": "经营异常列入日期",
            "type": "daterange"
          },
          {
            "key": "f39",
            "name": "经营异常移出日期",
            "type": "daterange"
          },
          {
            "key": "f40",
            "name": "经营异常的数量",
            "type": "numrange"
          }
        ]
      },
      {
        "name": "当前行政处罚",
        "fields": [
          {
            "key": "f41",
            "name": "有无行政处罚",
            "type": "bool"
          },
          {
            "key": "f42",
            "name": "行政处罚内容",
            "type": "text"
          },
          {
            "key": "f43",
            "name": "行政处罚公示日期",
            "type": "daterange"
          },
          {
            "key": "f44",
            "name": "行政处罚违法行为类型",
            "type": "text"
          },
          {
            "key": "f45",
            "name": "行政处罚罚款金额",
            "type": "numrange"
          },
          {
            "key": "f46",
            "name": "当前行政处罚数量",
            "type": "numrange"
          },
          {
            "key": "f47",
            "name": "最近行政处罚决定日期",
            "type": "daterange"
          }
        ]
      },
      {
        "name": "当前环保处罚",
        "fields": [
          {
            "key": "f48",
            "name": "有无环保处罚",
            "type": "bool"
          },
          {
            "key": "f49",
            "name": "环保处罚决定日期",
            "type": "daterange"
          },
          {
            "key": "f50",
            "name": "环保处罚违法行为类型",
            "type": "text"
          },
          {
            "key": "f51",
            "name": "环保处罚罚款金额",
            "type": "numrange"
          },
          {
            "key": "f52",
            "name": "当前环保处罚内容",
            "type": "text"
          }
        ]
      },
      {
        "name": "严重违法",
        "fields": [
          {
            "key": "f53",
            "name": "有无当前严重违法",
            "type": "bool"
          },
          {
            "key": "f54",
            "name": "有无历史严重违法",
            "type": "bool"
          },
          {
            "key": "f55",
            "name": "列入当前严重违法日期",
            "type": "daterange"
          },
          {
            "key": "f56",
            "name": "列入历史严重违法日期",
            "type": "daterange"
          },
          {
            "key": "f57",
            "name": "移出严重违法日期",
            "type": "daterange"
          }
        ]
      }
    ]
  },
  {
    "name": "联系方式",
    "groups": [
      {
        "name": "联系方式",
        "fields": [
          {
            "key": "f58",
            "name": "有无手机号",
            "type": "bool"
          },
          {
            "key": "f59",
            "name": "手机号/固话号码",
            "type": "text"
          }
        ]
      }
    ]
  },
  {
    "name": "知识产权",
    "groups": [
      {
        "name": "专利",
        "fields": [
          {
            "key": "f60",
            "name": "专利名称",
            "type": "text"
          },
          {
            "key": "f61",
            "name": "专利类型",
            "type": "text"
          },
          {
            "key": "f62",
            "name": "专利法律状态",
            "type": "text"
          },
          {
            "key": "f63",
            "name": "专利申请日期",
            "type": "daterange"
          },
          {
            "key": "f64",
            "name": "专利公开日期",
            "type": "daterange"
          },
          {
            "key": "f65",
            "name": "申请专利总数",
            "type": "numrange"
          },
          {
            "key": "f66",
            "name": "申请发明专利总数",
            "type": "numrange"
          },
          {
            "key": "f67",
            "name": "申请实用新型专利总数",
            "type": "numrange"
          },
          {
            "key": "f68",
            "name": "申请外观设计专利总数",
            "type": "numrange"
          },
          {
            "key": "f69",
            "name": "专利驳回数量",
            "type": "numrange"
          },
          {
            "key": "f70",
            "name": "有无专利",
            "type": "bool"
          },
          {
            "key": "f71",
            "name": "最近一年申请专利个数",
            "type": "numrange"
          }
        ]
      },
      {
        "name": "商标",
        "fields": [
          {
            "key": "f72",
            "name": "商标名称",
            "type": "text"
          },
          {
            "key": "f73",
            "name": "商标国际分类",
            "type": "text"
          },
          {
            "key": "f74",
            "name": "申请商标总数",
            "type": "numrange"
          },
          {
            "key": "f75",
            "name": "商标申请日期",
            "type": "daterange"
          },
          {
            "key": "f76",
            "name": "有无商标",
            "type": "bool"
          },
          {
            "key": "f77",
            "name": "商标专用权结束日期",
            "type": "daterange"
          },
          {
            "key": "f78",
            "name": "商标状态",
            "type": "text"
          }
        ]
      },
      {
        "name": "软著",
        "fields": [
          {
            "key": "f79",
            "name": "软著名称",
            "type": "text"
          },
          {
            "key": "f80",
            "name": "申请软著总数",
            "type": "numrange"
          },
          {
            "key": "f81",
            "name": "软著登记日期",
            "type": "daterange"
          },
          {
            "key": "f82",
            "name": "有无软著",
            "type": "bool"
          },
          {
            "key": "f83",
            "name": "最近一年软著申请个数",
            "type": "numrange"
          }
        ]
      },
      {
        "name": "作品著作",
        "fields": [
          {
            "key": "f84",
            "name": "有无作品著作权",
            "type": "bool"
          },
          {
            "key": "f85",
            "name": "最近一年著作申请个数",
            "type": "numrange"
          },
          {
            "key": "f86",
            "name": "作品名称",
            "type": "text"
          },
          {
            "key": "f87",
            "name": "作品总数",
            "type": "numrange"
          },
          {
            "key": "f88",
            "name": "著作登记日期",
            "type": "daterange"
          }
        ]
      }
    ]
  },
  {
    "name": "荣誉信息",
    "groups": [
      {
        "name": "荣誉信息",
        "fields": [
          {
            "key": "f89",
            "name": "是否为高新技术企业",
            "type": "bool"
          },
          {
            "key": "f90",
            "name": "是否为专精特新中小企业",
            "type": "bool"
          },
          {
            "key": "f91",
            "name": "是否为科技型中小企业",
            "type": "bool"
          },
          {
            "key": "f92",
            "name": "是否为国家众创空间",
            "type": "bool"
          },
          {
            "key": "f93",
            "name": "是否为龙头企业",
            "type": "bool"
          },
          {
            "key": "f94",
            "name": "是否为工程技术研究中心",
            "type": "bool"
          },
          {
            "key": "f95",
            "name": "是否为绿色工厂",
            "type": "bool"
          },
          {
            "key": "f96",
            "name": "是否为科学技术奖",
            "type": "bool"
          },
          {
            "key": "f97",
            "name": "是否为创新联合体",
            "type": "bool"
          },
          {
            "key": "f98",
            "name": "是否是中国500强",
            "type": "bool"
          },
          {
            "key": "f99",
            "name": "是否是世界500强",
            "type": "bool"
          },
          {
            "key": "f100",
            "name": "是否为专精特新\"小巨人\"企业",
            "type": "bool"
          },
          {
            "key": "f101",
            "name": "是否为企业技术中心",
            "type": "bool"
          },
          {
            "key": "f102",
            "name": "是否为科技企业孵化器",
            "type": "bool"
          },
          {
            "key": "f103",
            "name": "是否为技术创新示范企业",
            "type": "bool"
          },
          {
            "key": "f104",
            "name": "是否为隐形冠军企业",
            "type": "bool"
          },
          {
            "key": "f105",
            "name": "是否为隐形冠军培育企业",
            "type": "bool"
          },
          {
            "key": "f106",
            "name": "是否为科技小巨人企业",
            "type": "bool"
          },
          {
            "key": "f107",
            "name": "是否为重点实验室",
            "type": "bool"
          },
          {
            "key": "f108",
            "name": "是否为创新型中小企业",
            "type": "bool"
          },
          {
            "key": "f109",
            "name": "是否为技术先进型服务企业",
            "type": "bool"
          },
          {
            "key": "f110",
            "name": "是否为民营科技企业",
            "type": "bool"
          },
          {
            "key": "f111",
            "name": "是否为独角兽企业",
            "type": "bool"
          },
          {
            "key": "f112",
            "name": "是否为瞪羚企业",
            "type": "bool"
          },
          {
            "key": "f113",
            "name": "是否为雏鹰企业",
            "type": "bool"
          },
          {
            "key": "f114",
            "name": "是否为制造业单项冠军示范企业",
            "type": "bool"
          },
          {
            "key": "f115",
            "name": "是否为制造业单项冠军产品企业",
            "type": "bool"
          },
          {
            "key": "f116",
            "name": "是否为制造业单项冠军培育企业",
            "type": "bool"
          },
          {
            "key": "f117",
            "name": "荣誉有效期自",
            "type": "daterange"
          },
          {
            "key": "f118",
            "name": "荣誉有效期至",
            "type": "daterange"
          }
        ]
      }
    ]
  },
  {
    "name": "招投标",
    "groups": [
      {
        "name": "招投标",
        "fields": [
          {
            "key": "f119",
            "name": "是否有招投标",
            "type": "bool"
          },
          {
            "key": "f120",
            "name": "是否有招标",
            "type": "bool"
          },
          {
            "key": "f121",
            "name": "是否有中标",
            "type": "bool"
          },
          {
            "key": "f122",
            "name": "是否有投标",
            "type": "bool"
          },
          {
            "key": "f123",
            "name": "招投标信息发布日期",
            "type": "daterange"
          },
          {
            "key": "f124",
            "name": "招投标公告标题",
            "type": "text"
          },
          {
            "key": "f125",
            "name": "项目所属地区",
            "type": "text"
          },
          {
            "key": "f126",
            "name": "招投标公告类型",
            "type": "text"
          },
          {
            "key": "f127",
            "name": "招投标总数",
            "type": "numrange"
          },
          {
            "key": "f128",
            "name": "招标数量",
            "type": "numrange"
          },
          {
            "key": "f129",
            "name": "中标数量",
            "type": "numrange"
          },
          {
            "key": "f130",
            "name": "项目中标金额",
            "type": "numrange"
          }
        ]
      }
    ]
  },
  {
    "name": "资质证书",
    "groups": [
      {
        "name": "资质证书",
        "fields": [
          {
            "key": "f131",
            "name": "有无证书",
            "type": "bool"
          },
          {
            "key": "f132",
            "name": "初次发证日期",
            "type": "daterange"
          },
          {
            "key": "f133",
            "name": "证书数量",
            "type": "numrange"
          },
          {
            "key": "f134",
            "name": "证书类别",
            "type": "text"
          },
          {
            "key": "f135",
            "name": "最近1个月未发证证书类别",
            "type": "text"
          },
          {
            "key": "f136",
            "name": "最近6个月未发证证书类别",
            "type": "text"
          },
          {
            "key": "f137",
            "name": "最近一年未发证证书类别",
            "type": "text"
          },
          {
            "key": "f138",
            "name": "证书状态",
            "type": "text"
          },
          {
            "key": "f139",
            "name": "本年度获证数量",
            "type": "text"
          },
          {
            "key": "f140",
            "name": "证书发证日期",
            "type": "daterange"
          },
          {
            "key": "f141",
            "name": "证书失效日期",
            "type": "daterange"
          }
        ]
      }
    ]
  },
  {
    "name": "司法信息",
    "groups": [
      {
        "name": "裁判文书",
        "fields": [
          {
            "key": "f142",
            "name": "有无当前裁判文书",
            "type": "bool"
          },
          {
            "key": "f143",
            "name": "案件名称",
            "type": "text"
          },
          {
            "key": "f144",
            "name": "文书发布日期",
            "type": "daterange"
          },
          {
            "key": "f145",
            "name": "文书裁判日期",
            "type": "daterange"
          },
          {
            "key": "f146",
            "name": "文书案由关键字",
            "type": "text"
          },
          {
            "key": "f147",
            "name": "文书法院名称",
            "type": "text"
          },
          {
            "key": "f148",
            "name": "文书案号",
            "type": "text"
          },
          {
            "key": "f149",
            "name": "裁判文书当事人",
            "type": "text"
          },
          {
            "key": "f150",
            "name": "裁判文书类型",
            "type": "text"
          },
          {
            "key": "f151",
            "name": "裁判文书案件类型",
            "type": "text"
          },
          {
            "key": "f152",
            "name": "裁判文书身份",
            "type": "text"
          },
          {
            "key": "f153",
            "name": "裁判文书个数",
            "type": "numrange"
          }
        ]
      },
      {
        "name": "法院公告",
        "fields": [
          {
            "key": "f154",
            "name": "有无当前法院公告",
            "type": "bool"
          },
          {
            "key": "f155",
            "name": "公告发布日期",
            "type": "daterange"
          },
          {
            "key": "f156",
            "name": "法院公告当事人",
            "type": "text"
          },
          {
            "key": "f157",
            "name": "法院公告类型",
            "type": "text"
          },
          {
            "key": "f158",
            "name": "法院公告内容关键字",
            "type": "text"
          },
          {
            "key": "f159",
            "name": "法院公告身份",
            "type": "text"
          },
          {
            "key": "f160",
            "name": "法院公告个数",
            "type": "numrange"
          }
        ]
      },
      {
        "name": "开庭公告",
        "fields": [
          {
            "key": "f161",
            "name": "有无当前开庭公告",
            "type": "bool"
          },
          {
            "key": "f162",
            "name": "开庭日期",
            "type": "daterange"
          },
          {
            "key": "f163",
            "name": "开庭案号",
            "type": "text"
          },
          {
            "key": "f164",
            "name": "公告案由关键字",
            "type": "text"
          },
          {
            "key": "f165",
            "name": "开庭法院名称",
            "type": "text"
          },
          {
            "key": "f166",
            "name": "开庭公告当事人",
            "type": "text"
          },
          {
            "key": "f167",
            "name": "开庭公告身份",
            "type": "text"
          },
          {
            "key": "f168",
            "name": "开庭公告个数",
            "type": "numrange"
          }
        ]
      },
      {
        "name": "立案信息",
        "fields": [
          {
            "key": "f169",
            "name": "立案日期",
            "type": "daterange"
          },
          {
            "key": "f170",
            "name": "立案信息个数",
            "type": "numrange"
          },
          {
            "key": "f171",
            "name": "立案案由关键字",
            "type": "text"
          },
          {
            "key": "f172",
            "name": "立案案号",
            "type": "text"
          },
          {
            "key": "f173",
            "name": "立案法院名称",
            "type": "text"
          },
          {
            "key": "f174",
            "name": "结案时间",
            "type": "daterange"
          },
          {
            "key": "f175",
            "name": "开庭日期（立案信息）",
            "type": "daterange"
          },
          {
            "key": "f176",
            "name": "立案信息当事人",
            "type": "text"
          },
          {
            "key": "f177",
            "name": "立案信息案件状态",
            "type": "text"
          },
          {
            "key": "f178",
            "name": "立案信息身份",
            "type": "text"
          }
        ]
      },
      {
        "name": "被执行人",
        "fields": [
          {
            "key": "f179",
            "name": "有无当前被执行人",
            "type": "bool"
          },
          {
            "key": "f180",
            "name": "有无历史被执行人",
            "type": "bool"
          },
          {
            "key": "f181",
            "name": "被执行人立案日期",
            "type": "daterange"
          },
          {
            "key": "f182",
            "name": "当前被执行人标的金额",
            "type": "numrange"
          },
          {
            "key": "f183",
            "name": "历史被执行人立案日期",
            "type": "daterange"
          },
          {
            "key": "f184",
            "name": "历史被执行人标的金额",
            "type": "numrange"
          }
        ]
      },
      {
        "name": "失信人",
        "fields": [
          {
            "key": "f185",
            "name": "有无当前失信人",
            "type": "bool"
          },
          {
            "key": "f186",
            "name": "有无历史失信人",
            "type": "bool"
          },
          {
            "key": "f187",
            "name": "当前失信被执行人立案日期",
            "type": "daterange"
          },
          {
            "key": "f188",
            "name": "历史失信被执行人立案日期",
            "type": "daterange"
          },
          {
            "key": "f189",
            "name": "当前失信被执行人标的金额",
            "type": "numrange"
          },
          {
            "key": "f190",
            "name": "历史失信被执行人标的金额",
            "type": "numrange"
          }
        ]
      },
      {
        "name": "限制消费令",
        "fields": [
          {
            "key": "f191",
            "name": "有无当前限制高消费",
            "type": "bool"
          },
          {
            "key": "f192",
            "name": "有无历史限制高消费",
            "type": "bool"
          },
          {
            "key": "f193",
            "name": "当前限制高消费立案日期",
            "type": "daterange"
          },
          {
            "key": "f194",
            "name": "历史限制高消费立案日期",
            "type": "daterange"
          },
          {
            "key": "f195",
            "name": "有无被限高且无股份法人",
            "type": "bool"
          },
          {
            "key": "f196",
            "name": "有无被限高且无股份变更前法人",
            "type": "bool"
          },
          {
            "key": "f197",
            "name": "当前限制高消费发布日期",
            "type": "daterange"
          },
          {
            "key": "f198",
            "name": "历史限制高消费发布日期",
            "type": "daterange"
          }
        ]
      },
      {
        "name": "抵押出质冻结",
        "fields": [
          {
            "key": "f199",
            "name": "有无当前动产抵押",
            "type": "bool"
          },
          {
            "key": "f200",
            "name": "有无历史动产抵押",
            "type": "bool"
          },
          {
            "key": "f201",
            "name": "有无当前股权出质",
            "type": "bool"
          },
          {
            "key": "f202",
            "name": "有无历史股权出质",
            "type": "bool"
          },
          {
            "key": "f203",
            "name": "有无当前土地抵押",
            "type": "bool"
          },
          {
            "key": "f204",
            "name": "有无历史土地抵押",
            "type": "bool"
          }
        ]
      },
      {
        "name": "破产信息",
        "fields": [
          {
            "key": "f205",
            "name": "有无破产信息",
            "type": "bool"
          },
          {
            "key": "f206",
            "name": "破产重组案号",
            "type": "text"
          },
          {
            "key": "f207",
            "name": "破产重组公开日期",
            "type": "daterange"
          }
        ]
      }
    ]
  },
  {
    "name": "行政许可",
    "groups": [
      {
        "name": "行政许可",
        "fields": [
          {
            "key": "f208",
            "name": "有无当前行政许可",
            "type": "bool"
          },
          {
            "key": "f209",
            "name": "许可状态",
            "type": "text"
          },
          {
            "key": "f210",
            "name": "许可决定文书号名称",
            "type": "text"
          },
          {
            "key": "f211",
            "name": "当前行政许可决定文书名称",
            "type": "text"
          },
          {
            "key": "f212",
            "name": "当前行政许可内容",
            "type": "text"
          },
          {
            "key": "f213",
            "name": "当前行政许可机关",
            "type": "text"
          },
          {
            "key": "f214",
            "name": "有无历史行政许可",
            "type": "bool"
          },
          {
            "key": "f215",
            "name": "历史行政许可内容",
            "type": "text"
          },
          {
            "key": "f216",
            "name": "历史行政许可决定文书名称",
            "type": "text"
          },
          {
            "key": "f217",
            "name": "历史行政许可机关",
            "type": "text"
          },
          {
            "key": "f218",
            "name": "许可有效期自",
            "type": "daterange"
          },
          {
            "key": "f219",
            "name": "许可有效期至",
            "type": "daterange"
          }
        ]
      }
    ]
  },
  {
    "name": "税务信息",
    "groups": [
      {
        "name": "税务信息",
        "fields": [
          {
            "key": "f220",
            "name": "是否信用A级纳税人",
            "type": "bool"
          },
          {
            "key": "f221",
            "name": "信用A级纳税人评价年度",
            "type": "text"
          },
          {
            "key": "f222",
            "name": "税务类型",
            "type": "text"
          },
          {
            "key": "f223",
            "name": "有无重大税收违法",
            "type": "bool"
          },
          {
            "key": "f224",
            "name": "税收违法公布日期",
            "type": "daterange"
          },
          {
            "key": "f225",
            "name": "有无当前欠税",
            "type": "bool"
          },
          {
            "key": "f226",
            "name": "有无历史欠税",
            "type": "bool"
          },
          {
            "key": "f227",
            "name": "欠税公告日期",
            "type": "daterange"
          },
          {
            "key": "f228",
            "name": "是否为纳税非正常户",
            "type": "bool"
          },
          {
            "key": "f229",
            "name": "纳税人资质",
            "type": "text"
          },
          {
            "key": "f230",
            "name": "一般纳税人认定日期",
            "type": "daterange"
          }
        ]
      }
    ]
  },
  {
    "name": "招聘",
    "groups": [
      {
        "name": "招聘",
        "fields": [
          {
            "key": "f231",
            "name": "有无招聘",
            "type": "bool"
          },
          {
            "key": "f232",
            "name": "招聘岗位名称",
            "type": "text"
          },
          {
            "key": "f233",
            "name": "岗位最近招聘日期",
            "type": "daterange"
          }
        ]
      }
    ]
  },
  {
    "name": "网站信息",
    "groups": [
      {
        "name": "网站信息",
        "fields": [
          {
            "key": "f234",
            "name": "有无备案网站",
            "type": "bool"
          },
          {
            "key": "f235",
            "name": "网站关键词",
            "type": "text"
          },
          {
            "key": "f236",
            "name": "网站标题",
            "type": "text"
          },
          {
            "key": "f237",
            "name": "微信公众号个数",
            "type": "numrange"
          }
        ]
      }
    ]
  },
  {
    "name": "海关信息",
    "groups": [
      {
        "name": "海关信息",
        "fields": [
          {
            "key": "f238",
            "name": "海关注册日期",
            "type": "daterange"
          },
          {
            "key": "f239",
            "name": "海关经营类别",
            "type": "text"
          }
        ]
      }
    ]
  },
  {
    "name": "产品和服务",
    "groups": [
      {
        "name": "产品和服务",
        "fields": [
          {
            "key": "f240",
            "name": "主营产品类别",
            "type": "text"
          },
          {
            "key": "f241",
            "name": "产品和服务(精准)",
            "type": "text"
          }
        ]
      }
    ]
  }
]
