#!/usr/bin/env bash
# 宿主机直连助手（2026-08-29 起：宿主机已由旧 GPU 机 192.168.8.43 切换为
# 新宿主机 120.79.142.141 = 卫星机，本容器就跑在其上、共享同一挂载、免拷贝）。
#
# 用法（与原接口保持一致，脚本不变）：
#   scripts/gpu_ssh.sh 'docker ps'     # 执行远程命令
#   scripts/gpu_ssh.sh                 # 交互式登录
#
# 说明：新宿主机与卫星机是同一台（120.79.142.141），凭据/登录逻辑统一走
# scripts/poc_ssh.sh（专用密钥优先，回退 deploy/secrets/poc-server.env 里的
# root 密码 qczy3PbfVJFpoc + 阿里云 KexAlgorithms 修复）。本脚本仅作兼容别名，
# 把历史上引用 gpu_ssh.sh 的调用透明转发到 poc_ssh.sh。
#
# 注意：新宿主机【无 GPU】。需 GPU 算力（模型/OCR/CUDA 推理）的任务这台跑不了，
# 如有此类需求需另备带卡机器（见 CLAUDE.md §16 / 记忆库）。
set -euo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
exec "$ROOT/scripts/poc_ssh.sh" "$@"
