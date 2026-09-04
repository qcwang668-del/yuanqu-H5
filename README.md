# 惠企政策 H5 端 · 本地部署备份

本仓库是「力企云 · 惠企政策」H5 端（线上同款完整版）连同配套后端源码的本地部署备份。

## 一、目录构成

| 目录 / 文件 | 说明 |
|---|---|
| `h5-huiqi/` | **H5 前端**。零构建单页：原生 HTML/CSS/JS + hash 路由，17 个页面全在 `app.js` 内，改文件即生效 |
| `h5-huiqi/dev-server.js` | 本地服务器：静态托管 + `/app-api`、`/admin-api` 同源反代到后端，含 SSE 流式透传 |
| `saas-full/backend/` | 后端源码（Spring Boot 2.7 + Java 8），业务模块 `yudao-module-liqi`，含 C 端 `controller/app/*` |
| `saas-full/frontend/` | 管理后台源码（Vue3 + Vite + Element Plus） |
| `saas-full/deploy/db-init/` | 数据库整库快照（86 张表，含 26 张 `liqi_*` 业务表） |
| `saas-full/backend/sql/liqi/` | 业务建表与迁移脚本 |
| `start-h5.ps1` | 一键启动脚本：检测 MySQL/Redis，按需拉起后端与 H5 |

## 二、启动

```powershell
powershell -ExecutionPolicy Bypass -File .\start-h5.ps1
```

访问 `http://127.0.0.1:5273/`（建议手机视口）。

端口分配：

| 组件 | 端口 | 备注 |
|---|---|---|
| MySQL | 3306 | 常驻实例，脚本仅检测 |
| Redis | 6379 | 常驻实例，脚本仅检测 |
| 后端 app-api | 48081 | 避开旧后端占用的 48080 |
| H5 | 5273 | 反代 `/app-api` 到 48081 |

## 三、架构要点

前端 `app.js` 中 `api()` 用**相对路径** `fetch('/app-api' + path)`，因此必须**同源反代**，不能直连后端跨域。

请求头固定带 `tenant-id: 1`；登录后附 `Authorization: Bearer <token>`，token 存 localStorage（key `liqi_h5_token`）。响应约定 `code === 0` 为成功，401 自动清除 token。

21 个 C 端接口：`/liqi/policy/{page,get,match,ai-match,favorite-status}`、`/liqi/apply/{create,page}`、`/liqi/favorite/{add,list}`、`/liqi/message/{page,read,unread-count}`、`/liqi/enterprise/{base-info,by-park}`、`/liqi/bind/{bind,get}`、`/liqi/company/check`、`/liqi/ai/{chat,explain}`、`/liqi/live/{list,get}`、`/liqi/subscribe/{get,save}`。多数标注 `@PermitAll` 可免登录浏览。

## 四、部署时修正的问题（重要）

1. **后端缺 C 端接口**：原 48080 后端的 liqi 模块只有 `controller/admin/`，21 个 `/app-api/liqi/*` 全部不存在，导致界面有骨架无数据。已用全栈包源码重新构建。
2. **数据库缺 7 张表**：原库 19 张 `liqi_*` 表，缺 `liqi_policy`、`liqi_live`、`liqi_user_message`、`liqi_policy_apply`、`liqi_policy_favorite`、`liqi_user_enterprise_bind`、`liqi_subscribe_setting`。执行 `app-api-h5.sql`、`policy-live-message.sql`、`push-source-park.sql` 补齐至 26 张。
3. **`liqi_reserve_info` 缺 `user_id` 字段**：新版代码按会员隔离「我的申报」，旧库无此列，申报提交报 500。执行 `reserve-info-apply-merge.sql` 修复。
4. **示例数据租户错配**：示例政策与直播 `tenant_id=0`，被多租户隔离过滤。已归入租户 1。

## 五、已知缺口

**AI 三项功能需要密钥**：「帮我读懂」「AI 政策助手」「AI 智能匹配」调用火山方舟大模型，源码包出于安全未含生产密钥，后端返回 401。设置环境变量后重启后端即可：

```powershell
$env:LIQI_ARK_API_KEY = '<your-key>'
```

对应配置项在 `saas-full/backend/yudao-server/src/main/resources/application-local.yaml` 的 `ark` 节点。其余功能不受影响。

## 六、未纳入版本管理

构建产物（`target/`）、依赖缓存（`node_modules/`、`.pnpm-store/`）、运行日志、下载的源码压缩包、数据库备份、e2e 测试视频均已在 `.gitignore` 中排除。后端需 `mvn clean package -DskipTests` 重新构建（JDK 8）。
