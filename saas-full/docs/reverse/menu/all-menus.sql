-- 力企云 SaaS 复刻 · 全部菜单（模块①~⑨）。用 utf8mb4 client 导入。
-- 执行前先 DELETE FROM system_menu WHERE id>=2027; 清掉旧的乱码菜单。
-- 父目录用变量关联，不依赖固定 id。系统管理用芋道自带 id=1。

-- ===== 顶层目录 =====
INSERT INTO system_menu (name,permission,type,sort,parent_id,path,icon,component,component_name,status,visible,keep_alive,always_show,creator,create_time,updater,update_time,deleted)
VALUES ('平台管理','',1,50,0,'/platformManage','ep:grid','',NULL,0,b'1',b'1',b'1','admin',NOW(),'admin',NOW(),b'0');
SET @plat=LAST_INSERT_ID();
INSERT INTO system_menu (name,permission,type,sort,parent_id,path,icon,component,component_name,status,visible,keep_alive,always_show,creator,create_time,updater,update_time,deleted)
VALUES ('企业管理','',1,60,0,'/enterpriseManage','ep:office-building','',NULL,0,b'1',b'1',b'1','admin',NOW(),'admin',NOW(),b'0');
SET @ent=LAST_INSERT_ID();
INSERT INTO system_menu (name,permission,type,sort,parent_id,path,icon,component,component_name,status,visible,keep_alive,always_show,creator,create_time,updater,update_time,deleted)
VALUES ('我的导入导出','',1,70,0,'/importExportRoot','ep:upload','',NULL,0,b'1',b'1',b'0','admin',NOW(),'admin',NOW(),b'0');
SET @ie=LAST_INSERT_ID();

-- ===== ① 平台管理-用户管理 =====
INSERT INTO system_menu (name,permission,type,sort,parent_id,path,icon,component,component_name,status,visible,keep_alive,always_show,creator,create_time,updater,update_time,deleted)
VALUES ('用户管理','',2,1,@plat,'clientUser','ep:user','platformManage/clientUser/index','PlatformClientUser',0,b'1',b'1',b'0','admin',NOW(),'admin',NOW(),b'0');
SET @m1=LAST_INSERT_ID();
INSERT INTO system_menu (name,permission,type,sort,parent_id,path,component,status,visible,keep_alive,always_show,creator,create_time,updater,update_time,deleted) VALUES
('用户查询','liqi:app-user:query',3,1,@m1,'','',0,b'1',b'0',b'0','admin',NOW(),'admin',NOW(),b'0'),
('用户导出','liqi:app-user:export',3,2,@m1,'','',0,b'1',b'0',b'0','admin',NOW(),'admin',NOW(),b'0');

-- ===== ② 平台管理-预留信息管理 =====
INSERT INTO system_menu (name,permission,type,sort,parent_id,path,icon,component,component_name,status,visible,keep_alive,always_show,creator,create_time,updater,update_time,deleted)
VALUES ('预留信息管理','',2,2,@plat,'reserveInfo','ep:document','platformManage/reserveInfo/index','PlatformReserveInfo',0,b'1',b'1',b'0','admin',NOW(),'admin',NOW(),b'0');
SET @m2=LAST_INSERT_ID();
INSERT INTO system_menu (name,permission,type,sort,parent_id,path,component,status,visible,keep_alive,always_show,creator,create_time,updater,update_time,deleted)
VALUES ('预留信息查询','liqi:reserve-info:query',3,1,@m2,'','',0,b'1',b'0',b'0','admin',NOW(),'admin',NOW(),b'0');

-- ===== ③ 平台管理-匹配线索管理 =====
INSERT INTO system_menu (name,permission,type,sort,parent_id,path,icon,component,component_name,status,visible,keep_alive,always_show,creator,create_time,updater,update_time,deleted)
VALUES ('匹配线索管理','',2,3,@plat,'matchClues','ep:connection','platformManage/matchClues/index','PlatformMatchClues',0,b'1',b'1',b'0','admin',NOW(),'admin',NOW(),b'0');
SET @m3=LAST_INSERT_ID();
INSERT INTO system_menu (name,permission,type,sort,parent_id,path,component,status,visible,keep_alive,always_show,creator,create_time,updater,update_time,deleted)
VALUES ('匹配线索查询','liqi:match-clue:query',3,1,@m3,'','',0,b'1',b'0',b'0','admin',NOW(),'admin',NOW(),b'0');

-- ===== ④ 平台管理-评分线索管理 =====
INSERT INTO system_menu (name,permission,type,sort,parent_id,path,icon,component,component_name,status,visible,keep_alive,always_show,creator,create_time,updater,update_time,deleted)
VALUES ('评分线索管理','',2,4,@plat,'scoringClues','ep:star','platformManage/scoringClues/index','PlatformScoringClues',0,b'1',b'1',b'0','admin',NOW(),'admin',NOW(),b'0');
SET @m4=LAST_INSERT_ID();
INSERT INTO system_menu (name,permission,type,sort,parent_id,path,component,status,visible,keep_alive,always_show,creator,create_time,updater,update_time,deleted)
VALUES ('评分线索查询','liqi:scoring-clue:query',3,1,@m4,'','',0,b'1',b'0',b'0','admin',NOW(),'admin',NOW(),b'0');

-- ===== ⑤ 企业管理-会员管理系统 =====
INSERT INTO system_menu (name,permission,type,sort,parent_id,path,icon,component,component_name,status,visible,keep_alive,always_show,creator,create_time,updater,update_time,deleted)
VALUES ('会员管理系统','',2,1,@ent,'memberMgSys','ep:user-filled','enterpriseManage/memberMgSys/index','EnterpriseMemberMgSys',0,b'1',b'1',b'0','admin',NOW(),'admin',NOW(),b'0');
SET @m5=LAST_INSERT_ID();
INSERT INTO system_menu (name,permission,type,sort,parent_id,path,component,status,visible,keep_alive,always_show,creator,create_time,updater,update_time,deleted)
VALUES ('会员查询','liqi:member:query',3,1,@m5,'','',0,b'1',b'0',b'0','admin',NOW(),'admin',NOW(),b'0');

-- ===== ⑥ 企业管理-会员线索管理 =====
INSERT INTO system_menu (name,permission,type,sort,parent_id,path,icon,component,component_name,status,visible,keep_alive,always_show,creator,create_time,updater,update_time,deleted)
VALUES ('会员线索管理','',2,2,@ent,'memberCluesMg','ep:data-line','enterpriseManage/memberCluesMg/index','EnterpriseMemberCluesMg',0,b'1',b'1',b'0','admin',NOW(),'admin',NOW(),b'0');
SET @m6=LAST_INSERT_ID();
INSERT INTO system_menu (name,permission,type,sort,parent_id,path,component,status,visible,keep_alive,always_show,creator,create_time,updater,update_time,deleted)
VALUES ('会员线索查询','liqi:member-clue:query',3,1,@m6,'','',0,b'1',b'0',b'0','admin',NOW(),'admin',NOW(),b'0');

-- ===== ⑦ 企业管理-企业获批动态 =====
INSERT INTO system_menu (name,permission,type,sort,parent_id,path,icon,component,component_name,status,visible,keep_alive,always_show,creator,create_time,updater,update_time,deleted)
VALUES ('企业获批动态','',2,3,@ent,'approvalDynamics','ep:trend-charts','enterpriseManage/approvalDynamics/index','EnterpriseApprovalDynamics',0,b'1',b'1',b'0','admin',NOW(),'admin',NOW(),b'0');
SET @m7=LAST_INSERT_ID();
INSERT INTO system_menu (name,permission,type,sort,parent_id,path,component,status,visible,keep_alive,always_show,creator,create_time,updater,update_time,deleted)
VALUES ('获批动态查询','liqi:approval-dynamic:query',3,1,@m7,'','',0,b'1',b'0',b'0','admin',NOW(),'admin',NOW(),b'0');

-- ===== ⑧ 我的导入导出 =====
INSERT INTO system_menu (name,permission,type,sort,parent_id,path,icon,component,component_name,status,visible,keep_alive,always_show,creator,create_time,updater,update_time,deleted)
VALUES ('导入导出记录','',2,1,@ie,'index','ep:files','importExport/index','ImportExport',0,b'1',b'1',b'0','admin',NOW(),'admin',NOW(),b'0');
SET @m8=LAST_INSERT_ID();
INSERT INTO system_menu (name,permission,type,sort,parent_id,path,component,status,visible,keep_alive,always_show,creator,create_time,updater,update_time,deleted) VALUES
('记录查询','liqi:import-export:query',3,1,@m8,'','',0,b'1',b'0',b'0','admin',NOW(),'admin',NOW(),b'0'),
('记录删除','liqi:import-export:delete',3,2,@m8,'','',0,b'1',b'0',b'0','admin',NOW(),'admin',NOW(),b'0');

-- ===== ⑨ 系统管理-网站配置（挂芋道系统管理 id=1）=====
INSERT INTO system_menu (name,permission,type,sort,parent_id,path,icon,component,component_name,status,visible,keep_alive,always_show,creator,create_time,updater,update_time,deleted)
VALUES ('网站配置','',2,20,1,'website','ep:setting','system/website/index','SystemWebsite',0,b'1',b'1',b'0','admin',NOW(),'admin',NOW(),b'0');
SET @m9=LAST_INSERT_ID();
INSERT INTO system_menu (name,permission,type,sort,parent_id,path,component,status,visible,keep_alive,always_show,creator,create_time,updater,update_time,deleted) VALUES
('网站配置查询','liqi:website-config:query',3,1,@m9,'','',0,b'1',b'0',b'0','admin',NOW(),'admin',NOW(),b'0'),
('网站配置保存','liqi:website-config:update',3,2,@m9,'','',0,b'1',b'0',b'0','admin',NOW(),'admin',NOW(),b'0');
