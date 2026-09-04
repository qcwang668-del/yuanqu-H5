-- 力企 - 平台管理·预留信息管理
-- 表：liqi_reserve_info（列表查询页，1:1 复刻自 力企云 SaaS）

CREATE TABLE IF NOT EXISTS `liqi_reserve_info` (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '编号',
  `reserve_user_name` varchar(64) DEFAULT '' COMMENT '预留人（用户名）',
  `reserve_phone` varchar(32) DEFAULT '' COMMENT '手机号',
  `source` tinyint DEFAULT NULL COMMENT '来源：1=小程序，2=PC端',
  `company` varchar(255) DEFAULT '' COMMENT '公司名称',
  `entity_id` bigint DEFAULT NULL COMMENT '公司实体编号（公司名称跳转用）',
  `content` varchar(512) DEFAULT '' COMMENT '申报内容 / 项目名称',
  `reserve_type` tinyint DEFAULT NULL COMMENT '预留信息入口：1=项目详情，4=企业详情',
  `reserve_way` tinyint DEFAULT NULL COMMENT '预留方式：1=我要申报，2=微信咨询，3=电话咨询',
  `relation_id` bigint DEFAULT NULL COMMENT '关联业务编号（申报内容跳转用）',
  `recommend_user_name` varchar(64) DEFAULT '' COMMENT '推荐人',
  `creator` varchar(64) DEFAULT '' COMMENT '创建者',
  `create_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updater` varchar(64) DEFAULT '' COMMENT '更新者',
  `update_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `deleted` bit(1) NOT NULL DEFAULT b'0' COMMENT '是否删除',
  `tenant_id` bigint NOT NULL DEFAULT 0 COMMENT '租户编号',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='力企 - 预留信息';

-- 测试数据（tenant_id=1）
INSERT INTO `liqi_reserve_info`
  (`reserve_user_name`, `reserve_phone`, `source`, `company`, `entity_id`, `content`, `reserve_type`, `reserve_way`, `relation_id`, `recommend_user_name`, `tenant_id`)
VALUES
  ('张三', '13800138000', 1, '智远力企科技有限公司', 1001, '高新技术企业认定项目', 1, 1, 2001, '李推广', 1),
  ('王五', '13900139000', 2, '力企云数据服务有限公司', 1002, '专精特新中小企业申报', 4, 2, 2002, '', 1),
  ('赵六', '13700137000', 1, '远力信息技术有限公司', 1003, '研发费用加计扣除咨询', 1, 3, 2003, '孙推广', 1);
