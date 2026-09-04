-- =============================================================
-- 力企云 SaaS 复刻 · 企业管理-企业获批动态
-- 表：liqi_approval_dynamic
-- 逆向自前端 chunk（接口 /liqi/approval-dynamic/page）
-- 业务字段 + 芋道标准列（creator/create_time/updater/update_time/deleted/tenant_id）
-- =============================================================

DROP TABLE IF EXISTS `liqi_approval_dynamic`;
CREATE TABLE `liqi_approval_dynamic` (
    `id`                bigint       NOT NULL AUTO_INCREMENT COMMENT '编号',
    `enterprise_name`   varchar(255) NOT NULL DEFAULT '' COMMENT '企业名称',
    `credit_code`       varchar(64)  NOT NULL DEFAULT '' COMMENT '统一社会信用代码',
    `legal_person`      varchar(64)  NOT NULL DEFAULT '' COMMENT '法定代表人',
    `approval_project`  varchar(255) NOT NULL DEFAULT '' COMMENT '获批项目',
    `approval_time`     datetime     NULL     DEFAULT NULL COMMENT '获批时间',
    `status`            tinyint      NOT NULL DEFAULT 0 COMMENT '状态：0=正常，1=异常',
    -- 芋道标准列
    `creator`           varchar(64)  DEFAULT ''  COMMENT '创建者',
    `create_time`       datetime     NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `updater`           varchar(64)  DEFAULT ''  COMMENT '更新者',
    `update_time`       datetime     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    `deleted`           bit(1)       NOT NULL DEFAULT b'0' COMMENT '是否删除',
    `tenant_id`         bigint       NOT NULL DEFAULT 0 COMMENT '租户编号',
    PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='力企 - 企业获批动态';

-- 测试数据（tenant_id = 1）
INSERT INTO `liqi_approval_dynamic`
    (`enterprise_name`, `credit_code`, `legal_person`, `approval_project`, `approval_time`, `status`, `tenant_id`)
VALUES
    ('深圳市大疆无人机应用有限公司', '91440300MA5EXXXX1A', '汪滔', '高新技术企业认定', '2026-03-15 10:00:00', 0, 1),
    ('广州天河智能制造有限公司',     '91440101MA5FXXXX2B', '陈明', '专精特新中小企业', '2026-05-20 14:30:00', 0, 1),
    ('北京中科数字科技有限公司',     '91110108MA5GXXXX3C', '李强', '国家科技型中小企业', '2026-06-08 09:15:00', 1, 1);
