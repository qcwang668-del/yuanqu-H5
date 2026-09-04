-- =====================================================================
-- H5「政策申报」改道写入「预留信息」+ 下线「申报线索」模块
-- 1) liqi_reserve_info 增加 user_id（H5 会员用户ID，支撑"我的申报"按用户隔离；游客为 0/NULL）
-- 2) 逻辑删除后台菜单「申报线索」(system_menu id=2092)
-- 说明：liqi_policy_apply 表改道后不再被代码引用，暂保留不 DROP（历史数据留档）。
-- =====================================================================

-- 1. 预留信息表增加 user_id（已存在旧表则补列；新环境请在建表语句中一并包含）
SET @col := (SELECT COUNT(*) FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'liqi_reserve_info' AND COLUMN_NAME = 'user_id');
SET @ddl := IF(@col = 0,
  'ALTER TABLE `liqi_reserve_info` ADD COLUMN `user_id` bigint DEFAULT NULL COMMENT ''H5会员用户ID（申报留资；0/NULL=游客）'' AFTER `reserve_phone`',
  'SELECT ''user_id 已存在，跳过'' AS msg');
PREPARE s FROM @ddl; EXECUTE s; DEALLOCATE PREPARE s;

SET @idx := (SELECT COUNT(*) FROM information_schema.STATISTICS
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'liqi_reserve_info' AND INDEX_NAME = 'idx_user');
SET @ddl2 := IF(@idx = 0,
  'ALTER TABLE `liqi_reserve_info` ADD INDEX `idx_user` (`user_id`)',
  'SELECT ''idx_user 已存在，跳过'' AS msg');
PREPARE s2 FROM @ddl2; EXECUTE s2; DEALLOCATE PREPARE s2;

-- 2. 下线「申报线索」菜单（逻辑删除，父菜单 2090 惠企运营保留）
UPDATE `system_menu` SET `deleted` = b'1' WHERE `id` = 2092 AND `name` = '申报线索';

-- 校验
SELECT id, name, deleted FROM system_menu WHERE id IN (2092, 2057);
SHOW COLUMNS FROM liqi_reserve_info LIKE 'user_id';
