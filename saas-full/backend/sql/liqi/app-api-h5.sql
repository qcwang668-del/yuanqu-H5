-- =============================================================
-- 力企云 · 惠企政策 H5（C 端 app-api）业务表 DDL
-- 2026-08-31 · 外部企业/政策数据零落库，本地仅存"用户产生的"业务数据
-- 字符集 utf8mb4；导入须加 --default-character-set=utf8mb4
-- =============================================================

-- 1) 政策收藏（政策本体在外部，仅存外部 ID + 标题快照）
CREATE TABLE IF NOT EXISTS `liqi_policy_favorite` (
  `id`            BIGINT       NOT NULL AUTO_INCREMENT COMMENT '编号',
  `user_id`       BIGINT       NOT NULL COMMENT '会员用户 ID（member_user.id）',
  `policy_id`     VARCHAR(64)  NOT NULL COMMENT '外部政策 ID',
  `policy_title`  VARCHAR(255) DEFAULT NULL COMMENT '政策标题快照',
  `policy_type`   VARCHAR(16)  DEFAULT NULL COMMENT '类型 project/original/public/park',
  `publish_org`   VARCHAR(128) DEFAULT NULL COMMENT '发布部门/园区快照',
  `creator`       VARCHAR(64)  DEFAULT '',
  `create_time`   DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updater`       VARCHAR(64)  DEFAULT '',
  `update_time`   DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted`       BIT(1)       NOT NULL DEFAULT b'0',
  `tenant_id`     BIGINT       NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`),
  KEY `idx_user` (`user_id`),
  KEY `idx_user_policy` (`user_id`, `policy_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='力企-政策收藏';

-- 2) 政策申报（C 端提交，B 端可作申报线索）
CREATE TABLE IF NOT EXISTS `liqi_policy_apply` (
  `id`              BIGINT       NOT NULL AUTO_INCREMENT COMMENT '编号',
  `user_id`         BIGINT       NOT NULL COMMENT '会员用户 ID',
  `policy_id`       VARCHAR(64)  DEFAULT NULL COMMENT '外部政策 ID（可空）',
  `policy_title`    VARCHAR(255) DEFAULT NULL COMMENT '政策标题快照',
  `policy_type`     VARCHAR(16)  DEFAULT NULL COMMENT '政策类型',
  `enterprise_name` VARCHAR(255) NOT NULL COMMENT '申报企业全称',
  `contact_name`    VARCHAR(64)  NOT NULL COMMENT '联系人',
  `contact_phone`   VARCHAR(32)  NOT NULL COMMENT '联系电话',
  `remark`          VARCHAR(500) DEFAULT NULL COMMENT '备注',
  `status`          TINYINT      NOT NULL DEFAULT 0 COMMENT '状态：0待联系 1已联系 2已完成',
  `creator`         VARCHAR(64)  DEFAULT '',
  `create_time`     DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updater`         VARCHAR(64)  DEFAULT '',
  `update_time`     DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted`         BIT(1)       NOT NULL DEFAULT b'0',
  `tenant_id`       BIGINT       NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`),
  KEY `idx_user` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='力企-政策申报';

-- 3) 订阅推送设置（每会员一条；精准推送/临期提醒匹配依据）
CREATE TABLE IF NOT EXISTS `liqi_subscribe_setting` (
  `id`           BIGINT      NOT NULL AUTO_INCREMENT COMMENT '编号',
  `user_id`      BIGINT      NOT NULL COMMENT '会员用户 ID',
  `sub_zjx`      TINYINT     NOT NULL DEFAULT 0 COMMENT '专精特新 1订阅',
  `sub_rd`       TINYINT     NOT NULL DEFAULT 0 COMMENT '研发补贴',
  `sub_equip`    TINYINT     NOT NULL DEFAULT 0 COMMENT '设备更新',
  `sub_high`     TINYINT     NOT NULL DEFAULT 0 COMMENT '高企认定',
  `sub_startup`  TINYINT     NOT NULL DEFAULT 0 COMMENT '创业扶持',
  `sub_park`     TINYINT     NOT NULL DEFAULT 0 COMMENT '园区发布',
  `region`       VARCHAR(64) DEFAULT NULL COMMENT '关注地区',
  `industry`     VARCHAR(64) DEFAULT NULL COMMENT '关注行业',
  `creator`      VARCHAR(64) DEFAULT '',
  `create_time`  DATETIME    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updater`      VARCHAR(64) DEFAULT '',
  `update_time`  DATETIME    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted`      BIT(1)      NOT NULL DEFAULT b'0',
  `tenant_id`    BIGINT      NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_user` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='力企-订阅推送设置';

-- 4) 用户企业绑定（绑定时快照地区/行业/资质，供智能匹配/推送离线使用）
CREATE TABLE IF NOT EXISTS `liqi_user_enterprise_bind` (
  `id`                     BIGINT       NOT NULL AUTO_INCREMENT COMMENT '编号',
  `user_id`                BIGINT       NOT NULL COMMENT '会员用户 ID',
  `enterprise_name`        VARCHAR(255) NOT NULL COMMENT '企业名称',
  `credit_code`            VARCHAR(64)  DEFAULT NULL COMMENT '统一社会信用代码',
  `legal_person`           VARCHAR(64)  DEFAULT NULL COMMENT '法定代表人快照',
  `snapshot_region`        VARCHAR(128) DEFAULT NULL COMMENT '地区快照（如 深圳市/南山区）',
  `snapshot_industry`      VARCHAR(128) DEFAULT NULL COMMENT '行业快照',
  `snapshot_qualifications` VARCHAR(255) DEFAULT NULL COMMENT '资质快照（高新技术企业;专精特新）',
  `creator`                VARCHAR(64)  DEFAULT '',
  `create_time`            DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updater`                VARCHAR(64)  DEFAULT '',
  `update_time`            DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted`                BIT(1)       NOT NULL DEFAULT b'0',
  `tenant_id`              BIGINT       NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`),
  KEY `idx_user` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='力企-用户企业绑定';

-- 5) liqi_park 增加外部企业查询的地区映射字段（按园区地址调外部区域搜索的入参）
-- 注：MySQL8 不支持 ADD COLUMN IF NOT EXISTS，首次执行即可；重复执行报"重复列"可忽略。
ALTER TABLE `liqi_park`
  ADD COLUMN `region_province` VARCHAR(64) DEFAULT NULL COMMENT '外部查询-省' AFTER `city`,
  ADD COLUMN `region_district` VARCHAR(64) DEFAULT NULL COMMENT '外部查询-区/县' AFTER `region_province`;

-- 园区地区映射数据（MySQL 不支持 ADD COLUMN IF NOT EXISTS 的旧版本请忽略报错；UPDATE 幂等可重复执行）
UPDATE `liqi_park` SET `region_province`='广东省', `region_district`='南山区'
  WHERE `park_name` LIKE '%深圳湾%' OR `address_keyword` LIKE '%科技园%';
UPDATE `liqi_park` SET `region_province`='广东省', `region_district`='天河区'
  WHERE `park_name` LIKE '%天河%' OR `address_keyword` LIKE '%天河%';
UPDATE `liqi_park` SET `region_province`='北京市', `region_district`='朝阳区'
  WHERE `park_name` LIKE '%朝阳%' OR `address_keyword` LIKE '%朝阳%';
