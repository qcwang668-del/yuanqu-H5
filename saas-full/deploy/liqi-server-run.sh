#!/bin/bash
# 力企云后端启动（先杀旧 yudao-server 进程，再用新 jar 启动）。由 systemd unit liqi-server 托管。
export JAVA_HOME=/usr/lib/jvm/java-1.8.0-openjdk-1.8.0.492.b09-1.1.alnx4.x86_64
BASE=/home/fangnan/PycharmProjects/u667a-u8fdc-u529b-u4f01-saas
pkill -f 'yudao-server.jar' 2>/dev/null
sleep 5
cd "$BASE/backend" || exit 9
# 加载智能体广场凭据（火山方舟 API Key / 工商 MCP Token，root-only，不入仓库）
if [ -f /root/.liqi-agent.env ]; then set -a; . /root/.liqi-agent.env; set +a; fi
exec "$JAVA_HOME/bin/java" -Xmx1g -jar yudao-server/target/yudao-server.jar \
  --spring.profiles.active=local > "$BASE/backend/liqi-server.log" 2>&1
