#!/usr/bin/env bash
# 智远力企-saas · 一键 SSH 到卫星服务器（与启程智远共用同一台 120.79.142.141，优先用专用密钥，失败回退密码）
# 用法：scripts/poc_ssh.sh                # 进入交互 shell
#      scripts/poc_ssh.sh 'docker ps'    # 远程执行命令
set -euo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
ENV_FILE="$ROOT/deploy/secrets/poc-server.env"
[ -f "$ENV_FILE" ] || { echo "缺少 $ENV_FILE（从 .example 复制并填值）" >&2; exit 1; }
# shellcheck disable=SC1090
set -a; . "$ENV_FILE"; set +a
KEY="$ROOT/${POC_SSH_KEY#*/}"; [ -f "$POC_SSH_KEY" ] && KEY="$POC_SSH_KEY"
# KexAlgorithms 固定 group14：阿里云路径偶发丢弃 curve25519 的 KEX 大包致握手 hang，group14 稳定放行
COMMON=(-o StrictHostKeyChecking=no -o ConnectTimeout=20 -o KexAlgorithms=diffie-hellman-group14-sha256 -p "${POC_SSH_PORT:-22}")
if [ -f "$KEY" ]; then
  exec ssh -i "$KEY" -o IdentitiesOnly=yes "${COMMON[@]}" "$POC_SSH_USER@$POC_HOST" "$@"
elif command -v sshpass >/dev/null && [ -n "${POC_SSH_PASSWORD:-}" ]; then
  exec sshpass -p "$POC_SSH_PASSWORD" ssh -o PreferredAuthentications=password -o PubkeyAuthentication=no "${COMMON[@]}" "$POC_SSH_USER@$POC_HOST" "$@"
else
  echo "既无可用私钥也无密码/sshpass" >&2; exit 1
fi
