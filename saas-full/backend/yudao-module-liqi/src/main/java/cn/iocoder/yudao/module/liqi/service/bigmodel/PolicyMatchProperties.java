package cn.iocoder.yudao.module.liqi.service.bigmodel;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

/**
 * 力企云 - AISpider 大模型服务配置（企业政策智能匹配等）。
 *
 * <p>对应 application.yaml 中 {@code bigmodel.*} 配置段：
 * <pre>
 * bigmodel:
 *   base-url: http://8.135.67.165:8000        # AISpider 大模型服务（drf-yasg，接口统一前缀 /api）
 *   timeout-ms: 120000                        # 企业政策智能匹配为同步大模型任务，实测约 40~60s
 * </pre>
 *
 * <p>说明：该服务无需鉴权（openapi security 仅为 swagger 文档的 Basic 登录，业务接口不校验）。
 */
@Component
@ConfigurationProperties(prefix = "bigmodel")
@Data
public class PolicyMatchProperties {

    /** AISpider 大模型服务基础地址，不含末尾斜杠；接口统一带 /api 前缀 */
    private String baseUrl = "http://8.135.67.165:8000";

    /** 请求超时（毫秒）。企业政策智能匹配为同步大模型任务，实测约 40~60s，需放宽 */
    private int timeoutMs = 120000;

}
