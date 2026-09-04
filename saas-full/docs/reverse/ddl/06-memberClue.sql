-- ============================================================
-- 力企云 SaaS · 企业管理-会员线索管理
-- 表：liqi_member_clue
-- 逆向自门户「会员线索管理」视图
--   （localStorage: memberCluesMgSearchInfo，
--    接口 /system/qiye/high-tech-enterprise/clue/page）
-- 芋道多租户标准表（含 creator/create_time/updater/update_time/deleted/tenant_id）
-- ============================================================

DROP TABLE IF EXISTS `liqi_member_clue`;
CREATE TABLE `liqi_member_clue` (
  `id`               bigint       NOT NULL AUTO_INCREMENT COMMENT '编号',
  `enterprise_name`  varchar(255) NOT NULL DEFAULT ''      COMMENT '企业名称',
  `clue_type`        tinyint      NOT NULL DEFAULT 0        COMMENT '高企/资质类型：0=高新技术企业，1=科技型中小企业，2=专精特新',
  `register_address` varchar(255) NOT NULL DEFAULT ''      COMMENT '注册地址',
  `match_condition`  varchar(512) NOT NULL DEFAULT ''      COMMENT '符合条件（命中的政策/资质说明）',
  `source`           tinyint      NOT NULL DEFAULT 0        COMMENT '线索来源：0=小程序，1=PC端，2=系统匹配',
  `status`           tinyint      NOT NULL DEFAULT 0        COMMENT '状态：0=待跟进，1=跟进中，2=已转化，3=已关闭',
  `creator`          varchar(64)           DEFAULT ''       COMMENT '创建者',
  `create_time`      datetime     NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updater`          varchar(64)           DEFAULT ''       COMMENT '更新者',
  `update_time`      datetime     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `deleted`          bit(1)       NOT NULL DEFAULT b'0'     COMMENT '是否删除',
  `tenant_id`        bigint       NOT NULL DEFAULT 0        COMMENT '租户编号',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='力企 - 会员线索';

-- ----------------------------
-- 测试数据（tenant_id = 1）
-- ----------------------------
INSERT INTO `liqi_member_clue`
  (`enterprise_name`, `clue_type`, `register_address`, `match_condition`, `source`, `status`, `creator`, `tenant_id`)
VALUES
  ('深圳市智远科技有限公司', 0, '广东省深圳市南山区科技园', '符合高新技术企业认定：知识产权、研发费用占比达标', 2, 1, '1', 1),
  ('广州力企信息技术有限公司', 1, '广东省广州市天河区珠江新城', '符合科技型中小企业入库条件', 0, 0, '1', 1),
  ('东莞市专精特新智能装备有限公司', 2, '广东省东莞市松山湖高新区', '符合省级专精特新中小企业认定标准', 1, 2, '1', 1);
