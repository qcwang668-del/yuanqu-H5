#!/usr/bin/env bash
# cpolar 隧道探活看门狗（见 CLAUDE.md §9）
# 免费隧道域名会漂移：cpolar.yml 里锁 region:cn + 固定 subdomain 稳定域名；
# 本看门狗周期探活稳定域名，掉线就重启 cpolar。
set -uo pipefail

MEDIA_BASE="${MEDIA_BASE:-https://<固定前缀>.cpolar.top}"
INTERVAL="${INTERVAL:-30}"
TIMEOUT="${TIMEOUT:-8}"
# ⚠️ 铁律（见 CLAUDE.md §9）：隧道只由托管层（root systemd / supervisor）一处重启，
#    【严禁】nohup / 自起 cpolar。全机各项目共用同一个 cpolar authtoken，账号有在线会话
#    数上限；自起会与托管实例抢注同名隧道 + 堆积 reparent 到 PID1 杀不掉的僵尸，超上限后
#    云端不确定地踢隧道，把别项目的隧道误踢成 404。故重启命令只允许「重启托管服务」这一种：
RESTART_CMD="${RESTART_CMD:-sudo systemctl restart cpolar}"   # 或 sudo supervisorctl restart cpolar

while true; do
  if ! curl -fsS --max-time "$TIMEOUT" "$MEDIA_BASE" >/dev/null 2>&1; then
    echo "$(date '+%F %T') cpolar 隧道不可达（$MEDIA_BASE），重启：$RESTART_CMD"
    eval "$RESTART_CMD" || true
    sleep "$TIMEOUT"
  fi
  sleep "$INTERVAL"
done
