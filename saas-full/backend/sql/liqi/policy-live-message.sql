-- =============================================================
-- 力企云 · 惠企政策 二期功能表 DDL
-- 2026-09-01 · 覆盖需求 ②园区政策发布 / ④申报线索后台 / ⑥政策找人推送 / ⑫专家直播
-- 字符集 utf8mb4；导入须加 --default-character-set=utf8mb4
--   政府政策仍由外部 PolicyProvider 提供（零落库）；本表仅落"园区/协会自主发布"的政策。
-- =============================================================
SET NAMES utf8mb4;

-- 1) 政策库（园区/协会自主发布；type=park。政府类政策仍走外部 Provider，不入库）
CREATE TABLE IF NOT EXISTS `liqi_policy` (
  `id`              BIGINT       NOT NULL AUTO_INCREMENT COMMENT '编号（对外 PolicyDTO.id = "L"+id）',
  `title`           VARCHAR(255) NOT NULL COMMENT '政策标题',
  `type`            VARCHAR(16)  NOT NULL DEFAULT 'park' COMMENT '类型：park 园区发布',
  `park_id`         BIGINT       DEFAULT NULL COMMENT '所属园区 liqi_park.id',
  `park_name`       VARCHAR(128) DEFAULT NULL COMMENT '园区/发布主体名称快照',
  `subsidy_max`     VARCHAR(32)  DEFAULT NULL COMMENT '最高补贴（万元）',
  `region`          VARCHAR(128) DEFAULT NULL COMMENT '所属地区，如 深圳市/南山区',
  `industry`        VARCHAR(128) DEFAULT NULL COMMENT '所属行业',
  `category`        VARCHAR(64)  DEFAULT NULL COMMENT '主分类标签，如 专精特新/研发投入/设备更新/高企认定/创业扶持',
  `tags`            VARCHAR(255) DEFAULT NULL COMMENT '标签（; 分隔）',
  `deadline`        DATE         DEFAULT NULL COMMENT '申报截止日期，长期有效为空',
  `publish_org`     VARCHAR(128) DEFAULT NULL COMMENT '发布部门/来源',
  `publish_date`    DATE         DEFAULT NULL COMMENT '发布日期',
  `summary`         VARCHAR(1000) DEFAULT NULL COMMENT '摘要',
  `content`         MEDIUMTEXT   DEFAULT NULL COMMENT '政策正文',
  `source_url`      VARCHAR(512) DEFAULT NULL COMMENT '外部原文链接',
  `contact_name`    VARCHAR(64)  DEFAULT NULL COMMENT '申报联系人',
  `contact_phone`   VARCHAR(32)  DEFAULT NULL COMMENT '申报咨询电话',
  `visible_scope`   VARCHAR(16)  NOT NULL DEFAULT 'all' COMMENT '可见范围：all 全部 / park 本园区 / region 本地区',
  `status`          TINYINT      NOT NULL DEFAULT 0 COMMENT '状态：0 已上架 1 已下架（草稿）',
  `creator`         VARCHAR(64)  DEFAULT '',
  `create_time`     DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updater`         VARCHAR(64)  DEFAULT '',
  `update_time`     DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted`         BIT(1)       NOT NULL DEFAULT b'0',
  `tenant_id`       BIGINT       NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`),
  KEY `idx_status_type` (`status`, `type`),
  KEY `idx_park` (`park_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='力企-政策库（园区自主发布）';

-- 2) 专家直播大讲堂
CREATE TABLE IF NOT EXISTS `liqi_live` (
  `id`            BIGINT       NOT NULL AUTO_INCREMENT COMMENT '编号',
  `title`         VARCHAR(255) NOT NULL COMMENT '直播标题',
  `lecturer`      VARCHAR(64)  DEFAULT NULL COMMENT '讲师/专家',
  `lecturer_desc` VARCHAR(255) DEFAULT NULL COMMENT '讲师简介',
  `cover_url`     VARCHAR(512) DEFAULT NULL COMMENT '封面图',
  `summary`       VARCHAR(1000) DEFAULT NULL COMMENT '直播简介',
  `live_url`      VARCHAR(512) DEFAULT NULL COMMENT '直播间地址（第三方/腾讯会议等）',
  `replay_url`    VARCHAR(512) DEFAULT NULL COMMENT '回放地址',
  `start_time`    DATETIME     DEFAULT NULL COMMENT '开播时间',
  `end_time`      DATETIME     DEFAULT NULL COMMENT '结束时间',
  `status`        TINYINT      NOT NULL DEFAULT 0 COMMENT '状态：0 预告 1 直播中 2 回放 3 已下架',
  `sort`          INT          NOT NULL DEFAULT 0 COMMENT '排序',
  `creator`       VARCHAR(64)  DEFAULT '',
  `create_time`   DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updater`       VARCHAR(64)  DEFAULT '',
  `update_time`   DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted`       BIT(1)       NOT NULL DEFAULT b'0',
  `tenant_id`     BIGINT       NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`),
  KEY `idx_status_start` (`status`, `start_time`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='力企-专家直播大讲堂';

-- 3) C 端站内消息（政策精准推送 / 临期提醒 / 系统通知）
CREATE TABLE IF NOT EXISTS `liqi_user_message` (
  `id`           BIGINT       NOT NULL AUTO_INCREMENT COMMENT '编号',
  `user_id`      BIGINT       NOT NULL COMMENT '会员用户 ID（member_user.id）',
  `type`         TINYINT      NOT NULL DEFAULT 1 COMMENT '类型：1 政策推送 2 临期提醒 3 系统通知',
  `title`        VARCHAR(255) NOT NULL COMMENT '消息标题',
  `content`      VARCHAR(1000) DEFAULT NULL COMMENT '消息内容',
  `policy_id`    VARCHAR(64)  DEFAULT NULL COMMENT '关联政策 ID（可跳转详情）',
  `policy_title` VARCHAR(255) DEFAULT NULL COMMENT '关联政策标题快照',
  `biz_type`     VARCHAR(16)  DEFAULT 'auto' COMMENT '来源：auto 系统自动 / manual 运营定向',
  `is_read`      TINYINT      NOT NULL DEFAULT 0 COMMENT '是否已读：0 未读 1 已读',
  `creator`      VARCHAR(64)  DEFAULT '',
  `create_time`  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updater`      VARCHAR(64)  DEFAULT '',
  `update_time`  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted`      BIT(1)       NOT NULL DEFAULT b'0',
  `tenant_id`    BIGINT       NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`),
  KEY `idx_user_read` (`user_id`, `is_read`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='力企-C端站内消息';

-- 4) 政策申报 扩展线索处理字段（B 端申报线索后台用）
--    MySQL8 不支持 ADD COLUMN IF NOT EXISTS，首次执行即可；重复执行报"重复列"可忽略。
ALTER TABLE `liqi_policy_apply`
  ADD COLUMN `assignee`      VARCHAR(64)  DEFAULT NULL COMMENT '跟进人/分配人' AFTER `status`,
  ADD COLUMN `follow_remark` VARCHAR(1000) DEFAULT NULL COMMENT '跟进记录' AFTER `assignee`,
  ADD COLUMN `follow_time`   DATETIME     DEFAULT NULL COMMENT '最近跟进时间' AFTER `follow_remark`;

-- 5) 示例园区发布政策（幂等：先按标题清掉旧的示例再插，便于重复导入）
DELETE FROM `liqi_policy` WHERE `title` LIKE '%【示例】%';
INSERT INTO `liqi_policy`
(`title`,`type`,`park_name`,`subsidy_max`,`region`,`industry`,`category`,`tags`,`deadline`,`publish_org`,`publish_date`,`summary`,`content`,`visible_scope`,`status`,`creator`,`create_time`,`updater`,`update_time`)
VALUES
('【示例】深圳湾生态科技园 2026 入园企业租金补贴申报','park','深圳湾生态科技园','15.00','深圳市/南山区','科技服务','创业扶持','园区发布;创业扶持;租金补贴','2026-12-31','深圳湾生态科技园','2026-09-01',
 '面向新入园的科技型中小企业，按实际租金给予最高 50% 补贴，单个企业最高 15 万元。',
 '【项目简介】面向南山区内符合条件的入园/意向企业，按实际租金给予补贴。\n一、面向对象：深圳市南山区内符合条件的入园科技型中小企业。\n二、补贴标准：按实际租金最高 50%，单企业最高 15 万元。\n三、申报材料：租赁合同、租金发票、营业执照、上年度纳税证明。\n四、申报方式：点击下方"我要申报"或拨打园区服务电话咨询。',
 'park',0,'admin',NOW(),'admin',NOW()),
('【示例】深圳湾生态科技园 研发投入后补助（园区专项）','park','深圳湾生态科技园','20.00','深圳市/南山区','软件和信息技术','研发投入','园区发布;研发补贴;研发投入','2026-10-31','深圳湾生态科技园','2026-09-01',
 '对园区内科技企业年度研发投入给予后补助，最高 20 万元。',
 '【项目简介】鼓励园区企业加大研发投入。\n一、面向对象：园区内注册、具有独立法人资格的科技企业。\n二、补助标准：按上年度研发费用增量给予一定比例后补助，最高 20 万元。\n三、申报材料：研发费用专项审计报告、纳税申报表、营业执照。',
 'park',0,'admin',NOW(),'admin',NOW());

-- 6) 示例直播
DELETE FROM `liqi_live` WHERE `title` LIKE '%【示例】%';
INSERT INTO `liqi_live`
(`title`,`lecturer`,`lecturer_desc`,`summary`,`live_url`,`replay_url`,`start_time`,`end_time`,`status`,`sort`,`creator`,`create_time`,`updater`,`update_time`)
VALUES
('【示例】惠企政策大讲堂第1期：高新企业认定全攻略','政策研究院 · 王老师','退休科技部门专家，深耕高企认定 15 年',
 '系统讲解国家高新技术企业认定条件、评分要点、材料准备与常见误区，现场答疑。',
 'https://meeting.tencent.com/dm/example-live','', '2026-09-10 19:30:00','2026-09-10 20:30:00',0,1,'admin',NOW(),'admin',NOW()),
('【示例】专精特新"小巨人"申报实操','政策研究院 · 李老师','工信部专精特新评审专家',
 '解读专精特新中小企业与"小巨人"梯度培育政策，拆解申报指标与佐证材料。',
 'https://meeting.tencent.com/dm/example-live2','https://example.com/replay/2', '2026-08-20 19:30:00','2026-08-20 20:30:00',2,2,'admin',NOW(),'admin',NOW());

-- =============================================================
-- 菜单：惠企运营（一级目录）+ 园区政策发布 / 申报线索 / 直播管理 / 推送记录
-- 顶级目录 id 2090；子菜单 2091~2094。super_admin(admin) 可见；
-- 若为租户(如 tenant 101)开放，需把 menu_id 追加进该租户套餐/角色菜单。
-- =============================================================
DELETE FROM `system_menu` WHERE `id` IN (2090,2091,2092,2093,2094);
INSERT INTO `system_menu`
(`id`,`name`,`permission`,`type`,`sort`,`parent_id`,`path`,`icon`,`component`,`component_name`,`status`,`visible`,`keep_alive`,`always_show`,`creator`,`create_time`,`updater`,`update_time`,`deleted`)
VALUES
(2090,'惠企运营','',1,7,0,'/liqi-ops','ep:guide',NULL,NULL,0,b'1',b'1',b'1','admin','2026-09-01 10:00:00','admin','2026-09-01 10:00:00',b'0'),
(2091,'园区政策发布','',2,1,2090,'policy-publish','ep:document','liqiOps/policyPublish/index','LiqiPolicyPublish',0,b'1',b'1',b'1','admin','2026-09-01 10:00:00','admin','2026-09-01 10:00:00',b'0'),
(2092,'申报线索','',2,2,2090,'policy-apply','ep:phone','liqiOps/policyApply/index','LiqiPolicyApply',0,b'1',b'1',b'1','admin','2026-09-01 10:00:00','admin','2026-09-01 10:00:00',b'0'),
(2093,'直播大讲堂','',2,3,2090,'live','ep:video-camera','liqiOps/live/index','LiqiLive',0,b'1',b'1',b'1','admin','2026-09-01 10:00:00','admin','2026-09-01 10:00:00',b'0'),
(2094,'推送记录','',2,4,2090,'push-message','ep:bell','liqiOps/pushMessage/index','LiqiPushMessage',0,b'1',b'1',b'1','admin','2026-09-01 10:00:00','admin','2026-09-01 10:00:00',b'0');

-- 核对
SELECT id,title,type,status FROM liqi_policy WHERE deleted=0;
SELECT id,title,status FROM liqi_live WHERE deleted=0;
SELECT id,name,component FROM system_menu WHERE id BETWEEN 2090 AND 2094 AND deleted=0;
