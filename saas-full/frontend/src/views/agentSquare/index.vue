<template>
  <div class="agent-square">
    <!-- 广场视图：智能体卡片 -->
    <div v-if="!currentAgent" class="square-wrap">
      <div class="square-header">
        <h2>智能体广场</h2>
        <p>选择一个智能体，开始对话</p>
      </div>
      <el-row :gutter="20" v-loading="loadingAgents">
        <el-col v-for="agent in agents" :key="agent.id" :xs="24" :sm="12" :md="8" :lg="8" :xl="6">
          <el-card class="agent-card" shadow="hover" @click="enterAgent(agent)">
            <div class="agent-card-body">
              <el-avatar :size="56" class="agent-avatar">
                {{ avatarText(agent.name) }}
              </el-avatar>
              <div class="agent-meta">
                <div class="agent-name">
                  {{ agent.name }}
                  <el-tag v-if="agent.mcpEnabled" size="small" type="success" effect="plain">已接工具</el-tag>
                  <el-tag v-else size="small" type="info" effect="plain">咨询</el-tag>
                </div>
                <div class="agent-desc">{{ agent.description }}</div>
              </div>
            </div>
            <el-button type="primary" class="agent-start-btn" round>开始对话</el-button>
          </el-card>
        </el-col>
      </el-row>
      <el-empty v-if="!loadingAgents && agents.length === 0" description="暂无可用智能体" />
    </div>

    <!-- 对话视图 -->
    <div v-else class="chat-wrap">
      <div class="chat-side">
        <el-button class="back-btn" text @click="backToSquare">
          <el-icon><ArrowLeft /></el-icon>&nbsp;智能体广场
        </el-button>
        <div class="side-agent">
          <el-avatar :size="40" class="agent-avatar">{{ avatarText(currentAgent.name) }}</el-avatar>
          <div class="side-agent-name">{{ currentAgent.name }}</div>
        </div>
        <el-button type="primary" plain class="new-conv-btn" @click="newConversation">＋ 新会话</el-button>
        <div class="conv-list">
          <div
            v-for="c in conversations"
            :key="c.id"
            class="conv-item"
            :class="{ active: c.id === conversationId }"
            @click="selectConversation(c.id)"
          >
            {{ c.title || '新会话' }}
          </div>
        </div>
      </div>

      <div class="chat-main">
        <div class="chat-messages" ref="messageBox">
          <div v-for="(m, idx) in messages" :key="idx" class="msg-row" :class="m.role">
            <el-avatar v-if="m.role === 'assistant'" :size="36" class="msg-avatar">
              {{ avatarText(currentAgent.name) }}
            </el-avatar>
            <div class="msg-bubble">
              <div v-if="m.toolCalls && m.toolCalls.length" class="tool-chips">
                <div v-for="(t, ti) in m.toolCalls" :key="ti" class="tool-chip">
                  <el-icon class="tool-ico"><Tools /></el-icon>
                  <span class="tool-name">{{ t.name }}</span>
                  <el-tag v-if="t.status === 'calling'" size="small" type="warning">调用中…</el-tag>
                  <el-tag v-else-if="t.status === 'done'" size="small" type="success">已取数</el-tag>
                  <el-tag v-else size="small" type="danger">失败</el-tag>
                </div>
              </div>
              <div v-if="m.role === 'assistant'" class="msg-md">
                <MarkdownView v-if="m.content" :content="m.content" />
                <span v-else-if="m.loading" class="thinking">
                  <el-icon class="is-loading"><Loading /></el-icon>&nbsp;思考中…
                </span>
              </div>
              <div v-else class="msg-text">{{ m.content }}</div>
            </div>
            <el-avatar v-if="m.role === 'user'" :size="36" class="msg-avatar user-avatar">我</el-avatar>
          </div>
        </div>

        <div class="chat-input">
          <el-input
            v-model="input"
            type="textarea"
            :rows="2"
            resize="none"
            :placeholder="`向「${currentAgent.name}」提问…`"
            @keydown.enter.exact.prevent="doSend"
          />
          <el-button type="primary" class="send-btn" :loading="sending" @click="doSend">发送</el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, nextTick } from 'vue'
import { ArrowLeft, Tools, Loading } from '@element-plus/icons-vue'
import MarkdownView from '@/components/MarkdownView/index.vue'
import { AgentApi, AgentVO } from '@/api/liqi/agent'

interface ChatMsg {
  role: 'user' | 'assistant'
  content: string
  loading?: boolean
  toolCalls?: { name: string; status: string; summary?: string }[]
}

const loadingAgents = ref(false)
const agents = ref<AgentVO[]>([])
const currentAgent = ref<AgentVO | null>(null)
const conversations = ref<any[]>([])
const conversationId = ref<number | null>(null)
const messages = ref<ChatMsg[]>([])
const input = ref('')
const sending = ref(false)
const messageBox = ref<HTMLElement>()

const avatarText = (name?: string) => (name ? name.slice(0, 1) : 'AI')

const loadAgents = async () => {
  loadingAgents.value = true
  try {
    agents.value = await AgentApi.getAgentList()
  } finally {
    loadingAgents.value = false
  }
}
loadAgents()

const scrollBottom = () => {
  nextTick(() => {
    if (messageBox.value) messageBox.value.scrollTop = messageBox.value.scrollHeight
  })
}

const enterAgent = async (agent: AgentVO) => {
  currentAgent.value = agent
  conversationId.value = null
  messages.value = []
  await loadConversations()
}

const backToSquare = () => {
  currentAgent.value = null
  conversationId.value = null
  messages.value = []
}

const loadConversations = async () => {
  if (!currentAgent.value) return
  conversations.value = await AgentApi.getConversationList(currentAgent.value.id)
}

const newConversation = () => {
  conversationId.value = null
  messages.value = []
}

const selectConversation = async (id: number) => {
  conversationId.value = id
  const list = await AgentApi.getMessageList(id)
  messages.value = list
    .filter((m: any) => m.role === 'user' || m.role === 'assistant')
    .map((m: any) => ({
      role: m.role,
      content: m.content || '',
      toolCalls: m.toolCalls ? safeParseTools(m.toolCalls) : []
    }))
  scrollBottom()
}

const safeParseTools = (s: string) => {
  try {
    const arr = JSON.parse(s)
    return Array.isArray(arr) ? arr.map((t: any) => ({ name: t.name, status: 'done', summary: t.result })) : []
  } catch {
    return []
  }
}

const doSend = async () => {
  const content = input.value.trim()
  if (!content || sending.value || !currentAgent.value) return
  input.value = ''
  messages.value.push({ role: 'user', content })
  const aiMsg: ChatMsg = { role: 'assistant', content: '', loading: true, toolCalls: [] }
  messages.value.push(aiMsg)
  sending.value = true
  scrollBottom()

  const ctrl = new AbortController()
  AgentApi.sendStream(
    currentAgent.value.id,
    conversationId.value,
    content,
    ctrl,
    (ev: any) => {
      let data: any
      try {
        data = JSON.parse(ev.data)
      } catch {
        return
      }
      if (data.type === 'conversation') {
        conversationId.value = data.conversationId
        loadConversations()
      } else if (data.type === 'content') {
        aiMsg.loading = false
        aiMsg.content += data.delta || ''
        scrollBottom()
      } else if (data.type === 'tool') {
        aiMsg.loading = false
        const existing = aiMsg.toolCalls!.find((t) => t.name === data.name && t.status === 'calling')
        if (existing) {
          existing.status = data.status
          existing.summary = data.summary
        } else {
          aiMsg.toolCalls!.push({ name: data.name, status: data.status, summary: data.summary })
        }
        scrollBottom()
      } else if (data.type === 'done') {
        aiMsg.loading = false
        sending.value = false
        ctrl.abort()
      } else if (data.type === 'error') {
        aiMsg.loading = false
        console.warn('[智能体] 后端错误:', data.msg)
        aiMsg.content = aiMsg.content || '⚠️ AI 服务暂时不可用，请稍后重试；若多次失败请联系管理员。'
        sending.value = false
        ctrl.abort()
      }
    },
    (err: any) => {
      // 出错：终止，避免 fetch-event-source 自动重连
      aiMsg.loading = false
      if (!aiMsg.content) aiMsg.content = '⚠️ 连接中断，请重试'
      sending.value = false
      ctrl.abort()
    },
    () => {
      sending.value = false
    }
  )
}
</script>

<style scoped>
.agent-square {
  height: 100%;
}
.square-wrap {
  padding: 12px;
}
.square-header h2 {
  margin: 4px 0;
}
.square-header p {
  color: #909399;
  margin: 0 0 16px;
}
.agent-card {
  margin-bottom: 20px;
  cursor: pointer;
  border-radius: 12px;
}
.agent-card-body {
  display: flex;
  gap: 14px;
  align-items: flex-start;
}
.agent-avatar {
  background: linear-gradient(135deg, #409eff, #67c23a);
  color: #fff;
  font-size: 22px;
  flex-shrink: 0;
}
.agent-meta {
  flex: 1;
}
.agent-name {
  font-size: 16px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 8px;
}
.agent-desc {
  color: #606266;
  font-size: 13px;
  margin-top: 8px;
  line-height: 1.6;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.agent-start-btn {
  width: 100%;
  margin-top: 14px;
}
.chat-wrap {
  display: flex;
  height: calc(100vh - 120px);
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid #ebeef5;
}
.chat-side {
  width: 240px;
  border-right: 1px solid #ebeef5;
  padding: 12px;
  background: #fafbfc;
  display: flex;
  flex-direction: column;
}
.back-btn {
  justify-content: flex-start;
  padding-left: 0;
  margin-bottom: 8px;
}
.side-agent {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 4px 12px;
}
.side-agent-name {
  font-weight: 600;
  font-size: 15px;
}
.new-conv-btn {
  margin-bottom: 10px;
}
.conv-list {
  flex: 1;
  overflow-y: auto;
}
.conv-item {
  padding: 9px 10px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 13px;
  color: #606266;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.conv-item:hover {
  background: #f0f2f5;
}
.conv-item.active {
  background: #ecf5ff;
  color: #409eff;
}
.chat-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: #fff;
}
.chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
}
.msg-row {
  display: flex;
  gap: 10px;
  margin-bottom: 18px;
  align-items: flex-start;
}
.msg-row.user {
  flex-direction: row-reverse;
}
.msg-avatar {
  flex-shrink: 0;
}
.user-avatar {
  background: #909399;
  color: #fff;
}
.msg-bubble {
  max-width: 78%;
}
.msg-row.user .msg-bubble {
  background: #409eff;
  color: #fff;
  padding: 10px 14px;
  border-radius: 10px;
}
.msg-text {
  white-space: pre-wrap;
  word-break: break-word;
}
.msg-md {
  background: #f7f8fa;
  padding: 12px 16px;
  border-radius: 10px;
}
.thinking {
  color: #909399;
  display: inline-flex;
  align-items: center;
}
.tool-chips {
  margin-bottom: 8px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.tool-chip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: #fff;
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  padding: 4px 10px;
  font-size: 12px;
  width: fit-content;
}
.tool-name {
  color: #409eff;
  font-family: monospace;
}
.chat-input {
  border-top: 1px solid #ebeef5;
  padding: 14px 16px;
  display: flex;
  gap: 10px;
  align-items: flex-end;
}
.send-btn {
  height: 40px;
}
</style>
