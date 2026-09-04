-- 力企 - 智能体广场：两个智能体种子数据（工商挂 MCP / 司法占位）
-- 导入必须带 --default-character-set=utf8mb4，否则中文双重编码乱码
SET NAMES utf8mb4;

-- 工商信息智能体：启用 MCP，指向本机工商「企业信息洞察」MCP（后端与 MCP 同在卫星机）
UPDATE `liqi_agent` SET
  `name`        = '工商信息智能体',
  `description` = '查询企业工商登记信息：法定代表人、注册资本、成立日期、经营状态、统一社会信用代码、股东、对外投资、分支机构、主要人员、股权出质等。',
  `system_prompt` = '你是「工商信息智能体」，专精企业工商登记信息查询。当用户询问某企业的工商信息（法定代表人、注册资本、成立日期、经营状态、统一社会信用代码、股东、对外投资、分支机构、主要人员、股权出质等）时：1) 若企业名称不完整或不确定，先调用 enterprise_get_keyword_search 按关键词模糊查询补全企业全称；2) 再调用 enterprise_get_enterprise_base_info（工商基本信息）、enterprise_get_enterprise_holder_info（股东持股）等工具获取真实数据；3) 基于工具返回的数据用中文条理清晰地回答，务必列出统一社会信用代码、法定代表人、注册资本、成立日期、经营状态等关键信息。严禁编造数据，工具未返回的信息如实说明。',
  `provider`    = 'ark',
  `model`       = 'ark-code-latest',
  `mcp_enabled` = b'1',
  `mcp_url`     = 'http://127.0.0.1:8800/mcp/',
  `sort`        = 1,
  `status`      = 0
WHERE `name` LIKE '%工商%' OR `id` = (SELECT MIN(id) FROM (SELECT id FROM `liqi_agent` ORDER BY id LIMIT 1) t);

-- 企业司法智能体：暂不挂 MCP（司法数据源后续接入），纯对话占位
UPDATE `liqi_agent` SET
  `name`        = '企业司法风险智能体',
  `description` = '评估企业司法风险：涉诉、被执行人、失信被执行人、开庭公告、股权冻结等维度（司法数据接口接入中，当前为咨询占位）。',
  `system_prompt` = '你是「企业司法风险智能体」，帮助用户评估企业是否存在司法风险，关注维度包括：涉诉/裁判文书、被执行人、失信被执行人、开庭公告、股权冻结、立案信息等。当前司法数据接口正在接入中，暂无法实时查询具体企业。请先向用户如实说明这一情况，并基于用户提供的信息给出司法风险核查维度的一般性专业说明与建议；数据接口就绪后将自动支持实时查询。用中文、专业、简洁地回答，不编造具体案件数据。',
  `provider`    = 'ark',
  `model`       = 'ark-code-latest',
  `mcp_enabled` = b'0',
  `mcp_url`     = '',
  `sort`        = 2,
  `status`      = 0
WHERE `name` LIKE '%司法%' OR `name` LIKE '%法律%' OR `id` = (SELECT MAX(id) FROM (SELECT id FROM `liqi_agent`) t);

-- 核对
SELECT id, name, provider, model, mcp_enabled, mcp_url, status FROM `liqi_agent` WHERE deleted = 0 ORDER BY sort;
