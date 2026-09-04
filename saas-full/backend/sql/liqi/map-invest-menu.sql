-- 地图招商（智慧招商 2081 的子菜单）
DELETE FROM `system_menu` WHERE `id` = 2083;
INSERT INTO `system_menu`
(`id`,`name`,`permission`,`type`,`sort`,`parent_id`,`path`,`icon`,`component`,`component_name`,`status`,`visible`,`keep_alive`,`always_show`,`creator`,`create_time`,`updater`,`update_time`,`deleted`)
VALUES
(2083,'地图招商','',2,2,2081,'mapInvest','ep:location','investment/mapInvest/index','InvestmentMapInvest',0,b'1',b'1',b'0','admin','2026-08-26 13:00:00','admin','2026-08-26 13:00:00',b'0');
