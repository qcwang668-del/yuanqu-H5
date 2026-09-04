# 智远力企 SaaS · 本地独立重建指南

> 本压缩包已包含**基本独立在本地重建**所需的全部信息：后端 Java 源码、前端源码、数据库整库快照、初始化 SQL、配置样例与系统说明书。
> 更详尽的架构/模块/踩坑说明见 [`docs/系统说明书.md`](docs/系统说明书.md)。

## 一、这是什么

基于**芋道 ruoyi-vue-pro（SaaS 多租户版）二开**，1:1 复刻「力企云 SAAS 系统」的管理后台。

- 后端：Spring Boot 2.7.18 + **Java 8** + Maven + MyBatis-Plus + MySQL 8 + Redis 7，`revision 2026.07-jdk8-SNAPSHOT`
- 前端：Vue 3 + TS + Vite + Element Plus + Pinia，`yudao-ui-admin-vue3`，**pnpm** 包管理
- 业务定制模块：`backend/yudao-module-liqi`（包 `cn.iocoder.yudao.module.liqi`），接口 `/admin-api/liqi/*`
- **惠企运营（政策运营）模块**：前端 `frontend/src/views/liqiOps` + `frontend/src/api/liqi/policyOps`，菜单「惠企运营」(`/liqi-ops`)，对应政策发布/政策申报/直播/预约订阅等能力
- 实启用模块：`yudao-dependencies / framework / server / module-system / module-infra / module-liqi`（其余芋道模块在 pom 中注释、未构建）

## 二、你需要自备的环境

| 组件 | 版本 | 说明 |
|---|---|---|
| JDK | **8**（必须，非17） | 芋道该分支用 JDK8 编译，`java-8-openjdk` |
| Maven | 3.6+ | 首次编译需联网拉依赖（建议配 aliyun 镜像） |
| MySQL | 8.x | 建库 `ruoyi-vue-pro` |
| Redis | 7.x | 无密码即可 |
| Node | 18+ | 前端构建 |
| pnpm | 8+ | `npm i -g pnpm` |

## 三、重建步骤

### 1. 数据库（关键）
起 MySQL8，建库并**用 utf8mb4 导入整库快照**（否则中文乱码）：
```bash
mysql -uroot -p -e "CREATE DATABASE \`ruoyi-vue-pro\` DEFAULT CHARSET utf8mb4;"
mysql -uroot -p --default-character-set=utf8mb4 ruoyi-vue-pro < deploy/db-init/ruoyi-vue-pro_full.sql
```
> `deploy/db-init/ruoyi-vue-pro_full.sql` = 当前运行环境整库快照（**86 张表**，含芋道系统表 + **26 张 `liqi_*` 业务表**（含惠企运营/政策运营）+ 菜单/租户/账号数据），导入后即可直接登录，无需再跑建表脚本。
> 若只想要建表脚本（不含数据），见 `backend/sql/mysql/` 与 `backend/sql/liqi/`；`deploy/db-migrate/`、`deploy/db-backup/` 为增量迁移与历史备份，可选。

起 Redis7（默认端口即可）。

### 2. 后端配置
编辑 `backend/yudao-server/src/main/resources/application-local.yaml`，把 MySQL / Redis 连接改成你本地的 host/port/账号/密码（原值指向打包环境的 docker，需替换）。

### 3. 编译 + 启动后端（JDK8）
```bash
cd backend
# 用 JDK8！首次联网拉依赖（去掉 -o）
JAVA_HOME=/path/to/jdk8 mvn clean package -DskipTests
# ⚠️ 坑：改过 liqi 模块后重打包前，先删旧 jar，否则新模块打不进去
#   rm -f yudao-server/target/yudao-server.jar*
java -jar yudao-server/target/yudao-server.jar --spring.profiles.active=local
# 后端端口 48080，接口前缀 /admin-api
```

### 4. 前端
```bash
cd frontend
pnpm install
# 配 .env.local：VITE_BASE_URL='' 走相对 /admin-api；vite.config 已配 proxy /admin-api → 127.0.0.1:48080
pnpm dev            # 开发模式；或 pnpm build 后用 pnpm preview
# 前端端口 5180
```

### 5. 登录
浏览器打开 `http://localhost:5180`：
- 租户：**芋道源码**（id=1）
- 账号：**admin / admin123**（打包环境已关登录验证码；admin 昵称定制为「王雁」）

## 四、包内已排除（本地自行还原，非缺失）

| 排除项 | 如何还原 |
|---|---|
| `frontend/node_modules`（约 1.2G） | `pnpm install` |
| `backend/**/target`（编译产物） | `mvn package` |
| `frontend/dist`（构建产物） | `pnpm build` |
| `deploy/secrets/` 内的**生产 SSH 私钥与含密码的 `*.env`** | 属打包环境的生产凭据，本地重建**不需要**、出于安全**已剔除**；仅保留同名 `*.example` 供参考 |

## 五、业务定制速览（复刻之外的自研部分）

- **26 张 `liqi_*` 表**（含 `liqi_park` 关联园区、`liqi_enterprise*` 企业主体、`liqi_policy*`/`liqi_live`/`liqi_reserve_info`/`liqi_subscribe_setting` 等惠企运营/政策运营相关表）
- 后端：`/admin-api/liqi/*`（app-user/reserve-info/match-clue/scoring-clue/member/member-clue/approval-dynamic/import-export/website-config/park + 政策运营 policyOps 等）
- 前端「惠企运营」菜单：`views/liqiOps`（政策发布/申报/直播/预约订阅等运营页）
