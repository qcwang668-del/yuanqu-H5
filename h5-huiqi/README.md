# 力企云 · 惠企政策 H5 端（源码）

面向企业用户的「惠企政策」移动端应用（H5 / 手机视口）。**零构建单页**：原生 HTML/CSS/JS + hash 路由，无需 Node/打包，改文件即生效。线上曾部署于 `http://120.79.142.141:8000/h5/`。

## 一、包含什么

```
liqi-h5-huiqi/
├─ index.html   ← 页面外壳（加载 style.css / app.js）
├─ style.css    ← 全部样式（移动端，蓝色渐变主色）
├─ app.js       ← 全部逻辑：hash 路由 + 17 个页面 + 调后端 /app-api/liqi/*
└─ README.md    ← 本说明
```

> 这是**前端界面 + 交互逻辑**。数据全部来自后端 **app-api**（在另一份下载「管理后台全栈包 liqi-saas」的 `backend/yudao-module-liqi/controller/app/*` 里）。两者配套才是完整系统。

## 二、功能页面（17 路由，均在 app.js 内）

- **首页** `#/home`：宫格入口（政策 4 频道 / 智能匹配 / AI 政策助手 / 直播 / 园区企业查询 / 企业获批查询 等）
- **政策查询** `#/policy`：搜索 + 政策项目/政策原文/公示公告/园区发布 子 tab + 分类筛选 + 政策卡片
- **政策详情** `#/detail`：蓝头图 + 「帮我读懂·AI 说人话」+ 补贴/地区/行业 + 正文 + 附件 + 收藏/分享/立即申报
- **政策申报** `#/apply`、**我的申报** `#/myapply`：申报表单（游客可提交，落线索）
- **智能匹配** `#/match`、**AI 匹配** `#/ai-match`：按绑定企业画像匹配可申报政策
- **AI 政策助手** `#/ai`：政策问答对话（`/liqi/ai/chat`、`/liqi/ai/explain`）
- **直播** `#/live`、**企业获批查询** `#/company-check`（免登录公开查：企业信息 + 已获批补贴 + 可申报政策）
- **园区企业** `#/enterprise`、**绑定企业** `#/bind`
- **消息** `#/message`：全部 / 外部政策 / 园区发布 子 tab（`source=external/park`）
- **我的** `#/mine`：绑定企业 / 我的收藏 / 我的申报；**登录** `#/login`（会员 token）
- **收藏** `#/favorite`、**订阅** `#/subscribe`（历史保留）

调用的后端接口（`/app-api/liqi/*`）：policy(page/get/match/ai-match)、apply(create/page)、favorite(add/list)、message(page/read/unread-count)、enterprise(base-info/by-park)、bind(bind/get)、company/check、ai(chat/explain)、live/list、subscribe/save。请求头带 `tenant-id: 1`；登录后带 `Authorization: Bearer <token>`（游客可浏览大部分只读页）。

## 三、怎么跑（两种方式）

### 方式 A：跟随「管理后台全栈包」一起（推荐）
后端（liqi-saas 全栈包，端口 48080，前缀 `/admin-api` 与 **`/app-api`**）起好后，用任意静态服务器把本目录挂到 `/h5/`，并把 `/app-api/` 反代到后端 48080（**同源**，避免跨域）。Nginx 示例：

```nginx
# 静态托管 H5
location /h5/ {
    alias /path/to/liqi-h5-huiqi/;
    index index.html;
    try_files $uri $uri/ /h5/index.html;
}
# 同源反代 app-api 到后端
location /app-api/ {
    proxy_pass http://127.0.0.1:48080;
    proxy_set_header Host $host;
}
```

浏览器（手机视口）打开 `http://<host>/h5/` 即可。app.js 用相对路径 `fetch('/app-api/...')`，务必与 H5 **同源**反代。

### 方式 B：本地快速预览
任意静态服务器（如 `python -m http.server`）伺服本目录即可看到界面；但**数据接口需要后端**，请把 `/app-api` 反代/代理到后端 48080，否则只有界面无数据。

## 四、说明
- 纯前端零构建，无 `node_modules`/无编译产物，开箱即改。
- 后端 app-api 的建表 DDL 见全栈包 `backend/sql/liqi/app-api-h5.sql`；C 端接口在 `backend/yudao-module-liqi/src/main/java/.../controller/app/`。
- 外部政策/企业数据「零落库」，后端通过 Provider 抽象（含 Mock 实现，内置示例政策/企业）实时取数，真实第三方接口到位后替换 Provider 即可。
