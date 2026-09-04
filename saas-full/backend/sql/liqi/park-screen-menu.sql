-- 园区可视化大屏 菜单（深投控·智慧园区惠企政策服务总览）
-- 顶级菜单，component=park/screen/index，全屏独立大屏页
-- 复刻底座为芋道多租户；system_menu 为全局表，本地由 super_admin(admin) 可见；
-- 若为特定租户(如目标系统 tenant 101)开放，需把 menu_id 2080 追加进该租户套餐 system_tenant_package.menu_ids 或对应角色 system_role_menu。
DELETE FROM `system_menu` WHERE `id` = 2080;
INSERT INTO `system_menu`
(`id`,`name`,`permission`,`type`,`sort`,`parent_id`,`path`,`icon`,`component`,`component_name`,`status`,`visible`,`keep_alive`,`always_show`,`creator`,`create_time`,`updater`,`update_time`,`deleted`)
VALUES
(2080,'园区可视化大屏','',2,5,0,'/park-screen','ep:data-analysis','park/screen/index','ParkScreen',0,b'1',b'0',b'1','admin','2026-08-26 10:00:00','admin','2026-08-26 10:00:00',b'0');
