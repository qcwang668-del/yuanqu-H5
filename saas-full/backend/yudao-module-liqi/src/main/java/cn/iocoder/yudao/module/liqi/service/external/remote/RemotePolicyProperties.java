package cn.iocoder.yudao.module.liqi.service.external.remote;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

/**
 * 力企云 - 真实政策数据源（DaaS 政策库）配置。
 *
 * <p>对应 application.yaml 中 {@code liqi.policy.*} 配置段：
 * <pre>
 * liqi:
 *   policy:
 *     remote-enabled: true        # 打开后用 DaaS 真实政策替换 MockPolicyProvider
 *     province-code: 440000       # 广东省
 *     city-code: 440300           # 深圳市（H5 端默认城市）
 *     area-code:                  # 区县，留空表示全市
 *     full-load-enabled: true     # 后台补全全量政策（深圳约 1884 条）
 *     request-interval-ms: 6500   # 远程调用最小间隔，规避 10 次/分钟限流
 *     max-pages: 0                # 全量加载页数上限，0=不限制
 *     list-cache-minutes: 30      # 列表缓存时长
 *     detail-cache-hours: 24      # 详情缓存时长
 * </pre>
 */
@Component
@ConfigurationProperties(prefix = "liqi.policy")
@Data
public class RemotePolicyProperties {

    /** 是否启用真实政策数据源；false 时回落 MockPolicyProvider */
    private boolean remoteEnabled = false;

    /** 所在省编码，广东省 */
    private String provinceCode = "440000";

    /** 所在市编码，深圳市（H5 端固定城市入参） */
    private String cityCode = "440300";

    /** 所在区编码，留空表示全市 */
    private String areaCode;

    /**
     * 是否在后台补全全量政策。
     *
     * <p>开启后由单线程后台任务按 {@link #requestIntervalMs} 节流逐页拉取，
     * 直到覆盖平台返回的 total（深圳市实测约 1884 条 / 38 页）。
     * 关闭则仅按用户翻页请求做按需穿透，关键词筛选的命中范围会相应变小。</p>
     */
    private boolean fullLoadEnabled = true;

    /**
     * 远程调用最小间隔（毫秒）。
     *
     * <p>DaaS 实测限流约 10 次/分钟，故默认 6500ms（约 9.2 次/分钟）留出余量。
     * 调小会触发 {@code 400 请求参数不正确}（限流与参数错误同码）。</p>
     */
    private long requestIntervalMs = 6500L;

    /** 全量加载的页数上限（每页 50 条）；0 表示不限制，直至拉满 total */
    private int maxPages = 0;

    /** 政策列表缓存时长（分钟），到期后重新校准 total 并重建缓存 */
    private int listCacheMinutes = 30;

    /** 政策详情缓存时长（小时），正文相对稳定可长缓存 */
    private int detailCacheHours = 24;

    /** 单次远程调用失败后的最短重试间隔（秒），用于限流降级 */
    private int cooldownSeconds = 90;

}