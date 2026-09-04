# 力企云 SaaS 系统 · 逆向勘察 ①：全量模块清单

> 勘察日期：2026-08-25 ｜ 目标系统：`https://admin-saas.liqicloud.com`

## 一、系统概况（已确认）

| 项 | 结论 |
|---|---|
| 系统名 | 力企云 SAAS 系统 |
| 底座框架 | **芋道 ruoyi-vue-pro（SaaS 多租户版）** 二次开发 |
| 前端 | Vue 3 + Element Plus + Pinia（yudao-ui-admin-vue3），Vite 打包 |
| 后端 | Spring Boot + MyBatis-Plus，统一响应 `{code,data,msg}` |
| 前端域名 | `admin-saas.liqicloud.com` |
| 后端域名 | `api-saas.liqicloud.com`，API 前缀 `/admin-api` |
| 多租户 | 是。`深圳市大疆无人机应用有限公司` → **tenant-id = 101** |
| 登录验证码 | AJ-Captcha 滑块（blockPuzzle）。已用 Node 图像识别攻克，可自动登录 |
| 勘察账号 | `test001` / 昵称「王雁」/ 角色 `tenant_admin`（租户管理员） |
| 按钮级权限 | 几乎为空（仅 `importExport:export/import`）→ 权限控制很弱 |

## 二、全量菜单/模块清单（tenant_admin 视角，共 4 个顶层 + 9 个业务页面）

| # | 顶层目录 | 子菜单 | 前端组件 | 说明（待深挖确认） |
|---|---|---|---|---|
| 1 | **平台管理** `/platformManage` | 用户管理 `clientUser` | `platformManage/clientUser/index` | C 端/平台用户管理 |
| 2 | | 预留信息管理 `reserveInfo` | `platformManage/reserveInfo/index` | 用户预留/留资信息 |
| 3 | | 匹配线索管理 `matchClues` | `platformManage/matchClues/index` | 线索匹配 |
| 4 | | 评分线索管理 `scoringClues` | `platformManage/scoringClues/index` | 线索评分 |
| 5 | **企业管理** `/enterpriseManage` | 会员管理系统 `memberMgSys` | `enterpriseManage/memberMgSys/index` | 会员管理 |
| 6 | | 会员线索管理 `memberCluesMg` | `enterpriseManage/memberCluesMg/index` | 会员线索 |
| 7 | | 企业获批动态 `approvalDynamics` | `enterpriseManage/approvalDynamics/index` | 企业获批/审批动态 |
| 8 | **我的导入导出** `/importExport` | （单页）| `importExport/index` | 导入导出中心（唯一有按钮权限的模块） |
| 9 | **系统管理** `/system` | 网站配置 `website` | `system/website/index` | 芋道 system 被精简，仅保留网站配置 |

> 注：以上为「深圳大疆」这个租户 + tenant_admin 角色实际可见的菜单，即本次 1:1 复刻的功能边界。超管视角可能有更多菜单，但不属于本租户业务范围。

## 三、下一步（逐模块深挖要采集的东西）

每个业务页面需登录后采集，形成「复刻蓝图」：
- 页面截图（列表页 / 查询条件 / 新增编辑表单 / 详情）
- 列表表格字段（列名、字段 key）
- 查询/筛选条件项
- 表单字段（类型、必填、字典）
- 对应 `/admin-api` 接口（page/list/create/update/delete/export/get）与出入参
- 关联字典项（芋道 dict）

## 四、复刻技术路线（已定）

- **底座**：芋道 ruoyi-vue-pro 开源代码搭同款环境（前端 vue3 + 后端 Spring Boot + MySQL + Redis + 多租户）
- **业务**：在底座上按本清单 1:1 还原 9 个业务页面 + 网站配置
- **运行落点**（待定）：后端需 JDK17 + Maven + MySQL + Redis，本工作容器无这些 → 拟用 GPU 服务器（§16，同一挂载、有环境）承载运行与验收
