#!/bin/bash
# 力企云 · 深圳湾导入企业 DaaS 工商信息全量回填(宿主机 root 后台跑)
# 策略:只处理 creator='excel-import-xlw' AND enrich_status=0 的企业;
#       每 500 家一批:调 DaaS 生成 UPDATE SQL -> 落库;断点可续(重跑自动跳过已回填)。
set -u
PROJ=/home/fangnan/PycharmProjects/u667a-u8fdc-u529b-u4f01-saas
WORK=/tmp/xlw_backfill_all
mkdir -p "$WORK"
MYSQL="docker exec -i liqi-mysql mysql -uroot -pliqisaas123 --default-character-set=utf8mb4 ruoyi-vue-pro"

echo "[$(date '+%F %T')] === 全量回填开始 ==="

# 1. 导出待回填名单(名称<TAB>信用代码)
$MYSQL -N -B -e "SELECT enterprise_name, credit_code FROM liqi_enterprise
  WHERE creator='excel-import-xlw' AND enrich_status=0 AND deleted=0;" > "$WORK/todo.txt" 2>/dev/null
TOTAL=$(grep -c . "$WORK/todo.txt" || echo 0)
echo "[$(date '+%F %T')] 待回填: $TOTAL 家"
if [ "$TOTAL" -eq 0 ]; then
  echo "[$(date '+%F %T')] 无待回填企业,结束。"
  echo "DONE" > "$WORK/STATUS"
  exit 0
fi

# 2. 切分 500/批
rm -f "$WORK"/chunk_* "$WORK"/out_*.sql
split -l 500 -d "$WORK/todo.txt" "$WORK/chunk_"

# 3. 逐批回填 + 落库
i=0
for f in "$WORK"/chunk_*; do
  i=$((i+1))
  base=$(basename "$f")
  echo "[$(date '+%F %T')] 批次 $i 开始 ($base, $(grep -c . "$f") 家)"
  python3 "$PROJ/scripts/daas_backfill.py" "$f" "$WORK/out_${base}.sql" >> "$WORK/daas.log" 2>&1
  $MYSQL < "$WORK/out_${base}.sql" 2>/dev/null
  REMAIN=$($MYSQL -N -B -e "SELECT COUNT(*) FROM liqi_enterprise WHERE creator='excel-import-xlw' AND enrich_status=0 AND deleted=0;" 2>/dev/null)
  echo "[$(date '+%F %T')] 批次 $i 落库完成,剩余未回填: $REMAIN"
done

echo "[$(date '+%F %T')] === 全部批次完成 ==="
$MYSQL -e "SELECT enrich_status AS 回填状态, COUNT(*) AS 数量 FROM liqi_enterprise
  WHERE creator='excel-import-xlw' AND deleted=0 GROUP BY enrich_status;" 2>/dev/null
echo "DONE" > "$WORK/STATUS"
echo "[$(date '+%F %T')] 已写 DONE 标记"
