-- =============================================================
-- 力企云 SaaS 复刻 · 企业管理-会员管理系统
-- 表：liqi_member
-- 逆向自前端 chunk index-DDtGtXRR.js（接口 /system/partner/member/page）
-- 业务字段 + 芋道标准列（creator/create_time/updater/update_time/deleted/tenant_id）
-- =============================================================

DROP TABLE IF EXISTS `liqi_member`;
CREATE TABLE `liqi_member` (
    `id`                        bigint       NOT NULL AUTO_INCREMENT COMMENT '编号',
    `enterprise_name`           varchar(255) NOT NULL DEFAULT '' COMMENT '企业名称',
    `legal_person`              varchar(64)  NOT NULL DEFAULT '' COMMENT '法人',
    `register_address`          varchar(512) NOT NULL DEFAULT '' COMMENT '注册地址',
    `phone`                     varchar(20)  NOT NULL DEFAULT '' COMMENT '手机号',
    `responsible_person_name`   varchar(64)  NOT NULL DEFAULT '' COMMENT '企业负责人姓名',
    `responsible_person_phone`  varchar(20)  NOT NULL DEFAULT '' COMMENT '企业负责人联系方式',
    `contact_person_name`       varchar(64)  NOT NULL DEFAULT '' COMMENT '企业对接人姓名',
    `contact_person_phone`      varchar(20)  NOT NULL DEFAULT '' COMMENT '企业对接人联系方式',
    `is_pushed_customer`        tinyint      NOT NULL DEFAULT 0 COMMENT '是否推送客户：0=否，1=是',
    `creator_name`              varchar(64)  NOT NULL DEFAULT '' COMMENT '创建人姓名',
    -- 芋道标准列
    `creator`                   varchar(64)  DEFAULT ''  COMMENT '创建者',
    `create_time`               datetime     NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `updater`                   varchar(64)  DEFAULT ''  COMMENT '更新者',
    `update_time`               datetime     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    `deleted`                   bit(1)       NOT NULL DEFAULT b'0' COMMENT '是否删除',
    `tenant_id`                 bigint       NOT NULL DEFAULT 0 COMMENT '租户编号',
    PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='力企 - 会员管理系统';

-- 测试数据（tenant_id = 1）
INSERT INTO `liqi_member`
    (`enterprise_name`, `legal_person`, `register_address`, `phone`,
     `responsible_person_name`, `responsible_person_phone`,
     `contact_person_name`, `contact_person_phone`,
     `is_pushed_customer`, `creator_name`, `tenant_id`)
VALUES
    ('深圳市智远力企科技有限公司', '张伟', '深圳市南山区科技园1栋', '13800001111',
     '张伟', '13800001111', '李娜', '13800002222', 1, '系统管理员', 1),
    ('广州天成信息技术有限公司', '王强', '广州市天河区珠江路88号', '13900003333',
     '王强', '13900003333', '赵敏', '13900004444', 0, '系统管理员', 1),
    ('北京华创企业服务有限公司', '刘洋', '北京市朝阳区建国路100号', '13700005555',
     '刘洋', '13700005555', '孙丽', '13700006666', 1, '系统管理员', 1);
