#!/bin/bash
# 力企云 B 端管理前端构建（vite build，mode=local 走相对 /admin-api）
# 由 systemd unit liqi-fe-build 在宿主机跑；日志写 frontend-build.log
export NODE_OPTIONS=--max-old-space-size=6144
BASE=/home/fangnan/PycharmProjects/u667a-u8fdc-u529b-u4f01-saas
cd "$BASE/frontend" || exit 9
echo "=== vite build 开始 $(date +%T) ==="
node ./node_modules/vite/bin/vite.js build --mode env.local 2>&1 | tail -40
echo "build rc=${PIPESTATUS[0]}"
ls -la dist/index.html 2>&1
echo "=== FE BUILD DONE $(date +%T) ==="
