#!/usr/bin/env bash
# 智远力企-saas —— 加签 webhook 钉钉通知（通用工具，从启程智远搬来）
# ⚠️ 本项目钉钉推送默认「沿用原绑定群」：走原 CLAUDE.md §3/§5 的通用通知群 webhook
#    与「钉钉机器人管理后台」push_to_group.py（见原 CLAUDE.md）。本脚本仅在为本项目
#    另建「加签」机器人后才需要（把 token/secret 填入 scripts/dingtalk.env）。
# 用法：
#   scripts/notify_dingtalk.sh "正文内容"                 # 纯文本
#   scripts/notify_dingtalk.sh -t "发版通知" "正文内容"    # markdown（带标题）
#   echo "多行内容" | scripts/notify_dingtalk.sh -t "标题" -   # 从 stdin 读正文
#   scripts/notify_dingtalk.sh --dry-run "正文"           # 只打印签名后的 URL/载荷，不发送
#
# 凭据从 scripts/dingtalk.env 读取（ACCESS_TOKEN / SECRET），也可用同名环境变量覆盖。
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ENV_FILE="${DINGTALK_ENV_FILE:-$SCRIPT_DIR/dingtalk.env}"
[[ -f "$ENV_FILE" ]] && source "$ENV_FILE"

: "${ACCESS_TOKEN:?缺少 ACCESS_TOKEN（请在 $ENV_FILE 中配置）}"
: "${SECRET:?缺少 SECRET（加签密钥，请在 $ENV_FILE 中配置）}"

TITLE=""
DRY_RUN=0
POSITIONAL=()
while [[ $# -gt 0 ]]; do
  case "$1" in
    -t|--title) TITLE="$2"; shift 2 ;;
    --dry-run)  DRY_RUN=1; shift ;;
    -h|--help)  grep '^#' "${BASH_SOURCE[0]}" | sed 's/^# \{0,1\}//'; exit 0 ;;
    *)          POSITIONAL+=("$1"); shift ;;
  esac
done

CONTENT="${POSITIONAL[0]:-}"
if [[ "$CONTENT" == "-" || -z "$CONTENT" ]]; then
  CONTENT="$(cat)"
fi
[[ -z "$CONTENT" ]] && { echo "错误：正文为空" >&2; exit 2; }

# --- 加签：sign = urlEncode(base64(HMAC-SHA256(secret, "{timestamp}\n{secret}"))) ---
TS="$(date +%s%3N)"
SIGN_RAW="$(printf '%s\n%s' "$TS" "$SECRET" \
  | openssl dgst -sha256 -hmac "$SECRET" -binary | base64 -w0)"

urlencode() {
  local s="$1" i c out=""
  for (( i=0; i<${#s}; i++ )); do
    c="${s:i:1}"
    case "$c" in
      [a-zA-Z0-9.~_-]) out+="$c" ;;
      *) printf -v c '%%%02X' "'$c"; out+="$c" ;;
    esac
  done
  printf '%s' "$out"
}
SIGN="$(urlencode "$SIGN_RAW")"
URL="https://oapi.dingtalk.com/robot/send?access_token=${ACCESS_TOKEN}&timestamp=${TS}&sign=${SIGN}"

json_escape() {
  local s="$1"
  s="${s//\\/\\\\}"; s="${s//\"/\\\"}"
  s="${s//$'\r'/}"; s="${s//$'\n'/\\n}"; s="${s//$'\t'/\\t}"
  printf '%s' "$s"
}

if [[ -n "$TITLE" ]]; then
  PAYLOAD="{\"msgtype\":\"markdown\",\"markdown\":{\"title\":\"$(json_escape "$TITLE")\",\"text\":\"$(json_escape "$CONTENT")\"}}"
else
  PAYLOAD="{\"msgtype\":\"text\",\"text\":{\"content\":\"$(json_escape "$CONTENT")\"}}"
fi

if [[ "$DRY_RUN" == "1" ]]; then
  echo "[dry-run] URL: $URL"
  echo "[dry-run] PAYLOAD: $PAYLOAD"
  exit 0
fi

RESP="$(curl -s -m 10 -H 'Content-Type: application/json' -d "$PAYLOAD" "$URL")"
echo "$RESP"
# errcode:0 视为成功
echo "$RESP" | grep -q '"errcode":0' || { echo "钉钉推送失败" >&2; exit 1; }
