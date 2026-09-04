#!/usr/bin/env bash
# 智远力企-saas · 把本地文件上传到本项目 MinIO(独立桶 liqi-attachments)，返回 Nginx 网关直链
# （与启程智远共用同一台卫星服务器 120.79.142.141，但用本项目独立桶隔离文件）
#
# 用法：
#   scripts/publish_minio.sh <本地文件> <目标key> [content-type]
# 例：
#   scripts/publish_minio.sh /tmp/report.html reports/e2e-report.html
#   scripts/publish_minio.sh out.pdf docs/plan.pdf application/pdf
#
# 产出：成功后在最后一行打印可访问直链
#   http://120.79.142.141:8000/liqi-attachments/<目标key>
#
# ⚠️ 出口走「力企云自有 8000 链路」(liqi-nginx:5180 反代 /liqi-attachments/ → MinIO，
#    经 socat 0.0.0.0:8000 对外)，**不要**用无端口的 :80——:80 是启程 qczy-nginx
#    共享网关，曾因缺 qczy-api-nginx 上游整容器崩溃、80 端口失联，连坐本项目报告链接。
#
# 为什么要经服务器：本地无 aws/mc/python3，MinIO :9000 仅服务器内网可用；
# 故走 SSH 到 PoC 服务器，再用 qczy-minio 容器内的 mc 把对象写进桶。
# ⚠️ HTML 必须带 Content-Type: text/html 才能在浏览器内联渲染(网关有 nosniff)，
#    本脚本按扩展名自动判定，也可用第 3 参数强制指定。
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
ENV_FILE="$ROOT/deploy/secrets/poc-server.env"
[ -f "$ENV_FILE" ] || { echo "缺少 $ENV_FILE(从 .example 复制并填值)" >&2; exit 1; }
# shellcheck disable=SC1090
set -a; . "$ENV_FILE"; set +a

SRC="${1:?用法: publish_minio.sh <本地文件> <目标key> [content-type]}"
KEY="${2:?缺少目标 key，如 prd/report.html}"
CT="${3:-}"
[ -f "$SRC" ] || { echo "本地文件不存在: $SRC" >&2; exit 1; }
KEY="${KEY#/}"                                   # 去掉可能的前导斜杠
BUCKET="${MINIO_DEFAULT_BUCKET:-liqi-attachments}"
CONTAINER="${MINIO_CONTAINER:-qczy-minio}"
# 对外回链固定走「力企云自有 8000 链路」(liqi-nginx 反代)，不用启程 :80 共享网关。
# 不读 GATEWAY_URL，避免 env 里残留的 :80 旧值把链接带向会连坐的共享网关。
GATEWAY="http://120.79.142.141:8000"

# 按扩展名兜底判定 Content-Type
if [ -z "$CT" ]; then
  case "${KEY##*.}" in
    html|htm) CT="text/html" ;;
    css)      CT="text/css" ;;
    js)       CT="application/javascript" ;;
    json)     CT="application/json" ;;
    pdf)      CT="application/pdf" ;;
    png)      CT="image/png" ;;
    jpg|jpeg) CT="image/jpeg" ;;
    svg)      CT="image/svg+xml" ;;
    *)        CT="application/octet-stream" ;;
  esac
fi

# SSH 通道(密钥优先，回退密码)——PoC 服务器 22 口偶发不可达，最多重试 5 次
KEYFILE="$ROOT/${POC_SSH_KEY#*/}"; [ -f "${POC_SSH_KEY:-}" ] && KEYFILE="$POC_SSH_KEY"
# KexAlgorithms 固定 group14：阿里云路径偶发丢弃 curve25519 的 KEX 大包导致握手 hang（停在 SSH2_MSG_KEX_ECDH_REPLY），改用 group14 稳定放行
SSH_COMMON=(-o StrictHostKeyChecking=no -o ConnectTimeout=15 -o ServerAliveInterval=5 -o KexAlgorithms=diffie-hellman-group14-sha256 -p "${POC_SSH_PORT:-22}")
if [ -f "$KEYFILE" ]; then
  ssh_run(){ timeout 40 ssh -i "$KEYFILE" -o IdentitiesOnly=yes "${SSH_COMMON[@]}" "$POC_SSH_USER@$POC_HOST" "$@"; }
elif command -v sshpass >/dev/null && [ -n "${POC_SSH_PASSWORD:-}" ]; then
  ssh_run(){ timeout 40 sshpass -p "$POC_SSH_PASSWORD" ssh -o PreferredAuthentications=password -o PubkeyAuthentication=no "${SSH_COMMON[@]}" "$POC_SSH_USER@$POC_HOST" "$@"; }
else
  echo "既无可用私钥也无密码/sshpass" >&2; exit 1
fi

# 远程侧：把 base64 内容写入容器临时文件 → mc cp 进桶(带 Content-Type) → 清理
B64="$(base64 -w0 "$SRC")"
TMP="/tmp/pub_$$.${KEY##*.}"
REMOTE_CMD='set -e; f="'"$TMP"'"; b="'"$BUCKET"'"; k="'"$KEY"'"; c="'"$CONTAINER"'"; ct="'"$CT"'";
  base64 -d > "$f";
  docker cp "$f" "$c":"$f" >/dev/null;
  docker exec "$c" mc cp --attr "Content-Type=$ct" "$f" "local/$b/$k" >/dev/null;
  docker exec "$c" rm -f "$f" >/dev/null 2>&1 || true;
  rm -f "$f";
  echo REMOTE_OK'

ok=0
for i in 1 2 3 4 5; do
  echo "[publish] 上传中(第 $i 次)…" >&2
  if printf '%s' "$B64" | ssh_run "$REMOTE_CMD" 2>/dev/null | grep -q REMOTE_OK; then ok=1; break; fi
  echo "[publish] 第 $i 次失败(SSH:22 偶发不可达)，重试…" >&2
done
[ "$ok" = 1 ] || { echo "上传失败：PoC 服务器 SSH 通道不可达，请稍后重试或换通道(参考 CLAUDE.md/记忆)。" >&2; exit 1; }

echo "$GATEWAY/$BUCKET/$KEY"
