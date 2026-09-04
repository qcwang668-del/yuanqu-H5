# 模块①「平台管理 - 用户管理」复刻蓝图

> 菜单：平台管理/用户管理 `platformManage/clientUser/index`
> 逆向来源：目标前端 chunk（index-apnfekww / clientUserDetail / promotionUser）+ 真实接口

## 接口（目标系统，前缀 /admin-api，均 POST/GET）
| 用途 | 方法 | 路径 |
|---|---|---|
| 用户分页列表 | POST | `/system/liqi/app-user/tenantAppUserPageList` |
| 用户详情 | GET | `/system/liqi/app-user/tenantAppUserDetails/{id}` |
| 登录日志分页 | POST | `/system/liqi/app-user/login-log/page` |
| 公示列表 | POST | `/system/liqi/app-user/tenantPagePublicizeList` |
| 预留信息分页 | POST | `/system/liqi/app-user/tenantPageReserveInfo` |

> 目标响应格式（二开自定义）：`{code:200, data:{page,size,total,list}, msg:"Success"}`

## 列表页
**查询条件**：用户名(userName)、手机号(phone)、来源(source：小程序/PC端)、注册时间(createTimeArr 范围)、最近登录时间(loginTimeArr 范围)

**表格列**：序号、用户名、手机号、来源、维护企业、推广用户量、一级推广人、二级推广人、注册时间、最近登录时间、操作

## 详情页（clientUserDetail）
- 基本信息
- 维护企业（列表）
- 登录日志：平台、登录时间、登录方式

## 推广用户列表（promotionUser）
- 查询：用户名、用户手机号、推广用户类别（一级推广用户/二级推广用户）、注册时间
- 列：序号、用户名称、手机号、推广用户类别、注册时间

## 复刻实现约定
- 后端：新建独立业务模块 `yudao-module-liqi`，接口/表按目标路径命名（`liqi_app_user`）
- 前端：`views/platformManage/clientUser/index.vue`，菜单挂「平台管理」目录下
- 数据结构以真实字段为准；响应可沿用芋道标准 `{code:0}`（前端自建，前后端自洽即可）
