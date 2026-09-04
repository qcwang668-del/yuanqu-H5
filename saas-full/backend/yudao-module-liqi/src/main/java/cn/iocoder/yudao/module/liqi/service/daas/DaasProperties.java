package cn.iocoder.yudao.module.liqi.service.daas;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

/**
 * 力企云 DaaS 企业数据平台配置。
 *
 * 对应 application.yaml 中 {@code daas.*} 配置段：
 * <pre>
 * daas:
 *   base-url: https://daas.liqicloud.com
 *   app-key: ${DaaS_APP_KEY:LQC_xxx}        # 平台分配的 appKey
 *   app-secret: ${DaaS_APP_SECRET:xxx}      # 平台分配的 appSecret（用于 MD5 签名）
 *   timeout-get-ms: 30000
 *   timeout-post-ms: 60000
 * </pre>
 */
@Component
@ConfigurationProperties(prefix = "daas")
@Data
public class DaasProperties {

    /** DaaS 平台基础地址，不含末尾斜杠 */
    private String baseUrl = "https://daas.liqicloud.com";

    /** 平台分配的 appKey */
    private String appKey;

    /** 平台分配的 appSecret，仅参与服务端 MD5 签名，不外发 */
    private String appSecret;

    /** GET 请求超时（毫秒），企业基本信息接口响应较快 */
    private int timeoutGetMs = 30000;

    /** POST 请求超时（毫秒），企业模糊匹配接口较慢（实测约 27s），需放宽 */
    private int timeoutPostMs = 60000;

}
