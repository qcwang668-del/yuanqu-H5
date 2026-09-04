#!/usr/bin/env bash
# 端口清理 / 进程管理 —— 先杀后启（见 CLAUDE.md §6）
# 用法：source scripts/lib/cleanup.sh; kill_port 8000

kill_port() {
  local port="$1" pids
  [ -z "$port" ] && { echo "kill_port: 需要端口参数"; return 1; }
  pids=$(lsof -ti tcp:"$port" 2>/dev/null || true)
  if [ -n "$pids" ]; then
    echo "清理端口 $port 的旧进程: $pids"
    kill -9 $pids 2>/dev/null || true
    sleep 0.3
  fi
}

# 按进程名兜底清理（可选）
kill_by_name() {
  local pat="$1" pids
  pids=$(pgrep -f "$pat" 2>/dev/null || true)
  [ -n "$pids" ] && { echo "清理进程 [$pat]: $pids"; kill -9 $pids 2>/dev/null || true; }
}
