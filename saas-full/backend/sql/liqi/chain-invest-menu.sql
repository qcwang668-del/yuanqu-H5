-- 产业链招商（智慧招商 2081 的子菜单）
-- 找线索筛选页 component=investment/chainInvest/index，支持字段清单.xlsx 的 241 个筛选字段（纯前端）
DELETE FROM `system_menu` WHERE `id` = 2084;
INSERT INTO `system_menu`
(`id`,`name`,`permission`,`type`,`sort`,`parent_id`,`path`,`icon`,`component`,`component_name`,`status`,`visible`,`keep_alive`,`always_show`,`creator`,`create_time`,`updater`,`update_time`,`deleted`)
VALUES
(2084,'产业链招商','',2,3,2081,'chainInvest','ep:share','investment/chainInvest/index','InvestmentChainInvest',0,b'1',b'1',b'0','admin','2026-08-26 14:00:00','admin','2026-08-26 14:00:00',b'0');
