package cn.iocoder.yudao.module.ai.framework.ai.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import io.modelcontextprotocol.client.transport.HttpClientStreamableHttpTransport;
import io.modelcontextprotocol.client.transport.customizer.McpSyncHttpClientRequestCustomizer;
import io.modelcontextprotocol.json.jackson.JacksonMcpJsonMapper;
import org.springframework.ai.mcp.client.common.autoconfigure.NamedClientMcpTransport;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;
import org.springframework.util.StringUtils;

import java.net.http.HttpClient;
import java.util.List;

/**
 * 工商「企业信息洞察」外部 MCP 服务（Streamable HTTP）客户端接入配置。
 *
 * <p>背景与关键点（Spring AI 1.1.8 / mcp-core 0.18.3）：
 * <ol>
 *   <li>Spring AI 原生支持 Streamable HTTP 传输，配置前缀
 *       {@code spring.ai.mcp.client.streamable-http.connections.<name>.url}，
 *       由 {@code StreamableHttpHttpClientTransportAutoConfiguration} 自动装配。
 *       但其 {@code ConnectionParameters} 仅有 {@code url}/{@code endpoint} 两个字段，
 *       <b>无法在 yaml 里配置自定义请求头</b>（如 Authorization）。</li>
 *   <li>因此本类自定义 {@link NamedClientMcpTransport} 列表并标记 {@link Primary}，
 *       覆盖官方自动装配产生的（空）传输列表（{@code McpClientAutoConfiguration#mcpSyncClients}
 *       通过 {@code ObjectProvider.getIfAvailable()} 取用，@Primary 即胜出），
 *       从而：
 *       <ul>
 *         <li>用 {@link McpSyncHttpClientRequestCustomizer} 注入
 *             {@code Authorization: Bearer <token>}（token 从环境变量读，禁止硬编码）；</li>
 *         <li>强制传输层用 <b>HTTP/1.1</b>——JDK {@code java.net.http.HttpClient} 默认 HTTP/2，
 *             对明文 http:// 会发起 h2c(Upgrade: h2c) 升级，目标 uvicorn 服务不支持会返回 400。</li>
 *       </ul>
 *   </li>
 * </ol>
 *
 * <p>凭据：{@code qixin.mcp.token} 用占位符 {@code ${QIXIN_MCP_TOKEN:}} 从环境变量注入。
 *
 * <p>注意：yaml 中<b>不要</b>再配置 {@code spring.ai.mcp.client.streamable-http.connections}，
 * 避免官方自动装配再走一遍默认 HTTP/2 传输。
 */
@Configuration
@ConditionalOnProperty(prefix = "spring.ai.mcp.client", name = "enabled", havingValue = "true")
public class QixinMcpClientConfiguration {

    @Bean
    @Primary
    public List<NamedClientMcpTransport> qixinMcpTransports(
            @Value("${qixin.mcp.url:http://120.79.142.141:8800}") String baseUrl,
            @Value("${qixin.mcp.endpoint:/mcp/}") String endpoint,
            @Value("${qixin.mcp.token:}") String token) {
        McpSyncHttpClientRequestCustomizer authCustomizer = (builder, method, uri, body, context) -> {
            if (StringUtils.hasText(token)) {
                builder.header("Authorization", "Bearer " + token);
            }
        };
        HttpClientStreamableHttpTransport transport = HttpClientStreamableHttpTransport.builder(baseUrl)
                .endpoint(endpoint)
                // 强制 HTTP/1.1，规避 java.net.http 默认 HTTP/2 的 h2c 升级导致目标服务 400
                .customizeClient(clientBuilder -> clientBuilder.version(HttpClient.Version.HTTP_1_1))
                // 注入 Authorization: Bearer <token>
                .httpRequestCustomizer(authCustomizer)
                .jsonMapper(new JacksonMcpJsonMapper(new ObjectMapper()))
                .build();
        return List.of(new NamedClientMcpTransport("qixin", transport));
    }

}
