-- ============================================================
-- 系统管理 - 网站配置（liqi_website_config）
-- 单例配置表单：每个租户一条配置，get 读取 + update 保存
-- 芋道(ruoyi-vue-pro)标准表结构：业务字段 + 标准列
-- ============================================================
DROP TABLE IF EXISTS `liqi_website_config`;
CREATE TABLE `liqi_website_config` (
  `id`                    bigint       NOT NULL AUTO_INCREMENT COMMENT '编号',
  `domain_name`           varchar(128) DEFAULT NULL COMMENT '二级域名',
  `redirect_domain_name`  varchar(255) DEFAULT NULL COMMENT '重定向域名',
  `icp_num`               varchar(128) DEFAULT NULL COMMENT '网站备案号',
  `brand_name`            varchar(128) DEFAULT NULL COMMENT '品牌名称',
  `brand_logo_horizontal` varchar(512) DEFAULT NULL COMMENT '品牌LOGO（横向）',
  `brand_logo_vertical`   varchar(512) DEFAULT NULL COMMENT '品牌LOGO（竖向）',
  `small_program_qr_code` varchar(512) DEFAULT NULL COMMENT '小程序二维码',
  -- 芋道标准列
  `creator`     varchar(64)  DEFAULT '' COMMENT '创建者',
  `create_time` datetime     NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updater`     varchar(64)  DEFAULT '' COMMENT '更新者',
  `update_time` datetime     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `deleted`     bit(1)       NOT NULL DEFAULT b'0' COMMENT '是否删除',
  `tenant_id`   bigint       NOT NULL DEFAULT 0 COMMENT '租户编号',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='力企-网站配置';

-- 默认配置数据（tenant_id=1）
INSERT INTO `liqi_website_config`
  (`domain_name`, `redirect_domain_name`, `icp_num`, `brand_name`, `brand_logo_horizontal`, `brand_logo_vertical`, `small_program_qr_code`, `creator`, `updater`, `tenant_id`)
VALUES
  ('liqi', 'https://www.liqicloud.com', '粤ICP备2026000001号', '智远力企', '', '', '', '1', '1', 1);
