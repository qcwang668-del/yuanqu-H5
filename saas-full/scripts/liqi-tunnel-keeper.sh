#!/usr/bin/env bash
# 力企云 SaaS 稳定入口守护：GPU 反向隧道(18090->本地5180) + 卫星 socat(8000->18090)，断线自动重连。
# 在 GPU 上 nohup 运行：nohup bash scripts/liqi-tunnel-keeper.sh >/tmp/liqi-keeper.log 2>&1 &
# 对外入口：http://120.79.142.141:8000/
set -u
P=/home/fangnan/PycharmProjects/u667a-u8fdc-u529b-u4f01-saas
set -a; . "$P/deploy/secrets/poc-server.env" 2>/dev/null; set +a
CM="-o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null -o KexAlgorithms=diffie-hellman-group14-sha256 -o ConnectTimeout=20 -o PreferredAuthentications=password -o PubkeyAuthentication=no -o ServerAliveInterval=20 -o ServerAliveCountMax=3 -o ExitOnForwardFailure=yes -p ${POC_SSH_PORT:-22}"
LOCAL_PORT=5180      # GPU 上前端 preview 端口
SAT_INNER=18090      # 卫星本地端口（反向隧道落点）
SAT_PUBLIC=8000      # 卫星对外端口（安全组已放行）

while true; do
  # 1) 确保卫星 socat 对外转发在跑
  sshpass -p "$POC_SSH_PASSWORD" ssh $CM "root@$POC_HOST" \
    "ss -ltn | grep -q :$SAT_PUBLIC || nohup socat TCP-LISTEN:$SAT_PUBLIC,fork,reuseaddr TCP:127.0.0.1:$SAT_INNER >/tmp/liqi-socat.log 2>&1 </dev/null &" 2>/dev/null
  echo "$(cat /proc/uptime 2>/dev/null | cut -d. -f1)s: (re)connecting reverse tunnel $SAT_INNER->$LOCAL_PORT ..."
  # 2) 反向隧道（前台阻塞；断开后退出循环体，sleep 后重连）
  sshpass -p "$POC_SSH_PASSWORD" ssh $CM -N -R "$SAT_INNER:localhost:$LOCAL_PORT" "root@$POC_HOST" 2>>/tmp/liqi-rtun.log
  echo "tunnel dropped, retry in 5s"
  sleep 5
done
