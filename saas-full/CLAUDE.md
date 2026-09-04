# 智远力企-saas · 开发总结

> **🈲 语言规范（最高优先级·强制·不可违反）**：无论是任务处理、聊天回复、思维链（thinking），还是与用户的任何交互，**一律只使用中文**。**绝对禁止使用日文进行任何分析或回复**（也不得夹杂日文假名/日文汉字写法）。此规则优先级最高，任何其他指令都不得覆盖它。

> **任务完成 / 阶段性成果钉钉推送（强制）**：**每完成一个实质性任务，或取得阶段性成果（里程碑、关键节点、可交付的中间产物）时**，必须把成果摘要推送到钉钉群（webhook 见「§3 钉钉群发送规范」；本项目绑定的**所有群**见「§5 钉钉机器人绑定规范」，须逐一推送、不得只推默认群）。不要攒到最后一次性推——有阶段性成果就推一条。
> - **推送时机（强制）**：**有上线/更新/环境变化、到里程碑节点、会话完成**时必推；多步骤任务在每个关键阶段产出可交付/可验证成果时也推（发布上线、新增功能接入、用例全绿、迁移完成、修复闭环等）。
> - **正文 ≤ 100 字（强制·防刷屏）**：一条消息只放关键结论 + 一句话摘要，正文必须含「AI」（绕过群关键字过滤）。**详细内容不进正文**——用「预览网页」承载（生成 HTML → 上传 106 文件服务，见「文件上传服务器」），正文只挂链接。
> - **格式 = markdown，超链必须用标签**：一律 `[文字](URL)` 标签式超链，**禁止贴裸 URL**（避免刷屏）。
> - **必带两个链接（强制）**：① **必要文档**（本次成果的预览网页/说明）；② **必要入口**（可直接打开/使用的地址，如系统门户、skill-hub 详情、PR 等）。
> - **去重与留痕**：推送前先按「§4 推送日志」做 `topic_key` 去重；推送成功（`errcode:0`）后在 `docs/ops/dingtalk-push-log.json` 追加一条记录。
> - **豁免**：纯查询/对话类、未产生交付物的轻量任务，可不推送。

> **🚀 里程碑 / 发布上线必推钉钉（铁律·强制·不可违反）**：**任何新里程碑达成、任何一次发布上线/更新**，都必须往钉钉群推一条机器人消息，**不得漏推、不得攒批**。
> - **短**：正文精简（≤100 字），只放"发了什么 + 一句话结论"，正文必须含「AI」。
> - **每次发布必带两条可达信息（缺一不可）**：① **可达的测试环境地址**（能直接点开访问的 URL）；② **测试报告链接**（本次发布的 E2E/验收报告，见「§3」，用 `[文字](URL)` 标签式超链，禁止裸 URL）。
> - **群**：遍历本项目所有绑定群（见「§5」及 `docs/ops/dingtalk-bindings.json`），含"发布通知群"（webhook 见 §5，加签 secret 放 `.env` 的 `DING_RELEASE_SECRET`，禁止硬编码）。
> - **留痕**：推送成功后按「§4」在 `docs/ops/dingtalk-push-log.json` 追加记录。

> **扫码登录需人工介入（强制）**：任何时候遇到需要【扫码登录】（QR 登录）才能继续的环节，**不得自行尝试绕过或卡住静默等待**，必须：
> 1. 先按「§3 钉钉群发送规范」在钉钉群发一条通知（说明哪个环境/为什么需要扫码、附登录入口），正文含「AI」；
> 2. 然后**停下来等待用户完成扫码操作**，不要继续后续步骤；
> 3. 用户确认完成后再继续。

> **子 agent 浏览器默认无头（强制·节约资源）**：主 agent 下发给子 agent 的任务，所有浏览器操作**默认无头**（设环境变量 `BROWSER_HEADLESS=1`）。**唯一例外**：需要用户本人扫码 / 人工登录时才用有头浏览器（并按上面的「扫码登录需人工介入」规则先发钉钉通知再等待）。

> **进程与服务只能单一方式托管（强制·防互杀）**：同一个服务**禁止**同时用多种方式启停（如 start.sh + supervisor + 手工 nohup 混用），否则会互相抢端口、互相 kill 陷入死循环。本机常驻服务统一由 **supervisor 托管**，本地开发用 `scripts/start.sh`（内置先杀后启 + flock 互斥）。详见「§6 进程管理与服务启停」。

> **多 agent 改「单一事实源」文件必须加锁（强制·防误删）**：当多个 agent / 进程可能并发改动同一份权威文件（清单、状态、vmap、台账、push-log 等）时，**禁止**用会话内存里的旧副本直接回写——必须走 `拿锁 → 读磁盘最新 → 改 → 写 → 解锁`。曾因用旧副本回写误删过已完成的数据。详见「§8 多 agent 并发文件操作」。

> **🖥️ 宿主机直连 + 同一挂载即唯一真相源（铁律·强制·不可违反）**：本项目宿主机已于 **2026-08-29 由旧 GPU 机 `192.168.8.43` 切换为新宿主机 `120.79.142.141`**（阿里云，root / `qczy3PbfVJFpoc`，即卫星机；旧 GPU 机全部信息作废）。**本容器就跑在新宿主机上**，与其**共享同一目录** `/home/fangnan/PycharmProjects/u667a-u8fdc-u529b-u4f01-saas`——**这就是唯一真相源，在容器里改代码 = 宿主机上同步生效，禁止二次拷贝文件（scp/rsync/上传）**。凡需在宿主机 root 身份上执行（构建、跑服务、docker、装依赖），一律用 **`scripts/poc_ssh.sh`**（= `scripts/gpu_ssh.sh` 兼容别名）直连:
> - **连接方式(强制)**：走 `scripts/poc_ssh.sh`（专用密钥优先，回退 `deploy/secrets/poc-server.env` 里的 root 密码 + 固定 `KexAlgorithms=diffie-hellman-group14-sha256` 绕阿里云握手坑）。凭据放 `deploy/secrets/`（已 .gitignore），**禁止**硬编码进被 git 跟踪的文件。
> - **同一挂载 = 免拷贝**：编辑/生成的文件走本地路径即可,宿主机侧立即可见;**严禁** scp/rsync 再拷一份(会造成两份漂移)。
> - **⚠️ 新宿主机无 GPU / 内存紧 / 多项目共用**：4核7.3G（仅 ~3.7G 可用），与启程智远 `qczy-*`、`codekb-*`、`cc-qwen` 等**共用**；起服务须限 Java 堆并监控内存，**严防 OOM 误伤邻居容器**（§6 铁律）。**无 GPU**——需 GPU 算力（模型/OCR/CUDA 推理）的任务这台做不了，如有需另备带卡机器。
> - **旧 GPU 机 `192.168.8.43` 已弃用**：当前 SSH 握手被拒（`kex_exchange_identification: Connection closed`），仅容器侧 TCP22 可达；如需从旧机取历史数据（如 dump 库），须先让用户恢复旧机 SSH。
> 详见「§16 宿主机 sshpass 直连与同一挂载唯一真相源」。

## 项目简介
智远力企 SaaS 平台（Java 后端 + 前后端分离）

## 当前状态（2026-08-25）
项目脚手架初始化完成，等待需求文档

## 项目结构
```
智远力企-saas/
├── docs/                             ← 开发文档
│   └── ops/
│       ├── dingtalk-push-log.json    ← 钉钉推送日志（去重凭据）
│       └── dingtalk-bindings.json    ← 本项目绑定的钉钉群清单（入站/出站，见 §5）
├── scripts/                          ← 脚本工具
│   ├── start.sh                      ← 启动（内置先杀后启 + flock 互斥）
│   ├── upload-file.sh                ← 文件上传
│   ├── db-tunnel.sh                  ← 本地连远程库的 SSH 隧道（见 §10）
│   └── lib/
│       ├── cleanup.sh                ← 端口清理/进程管理（先杀后启）
│       └── agent-lock.sh             ← 多 agent 文件原子锁（见 §8）
├── ops/                              ← 运维脚本
│   ├── watchdog.sh                   ← 常驻服务探活+自愈看门狗（见 §7）
│   ├── cpolar-watchdog.sh            ← cpolar 隧道探活看门狗（见 §9）
│   └── supervisor.conf.example       ← supervisor 托管配置范本（见 §6）
├── e2e/                              ← Playwright 端到端测试
│   ├── playwright.config.ts
│   ├── tests/                        ← 测试脚本
│   ├── evidence/                     ← 截图证据
│   └── reports/                      ← HTML 报告
├── kb/                               ← （可选）大文件库全文检索（见 §11）
│   ├── kb_build.py                   ← 构建/增量更新 FTS5 索引
│   └── kb_search.py                  ← 检索
├── .env.example                      ← 环境变量模板
├── .gitignore
├── README.md
└── CLAUDE.md                         ← 本文件
```
> 注：`ops/`、`kb/` 等目录按项目实际需要启用，不用的可删。

## 核心规范

### Git 提交规范（强制）
```
<type>(<scope>): <subject>

<body>

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>
```

**type 类型**：
- `feat`：新功能
- `fix`：修复
- `refactor`：重构
- `test`：测试
- `chore`：构建/部署/运维
- `docs`：文档
- `release`：发版

**scope 范围**：模块名（如 `frontend`、`backend`、`e2e`、`deploy`）

**示例**：
```
feat(e2e): 新增用户登录 E2E 测试 + 截图证据

- 覆盖正常登录、错误密码、登录态过期场景
- 截图证据存放 e2e/evidence/login/

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>
```

### E2E 验收标准（强制）
**所有代码编写成果必须通过 Playwright E2E 测试验收后才可交付。**

验收三件套（缺一不可）：

| 产物 | 路径 | 说明 |
|---|---|---|
| **测试用例** | `e2e/tests/<feature>.spec.ts` | Playwright 测试脚本，覆盖功能的 golden path + 边界 case |
| **截图证据** | `e2e/evidence/<feature>/` | 关键步骤截图（.png），命名 `01_首页加载.png`、`02_发送消息.png`... |
| **HTML 报告** | `e2e/reports/<feature>.html` | Playwright HTML Reporter 输出，包含时间线、截图、trace |

**运行方式**：
```bash
cd e2e
npm install
npx playwright test                          # 跑全部
npx playwright test tests/login.spec.ts      # 跑单个
npx playwright show-report                   # 查看 HTML 报告
```

**交付 Checklist**：
- [ ] `e2e/tests/<feature>.spec.ts` 存在且通过
- [ ] `e2e/evidence/<feature>/` 目录有 ≥3 张关键步骤截图
- [ ] `e2e/reports/<feature>.html` 已生成且全绿
- [ ] 截图能清晰展示：页面加载 → 用户操作 → 结果验证
- [ ] 边界 case 覆盖：空输入、登录态过期、网络错误

### §3 钉钉群发送规范

**钉钉群 webhook（通用通知群）**：
```
https://oapi.dingtalk.com/robot/send?access_token=d1517701b4a656a8243869fed8da9ab36763ae56fd7091dbb1fbb173807a2f9b
```
> 本项目可能绑定**多个**群，各群的通道/名称/conversationId 见「§5 钉钉机器人绑定规范」；推送时须遍历全部绑定群，不得只推默认群。

**安全鉴权要求（不可省略）**：消息正文（`markdown.text` 或 `text.content`）**必须包含字符串 "AI"**，否则机器人会被群关键字过滤拦截。建议在标题或开头明确写「AI 自动通知」。

**消息体规范（markdown 模板）**：
```json
{
  "msgtype": "markdown",
  "markdown": {
    "title": "AI 自动通知 · <主题>",
    "text": "## AI 自动通知 · <主题>\n\n<礼貌问候>\n\n这是由 AI 自动生成的<类型>通知...\n\n### 摘要\n- 项目：智远力企-saas\n- 完成内容：...\n- 验收结论：...\n\n### 详细文档\n📄 [点击查看](<链接>)\n\n> AI 安全鉴权说明：本消息由 AI 自动生成发送，仅作流程留痕。"
  }
}
```

**语气规范**：客气礼貌，开头带问候（"各位老师好，打扰了"），结尾带感谢，避免命令式措辞。

**推送消息长度与格式约束（强制·防刷屏）**：
- **正文 ≤ 100 字**：一条消息只发**关键结论 + 一句话摘要**（+ 最多 1~2 张关键截图），不允许超长正文、不堆图。
- **详细内容走「预览网页」**：方案、验收明细、多图对比、长清单、数据/差异说明等，一律生成独立 HTML（预览网页）上传 106 文件服务（`http://106.53.136.31:19000`，见「文件上传服务器」），正文只挂链接。
- **markdown + 标签式超链**：一律用 `[文字](URL)` 标签超链，**禁止贴裸 URL**。
- **必带两个链接**：① **必要文档**（成果预览网页/说明）；② **必要入口**（可直接打开/使用的地址，如系统门户、skill-hub 详情、PR 等）。

### §4 推送日志（去重凭据）

所有推送记录统一存放在 `docs/ops/dingtalk-push-log.json`（JSON 数组），用于：

1. **推送前去重**：按 `topic_key` 字段 grep，判断是否已推过同主题。
2. **推送后留痕**：钉钉返回 `errcode:0` 后立即追加一条记录，禁止漏登。
3. **状态跟踪**：`status` ∈ `{pending, resolved, superseded}`，回复后由人工改为 `resolved`，被新版本替代时改为 `superseded`。

**记录字段**：
```json
{
  "date": "YYYY-MM-DD",
  "topic_key": "主题归一化关键字，用于去重 grep",
  "title": "钉钉消息显示的主题",
  "doc_url": "当前有效的文档 URL",
  "doc_url_history": ["历史 URL"],
  "dingtalk_response": {"errcode": 0, "errmsg": "ok"},
  "status": "pending",
  "note": "备注"
}
```

**去重检查命令（推送前必跑）**：
```bash
TOPIC_KEY="your-topic-key"
jq --arg k "$TOPIC_KEY" '.pushes[] | select(.topic_key | contains($k)) | select(.status != "superseded")' \
   docs/ops/dingtalk-push-log.json
```

若上述命令有输出，**禁止重复推送**。

### §5 钉钉机器人绑定规范（入站路由 + 出站推送）

本项目通过「钉钉机器人管理后台」接入钉钉，绑定分**两个独立方向、两个数据源**——这是最容易翻车的地方：

| 方向 | 数据源 | 记录什么 | 决定 |
|---|---|---|---|
| **入站** | `~/PycharmProjects/钉钉机器人管理后台/scripts/bridge_state.json` | `{conversation_id → project_id / agent_id / project_name}` | 群里 @机器人 的消息路由进哪个 cc 项目 / 哪个 Claude 会话 |
| **出站** | `Robot` 表（后台 `http://127.0.0.1:19160/api/robots/`，线上 MySQL `dingtalk_robot_admin.robot_robot`） | webhook / 应用机器人及其 `project`、`group_name`、`access_token` / `conversation_id` | 系统往哪个群**主动推送** |

> **关键坑（必记）**：同一个群可能「只在入站有 / 只在出站有 / 两者都有」。**只查 Robot 表会漏掉入站路由**——务必两处一起查，用 `查找钉钉机器人绑定群` skill 一次查全。

**① 查询本项目绑定了哪些群（做任何推送前先查）**：
```bash
# 模糊搜索：项目名/群名/cid/project_id/agent_id/token 任意关键词，两源一起命中
python3 ~/.claude/skills/查找钉钉机器人绑定群/scripts/find_binding.py 智远力企-saas
python3 ~/.claude/skills/查找钉钉机器人绑定群/scripts/find_binding.py --all      # 列出全部
python3 ~/.claude/skills/查找钉钉机器人绑定群/scripts/find_binding.py --json 关键词  # 原始 JSON
```
把查到的绑定群固化到 `docs/ops/dingtalk-bindings.json`（本项目所有群的 `name / channel / conversation_id / access_token 来源` 台账），推送时遍历它。

**② 入站绑定（群消息 → 本项目）：自动，无需手写库**
1. 在钉钉建群或选现有群；
2. 把「方楠的cc小助手」应用（@机器人）拉进群；
3. 群里 @机器人 一次；
4. bridge（`ding_cc_bridge.py`）监听到 Stream 事件后**自动**把 `conversation_id → {project_id, agent_id, project_name}` 写进 `bridge_state.json`。

**③ 出站绑定（本项目 → 往群推送）：在后台登记一条 Robot 记录**
- **应用机器人（推荐）**：机器人已被拉进群，无需建 webhook，只需登记 `conversation_id`：
  ```bash
  curl -X POST http://127.0.0.1:19160/api/robots/ -H "Content-Type: application/json" -d '{
    "name": "智远力企-saas 通知机器人", "channel": "app_robot",
    "scope": "project", "project": "智远力企-saas", "group_name": "<群名>",
    "conversation_id": "<cid...==>", "description": "应用机器人主动群发" }'
  ```
- **Webhook 机器人（兼容老项目）**：钉钉后台为群建「自定义机器人」拿 `access_token`（+可选加签 `secret`），再登记：
  ```bash
  curl -X POST http://127.0.0.1:19160/api/robots/ -H "Content-Type: application/json" -d '{
    "name": "智远力企-saas 通知机器人", "channel": "webhook",
    "scope": "project", "project": "智远力企-saas", "group_name": "<群名>",
    "access_token": "<从钉钉后台获取，勿写进代码仓库>", "secret": "<可选加签>",
    "keywords": "AI", "description": "项目推送机器人" }'
  ```
  > 凭据（access_token / secret / DING_APPKEY / DING_APPSECRET）一律放后台 `.env` 或 Nacos，**禁止**硬编码进本仓库。

**④ 往群推送（三选一）**：
```bash
# a) skill 直接发（快速验证；按项目名或 cid）
python3 ~/.claude/skills/查找钉钉机器人绑定群/scripts/push_to_group.py --project 智远力企-saas "【AI 通知】…"
python3 ~/.claude/skills/查找钉钉机器人绑定群/scripts/push_to_group.py "<cid...==>" "【AI 通知】…"

# b) 后台代理发（外部指定机器人 + 内容）
curl -X POST http://127.0.0.1:19160/api/send/ -H "Content-Type: application/json" \
  -d '{"robot":"<机器人名称或id>","msgtype":"markdown","title":"AI 通知","text":"## 内容…"}'

# c) 后台用库里凭据发（指定机器人 id）
curl -X POST http://127.0.0.1:19160/api/robots/<id>/send/ -H "Content-Type: application/json" \
  -d '{"msgtype":"markdown","title":"AI 通知","text":"## 内容…"}'
```

**⑤ 多群遍历推送（强制·不得只推默认群）**：本项目绑定多个群时，成果推送必须遍历所有绑定群：
```bash
python3 ~/.claude/skills/查找钉钉机器人绑定群/scripts/find_binding.py --json 智远力企-saas \
  | jq -r '.. | .conversation_id? // empty' | sort -u \
  | while read cid; do
      python3 ~/.claude/skills/查找钉钉机器人绑定群/scripts/push_to_group.py "$cid" "【AI 通知】…"
    done
```
> **推送是对外动作**：正式群发前先跟用户确认「发哪些群、发什么内容」，再执行（遵循顶部「阶段性成果推送」规则，正文含「AI」）。

**⑥ 常见故障排查**：
| 现象 | 排查 |
|---|---|
| 群里 @机器人 无反应 | 查 `bridge_state.json` 有无该群、`project_id` 是否指向本项目：`find_binding.py <群名>` |
| 往群推送 `errcode≠0` | 机器人是否 `enabled`；探活 `POST /api/robots/<id>/probe/`；查日志 `GET /api/logs/`；`88`=token 失效、`43004`=群已解散 |
| 消息被群关键字过滤 | 正文须含关键词（如「AI」）或配加签 secret |
| 应用机器人无法群发 | 后台 `.env` 的 `DING_APPKEY/DING_APPSECRET` 是否配好、`conversation_id` 是否正确 |

**相关入口**：后台 `http://127.0.0.1:19160/`（Admin `/admin/`）；skill `~/.claude/skills/查找钉钉机器人绑定群/`；bridge `~/PycharmProjects/钉钉机器人管理后台/scripts/ding_cc_bridge.py`。

### §6 进程管理与服务启停（强制·先杀后启 · flock 互斥 · supervisor 托管）

**铁律**：同一个服务只能有一种托管方式，禁止混用。
- **本机常驻服务**：统一由 **root supervisor 托管**（配置放 `/etc/supervisor/conf.d/`，范本见 `ops/supervisor.conf.example`）。管理命令：`sudo supervisorctl restart <service>` / `status` / `tail -f <service>`。**禁止**再手工 `start.sh` / `pm2` / `nohup` 拉同一个服务。
- **本地开发**：用 `scripts/start.sh`，它内置「flock 独占锁 + 先杀占用端口的旧进程 + 再启新进程 + 硬闸门」。

**先杀后启（cleanup.sh 标准模式）**：启动前先清理占用目标端口的旧进程，避免 `Address already in use`：
```bash
# scripts/lib/cleanup.sh <port>
kill_port() {
  local port="$1" pids
  pids=$(lsof -ti tcp:"$port" 2>/dev/null || true)
  [ -n "$pids" ] && { echo "清理端口 $port 旧进程: $pids"; kill -9 $pids 2>/dev/null || true; }
}
```

**flock 互斥（防重复启动）**：
```bash
# scripts/start.sh 开头
exec 9>/tmp/智远力企-saas.start.lock
flock -n 9 || { echo "已有启动流程在跑（未拿到锁），退出"; exit 1; }
# ...先杀后启...
```

**硬闸门**：若检测到旧进程仍在（且未显式 `--force`），应**报错退出**而不是盲目再拉一个，防止端口抢占死循环。

**铁律·任何启停/清理动作先掂量"炸毁半径"，严禁误伤同机共存的其他系统**：本机是多项目 + 公共基建挤在一台机器上。执行 `kill` / `pkill` / `killall` / 清端口 / 重启 / 部署等**有副作用**的动作前，必须逐项确认**不会波及**下面这些「无辜方」：
- **其他项目**：同机跑着的别的业务 / 仓库 / 服务；
- **外网透传服务**：cpolar 等内网穿透 / 透传隧道（一旦被误杀，所有对外链接同时断）；
- **编程工具**：Claude Code / IDE / 各类 agent 与开发工具进程；
- **cpolar 服务本身**及其托管进程。

落地要求：**按精确端口 / PID 定点清理**（`lsof -ti tcp:<本项目端口>`），**严禁** `pkill -f node` / `pkill -f python` / `pkill -f cpolar` / `killall` 这类宽匹配"一锅端"；supervisor 托管的服务名也要带项目前缀，避免重名互杀。拿不准是否会误伤时，先停手核对进程归属，不要凭猜执行。

### §7 后台常驻服务：健康检查与看门狗自愈（强制）

常驻服务（Django/daphne/uvicorn/ollama 等）必须配**健康检查接口 + 看门狗**，故障自动重启。

**健康检查接口（`/healthz`）约定**：
- 路径固定 `GET /healthz`，返回 `200 {"status":"ok"}`。
- **纯内存判定**：不查库、不鉴权、不依赖外部服务——避免下游卡死时把健康检查也拖成假活/假死。
- 需要判定依赖时，另开 `GET /readyz`（就绪检查）区分「活着」和「能干活」。

**看门狗（`ops/watchdog.sh`）**：周期探活，连续失败到阈值就重启服务。
```bash
# 可调参数
INTERVAL=15     # 探测间隔（秒）
FAILS=3         # 连续失败阈值
TIMEOUT=5       # 单次探测超时（秒）
URL=http://127.0.0.1:8000/healthz
```
- **Linux**：看门狗本身也交给 supervisor 托管（或用 systemd timer）。
- **macOS**：用 LaunchAgent（`~/Library/LaunchAgents/*.plist`，`KeepAlive=true`）。

**铁律·看门狗探活目标只认本机回环，任何时候都不许探 cpolar**：
- 服务自愈看门狗（本 §7）的探活 URL **必须**固定为 `http://127.0.0.1:<port>/healthz` 这类**本机回环地址**；**严禁**改成 cpolar 公网域名 / `MEDIA_BASE` / 任何外网透传入口。
- 原因：cpolar / 外网透传是**独立且不可控的故障域**——隧道抖一下 ≠ 本机业务挂了。隔着 cpolar 探活，一次透传波动就会被误判成服务死亡，触发**误重启业务服务**，甚至引发连锁抖动。
- 健康域与隧道域**严格分家**：本机服务活没活 → §7 看门狗（只探回环、只重启业务服务）；cpolar 隧道通没通 → §9 cpolar 看门狗（只探隧道、只重启 cpolar）。两者互不越界，**§7 看门狗绝不去碰 / 重启 cpolar**。

### §8 多 agent 并发文件操作：原子锁（单一事实源保护，强制）

多个 agent / 进程可能并发改动同一份权威文件（清单 / 状态 / vmap / 台账 / `dingtalk-push-log.json` 等）时：

**铁律**：`拿锁 → 读磁盘最新内容 → 修改 → 写回 → 解锁`。**禁止**用会话开始时读进内存的旧副本直接覆盖写回（会把别的 agent 的改动/已完成数据冲掉——曾发生过误删已生成数据的事故）。

**标准封装（`scripts/lib/agent-lock.sh`）**：
```bash
with_lock() {                    # with_lock <lockfile> <cmd...>
  local lock="$1"; shift
  exec 8>"$lock"
  flock -w 30 8 || { echo "拿锁超时: $lock"; return 1; }
  "$@"                           # 回调里务必“重新读盘”再改再写
  flock -u 8
}
```
- 锁文件建议与被保护文件同名加 `.lock`（如 `manifest.json.lock`）。
- 超时（默认 30s）拿不到锁就报错退出，不要静默丢弃改动。
- 涉及关键文件的 git 提交，commit message 里注明锁版本/批次号，便于回溯。

### §9 内网穿透 cpolar：域名稳定化与探活看门狗

用 cpolar 对外暴露文件服务 / 媒体 / API 时：

- **域名会漂移**：免费隧道重连后二级域名会变。解决：隧道配置里锁 `region: cn` + 固定 `subdomain: <前缀>`，让域名稳定。
```yaml
# ~/.cpolar/cpolar.yml
tunnels:
  智远力企-saas-media:
    proto: http
    addr: 19000
    region: cn
    subdomain: <固定前缀>
```
- **统一走稳定域名**：对外链接用环境变量 `MEDIA_BASE=https://<固定前缀>.cpolar.top`，**禁止**在代码里硬编码临时 IP / 临时域名。
- **⛔ 铁律·隧道只由一处托管，严禁任何项目自起 cpolar**：全机各项目**共用同一个 cpolar authtoken**，账号有在线会话/隧道数上限。所有隧道**只能**由 **root systemd 的 `cpolar start-all`（或 supervisor）一个实例**统一托管（`cpolar.yml` 里各隧道设 `start_type: enable`）。**禁止**任何项目 / 脚本 / agent 用 `nohup cpolar http`、`cpolar start`、`cpolar start-all` 自起隧道——自起会与托管实例**抢注同名隧道**（云端 last-writer-wins 来回踢），且 cpolar 守护化后 reparent 到 PID1、`$!`/TPID 杀不掉旧实例 → **僵尸越堆越多** → 超账号会话上限 → 云端**不确定地踢隧道**，把**别项目**的隧道误踢成 404/502。
- **加隧道 / 自愈的正确姿势**：新增隧道 → 改 `/usr/local/etc/cpolar/cpolar.yml` 设 `start_type: enable` 后 `sudo systemctl restart cpolar`；隧道级自愈 → cpolar 看门狗只允许**重启托管服务**（`sudo systemctl restart cpolar` / `sudo supervisorctl restart cpolar`），**绝不 nohup 自起**。
- **硬闸门**：机器上装了 `cpolar` shim（拦截 `http/start/start-all` 等起隧道命令、只放行只读命令，systemd 经 `CC_CPOLAR_ALLOW=1` 放行），手起会被直接拒绝；确有必要绕过用 `CC_CPOLAR_ALLOW=1 cpolar …`（正常禁止）。
- **只探隧道、不重启业务**：cpolar 看门狗**不得**去重启业务服务；反过来，业务服务死活归 §7，且 **§7 看门狗只探本机回环、任何时候都不探 cpolar**（见 §7 铁律）。两个看门狗各管一个故障域，互不越界。

### §10 数据库：本地/生产双库与 SSH 隧道

- **本地开发连远程库**：用 SSH 隧道把远程 MySQL NAT 到本机端口，代码连 `127.0.0.1:<本地端口>`：
```bash
# scripts/db-tunnel.sh
LOCAL_PORT=${LOCAL_PORT:-19193}
ssh -N -L ${LOCAL_PORT}:127.0.0.1:3306 <user>@<db_host> &
```
- **生产库**：独立配置、不走隧道。
- **`.env` 明确区分**：`DB_HOST_LOCAL`（隧道端口）vs `DB_HOST_PROD`，并注明**哪个是唯一真相源**。
- **部署 SOP**：首次部署核对两处库数据一致性，切换前 `mysqldump` 备份；隧道口令/凭据放 `.env`（git ignore），不入库。

### §11 大文件库全文检索（SQLite FTS5，可选）

当 `docs/` 或素材库体量大（> 1GB / 上万文件）、需频繁检索时，用 **SQLite FTS5 全文索引**替代 `find`/`grep`：
```bash
.venv/bin/python kb/kb_build.py            # 构建/增量更新索引（数据变动后跑）
.venv/bin/python kb/kb_search.py 关键词 --in content   # 按内容检索
.venv/bin/python kb/kb_search.py <md5> --in md5        # MD5 精确定位
```
- 支持：内容全文检索、MD5 精确查、损坏文件标记、增量重建。
- 数据有增删改后**必须**重跑 `kb_build.py`（增量），否则检索结果过期。

### §12 长文档处理：分块与证据定位（双侧引证，强制）

LLM 处理长文档（招标文件、合同、法规等）时：
- **禁止一次灌入全文**：改用**分块** + 逐块处理（单块建议 < 4K tokens，按实际 context 调整）。
- **每条结论都要带证据定位**：注明来源位置 + 原文摘段 + 依据条款，便于溯源核验：
```json
{"conclusion":"...", "location":"第12页/第3.2条", "evidence":"原文摘段…", "rule_id":"B1-05"}
```
- **软规则判定须「双侧引证」**：对「是否满足某要求」这类判断，正反两方（要求方原文 + 应答方原文）都要给出原文定位，不能只引一侧。
- E2E / 校验须验证：每条结论都能反查到原文依据。

### §13 确定性编排器复用（长流程自动化）

涉及多步长流程自动化时，用**确定性编排器（DAG / pipeline）**，LLM 只负责单个节点的执行，不负责流程控制：
- 标准部件：`checkpoint 续跑`、`看门狗`、`校验闸门`、`漏项回滚`。
- 状态落盘 `state.json`，支持中断续跑。
- 参考实现（如需接入，复制其 `runner.py` + `pipeline.py` + `state.json` 骨架）：`~/PycharmProjects/招投标一件事/backend/orchestrator/`。

### §14 项目问题清单闭环（长周期项目可选）

长周期、问题多的项目维护一份**问题清单**（JSON/HTML），形成「发现→录入→解决→改状态→推钉钉」闭环：
- 记录字段：`title / category / summary / status / material / date`。
- AI 发现问题时**主动录入**（分类 + 优先级 + 状态），解决后改状态。
- 清单变更后自动同步到固定链接（可用 PostToolUse hook 上传）。
- 简单项目用 GitHub Issues 代替即可，不必自建。

### §15 Portal 多入口一致化（平台型项目可选）

若项目对外有多种入口（网页手工操作 / REST API 批量 / 钉钉群接入），它们**必须共用同一套后端编排器、数据库、报告模板**，避免逻辑漂移：
- API 的一次 dispatch 应**等价于**钉钉群里的一次触发（同一份输入，三种入口结果一致）。
- 提供 dispatch 等价性测试；对外 API 用 OpenAPI/Swagger 自动生成文档。

### §16 宿主机 sshpass 直连与同一挂载唯一真相源（强制）

> **2026-08-29 宿主机变更**：宿主机由旧 GPU 机（`fangnangpu` / `192.168.8.43`，双 RTX 5090）**切换为新宿主机 `120.79.142.141`**（阿里云，即卫星机）。旧 GPU 机全部信息作废（当前 SSH 握手亦被拒）。**新宿主机无 GPU**——需 GPU 算力（模型/OCR/CUDA）的任务这台做不了。

本项目宿主机 = **`120.79.142.141`**（root / `qczy3PbfVJFpoc`，阿里云 4核7.3G，与启程智远同栈共用）。**本容器就跑在这台宿主机上**，与其**共享同一目录**：
`/home/fangnan/PycharmProjects/u667a-u8fdc-u529b-u4f01-saas`（转义名，非中文）。**这是唯一真相源**——容器里改代码，宿主机上同步生效。

**① 免拷贝（铁律）**：**禁止** scp/rsync/上传把文件再往宿主机拷一份。直接在本地路径编辑/生成，宿主机侧 `cat` 立即可见。已用标记文件验证过挂载一致（在容器建标记 → 宿主机同路径可见）。

**② 连接方式（强制·统一走 poc_ssh.sh，不再手拼 sshpass）**：
```bash
# 登录/执行（专用密钥优先，回退 deploy/secrets/poc-server.env 里的 root 密码；
# 固定 KexAlgorithms=diffie-hellman-group14-sha256 绕阿里云握手坑）
scripts/poc_ssh.sh 'hostname; free -h | head -2; docker ps --format "{{.Names}}"'
scripts/poc_ssh.sh                          # 交互式登录
scripts/gpu_ssh.sh 'docker ps'              # 兼容别名，等价于 poc_ssh.sh
```
| 项 | 值 |
|---|---|
| 主机 / IP | 新宿主机 `120.79.142.141`（阿里云；旧 GPU 机 `192.168.8.43` 已弃用） |
| 登录用户 / 密码 | `root` / `qczy3PbfVJFpoc`（放 `deploy/secrets/poc-server.env`，勿硬编码进 git） |
| 硬件 | 4核7.3G（~3.7G 可用，**内存紧**）、**无 GPU**、磁盘 ~13G 余 |
| 共享目录 | `/home/fangnan/PycharmProjects/u667a-u8fdc-u529b-u4f01-saas`（容器 = 宿主机同一物理目录） |
| 同机共用 | 启程智远 `qczy-*`、`codekb-*`、`cc-qwen`——起服务须限内存、严防 OOM 误伤（§6） |
| 工具链 | JDK8(1.8.0_492)、JDK17(dragonwell)、Maven、Node v22.23.0、docker |

**③ 在宿主机上跑构建/运行**：
```bash
scripts/poc_ssh.sh 'cd /home/fangnan/PycharmProjects/u667a-u8fdc-u529b-u4f01-saas && \
     java -jar backend/yudao-server/target/yudao-server.jar --spring.profiles.active=local'
```
> **内存紧铁律**：跑 Java 服务务必加 `-Xmx1g` 之类堆上限并监控 `free -h`，避免触发 OOM-killer 误杀同机 `qczy-*`/`cc-*` 容器。

**④ 旧 GPU 机（`192.168.8.43`）取历史数据的兜底**：旧机已弃用且当前 SSH 握手被拒（`kex_exchange_identification: Connection closed`），仅**容器侧** TCP22 可达、新宿主机不可达旧机。如确需从旧机取数据（如 dump 旧库），须先让用户恢复旧机 SSH（解封 fail2ban / 重启 sshd），再从容器侧用 OpenSSH `SSH_ASKPASS_REQUIRE=force` 密码方式连（容器非 root 装不了 sshpass）。健康域/隧道域仍遵循 §7/§9 分家原则。

### 文件上传服务器

**接口**：`POST http://106.53.136.31:19000/api/files/upload/`

**标准上传脚本**（4 行 curl）：
```bash
cd /tmp && rm -f cookies.txt
curl -s -c cookies.txt http://106.53.136.31:19000/files/ -o /dev/null
CSRF=$(grep csrftoken cookies.txt | awk '{print $7}')
curl -s -X POST http://106.53.136.31:19000/api/files/upload/ \
  -b cookies.txt \
  -H "X-CSRFToken: $CSRF" \
  -H "Referer: http://106.53.136.31:19000/files/" \
  -F "file=@/tmp/<filename>"
```

### 测试服务器

| 环境 | IP | 用户 | 密码 | 端口 |
|---|---|---|---|---|
| 预发布环境 | `192.168.120.236` | `root` | `2S$8^ey9X91M` | 22 |
| 开发测试环境 | `106.53.136.31` | `root` | `G=x3Dn2wu_9C` | 22 |

**106 MySQL**：`106.53.136.31:3307`（账号 `skillapp`，密码见项目配置）

## 环境变量
参见 `.env.example`。

## 启动方式
参见项目 README.md 与 backend/ 下 Spring Boot 启动说明

## 交付验收流程
1. 功能开发完成
2. 编写 E2E 测试（`e2e/tests/<feature>.spec.ts`）
3. 运行测试并生成截图证据（`e2e/evidence/<feature>/`）
4. 生成 HTML 报告（`npx playwright show-report`）
5. 提交代码（遵循 Git 提交规范）
6. 钉钉推送成果摘要（遵循「§3 钉钉群发送规范」，按 §5 遍历所有绑定群）
7. 更新 `docs/ops/dingtalk-push-log.json`

## 已知限制 & 后续可优化
暂无

---

# 附：启程智远配套部署/域名方案（新增·与上方原方案「并存」）

> 本节由「参考【启程智远的项目】配套同一套部署/域名方案」引入，**与上方原有方案并存**：
> 原方案（cpolar + 106 文件服务 `106.53.136.31:19000` + 钉钉机器人管理后台）**继续保留可用**；
> 本节新增一套**私有化卫星栈**方案作为**首选的文件托管/域名出口**。两套按下述「选用约定」各司其职。
>
> **本项目落地时的三点定制**（用户已拍板）：
> 1. **文件托管/域名**：与启程智远**共用同一台卫星服务器 `120.79.142.141`**，但用本项目**独立桶 `liqi-attachments`**，对外直链 `http://120.79.142.141/liqi-attachments/<key>`。
> 2. **钉钉推送**：**沿用本项目原绑定群**（见上方 §3/§5：通用通知群 webhook + 管理后台 `push_to_group.py`），**不**引入启程智远的加签机器人。
> 3. **铁律落地**：新旧两套方案**并存追加**，非替换。

## 选用约定（新旧方案怎么各司其职）

| 能力 | 首选（本节新方案） | 兜底/保留（原方案） |
|---|---|---|
| 文件/网页托管、对外直链 | **MinIO 桶 `liqi-attachments` + Nginx 网关 `120.79.142.141`** | 106 文件服务 `106.53.136.31:19000`（原 §「文件上传服务器」） |
| 说明/报告/发版通知落地 | skill `publish-webpage-and-notify`（网页→MinIO→推群） | — |
| 钉钉推送目标群 | **本项目原绑定群**（§3/§5，正文含「AI」） | 同左（推送目标不变） |
| 宿主机构建/跑服务 | `scripts/poc_ssh.sh`（=`gpu_ssh.sh` 别名）直连新宿主机 `120.79.142.141`（§16；**无 GPU**，需卡任务另备机） | 同左 |
| 数据库/缓存 | 卫星栈 MySQL8/Redis7（`deploy/secrets/poc-server.env`） | 原 §10 双库/隧道方案 |

## 🔴 铁律 1 · 一切「说明」都要出网页并推项目群（不可违反）

凡向用户交付「说明/讲解/汇报/分析/方案/清单/进展/验收」等成体系解释性内容，必须先生成
可访问 HTML → 传本项目 MinIO（桶 `liqi-attachments`）拿 Nginx 直链 → 以合规 markdown 推
**本项目原绑定群**。不允许只在对话里回纯文字。纯一问一答/命令回显/追问澄清可不推。
（用 skill `publish-webpage-and-notify` 一步到位。）

## 🔴 铁律 2 · 部署/改动后必须做「带截图 E2E」并逐张识图（不可违反）

任何一次部署、发版、改代码/配置/库/nginx 之后，都要用真实浏览器登录逐页截图（见 `e2e/`），
**逐张识别**确认是「正常渲染的成功页面」，严禁把 loading/骨架屏/空白/报错页当成功。产出归档并按发版铁律推群。

## 🔴 铁律 3 · 里程碑/发版必推项目群 + 推送格式（不可违反）

任何里程碑或发版（测试/正式）都必须推**本项目原绑定群**。格式硬性要求：
- **markdown**，正文**含「AI」**，**正文 ≤ 100 字**（不含链接文本与 URL）；
- **必带两个超链接**（`[文字](URL)`，经网关直链）：① 📄 文档链接；② 🖥️ 系统链接；
- 推送失败必须排查补发。合规示例：
  ```bash
  python3 ~/.claude/skills/查找钉钉机器人绑定群/scripts/push_to_group.py --project 智远力企-saas \
  "### AI 通知 · 【里程碑】xxx v1.0
  环境 测试 · 变更：xxx。
  📄 [查看报告](http://120.79.142.141/liqi-attachments/reports/x.html) ｜ 🖥️ [访问系统](http://…)"
  ```

## 🔴 铁律 4 · 系统地址「外网可正常访问」才算开发完成（不可违反）

**任何开发/发版，只有当对外系统地址能被真实打开访问，才算「开发完成」**——代码写完、E2E 本地通过都不等于完成。收尾前必须做「访问可达性校验」，不可达就先修隧道/服务再交付，**严禁**在链路断的情况下把地址甩给用户。
- **强制自检步骤**（每次交付/发版前跑）：
  1. **HTTP 可达**：`curl -s -o /dev/null -w "%{http_code}" http://120.79.142.141:8000/` 必须 `200`；
  2. **是真应用非错误页**：抓首页要能命中 `<title>力企云SAAS系统</title>` / `<div id="app">`，并且入口 JS（`/assets/index-*.js`）单独请求也 `200`、`size>0`（免费隧道/反滥用页会返回体积很小的拦截 HTML，见 §9 踩坑）；
  3. **链路自愈确认**：外网入口链路 = 卫星 `socat 0.0.0.0:8000→127.0.0.1:18090` ← GPU 反向隧道 `ssh -R 18090:localhost:5180`，守护脚本 `scripts/liqi-tunnel-keeper.sh`（GPU nohup）。不可达时先查 GPU 上 keeper/`ssh -R 18090` 进程是否在、`5180` 源是否活，按需重启守护脚本；隧道**间歇抖动**属常态，交付时点必须现场复测通过。
- **给用户的地址必须是复测当下可达的**；若确认链路不稳，需在交付说明里注明「隧道偶发抖动，断了会自动重连；如打不开稍等或告知我重启」。
- 与铁律 2/3 配套：铁律 2 管「部署后逐页截图识图」，本铁律管「对外地址真实可达」，两者都过才推群（铁律 3）。

## 🛰️ 私有化卫星服务（= 本项目新宿主机，与启程智远共用服务器，本项目独立桶）

- **服务器**：`120.79.142.141`（阿里云，**本项目新宿主机**，root/`qczy3PbfVJFpoc`），启程智远栈在 `/opt/qczy-poc/`；本容器亦跑在此机、共享 PycharmProjects 挂载（见 §16）。
- **服务**：MySQL 8（:3306，启程智远）、Redis 7（:6379，启程智远）、MinIO（:9000 API/:9001 控制台，**本项目桶 `liqi-attachments`**）、Nginx 网关（:80）。**本项目力企云自用** DB 走独立容器 `liqi-mysql`(:3316)/`liqi-redis`(:6399)，不碰启程智远的 3306/6379。
- **凭据**（集中 `deploy/secrets/`，已 `.gitignore`）：`poc-server.env`（SSH+MySQL+Redis+MinIO；亦即新宿主机 root 登录凭据）、SSH 私钥。（旧 `gpu-server.env` 随旧 GPU 机弃用而作废。）
- **登录**：`scripts/poc_ssh.sh`（专用密钥优先，回退密码；固定 `KexAlgorithms=diffie-hellman-group14-sha256` 绕过阿里云握手坑）。
- **上传**：`scripts/publish_minio.sh <本地文件> <key>` → 直链 `http://120.79.142.141/liqi-attachments/<key>`。
- 详见 `deploy/README.md`。

## 配套脚本与 skill 清单（本次从启程智远拷入）

| 路径 | 用途 |
|---|---|
| `scripts/poc_ssh.sh` | 一键登录**新宿主机 `120.79.142.141`**（=卫星机；密钥/密码回退 + 阿里云 KEX 修复） |
| `scripts/gpu_ssh.sh` | **兼容别名**，透明转发到 `poc_ssh.sh`（旧 GPU 机 `192.168.8.43` 已弃用） |
| `scripts/publish_minio.sh` | 上传文件到 MinIO 桶 `liqi-attachments`，回 Nginx 直链 |
| `scripts/notify_dingtalk.sh` | 加签 webhook 通用推送工具（**默认不用**，仅本项目另建加签机器人时用） |
| `.claude/skills/publish-webpage-and-notify/` | 网页→MinIO→推本项目群 的标准三步 |
| `.claude/skills/会话限制排查与解除/` | 权限弹窗/沙箱拦网络/SSH 握手卡死 的根因与修复 |
| `.claude/settings.json` | 权限白名单（放行 sshpass/ssh/docker/curl 等，沙箱拦网络自动放过） |
| `deploy/README.md` | 卫星服务栈说明与运维 |

## 测试账号（启程智远同栈默认，本项目按实际调整）

`18888888888` / `Qc@123456`（图形验证码 `qcwl` 触发后端旁路）——如与本项目芋道底座不一致，以本项目实际账号为准。
