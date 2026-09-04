# 智远力企 SaaS 平台（力企云 SAAS 系统 · 复刻）

前后端分离的多租户 SaaS。基于**芋道 ruoyi-vue-pro（SaaS 多租户版）二次开发**，1:1 复刻已上线的「力企云 SAAS 系统」。

> 📘 完整系统说明书见 [`docs/系统说明书.md`](docs/系统说明书.md)（含架构、模块、部署、构建、验收、已知坑）。

## 技术选型（实际，与代码一致）

- **底座**：芋道 ruoyi-vue-pro，`revision 2026.07-jdk8-SNAPSHOT`，包名 `cn.iocoder.yudao.module.liqi`
- **后端**：Spring Boot 2.7.18 + Java 8 + Maven + MyBatis-Plus（+mybatis-plus-join）+ Druid + 动态数据源 + MySQL 8 + Redis 7
- **前端**：Vue 3 + TypeScript + Vite + Element Plus + Pinia + Axios（`yudao-ui-admin-vue3`，pnpm）
- **接口约定**：API 前缀 `/admin-api`；本项目业务 `/admin-api/liqi/*`；统一响应 `{ code, data, msg }`，`code=0` 成功
- **多租户**：已开启（`yudao.tenant.enable=true`），全部 `liqi_*` 表带 `tenant_id` 自动隔离
- **联调**：前端 `/admin-api` 经 Vite 代理转发到后端 `:48080`（生产由 Nginx/网关统一）
- **实启用模块**：仅 `yudao-dependencies / framework / server / module-system / module-infra / module-liqi`（其余芋道模块在 pom 中注释、未构建）

## 目录结构

```
.
├── backend/                         # 芋道多模块后端（Maven）
│   ├── pom.xml
│   ├── yudao-server/                # 启动/打包模块 → yudao-server.jar（端口 48080）
│   ├── yudao-module-system/         # 底座：认证/租户/菜单/角色/字典
│   ├── yudao-module-infra/          # 底座：基础设施
│   ├── yudao-module-liqi/           # ★ 力企业务模块（cn.iocoder.yudao.module.liqi）
│   └── sql/{mysql, liqi}/           # 芋道基础表 + liqi 定制表/菜单 SQL
├── frontend/                        # yudao-ui-admin-vue3（Vue3+TS+Vite）
│   └── src/views/{platformManage, enterpriseManage, investment, park,
│                  importExport, system/website}   # 业务页面
│   └── src/api/liqi/*               # 业务接口封装
├── e2e/                             # Playwright 验收三件套（tests/evidence/reports）
├── deploy/                          # 卫星服务栈说明、reports/、secrets/（gitignore）
├── scripts/                         # 启停/GPU 直连/MinIO 上传/隧道守护/进程锁
├── docs/                            # 系统说明书、逆向勘察、ops（钉钉日志/绑定台账）
├── CLAUDE.md                        # 开发总纲（规范·强制先读）
└── .env.example
```

## 启动（在 GPU 服务器 192.168.8.43 上，容器与其同一挂载）

### 后端（端口 48080）

```bash
# 重建 jar（关键坑：必须先删旧 jar，否则新模块打不进去）
rm -f backend/yudao-server/target/yudao-server.jar*
JAVA_HOME=/usr/lib/jvm/java-8-openjdk-amd64 mvn -o -pl yudao-server package
java -jar backend/yudao-server/target/yudao-server.jar --spring.profiles.active=local
# 依赖：MySQL 127.0.0.1:3316（库 ruoyi-vue-pro）、Redis 127.0.0.1:6399
```

### 前端（端口 5180，Vite preview 伺服 dist/）

```bash
# 改 .vue 源码必须重 build（preview 不做 HMR）
cd frontend && node --max_old_space_size=8192 ./node_modules/vite/bin/vite.js build --mode env.local
```

### 访问

- 本地前端：`http://127.0.0.1:5180/` ｜ 本地账号：`admin` / `admin123`（租户 1，验证码已关）
- 稳定外网入口：`http://120.79.142.141:8000/`（卫星 socat ← GPU 反向隧道，守护脚本自动重连）

## 规范

首次开发前务必通读 `CLAUDE.md`：中文规范、钉钉推送、E2E 验收三件套、Git 提交规范、进程管理与看门狗、GPU 直连唯一真相源等均为强制约定。
