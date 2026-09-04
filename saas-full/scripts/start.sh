#!/usr/bin/env bash
# 智远力企-saas 启动脚本 —— 本地开发用
# 内置：flock 独占锁（防重复启动） + 先杀后启（清端口） + 硬闸门
# 本机常驻服务请改用 supervisor 托管（见 CLAUDE.md §6 与 ops/supervisor.conf.example）
set -euo pipefail
cd "$(dirname "$0")/.."

PORT="${PORT:-8000}"
FORCE="${1:-}"

# 1) flock 独占锁：同一时刻只允许一个启动流程
exec 9>"/tmp/智远力企-saas.start.lock"
flock -n 9 || { echo "❌ 已有启动流程在跑（未拿到锁），退出"; exit 1; }

# 2) 硬闸门：端口被占且未 --force 时报错退出，避免互相抢端口
if lsof -ti tcp:"$PORT" >/dev/null 2>&1 && [ "$FORCE" != "--force" ]; then
  echo "❌ 端口 $PORT 已被占用。确认要先杀后启请加 --force"
  lsof -i tcp:"$PORT" || true
  exit 1
fi

# 3) 先杀后启
source scripts/lib/cleanup.sh
kill_port "$PORT"

# 4) 启动（按项目实际命令替换）
echo "🚀 启动 智远力企-saas (port=$PORT)"
# 例：exec python manage.py runserver 0.0.0.0:"$PORT"
# 例：exec npm run start
echo "TODO: 在此填入本项目的实际启动命令"
