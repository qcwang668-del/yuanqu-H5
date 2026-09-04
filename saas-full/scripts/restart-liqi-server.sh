#!/usr/bin/env bash
# 智远力企-saas 后端(yudao-server)重启脚本 —— 卫星机本机执行
# 内置：精确按端口停旧进程(不宽匹配，§6 铁律) + 注入智能体凭据 + 先杀后启
# 凭据从 /root/.liqi-agent.env 读取(root-only，不入仓库)
set -euo pipefail
cd "$(dirname "$0")/.."

PORT=48080
ENV_FILE=/root/.liqi-agent.env

# 1) 加载凭据
if [ -f "$ENV_FILE" ]; then
  # shellcheck disable=SC1090
  source "$ENV_FILE"
fi
export LIQI_ARK_API_KEY="${LIQI_ARK_API_KEY:-}"
export LIQI_MCP_TOKEN="${LIQI_MCP_TOKEN:-}"

# 2) 精确取占用 48080 的 PID（仅本项目后端，避免误伤）
PIDS=$(ss -ltnp 2>/dev/null | grep ":${PORT} " | grep -oP 'pid=\K[0-9]+' | sort -u || true)
if [ -n "$PIDS" ]; then
  echo "停止旧后端 PID: $PIDS"
  kill $PIDS 2>/dev/null || true
  sleep 6
  PIDS2=$(ss -ltnp 2>/dev/null | grep ":${PORT} " | grep -oP 'pid=\K[0-9]+' | sort -u || true)
  if [ -n "$PIDS2" ]; then
    echo "强杀残留 PID: $PIDS2"
    kill -9 $PIDS2 2>/dev/null || true
    sleep 2
  fi
else
  echo "端口 $PORT 无旧进程"
fi

# 3) 启动（限堆 1g，防 OOM 误伤邻居）
echo "启动新后端..."
nohup java -Xmx1g -jar backend/yudao-server/target/yudao-server.jar \
  --spring.profiles.active=local > /tmp/liqi-server.log 2>&1 &
echo "新后端 PID=$!"
