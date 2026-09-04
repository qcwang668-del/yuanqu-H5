-- =============================================================
-- 政策找人推送体系：消息来源(source) + 企业园区归属(park_id)
-- 2026-09-02 · 去订阅；消息区分外部采集/园区发布；企业绑定按地区自动归属园区
-- 字符集 utf8mb4；导入加 --default-character-set=utf8mb4
-- 注：MySQL8 ALTER ADD COLUMN 不支持 IF NOT EXISTS，首次执行即可；重复执行报"重复列"可忽略。
-- =============================================================

-- 1) C 端消息加「来源」：external 外部采集政策 / park 园区发布政策
ALTER TABLE `liqi_user_message`
  ADD COLUMN `source` VARCHAR(16) NOT NULL DEFAULT 'external'
  COMMENT '来源：external 外部采集政策 / park 园区发布政策' AFTER `biz_type`;
-- 存量回填：园区政策对外 ID 为 "L"+库主键
UPDATE `liqi_user_message` SET `source` = 'park' WHERE `policy_id` LIKE 'L%';

-- 2) 用户企业绑定加「所属园区」（绑定时按企业地区自动匹配，运营后台可改）
ALTER TABLE `liqi_user_enterprise_bind`
  ADD COLUMN `park_id` BIGINT DEFAULT NULL COMMENT '所属园区 liqi_park.id（自动匹配，可空）' AFTER `credit_code`,
  ADD COLUMN `park_name` VARCHAR(128) DEFAULT NULL COMMENT '所属园区名称快照' AFTER `park_id`;

-- 索引：按园区查绑定企业（园区运营推送候选名单用）
ALTER TABLE `liqi_user_enterprise_bind`
  ADD INDEX `idx_park` (`park_id`);
