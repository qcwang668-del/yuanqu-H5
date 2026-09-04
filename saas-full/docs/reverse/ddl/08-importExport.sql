-- ======================================================================
-- 力企云 SaaS 复刻 · 我的导入导出记录（顶层菜单：我的导入导出）
-- 表：liqi_import_export_record
-- 接口：/liqi/import-export   权限：liqi:import-export
-- 逆向来源：myImport-CC92Nuuj.js / myExport-Y-YYumTL.js
--   列字段：文件名称 fileName / 文件附件 fileUrl / 模块 module /
--          状态 status(处理中/成功/失败) / 时间 time / 错误信息 errMsg
--   合并顶层菜单增加 type(0导入/1导出) 以区分导入与导出记录
-- ======================================================================

DROP TABLE IF EXISTS `liqi_import_export_record`;
CREATE TABLE `liqi_import_export_record` (
  `id`          bigint       NOT NULL AUTO_INCREMENT COMMENT '编号',
  `file_name`   varchar(255) NULL DEFAULT NULL        COMMENT '文件名称',
  `type`        int          NULL DEFAULT 0           COMMENT '类型：0=导入，1=导出',
  `module`      varchar(100) NULL DEFAULT NULL        COMMENT '模块（导入/导出模块）',
  `status`      int          NULL DEFAULT 0           COMMENT '状态：0=处理中，1=成功，2=失败',
  `file_url`    varchar(512) NULL DEFAULT NULL        COMMENT '文件地址（导入/导出附件）',
  `err_msg`     varchar(512) NULL DEFAULT NULL        COMMENT '错误信息',
  -- 芋道标准列
  `creator`     varchar(64)  NULL DEFAULT ''          COMMENT '创建者',
  `create_time` datetime     NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updater`     varchar(64)  NULL DEFAULT ''          COMMENT '更新者',
  `update_time` datetime     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `deleted`     bit(1)       NOT NULL DEFAULT b'0'    COMMENT '是否删除',
  `tenant_id`   bigint       NOT NULL DEFAULT 0       COMMENT '租户编号',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='力企 - 我的导入导出记录';

-- 测试数据（tenant_id = 1）
INSERT INTO `liqi_import_export_record`
  (`file_name`, `type`, `module`, `status`, `file_url`, `err_msg`, `creator`, `create_time`, `updater`, `update_time`, `deleted`, `tenant_id`)
VALUES
  ('企业用户导入模板-20260820.xlsx', 0, '企业用户', 1, 'http://106.53.136.31:19000/files/import/enterprise_user_20260820.xlsx', NULL, '1', '2026-08-20 10:12:33', '1', '2026-08-20 10:12:35', b'0', 1),
  ('客户线索导出-20260821.xlsx',     1, '客户线索', 1, 'http://106.53.136.31:19000/files/export/customer_lead_20260821.xlsx',   NULL, '1', '2026-08-21 14:05:10', '1', '2026-08-21 14:05:12', b'0', 1),
  ('合同数据导入-20260822.xlsx',     0, '合同管理', 2, NULL, '第 3 行金额字段格式不正确', '1', '2026-08-22 09:30:00', '1', '2026-08-22 09:30:01', b'0', 1);
