#!/bin/bash
# 力企云 liqi app-api 编译（宿主机 root 跑，联网）
# 用 -pl yudao-server -am 把整条 yudao 依赖链纳入 reactor 一起编译，
# 解决单模块构建时 root .m2 缺内部模块 SNAPSHOT 的问题。
export JAVA_HOME=/usr/lib/jvm/java-1.8.0-openjdk-1.8.0.492.b09-1.1.alnx4.x86_64
export MAVEN_OPTS="-Xmx1g -XX:+UseSerialGC"
cd /home/fangnan/PycharmProjects/u667a-u8fdc-u529b-u4f01-saas/backend || exit 9

echo "=== package yudao-server -am ($(date +%T)) 联网，编译依赖链 ==="
rm -f yudao-server/target/yudao-server.jar
mvn -pl yudao-server -am package -Dmaven.test.skip=true -T1 2>&1 | tail -45
echo "build rc=${PIPESTATUS[0]}"
ls -la yudao-server/target/yudao-server.jar 2>&1
echo "APP_CLASS_COUNT=$(unzip -l yudao-server/target/yudao-server.jar 2>/dev/null | grep -c 'module/liqi/controller/app')"
echo "MOCK_CLASS_COUNT=$(unzip -l yudao-server/target/yudao-server.jar 2>/dev/null | grep -c 'external/mock')"
echo "=== BUILD ALL DONE ($(date +%T)) ==="
