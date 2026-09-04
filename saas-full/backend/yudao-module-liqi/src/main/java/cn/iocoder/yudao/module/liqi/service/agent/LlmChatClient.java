package cn.iocoder.yudao.module.liqi.service.agent;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.io.BufferedReader;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 * 力企 - 大模型对话客户端（火山方舟，OpenAI 兼容 /chat/completions，SSE 流式 + function calling）
 *
 * 用 JDK 自带 HttpURLConnection 实现，零额外依赖。
 */
@Slf4j
@Component
public class LlmChatClient {

    @Value("${liqi.agent.ark.base-url:https://ark.cn-beijing.volces.com/api/coding/v3}")
    private String baseUrl;
    @Value("${liqi.agent.ark.api-key:}")
    private String apiKey;
    @Value("${liqi.agent.ark.model:ark-code-latest}")
    private String defaultModel;

    private final ObjectMapper objectMapper = new ObjectMapper();

    /** 流式内容回调 */
    public interface ContentHandler {
        /** 正文增量 */
        void onContent(String delta);
        /** 推理/思维链增量（无则不回调） */
        default void onReasoning(String delta) {}
    }

    /** 一次模型调用的聚合结果 */
    public static class StreamResult {
        public String content = "";
        public String finishReason;
        public final List<ToolCall> toolCalls = new ArrayList<>();
        public boolean hasToolCalls() { return !toolCalls.isEmpty(); }
    }

    public static class ToolCall {
        public String id;
        public String name;
        public String arguments = "";
    }

    /**
     * 发起一次流式对话。
     *
     * @param model    模型标志，为空用默认
     * @param messages OpenAI 消息数组（system/user/assistant/tool）
     * @param tools    OpenAI tools 数组，为空表示不启用工具
     * @param handler  流式回调
     */
    public StreamResult chatStream(String model, List<Map<String, Object>> messages,
                                   List<Map<String, Object>> tools, ContentHandler handler) {
        ObjectNode body = objectMapper.createObjectNode();
        body.put("model", (model == null || model.isEmpty()) ? defaultModel : model);
        body.set("messages", objectMapper.valueToTree(messages));
        body.put("stream", true);
        body.put("temperature", 0.3);
        if (tools != null && !tools.isEmpty()) {
            body.set("tools", objectMapper.valueToTree(tools));
        }

        HttpURLConnection conn = null;
        StreamResult result = new StreamResult();
        // tool_calls 分片按 index 聚合
        Map<Integer, ToolCall> tcByIndex = new LinkedHashMap<>();
        StringBuilder contentBuf = new StringBuilder();
        try {
            conn = open(body.toString());
            int code = conn.getResponseCode();
            InputStream is = code >= 400 ? conn.getErrorStream() : conn.getInputStream();
            if (code >= 400) {
                throw new RuntimeException("火山方舟 HTTP " + code + ": " + readAll(is));
            }
            try (BufferedReader br = new BufferedReader(new InputStreamReader(is, StandardCharsets.UTF_8))) {
                String line;
                while ((line = br.readLine()) != null) {
                    if (!line.startsWith("data:")) {
                        continue;
                    }
                    String data = line.substring(5).trim();
                    if (data.isEmpty() || "[DONE]".equals(data)) {
                        continue;
                    }
                    JsonNode chunk;
                    try {
                        chunk = objectMapper.readTree(data);
                    } catch (Exception e) {
                        continue;
                    }
                    JsonNode choice = chunk.path("choices").path(0);
                    if (choice.isMissingNode()) {
                        continue;
                    }
                    String fr = choice.path("finish_reason").asText(null);
                    if (fr != null) {
                        result.finishReason = fr;
                    }
                    JsonNode delta = choice.path("delta");
                    // 正文
                    String c = delta.path("content").asText(null);
                    if (c != null && !c.isEmpty()) {
                        contentBuf.append(c);
                        if (handler != null) {
                            handler.onContent(c);
                        }
                    }
                    // 思维链（火山部分模型返回 reasoning_content）
                    String rc = delta.path("reasoning_content").asText(null);
                    if (rc != null && !rc.isEmpty() && handler != null) {
                        handler.onReasoning(rc);
                    }
                    // 工具调用分片
                    JsonNode tcs = delta.path("tool_calls");
                    if (tcs.isArray()) {
                        for (JsonNode tc : tcs) {
                            int idx = tc.path("index").asInt(0);
                            ToolCall call = tcByIndex.computeIfAbsent(idx, k -> new ToolCall());
                            if (!tc.path("id").isMissingNode() && !tc.path("id").asText().isEmpty()) {
                                call.id = tc.path("id").asText();
                            }
                            JsonNode fn = tc.path("function");
                            if (!fn.path("name").isMissingNode() && !fn.path("name").asText().isEmpty()) {
                                call.name = fn.path("name").asText();
                            }
                            String args = fn.path("arguments").asText("");
                            if (!args.isEmpty()) {
                                call.arguments += args;
                            }
                        }
                    }
                }
            }
            result.content = contentBuf.toString();
            result.toolCalls.addAll(tcByIndex.values());
            return result;
        } catch (RuntimeException e) {
            throw e;
        } catch (Exception e) {
            throw new RuntimeException("调用火山方舟失败: " + e.getMessage(), e);
        } finally {
            if (conn != null) {
                conn.disconnect();
            }
        }
    }

    private HttpURLConnection open(String jsonBody) throws Exception {
        HttpURLConnection conn = (HttpURLConnection) new URL(baseUrl + "/chat/completions").openConnection();
        conn.setRequestMethod("POST");
        conn.setConnectTimeout(15000);
        conn.setReadTimeout(120000);
        conn.setDoOutput(true);
        conn.setRequestProperty("Content-Type", "application/json");
        conn.setRequestProperty("Accept", "text/event-stream");
        conn.setRequestProperty("Authorization", "Bearer " + apiKey);
        try (OutputStream os = conn.getOutputStream()) {
            os.write(jsonBody.getBytes(StandardCharsets.UTF_8));
        }
        return conn;
    }

    private String readAll(InputStream is) throws Exception {
        if (is == null) {
            return "";
        }
        StringBuilder sb = new StringBuilder();
        try (BufferedReader br = new BufferedReader(new InputStreamReader(is, StandardCharsets.UTF_8))) {
            String line;
            while ((line = br.readLine()) != null) {
                sb.append(line).append("\n");
            }
        }
        return sb.toString();
    }

    // 便捷构建消息
    public static Map<String, Object> msg(String role, Object content) {
        Map<String, Object> m = new HashMap<>();
        m.put("role", role);
        m.put("content", content);
        return m;
    }

    @SuppressWarnings("unchecked")
    public static ArrayNode notUsed(ObjectMapper om) {
        return om.createArrayNode();
    }
}
