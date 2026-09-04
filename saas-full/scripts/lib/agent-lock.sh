#!/usr/bin/env bash
# 多 agent 并发文件原子锁（见 CLAUDE.md §8）
# 铁律：拿锁 → 重新读盘最新内容 → 改 → 写回 → 解锁
# 禁止用会话内存里的旧副本直接覆盖写回（会冲掉别的 agent 的改动）
#
# 用法：
#   source scripts/lib/agent-lock.sh
#   with_lock docs/ops/manifest.json.lock update_manifest   # update_manifest 内部务必重新读盘再改

with_lock() {                 # with_lock <lockfile> <cmd...>
  local lock="$1"; shift
  [ -z "$lock" ] && { echo "with_lock: 需要锁文件路径"; return 1; }
  exec 8>"$lock"
  if ! flock -w 30 8; then
    echo "❌ 拿锁超时(30s): $lock"; return 1
  fi
  "$@"; local rc=$?
  flock -u 8
  return $rc
}
