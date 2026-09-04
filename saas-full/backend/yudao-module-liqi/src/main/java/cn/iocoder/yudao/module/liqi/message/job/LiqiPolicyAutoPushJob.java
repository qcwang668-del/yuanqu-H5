package cn.iocoder.yudao.module.liqi.message.job;

import cn.iocoder.yudao.module.liqi.message.service.LiqiUserMessageService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.scheduling.annotation.Scheduled;

import javax.annotation.Resource;

/**
 * 力企 - 政策自动"找人"推送定时任务。
 *
 * <p>每天 09:00 扫描：按会员绑定企业画像 + 订阅偏好，把近 7 天新政策匹配后生成站内消息（已去重）。
 * 用 Spring {@code @Scheduled}（liqi 模块自带 {@link EnableScheduling}），无需额外 Quartz 依赖；
 * 多租户上下文由 Service 内 TenantUtils 逐租户处理。</p>
 */
@Slf4j
@Configuration
@EnableScheduling
public class LiqiPolicyAutoPushJob {

    @Resource
    private LiqiUserMessageService userMessageService;

    /** 每天 09:00 执行一次 */
    @Scheduled(cron = "0 0 9 * * ?")
    public void autoMatchPush() {
        try {
            int count = userMessageService.autoMatchPush();
            log.info("[政策自动推送] 本次生成站内消息 {} 条", count);
        } catch (Exception e) {
            log.error("[政策自动推送] 执行失败", e);
        }
    }

}
