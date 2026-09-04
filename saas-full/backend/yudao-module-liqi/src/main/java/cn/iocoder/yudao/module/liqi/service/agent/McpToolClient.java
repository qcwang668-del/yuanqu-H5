package cn.iocoder.yudao.module.liqi.service.agent;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
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
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicLong;

/**
 * 力企 - MCP 客户端（Streamable HTTP 传输，JSON-RPC 2.0）
 *
 * 用 JDK 自带 HttpURLConnection 实现（明文 HTTP/1.1，天然规避 HTTP/2 h2c 升级被服务端拒绝的坑）。
 * 工商「企业信息洞察」MCP：POST {mcpUrl} 即返回 JSON；兼容返回 SSE（data: 行）的情况。
 */
@Slf4j
@Component
public class McpToolClient {

    @Value("${liqi.agent.mcp.token:}")
    private String token;

    private final ObjectMapper objectMapper = new ObjectMapper();
    private final AtomicLong idSeq = new AtomicLong(1);
    /** mcpUrl -> Mcp-Session-Id（有状态会话时缓存；无状态为空） */
    private final Map<String, String> sessionIds = new ConcurrentHashMap<>();
    /** 已 initialize 过的 mcpUrl */
    private final Map<String, Boolean> initialized = new ConcurrentHashMap<>();

    /**
     * 列出 MCP 工具，并直接转换成 OpenAI function-calling 的 tools 结构。
     * 结构：[{"type":"function","function":{"name":..,"description":..,"parameters":{inputSchema}}}]
     */
    public List<Map<String, Object>> listToolsAsOpenAi(String mcpUrl) {
        ensureInitialized(mcpUrl);
        JsonNode result = rpc(mcpUrl, "tools/list", objectMapper.createObjectNode());
        List<Map<String, Object>> tools = new ArrayList<>();
        JsonNode arr = result.path("tools");
        for (JsonNode t : arr) {
            String name = t.path("name").asText();
            String desc = t.path("description").asText(name);
            JsonNode inputSchema = t.path("inputSchema");
            ObjectNode function = objectMapper.createObjectNode();
            function.put("name", name);
            function.put("description", desc);
            function.set("parameters", inputSchema.isMissingNode() ? defaultSchema() : inputSchema);
            ObjectNode tool = objectMapper.createObjectNode();
            tool.put("type", "function");
            tool.set("function", function);
            tools.add(objectMapper.convertValue(tool, Map.class));
        }
        return tools;
    }

    /**
     * 调用 MCP 工具，返回拼接后的文本结果（取 result.content[].text）。
     */
    @SuppressWarnings("unchecked")
    public String callTool(String mcpUrl, String name, Map<String, Object> arguments) {
        ensureInitialized(mcpUrl);
        ObjectNode params = objectMapper.createObjectNode();
        params.put("name", name);
        params.set("arguments", objectMapper.valueToTree(arguments == null ? new java.util.HashMap<String, Object>() : arguments));
        JsonNode result = rpc(mcpUrl, "tools/call", params);
        StringBuilder sb = new StringBuilder();
        JsonNode content = result.path("content");
        if (content.isArray()) {
            for (JsonNode c : content) {
                if ("text".equals(c.path("type").asText())) {
                    sb.append(c.path("text").asText()).append("\n");
                }
            }
        }
        if (sb.length() == 0) {
            sb.append(result.toString());
        }
        boolean isError = result.path("isError").asBoolean(false);
        if (isError) {
            log.warn("[MCP] 工具 {} 返回业务错误: {}", name, sb);
        }
        return sb.toString();
    }

    private void ensureInitialized(String mcpUrl) {
        if (Boolean.TRUE.equals(initialized.get(mcpUrl))) {
            return;
        }
        synchronized (mcpUrl.intern()) {
            if (Boolean.TRUE.equals(initialized.get(mcpUrl))) {
                return;
            }
            ObjectNode params = objectMapper.createObjectNode();
            params.put("protocolVersion", "2025-03-26");
            params.set("capabilities", objectMapper.createObjectNode());
            ObjectNode clientInfo = objectMapper.createObjectNode();
            clientInfo.put("name", "liqi-agent");
            clientInfo.put("version", "1.0");
            params.set("clientInfo", clientInfo);
            rpc(mcpUrl, "initialize", params);
            // 发 initialized 通知（无 id，服务端一般不回或回 202）
            try {
                rpcNotification(mcpUrl, "notifications/initialized");
            } catch (Exception ignore) {
                // 无状态服务可能不要求该通知，忽略
            }
            initialized.put(mcpUrl, Boolean.TRUE);
        }
    }

    private JsonNode rpc(String mcpUrl, String method, JsonNode params) {
        ObjectNode body = objectMapper.createObjectNode();
        body.put("jsonrpc", "2.0");
        body.put("id", idSeq.getAndIncrement());
        body.put("method", method);
        body.set("params", params);
        return postJsonRpc(mcpUrl, body.toString());
    }

    private void rpcNotification(String mcpUrl, String method) {
        ObjectNode body = objectMapper.createObjectNode();
        body.put("jsonrpc", "2.0");
        body.put("method", method);
        body.set("params", objectMapper.createObjectNode());
        postJsonRpc(mcpUrl, body.toString());
    }

    private JsonNode postJsonRpc(String mcpUrl, String jsonBody) {
        HttpURLConnection conn = null;
        try {
            conn = (HttpURLConnection) new URL(mcpUrl).openConnection();
            conn.setRequestMethod("POST");
            conn.setConnectTimeout(10000);
            conn.setReadTimeout(60000);
            conn.setDoOutput(true);
            conn.setRequestProperty("Content-Type", "application/json");
            conn.setRequestProperty("Accept", "application/json, text/event-stream");
            if (token != null && !token.isEmpty()) {
                conn.setRequestProperty("Authorization", "Bearer " + token);
            }
            String sid = sessionIds.get(mcpUrl);
            if (sid != null) {
                conn.setRequestProperty("Mcp-Session-Id", sid);
            }
            try (OutputStream os = conn.getOutputStream()) {
                os.write(jsonBody.getBytes(StandardCharsets.UTF_8));
            }
            int code = conn.getResponseCode();
            String newSid = conn.getHeaderField("Mcp-Session-Id");
            if (newSid != null && !newSid.isEmpty()) {
                sessionIds.put(mcpUrl, newSid);
            }
            InputStream is = code >= 400 ? conn.getErrorStream() : conn.getInputStream();
            String raw = readAll(is);
            if (code >= 400) {
                throw new RuntimeException("MCP HTTP " + code + ": " + raw);
            }
            JsonNode resp = extractJson(raw);
            JsonNode err = resp.path("error");
            if (!err.isMissingNode() && !err.isNull()) {
                throw new RuntimeException("MCP 错误: " + err.toString());
            }
            return resp.path("result");
        } catch (RuntimeException e) {
            throw e;
        } catch (Exception e) {
            throw new RuntimeException("MCP 调用失败(" + methodOf(jsonBody) + "): " + e.getMessage(), e);
        } finally {
            if (conn != null) {
                conn.disconnect();
            }
        }
    }

    private String methodOf(String jsonBody) {
        try {
            return objectMapper.readTree(jsonBody).path("method").asText();
        } catch (Exception e) {
            return "?";
        }
    }

    /** 响应可能是纯 JSON，也可能是 SSE（多行 data: {...}）；取最后一个有效 JSON-RPC 响应 */
    private JsonNode extractJson(String raw) throws Exception {
        String trimmed = raw.trim();
        if (trimmed.startsWith("{")) {
            return objectMapper.readTree(trimmed);
        }
        // SSE
        JsonNode last = null;
        for (String line : trimmed.split("\n")) {
            line = line.trim();
            if (line.startsWith("data:")) {
                String data = line.substring(5).trim();
                if (data.isEmpty() || "[DONE]".equals(data)) {
                    continue;
                }
                last = objectMapper.readTree(data);
            }
        }
        if (last == null) {
            throw new RuntimeException("无法解析 MCP 响应: " + trimmed.substring(0, Math.min(200, trimmed.length())));
        }
        return last;
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

    private ObjectNode defaultSchema() {
        ObjectNode schema = objectMapper.createObjectNode();
        schema.put("type", "object");
        schema.set("properties", objectMapper.createObjectNode());
        return schema;
    }

    // 供编译器保留 Iterator import（避免极简 JDK 下告警），无实际逻辑
    @SuppressWarnings("unused")
    private void unused(Iterator<?> it) {
    }

}
