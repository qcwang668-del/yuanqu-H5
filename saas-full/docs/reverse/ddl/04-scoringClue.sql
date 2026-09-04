-- =============================================================
-- 力企云 SaaS · 平台管理 - 评分线索管理
-- 表：liqi_scoring_clue
-- 逆向来源：前端 chunk index-B-WhMQV1.js（scoringClue 列表视图）
-- 生成：仅建表 + 测试数据，勿在容器直接连库执行
-- =============================================================

DROP TABLE IF EXISTS `liqi_scoring_clue`;
CREATE TABLE `liqi_scoring_clue` (
    `id`                  bigint       NOT NULL AUTO_INCREMENT COMMENT '编号',
    `user_name`           varchar(64)  DEFAULT NULL COMMENT '用户名',
    `phone`               varchar(20)  DEFAULT NULL COMMENT '手机号',
    `clue_source`         tinyint      DEFAULT NULL COMMENT '来源：1=小程序，2=PC端',
    `company_name`        varchar(255) DEFAULT NULL COMMENT '参与评分公司名称',
    `contact_information` tinyint      DEFAULT NULL COMMENT '咨询方式：1=微信咨询，2=电话咨询',
    `score_time`          datetime     DEFAULT NULL COMMENT '评分时间',
    -- 芋道标准列
    `creator`             varchar(64)  DEFAULT ''  COMMENT '创建者',
    `create_time`         datetime     NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `updater`             varchar(64)  DEFAULT ''  COMMENT '更新者',
    `update_time`         datetime     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    `deleted`             bit(1)       NOT NULL DEFAULT b'0' COMMENT '是否删除',
    `tenant_id`           bigint       NOT NULL DEFAULT 0 COMMENT '租户编号',
    PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='力企 - 评分线索管理';

-- 测试数据（tenant_id=1）
INSERT INTO `liqi_scoring_clue`
    (`user_name`, `phone`, `clue_source`, `company_name`, `contact_information`, `score_time`, `tenant_id`)
VALUES
    ('张伟', '13800001111', 1, '深圳市智远科技有限公司',   1, '2026-08-20 10:15:00', 1),
    ('李娜', '13900002222', 2, '广州力企信息技术有限公司', 2, '2026-08-22 14:30:00', 1),
    ('王强', '13700003333', 1, '东莞市高新智造股份有限公司', 1, '2026-08-24 09:05:00', 1);
