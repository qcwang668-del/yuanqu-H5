#!/usr/bin/env bash
# 上传文件到 106.53.136.31:19000 文件服务。
#
# 【默认使用固化链接（固定名字）—— 首选方案】
#   文件服务上传接口支持 multipart 字段 `filename=<自定义名>`：
#     · 传了 filename → 返回固定 URL  /media/<自定义名>.html（不带扩展名后端自动补原扩展名）
#     · 同名再传 → 覆盖旧文件、id 不变、URL 不变（内容更新、链接不变，适合反复迭代同一份文档）
#     · 不传 filename → 后端用随机 UUID 命名（旧行为）
#
# 【固化名命名铁律】必须带项目名等显著特征前缀，避免跨项目/跨文档重名互相覆盖：
#     固化名 = 显式第二参数  优先
#            否则 = ${UPLOAD_NAME_PREFIX}-<文件名去扩展名的 slug>
#     UPLOAD_NAME_PREFIX 从环境变量或 .env 读取（init-project 按项目 slug 生成，如 proj-slug）。
#     无法得到合法 ascii 固化名时，自动回退随机 UUID 并给出提示。
#
# 用法:
#   scripts/upload-file.sh <文件路径> [固化名]      # 固化(默认)；省略固化名则用 前缀+文件名 自动生成
#   scripts/upload-file.sh --random <文件路径>      # 强制随机 UUID（不固化）
set -euo pipefail

FIXED=1
if [ "${1:-}" = "--random" ]; then FIXED=0; shift; fi

FILE_PATH="${1:-}"
CUSTOM_NAME="${2:-}"

[ -n "$FILE_PATH" ] && [ -f "$FILE_PATH" ] || {
  echo "用法: $0 <文件路径> [固化名]   |   $0 --random <文件路径>"; exit 1; }

UPLOAD_URL="${FILE_UPLOAD_URL:-http://106.53.136.31:19000/api/files/upload/}"
FILE_PAGE_URL="${FILE_PAGE_URL:-http://106.53.136.31:19000/files/}"
BASE="${UPLOAD_URL%%/api/*}"

slugify() { echo "$1" | tr 'A-Z' 'a-z' | sed -E 's/[^a-z0-9]+/-/g; s/^-+//; s/-+$//'; }

# ---- 计算固化名（带项目前缀、避免重名）----
if [ "$FIXED" = "1" ] && [ -z "$CUSTOM_NAME" ]; then
  PREFIX="${UPLOAD_NAME_PREFIX:-}"
  if [ -z "$PREFIX" ]; then
    for envf in "$(dirname "$FILE_PATH")/.env" "$(dirname "$FILE_PATH")/../.env" ".env"; do
      if [ -f "$envf" ]; then
        v=$(grep -E '^UPLOAD_NAME_PREFIX=' "$envf" | tail -1 | cut -d= -f2- | tr -d '"'\''')
        [ -n "$v" ] && { PREFIX="$v"; break; }
      fi
    done
  fi
  STEM=$(basename "$FILE_PATH"); STEM="${STEM%.*}"; STEM_SLUG=$(slugify "$STEM")
  if [ -n "$PREFIX" ] && [ -n "$STEM_SLUG" ]; then
    CUSTOM_NAME="${PREFIX}-${STEM_SLUG}"
  elif [ -n "$PREFIX" ]; then
    CUSTOM_NAME="${PREFIX}-$(echo "$FILE_PATH" | md5sum | cut -c1-6)"
  else
    echo "⚠️  未设置 UPLOAD_NAME_PREFIX 且文件名无 ascii 特征，无法生成带项目特征的固化名，回退随机 UUID。"
    echo "    建议：在 .env 设 UPLOAD_NAME_PREFIX=<项目slug>，或显式传第二参数固化名。"
    FIXED=0
  fi
fi

# ---- CSRF ----
COOKIE_FILE=$(mktemp); trap 'rm -f "$COOKIE_FILE"' EXIT
curl -fsS -c "$COOKIE_FILE" "$FILE_PAGE_URL" -o /dev/null
CSRF=$(grep csrftoken "$COOKIE_FILE" | awk '{print $7}')
[ -n "$CSRF" ] || { echo "无法获取 CSRF token"; exit 1; }

# ---- 上传 ----
if [ "$FIXED" = "1" ]; then
  echo "上传（固化链接）: $FILE_PATH  →  filename=$CUSTOM_NAME"
  RESP=$(curl -fsS -X POST "$UPLOAD_URL" -b "$COOKIE_FILE" \
    -H "X-CSRFToken: $CSRF" -H "Referer: $FILE_PAGE_URL" \
    -F "file=@$FILE_PATH" -F "filename=$CUSTOM_NAME")
else
  echo "上传（随机名）: $FILE_PATH"
  RESP=$(curl -fsS -X POST "$UPLOAD_URL" -b "$COOKIE_FILE" \
    -H "X-CSRFToken: $CSRF" -H "Referer: $FILE_PAGE_URL" \
    -F "file=@$FILE_PATH")
fi

URL_PATH=$(echo "$RESP" | sed -n 's/.*"url"[[:space:]]*:[[:space:]]*"\([^"]*\)".*/\1/p')
if [ -n "$URL_PATH" ]; then
  echo "✅ 上传成功：$BASE$URL_PATH"
  [ "$FIXED" = "1" ] && echo "   （固化链接：同名再传即覆盖、URL 不变）"
else
  echo "❌ 上传失败：$RESP"; exit 1
fi
