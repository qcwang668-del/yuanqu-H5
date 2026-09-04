// 从 yudao-module-ai 的 DO 类反推生成 MySQL 建表 DDL
// 用法: node gen_ai_ddl.js  → 生成 ai-tables.sql
const fs = require("fs");
const cp = require("child_process");
const AI_MODULE = "/home/fangnan/PycharmProjects/u667a-u8fdc-u529b-u4f01-saas/backend/yudao-module-ai";

// Java 类型 → MySQL 列类型
function mysqlType(javaType, colName) {
  const t = javaType.replace(/<.*>/, "");
  if (/^(Long)$/.test(t)) return "bigint";
  if (/^(Integer|int)$/.test(t)) return "int";
  if (/^(Boolean|boolean)$/.test(t)) return "bit(1)";
  if (/^(Double|Float|BigDecimal)$/.test(t)) return "decimal(24,6)";
  if (/^(LocalDateTime|Date)$/.test(t)) return "datetime";
  if (/^(LocalDate)$/.test(t)) return "date";
  // List/Map/复杂对象 → JSON 存文本
  if (/List|Map|\[\]/.test(javaType)) return "varchar(2048)";
  // String: 视字段名给长度
  if (/content|message|prompt|desc|remark|json|url|list|names|ids|params|config|text|segment|answer|question/i.test(colName)) return "text";
  return "varchar(512)";
}
// 驼峰 → 下划线
function toSnake(s){return s.replace(/([A-Z])/g,"_$1").toLowerCase().replace(/^_/,"");}

// BaseDO / TenantBaseDO 公共列
const BASE_COLS = [
  ["creator","varchar(64)","''"],
  ["create_time","datetime","CURRENT_TIMESTAMP"],
  ["updater","varchar(64)","''"],
  ["update_time","datetime","CURRENT_TIMESTAMP"],
  ["deleted","bit(1)","b'0'"],
];
const TENANT_COL = ["tenant_id","bigint","0"];

const files = cp.execSync('grep -rl "@TableName" '+AI_MODULE+'/src/main/java --include=*.java',{encoding:"utf8"}).trim().split("\n");
let out = "-- 自动从 yudao-module-ai DO 反推生成的建表 DDL\nSET NAMES utf8mb4;\n\n";
const tables = [];
for (const f of files) {
  const src = fs.readFileSync(f,"utf8");
  const tn = (src.match(/@TableName\(\s*(?:value\s*=\s*)?"([^"]+)"/)||[])[1];
  if (!tn) continue;
  const isTenant = /extends\s+TenantBaseDO/.test(src);
  const isBase = /extends\s+(TenantBaseDO|BaseDO)/.test(src);
  // 提取字段: 匹配 private <Type> <name>;  跳过 static/常量
  const fieldRe = /private\s+(?!static)([A-Za-z0-9_<>,\.\[\]\s]+?)\s+([a-zA-Z_]\w*)\s*;/g;
  let m; const cols=[]; const seen=new Set();
  // 跳过 BaseDO 已有字段
  const baseNames = new Set(["creator","createTime","updater","updateTime","deleted","tenantId"]);
  while((m=fieldRe.exec(src))){
    const jtype=m[1].trim(); const name=m[2];
    if(baseNames.has(name)) continue;
    if(seen.has(name)) continue; seen.add(name);
    const col=toSnake(name);
    cols.push([col, mysqlType(jtype,col)]);
  }
  // 组装 CREATE
  let ddl = "DROP TABLE IF EXISTS `"+tn+"`;\nCREATE TABLE `"+tn+"` (\n";
  const lines=[];
  // id 主键(芋道 BaseDO 的 id 通常在 DO 里显式声明为 Long id;若已在 cols 里则不重复)
  if(!cols.find(c=>c[0]==="id")){ lines.push("  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '主键'"); }
  for(const [c,ty] of cols){
    if(c==="id"){ lines.push("  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '主键'"); }
    else lines.push("  `"+c+"` "+ty+" DEFAULT NULL");
  }
  for(const [c,ty,def] of BASE_COLS){ if(isBase) lines.push("  `"+c+"` "+ty+" NOT NULL DEFAULT "+def); }
  if(isTenant) lines.push("  `"+TENANT_COL[0]+"` "+TENANT_COL[1]+" NOT NULL DEFAULT "+TENANT_COL[2]);
  lines.push("  PRIMARY KEY (`id`)");
  ddl += lines.join(",\n")+"\n) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='"+tn+"';\n\n";
  out += ddl;
  tables.push(tn+"("+(cols.length)+"列)");
}
fs.writeFileSync(AI_MODULE.replace("/yudao-module-ai","")+"/sql/liqi/ai-tables.sql", out);
// 只输出纯文本汇总(数字+表名,可安全存活)
fs.writeFileSync("/tmp/ai_ddl_summary.txt", "表数: "+tables.length+"\n"+tables.join("\n"));
console.log("DONE tables="+tables.length);
