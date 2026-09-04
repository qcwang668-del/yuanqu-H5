-- 力企企业库 · 维度扩充（规范化：主表扩列 + 子表）
-- 基本信息扩展列 + 股东由天眼查按需回填；联系方式/知产/司法/项目为结构（后续接数据源）
-- 幂等：列/表存在则忽略（MySQL 8 支持 IF NOT EXISTS）

-- ========== 主表扩展：基本信息维度（MySQL8 无 ADD COLUMN IF NOT EXISTS，首次执行）==========
ALTER TABLE `liqi_enterprise`
  ADD COLUMN `credit_code`     varchar(32)  NULL COMMENT '统一社会信用代码',
  ADD COLUMN `reg_number`      varchar(32)  NULL COMMENT '工商注册号',
  ADD COLUMN `org_number`      varchar(32)  NULL COMMENT '组织机构代码',
  ADD COLUMN `tax_number`      varchar(32)  NULL COMMENT '纳税人识别号',
  ADD COLUMN `former_name`     varchar(512) NULL COMMENT '曾用名',
  ADD COLUMN `company_org_type` varchar(64) NULL COMMENT '企业类型',
  ADD COLUMN `reg_status`      varchar(32)  NULL COMMENT '经营状态',
  ADD COLUMN `actual_capital`  varchar(64)  NULL COMMENT '实缴资本',
  ADD COLUMN `staff_num_range` varchar(32)  NULL COMMENT '人员规模',
  ADD COLUMN `reg_institute`   varchar(128) NULL COMMENT '登记机关',
  ADD COLUMN `bond_name`       varchar(64)  NULL COMMENT '上市简称',
  ADD COLUMN `bond_num`        varchar(32)  NULL COMMENT '上市代码',
  ADD COLUMN `business_scope`  text         NULL COMMENT '经营范围',
  ADD COLUMN `tags`            varchar(1024) NULL COMMENT '企业标签（; 分隔）',
  ADD COLUMN `enrich_status`   tinyint      NOT NULL DEFAULT 0 COMMENT '工商回填状态：0未回填 1已回填 2查无结果',
  ADD COLUMN `enrich_time`     datetime     NULL COMMENT '最近工商回填时间';

-- ========== 子表：股东信息（天眼查回填）==========
CREATE TABLE IF NOT EXISTS `liqi_enterprise_shareholder` (
  `id`            bigint       NOT NULL AUTO_INCREMENT COMMENT '编号',
  `enterprise_id` bigint       NOT NULL COMMENT '企业编号',
  `name`          varchar(255) NULL COMMENT '股东名称',
  `percent`       varchar(32)  NULL COMMENT '持股比例',
  `amount`        varchar(64)  NULL COMMENT '认缴出资额',
  `shareholder_type` varchar(32) NULL COMMENT '股东类型',
  `creator`     varchar(64)  DEFAULT '' COMMENT '创建者',
  `create_time` datetime     DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updater`     varchar(64)  DEFAULT '' COMMENT '更新者',
  `update_time` datetime     DEFAULT CURRENT_TIMESTAMP COMMENT '更新时间',
  `deleted`     bit(1)       DEFAULT b'0' COMMENT '是否删除',
  `tenant_id`   bigint       DEFAULT 0 COMMENT '租户编号',
  PRIMARY KEY (`id`),
  KEY `idx_ent` (`enterprise_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='力企企业库-股东信息';

-- ========== 子表：联系方式（结构）==========
CREATE TABLE IF NOT EXISTS `liqi_enterprise_contact` (
  `id`            bigint       NOT NULL AUTO_INCREMENT COMMENT '编号',
  `enterprise_id` bigint       NOT NULL COMMENT '企业编号',
  `contact`       varchar(128) NULL COMMENT '电话/手机/邮箱',
  `name`          varchar(64)  NULL COMMENT '姓名',
  `contact_type`  varchar(16)  NULL COMMENT '类型：mobile/tel/email',
  `tags`          varchar(128) NULL COMMENT '标签（推荐人/疑似法人/疑似高管）',
  `star`          tinyint      NULL COMMENT '星级 1-5',
  `platform`      varchar(64)  NULL COMMENT '平台信息',
  `creator`     varchar(64)  DEFAULT '' COMMENT '创建者',
  `create_time` datetime     DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updater`     varchar(64)  DEFAULT '' COMMENT '更新者',
  `update_time` datetime     DEFAULT CURRENT_TIMESTAMP COMMENT '更新时间',
  `deleted`     bit(1)       DEFAULT b'0' COMMENT '是否删除',
  `tenant_id`   bigint       DEFAULT 0 COMMENT '租户编号',
  PRIMARY KEY (`id`),
  KEY `idx_ent` (`enterprise_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='力企企业库-联系方式';

-- ========== 子表：知识产权（结构）==========
CREATE TABLE IF NOT EXISTS `liqi_enterprise_ip` (
  `id`            bigint       NOT NULL AUTO_INCREMENT COMMENT '编号',
  `enterprise_id` bigint       NOT NULL COMMENT '企业编号',
  `ip_type`       varchar(16)  NULL COMMENT '类型：patent/trademark/software/copyright',
  `name`          varchar(512) NULL COMMENT '名称',
  `category`      varchar(128) NULL COMMENT '分类/类型',
  `apply_date`    varchar(32)  NULL COMMENT '申请日期',
  `status`        varchar(64)  NULL COMMENT '法律状态',
  `creator`     varchar(64)  DEFAULT '' COMMENT '创建者',
  `create_time` datetime     DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updater`     varchar(64)  DEFAULT '' COMMENT '更新者',
  `update_time` datetime     DEFAULT CURRENT_TIMESTAMP COMMENT '更新时间',
  `deleted`     bit(1)       DEFAULT b'0' COMMENT '是否删除',
  `tenant_id`   bigint       DEFAULT 0 COMMENT '租户编号',
  PRIMARY KEY (`id`),
  KEY `idx_ent` (`enterprise_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='力企企业库-知识产权';

-- ========== 子表：司法/经营风险（结构）==========
CREATE TABLE IF NOT EXISTS `liqi_enterprise_risk` (
  `id`            bigint       NOT NULL AUTO_INCREMENT COMMENT '编号',
  `enterprise_id` bigint       NOT NULL COMMENT '企业编号',
  `risk_type`     varchar(24)  NULL COMMENT '类型：judgment/executed/restrict/abnormal/penalty',
  `title`         varchar(512) NULL COMMENT '标题/案由/内容',
  `case_no`       varchar(128) NULL COMMENT '案号',
  `role`          varchar(32)  NULL COMMENT '身份',
  `org`           varchar(128) NULL COMMENT '机关',
  `risk_date`     varchar(32)  NULL COMMENT '日期',
  `creator`     varchar(64)  DEFAULT '' COMMENT '创建者',
  `create_time` datetime     DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updater`     varchar(64)  DEFAULT '' COMMENT '更新者',
  `update_time` datetime     DEFAULT CURRENT_TIMESTAMP COMMENT '更新时间',
  `deleted`     bit(1)       DEFAULT b'0' COMMENT '是否删除',
  `tenant_id`   bigint       DEFAULT 0 COMMENT '租户编号',
  PRIMARY KEY (`id`),
  KEY `idx_ent` (`enterprise_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='力企企业库-司法经营风险';

-- ========== 子表：项目申报（结构）==========
CREATE TABLE IF NOT EXISTS `liqi_enterprise_project` (
  `id`            bigint       NOT NULL AUTO_INCREMENT COMMENT '编号',
  `enterprise_id` bigint       NOT NULL COMMENT '企业编号',
  `title`         varchar(512) NULL COMMENT '项目名称',
  `org`           varchar(128) NULL COMMENT '申报机关',
  `region`        varchar(64)  NULL COMMENT '所属地区',
  `declare_year`  varchar(16)  NULL COMMENT '年度',
  `subsidy`       varchar(32)  NULL COMMENT '已获补贴（万元）',
  `creator`     varchar(64)  DEFAULT '' COMMENT '创建者',
  `create_time` datetime     DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updater`     varchar(64)  DEFAULT '' COMMENT '更新者',
  `update_time` datetime     DEFAULT CURRENT_TIMESTAMP COMMENT '更新时间',
  `deleted`     bit(1)       DEFAULT b'0' COMMENT '是否删除',
  `tenant_id`   bigint       DEFAULT 0 COMMENT '租户编号',
  PRIMARY KEY (`id`),
  KEY `idx_ent` (`enterprise_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='力企企业库-项目申报';
