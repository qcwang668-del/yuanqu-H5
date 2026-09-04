-- 修复「智能体广场」菜单 name 双重 UTF-8 编码乱码
-- 根因：菜单导入时连接未带 utf8mb4，中文被双重编码（UTF-8 字节被当 CP1252/Latin1 再编码一次）
-- 本脚本用 UNHEX 写入正确 UTF-8 字节，纯 ASCII，规避传输层编码问题
-- 正确中文 UTF-8 字节：
--   智能体广场 = E699BA E883BD E4BD93 E5B9BF E59CBA
--   智能体测试 = E699BA E883BD E4BD93 E6B58B E8AF95

-- 1) 备份
DROP TABLE IF EXISTS system_menu_bak_agentsquare_20260831;
CREATE TABLE system_menu_bak_agentsquare_20260831 AS
SELECT * FROM system_menu WHERE id IN (2100, 2101, 2102);

-- 2) 修复 name（2100/2101 = 智能体广场；2102 按钮 = 智能体测试）
UPDATE system_menu
SET name = CONVERT(UNHEX('E699BAE883BDE4BD93E5B9BFE59CBA') USING utf8mb4)
WHERE id IN (2100, 2101);

UPDATE system_menu
SET name = CONVERT(UNHEX('E699BAE883BDE4BD93E6B58BE8AF95') USING utf8mb4)
WHERE id = 2102;

-- 3) 复查
SELECT id, HEX(name) AS name_hex, name, path, component, component_name, permission
FROM system_menu WHERE id IN (2100, 2101, 2102);
