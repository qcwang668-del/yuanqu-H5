-- 力企云 SaaS 复刻 · 模块②~⑨ 菜单（模块①用户管理已单独插入 id=2027~2030）
-- 父目录：平台管理(已存在 id=2027)、系统管理(芋道自带 id=1)；新建：企业管理、我的导入导出

-- 企业管理目录
INSERT INTO system_menu (name,permission,type,sort,parent_id,path,icon,component,component_name,status,visible,keep_alive,always_show,creator,create_time,updater,update_time,deleted)
VALUES ('企业管理','',1,60,0,'/enterpriseManage','ep:office-building','',NULL,0,b'1',b'1',b'1','admin',NOW(),'admin',NOW(),b'0');
SET @ent=LAST_INSERT_ID();

-- 我的导入导出（顶层目录 + 子菜单）
INSERT INTO system_menu (name,permission,type,sort,parent_id,path,icon,component,component_name,status,visible,keep_alive,always_show,creator,create_time,updater,update_time,deleted)
VALUES ('我的导入导出','',1,70,0,'/importExportRoot','ep:upload','',NULL,0,b'1',b'1',b'0','admin',NOW(),'admin',NOW(),b'0');
SET @ieRoot=LAST_INSERT_ID();

-- ② 平台管理-预留信息管理
INSERT INTO system_menu (name,permission,type,sort,parent_id,path,icon,component,component_name,status,visible,keep_alive,always_show,creator,create_time,updater,update_time,deleted)
VALUES ('预留信息管理','',2,2,2027,'reserveInfo','ep:document','platformManage/reserveInfo/index','PlatformReserveInfo',0,b'1',b'1',b'0','admin',NOW(),'admin',NOW(),b'0');
SET @m2=LAST_INSERT_ID();
INSERT INTO system_menu (name,permission,type,sort,parent_id,path,component,component_name,status,visible,keep_alive,always_show,creator,create_time,updater,update_time,deleted)
VALUES ('预留信息查询','liqi:reserve-info:query',3,1,@m2,'','',NULL,0,b'1',b'0',b'0','admin',NOW(),'admin',NOW(),b'0');

-- ③ 平台管理-匹配线索管理
INSERT INTO system_menu (name,permission,type,sort,parent_id,path,icon,component,component_name,status,visible,keep_alive,always_show,creator,create_time,updater,update_time,deleted)
VALUES ('匹配线索管理','',2,3,2027,'matchClues','ep:connection','platformManage/matchClues/index','PlatformMatchClues',0,b'1',b'1',b'0','admin',NOW(),'admin',NOW(),b'0');
SET @m3=LAST_INSERT_ID();
INSERT INTO system_menu (name,permission,type,sort,parent_id,path,component,component_name,status,visible,keep_alive,always_show,creator,create_time,updater,update_time,deleted)
VALUES ('匹配线索查询','liqi:match-clue:query',3,1,@m3,'','',NULL,0,b'1',b'0',b'0','admin',NOW(),'admin',NOW(),b'0');

-- ④ 平台管理-评分线索管理
INSERT INTO system_menu (name,permission,type,sort,parent_id,path,icon,component,component_name,status,visible,keep_alive,always_show,creator,create_time,updater,update_time,deleted)
VALUES ('评分线索管理','',2,4,2027,'scoringClues','ep:star','platformManage/scoringClues/index','PlatformScoringClues',0,b'1',b'1',b'0','admin',NOW(),'admin',NOW(),b'0');
SET @m4=LAST_INSERT_ID();
INSERT INTO system_menu (name,permission,type,sort,parent_id,path,component,component_name,status,visible,keep_alive,always_show,creator,create_time,updater,update_time,deleted)
VALUES ('评分线索查询','liqi:scoring-clue:query',3,1,@m4,'','',NULL,0,b'1',b'0',b'0','admin',NOW(),'admin',NOW(),b'0');

-- ⑤ 企业管理-会员管理系统
INSERT INTO system_menu (name,permission,type,sort,parent_id,path,icon,component,component_name,status,visible,keep_alive,always_show,creator,create_time,updater,update_time,deleted)
VALUES ('会员管理系统','',2,1,@ent,'memberMgSys','ep:user-filled','enterpriseManage/memberMgSys/index','EnterpriseMemberMgSys',0,b'1',b'1',b'0','admin',NOW(),'admin',NOW(),b'0');
SET @m5=LAST_INSERT_ID();
INSERT INTO system_menu (name,permission,type,sort,parent_id,path,component,component_name,status,visible,keep_alive,always_show,creator,create_time,updater,update_time,deleted)
VALUES ('会员查询','liqi:member:query',3,1,@m5,'','',NULL,0,b'1',b'0',b'0','admin',NOW(),'admin',NOW(),b'0');

-- ⑥ 企业管理-会员线索管理
INSERT INTO system_menu (name,permission,type,sort,parent_id,path,icon,component,component_name,status,visible,keep_alive,always_show,creator,create_time,updater,update_time,deleted)
VALUES ('会员线索管理','',2,2,@ent,'memberCluesMg','ep:data-line','enterpriseManage/memberCluesMg/index','EnterpriseMemberCluesMg',0,b'1',b'1',b'0','admin',NOW(),'admin',NOW(),b'0');
SET @m6=LAST_INSERT_ID();
INSERT INTO system_menu (name,permission,type,sort,parent_id,path,component,component_name,status,visible,keep_alive,always_show,creator,create_time,updater,update_time,deleted)
VALUES ('会员线索查询','liqi:member-clue:query',3,1,@m6,'','',NULL,0,b'1',b'0',b'0','admin',NOW(),'admin',NOW(),b'0');

-- ⑦ 企业管理-企业获批动态
INSERT INTO system_menu (name,permission,type,sort,parent_id,path,icon,component,component_name,status,visible,keep_alive,always_show,creator,create_time,updater,update_time,deleted)
VALUES ('企业获批动态','',2,3,@ent,'approvalDynamics','ep:trend-charts','enterpriseManage/approvalDynamics/index','EnterpriseApprovalDynamics',0,b'1',b'1',b'0','admin',NOW(),'admin',NOW(),b'0');
SET @m7=LAST_INSERT_ID();
INSERT INTO system_menu (name,permission,type,sort,parent_id,path,component,component_name,status,visible,keep_alive,always_show,creator,create_time,updater,update_time,deleted)
VALUES ('获批动态查询','liqi:approval-dynamic:query',3,1,@m7,'','',NULL,0,b'1',b'0',b'0','admin',NOW(),'admin',NOW(),b'0');

-- ⑧ 我的导入导出
INSERT INTO system_menu (name,permission,type,sort,parent_id,path,icon,component,component_name,status,visible,keep_alive,always_show,creator,create_time,updater,update_time,deleted)
VALUES ('导入导出记录','',2,1,@ieRoot,'index','ep:files','importExport/index','ImportExport',0,b'1',b'1',b'0','admin',NOW(),'admin',NOW(),b'0');
SET @m8=LAST_INSERT_ID();
INSERT INTO system_menu (name,permission,type,sort,parent_id,path,component,component_name,status,visible,keep_alive,always_show,creator,create_time,updater,update_time,deleted) VALUES
('记录查询','liqi:import-export:query',3,1,@m8,'','',NULL,0,b'1',b'0',b'0','admin',NOW(),'admin',NOW(),b'0'),
('记录删除','liqi:import-export:delete',3,2,@m8,'','',NULL,0,b'1',b'0',b'0','admin',NOW(),'admin',NOW(),b'0');

-- ⑨ 系统管理-网站配置（挂芋道系统管理 id=1）
INSERT INTO system_menu (name,permission,type,sort,parent_id,path,icon,component,component_name,status,visible,keep_alive,always_show,creator,create_time,updater,update_time,deleted)
VALUES ('网站配置','',2,20,1,'website','ep:setting','system/website/index','SystemWebsite',0,b'1',b'1',b'0','admin',NOW(),'admin',NOW(),b'0');
SET @m9=LAST_INSERT_ID();
INSERT INTO system_menu (name,permission,type,sort,parent_id,path,component,component_name,status,visible,keep_alive,always_show,creator,create_time,updater,update_time,deleted) VALUES
('网站配置查询','liqi:website-config:query',3,1,@m9,'','',NULL,0,b'1',b'0',b'0','admin',NOW(),'admin',NOW(),b'0'),
('网站配置保存','liqi:website-config:update',3,2,@m9,'','',NULL,0,b'1',b'0',b'0','admin',NOW(),'admin',NOW(),b'0');

SELECT COUNT(*) AS total_liqi_menus FROM system_menu WHERE permission LIKE 'liqi:%' OR name IN ('企业管理','我的导入导出');
