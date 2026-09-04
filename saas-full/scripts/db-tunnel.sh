#!/usr/bin/env bash
# 本地开发连远程 MySQL 的 SSH 隧道（见 CLAUDE.md §10）
# 把远程库 NAT 到本机端口，代码连 127.0.0.1:$LOCAL_PORT
set -euo pipefail

LOCAL_PORT="${LOCAL_PORT:-19193}"      # 本机监听端口（对应 .env 的 DB_HOST_LOCAL）
DB_HOST="${DB_HOST:-106.53.136.31}"    # 远程库所在主机
SSH_USER="${SSH_USER:-root}"
REMOTE_DB_PORT="${REMOTE_DB_PORT:-3306}"

# 已有隧道则不重复建
if lsof -ti tcp:"$LOCAL_PORT" >/dev/null 2>&1; then
  echo "隧道端口 $LOCAL_PORT 已在监听，跳过"
  exit 0
fi

echo "建立 SSH 隧道: 127.0.0.1:$LOCAL_PORT -> $DB_HOST:$REMOTE_DB_PORT"
ssh -N -f -L "${LOCAL_PORT}:127.0.0.1:${REMOTE_DB_PORT}" "${SSH_USER}@${DB_HOST}"
echo "✅ 完成。代码连 127.0.0.1:${LOCAL_PORT} 即可访问远程库"
