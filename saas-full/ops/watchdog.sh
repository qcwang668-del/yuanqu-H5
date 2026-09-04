#!/usr/bin/env bash
# 常驻服务探活 + 自愈看门狗（见 CLAUDE.md §7）
# 周期探活 /healthz，连续失败到阈值就重启服务。看门狗本身建议交给 supervisor / systemd 托管。
set -uo pipefail

# 铁律（见 §7）：探活目标只认本机回环（127.0.0.1/localhost），任何时候都不许指向 cpolar
#   公网域名 / MEDIA_BASE / 外网透传入口——隧道抖动 ≠ 本机服务挂了，隔着 cpolar 探活会误重启
#   业务服务。cpolar 隧道的死活由 ops/cpolar-watchdog.sh 单独负责（见 §9）。
URL="${HEALTHZ_URL:-http://127.0.0.1:8000/healthz}"
INTERVAL="${INTERVAL:-15}"     # 探测间隔（秒）
FAILS="${FAILS:-3}"            # 连续失败阈值
TIMEOUT="${TIMEOUT:-5}"        # 单次探测超时（秒）
RESTART_CMD="${RESTART_CMD:-sudo supervisorctl restart 智远力企-saas}"

# 硬保险：探活地址一旦指向 cpolar/外网透传域名，直接拒绝启动（严格执行上面的铁律）
case "$URL" in
  *cpolar*|*.cpolar.top*|*.cpolar.cn*)
    echo "拒绝启动：看门狗探活目标不得指向 cpolar/外网透传（$URL）——只准探本机回环 /healthz"
    exit 2;;
esac
# 同理，本看门狗的重启命令也不该去重启 cpolar（那是 §9 的事）
case "$RESTART_CMD" in
  *cpolar*)
    echo "拒绝启动：§7 服务看门狗不得重启 cpolar（$RESTART_CMD）——隧道归 ops/cpolar-watchdog.sh"
    exit 2;;
esac

fail=0
while true; do
  if curl -fsS --max-time "$TIMEOUT" "$URL" >/dev/null 2>&1; then
    fail=0
  else
    fail=$((fail+1))
    echo "$(date '+%F %T') 探活失败 $fail/$FAILS ($URL)"
    if [ "$fail" -ge "$FAILS" ]; then
      echo "$(date '+%F %T') 达阈值，重启服务: $RESTART_CMD"
      eval "$RESTART_CMD" || true
      fail=0
      sleep "$TIMEOUT"
    fi
  fi
  sleep "$INTERVAL"
done
