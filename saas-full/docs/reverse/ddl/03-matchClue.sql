-- ============================================================
-- 平台管理 - 匹配线索管理（liqi_match_clue）
-- 芋道(ruoyi-vue-pro)标准表结构：业务字段 + 标准列
-- ============================================================
DROP TABLE IF EXISTS `liqi_match_clue`;
CREATE TABLE `liqi_match_clue` (
  `id`                  bigint       NOT NULL AUTO_INCREMENT COMMENT '编号',
  `reserve_user_name`   varchar(64)  DEFAULT NULL COMMENT '预留用户名',
  `reserve_phone`       varchar(20)  DEFAULT NULL COMMENT '预留手机号',
  `source`              tinyint      DEFAULT NULL COMMENT '来源：0=小程序，1=PC端',
  `company`             varchar(255) DEFAULT NULL COMMENT '公司名称',
  `content`             varchar(512) DEFAULT NULL COMMENT '申报内容（项目名称）',
  `reserve_type`        varchar(64)  DEFAULT NULL COMMENT '预留信息入口',
  `reserve_way`         varchar(64)  DEFAULT NULL COMMENT '预留方式',
  `reserve_time`        datetime     DEFAULT NULL COMMENT '预留信息时间',
  `recommend_user_name` varchar(64)  DEFAULT NULL COMMENT '推荐人',
  -- 芋道标准列
  `creator`     varchar(64)  DEFAULT '' COMMENT '创建者',
  `create_time` datetime     NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updater`     varchar(64)  DEFAULT '' COMMENT '更新者',
  `update_time` datetime     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `deleted`     bit(1)       NOT NULL DEFAULT b'0' COMMENT '是否删除',
  `tenant_id`   bigint       NOT NULL DEFAULT 0 COMMENT '租户编号',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='力企-匹配线索管理';

-- 测试数据（tenant_id=1）
INSERT INTO `liqi_match_clue`
  (`reserve_user_name`, `reserve_phone`, `source`, `company`, `content`, `reserve_type`, `reserve_way`, `reserve_time`, `recommend_user_name`, `creator`, `updater`, `tenant_id`)
VALUES
  ('张三', '13800000001', 0, '深圳市智远科技有限公司', '高新技术企业认定申报', '项目详情', '电话咨询', '2026-08-20 10:15:00', '李推广', '1', '1', 1),
  ('王五', '13900000002', 1, '广州力企信息技术有限公司', '专精特新中小企业申报', '企业详情', '微信咨询', '2026-08-22 14:30:00', '赵推广', '1', '1', 1),
  ('刘芳', '13700000003', 0, '东莞市远力智能装备有限公司', '研发费用加计扣除辅导', '我要申报', '电话咨询', '2026-08-24 09:05:00', '', '1', '1', 1);
