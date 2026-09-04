# 智远力企-saas · 私有化卫星服务（配套启程智远方案）

本目录是本项目的**卫星服务栈**（基础设施依赖）凭据与编排约定。方案与【启程智远的项目】
一致：凡需要 **数据库 / 缓存 / 文件存储 / 网关** 的能力，一律使用这套**私有化部署**服务，
不依赖任何外部第三方服务。

> **与启程智远的关系**：**共用同一台卫星服务器 `120.79.142.141`**，但本项目使用
> **独立 MinIO 桶 `liqi-attachments`**（文件隔离，直链 `http://120.79.142.141:8000/liqi-attachments/<key>`，走力企云自有 8000 链路）。
> 钉钉推送**沿用本项目原绑定群**（见根目录 `CLAUDE.md` §3/§5），不使用启程智远的机器人。

## 一、服务器与访问凭据

| 项 | 值 |
|----|----|
| 服务器 | 阿里云 ECS · 8H16G · Alibaba Cloud Linux 4 |
| 公网 IP | `120.79.142.141` |
| SSH | `root` · 专用密钥 `deploy/secrets/id_poc_ed25519`（后备密码见凭据文件） |
| 栈目录 | 服务器 `/opt/qczy-poc/`（`docker-compose.yml` + `.env`） |

**所有明文凭据集中在一处**（已 `.gitignore`，勿提交）：

```
deploy/secrets/poc-server.env          # SSH + MySQL + Redis + MinIO 全部密钥
deploy/secrets/gpu-server.env          # GPU 服务器 root 密码（sshpass 直连）
deploy/secrets/id_poc_ed25519(.pub)    # 卫星服务器专用 SSH 私钥（已装入 authorized_keys）
deploy/secrets/id_poc_login_ed25519(.pub)  # 免密登录专用独立密钥
deploy/secrets/*.example               # 模板（可提交）
```

加载凭据到环境变量：`set -a; . deploy/secrets/poc-server.env; set +a`
一键登录：`scripts/poc_ssh.sh`（优先用专用密钥，回退密码）或 `scripts/poc_ssh.sh 'docker ps'`
GPU 直连：`scripts/gpu_ssh.sh 'nvidia-smi'`

> ⭐ 阿里云 SSH 握手坑：中间设备会丢弃默认 curve25519 的 KEX 大包导致握手卡死，脚本已固定
> `KexAlgorithms=diffie-hellman-group14-sha256`（勿删）。详见 skill `会话限制排查与解除`。

## 二、卫星服务清单

| 服务 | 版本 | 端口 | 用途 | 关键连接 |
|------|------|------|------|----------|
| **MySQL** | 8.0.46 | 3306 | 业务库 | 见 `poc-server.env` · utf8mb4 · 时区 +08:00 |
| **Redis** | 7 | 6379 | 缓存/会话/队列 | 已 `requirepass` · AOF 持久化 |
| **MinIO** | latest | 9000 / 9001 | 对象存储 | S3 兼容 · **本项目桶 `liqi-attachments`** · 控制台 :9001 |
| **Nginx** | 1.27 | 80 | 启程 `qczy-nginx` 共享网关 | `/healthz`=ok · **力企云文件不走它**（曾因缺 `qczy-api-nginx` 上游整容器崩溃、80 失联连坐） |
| **liqi-nginx** | 1.27 | 5180→socat:8000 | **力企云自有网关** | host 网络 · `/liqi-attachments/` 反代 `127.0.0.1:9000` MinIO · 对外 `:8000` |

## 三、本项目如何使用（约定）

- **文件上传/托管/预览**：产物用 `scripts/publish_minio.sh <本地文件> <key>` 传到 MinIO 桶
  `liqi-attachments`，对外一律用力企云自有 8000 链路直链
  `http://120.79.142.141:8000/liqi-attachments/<key>`（`:9000` 不对外；**不用**无端口 `:80`，
  那是启程 `qczy-nginx` 共享网关，崩溃会连坐）。`webapp-demo-video`、`drissionpage-server` 等产文件的 skill 同此约定。
- **说明/汇报/报告**：走 skill `publish-webpage-and-notify`（网页→MinIO→推本项目原绑定群）。
- **需算力的构建/推理**：一律 `scripts/gpu_ssh.sh` 在 GPU 服务器（`192.168.8.43`，双 RTX 5090）上跑，
  同一挂载即唯一真相源，改完即生效，禁止二次拷贝。

## 四、运维

```bash
# 起停 / 状态（在服务器 /opt/qczy-poc 下）
scripts/poc_ssh.sh 'cd /opt/qczy-poc && docker compose ps'
# S3 快捷操作（服务器上，容器内已带 mc）
scripts/poc_ssh.sh 'docker exec qczy-minio mc ls local'
scripts/poc_ssh.sh 'docker exec qczy-minio mc mb -p local/liqi-attachments'
```

## 五、安全提示

ECS 安全组若 MySQL/Redis 裸露公网属高危。已设强随机口令，仍建议安全组仅放行
`80/9000/9001`，把 `3306/6379` 限可信 IP 或改绑 `127.0.0.1` 只经 SSH 隧道访问。
