-- ============================================================================
-- 力企云 · 补全缺失的菜单种子（平台管理 / 企业管理 / 客户池管理·外呼工作台）
-- ----------------------------------------------------------------------------
-- 背景：这些菜单对应的前端 .vue 页面与后端接口都已在仓库中，但菜单 INSERT 语句
--       此前只在部署库里手工/界面创建过，未沉淀到 git，导致「按仓库 SQL 全新建库」
--       时下列菜单不会生成，页面入口缺失（典型：/customer-pool 外呼工作台 404/无入口）。
-- 本脚本幂等：先 DELETE 再 INSERT，可重复执行。
-- 菜单 ID 与部署库（ruoyi-vue-pro @ liqi-mysql:3316）权威数据保持一致。
-- 注意：超管 admin 默认可见全部菜单；若需对「非超管角色」可见，请在
--       系统管理 → 角色管理 中为对应角色勾选这些菜单（写 system_role_menu）。
-- ----------------------------------------------------------------------------
-- 列顺序：id,name,permission,type,sort,parent_id,path,icon,component,component_name,
--         status,visible,keep_alive,always_show,creator,create_time,updater,update_time,deleted
-- type: 1=目录 2=菜单 3=按钮； visible/keep_alive/always_show: b'1'=是 b'0'=否
-- ============================================================================

DELETE FROM `system_menu` WHERE `id` IN (2051, 2052, 2054, 2057, 2059, 2061, 2063, 2065, 2067, 2085);

-- ---------- 一级目录：平台管理 ----------
INSERT INTO `system_menu`
(`id`,`name`,`permission`,`type`,`sort`,`parent_id`,`path`,`icon`,`component`,`component_name`,`status`,`visible`,`keep_alive`,`always_show`,`creator`,`create_time`,`updater`,`update_time`,`deleted`)
VALUES
(2051,'平台管理','',1,40,0,'/platformManage','ep:grid',NULL,NULL,0,b'1',b'1',b'1','admin','2026-08-26 04:58:38','admin','2026-08-26 06:45:33',b'0');

-- ---------- 一级目录：企业管理 ----------
INSERT INTO `system_menu`
(`id`,`name`,`permission`,`type`,`sort`,`parent_id`,`path`,`icon`,`component`,`component_name`,`status`,`visible`,`keep_alive`,`always_show`,`creator`,`create_time`,`updater`,`update_time`,`deleted`)
VALUES
(2052,'企业管理','',1,50,0,'/enterpriseManage','ep:office-building',NULL,NULL,0,b'1',b'1',b'1','admin','2026-08-26 04:58:38','admin','2026-08-26 06:45:33',b'0');

-- ---------- 平台管理（2051）子菜单 ----------
INSERT INTO `system_menu`
(`id`,`name`,`permission`,`type`,`sort`,`parent_id`,`path`,`icon`,`component`,`component_name`,`status`,`visible`,`keep_alive`,`always_show`,`creator`,`create_time`,`updater`,`update_time`,`deleted`)
VALUES
(2054,'用户管理','',2,1,2051,'clientUser','ep:user','platformManage/clientUser/index','PlatformClientUser',0,b'1',b'0',b'0','admin','2026-08-26 04:58:38','admin','2026-08-26 04:58:38',b'0'),
(2057,'预留信息管理','',2,2,2051,'reserveInfo','ep:document','platformManage/reserveInfo/index','PlatformReserveInfo',0,b'1',b'0',b'0','admin','2026-08-26 04:58:38','admin','2026-08-26 04:58:38',b'0'),
(2059,'匹配线索管理','',2,3,2051,'matchClues','ep:connection','platformManage/matchClues/index','PlatformMatchClues',0,b'1',b'0',b'0','admin','2026-08-26 04:58:38','admin','2026-08-26 04:58:38',b'0'),
(2061,'评分线索管理','',2,4,2051,'scoringClues','ep:star','platformManage/scoringClues/index','PlatformScoringClues',0,b'1',b'0',b'0','admin','2026-08-26 04:58:38','admin','2026-08-26 04:58:38',b'0');

-- ---------- 企业管理（2052）子菜单 ----------
INSERT INTO `system_menu`
(`id`,`name`,`permission`,`type`,`sort`,`parent_id`,`path`,`icon`,`component`,`component_name`,`status`,`visible`,`keep_alive`,`always_show`,`creator`,`create_time`,`updater`,`update_time`,`deleted`)
VALUES
(2063,'园区客户管理','',2,1,2052,'memberMgSys','ep:user-filled','enterpriseManage/memberMgSys/index','EnterpriseMemberMgSys',0,b'1',b'0',b'0','admin','2026-08-26 04:58:38','admin','2026-08-26 11:50:51',b'0'),
(2065,'会员线索管理','',2,2,2052,'memberCluesMg','ep:data-line','enterpriseManage/memberCluesMg/index','EnterpriseMemberCluesMg',0,b'1',b'0',b'0','admin','2026-08-26 04:58:38','admin','2026-08-26 04:58:38',b'0'),
(2067,'企业获批动态','',2,3,2052,'approvalDynamics','ep:trend-charts','enterpriseManage/approvalDynamics/index','EnterpriseApprovalDynamics',0,b'1',b'0',b'0','admin','2026-08-26 04:58:38','admin','2026-08-26 04:58:38',b'0');

-- ---------- 一级菜单：客户池管理（外呼工作台 /customer-pool → investment/callWorkbench）----------
INSERT INTO `system_menu`
(`id`,`name`,`permission`,`type`,`sort`,`parent_id`,`path`,`icon`,`component`,`component_name`,`status`,`visible`,`keep_alive`,`always_show`,`creator`,`create_time`,`updater`,`update_time`,`deleted`)
VALUES
(2085,'客户池管理','',2,7,0,'/customer-pool','ep:headset','investment/callWorkbench/index','InvestmentCallWorkbench',0,b'1',b'0',b'1','admin','2026-08-26 10:51:59','admin','2026-08-26 10:51:59',b'0');

-- 校验：执行后应能查到 10 行
-- SELECT id, name, path, component FROM system_menu
-- WHERE id IN (2051,2052,2054,2057,2059,2061,2063,2065,2067,2085) ORDER BY id;
