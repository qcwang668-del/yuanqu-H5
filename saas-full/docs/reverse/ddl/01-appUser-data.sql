-- 模块① 用户管理测试数据（表已由前序建好，此处仅补数据，utf8mb4 导入）
INSERT INTO liqi_app_user (user_name,phone,source,maintain_enterprise,promote_count,first_promoter,second_promoter,register_time,last_login_time,tenant_id) VALUES
('张三','13800138001',0,'深圳市大疆无人机应用有限公司',5,'李四','王五','2026-08-01 10:00:00','2026-08-25 09:00:00',1),
('赵敏','13800138002',1,'广州某科技有限公司',2,'孙七','','2026-08-10 14:30:00','2026-08-24 18:00:00',1),
('周芷若','13800138003',0,'',0,'','','2026-08-15 09:20:00','2026-08-23 20:10:00',1);
