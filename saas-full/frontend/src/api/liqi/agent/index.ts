import request from '@/config/axios'
import { fetchEventSource } from '@microsoft/fetch-event-source'
import { getAccessToken } from '@/utils/auth'
import { config } from '@/config/axios/config'

// 力企 - 智能体广场
export interface AgentVO {
  id: number
  name: string
  avatar?: string
  description?: string
  systemPrompt?: string
  provider?: string
  model?: string
  mcpEnabled?: boolean
  mcpUrl?: string
  sort?: number
  status?: number
}

export interface AgentConversationVO {
  id: number
  agentId: number
  userId?: number
  title?: string
  createTime?: Date
}

export interface AgentMessageVO {
  id: number
  conversationId: number
  role: string // user / assistant / tool
  content: string
  toolCalls?: string
  createTime?: Date
}

export const AgentApi = {
  // 广场：启用中的智能体列表
  getAgentList: async (): Promise<AgentVO[]> => {
    return await request.get({ url: '/liqi/agent/list' })
  },
  // 我的会话列表
  getConversationList: async (agentId?: number): Promise<AgentConversationVO[]> => {
    return await request.get({ url: '/liqi/agent/conversation/list', params: { agentId } })
  },
  // 会话消息列表
  getMessageList: async (conversationId: number): Promise<AgentMessageVO[]> => {
    return await request.get({ url: '/liqi/agent/message/list', params: { conversationId } })
  },
  // 新建会话
  createConversation: async (agentId: number, title?: string): Promise<number> => {
    return await request.post({ url: '/liqi/agent/conversation/create', params: { agentId, title } })
  },
  // 发送消息（SSE 流式）
  // 不用 axios：它不支持 SSE
  sendStream: (
    agentId: number,
    conversationId: number | null,
    content: string,
    ctrl: AbortController,
    onMessage: (ev: any) => void,
    onError: (err: any) => void,
    onClose?: () => void
  ) => {
    const token = getAccessToken()
    return fetchEventSource(`${config.base_url}/liqi/agent/chat/send-stream`, {
      method: 'post',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      openWhenHidden: true,
      body: JSON.stringify({ agentId, conversationId, content }),
      onmessage: onMessage,
      onerror: onError,
      onclose: onClose,
      signal: ctrl.signal
    })
  }
}
