package cn.iocoder.yudao.module.liqi.service.agent;

import cn.iocoder.yudao.framework.common.util.object.BeanUtils;
import cn.iocoder.yudao.framework.security.core.util.SecurityFrameworkUtils;
import cn.iocoder.yudao.module.liqi.dal.dataobject.agent.LiqiAgentConversationDO;
import cn.iocoder.yudao.module.liqi.dal.dataobject.agent.LiqiAgentDO;
import cn.iocoder.yudao.module.liqi.dal.dataobject.agent.LiqiAgentMessageDO;
import cn.iocoder.yudao.module.liqi.dal.mysql.agent.LiqiAgentConversationMapper;
import cn.iocoder.yudao.module.liqi.dal.mysql.agent.LiqiAgentMapper;
import cn.iocoder.yudao.module.liqi.dal.mysql.agent.LiqiAgentMessageMapper;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import javax.annotation.Resource;
import java.io.IOException;
import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * 力企 - 智能体广场 Service 实现
 *
 * 编排：大模型（火山方舟，OpenAI 兼容）理解意图 → 返回 tool_calls → 调工商 MCP 取数
 * → 工具结果回填 → 模型生成自然语言回答，全程 SSE 流式推给前端，并落库留痕（含工具调用证据）。
 */
@Slf4j
@Service
public class LiqiAgentServiceImpl implements LiqiAgentService {

    /** 单轮对话最多模型-工具往返次数，防止死循环 */
    private static final int MAX_TOOL_ROUNDS = 3;
    /** 带入上下文的历史消息条数（仅 user/assistant 文本） */
    private static final int HISTORY_LIMIT = 20;

    @Resource
    private LiqiAgentMapper agentMapper;
    @Resource
    private LiqiAgentConversationMapper conversationMapper;
    @Resource
    private LiqiAgentMessageMapper messageMapper;
    @Resource
    private LlmChatClient llmChatClient;
    @Resource
    private McpToolClient mcpToolClient;

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Override
    public List<LiqiAgentDO> getEnabledAgentList() {
        return agentMapper.selectListByStatus(0);
    }

    @Override
    public List<LiqiAgentConversationDO> getConversationList(Long agentId) {
        Long userId = SecurityFrameworkUtils.getLoginUserId();
        return conversationMapper.selectListByUserAndAgent(userId, agentId);
    }

    @Override
    public List<LiqiAgentMessageDO> getMessageList(Long conversationId) {
        return messageMapper.selectListByConversation(conversationId);
    }

    @Override
    public Long createConversation(Long agentId, String title) {
        Long userId = SecurityFrameworkUtils.getLoginUserId();
        LiqiAgentConversationDO conv = LiqiAgentConversationDO.builder()
                .agentId(agentId).userId(userId)
                .title(title == null || title.isEmpty() ? "新会话" : title)
                .build();
        conversationMapper.insert(conv);
        return conv.getId();
    }

    @Override
    public SseEmitter streamChat(Long agentId, Long conversationId, String content) {
        // 0 超时交由线程内 complete；给一个较大上限
        SseEmitter emitter = new SseEmitter(5 * 60 * 1000L);
        emitter.onCompletion(() -> log.debug("[智能体] SSE 完成 conv={}", conversationId));
        emitter.onError(t -> log.warn("[智能体] SSE 异常 conv={}: {}", conversationId, t.toString()));

        Long userId = SecurityFrameworkUtils.getLoginUserId();
        LiqiAgentDO agent = agentMapper.selectById(agentId);

        Thread worker = new Thread(() -> {
            try {
                if (agent == null) {
                    sendEvent(emitter, "error", mapOf("msg", "智能体不存在或已下线"));
                    emitter.complete();
                    return;
                }
                // 1. 会话（不存在则新建）
                Long convId = conversationId;
                if (convId == null) {
                    LiqiAgentConversationDO conv = LiqiAgentConversationDO.builder()
                            .agentId(agentId).userId(userId)
                            .title(buildTitle(content)).build();
                    conversationMapper.insert(conv);
                    convId = conv.getId();
                }
                sendEvent(emitter, "conversation", mapOf("conversationId", convId, "title", buildTitle(content)));

                // 2. 落库用户消息
                LiqiAgentMessageDO userMsg = LiqiAgentMessageDO.builder()
                        .conversationId(convId).role("user").content(content).build();
                messageMapper.insert(userMsg);

                // 3. 组装上下文
                List<Map<String, Object>> messages = buildMessages(agent, convId);
                List<Map<String, Object>> tools = loadTools(agent);

                // 4. 模型 <-> 工具 循环
                String finalAnswer = "";
                List<Map<String, Object>> toolTrace = new ArrayList<>();
                for (int round = 0; round <= MAX_TOOL_ROUNDS; round++) {
                    final StringBuilder roundContent = new StringBuilder();
                    LlmChatClient.StreamResult r = llmChatClient.chatStream(agent.getModel(), messages, tools,
                            new LlmChatClient.ContentHandler() {
                                @Override
                                public void onContent(String delta) {
                                    roundContent.append(delta);
                                    sendEvent(emitter, "content", mapOf("delta", delta));
                                }
                            });
                    finalAnswer = r.content;

                    if (!r.hasToolCalls()) {
                        break; // 无工具调用，本轮即最终回答
                    }
                    // 记录 assistant 的 tool_calls，并回填工具结果
                    List<Map<String, Object>> assistantToolCalls = new ArrayList<>();
                    for (LlmChatClient.ToolCall tc : r.toolCalls) {
                        Map<String, Object> call = new HashMap<>();
                        call.put("id", tc.id);
                        call.put("type", "function");
                        Map<String, Object> fn = new HashMap<>();
                        fn.put("name", tc.name);
                        fn.put("arguments", tc.arguments);
                        call.put("function", fn);
                        assistantToolCalls.add(call);

                        // 通知前端：正在调用工具
                        sendEvent(emitter, "tool", mapOf("name", tc.name, "status", "calling", "summary", ""));

                        // 调 MCP
                        String toolResult;
                        try {
                            Map<String, Object> args = parseArgs(tc.arguments);
                            toolResult = mcpToolClient.callTool(agent.getMcpUrl(), tc.name, args);
                            sendEvent(emitter, "tool", mapOf("name", tc.name, "status", "done",
                                    "summary", abbreviate(toolResult, 120)));
                        } catch (Exception ex) {
                            toolResult = "工具调用失败: " + ex.getMessage();
                            log.warn("[智能体] MCP 工具 {} 调用失败: {}", tc.name, ex.getMessage());
                            sendEvent(emitter, "tool", mapOf("name", tc.name, "status", "error",
                                    "summary", ex.getMessage()));
                        }

                        // 证据留痕
                        Map<String, Object> trace = new HashMap<>();
                        trace.put("name", tc.name);
                        trace.put("arguments", tc.arguments);
                        trace.put("result", abbreviate(toolResult, 2000));
                        toolTrace.add(trace);

                        // 回填 tool 消息
                        Map<String, Object> toolMsg = new HashMap<>();
                        toolMsg.put("role", "tool");
                        toolMsg.put("tool_call_id", tc.id);
                        toolMsg.put("name", tc.name);
                        toolMsg.put("content", toolResult);
                        messages.add(toolMsg);
                    }
                    // 追加带 tool_calls 的 assistant 消息
                    Map<String, Object> assistantMsg = new HashMap<>();
                    assistantMsg.put("role", "assistant");
                    assistantMsg.put("content", r.content == null || r.content.isEmpty() ? null : r.content);
                    assistantMsg.put("tool_calls", assistantToolCalls);
                    messages.add(assistantMsg);
                    // 若已达上限仍有工具调用，提示模型直接总结
                    if (round == MAX_TOOL_ROUNDS) {
                        messages.add(LlmChatClient.msg("user", "工具结果已给出，请基于以上信息直接用中文总结回答。"));
                    }
                }

                // 5. 落库助手消息（含工具调用证据）
                LiqiAgentMessageDO aiMsg = LiqiAgentMessageDO.builder()
                        .conversationId(convId).role("assistant")
                        .content(finalAnswer == null ? "" : finalAnswer)
                        .toolCalls(toolTrace.isEmpty() ? null : objectMapper.writeValueAsString(toolTrace))
                        .build();
                messageMapper.insert(aiMsg);

                sendEvent(emitter, "done", mapOf("conversationId", convId));
                emitter.complete();
            } catch (Exception e) {
                log.error("[智能体] 流式对话失败 agent={} conv={}", agentId, conversationId, e);
                try {
                    sendEvent(emitter, "error", mapOf("msg", "服务异常: " + e.getMessage()));
                } catch (Exception ignore) {
                }
                emitter.complete();
            }
        }, "liqi-agent-chat");
        worker.setDaemon(true);
        worker.start();
        return emitter;
    }

    private List<Map<String, Object>> buildMessages(LiqiAgentDO agent, Long convId) {
        List<Map<String, Object>> messages = new ArrayList<>();
        // 系统人设
        String sys = agent.getSystemPrompt();
        if (sys == null || sys.isEmpty()) {
            sys = "你是「" + agent.getName() + "」，请用中文简洁、准确地回答用户问题。";
        }
        messages.add(LlmChatClient.msg("system", sys));
        // 历史（仅 user / assistant 文本，跳过 tool 与空内容）
        List<LiqiAgentMessageDO> history = messageMapper.selectListByConversation(convId);
        int from = Math.max(0, history.size() - HISTORY_LIMIT);
        for (int i = from; i < history.size(); i++) {
            LiqiAgentMessageDO m = history.get(i);
            if ("user".equals(m.getRole()) && m.getContent() != null && !m.getContent().isEmpty()) {
                messages.add(LlmChatClient.msg("user", m.getContent()));
            } else if ("assistant".equals(m.getRole()) && m.getContent() != null && !m.getContent().isEmpty()) {
                messages.add(LlmChatClient.msg("assistant", m.getContent()));
            }
        }
        return messages;
    }

    private List<Map<String, Object>> loadTools(LiqiAgentDO agent) {
        Boolean enabled = agent.getMcpEnabled();
        String url = agent.getMcpUrl();
        if (enabled == null || !enabled || url == null || url.isEmpty()) {
            return Collections.emptyList();
        }
        try {
            return mcpToolClient.listToolsAsOpenAi(url);
        } catch (Exception e) {
            log.warn("[智能体] 加载 MCP 工具失败 url={}: {}", url, e.getMessage());
            return Collections.emptyList();
        }
    }

    @SuppressWarnings("unchecked")
    private Map<String, Object> parseArgs(String json) {
        if (json == null || json.trim().isEmpty()) {
            return new HashMap<>();
        }
        try {
            return objectMapper.readValue(json, Map.class);
        } catch (Exception e) {
            return new HashMap<>();
        }
    }

    private String buildTitle(String content) {
        if (content == null) {
            return "新会话";
        }
        String t = content.trim().replaceAll("\\s+", " ");
        return t.length() > 20 ? t.substring(0, 20) : t;
    }

    private String abbreviate(String s, int max) {
        if (s == null) {
            return "";
        }
        return s.length() > max ? s.substring(0, max) + "…" : s;
    }

    private void sendEvent(SseEmitter emitter, String type, Map<String, Object> data) {
        try {
            Map<String, Object> payload = new HashMap<>(data);
            payload.put("type", type);
            emitter.send(SseEmitter.event()
                    .name(type)
                    .data(objectMapper.writeValueAsString(payload), MediaType.APPLICATION_JSON));
        } catch (IOException e) {
            // 客户端断开等，抛出由上层结束
            throw new RuntimeException("SSE 发送失败: " + e.getMessage(), e);
        }
    }

    private static Map<String, Object> mapOf(Object... kv) {
        Map<String, Object> m = new HashMap<>();
        for (int i = 0; i + 1 < kv.length; i += 2) {
            m.put(String.valueOf(kv[i]), kv[i + 1]);
        }
        return m;
    }

}
