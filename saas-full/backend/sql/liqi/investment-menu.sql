-- 智慧招商（一级目录） + 榜单招商（子菜单）
-- 榜单招商页面 component=investment/rankingList/index，浅色卡片目录页
DELETE FROM `system_menu` WHERE `id` IN (2081, 2082);
-- 一级目录：智慧招商
INSERT INTO `system_menu`
(`id`,`name`,`permission`,`type`,`sort`,`parent_id`,`path`,`icon`,`component`,`component_name`,`status`,`visible`,`keep_alive`,`always_show`,`creator`,`create_time`,`updater`,`update_time`,`deleted`)
VALUES
(2081,'智慧招商','',1,6,0,'/investment','ep:promotion',NULL,NULL,0,b'1',b'1',b'1','admin','2026-08-26 12:00:00','admin','2026-08-26 12:00:00',b'0');
-- 子菜单：榜单招商
INSERT INTO `system_menu`
(`id`,`name`,`permission`,`type`,`sort`,`parent_id`,`path`,`icon`,`component`,`component_name`,`status`,`visible`,`keep_alive`,`always_show`,`creator`,`create_time`,`updater`,`update_time`,`deleted`)
VALUES
(2082,'榜单招商','',2,1,2081,'rankingList','ep:trophy','investment/rankingList/index','InvestmentRankingList',0,b'1',b'1',b'0','admin','2026-08-26 12:00:00','admin','2026-08-26 12:00:00',b'0');
